import { Chat } from "@/interfaces/ChatInterface"

export const userToChat = (user: any, authUserId: number): Chat => {
  return {
    id: user.id,
    name: user.name,
    is_group: false,
    avatar: user.avatar,
    created_by: authUserId,
    created_at: new Date().toISOString() || '',
    updated_at: new Date().toISOString() || '',
    unread_count: 0,
    pivot: {
      user_id: authUserId,
      conversation_id: 0,
      created_at: new Date().toISOString() || '',
      updated_at: new Date().toISOString() || '',
      last_read_at: new Date().toISOString() || '',
    },
    participants: [
    ],
    latest_message: null,
  }
}
