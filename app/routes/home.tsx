import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs)
{
  return [
    { title: "Maintainance Tracking System" },
    { name: "description", content: "Welcome to the system." },
  ];
}

export default function Home()
{
    return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Maintenance Tracking System
        </h1>
        <p className="text-sm text-muted-foreground">
          Select a module from the sidebar to get started.
        </p>
      </div>
        </div>
  );
}
