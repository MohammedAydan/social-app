import { useAuth } from "~/features/auth/hooks/use-auth";
import LoadingProfileHeader from "../components/loading-profile";
import ProfileHeader from "../components/profile-header";
import { Separator } from "~/components/ui/separator";
import ProfilePosts from "../components/profile-posts";

const ProfilePage = () => {
    const { user, isLoading } = useAuth();

    if (isLoading || !user) {
        return (
            <div className="w-full flex flex-col items-center mt-16 ">
                <div className="w-full max-w-6xl px-6 flex flex-col items-center">
                    <LoadingProfileHeader />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center mt-16 pl-0 md:pl-16">
            <div className="w-full max-w-6xl flex  flex-col items-center">
                <ProfileHeader user={user} authenticatedUser={true} />
                <Separator className="my-8" />
                <ProfilePosts userId={user.id} authenticatedUser={true} />
            </div>
        </div>
    );
};

export default ProfilePage;
