import { Video } from "@/model/User.model"

export interface ApiResponse {
    success: boolean,
    message: string,
    videos?: Array<Video>
}