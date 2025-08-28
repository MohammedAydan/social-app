import type { MetaArgs } from "react-router";
import FeedPage from "~/features/feed/pages/feed-page";

export function meta({ }: MetaArgs) {
    const domain = typeof window !== "undefined"
        ? window.location.origin
        : "https://social.mohammed-aydan.me";
    return [
        { title: "Feed Page" },
        { name: "description", content: "Feed Page" },
        { name: "keywords", content: "feed, social app, posts" },
        { name: "author", content: "Social App Team" },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: "Feed Page" },
        { property: "og:description", content: "Feed Page" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${domain}/feed` },
        { property: "og:image", content: `${domain}/og-image.png` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Feed Page" },
        { name: "twitter:description", content: "Feed Page" },
        { name: "twitter:image", content: `${domain}/twitter-image.png` }
    ];
}

export default function Feed() {
    return <FeedPage />;
}