import type { MetaArgs } from "react-router";
import SignInPage from "~/features/auth/pages/sign-in-page";

export function meta({ }: MetaArgs) {
    const domain = typeof window !== "undefined"
        ? window.location.origin
        : "https://social.mohammed-aydan.me";
    return [
        { title: "Sign In" },
        { name: "description", content: "Sign In Page" },
        { name: "keywords", content: "sign in, login, social app" },
        { name: "author", content: "Social App Team" },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: "Sign In" },
        { property: "og:description", content: "Sign In Page" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${domain}/sign-in` },
        { property: "og:image", content: `${domain}/og-image.png` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Sign In" },
        { name: "twitter:description", content: "Sign In Page" },
        { name: "twitter:image", content: `${domain}/twitter-image.png` }
    ];
}

export default function SignIn() {
    return <SignInPage />
}