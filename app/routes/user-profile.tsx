import type { MetaArgs } from "react-router";
import UserProfilePage from "~/features/profile/pages/user-profile-page";

export function meta({ }: MetaArgs) {
    const domain = typeof window !== "undefined"
        ? window.location.origin
        : "https://social.mohammed-aydan.me";
    return [
        { title: "User Profile" },
        { name: "description", content: "User Profile description" },
        { name: "keywords", content: "user profile, profile, social app" },
        { name: "author", content: "Social App Team" },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: "User Profile" },
        { property: "og:description", content: "User Profile description" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${domain}/user-profile` },
        { property: "og:image", content: `${domain}/og-image.png` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "User Profile" },
        { name: "twitter:description", content: "User Profile description" },
        { name: "twitter:image", content: `${domain}/twitter-image.png` }
    ];
}

export default function UserProfile() {
    return <UserProfilePage />
}