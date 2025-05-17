import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "~/features/auth/hooks/use-auth";
import Profile from "~/routes/profile";
import { getUserProfile } from "~/shared/api";
import type { UserType } from "~/shared/types/user-type";
import ProfileHeader from "../components/profile-header";
import { Separator } from "~/components/ui/separator";
import ProfilePosts from "../components/profile-posts";
import LoadingProfileHeader from "../components/loading-profile";

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { data: user, isError, isLoading } = useQuery<UserType | null>({
    queryKey: ["user-profile", userId],
    queryFn: () => getUserProfile(userId ?? "").then((res) => res.data),
    enabled: !!userId
  });

  if (!userId || isError) {
    navigate("/404");
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
    navigate("/404");
    return null;
  }

  if (user.id == authUser?.id) {
    return <Profile />
  }

  return (
    <div className="w-full flex flex-col items-center mt-16 pl-0 md:pl-16 ">
      <div className="w-full max-w-6xl px-6 flex flex-col items-center">
        <ProfileHeader user={user} authenticatedUser={false} />
        <Separator className="my-8" />
        <ProfilePosts userId={user?.id} authenticatedUser={false} />
      </div>
    </div>
  );
};

export default UserProfilePage;
