import { GalleryVerticalEnd } from "lucide-react";
import MyUserPosts from "./my-user-posts";
import UserPosts from "./user-posts";

const ProfilePosts = ({ userId, authenticatedUser = false }: { userId: string, authenticatedUser?: boolean; }) => {
    return (
        <section className="w-full mt-6">
            <div className="sticky top-16 z-10 bg-background p-4 flex items-center justify-center gap-2">
                <GalleryVerticalEnd className="w-6 h-6 text-muted-foreground" />
                <h3 className="text-2xl font-medium">Posts</h3>
            </div>
            
            {authenticatedUser ? <MyUserPosts /> : <UserPosts userId={userId} />}

        </section>
    );
};

export default ProfilePosts;
