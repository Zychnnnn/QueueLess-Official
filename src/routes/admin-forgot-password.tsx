import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, Shield } from "lucide-react";
import backgroundImage from "@/assets/upang.png";

export const Route = createFileRoute("/admin-forgot-password")({
  component: AdminForgotPasswordPage,
});

function AdminForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your admin ID or institutional email.");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate sending reset instructions
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
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
        <div className="w-full max-w-[460px] rounded-2xl bg-white p-7 sm:p-9 shadow-2xl">
          {/* Back link */}
          <Link
            to="/admin-login"
            className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition"
          >
            <ArrowLeft className="size-3.5" />
            Back to Admin Login
          </Link>

          {!submitted ? (
            <>
              {/* Header */}
              <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#c9a84c]">
                ADMIN ACCOUNT RECOVERY
              </p>
              <h2 className="text-[1.75rem] font-bold tracking-tight text-[#1a3a1a]">
                Forgot password?
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Enter your admin ID or institutional email address. We'll send you verification instructions to reset your password.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="identifier"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Admin ID or Email
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="admin@up.phinma.edu.ph"
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
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#183d22] py-3 text-sm font-bold text-white shadow transition hover:bg-[#122e1a] active:scale-[0.99] disabled:opacity-60"
                >
                  {loading ? "Sending link..." : "Send Reset Link"}
                  {!loading && <ArrowRight className="size-4 shrink-0" />}
                </button>
              </form>
            </>
          ) : (
            /* Success confirmation */
            <div className="py-2 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-green-100 text-[#183d22]">
                <CheckCircle2 className="size-7" />
              </div>

              <h3 className="text-xl font-bold text-[#1a3a1a]">
                Check your email
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                We've sent password reset instructions to{" "}
                <strong className="text-gray-900 font-semibold">{identifier}</strong>.
                Please follow the link in the message to create a new password.
              </p>

              <div className="mt-6 flex flex-col gap-2.5">
                <Link
                  to="/admin-login"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#183d22] py-3 text-sm font-bold text-white shadow transition hover:bg-[#122e1a]"
                >
                  Return to Sign In
                </Link>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition py-1"
                >
                  Didn't receive an email? Try again
                </button>
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
