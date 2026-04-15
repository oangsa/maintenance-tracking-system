import { FiUser, FiLock, FiTool } from "react-icons/fi";

export function meta()
{
    return [
        { title: "Login — Maintenance Tracking System" },
        { name: "description", content: "Sign in to your account" },
    ];
}

export default function Login()
{
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "var(--bg-body)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 420,
                }}
            >
                {/* Logo / Brand */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 56,
                            height: 56,
                            background: "var(--primary)",
                            borderRadius: "var(--radius)",
                            marginBottom: 16,
                            color: "white",
                        }}
                    >
                        <FiTool size={28} />
                    </div>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            color: "var(--text-main)",
                            letterSpacing: "-0.025em",
                        }}
                    >
                        Maintenance Tracking
                    </h1>
                    <p
                        style={{
                            margin: "8px 0 0",
                            color: "var(--text-muted)",
                            fontSize: "0.9rem",
                        }}
                    >
                        Sign in to your account
                    </p>
                </div>

                {/* Login Card */}
                <div className="card" style={{ marginBottom: 0 }}>
                    <form>
                        {/* Username */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="username">
                                Username
                            </label>
                            <div style={{ position: "relative" }}>
                                <FiUser
                                    size={16}
                                    style={{
                                        position: "absolute",
                                        left: 12,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "var(--text-muted)",
                                        pointerEvents: "none",
                                    }}
                                />
                                <input
                                    id="username"
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter your username"
                                    autoComplete="username"
                                    style={{ paddingLeft: 40 }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="form-group" style={{ marginBottom: 24 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                                <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>
                                    Password
                                </label>
                                <span
                                    style={{
                                        fontSize: "0.825rem",
                                        color: "var(--primary)",
                                        cursor: "pointer",
                                        fontWeight: 500,
                                    }}
                                >
                                    Forgot password?
                                </span>
                            </div>
                            <div style={{ position: "relative" }}>
                                <FiLock
                                    size={16}
                                    style={{
                                        position: "absolute",
                                        left: 12,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "var(--text-muted)",
                                        pointerEvents: "none",
                                    }}
                                />
                                <input
                                    id="password"
                                    type="password"
                                    className="form-control"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    style={{ paddingLeft: 40 }}
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: "100%", padding: "11px 16px", fontSize: "0.95rem" }}
                        >
                            Sign In
                        </button>
                    </form>
                </div>

                {/* Footer note */}
                <p
                    style={{
                        textAlign: "center",
                        marginTop: 24,
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                    }}
                >
                    Contact your administrator if you do not have an account.
                </p>
            </div>
        </div>
    );
}
