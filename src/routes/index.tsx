import { createFileRoute } from "@tanstack/react-router";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Edit3,
  Eye,
  FileCheck2,
  FilePlus2,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  Settings2,
  Shield,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import backgroundImage from "@/assets/upang.png";

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:5000"
).replace(/\/+$/, "");

type StaffApiResponse = {
  message?: string;
  user?: {
    name: string;
    studentId: string;
  };
};

async function readApiResponse(
  response: Response
): Promise<StaffApiResponse> {
  const body = await response.text();

  if (!body) {
    return {};
  }

  const contentType =
    response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      `The API returned a non-JSON response (HTTP ${response.status}).`
    );
  }

  try {
    return JSON.parse(body) as StaffApiResponse;
  } catch {
    throw new Error(
      `The API returned invalid JSON (HTTP ${response.status}).`
    );
  }
}

type Role = "student" | "staff" | "admin";

type View =
  | "dashboard"
  | "new"
  | "requests"
  | "users"
  | "documents";

type Status =
  | "Pending"
  | "Processing"
  | "Ready for Claiming"
  | "Claimed"
  | "Needs Correction";

type Priority = "Regular" | "Priority" | "Urgent";

type RequestItem = {
  id: string;
  student: string;
  studentId: string;
  document: string;
  purpose: string;
  date: string;
  status: Status;
  remarks?: string;
  lineNumber?: number;
  priority?: Priority;
  copies?: number;
  pickupDate?: string;
};

type Flash = {
  tone: "success" | "error";
  text: string;
} | null;

type AuthUser = {
  id: string;
  name: string;
  studentId: string;
  email: string;
  role: Role;
};

const initialRequests: RequestItem[] = [
  {
    id: "QLR-2026-001",
    student: "Juan Dela Cruz",
    studentId: "2022-10045",
    document: "Transcript of Records (TOR)",
    purpose: "Scholarship",
    date: "Sep 18, 2026",
    status: "Ready for Claiming",
  },
  {
    id: "QLR-2026-002",
    student: "Maria Santos",
    studentId: "2022-10412",
    document: "Certificate of Good Moral",
    purpose: "Employment",
    date: "Sep 19, 2026",
    status: "Processing",
  },
  {
    id: "QLR-2026-003",
    student: "Angel Ferrer",
    studentId: "2021-10008",
    document: "Certificate of Grades",
    purpose: "Transfer",
    date: "Sep 16, 2026",
    status: "Claimed",
  },
  {
    id: "QLR-2026-004",
    student: "Juan Dela Cruz",
    studentId: "2022-10045",
    document: "Certificate of Enrollment",
    purpose: "Scholarship",
    date: "Sep 20, 2026",
    status: "Pending",
  },
  {
    id: "QLR-2026-005",
    student: "Eunice Agnas",
    studentId: "2022-10230",
    document: "Diploma Copy",
    purpose: "Employment",
    date: "Sep 20, 2026",
    status: "Needs Correction",
    remarks: "Please confirm your graduation year.",
  },
];

const documentTypes = [
  "Transcript of Records (TOR)",
  "Certificate of Good Moral",
  "Certificate of Grades",
  "Certificate of Enrollment",
  "Diploma Copy",
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "QueueLess Registrar | PHINMA UPang",
      },
      {
        name: "description",
        content:
          "Request, track, and manage registrar documents online at PHINMA University of Pangasinan.",
      },
      {
        property: "og:title",
        content: "QueueLess Registrar | PHINMA UPang",
      },
      {
        property: "og:description",
        content: "Your school documents, without the long wait.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
  }),
  component: QueueLessApp,
});

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <img
        src="/phinma.png"
        alt="QueueLess Logo"
        className="size-11 shrink-0 object-contain"
      />

      <div className="min-w-0">
        <p
          className={`truncate text-lg font-extrabold leading-none ${
            inverse
              ? "text-primary-foreground"
              : "text-primary"
          }`}
        >
          QueueLess
        </p>

        <p
          className={`mt-1 truncate text-[10px] font-bold uppercase ${
            inverse
              ? "text-primary-foreground/70"
              : "text-muted-foreground"
          }`}
        >
          Registrar services
        </p>
      </div>
    </div>
  );
}

function QueueLessApp() {
  const [role, setRole] = useState<Role>("student");
  const [signedIn, setSignedIn] = useState(false);

  const [currentUser, setCurrentUser] =
    useState<AuthUser | null>(null);

  const [view, setView] = useState<View>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  const [requests, setRequests] =
    useState<RequestItem[]>(initialRequests);

  const [requestsLoading, setRequestsLoading] =
    useState(false);

  const [flash, setFlash] = useState<Flash>(null);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  /*
   * Restore saved login session.
   */
  useEffect(() => {
    const savedUser =
      localStorage.getItem("queueless_user");

    const savedToken =
      localStorage.getItem("queueless_token");

    /*
     * If either the user or token is missing,
     * do not restore the session.
     */
    if (!savedUser || !savedToken) {
      localStorage.removeItem("queueless_user");
      localStorage.removeItem("queueless_token");
      return;
    }

    try {
      const user: AuthUser =
        JSON.parse(savedUser);

      setCurrentUser(user);
      setRole(user.role);
      setSignedIn(true);

      const loadSavedRequests = async () => {
        try {
          setRequestsLoading(true);

          const token =
            localStorage.getItem(
              "queueless_token"
            );

          if (!token) {
            throw new Error(
              "Authentication token not found."
            );
          }

          const response = await fetch(
            `${API_URL}/api/requests`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

          const result =
            await response.json();

          if (!response.ok) {
            throw new Error(
              result.message ||
                "Failed to load requests."
            );
          }

          const loadedRequests: RequestItem[] =
            result.map((request: any, idx: number) => ({
              id: request.requestNumber,
              student: request.student,
              studentId: request.studentId,
              document: request.document,
              purpose: request.purpose,
              date: request.date,
              status: request.status,
              remarks: request.remarks || "",
              lineNumber: request.lineNumber ?? idx + 1,
              priority: (request.priority as Priority) || "Regular",
              copies: request.copies || 1,
              pickupDate: request.pickupDate || "",
            }));

          setRequests(
            loadedRequests
          );
        } catch (error) {
          console.error(
            "Restore requests error:",
            error
          );

          /*
           * If the token is invalid or expired,
           * clear the saved session.
           */
          if (
            error instanceof Error &&
            error.message.includes(
              "token"
            )
          ) {
            localStorage.removeItem(
              "queueless_user"
            );

            localStorage.removeItem(
              "queueless_token"
            );

            setSignedIn(false);
            setCurrentUser(null);
          }
        } finally {
          setRequestsLoading(false);
        }
      };

      loadSavedRequests();
    } catch (error) {
      console.error(
        "Restore login error:",
        error
      );

      localStorage.removeItem(
        "queueless_user"
      );

      localStorage.removeItem(
        "queueless_token"
      );
    }
  }, []);

  /*
   * Called after successful login.
   */
  const handleSignIn = async (
    user: AuthUser
  ) => {
    setCurrentUser(user);
    setRole(user.role);
    setSignedIn(true);

    localStorage.setItem(
      "queueless_user",
      JSON.stringify(user)
    );

    setFlash({
      tone: "success",
      text: `Welcome to QueueLess, ${user.name}. You are now signed in.`,
    });

    try {
      setRequestsLoading(true);

      const token =
        localStorage.getItem(
          "queueless_token"
        );

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const response = await fetch(
        `${API_URL}/api/requests`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to load requests."
        );
      }

      const loadedRequests: RequestItem[] =
        result.map((request: any, idx: number) => ({
          id: request.requestNumber,
          student: request.student,
          studentId: request.studentId,
          document: request.document,
          purpose: request.purpose,
          date: request.date,
          status: request.status,
          remarks: request.remarks || "",
          lineNumber: request.lineNumber ?? idx + 1,
          priority: (request.priority as Priority) || "Regular",
          copies: request.copies || 1,
          pickupDate: request.pickupDate || "",
        }));

      setRequests(
        loadedRequests
      );
    } catch (error) {
      console.error(
        "Load requests error:",
        error
      );
    } finally {
      setRequestsLoading(false);
    }
  };

  /*
   * Notifications.
   */
  const notifications = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return requests
      .filter(
        (request) =>
          request.studentId ===
          currentUser.studentId
      )
      .slice(0, 5)
      .map((request) => {
        if (
          request.status ===
          "Ready for Claiming"
        ) {
          return {
            title:
              "Request ready for claiming",
            text: `${request.id} can now be claimed at the Registrar's Office.`,
          };
        }

        if (
          request.status ===
          "Processing"
        ) {
          return {
            title:
              "Request is being processed",
            text: `${request.id} is currently being processed by the Registrar's Office.`,
          };
        }

        if (
          request.status === "Claimed"
        ) {
          return {
            title: "Request claimed",
            text: `${request.id} has been marked as claimed.`,
          };
        }

        if (
          request.status ===
          "Needs Correction"
        ) {
          return {
            title: "Correction needed",
            text: `${request.id} needs correction. Please check your request details.`,
          };
        }

        return {
          title: "Request submitted",
          text: `${request.id} was received and is waiting for review.`,
        };
      });
  }, [requests, currentUser]);

  if (!signedIn) {
    return (
      <AuthScreen
        onSignIn={handleSignIn}
      />
    );
  }

  const name =
    currentUser?.name ||
    "QueueLess User";

  const navigate = (next: View) => {
    setView(next);
    setMenuOpen(false);
    setFlash(null);
  };

  /*
   * Sign out clears BOTH user and JWT.
   */
  const signOut = () => {
    localStorage.removeItem(
      "queueless_user"
    );

    localStorage.removeItem(
      "queueless_token"
    );

    setSignedIn(false);
    setCurrentUser(null);
    setView("dashboard");
    setMenuOpen(false);
    setNotificationsOpen(false);
    setFlash(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between px-4 sm:px-6">
          <Brand />

          <div className="relative flex items-center gap-1">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                onClick={() =>
                  setNotificationsOpen(
                    !notificationsOpen
                  )
                }
                className="relative"
              >
                <Bell />

                {notifications.length > 0 && (
                  <span className="absolute right-1 top-1 size-2 rounded-full bg-destructive" />
                )}
              </Button>

              {notificationsOpen && (
                <div className="absolute right-0 top-13 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-md border border-border bg-card p-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-lg font-bold">
                      Notifications
                    </p>

                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Close notifications"
                      onClick={() =>
                        setNotificationsOpen(
                          false
                        )
                      }
                    >
                      <X />
                    </Button>
                  </div>

                  <div className="mt-3 space-y-3">
                    {notifications.length > 0 ? (
                      notifications.map(
                        (
                          notification,
                          index
                        ) => (
                          <Notice
                            key={`${notification.title}-${index}`}
                            title={
                              notification.title
                            }
                            text={
                              notification.text
                            }
                          />
                        )
                      )
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No notifications yet.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
              onClick={() =>
                setMenuOpen(!menuOpen)
              }
            >
              {menuOpen ? (
                <X />
              ) : (
                <Menu />
              )}
            </Button>

            <div className="ml-2 hidden items-center gap-3 border-l border-border pl-4 md:flex">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <UserRound className="size-4" />
              </div>

              <div>
                <p className="text-sm font-bold">
                  {name}
                </p>

                <p className="text-xs capitalize text-muted-foreground">
                  {role === "staff"
                    ? "Registrar staff"
                    : role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        <aside
          className={`${
            menuOpen
              ? "fixed inset-x-0 top-18 z-20 flex"
              : "hidden"
          } min-h-[calc(100vh-4.5rem)] w-full flex-col border-r border-border bg-card p-4 md:sticky md:top-18 md:flex md:w-64 md:shrink-0`}
        >
          <p className="px-3 pb-3 pt-2 text-[10px] font-bold uppercase text-muted-foreground">
            Workspace
          </p>

          <nav className="space-y-1">
            <NavButton
              active={
                view === "dashboard"
              }
              icon={<LayoutDashboard />}
              label="Dashboard"
              onClick={() =>
                navigate("dashboard")
              }
            />

            {role === "student" && (
              <>
                <NavButton
                  active={view === "new"}
                  icon={<FilePlus2 />}
                  label="New request"
                  onClick={() =>
                    navigate("new")
                  }
                />

                <NavButton
                  active={
                    view === "requests"
                  }
                  icon={<ClipboardList />}
                  label="My requests"
                  onClick={() =>
                    navigate("requests")
                  }
                />
              </>
            )}

            {role === "staff" && (
              <NavButton
                active={
                  view === "requests"
                }
                icon={<ClipboardCheck />}
                label="Manage requests"
                onClick={() =>
                  navigate("requests")
                }
              />
            )}

            {role === "admin" && (
              <>
                <NavButton
                  active={
                    view === "users"
                  }
                  icon={<UsersRound />}
                  label="User accounts"
                  onClick={() =>
                    navigate("users")
                  }
                />

                <NavButton
                  active={
                    view === "documents"
                  }
                  icon={<FileText />}
                  label="Document types"
                  onClick={() =>
                    navigate("documents")
                  }
                />
              </>
            )}
          </nav>

          <div className="mt-auto border-t border-border pt-4">
            <div className="mb-4 rounded-md bg-muted p-3">
              <p className="text-xs font-bold">
                Need help?
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Visit the Registrar's Office
                during campus hours.
              </p>
            </div>

            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={signOut}
            >
              <LogOut /> Sign out
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-7 lg:p-10">
          {flash && (
            <FlashMessage
              flash={flash}
              onClose={() =>
                setFlash(null)
              }
            />
          )}

          {role === "student" ? (
            <StudentView
              view={view}
              navigate={navigate}
              requests={requests}
              setRequests={setRequests}
              setFlash={setFlash}
              currentUser={currentUser}
            />
          ) : role === "staff" ? (
            <StaffView
              view={view}
              navigate={navigate}
              requests={requests}
              setRequests={setRequests}
              setFlash={setFlash}
            />
          ) : (
            <AdminView
              view={view}
              navigate={navigate}
              requests={requests}
              setFlash={setFlash}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function AuthScreen({
  onSignIn,
}: {
  onSignIn: (user: AuthUser) => void;
}) {
  const [mode, setMode] =
    useState<"login" | "register">(
      "login"
    );

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const submitLogin = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");

    const data = new FormData(
      e.currentTarget
    );

    const email = String(
      data.get("identity") ?? ""
    ).trim();

    const password = String(
      data.get("password") ?? ""
    );

    if (!email || password.length < 6) {
      setError(
        "Enter your email and a password with at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        setError(
          result.message ||
            "Login failed."
        );
        return;
      }

      if (!result.user) {
        setError(
          "Login succeeded, but no user information was returned."
        );
        return;
      }

      /*
       * IMPORTANT:
       * Save the JWT returned by the backend.
       */
      if (!result.token) {
        setError(
          "Login succeeded, but no authentication token was returned."
        );
        return;
      }

      localStorage.setItem(
        "queueless_token",
        result.token
      );

      /*
       * Backend decides the actual role.
       */
      onSignIn({
        id: result.user.id,
        name: result.user.name,
        studentId:
          result.user.studentId,
        email: result.user.email,
        role: result.user.role,
      });
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        "Cannot connect to the server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");

    const data = new FormData(
      e.currentTarget
    );

    const fullName = String(
      data.get("fullName") ?? ""
    ).trim();

    const studentId = String(
      data.get("studentId") ?? ""
    ).trim();

    const email = String(
      data.get("email") ?? ""
    ).trim();

    const password = String(
      data.get("password") ?? ""
    );

    const confirmPassword = String(
      data.get("confirmPassword") ?? ""
    );

    if (
      !studentId.match(
        /^\d{4}-\d{5}$/
      )
    ) {
      setError(
        "Use the Student ID format 2022-10045."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Password and Confirm Password must match."
      );
      return;
    }

    if (
      !fullName ||
      !email
    ) {
      setError(
        "Please complete all required fields."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: fullName,
            studentId,
            email,
            password,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        setError(
          result.message ||
            "Registration failed."
        );
        return;
      }

      setError("");
      setMode("login");
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        "Cannot connect to the server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-primary">
      <img
        src={backgroundImage}
        alt="University campus"
        width={1600}
        height={1200}
        className="absolute inset-0 size-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-primary/65 via-primary/35 to-primary/10" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-5 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <section className="hidden max-w-xl text-primary-foreground lg:block">
          <Brand inverse />

          <p className="mt-20 text-xs font-bold uppercase text-secondary">
            PHINMA University of Pangasinan
          </p>

          <h1 className="mt-4 font-display text-6xl font-bold leading-[1.02]">
            Your documents,
            <br />
            without the long wait.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-primary-foreground/80">
            Request school documents
            online, track every update,
            and know exactly when they
            are ready for claiming.
          </p>

          <div className="mt-10 flex gap-8 border-t border-primary-foreground/20 pt-6">
            <MiniStat
              value="Online"
              label="Document requests"
            />

            <MiniStat
              value="Live"
              label="Status tracking"
            />

            <MiniStat
              value="Secure"
              label="Role access"
            />
          </div>
        </section>

        <section className="animate-rise rounded-lg border border-border bg-card p-6 shadow-2xl sm:p-9">
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>

          {mode === "login" ? (
            <>
              <p className="text-xs font-bold uppercase text-primary">
                Welcome back
              </p>

              <h2 className="mt-2 font-display text-3xl font-bold">
                Sign in to QueueLess
              </h2>

              <form
                className="mt-6 space-y-5"
                onSubmit={submitLogin}
              >
                <Field label="Email">
                  <input
                    name="identity"
                    type="email"
                    autoComplete="username"
                    className="field"
                    placeholder="name@up.phinma.edu.ph"
                    required
                  />
                </Field>

                <Field label="Password">
                  <input
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    className="field"
                    placeholder="Enter your password"
                    required
                  />
                </Field>

                {error && (
                  <InlineError
                    text={error}
                  />
                )}

                <Button
                  size="lg"
                  className="w-full"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Signing in..."
                    : "Sign in"}

                  {!loading && (
                    <ArrowRight />
                  )}
                </Button>
              </form>

              <div className="mt-5 flex items-center justify-between gap-4 text-xs">
                <span className="text-muted-foreground">
                  New student?
                </span>

                <Button
                  variant="link"
                  className="h-auto p-0"
                  type="button"
                  onClick={() => {
                    setMode(
                      "register"
                    );
                    setError("");
                  }}
                >
                  Create an account
                </Button>
              </div>
            </>
          ) : (
            <Registration
              onBack={() => {
                setMode("login");
                setError("");
              }}
              onSubmit={submitRegister}
              error={error}
              loading={loading}
            />
          )}
        </section>
      </div>
    </main>
  );
}

function Registration({
  onBack,
  onSubmit,
  error,
  loading,
}: {
  onBack: () => void;
  onSubmit: (
    e: FormEvent<HTMLFormElement>
  ) => void;
  error: string;
  loading: boolean;
}) {
  return (
    <>
      <Button
        variant="ghost"
        className="-ml-3"
        type="button"
        onClick={onBack}
      >
        <ArrowLeft /> Back to sign in
      </Button>

      <p className="mt-5 text-xs font-bold uppercase text-primary">
        Student registration
      </p>

      <h2 className="mt-2 font-display text-3xl font-bold">
        Create your account
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Use your official student
        information.
      </p>

      <form
        className="mt-6 grid gap-4 sm:grid-cols-2"
        onSubmit={onSubmit}
      >
        <div className="sm:col-span-2">
          <Field label="Full Name">
          <input
            name="fullName"
            required
            className="field"
            placeholder="Juan Dela Cruz"
          />
          </Field>
        </div>

        <Field label="Student ID">
          <input
            name="studentId"
            required
            className="field"
            placeholder="2022-10045"
          />
        </Field>

        <Field label="School email">
          <input
            name="email"
            type="email"
            required
            className="field"
            placeholder="name@up.phinma.edu.ph"
          />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Password">
            <input
              name="password"
              type="password"
              required
              className="field"
              placeholder="At least 8 characters"
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Confirm Password">
            <input
              name="confirmPassword"
              type="password"
              required
              className="field"
              placeholder="Re-enter your password"
            />
          </Field>
        </div>

        {error && (
          <div className="sm:col-span-2">
            <InlineError text={error} />
          </div>
        )}

        <Button
          size="lg"
          type="submit"
          className="sm:col-span-2"
          disabled={loading}
        >
          {loading
            ? "Creating account..."
            : "Create student account"}

          {!loading && (
            <ArrowRight />
          )}
        </Button>
      </form>
    </>
  );
}

function StudentView({
  view,
  navigate,
  requests,
  setRequests,
  setFlash,
  currentUser,
}: {
  view: View;
  navigate: (v: View) => void;
  requests: RequestItem[];
  setRequests: (r: RequestItem[]) => void;
  setFlash: (f: Flash) => void;
  currentUser: AuthUser | null;
}) {
  if (!currentUser) {
    return null;
  }

  const mine = requests.filter(
    (r) =>
      r.studentId ===
      currentUser.studentId
  );

  if (view === "new") {
    return (
      <NewRequest
        currentUser={currentUser}
        onBack={() =>
          navigate("dashboard")
        }
        onSubmit={(item) => {
          setRequests([
            item,
            ...requests,
          ]);

          setFlash({
            tone: "success",
            text: `Request ${item.id} submitted. Your digital receipt is ready below.`,
          });

          navigate("requests");
        }}
      />
    );
  }

  if (view === "requests") {
    return (
      <RequestList
        title="My document requests"
        subtitle="Track current requests and review your request history."
        requests={mine}
        student
      />
    );
  }

  return (
    <div className="animate-rise">
      <PageHeading
        eyebrow="Student dashboard"
        title={`Good day, ${currentUser.name}!`}
        text={`Student ID ${currentUser.studentId} · Manage your registrar documents here.`}
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <ActionPanel
          icon={<FilePlus2 />}
          title="Request a document"
          text="Submit a school document request from anywhere."
          action="Start new request"
          onClick={() =>
            navigate("new")
          }
          primary
        />

        <ActionPanel
          icon={<Search />}
          title="Track my request"
          text="See progress, corrections, and claiming updates."
          action="View my requests"
          onClick={() =>
            navigate("requests")
          }
        />
      </div>

      <section className="mt-10">
        <SectionTitle
          eyebrow="Request overview"
          title="Your activity"
        />

        <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Metric
            label="Total requests"
            value={mine.length}
            icon={<FileText />}
          />

          <Metric
            label="Pending"
            value={
              mine.filter(
                (r) =>
                  r.status ===
                  "Pending"
              ).length
            }
            icon={<Clock3 />}
          />

          <Metric
            label="In progress"
            value={
              mine.filter(
                (r) =>
                  r.status ===
                  "Processing"
              ).length
            }
            icon={<ClipboardList />}
          />

          <Metric
            label="Ready to claim"
            value={
              mine.filter(
                (r) =>
                  r.status ===
                  "Ready for Claiming"
              ).length
            }
            icon={<CheckCircle2 />}
          />
        </div>
      </section>

      <section className="mt-10">
        <SectionTitle
          eyebrow="Recent activity"
          title="Latest requests"
          action="View all"
          onAction={() =>
            navigate("requests")
          }
        />

        <div className="mt-4">
          <RequestCards
            requests={mine.slice(0, 2)}
          />
        </div>
      </section>
    </div>
  );
}

function NewRequest({
  currentUser,
  onBack,
  onSubmit,
}: {
  currentUser: AuthUser;
  onBack: () => void;
  onSubmit: (
    r: RequestItem
  ) => void;
}) {
  const [doc, setDoc] = useState(
    documentTypes[0]
  );

  const [purpose, setPurpose] =
    useState("");

  const [remarks, setRemarks] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const submit = async (
    e: FormEvent
  ) => {
    e.preventDefault();
    setError("");

    if (purpose.trim().length < 3) {
      setError(
        "Please provide a valid purpose for this request."
      );
      return;
    }

    const requestNumber = `QLR-2026-${String(
      Date.now()
    ).slice(-4)}`;

    const today = new Date();

    const date =
      today.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }
      );

    try {
      setLoading(true);

      const token =
        localStorage.getItem(
          "queueless_token"
        );

      /*
       * JWT is required for protected request creation.
       */
      if (!token) {
        setError(
          "You are not authenticated. Please sign in again."
        );
        return;
      }

      console.log(
        "QUEUELESS DEBUG:",
        {
          currentUser,
          requestNumber,
          student:
            currentUser.name,
          studentId:
            currentUser.studentId,
          document: doc,
          purpose:
            purpose.trim(),
          remarks:
            remarks.trim(),
          date,
        }
      );

      const response =
        await fetch(
          `${API_URL}/api/requests`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              requestNumber,

              /*
               * These are sent for UI compatibility.
               * The backend does NOT trust them.
               * The backend gets the real student identity
               * from req.user.id in the JWT.
               */
              student:
                currentUser.name,

              studentId:
                currentUser.studentId,

              document: doc,

              purpose:
                purpose.trim(),

              remarks:
                remarks.trim(),

              date,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        setError(
          result.message ||
            "Failed to submit request."
        );
        return;
      }

      const savedRequest: RequestItem = {
        id: result.request.requestNumber,
        student: result.request.student,
        studentId: result.request.studentId,
        document: result.request.document,
        purpose: result.request.purpose,
        remarks: result.request.remarks || "",
        date: result.request.date,
        status: result.request.status,
        lineNumber: result.request.lineNumber,
        priority: result.request.priority || "Regular",
        copies: result.request.copies || 1,
        pickupDate: result.request.pickupDate || "",
      };

      onSubmit(savedRequest);
    } catch (error) {
      console.error(
        "Request submission error:",
        error
      );

      setError(
        "Cannot connect to the server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-rise max-w-4xl">
      <Button
        variant="ghost"
        className="-ml-3"
        onClick={onBack}
      >
        <ArrowLeft /> Back to dashboard
      </Button>

      <PageHeading
        eyebrow="New request"
        title="Request a document"
        text="Complete the details below. Required fields are marked with an asterisk."
      />

      <form
        onSubmit={submit}
        className="mt-8 space-y-9"
      >
        <fieldset>
          <legend className="font-display text-xl font-bold">
            1. Choose your document *
          </legend>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {documentTypes.map(
              (d) => (
                <label
                  key={d}
                  className={`cursor-pointer rounded-md border p-4 transition ${
                    doc === d
                      ? "border-primary bg-accent"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="document"
                    value={d}
                    checked={doc === d}
                    onChange={() =>
                      setDoc(d)
                    }
                    className="mr-3 accent-primary"
                  />

                  <span className="text-sm font-bold">
                    {d}
                  </span>
                </label>
              )
            )}
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-display text-xl font-bold">
            2. Request details
          </legend>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Purpose of request *">
              <select
                value={purpose}
                onChange={(e) =>
                  setPurpose(
                    e.target.value
                  )
                }
                className="field"
              >
                <option value="">
                  Select a purpose
                </option>

                <option>
                  Scholarship application
                </option>

                <option>
                  Employment
                </option>

                <option>
                  Transfer
                </option>

                <option>
                  Board examination
                </option>

                <option>
                  Personal record
                </option>
              </select>
            </Field>

            <Field label="Number of copies">
              <select className="field">
                <option>
                  1 copy
                </option>

                <option>
                  2 copies
                </option>

                <option>
                  3 copies
                </option>
              </select>
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Additional remarks (optional)">
              <textarea
                value={remarks}
                onChange={(e) =>
                  setRemarks(
                    e.target.value
                  )
                }
                className="field min-h-28 py-3"
                placeholder="Add details the Registrar should know"
              />
            </Field>
          </div>

          {error && (
            <div className="mt-4">
              <InlineError
                text={error}
              />
            </div>
          )}
        </fieldset>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            size="lg"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Submitting request..."
              : "Submit request"}

            {!loading && (
              <ArrowRight />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function StaffView({
  view,
  navigate,
  requests,
  setRequests,
  setFlash,
}: {
  view: View;
  navigate: (v: View) => void;
  requests: RequestItem[];
  setRequests: (
    r: RequestItem[]
  ) => void;
  setFlash: (f: Flash) => void;
}) {
  if (view === "requests") {
    return (
      <ManageRequests
        requests={requests}
        setRequests={setRequests}
        setFlash={setFlash}
      />
    );
  }

  return (
    <div className="animate-rise">
      <PageHeading
        eyebrow="Registrar workspace"
        title="Request operations"
        text="Review, process, and complete student document requests."
      />

      <div className="mt-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric
          label="New requests"
          value={
            requests.filter(
              (r) =>
                r.status ===
                "Pending"
            ).length
          }
          icon={<Clock3 />}
        />

        <Metric
          label="Processing"
          value={
            requests.filter(
              (r) =>
                r.status ===
                "Processing"
            ).length
          }
          icon={<ClipboardList />}
        />

        <Metric
          label="Ready"
          value={
            requests.filter(
              (r) =>
                r.status ===
                "Ready for Claiming"
            ).length
          }
          icon={<FileCheck2 />}
        />

        <Metric
          label="Claimed"
          value={
            requests.filter(
              (r) =>
                r.status ===
                "Claimed"
            ).length
          }
          icon={<CheckCircle2 />}
        />
      </div>

      <section className="mt-10">
        <SectionTitle
          eyebrow="Registrar queue"
          title="Recent document requests"
          action="Manage all"
          onAction={() =>
            navigate("requests")
          }
        />

        <div className="mt-4">
          <RequestCards
            requests={requests.slice(
              0,
              4
            )}
          />
        </div>
      </section>
    </div>
  );
}

function DigitalReceiptModal({
  request,
  onClose,
  isStaff = false,
  onEdit,
}: {
  request: RequestItem;
  onClose: () => void;
  isStaff?: boolean;
  onEdit?: () => void;
}) {
  const lineNum = request.lineNumber ?? 1;

  const getPriorityBadge = (p?: Priority) => {
    if (p === "Urgent") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive">
          ⚡ Urgent Priority
        </span>
      );
    }
    if (p === "Priority") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
          ★ Priority Lane
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
        Regular Queue
      </span>
    );
  };

  const getQueueDescription = () => {
    if (request.status === "Ready for Claiming") {
      return "Ready for claiming! Please proceed to the registrar counter.";
    }
    if (request.status === "Processing") {
      return "Being processed right now by registrar staff (Active Priority).";
    }
    if (request.status === "Claimed") {
      return "This document request has been claimed and completed.";
    }
    if (request.status === "Needs Correction") {
      return "Correction required: please review registrar notes below.";
    }
    return `You are in line at position #${lineNum}. Track priority and status here.`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Digital Request Receipt"
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileCheck2 className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                PHINMA University of Pangasinan • Registrar
              </p>
              <h2 className="mt-0.5 font-display text-xl font-bold text-foreground">
                Digital Request Receipt
              </h2>
              <p className="text-xs text-muted-foreground">
                Official tracking document for student registrar requests
              </p>
            </div>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            aria-label="Close receipt"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Priority Line Number Banner */}
        <div className="mt-5 overflow-hidden rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center rounded-lg bg-primary px-3.5 py-2 text-primary-foreground shadow-sm min-w-[72px]">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                  Line No.
                </span>
                <span className="text-2xl font-black">#{lineNum}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">
                    Queue Sequence & Priority
                  </span>
                  {getPriorityBadge(request.priority)}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {getQueueDescription()}
                </p>
              </div>
            </div>

            <div className="shrink-0 self-start sm:self-auto">
              <StatusBadge status={request.status} />
            </div>
          </div>

          {/* Step Progress Tracker */}
          <div className="mt-4 border-t border-primary/10 pt-3">
            <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
              <div className="rounded py-1 font-semibold bg-primary text-primary-foreground">
                1. Submitted
              </div>
              <div
                className={`rounded py-1 font-semibold ${
                  request.status !== "Needs Correction"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                2. Line #{lineNum}
              </div>
              <div
                className={`rounded py-1 font-semibold ${
                  request.status === "Processing" ||
                  request.status === "Ready for Claiming" ||
                  request.status === "Claimed"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                3. Processing
              </div>
              <div
                className={`rounded py-1 font-semibold ${
                  request.status === "Ready for Claiming" ||
                  request.status === "Claimed"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                4. Claiming
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Details Grid */}
        <div className="mt-5 grid grid-cols-2 gap-4 border-y border-border py-4 text-xs">
          <ReceiptField label="Request Reference" value={request.id} />
          <ReceiptField label="Submission Date" value={request.date} />
          <ReceiptField label="Student Name" value={request.student} />
          <ReceiptField label="Student ID Number" value={request.studentId} />
          <ReceiptField label="Document Requested" value={request.document} />
          <ReceiptField
            label="Number of Copies"
            value={`${request.copies || 1} copy`}
          />
          <ReceiptField label="Purpose" value={request.purpose} />
          <ReceiptField
            label="Pickup Window / Schedule"
            value={request.pickupDate || "Standard registrar schedule"}
          />
        </div>

        {/* Registrar Instructions / Notes */}
        {request.remarks && (
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-200">
            <p className="font-bold flex items-center gap-1.5">
              <span>📋 Registrar Notes & Counter Instructions:</span>
            </p>
            <p className="mt-1 font-medium">{request.remarks}</p>
          </div>
        )}

        {/* Digital Verification & Stamp */}
        <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 p-3 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded bg-foreground/5 text-foreground">
              <QrCode className="size-5" />
            </div>
            <div>
              <p className="font-mono text-[11px] font-bold text-foreground">
                VERIFIED-REC-{request.id}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Digital QueueLess Verification Stamp • PHINMA UPANG
              </p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Present school ID when claiming.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          {isStaff && onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit3 className="size-3.5" /> Edit Receipt & Line
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
          >
            <Printer className="size-3.5" /> Print Receipt
          </Button>
          <Button size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </section>
    </div>
  );
}

function EditReceiptModal({
  request,
  onClose,
  onSave,
  loading = false,
}: {
  request: RequestItem;
  onClose: () => void;
  onSave: (updated: {
    lineNumber: number;
    priority: Priority;
    status: Status;
    remarks: string;
    pickupDate: string;
    copies: number;
    document: string;
    purpose: string;
  }) => void;
  loading?: boolean;
}) {
  const [lineNumber, setLineNumber] = useState<number>(request.lineNumber ?? 1);
  const [priority, setPriority] = useState<Priority>(
    request.priority || "Regular"
  );
  const [status, setStatus] = useState<Status>(request.status);
  const [remarks, setRemarks] = useState<string>(request.remarks || "");
  const [pickupDate, setPickupDate] = useState<string>(request.pickupDate || "");
  const [copies, setCopies] = useState<number>(request.copies || 1);
  const [document, setDocument] = useState<string>(request.document);
  const [purpose, setPurpose] = useState<string>(request.purpose);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      lineNumber: Number(lineNumber),
      priority,
      status,
      remarks: remarks.trim(),
      pickupDate: pickupDate.trim(),
      copies: Number(copies),
      document,
      purpose,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={() => !loading && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Edit Request Receipt & Queue Line
            </h3>
            <p className="text-xs text-muted-foreground">
              Updating receipt for {request.id} ({request.student})
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Line Number (Queue Position)">
              <input
                type="number"
                min={1}
                value={lineNumber}
                onChange={(e) => setLineNumber(Number(e.target.value))}
                required
                className="field"
              />
            </Field>

            <Field label="Priority Level">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="field"
              >
                <option value="Regular">Regular Queue</option>
                <option value="Priority">Priority Lane</option>
                <option value="Urgent">Urgent Priority</option>
              </select>
            </Field>
          </div>

          <div className="rounded-lg bg-primary/5 border border-primary/20 p-2.5 text-[11px] text-muted-foreground">
            ℹ <strong>Line-by-line priority:</strong> This line number appears directly on the student&apos;s digital receipt so they can track who is next in line.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Request Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="field"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Ready for Claiming">Ready for Claiming</option>
                <option value="Claimed">Claimed</option>
                <option value="Needs Correction">Needs Correction</option>
              </select>
            </Field>

            <Field label="Copies">
              <input
                type="number"
                min={1}
                value={copies}
                onChange={(e) => setCopies(Number(e.target.value))}
                className="field"
              />
            </Field>
          </div>

          <Field label="Scheduled Pickup Date / Counter Window">
            <input
              type="text"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              placeholder="e.g. Window 2 • Sep 29, 2026 (2:00 PM)"
              className="field"
            />
          </Field>

          <Field label="Registrar Remarks / Notes to Student">
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Ready for pickup at Window 1. Please present your student ID."
              className="field resize-none"
            />
          </Field>

          <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Receipt Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ManageRequests({
  requests,
  setRequests,
  setFlash,
}: {
  requests: RequestItem[];
  setRequests: (r: RequestItem[]) => void;
  setFlash: (f: Flash) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  // Receipt view and edit modals
  const [viewingReceipt, setViewingReceipt] = useState<RequestItem | null>(null);
  const [editingReceipt, setEditingReceipt] = useState<RequestItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const shown = useMemo(
    () =>
      requests
        .filter(
          (r) =>
            (status === "All" || r.status === status) &&
            `${r.id} ${r.student} ${r.document} line #${r.lineNumber ?? 1}`
              .toLowerCase()
              .includes(query.toLowerCase())
        )
        .sort((a, b) => (a.lineNumber ?? 0) - (b.lineNumber ?? 0)),
    [requests, query, status]
  );

  const update = async (id: string, next: Status) => {
    try {
      const url = `${API_URL}/api/requests/${encodeURIComponent(id)}/status`;
      const token = localStorage.getItem("queueless_token");

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: next,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update request status."
        );
      }

      setRequests(
        requests.map((r) =>
          r.id === id
            ? {
                ...r,
                status: result.request.status,
              }
            : r
        )
      );

      setFlash({
        tone: "success",
        text: `${id} updated to ${result.request.status}.`,
      });
    } catch (error) {
      console.error("Update request status error:", error);
      setFlash({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to update request status. Please try again.",
      });
    }
  };

  const handleSaveReceiptEdit = async (updated: {
    lineNumber: number;
    priority: Priority;
    status: Status;
    remarks: string;
    pickupDate: string;
    copies: number;
    document: string;
    purpose: string;
  }) => {
    if (!editingReceipt) return;

    const token = localStorage.getItem("queueless_token");
    if (!token) {
      setFlash({
        tone: "error",
        text: "Your session has expired. Please sign in again.",
      });
      return;
    }

    try {
      setSavingEdit(true);
      const response = await fetch(
        `${API_URL}/api/requests/${encodeURIComponent(editingReceipt.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updated),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save receipt changes.");
      }

      const updatedItem: RequestItem = {
        ...editingReceipt,
        ...updated,
      };

      setRequests(
        requests.map((r) => (r.id === editingReceipt.id ? updatedItem : r))
      );

      if (viewingReceipt && viewingReceipt.id === editingReceipt.id) {
        setViewingReceipt(updatedItem);
      }

      setEditingReceipt(null);
      setFlash({
        tone: "success",
        text: `Receipt for ${editingReceipt.id} successfully updated (Line #${updated.lineNumber}).`,
      });
    } catch (err) {
      console.error("Save receipt error:", err);
      setFlash({
        tone: "error",
        text:
          err instanceof Error
            ? err.message
            : "Failed to update request receipt.",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="animate-rise">
      <PageHeading
        eyebrow="Registrar workspace"
        title="Manage requests"
        text="Manage line-by-line queue priority, review details, and update student digital receipts."
      />

      {/* Filter and search */}
      <div className="mt-7 flex flex-col gap-3 rounded-md border border-border bg-card p-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <span className="sr-only">Search requests</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="field pl-9"
            placeholder="Search line number, ID, student, or document..."
          />
        </label>

        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="field sm:w-52"
        >
          <option>All</option>
          {[
            "Pending",
            "Processing",
            "Ready for Claiming",
            "Claimed",
            "Needs Correction",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Requests table */}
      <div className="mt-4 overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full min-w-[950px] text-left text-sm">
          <thead className="bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              {[
                "Line #",
                "Request ID",
                "Student",
                "Document",
                "Submitted",
                "Status",
                "Actions",
              ].map((h) => (
                <th key={h} className="px-5 py-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {shown.map((r) => (
              <tr
                key={r.id}
                className="border-t border-border transition-colors hover:bg-muted/20"
              >
                {/* Line number and priority badge */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary border border-primary/20">
                      Line #{r.lineNumber ?? 1}
                    </span>
                    {r.priority === "Urgent" && (
                      <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-bold text-destructive">
                        Urgent
                      </span>
                    )}
                    {r.priority === "Priority" && (
                      <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        Priority
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-5 py-4 font-bold text-primary">{r.id}</td>

                <td className="px-5 py-4">
                  <p className="font-semibold text-foreground">{r.student}</p>
                  <p className="text-xs text-muted-foreground">{r.studentId}</p>
                </td>

                <td className="max-w-64 px-5 py-4">
                  <p className="font-medium text-foreground">{r.document}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.copies || 1} {(r.copies || 1) === 1 ? "copy" : "copies"} · {r.purpose}
                  </p>
                </td>

                <td className="px-5 py-4 text-muted-foreground">{r.date}</td>

                <td className="px-5 py-4">
                  <StatusBadge status={r.status} />
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    {/* View Digital Receipt */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingReceipt(r)}
                      title="View Digital Receipt"
                    >
                      <Eye className="size-3.5" /> Receipt
                    </Button>

                    {/* Edit Receipt */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingReceipt(r)}
                      title="Edit Receipt & Line Number"
                    >
                      <Edit3 className="size-3.5" /> Edit
                    </Button>

                    {/* Quick status dropdown */}
                    <select
                      aria-label={`Update ${r.id} status`}
                      value={r.status}
                      onChange={(e) => update(r.id, e.target.value as Status)}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      {[
                        "Pending",
                        "Processing",
                        "Ready for Claiming",
                        "Claimed",
                        "Needs Correction",
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {shown.length === 0 && (
          <EmptyState text="No requests match your search or filter." />
        )}
      </div>

      {/* Staff View Digital Receipt Modal */}
      {viewingReceipt && (
        <DigitalReceiptModal
          request={viewingReceipt}
          onClose={() => setViewingReceipt(null)}
          isStaff={true}
          onEdit={() => {
            const target = viewingReceipt;
            setViewingReceipt(null);
            setEditingReceipt(target);
          }}
        />
      )}

      {/* Staff Edit Receipt & Line Priority Modal */}
      {editingReceipt && (
        <EditReceiptModal
          request={editingReceipt}
          onClose={() => setEditingReceipt(null)}
          onSave={handleSaveReceiptEdit}
          loading={savingEdit}
        />
      )}
    </div>
  );
}

function AdminView({
  view,
  navigate,
  requests,
  setFlash,
}: {
  view: View;
  navigate: (v: View) => void;
  requests: RequestItem[];
  setFlash: (f: Flash) => void;
}) {
  if (view === "users") {
    return (
      <UsersPanel
        setFlash={setFlash}
      />
    );
  }

  if (view === "documents") {
    return (
      <DocumentsPanel
        setFlash={setFlash}
      />
    );
  }

  return (
    <div className="animate-rise">
      <PageHeading
        eyebrow="Administration"
        title="System overview"
        text="Manage access, document types, and system records."
      />

      <div className="mt-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric
          label="User accounts"
          value={127}
          icon={<UsersRound />}
        />

        <Metric
          label="Document types"
          value={
            documentTypes.length
          }
          icon={<FileText />}
        />

        <Metric
          label="Active requests"
          value={
            requests.filter(
              (r) =>
                r.status !==
                "Claimed"
            ).length
          }
          icon={<ClipboardList />}
        />

        <Metric
          label="Completed"
          value={
            requests.filter(
              (r) =>
                r.status ===
                "Claimed"
            ).length
          }
          icon={<ShieldCheck />}
        />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <ActionPanel
          icon={<UsersRound />}
          title="Manage user accounts"
          text="Review students, staff, and administrator access."
          action="Open user accounts"
          onClick={() =>
            navigate("users")
          }
        />

        <ActionPanel
          icon={<Settings2 />}
          title="Manage document types"
          text="Maintain the documents available for request."
          action="Open document types"
          onClick={() =>
            navigate("documents")
          }
        />
      </div>

      <section className="mt-10">
        <SectionTitle
          eyebrow="System records"
          title="Latest activity"
        />

        <div className="mt-4">
          <RequestCards
            requests={requests.slice(
              0,
              3
            )}
          />
        </div>
      </section>
    </div>
  );
}

type AccountUser = {
  id: string;
  name: string;
  studentId?: string;
  email: string;
  role: string;
  createdAt?: string;
};

function UsersPanel({
  setFlash,
}: {
  setFlash: (f: Flash) => void;
}) {
  const [users, setUsers] = useState<AccountUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Role Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "student" | "staff" | "admin"
  >("all");

  // Add Staff Form state
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [customStaffId, setCustomStaffId] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffConfirmPassword, setStaffConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [staffLoading, setStaffLoading] = useState(false);

  // Add Confirmation Modal
  const [showAddConfirmModal, setShowAddConfirmModal] = useState(false);
  const [pendingStaffPayload, setPendingStaffPayload] = useState<{
    name: string;
    email: string;
    staffId: string;
    password: string;
  } | null>(null);

  // Delete Confirmation Modal
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AccountUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Current logged in user to prevent self-deletion
  const currentAdmin = useMemo(() => {
    try {
      const raw = localStorage.getItem("queueless_user");
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("queueless_token");
    if (!token) {
      setError("Admin session not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load user accounts.");
      }

      setUsers(data.users || []);
    } catch (err) {
      console.error("Fetch users error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load accounts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Step 1: Form Validation before showing Confirmation Modal
  const handleReviewStaff = (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedName = staffName.trim();
    const trimmedEmail = staffEmail.trim().toLowerCase();
    const trimmedId = customStaffId.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setValidationError("Full name must contain at least 2 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setValidationError(
        "Please enter a valid institutional or personal email address."
      );
      return;
    }

    if (staffPassword.length < 8) {
      setValidationError("Password must contain at least 8 characters.");
      return;
    }

    if (staffPassword !== staffConfirmPassword) {
      setValidationError("Passwords do not match. Please re-enter.");
      return;
    }

    // Set pending staff data and trigger Confirmation Modal
    setPendingStaffPayload({
      name: trimmedName,
      email: trimmedEmail,
      staffId: trimmedId,
      password: staffPassword,
    });
    setShowAddConfirmModal(true);
  };

  // Step 2: Confirm Creation -> Call API
  const handleConfirmCreateStaff = async () => {
    if (!pendingStaffPayload) return;

    const token = localStorage.getItem("queueless_token");
    if (!token) {
      setFlash({
        tone: "error",
        text: "Your admin session has expired. Please sign in again.",
      });
      setShowAddConfirmModal(false);
      return;
    }

    try {
      setStaffLoading(true);
      const response = await fetch(`${API_URL}/api/auth/staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: pendingStaffPayload.name,
          email: pendingStaffPayload.email,
          password: pendingStaffPayload.password,
          staffId: pendingStaffPayload.staffId || undefined,
        }),
      });

      const result = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to create staff account."
        );
      }

      if (!result.user) {
        throw new Error(
          "The server did not return the created staff account."
        );
      }

      // Prepend to local users list
      setUsers((prev) => [
        {
          id:
            (result.user as any).id ||
            (result.user as any)._id ||
            `staff-${Date.now()}`,
          name: result.user.name,
          studentId: result.user.studentId,
          email: pendingStaffPayload.email,
          role: "staff",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      // Close modal and reset form
      setShowAddConfirmModal(false);
      setShowStaffForm(false);
      setStaffName("");
      setStaffEmail("");
      setCustomStaffId("");
      setStaffPassword("");
      setStaffConfirmPassword("");
      setPendingStaffPayload(null);
      setValidationError(null);

      setFlash({
        tone: "success",
        text: `Staff account successfully created for ${result.user.name} (${result.user.studentId}).`,
      });
    } catch (err) {
      console.error("Create staff account error:", err);
      setFlash({
        tone: "error",
        text:
          err instanceof Error
            ? err.message
            : "Failed to create staff account.",
      });
    } finally {
      setStaffLoading(false);
    }
  };

  // Step 3: Trigger Delete Confirmation Modal
  const handlePromptDelete = (user: AccountUser) => {
    setUserToDelete(user);
    setShowDeleteConfirmModal(true);
  };

  // Step 4: Confirm Delete -> Call API
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    const token = localStorage.getItem("queueless_token");
    if (!token) {
      setFlash({
        tone: "error",
        text: "Your admin session has expired. Please sign in again.",
      });
      setShowDeleteConfirmModal(false);
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await fetch(
        `${API_URL}/api/auth/users/${userToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete user account.");
      }

      // Remove from list
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setShowDeleteConfirmModal(false);
      setFlash({
        tone: "success",
        text: `${userToDelete.name} (${userToDelete.role}) was successfully deleted.`,
      });
      setUserToDelete(null);
    } catch (err) {
      console.error("Delete user error:", err);
      setFlash({
        tone: "error",
        text:
          err instanceof Error
            ? err.message
            : "Failed to delete user account.",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered accounts
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const roleMatch =
        roleFilter === "all"
          ? true
          : u.role.toLowerCase() === roleFilter.toLowerCase();
      const q = searchTerm.toLowerCase().trim();
      const searchMatch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.studentId && u.studentId.toLowerCase().includes(q));
      return roleMatch && searchMatch;
    });
  }, [users, roleFilter, searchTerm]);

  const counts = useMemo(() => {
    return {
      all: users.length,
      student: users.filter((u) => u.role.toLowerCase() === "student").length,
      staff: users.filter((u) => u.role.toLowerCase() === "staff").length,
      admin: users.filter((u) => u.role.toLowerCase() === "admin").length,
    };
  }, [users]);

  const getRoleBadge = (role: string) => {
    const r = role.toLowerCase();
    if (r === "admin") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
          <Shield className="size-3" /> Admin
        </span>
      );
    }
    if (r === "staff") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          <ShieldCheck className="size-3" /> Staff
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        <UserRound className="size-3" /> Student
      </span>
    );
  };

  return (
    <div className="animate-rise">
      <PageHeading
        eyebrow="Administration"
        title="User accounts"
        text="Manage user roles, create staff access, and control account permissions."
      />

      {/* Main card */}
      <div className="mt-7 overflow-hidden rounded-md border border-border bg-card">
        {/* Header bar */}
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold">
              {users.length} {users.length === 1 ? "account" : "accounts"}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={fetchUsers}
              title="Refresh account list"
              disabled={loading}
            >
              <RefreshCw
                className={`size-3.5 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => {
                setShowStaffForm((prev) => !prev);
                setValidationError(null);
              }}
            >
              <Plus /> {showStaffForm ? "Close form" : "Add staff"}
            </Button>
          </div>
        </div>

        {/* Create Staff Form */}
        {showStaffForm && (
          <form
            className="grid gap-4 border-b border-border bg-muted/30 p-5 sm:grid-cols-2"
            onSubmit={handleReviewStaff}
          >
            <div className="sm:col-span-2">
              <p className="text-sm font-bold text-foreground">
                Create new Staff account
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Staff members can process document queues, call ticket numbers, and update student request statuses.
              </p>
            </div>

            {validationError && (
              <div className="sm:col-span-2">
                <InlineError text={validationError} />
              </div>
            )}

            <Field label="Full name">
              <input
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                required
                className="field"
                placeholder="e.g. Maria Santos"
              />
            </Field>

            <Field label="Institutional / Staff email">
              <input
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                type="email"
                required
                className="field"
                placeholder="staff@up.phinma.edu.ph"
              />
            </Field>

            <Field label="Staff ID (Optional)">
              <input
                value={customStaffId}
                onChange={(e) => setCustomStaffId(e.target.value)}
                className="field"
                placeholder="e.g. STAFF-001 (auto-generated if empty)"
              />
            </Field>

            <div className="hidden sm:block" />

            <Field label="Password (Min. 8 characters)">
              <input
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
                type="password"
                minLength={8}
                required
                className="field"
                placeholder="••••••••"
              />
            </Field>

            <Field label="Confirm password">
              <input
                value={staffConfirmPassword}
                onChange={(e) => setStaffConfirmPassword(e.target.value)}
                type="password"
                minLength={8}
                required
                className="field"
                placeholder="••••••••"
              />
            </Field>

            <div className="flex items-center gap-2 sm:col-span-2 pt-2">
              <Button type="submit">
                Continue & review
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowStaffForm(false);
                  setValidationError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Filters and Search Bar */}
        <div className="flex flex-col gap-3 border-b border-border bg-muted/10 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setRoleFilter("all")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                roleFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("staff")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                roleFilter === "staff"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Staff ({counts.staff})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("student")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                roleFilter === "student"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Students ({counts.student})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("admin")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                roleFilter === "admin"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Admins ({counts.admin})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or ID..."
              className="field h-8 pl-8 text-xs"
            />
          </div>
        </div>

        {/* Loading and Error states */}
        {loading && users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="mt-2 text-xs">Loading user accounts...</p>
          </div>
        )}

        {error && users.length === 0 && (
          <div className="p-6 text-center">
            <InlineError text={error} />
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={fetchUsers}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredUsers.length === 0 && !error && (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No accounts found matching your filter or query.
          </div>
        )}

        {/* User list */}
        {filteredUsers.map((u) => {
          const isCurrentUser =
            currentAdmin &&
            (currentAdmin.id === u.id || currentAdmin.email === u.email);

          return (
            <div
              key={u.id}
              className="flex flex-col gap-3 border-b border-border p-4 transition-colors last:border-b-0 hover:bg-muted/20 sm:flex-row sm:items-center"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                <UserRound className="size-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-foreground">{u.name}</p>
                  {getRoleBadge(u.role)}
                  {isCurrentUser && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                      You
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {u.studentId || u.id} · {u.email}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={Boolean(isCurrentUser)}
                  title={
                    isCurrentUser
                      ? "You cannot delete your own active admin account"
                      : `Delete ${u.name}`
                  }
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handlePromptDelete(u)}
                >
                  <Trash2 className="size-3.5" /> Remove
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal 1: Add New Staff */}
      {showAddConfirmModal && pendingStaffPayload && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => !staffLoading && setShowAddConfirmModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Confirm Staff Account
                </h3>
                <p className="text-xs text-muted-foreground">
                  Review the details before creating this staff account.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5 rounded-lg border border-border bg-muted/40 p-4 text-xs">
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Full Name:</span>
                <span className="font-semibold text-foreground">
                  {pendingStaffPayload.name}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-semibold text-foreground">
                  {pendingStaffPayload.email}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Staff ID:</span>
                <span className="font-semibold text-foreground">
                  {pendingStaffPayload.staffId || "(Auto-generated)"}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Assigned Role:</span>
                <span className="font-semibold text-primary">Staff Member</span>
              </div>
              <div className="pt-1 text-[11px] text-muted-foreground">
                Permissions: Verify documents, manage registrar queues, and update request statuses.
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddConfirmModal(false)}
                disabled={staffLoading}
              >
                Cancel / Edit
              </Button>
              <Button
                type="button"
                onClick={handleConfirmCreateStaff}
                disabled={staffLoading}
              >
                {staffLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Yes, Create Staff"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal 2: Delete Account */}
      {showDeleteConfirmModal && userToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => !deleteLoading && setShowDeleteConfirmModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Delete User Account
                </h3>
                <p className="text-xs text-muted-foreground">
                  This action is permanent and removes the account completely.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-xs">
              <p className="font-semibold text-destructive">
                Are you sure you want to permanently delete this user?
              </p>
              <div className="mt-3 space-y-1.5 border-t border-destructive/10 pt-2.5 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Name:</strong>{" "}
                  {userToDelete.name}
                </p>
                <p>
                  <strong className="text-foreground">Role:</strong>{" "}
                  <span className="capitalize">{userToDelete.role}</span>
                </p>
                <p>
                  <strong className="text-foreground">Email:</strong>{" "}
                  {userToDelete.email}
                </p>
                {userToDelete.studentId && (
                  <p>
                    <strong className="text-foreground">ID:</strong>{" "}
                    {userToDelete.studentId}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirmModal(false)}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete Account"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentsPanel({
  setFlash,
}: {
  setFlash: (f: Flash) => void;
}) {
  const [docs, setDocs] =
    useState(documentTypes);

  const [name, setName] =
    useState("");

  return (
    <div className="animate-rise">
      <PageHeading
        eyebrow="Administration"
        title="Document types"
        text="Control which registrar documents students can request."
      />

      <form
        className="mt-7 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();

          if (!name.trim()) {
            return;
          }

          setDocs([
            ...docs,
            name.trim(),
          ]);

          setName("");

          setFlash({
            tone: "success",
            text: "Document type added.",
          });
        }}
      >
        <label className="flex-1">
          <span className="sr-only">
            New document type
          </span>

          <input
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            className="field"
            placeholder="Enter a document type"
          />
        </label>

        <Button>
          <Plus /> Add
        </Button>
      </form>

      <div className="mt-4 overflow-hidden rounded-md border border-border bg-card">
        {docs.map(
          (doc, index) => (
            <div
              key={doc}
              className="flex items-center gap-3 border-b border-border p-4 last:border-b-0"
            >
              <span className="flex size-8 items-center justify-center rounded-md bg-accent text-xs font-bold text-primary">
                {index + 1}
              </span>

              <p className="flex-1 text-sm font-bold">
                {doc}
              </p>

              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${doc}`}
                onClick={() =>
                  setDocs(
                    docs.filter(
                      (d) => d !== doc
                    )
                  )
                }
              >
                <Trash2 />
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function RequestList({
  title,
  subtitle,
  requests,
  student = false,
}: {
  title: string;
  subtitle: string;
  requests: RequestItem[];
  student?: boolean;
}) {
  const [selected, setSelected] = useState<RequestItem | null>(null);

  return (
    <div className="animate-rise">
      <PageHeading
        eyebrow="Requests"
        title={title}
        text={subtitle}
      />

      <div className="mt-7">
        <RequestCards
          requests={requests}
          onSelect={setSelected}
        />
      </div>

      {selected && (
        <DigitalReceiptModal
          request={selected}
          onClose={() => setSelected(null)}
          isStaff={false}
        />
      )}
    </div>
  );
}

function RequestCards({
  requests,
  onSelect,
}: {
  requests: RequestItem[];
  onSelect?: (r: RequestItem) => void;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      {requests.length ? (
        requests.map((r) => (
          <button
            key={r.id}
            type="button"
            className="grid w-full gap-3 border-b border-border p-4 text-left transition last:border-b-0 hover:bg-muted/60 sm:grid-cols-[auto_1fr_1.2fr_auto] sm:items-center"
            onClick={() => onSelect?.(r)}
          >
            {/* Line number priority badge */}
            <div className="flex sm:flex-col items-center justify-center rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 min-w-[70px] text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1 sm:mr-0">
                Line
              </span>
              <span className="text-base font-black text-primary">
                #{r.lineNumber ?? 1}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-primary">{r.id}</p>
                {r.priority === "Urgent" && (
                  <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-bold text-destructive">
                    Urgent
                  </span>
                )}
                {r.priority === "Priority" && (
                  <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    Priority
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{r.date}</p>
            </div>

            <div>
              <p className="text-sm font-semibold">{r.document}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {r.student} · {r.purpose}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={r.status} />
              {onSelect && (
                <ChevronRight className="size-4 text-muted-foreground" />
              )}
            </div>
          </button>
        ))
      ) : (
        <EmptyState text="No document requests yet." />
      )}
    </div>
  );
}

function ActionPanel({
  icon,
  title,
  text,
  action,
  onClick,
  primary = false,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  action: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <article
      className={`${
        primary
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-card"
      } rounded-md p-6`}
    >
      <div
        className={`${
          primary
            ? "bg-primary-foreground/15"
            : "bg-accent text-primary"
        } flex size-11 items-center justify-center rounded-md`}
      >
        {icon}
      </div>

      <h2 className="mt-7 font-display text-2xl font-bold">
        {title}
      </h2>

      <p
        className={`mt-2 text-sm ${
          primary
            ? "text-primary-foreground/75"
            : "text-muted-foreground"
        }`}
      >
        {text}
      </p>

      <Button
        className="mt-6"
        variant={
          primary
            ? "secondary"
            : "outline"
        }
        onClick={onClick}
      >
        {action}
        <ArrowRight />
      </Button>
    </article>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 text-muted-foreground">
        <p className="text-[10px] font-bold uppercase sm:text-xs">
          {label}
        </p>

        {icon}
      </div>

      <p className="mt-5 font-display text-4xl font-bold text-foreground">
        {value}
      </p>
    </div>
  );
}

function PageHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <header>
      <p className="text-xs font-bold uppercase text-primary">
        {eyebrow}
      </p>

      <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
        {title}
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
        {text}
      </p>
    </header>
  );
}

function SectionTitle({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase text-primary">
          {eyebrow}
        </p>

        <h2 className="mt-1 font-display text-2xl font-bold">
          {title}
        </h2>
      </div>

      {action && (
        <Button
          variant="link"
          onClick={onAction}
        >
          {action}
          <ArrowRight />
        </Button>
      )}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: Status;
}) {
  const tone =
    status ===
    "Ready for Claiming"
      ? "bg-success-soft text-success"
      : status === "Processing"
      ? "bg-info-soft text-info"
      : status === "Claimed"
      ? "bg-primary text-primary-foreground"
      : status ===
        "Needs Correction"
      ? "bg-warning-soft text-warning-foreground"
      : "bg-muted text-muted-foreground";

  return (
    <span
      className={`${tone} inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold`}
    >
      {status}
    </span>
  );
}

function NavButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant={
        active
          ? "secondary"
          : "ghost"
      }
      className={`w-full justify-start ${
        active
          ? "font-bold"
          : "text-muted-foreground"
      }`}
      onClick={onClick}
    >
      {icon}
      {label}
    </Button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-xs font-bold">
      {label}
      {children}
    </label>
  );
}

function InlineError({
  text,
}: {
  text: string;
}) {
  return (
    <p
      role="alert"
      className="rounded-md bg-destructive/10 p-3 text-xs font-semibold text-destructive"
    >
      {text}
    </p>
  );
}

function FlashMessage({
  flash,
  onClose,
}: {
  flash: Exclude<
    Flash,
    null
  >;
  onClose: () => void;
}) {
  return (
    <div
      role="status"
      className={`${
        flash.tone === "success"
          ? "bg-success-soft text-success"
          : "bg-destructive/10 text-destructive"
      } mb-6 flex items-center gap-3 rounded-md p-3 text-sm font-semibold`}
    >
      <CheckCircle2 className="size-4 shrink-0" />

      <span className="flex-1">
        {flash.text}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={onClose}
        aria-label="Dismiss message"
      >
        <X />
      </Button>
    </div>
  );
}

function Notice({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-md bg-muted p-3">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
        <Check className="size-4" />
      </div>

      <div>
        <p className="text-xs font-bold">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {text}
        </p>
      </div>
    </div>
  );
}

function MiniStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div>
      <p className="font-display text-lg font-bold text-secondary">
        {value}
      </p>

      <p className="mt-1 text-xs text-primary-foreground/65">
        {label}
      </p>
    </div>
  );
}

function ReceiptField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-semibold">
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="p-10 text-center">
      <FileText className="mx-auto size-8 text-muted-foreground" />

      <p className="mt-3 text-sm text-muted-foreground">
        {text}
      </p>
    </div>
  );
}