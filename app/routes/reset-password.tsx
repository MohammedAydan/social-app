import type { MetaArgs } from "react-router";
import ResetPasswordPage from "~/features/auth/pages/reset-password-page";

export function meta({ }: MetaArgs) {
    const domain = typeof window !== "undefined"
        ? window.location.origin
        : "https://mohammed-aydan.me";
    return [
        { title: "Reset Password" },
        { name: "description", content: "Reset Password Page" },
        { name: "keywords", content: "reset password, social app" },
        { name: "author", content: "Social App Team" },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: "Reset Password" },
        { property: "og:description", content: "Reset Password Page" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${domain}/reset-password` },
        { property: "og:image", content: `${domain}/og-image.png` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Reset Password" },
        { name: "twitter:description", content: "Reset Password Page" },
        { name: "twitter:image", content: `${domain}/twitter-image.png` }
    ];
}

export default function ResetPassword() {
    return <ResetPasswordPage />;
}