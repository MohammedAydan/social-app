import type { MetaArgs } from "react-router";
import { MediaProvider } from "~/features/feed/hooks/use-manage-media";
import AddPostPage from "~/features/feed/pages/add-post-page";

export function meta({ }: MetaArgs) {
    const domain = typeof window !== "undefined"
        ? window.location.origin
        : "https://social.mohammed-aydan.me";
    return [
        { title: "Add Post Page" },
        { name: "description", content: "Add Post Page" },
        { name: "keywords", content: "add post, social app, create post" },
        { name: "author", content: "Social App Team" },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: "Add Post Page" },
        { property: "og:description", content: "Add Post Page" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${domain}/add-post` },
        { property: "og:image", content: `${domain}/og-image.png` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Add Post Page" },
        { name: "twitter:description", content: "Add Post Page" },
        { name: "twitter:image", content: `${domain}/twitter-image.png` }
    ];
}

export default function Feed() {
    return (
        <AddPostPage />
    );
}