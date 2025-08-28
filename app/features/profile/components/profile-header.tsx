import UserAvatar from "~/shared/components/user-avatar";
import type { UserType } from "~/shared/types/user-type";
import FollowButton from "./follow-button";
import { BadgeCheck } from "lucide-react";
import UpdateUserDialog from "./update-user-dialog";

import SettingsDialog from "./settings-dialog";

interface ProfileHeaderProps {
    user: UserType;
    authenticatedUser?: boolean;
}

const ProfileHeader = ({ user, authenticatedUser = false }: ProfileHeaderProps) => {
    return (
        <div className="flex flex-col w-full max-w-xl">
            <div className="w-full flex flex-col md:flex-row items-center md:items-start gap-8 mt-6">
                <UserAvatar url={user.profileImageUrl} username={user.userName} size={160} />
                <div className="flex flex-col gap-4">
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                        {user?.userName} {user?.isVerified && (<BadgeCheck className="text-primary" size={20} />)}
                    </h2>
                    <div className="flex gap-8 text-muted-foreground">
                        <StatItem label="Posts" value={user.postsCount} />
                        <StatItem label="Followers" value={user.followersCount} />
                        <StatItem label="Following" value={user.followingCount} />
                    </div>
                    <div className="w-full mt-3">
                        {!authenticatedUser && <FollowButton
                            userId={user.id}
                            isPrivate={user.isPrivate}
                            isFollower={user.isFollower}
                            isFollowAccepted={user.isFollowerAccepted}
                        />}
                        {authenticatedUser && (
                            <div className="flex gap-2">
                                <UpdateUserDialog />
                                <SettingsDialog />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {user.bio && (
                <div className="py-5">
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