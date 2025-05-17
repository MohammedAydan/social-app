export interface FollowType {
    id: string;
    followerId: string;
    followingId: string;
    accepted: boolean;
    createdAt: Date;
    updatedAt: Date;
    follower?: UserSummaryDto;
    following?: UserSummaryDto;
}

export interface UserSummaryDto {
    id: string;
    userName?: string;
    profileImageUrl?: string;
}