export interface CommentUserType {
    id: string;
    userName: string;
    birthDate: Date;
    profileImageUrl: string;
    coverImageUrl: string;
    isVerified: boolean;
    isPrivate: boolean;
    roles: string[];
    createdAt: Date;
}
