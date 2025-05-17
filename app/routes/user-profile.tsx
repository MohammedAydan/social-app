import type { MetaArgs } from "react-router";
import UserProfilePage from "~/features/profile/pages/user-profile-page";

export function meta({ }: MetaArgs) {
    return [
        { title: "User Profile" },
        { name: "description", content: "User Profile description" }
    ];
}

export default function UserProfile() {
    return <UserProfilePage />
}