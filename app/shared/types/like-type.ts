export interface LikeType {
    id: string;
    postId: string;
    userId: string;
    user: LikeUserType;
    createdAt: Date;
}

export interface LikeUserType {
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