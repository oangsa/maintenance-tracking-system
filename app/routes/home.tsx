import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Maintainance Tracking System" },
    { name: "description", content: "Welcome to the system! We're cooking" },
  ];
}

export default function Home() {
    return (
        <div className="flex h-screen items-center justify-center text-2xl font-bold">
            Welcome, Phi, Ploy, and Pilaiwan! :D
        </div>
    )
}
