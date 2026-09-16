export interface CommentUserType {
    id: string;
    userName: string;
    firstName?: string;
    lastName?: string;
    birthDate: Date;
    profileImageUrl: string;
    coverImageUrl: string;
    isVerified: boolean;
    isPrivate: boolean;
    roles: string[];
    createdAt: Date;
}
