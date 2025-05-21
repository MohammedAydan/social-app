export interface UserType {
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    birthDate: Date;
    bio: string;
    profileImageUrl: string;
    coverImageUrl: string;
    isVerified: boolean;
    isPrivate: boolean;
    followersCount: number;
    followingCount: number;
    postsCount: number;
    roles: string[];
    isFollower: boolean;
    isFollowerAccepted: boolean;
    isFollowing: boolean;
    isFollowingAccepted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface UpdateUserType {
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    birthDate: Date;
    bio: string;
    profileImageUrl: string;
    isPrivate: boolean;
}