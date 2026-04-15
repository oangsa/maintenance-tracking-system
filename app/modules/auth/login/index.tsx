import React from "react";
import { useNavigate } from "react-router";
import { FiTool, FiUser, FiLock } from "react-icons/fi";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { login } from "~/services/auth.service";

export default function LoginPage()
{
    const navigate = useNavigate();

    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();
        setError("");
        setLoading(true);

        try
        {
            await login({ email, password });
            navigate("/", { replace: true });
        }
        catch (err)
        {
            setError((err as Error).message || "Invalid username or password.");
        }
        finally
        {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="w-full max-w-sm">
                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary text-primary-foreground mb-4">
                        <FiTool size={28} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Maintenance Tracking
                    </h1>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                        Sign in to your account
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-lg border bg-card shadow-sm p-6">
                    {error && (
                        <div className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <FiUser
                                    size={15}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                                />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                    className="pl-9"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <FiLock
                                    size={15}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                                />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    className="pl-9"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full mt-2" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </div>

                <p className="text-center mt-6 text-xs text-muted-foreground">
                    Contact your administrator if you do not have an account.
                </p>
            </div>
        </div>
    );
}
