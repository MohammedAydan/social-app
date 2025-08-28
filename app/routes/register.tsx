import RegisterPage from "~/features/auth/pages/register-page";
import type { Route } from "../+types/root";

export function meta({ }: Route.MetaArgs) {
    const domain = typeof window !== "undefined"
        ? window.location.origin
        : "https://social.mohammed-aydan.me";
    return [
        { title: "Register" },
        { name: "description", content: "Register page" },
        { name: "keywords", content: "register, sign up, social app" },
        { name: "author", content: "Social App Team" },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: "Register" },
        { property: "og:description", content: "Register page" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${domain}/register` },
        { property: "og:image", content: `${domain}/og-image.png` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Register" },
        { name: "twitter:description", content: "Register page" },
        { name: "twitter:image", content: `${domain}/twitter-image.png` }
    ];
}

export default function Register() {
    return <RegisterPage />;
}