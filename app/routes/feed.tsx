import type { MetaArgs } from "react-router";
import FeedPage from "~/features/feed/pages/feed-page";

export function meta({ }: MetaArgs) {
    return [
        { title: "Feed Page" },
        { name: "description", content: "Feed Page" }
    ]
}

export default function Feed() {
    return <FeedPage />;
}