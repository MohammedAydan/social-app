import RegisterPage from "~/features/auth/pages/register-page";
import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Register" },
        { name: "description", content: "Register page" }
    ];
}

export default function Register() {
    return <RegisterPage />;
}