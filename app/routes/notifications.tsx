import type { MetaArgs } from "react-router";
import NotificationsPage from "~/features/notifications/pages/notifications-page";

export function meta({ }: MetaArgs) {
    return [
        { title: "Notifications Page" },
        { name: "description", content: "Notifications Page" }
    ]
}

export default function Feed() {
    return <NotificationsPage />;
}