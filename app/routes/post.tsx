import type { MetaArgs } from "react-router";
import PostPage from "~/features/feed/pages/post-page";

export function meta({ }: MetaArgs) {
    return [
        { title: "Post Page" },
        { name: "description", content: "Post Page" }
    ]
}

export default function Feed() {
    return <PostPage />;
}