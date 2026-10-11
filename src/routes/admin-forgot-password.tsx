import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  Shield,
  Eye,
  EyeOff,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import backgroundImage from "@/assets/upang.png";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && !window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1")
    ? ""
    : "http://localhost:5000")
).replace(/\/+$/, "");

export const Route = createFileRoute("/admin-forgot-password")({
  component: AdminForgotPasswordPage,
});

function AdminForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"request" | "verify" | "reset" | "success">(
    "request"
  );
  const [identifier, setIdentifier] = useState("");
  const [resolvedEmail, setResolvedEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Request OTP from backend for Admin account
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your Admin ID or registered email.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          role: "admin",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Failed to send admin verification code.");
        return;
      }

      setResolvedEmail(data.email || identifier.trim());
      setMaskedEmail(data.maskedEmail || data.email || identifier.trim());
      setStep("verify");
      setResendCooldown(60);
    } catch (err) {
      console.error("Admin OTP request error:", err);
      setError("Cannot connect to server. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resolvedEmail || identifier.trim(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Invalid or expired verification code.");
        return;
      }

      setStep("reset");
    } catch (err) {
      console.error("Admin OTP verify error:", err);
      setError("Cannot connect to server. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set and confirm new admin password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resolvedEmail || identifier.trim(),
          otp: otp.trim(),
          newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Failed to reset administrator password.");
        return;
      }

      setStep("success");
    } catch (err) {
      console.error("Admin password reset error:", err);
      setError("Cannot connect to server. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

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

      {/* ── Transparent Navbar ── */}
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
        <div className="w-full max-w-[460px] rounded-2xl bg-white p-7 sm:p-9 shadow-2xl">
          {/* Back link */}
          <Link
            to="/admin-login"
            className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition"
          >
            <ArrowLeft className="size-3.5" />
            Back to Admin Login
          </Link>

          {/* Step 1: Request OTP */}
          {step === "request" && (
            <>
              <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#c9a84c]">
                ADMIN ACCOUNT RECOVERY
              </p>
              <h2 className="text-[1.75rem] font-bold tracking-tight text-[#1a3a1a]">
                Forgot password?
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Enter your Admin username or institutional email address. We'll send an official 6-digit verification code to your registered email inbox.
              </p>

              <form onSubmit={handleRequestOtp} className="mt-6 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="identifier"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Username or Email
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Enter your username or email"
                      autoComplete="username"
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pl-10 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#1a3a1a] focus:ring-2 focus:ring-[#1a3a1a]/10"
                    />
                    <Mail className="pointer-events-none absolute left-3 size-4 text-gray-400" />
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

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#183d22] py-3 text-sm font-bold text-white shadow transition hover:bg-[#122e1a] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {loading ? "Sending Code..." : "Send Verification Code"}
                  {!loading && <ArrowRight className="size-4 shrink-0" />}
                </button>
              </form>
            </>
          )}

          {/* Step 2: Verify OTP */}
          {step === "verify" && (
            <>
              <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#c9a84c]">
                VERIFY ADMINISTRATOR
              </p>
              <h2 className="text-[1.75rem] font-bold tracking-tight text-[#1a3a1a]">
                Enter OTP Code
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                We sent a 6-digit verification code to{" "}
                <strong className="text-gray-900 font-semibold">
                  {maskedEmail || resolvedEmail || identifier}
                </strong>
                . Please check your inbox or spam folder.
              </p>

              <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="otp"
                    className="text-sm font-semibold text-gray-700"
                  >
                    6-Digit Verification Code
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="otp"
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="000000"
                      required
                      autoFocus
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center font-mono text-2xl font-bold tracking-[0.35em] text-[#183d22] placeholder-gray-300 outline-none transition focus:border-[#1a3a1a] focus:ring-2 focus:ring-[#1a3a1a]/10"
                    />
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

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#183d22] py-3 text-sm font-bold text-white shadow transition hover:bg-[#122e1a] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                  {!loading && <ArrowRight className="size-4 shrink-0" />}
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("request");
                      setError("");
                    }}
                    className="font-medium text-gray-500 hover:text-gray-800 transition"
                  >
                    Change Admin ID
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={handleRequestOtp}
                    className="inline-flex items-center gap-1 font-semibold text-[#c9a84c] hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    <RotateCcw className="size-3" />
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend Code"}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 3: Reset Password */}
          {step === "reset" && (
            <>
              <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#c9a84c]">
                SECURE CREDENTIALS
              </p>
              <h2 className="text-[1.75rem] font-bold tracking-tight text-[#1a3a1a]">
                New Admin Password
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Create a strong new password for your administrator account.
              </p>

              <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="newPassword"
                    className="text-sm font-semibold text-gray-700"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      autoFocus
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#1a3a1a] focus:ring-2 focus:ring-[#1a3a1a]/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <Eye className="size-4 text-[#183d22]" />
                      ) : (
                        <EyeOff className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#1a3a1a] focus:ring-2 focus:ring-[#1a3a1a]/10"
                  />
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-md bg-red-50 p-2.5 text-xs font-semibold text-red-600"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#183d22] py-3 text-sm font-bold text-white shadow transition hover:bg-[#122e1a] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  <KeyRound className="size-4 shrink-0" />
                  {loading ? "Updating Password..." : "Update Admin Password"}
                </button>
              </form>
            </>
          )}

          {/* Step 4: Success confirmation */}
          {step === "success" && (
            <div className="py-2 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="size-8" />
              </div>

              <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#c9a84c]">
                SUCCESSFULLY UPDATED
              </p>
              <h3 className="text-xl font-bold text-[#1a3a1a]">
                Password Reset Complete
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Your administrator password has been updated in the database. You can now access the Admin Portal with your new credentials.
              </p>

              <div className="mt-6 flex flex-col gap-2.5">
                <Link
                  to="/admin-login"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#183d22] py-3 text-sm font-bold text-white shadow transition hover:bg-[#122e1a] cursor-pointer"
                >
                  Proceed to Admin Sign In
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="mt-7 flex items-center justify-center gap-1.5 border-t border-gray-100 pt-4 text-xs text-gray-400">
            <Shield className="size-3.5 shrink-0" />
            <span>
              For System{" "}
              <strong className="font-semibold text-gray-600">
                admin only.
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
