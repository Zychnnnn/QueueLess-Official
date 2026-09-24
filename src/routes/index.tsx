import { createFileRoute } from "@tanstack/react-router";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  FileCheck2,
  FilePlus2,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import backgroundImage from "@/assets/upang.png";

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

type RequestItem = {
  id: string;
  student: string;
  studentId: string;
  document: string;
  purpose: string;
  date: string;
  status: Status;
  remarks?: string;
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
            "http://localhost:5000/api/requests",
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
            result.map((request: any) => ({
              id: request.requestNumber,
              student: request.student,
              studentId: request.studentId,
              document: request.document,
              purpose: request.purpose,
              date: request.date,
              status: request.status,
              remarks:
                request.remarks || "",
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
        "http://localhost:5000/api/requests",
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
        result.map((request: any) => ({
          id: request.requestNumber,
          student: request.student,
          studentId: request.studentId,
          document: request.document,
          purpose: request.purpose,
          date: request.date,
          status: request.status,
          remarks:
            request.remarks || "",
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
        role={role}
        setRole={setRole}
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
  role,
  setRole,
  onSignIn,
}: {
  role: Role;
  setRole: (r: Role) => void;
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
        "http://localhost:5000/api/auth/login",
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

    const firstName = String(
      data.get("firstName") ?? ""
    ).trim();

    const lastName = String(
      data.get("lastName") ?? ""
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

    if (
      !firstName ||
      !lastName ||
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
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: `${firstName} ${lastName}`,
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

              <div className="mt-7">
                <p className="text-xs font-bold">
                  Account type
                </p>

                <div className="mt-2 grid grid-cols-3 rounded-md bg-muted p-1">
                  {(
                    [
                      "student",
                      "staff",
                      "admin",
                    ] as Role[]
                  ).map((r) => (
                    <Button
                      key={r}
                      type="button"
                      variant={
                        role === r
                          ? "default"
                          : "ghost"
                      }
                      className="capitalize shadow-none"
                      onClick={() => {
                        setRole(r);
                        setError("");
                      }}
                    >
                      {r}
                    </Button>
                  ))}
                </div>
              </div>

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
                    : `Sign in as ${role.toUpperCase()}`}

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
                    setRole("student");
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
        <Field label="First name">
          <input
            name="firstName"
            required
            className="field"
            placeholder="Juan"
          />
        </Field>

        <Field label="Last name">
          <input
            name="lastName"
            required
            className="field"
            placeholder="Dela Cruz"
          />
        </Field>

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
          "http://localhost:5000/api/requests",
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

      const savedRequest: RequestItem =
        {
          id:
            result.request
              .requestNumber,

          student:
            result.request.student,

          studentId:
            result.request.studentId,

          document:
            result.request.document,

          purpose:
            result.request.purpose,

          remarks:
            result.request.remarks ||
            "",

          date:
            result.request.date,

          status:
            result.request.status,
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

function ManageRequests({
  requests,
  setRequests,
  setFlash,
}: {
  requests: RequestItem[];
  setRequests: (
    r: RequestItem[]
  ) => void;
  setFlash: (f: Flash) => void;
}) {
  const [query, setQuery] =
    useState("");

  const [status, setStatus] =
    useState("All");

  const shown = useMemo(
    () =>
      requests.filter(
        (r) =>
          (status === "All" ||
            r.status === status) &&
          `${r.id} ${r.student} ${r.document}`
            .toLowerCase()
            .includes(
              query.toLowerCase()
            )
      ),
    [requests, query, status]
  );

  const update = async (
    id: string,
    next: Status
  ) => {
    try {
      console.log(
        "Updating request:",
        id,
        "to",
        next
      );

      const url = `http://localhost:5000/api/requests/${encodeURIComponent(
        id
      )}/status`;

      console.log(
        "PATCH URL:",
        url
      );

      const token =
        localStorage.getItem(
          "queueless_token"
        );

      /*
       * PATCH is protected by JWT + staff/admin RBAC.
       */
      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const response =
        await fetch(url, {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            status: next,
          }),
        });

      console.log(
        "PATCH response status:",
        response.status
      );

      const result =
        await response.json();

      console.log(
        "PATCH response:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to update request status."
        );
      }

      setRequests(
        requests.map((r) =>
          r.id === id
            ? {
                ...r,
                status:
                  result.request
                    .status,
              }
            : r
        )
      );

      setFlash({
        tone: "success",
        text: `${id} updated to ${result.request.status}.`,
      });
    } catch (error) {
      console.error(
        "Update request status error:",
        error
      );

      setFlash({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to update request status. Please try again.",
      });
    }
  };

  return (
    <div className="animate-rise">
      <PageHeading
        eyebrow="Registrar workspace"
        title="Manage requests"
        text="Search, filter, and update the status of student requests."
      />

      <div className="mt-7 flex flex-col gap-3 rounded-md border border-border bg-card p-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />

          <span className="sr-only">
            Search requests
          </span>

          <input
            value={query}
            onChange={(e) =>
              setQuery(
                e.target.value
              )
            }
            className="field pl-9"
            placeholder="Search ID, student, or document"
          />
        </label>

        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) =>
            setStatus(
              e.target.value
            )
          }
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
            <option key={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              {[
                "Request",
                "Student",
                "Document",
                "Submitted",
                "Status",
                "Update",
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-4"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {shown.map((r) => (
              <tr
                key={r.id}
                className="border-t border-border"
              >
                <td className="px-5 py-4 font-bold text-primary">
                  {r.id}
                </td>

                <td className="px-5 py-4">
                  <p className="font-semibold">
                    {r.student}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {r.studentId}
                  </p>
                </td>

                <td className="max-w-64 px-5 py-4 font-medium">
                  {r.document}
                </td>

                <td className="px-5 py-4 text-muted-foreground">
                  {r.date}
                </td>

                <td className="px-5 py-4">
                  <StatusBadge
                    status={r.status}
                  />
                </td>

                <td className="px-5 py-4">
                  <select
                    aria-label={`Update ${r.id} status`}
                    value={r.status}
                    onChange={(e) =>
                      update(
                        r.id,
                        e.target
                          .value as Status
                      )
                    }
                    className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    {[
                      "Pending",
                      "Processing",
                      "Ready for Claiming",
                      "Claimed",
                      "Needs Correction",
                    ].map((s) => (
                      <option key={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {shown.length === 0 && (
          <EmptyState text="No requests match your search." />
        )}
      </div>
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

function UsersPanel({
  setFlash,
}: {
  setFlash: (f: Flash) => void;
}) {
  const [users, setUsers] =
    useState([
      {
        name: "Juan Dela Cruz",
        id: "2022-10045",
        role: "Student",
        active: true,
      },
      {
        name: "Maria Santos",
        id: "2022-10412",
        role: "Student",
        active: true,
      },
      {
        name: "Registrar Staff",
        id: "REG-001",
        role: "Staff",
        active: true,
      },
    ]);

  return (
    <div className="animate-rise">
      <PageHeading
        eyebrow="Administration"
        title="User accounts"
        text="Review user roles and account access."
      />

      <div className="mt-7 overflow-hidden rounded-md border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border p-4">
          <p className="text-sm font-bold">
            {users.length} accounts
          </p>

          <Button
            onClick={() =>
              setFlash({
                tone: "success",
                text: "Add-user form opened.",
              })
            }
          >
            <Plus /> Add user
          </Button>
        </div>

        {users.map((u) => (
          <div
            key={u.id}
            className="flex flex-col gap-3 border-b border-border p-4 last:border-b-0 sm:flex-row sm:items-center"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-accent text-primary">
              <UserRound className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-bold">
                {u.name}
              </p>

              <p className="text-xs text-muted-foreground">
                {u.id} · {u.role}
              </p>
            </div>

            <span className="text-xs font-bold text-success">
              Active
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setUsers(
                  users.filter(
                    (x) =>
                      x.id !== u.id
                  )
                );

                setFlash({
                  tone: "success",
                  text: `${u.name} removed from the account list.`,
                });
              }}
            >
              <Trash2 /> Remove
            </Button>
          </div>
        ))}
      </div>
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
  const [selected, setSelected] =
    useState<RequestItem | null>(
      null
    );

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
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-overlay p-0 sm:items-center sm:p-4"
          onClick={() =>
            setSelected(null)
          }
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Request receipt"
            className="w-full max-w-lg rounded-t-lg bg-card p-6 shadow-2xl sm:rounded-lg"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-primary">
                  Digital request receipt
                </p>

                <h2 className="mt-1 font-display text-2xl font-bold">
                  {selected.id}
                </h2>
              </div>

              <Button
                size="icon"
                variant="ghost"
                onClick={() =>
                  setSelected(null)
                }
                aria-label="Close receipt"
              >
                <X />
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-5 border-y border-border py-5 text-sm">
              <ReceiptField
                label="Student"
                value={
                  selected.student
                }
              />

              <ReceiptField
                label="Student ID"
                value={
                  selected.studentId
                }
              />

              <ReceiptField
                label="Document"
                value={
                  selected.document
                }
              />

              <ReceiptField
                label="Purpose"
                value={
                  selected.purpose
                }
              />

              <ReceiptField
                label="Submitted"
                value={
                  selected.date
                }
              />

              <div>
                <p className="text-xs text-muted-foreground">
                  Status
                </p>

                <div className="mt-1">
                  <StatusBadge
                    status={
                      selected.status
                    }
                  />
                </div>
              </div>
            </div>

            {selected.remarks && (
              <p className="mt-4 rounded-md bg-warning-soft p-3 text-sm text-warning-foreground">
                <strong>
                  Registrar note:
                </strong>{" "}
                {selected.remarks}
              </p>
            )}

            <p className="mt-5 text-xs leading-5 text-muted-foreground">
              Keep this request number
              for tracking and present
              your school ID when
              claiming.
            </p>

            {student && (
              <Button
                className="mt-5 w-full"
                onClick={() =>
                  window.print()
                }
              >
                <FileText /> Print receipt
              </Button>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function RequestCards({
  requests,
  onSelect,
}: {
  requests: RequestItem[];
  onSelect?: (
    r: RequestItem
  ) => void;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      {requests.length ? (
        requests.map((r) => (
          <button
            key={r.id}
            type="button"
            className="grid w-full gap-3 border-b border-border p-4 text-left transition last:border-b-0 hover:bg-muted/60 sm:grid-cols-[1fr_1.4fr_auto] sm:items-center"
            onClick={() =>
              onSelect?.(r)
            }
          >
            <div>
              <p className="text-sm font-bold text-primary">
                {r.id}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {r.date}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold">
                {r.document}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {r.student} ·{" "}
                {r.purpose}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge
                status={r.status}
              />

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