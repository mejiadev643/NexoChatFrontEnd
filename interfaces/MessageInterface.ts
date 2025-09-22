
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    avatar: string | null;
    phone: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: number;
    conversation_id: number;
    user_id: number;
    content: string;
    type: string;
    file_path: string | null;
    is_read: boolean;
    created_at: string;
    updated_at: string;
    user: User;
}

export interface SendMessageResponse {
    content: string;
    type: "text" | "image" | "file" | "video" | "audio";
    file_path: string | null;

}

