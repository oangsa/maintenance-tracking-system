import LoginPage from "~/modules/auth/login";

export function meta()
{
    return [
        { title: "Login — Maintenance Tracking System" },
        { name: "description", content: "Sign in to your account" },
    ];
}

export default function Login()
{
    return <LoginPage />;
}
