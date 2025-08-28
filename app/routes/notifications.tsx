import type { MetaArgs } from "react-router";
import NotificationsPage from "~/features/notifications/pages/notifications-page";

export function meta({ }: MetaArgs) {
    const domain = typeof window !== "undefined"
        ? window.location.origin
        : "https://mohammed-aydan.me";
    return [
        { title: "Notifications Page" },
        { name: "description", content: "Notifications Page" },
        { name: "keywords", content: "notifications, social app" },
        { name: "author", content: "Social App Team" },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: "Notifications Page" },
        { property: "og:description", content: "Notifications Page" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${domain}/notifications` },
        { property: "og:image", content: `${domain}/og-image.png` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Notifications Page" },
        { name: "twitter:description", content: "Notifications Page" },
        { name: "twitter:image", content: `${domain}/twitter-image.png` }
    ];
}

export default function Feed() {
    return <NotificationsPage />;
}