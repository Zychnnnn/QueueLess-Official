import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, ArrowRight, Shield } from "lucide-react";
import backgroundImage from "@/assets/upang.png";

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:5000"
).replace(/\/+$/, "");

export const Route = createFileRoute("/staff-login")({
  component: StaffLoginPage,
});

function StaffLoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const staffIdRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Sync any credentials autofilled by the browser on page load / refresh
  useEffect(() => {
    const timer = setTimeout(() => {
      if (staffIdRef.current?.value && !staffId) {
        setStaffId(staffIdRef.current.value);
      }
      if (passwordRef.current?.value && !password) {
        setPassword(passwordRef.current.value);
      }
    }, 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleTogglePassword(e: React.MouseEvent) {
    e.preventDefault();
    if (passwordRef.current) {
      const currentVal = passwordRef.current.value;
      if (currentVal !== password) {
        setPassword(currentVal);
      }
    }
    setShowPassword((prev) => !prev);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: staffId.trim(),
          password,
          loginType: "staff",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setError("Cannot sign in.");
          return;
        }
        setError(
          result.message || "Invalid credentials. Please verify your staff account."
        );
        return;
      }

      if (!result.token || !result.user) {
        setError("Login succeeded, but no authentication data was returned.");
        return;
      }

      if (result.user.role !== "staff") {
        setError("Cannot sign in.");
        return;
      }

      localStorage.setItem("queueless_token", result.token);
      localStorage.setItem("queueless_user", JSON.stringify(result.user));

      navigate({ to: "/" });
    } catch (err) {
      console.error("Staff sign-in error:", err);
      setError("Cannot connect to the server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* ── Full-page background image ── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* ── Transparent Navbar (exact alignment kept) ── */}
      <nav className="relative z-10">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img
              src="/phinma.png"
              alt="QueueLess Logo"
              className="size-11 shrink-0 object-contain"
            />
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold leading-none text-white">
                QueueLess
              </p>
              <p className="mt-1 truncate text-[10px] font-bold uppercase text-white/70">
                Registrar Services
              </p>
            </div>
          </Link>
        </div>
      </nav>

      {/* ── Centered Floating Card ── */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-[440px] rounded-2xl bg-white p-7 sm:p-9 shadow-2xl">
          {/* Card header */}
          <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#c9a84c]">
            STAFF ACCESS
          </p>
          <h2 className="mb-6 text-[1.75rem] font-bold tracking-tight text-[#1a3a1a]">
            Sign in as Staff
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Staff ID or Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="staffId"
                className="text-sm font-semibold text-gray-700"
              >
                Staff ID or Email
              </label>
              <input
                ref={staffIdRef}
                id="staffId"
                name="staffId"
                type="text"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                onInput={(e) => setStaffId(e.currentTarget.value)}
                placeholder="staff-id@up.phinma.edu.ph"
                autoComplete="username"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#1a3a1a] focus:ring-2 focus:ring-[#1a3a1a]/10"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onInput={(e) => setPassword(e.currentTarget.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#1a3a1a] focus:ring-2 focus:ring-[#1a3a1a]/10"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleTogglePassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition focus:outline-none"
                >
                  {showPassword ? (
                    <Eye className="size-4 shrink-0 text-[#183d22]" />
                  ) : (
                    <EyeOff className="size-4 shrink-0 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-md bg-red-50 p-2.5 text-xs font-semibold text-red-600"
              >
                {error}
              </p>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-[#183d22] py-3 text-sm font-bold text-white shadow transition hover:bg-[#122e1a] active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in as Staff"}
              {!loading && <ArrowRight className="size-4 shrink-0" />}
            </button>
          </form>

          {/* Footer row */}
          <div className="mt-5 flex items-center justify-between text-xs">
            <Link
              to="/forgot-password"
              className="font-semibold text-[#c9a84c] hover:underline"
            >
              Forgot password?
            </Link>
            <span className="flex items-center gap-1.5 text-gray-400">
              <Shield className="size-3.5 shrink-0" />
              For Registrar{" "}
              <strong className="font-semibold text-gray-600">
                staff only.
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}