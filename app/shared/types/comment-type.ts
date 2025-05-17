import { type CommentUserType } from "./comment-user-type";

export interface CommentType {
    id: string;
    postId: string;
    userId: string;
    user: CommentUserType;
    content: string;
    parentId: string | null;
    repliesCount: number;
    createdAt: Date;
    updatedAt: Date;
}

