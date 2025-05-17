import type { MetaArgs } from "react-router";
import AddPostPage from "~/features/feed/pages/add-post-page";

export function meta({ }: MetaArgs) {
    return [
        { title: "Add Post Page" },
        { name: "description", content: "Add Post Page" }
    ]
}

export default function Feed() {
    return <AddPostPage />;
}