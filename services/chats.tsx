
import { Chat } from "@/interfaces/ChatInterface";
import axios from "axios";
import { useStore } from "@/hooks/store";
import { SendMessageResponse } from "@/interfaces/MessageInterface";

export const getNetworkInstance = () => {
  const token = useStore.getState().token;
  return axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
      },
  });
};

export async function fetchChats(): Promise<Chat[]> {
    try {
        const network = getNetworkInstance();
        const response = await network.get("/api/conversations");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch chats:", error);
        throw new Error("Failed to fetch chats");
    }
}

export async function fetchMessages(chatId: number) {
    try {
        const network = getNetworkInstance();
        const response = await network.get(`/api/conversations/${chatId}/messages`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch messages:", error);
        throw new Error("Failed to fetch messages");
    }
}

export async function sendMessage(chatId: number, message: SendMessageResponse) {
    try {
        const network = getNetworkInstance();
        const response = await network.post(`/api/conversations/${chatId}/messages`, { ...message });
        return response.data;
    } catch (error) {
        console.error("Failed to send message:", error);
        throw new Error("Failed to send message");
    }
}
export async function createChat(participantId: number) {
    try {
        const network = getNetworkInstance();
        const response = await network.post("/api/conversations", { participantId });
        return response.data;
    } catch (error) {
        console.error("Failed to send message:", error);
        throw new Error("Failed to send message");
    }
}
