import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, Eye, EyeOff } from "lucide-react";
import backgroundImage from "@/assets/upang.png";

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:5000"
).replace(/\/+$/, "");

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"request" | "verify" | "reset" | "success">("request");
  const [email, setEmail] = useState("");
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

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your registered email address or account ID.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Failed to send verification code.");
        return;
      }

      if (data.email) {
        setEmail(data.email);
      }
      if (data.maskedEmail) {
        setMaskedEmail(data.maskedEmail);
      }

      setStep("verify");
      setResendCooldown(60);
    } catch (err) {
      console.error(err);
      setError("Cannot connect to server. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid or expired verification code.");
        return;
      }

      setStep("reset");
    } catch (err) {
      console.error(err);
      setError("Cannot connect to server. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

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
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to reset password.");
        return;
      }

      setStep("success");
    } catch (err) {
      console.error(err);
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
            to="/"
            className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition"
          >
            <ArrowLeft className="size-3.5" />
            Back to Sign In
          </Link>

          {step === "request" && (
            <>
              <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#c9a84c]">
                ACCOUNT RECOVERY
              </p>
              <h2 className="text-[1.75rem] font-bold tracking-tight text-[#1a3a1a]">
                Forgot password?
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Enter your registered email address or student / staff ID. We'll send a 6-digit OTP code to your registered email to verify your account.
              </p>

              <form onSubmit={handleRequestOtp} className="mt-6 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email or Student / Staff ID
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="email"
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. STAFF-001, 2026-12345, or email"
                      autoComplete="username"
                      required
                      autoFocus
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pl-10 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#1a3a1a] focus:ring-2 focus:ring-[#1a3a1a]/10"
                    />
                    <Mail className="pointer-events-none absolute left-3 size-4 text-gray-400" />
                  </div>
                </div>

                {error && (
                  <p role="alert" className="rounded-md bg-red-50 p-2.5 text-xs font-semibold text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#183d22] py-3 text-sm font-bold text-white shadow transition hover:bg-[#122e1a] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {loading ? "Sending OTP..." : "Send Verification Code"}
                  {!loading && <ArrowRight className="size-4 shrink-0" />}
                </button>
              </form>
            </>
          )}

          {step === "verify" && (
            <>
              <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#c9a84c]">
                STEP 2 OF 3: EMAIL VERIFICATION
              </p>
              <h2 className="text-[1.75rem] font-bold tracking-tight text-[#1a3a1a]">
                Enter 6-digit OTP
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                We sent a 6-digit verification code to <strong className="text-gray-900 font-semibold">{maskedEmail || email}</strong>.
                Please check your Gmail inbox and enter the code below.
              </p>

              <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="otp" className="text-sm font-semibold text-gray-700">
                    6-Digit Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    required
                    autoFocus
                    className="w-full text-center font-mono text-2xl font-bold tracking-[0.4em] rounded-lg border border-gray-300 px-4 py-2.5 text-gray-800 placeholder-gray-300 outline-none transition focus:border-[#1a3a1a] focus:ring-2 focus:ring-[#1a3a1a]/10"
                  />
                </div>

                {error && (
                  <p role="alert" className="rounded-md bg-red-50 p-2.5 text-xs font-semibold text-red-600">
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Didn't receive code?</span>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={handleRequestOtp}
                    className="font-semibold text-[#183d22] hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#183d22] py-3 text-sm font-bold text-white shadow transition hover:bg-[#122e1a] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                  {!loading && <ArrowRight className="size-4 shrink-0" />}
                </button>
              </form>
            </>
          )}

          {step === "reset" && (
            <>
              <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#c9a84c]">
                STEP 3 OF 3: NEW PASSWORD
              </p>
              <h2 className="text-[1.75rem] font-bold tracking-tight text-[#1a3a1a]">
                Create new password
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Your email has been authenticated. Choose a new password for your account.
              </p>

              <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                    >
                      {showPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
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
                  <p role="alert" className="rounded-md bg-red-50 p-2.5 text-xs font-semibold text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#183d22] py-3 text-sm font-bold text-white shadow transition hover:bg-[#122e1a] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {loading ? "Resetting password..." : "Reset Password"}
                  {!loading && <ArrowRight className="size-4 shrink-0" />}
                </button>
              </form>
            </>
          )}

          {step === "success" && (
            <div className="py-2 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-green-100 text-[#183d22]">
                <CheckCircle2 className="size-8" />
              </div>

              <h3 className="text-xl font-bold text-[#1a3a1a]">
                Password reset complete!
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Your password has been securely updated. You can now sign in with your new credentials.
              </p>

              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate({ to: "/" })}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#183d22] py-3 text-sm font-bold text-white shadow transition hover:bg-[#122e1a] cursor-pointer"
                >
                  Sign in as Student <ArrowRight className="size-4 shrink-0" />
                </button>
                <Link
                  to="/staff-login"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                >
                  Sign in as Registrar Staff
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
