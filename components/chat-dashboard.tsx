"use client"

import type React from "react"
import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Users, Send, Search, MoreVertical, Phone, Video, User } from "lucide-react"
import ProfileView from "./profile-view"
import { fetchChats, fetchMessages, sendMessage } from "@/services/chats"
import { Chat } from "@/interfaces/ChatInterface"
import { Message, SendMessageResponse } from "@/interfaces/MessageInterface"
import { useStore } from "@/hooks/store"
import { useEcho } from "@/hooks/useEcho"
import { set } from "date-fns"

interface ChatDashboardProps {
  onLogout: () => void
}

export default function ChatDashboard({ onLogout }: ChatDashboardProps) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [currentView, setCurrentView] = useState<"chat" | "profile">("chat")
  const [chats, setChats] = useState<Chat[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const { user } = useStore()
  const userId = user?.id
  const echo = useEcho()

  const truncateText = useCallback((text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }, [])

  // Función para manejar nuevos mensajes
  const handleNewMessage = useCallback((e: any) => {
    console.log("💬 Nueva conversacion recibida:", e.message)
    let conversationId = parseInt(e.message.conversation_id)

    if (selectedChat && conversationId === selectedChat.id) {
      setMessages(prev => {
        const messageExists = prev.some(msg => msg.id === e.message.id)
        if (messageExists) {
          console.log("⚠️ Mensaje duplicado, ignorando:", e.message.id)
          return prev
        }
        console.log("✅ Agregando nuevo mensaje:", e.message.id)
        return [...prev, e.message]
      })
    }

    // Actualizar el último mensaje en la lista de chats
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === conversationId
          ? {
            ...chat, unread_count: 0, latest_message:{
              ...e.message,
              content: truncateText(e.message.content, 30) // Truncar a 30 caracteres
            }
          }
          : chat
      )
    )
  }, [selectedChat]) // ✅ selectedChat como dependencia

  // Función para manejar notificaciones privadas
  const handlePrivateNotification = useCallback((e: any) => {
    console.log("🔔 Notificación privada recibida:", e)
    let conversationId = parseInt(e.conversation_id)
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === conversationId
          ? { 
            ...chat, unread_count: e.unread_count, latest_message: {
              ...e.message,
              content: truncateText(e.message.content, 30) // Truncar a 30 caracteres
            }
          }
          : chat
      )
    )

    if (selectedChat && conversationId === selectedChat.id) {
      //actualizar a leido en el area de mensajes
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === conversationId
            ? { ...chat, unread_count: 0 }
            : chat
        )
      )
      setMessages(prev => {
        const messageExists = prev.some(msg => msg.id === e.message.id)
        if (messageExists) {
          console.log("⚠️ Mensaje duplicado en notificación, ignorando:", e.message.id)
          return prev
        }
        console.log("✅ Agregando mensaje desde notificación:", e.message.id)
        return [...prev, e.message]
      })
    }
  }, [selectedChat]) // ✅ selectedChat como dependencia

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const chatsData: Chat[] = await fetchChats()
        setChats(chatsData)

        if (chatsData.length > 0) {
          setSelectedChat(chatsData[0])
          const messagesData: Message[] = await fetchMessages(chatsData[0].id)
          setMessages(messagesData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  // Configurar WebSockets cuando echo esté listo
  useEffect(() => {
    if (!echo || !userId) {
      console.log("⏳ Esperando inicialización de Echo...")
      return
    }

    console.log("🔌 Configurando WebSockets para", chats.length, "chats...")

    try {
      // Configurar eventos de conexión globales
      const connection = echo.connector.pusher.connection

      const onConnected = () => {
        console.log("✅ Conectado a WebSockets")
        setIsConnected(true)
      }

      const onDisconnected = () => {
        console.log("❌ Desconectado de WebSockets")
        setIsConnected(false)
      }

      const onError = (error: any) => {
        console.error("❌ Error de conexión WebSockets:", error)
        setIsConnected(false)
      }

      connection.bind('connected', onConnected)
      connection.bind('disconnected', onDisconnected)
      connection.bind('error', onError)

      // Suscribirse a cada canal de conversación
      const channels: { name: string; type: string }[] = []

      chats.forEach((chat) => {
        //si el chat es un grupo no suscribirse
        if (chat.is_group) {
          console.log(`⏭️ Saltando suscripción a canal de grupo: conversation.${chat.id}`)
          return; // Saltar suscripción a canales de grupos
        }

        const channelName = `conversation.${chat.id}`

        try {
          const channel = echo.private(channelName)

          const handler = (event: any) => {
            console.log(`💌 Mensaje recibido en chat ${chat.id}:`, event)
            handleNewMessage(event)
          }

          channel.listen('.message.sent', handler)

          channel.subscribed(() => {
            console.log(`✅ Suscrito a conversación: ${channelName}`)
          })

          channels.push({ name: channelName, type: 'conversation' })
        } catch (error) {
          console.error(`❌ Error suscribiendo a ${channelName}:`, error)
        }
      })

      // Suscribirse al canal de usuario para notificaciones globales
      const userChannelName = `user.${userId}`

      try {
        const userChannel = echo.private(userChannelName)

        userChannel.listen('.message.new', handlePrivateNotification)

        userChannel.subscribed(() => {
          console.log(`✅ Suscrito a canal de usuario: ${userChannelName}`)
        })

        channels.push({ name: userChannelName, type: 'user' })
      } catch (error) {
        console.error(`❌ Error suscribiendo a ${userChannelName}:`, error)
      }

      // Cleanup
      return () => {
        console.log("🧹 Limpiando", channels.length, "canales...")

        channels.forEach(({ name, type }) => {
          try {
            echo.leave(name)
            console.log(`✅ Canal ${type} ${name} limpiado`)
          } catch (error) {
            console.error(`❌ Error limpiando canal ${name}:`, error)
          }
        })

        // Limpiar listeners de conexión
        connection.unbind('connected', onConnected)
        connection.unbind('disconnected', onDisconnected)
        connection.unbind('error', onError)
      }

    } catch (error) {
      console.error('❌ Error al configurar WebSockets:', error)
    }
  }, [echo, userId, chats, handleNewMessage, handlePrivateNotification])

  // Suscribirse al canal de conversación
  useEffect(() => {
    if (!echo || !selectedChat || !userId) {
      console.log('⏳ Esperando echo, selectedChat o userId')
      return
    }
    console.log(`📡 Suscribiéndose a conversación: ${selectedChat.id}`)

    console.log(`📡 Configurando listener para conversación: ${selectedChat.id}`)

    try {
      const channelName = `conversation.${selectedChat.id}`
      const conversationChannel = echo.private(channelName)

      console.log(`🎧 Escuchando evento 'message.sent' en canal: ${channelName}`)

      // ✅ Escuchar el evento CORRECTAMENTE
      conversationChannel.listen('.message.sent', (event: any) => {
        console.log('💌 EVENTO RECIBIDO EN FRONTEND:', event)
        console.log('📦 Datos del mensaje message.sent', event.message)

        handleNewMessage(event)
      })


      conversationChannel.error((error: any) => {
        console.error('❌ Error en canal de conversación:', error)
      })

      // ✅ Verificar estado de la suscripción
      conversationChannel.subscribed(() => {
        console.log('✅ Suscrito correctamente al canal:', channelName)
      })

      return () => {
        console.log(`🧹 Limpiando canal: ${channelName}`)
        conversationChannel.stopListening('.message.sent')
        echo.leave(channelName)
      }

    } catch (error) {
      console.error('❌ Error al configurar el canal:', error)
    }
  }, [echo, selectedChat, userId, handleNewMessage])

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // useEffect para ocultar chats cuando se presione esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedChat(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat) return

    try {
      const content: SendMessageResponse = {
        content: newMessage,
        type: "text",
        file_path: null,
      }
      await sendMessage(selectedChat.id, content)
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleChatSelect = async (chat: Chat) => {
    setSelectedChat(chat)
    //actualizar el unread a 0 en la lista de chats
    setChats(prevChats =>
      prevChats.map(c =>
        c.id === chat.id
          ? { ...c, unread_count: 0 }
          : c
      )
    )
    
    // Cargar mensajes del chat seleccionado
    try {
      const messagesData = await fetchMessages(chat.id)
      setMessages(messagesData)
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const showProfile = () => setCurrentView("profile")
  const backToChat = () => setCurrentView("chat")

  if (currentView === "profile") {
    return <ProfileView onBack={backToChat} onLogout={onLogout} />
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card flex flex-col h-screen">
        {/* Header */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Chats</h1>
            <Button variant="ghost" size="icon" onClick={showProfile}>
              <User className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search chats..." className="pl-10" />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1 min-h-0 max-h-full">
          <div className="p-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-muted/50 ${selectedChat?.id === chat.id ? "bg-muted" : ""
                  }`}
                onClick={() => handleChatSelect(chat)}
              >
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarImage src={chat.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {chat.is_group ? (
                      <Users className="h-6 w-6" />
                    ) : (
                      chat.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">
                      {chat.name ||
                        chat.participants
                          .filter(p => p.id !== userId)
                          .map(p => p.name)[0]}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {new Date(chat.latest_message?.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.latest_message?.content}
                    </p>
                    {chat.unread_count > 0 && (
                      <Badge variant="default" className="ml-2 bg-primary">
                        {chat.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-screen min-h-0">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={selectedChat.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {selectedChat.is_group ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        selectedChat.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">
                      {selectedChat.name ??
                        selectedChat.participants
                          .filter(p => p.id !== userId)
                          .map(p => p.name)[0]}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedChat.is_group ?
                        `Group • ${selectedChat.participants.length} members` :
                        "Online"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 min-h-0 max-h-full">
              <div className="p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.user_id === userId ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.user_id === userId ?
                        "bg-primary text-primary-foreground" :
                        "bg-muted text-muted-foreground"
                        }`}
                    >
                      <p className="font-semibold mb-1 text-[12px] italic ">{message.user.name}</p>
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${message.user_id === userId ?
                          "text-primary-foreground/70" :
                          "text-muted-foreground"
                          }`}
                      >
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Select a chat to start messaging</h3>
              <p className="text-muted-foreground">Choose from your existing conversations</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}