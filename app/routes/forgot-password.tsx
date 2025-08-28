import type { MetaArgs } from "react-router";
import ForgotPasswordPage from "~/features/auth/pages/forgot-password-page";

export function meta({ }: MetaArgs) {
    const domain = typeof window !== "undefined"
        ? window.location.origin
        : "https://mohammed-aydan.me";
    return [
        { title: "Forgot Password" },
        { name: "description", content: "Forgot Password Page" },
        { name: "keywords", content: "forgot password, reset password, social app" },
        { name: "author", content: "Social App Team" },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: "Forgot Password" },
        { property: "og:description", content: "Forgot Password Page" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${domain}/forgot-password` },
        { property: "og:image", content: `${domain}/og-image.png` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Forgot Password" },
        { name: "twitter:description", content: "Forgot Password Page" },
        { name: "twitter:image", content: `${domain}/twitter-image.png` }
    ];
}

export default function ForgotPassword() {
    return <ForgotPasswordPage />;
}