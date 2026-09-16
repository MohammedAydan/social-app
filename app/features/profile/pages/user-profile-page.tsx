import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ShieldX, UserX } from "lucide-react";
import { useAuth } from "~/features/auth/hooks/use-auth";
import Profile from "~/routes/profile";
import { getUserProfile } from "~/shared/api";
import type { UserType } from "~/shared/types/user-type";
import ProfileHeader from "../components/profile-header";
import BlockButton from "../components/block-button";
import { useIsBlocked } from "../hooks/use-block-user";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import ProfilePosts from "../components/profile-posts";
import LoadingProfileHeader from "../components/loading-profile";
import Loading from "~/shared/components/loading";

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { data: user, isError, error, isLoading } = useQuery<UserType | null>({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      const res = await getUserProfile(userId ?? "");
      // Blocked (401) or private targets resolve to an empty/failed envelope —
      // surface null so the UI shows "unavailable" instead of crashing.
      if (!res.success) throw new Error(res.message || "Failed to load profile");
      return res.data ?? null;
    },
    enabled: !!userId,
    retry: false,
    // Relationship flags (isFollowing/isBlocked) drive follow/block actions —
    // always fetch fresh on visit so the buttons never act on stale state.
    staleTime: 0,
    refetchOnMount: "always",
    // The global client disables focus refetch: re-enable here so an accept
    // that happened elsewhere shows up when the sender returns to the tab.
    refetchOnWindowFocus: true,
    // While an outgoing request is pending, poll gently so an accept flips
    // "Requested" → "Unfollow" without a manual refresh. Stops automatically
    // once the request is accepted, removed, or the profile unmounts.
    refetchInterval: (query) => {
      const data = query.state.data as UserType | null | undefined;
      return data && data.isFollowing && !data.isFollowingAccepted ? 15_000 : false;
    },
  });

  // Only relevant when the profile read failed: distinguishes "I blocked
  // them" (actionable → Unblock) from "they blocked me / unknown" (read-only).
  const { data: iBlockedThem, isLoading: blockStatusLoading } = useIsBlocked(
    isError && userId && userId !== authUser?.id ? userId : null
  );

  useEffect(() => {
    if (!userId) {
      navigate("/404", { replace: true });
    }
  }, [userId, navigate]);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center mt-16 pl-0 md:pl-16 ">
        <div className="w-full max-w-6xl px-6 flex flex-col items-center">
          <LoadingProfileHeader />
        </div>
      </div>
    );
  }

  if (isError || !user) {
    if (blockStatusLoading) {
      return (
        <div className="w-full flex flex-col items-center mt-16 pl-0 md:pl-16">
          <Loading size="30px" />
        </div>
      );
    }
    if (iBlockedThem && userId) {
      return <BlockedByMe userId={userId} />;
    }
    return (
      <div className="w-full flex flex-col items-center mt-16 pl-0 md:pl-16 px-6">
        <div className="w-full max-w-md flex flex-col items-center text-center py-16 gap-4">
          <ShieldX className="h-12 w-12 text-muted-foreground/60" />
          <h2 className="text-xl font-semibold">Profile unavailable</h2>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "This profile can't be shown right now."}
          </p>
          <Link to="/">
            <Button variant="outline">Back to feed</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (user.id == authUser?.id) {
    return <Profile />
  }

  return (
    <div className="w-full flex flex-col items-center mt-16 pl-0 md:pl-16">
      <div className="w-full max-w-6xl flex  flex-col items-center">
        <ProfileHeader user={user} authenticatedUser={false} />
        <Separator className="my-8" />
        <ProfilePosts userId={user?.id} authenticatedUser={false} />
      </div>
    </div>
  );
};

/** Profile read failed but is-blocked says the viewer blocked this user. */
const BlockedByMe = ({ userId }: { userId: string }) => {
  return (
    <div className="w-full flex flex-col items-center mt-16 pl-0 md:pl-16 px-6">
      <div className="w-full max-w-md flex flex-col items-center text-center py-16 gap-4">
        <UserX className="h-12 w-12 text-muted-foreground/60" />
        <h2 className="text-xl font-semibold">You've blocked this user</h2>
        <p className="text-sm text-muted-foreground">
          Unblock them to see their profile and posts again.
        </p>
        <div className="w-full max-w-xs">
          <BlockButton userId={userId} />
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
