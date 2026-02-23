
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
export async function createChat(participantId: number[], name: string = '', is_group: boolean = false) {
    try {
        const network = getNetworkInstance();
        const response = await network.post("/api/conversations", {
            user_ids: participantId,
            name,
            is_group
        });
        return response.data;
    } catch (error) {
        console.error("Failed to send message:", error);
        throw new Error("Failed to send message");
    }
}

//funciones que aun deben implementarse en el backend

export async function searchUsers(query: string) {
    try {
        const network = getNetworkInstance();
        const response = await network.get(`/api/users/search`, {
            params: { query }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to search users:", error);
        throw new Error("Failed to search users");
    }
}

export async function addUserToChat(chatId: number, userId: number) {
    try {
        const network = getNetworkInstance();
        const response = await network.post(`/api/conversations/${chatId}/add-user`, { userId });
        return response.data;
    } catch (error) {
        console.error("Failed to add user to chat:", error);
        throw new Error("Failed to add user to chat");
    }
}

export async function leaveChat(chatId: number) {
    try {
        const network = getNetworkInstance();
        const response = await network.post(`/api/conversations/${chatId}/leave`);
        return response.data;
    } catch (error) {
        console.error("Failed to leave chat:", error);
        throw new Error("Failed to leave chat");
    }
}

export async function deleteChat(chatId: number) {
    try {
        const network = getNetworkInstance();
        const response = await network.delete(`/api/conversations/${chatId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to delete chat:", error);
        throw new Error("Failed to delete chat");
    }
}

export async function markMessagesAsRead(chatId: number) {
    try {
        const network = getNetworkInstance();
        const response = await network.post(`/api/conversations/${chatId}/mark-read`);
        return response.data;
    } catch (error) {
        console.error("Failed to mark messages as read:", error);
        throw new Error("Failed to mark messages as read");
    }
}
