import type { MetaArgs } from "react-router";
import PostPage from "~/features/feed/pages/post-page";

export function meta({ }: MetaArgs) {
    const domain = typeof window !== "undefined"
        ? window.location.origin
        : "https://mohammed-aydan.me";
    return [
        { title: "Post Page" },
        { name: "description", content: "Post Page" },
        { name: "keywords", content: "post, social app, view post" },
        { name: "author", content: "Social App Team" },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: "Post Page" },
        { property: "og:description", content: "Post Page" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${domain}/post` },
        { property: "og:image", content: `${domain}/og-image.png` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Post Page" },
        { name: "twitter:description", content: "Post Page" },
        { name: "twitter:image", content: `${domain}/twitter-image.png` }
    ];
}

export default function Feed() {
    return <PostPage />;
}