export interface PostUserType {
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    birthDate: Date;
    profileImageUrl: string;
    coverImageUrl: string;
    isVerified: boolean;
    isPrivate: boolean;
    roles: string[];
    createdAt: Date;
}

export interface PostType {
    id: string;
    userId: string;
    user: PostUserType; // assuming this is a simplified user
    title: string;
    content: string;
    visibility: 'public' | 'private'; // you may replace with a union type: 'public' | 'private' | etc.
    likesCount: number;
    shareingsCount: number;
    commentsCount: number;
    createdAt: Date;
    updatedAt: Date;
    media: Media[]; // can be optional: IMedia[] | undefined
    isLiked: boolean;
    parentPostId?: string;
    parentPost?: PostType;
}

export interface Media {
    id: string;
    postId: string;
    userId: string;
    name: string;
    type: 'image' | 'video' | 'audio' | 'file'; // you can add more if needed
    url: string;
    thumbnailUrl: string;
    createdAt: Date;
    updatedAt: Date;
}

