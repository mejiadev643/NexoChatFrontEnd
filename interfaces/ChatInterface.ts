
export interface Chat {
    id: number
    name: string | null
    is_group: boolean
    avatar: string | null
    created_by: number
    created_at: string
    updated_at: string
    unread_count: number
    pivot: {
        user_id: number
        conversation_id: number
        created_at: string
        updated_at: string
        last_read_at: string
    }
    participants: Array<{
        id: number
        name: string
        email: string
        email_verified_at: string | null
        avatar: string | null
        phone: string
        status: string
        created_at: string
        updated_at: string
        pivot: {
            conversation_id: number
            user_id: number
            created_at: string
            updated_at: string
            last_read_at: string
        }
    }>
    latest_message: {
        id: number
        conversation_id: number
        user_id: number
        content: string
        type: string
        file_path: string | null
        is_read: boolean
        created_at: string
        updated_at: string
    } | null
}
