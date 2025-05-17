import type { MetaArgs } from "react-router";
import ProfilePage from "~/features/profile/pages/profile-page";

export function meta({ }: MetaArgs) {
    return [
        { title: "Profile" },
        { name: "description", content: "Profile description" }
    ];
}

export default function Profile() {
    return <ProfilePage />
}