import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/feed.tsx"),
    // route("/feed", "routes/feed.tsx"),
    route("/post/add", "routes/add-post.tsx"),
    route("/post/:postId", "routes/post.tsx"),
    route("/sign-in", "routes/sign-in.tsx"),
    route("/register", "routes/register.tsx"),
    route("/forgot-password", "routes/forgot-password.tsx"),
    route("/reset-password", "routes/reset-password.tsx"),
    route("/profile", "routes/profile.tsx"),
    route("/profile/:userId", "routes/user-profile.tsx"),
    route("/notifications", "routes/notifications.tsx"),
    route("/search", "routes/search.tsx"),
] satisfies RouteConfig;
