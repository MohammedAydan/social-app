"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "~/features/auth/hooks/use-auth";
import ProfilePage from "./profile-page";
import { getUserProfile } from "~/shared/api";
import type { UserType } from "~/shared/types/user-type";
import ProfileHeader from "../components/profile-header";
import { Separator } from "~/components/ui/separator";
import ProfilePosts from "../components/profile-posts";
import LoadingProfileHeader from "../components/loading-profile";

const UserProfilePage = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const profileId = Array.isArray(userId) ? userId[0] : userId;
  const { data: user, isError, isLoading } = useQuery<UserType | null>({
    queryKey: ["user-profile", profileId],
    queryFn: () => getUserProfile(profileId ?? "").then((res) => res.data ?? null),
    enabled: !!userId
  });

  if (!userId || isError) {
    router.replace("/404");
    return null;
  }

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center mt-16 pl-0 md:pl-16 ">
        <div className="w-full max-w-6xl px-6 flex flex-col items-center">
          <LoadingProfileHeader />
        </div>
      </div>
    );
  }

  if (!user) {
    router.replace("/404");
    return null;
  }

  if (user.id == authUser?.id) {
    return <ProfilePage />
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

export default UserProfilePage;
