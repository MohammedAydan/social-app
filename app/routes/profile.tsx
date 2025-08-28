import type { MetaArgs } from "react-router";
import ProfilePage from "~/features/profile/pages/profile-page";

export function meta({ }: MetaArgs) {
    const domain = typeof window !== "undefined"
        ? window.location.origin
        : "https://mohammed-aydan.me";
    return [
        { title: "Profile" },
        { name: "description", content: "Profile description" },
        { name: "keywords", content: "profile, user profile, social app" },
        { name: "author", content: "Social App Team" },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: "Profile" },
        { property: "og:description", content: "Profile description" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${domain}/profile` },
        { property: "og:image", content: `${domain}/og-image.png` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Profile" },
        { name: "twitter:description", content: "Profile description" },
        { name: "twitter:image", content: `${domain}/twitter-image.png` }
    ];
}

export default function Profile() {
    return <ProfilePage />
}