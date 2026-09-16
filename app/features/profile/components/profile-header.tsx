import UserAvatar from "~/shared/components/user-avatar";
import type { UserType } from "~/shared/types/user-type";
import FollowButton from "./follow-button";
import BlockButton from "./block-button";
import { useIsBlocked } from "../hooks/use-block-user";
import { getDisplayName, getHandle } from "~/shared/utils/display-name";
import { BadgeCheck } from "lucide-react";
import UpdateUserDialog from "./update-user-dialog";

import SettingsDialog from "./settings-dialog";
import ManageUserImage from "./manage-user-image";

interface ProfileHeaderProps {
    user: UserType;
    authenticatedUser?: boolean;
}

const ProfileHeader = ({ user, authenticatedUser = false }: ProfileHeaderProps) => {
    // One-direction check (me → them): when true, follow actions are hidden
    // because the server rejects writes between blocked parties (400).
    const { data: iBlockedThem, isLoading: blockStatusLoading } = useIsBlocked(
        authenticatedUser ? null : user.id
    );

    return (
        <div className="flex flex-col w-full max-w-xl justify-center">
            <div className="w-full flex flex-col md:flex-row items-center justify-center md:items-start gap-8 mt-6">
                {/* // */}
                {!authenticatedUser && (
                    <UserAvatar url={user.profileImageUrl} username={user.userName} displayName={getDisplayName(user)} size={160} />
                )}
                {authenticatedUser && (
                    <ManageUserImage user={user} url={user.profileImageUrl} username={user.userName} size={160} />
                )}
                {/* // */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1 items-center md:items-start">
                        <h2 className="text-3xl font-bold flex items-center gap-2 justify-center md:justify-start tracking-tight">
                            {getDisplayName(user)} {user?.isVerified && (<BadgeCheck className="text-primary" size={24} />)}
                        </h2>
                        {getHandle(user) && (
                            <p className="text-sm text-muted-foreground">{getHandle(user)}</p>
                        )}
                        {/* Inbound state (they follow me) — informational only. */}
                        {!authenticatedUser && user.isFollower && (
                            <p className="text-xs text-muted-foreground">
                                {user.isFollowerAccepted ? "Follows you" : "Requested to follow you"}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-8 text-muted-foreground">
                        <StatItem label="Posts" value={user.postsCount} />
                        <StatItem label="Followers" value={user.followersCount} />
                        <StatItem label="Following" value={user.followingCount} />
                    </div>
                    <div className="w-full mt-3">
                        {!authenticatedUser && (
                            <div className="flex flex-col gap-2 w-full">
                                {!blockStatusLoading && !iBlockedThem && (
                                    <FollowButton
                                        userId={user.id}
                                        isPrivate={user.isPrivate}
                                        isFollowing={user.isFollowing}
                                        isFollowingAccepted={user.isFollowingAccepted}
                                    />
                                )}
                                {iBlockedThem && (
                                    <p className="text-xs text-muted-foreground text-center">
                                        You've blocked this user. Unblock to follow or interact.
                                    </p>
                                )}
                                <BlockButton userId={user.id} userName={user.userName} />
                            </div>
                        )}
                        {authenticatedUser && (
                            <div className="flex items-center justify-center gap-2 w-full">
                                <UpdateUserDialog />
                                <SettingsDialog />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {user.bio && (
                <div className="py-5 px-6">
                    <p className="text-sm text-foreground/80 max-w-xl">{user.bio}</p>
                </div>
            )}
        </div>
    );
};

const StatItem = ({ label, value }: { label: string; value: number }) => (
    <div>
        <span className="text-foreground font-semibold">{value}</span> {label}
    </div>
);

export default ProfileHeader;