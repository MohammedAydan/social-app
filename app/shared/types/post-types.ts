export type PostVisibility = "Public" | "Private" | "FollowersOnly" | "followers_only" | "public" | "private";

/** Backend canonical values are PascalCase ("Public"/"Private"/"FollowersOnly"). */
export const VISIBILITY_PUBLIC = "Public" as const;
export const VISIBILITY_PRIVATE = "Private" as const;

/** Normalize any casing/variant the UI or API returns to the canonical form. */
export const normalizeVisibility = (v: unknown): "Public" | "Private" | "FollowersOnly" => {
    if (typeof v !== "string") return VISIBILITY_PUBLIC;
    const lower = v.toLowerCase();
    if (lower === "private") return VISIBILITY_PRIVATE;
    if (lower === "followers_only" || lower === "followersonly" || lower === "followers-only") return "FollowersOnly";
    return VISIBILITY_PUBLIC;
};

export interface PostUserType {
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    birthDate: string | Date;
    profileImageUrl: string;
    coverImageUrl: string;
    isVerified: boolean;
    isPrivate: boolean;
    roles: string[];
    createdAt: string | Date;
}

export interface PostType {
    id: string;
    userId: string;
    user: PostUserType; // assuming this is a simplified user
    title: string | null;
    content: string | null;
    visibility: PostVisibility;
    likesCount: number;
    shareingsCount: number;
    commentsCount: number;
    createdAt: string | Date;
    updatedAt: string | Date;
    media: Media[]; // can be optional: IMedia[] | undefined
    isLiked: boolean;
    isDeleted?: boolean;
    parentPostId?: string | null;
    parentPost?: PostType | null;
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

