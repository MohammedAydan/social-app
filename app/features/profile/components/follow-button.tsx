import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { followUser, unfollowUser } from "~/shared/api";
import Loading from "~/shared/components/loading";
import type { UserType } from "~/shared/types/user-type";

interface FollowButtonProps {
    userId: string;
    isPrivate: boolean;
    isFollower: boolean;
    isFollowAccepted: boolean;
}

const FollowButton = ({
    userId,
    isPrivate,
    isFollower,
    isFollowAccepted,
}: FollowButtonProps) => {
    const { user, incrementFollowingCount, decrementFollowingCount } = useAuth();
    const queryClient = useQueryClient();

    const updateUserProfileCache = (updates: Partial<UserType>) => {
        queryClient.setQueryData<UserType>(["user-profile", userId], (oldData) => {
            if (!oldData) return oldData;
            return { ...oldData, ...updates };
        });
    };

    const followMutation = useMutation({
        mutationFn: () => followUser({ followerId: user?.id ?? "", targetUserId: userId }),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["user-profile", userId] });
            const previous = queryClient.getQueryData<UserType>(["user-profile", userId]);

            updateUserProfileCache({
                isFollower: true,
                isFollowerAccepted: !isPrivate,
                followersCount: (!isPrivate) ? ((previous?.followersCount ?? 0) + 1) : previous?.followersCount,
            });

            if (!isPrivate) incrementFollowingCount();

            return { previous };
        },
        onError: (_error, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(["user-profile", userId], context.previous);
            if (!isPrivate) decrementFollowingCount();
        },
    });

    const unfollowMutation = useMutation({
        mutationFn: () => unfollowUser({ followerId: user?.id ?? "", targetUserId: userId }),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["user-profile", userId] });
            const previous = queryClient.getQueryData<UserType>(["user-profile", userId]);

            updateUserProfileCache({
                isFollower: false,
                isFollowerAccepted: false,
                followersCount: (!isPrivate) ? (Math.max((previous?.followersCount ?? 1) - 1, 0)) : previous?.followersCount,
            });

            if (isFollowAccepted) decrementFollowingCount();

            return { previous };
        },
        onError: (_error, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(["user-profile", userId], context.previous);
            if (isFollowAccepted) incrementFollowingCount();
        }
    });

    const isLoading = followMutation.isPending || unfollowMutation.isPending;

    if (!user?.id) return null;

    const handleClick = () => {
        if (isLoading) return;

        if (isFollower) {
            unfollowMutation.mutate();
        } else {
            followMutation.mutate();
        }
    };

    let buttonText = "Follow";
    let variant: "default" | "outline" | "destructive" = "default";

    if (isFollower) {
        if (isFollowAccepted) {
            buttonText = "Unfollow";
            variant = "outline";
        } else {
            buttonText = "Requested";
            variant = "destructive";
        }
    }

    if (isLoading) {
        buttonText = "";
        variant = "outline";
    }

    return (
        <div className="w-full">
            <Button
                className="w-full"
                variant={variant}
                onClick={handleClick}
                disabled={isLoading}
            >
                {isLoading ? <Loading size="20px" /> : buttonText}
            </Button>
        </div>
    );
};

export default FollowButton;
