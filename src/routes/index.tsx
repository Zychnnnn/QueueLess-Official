import { createFileRoute } from "@tanstack/react-router";

import {
  useEffect,
  useMemo,
  useRef,
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Edit3,
  Eye,
  EyeOff,
  FileCheck2,
  FilePlus2,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Plus,
  Phone,
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
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && !window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1")
    ? ""
    : "http://localhost:5000")
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

type Role = "student" | "staff" | "admin" | "guest";

type View =
  | "dashboard"
  | "new"
  | "requests"
  | "users"
  | "documents"
  | "profile";

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
  phone?: string;
  document: string;
  purpose: string;
  date: string;
  status: Status;
  remarks?: string;
  lineNumber?: number;
  priority?: Priority;
  copies?: number;
  pickupDate?: string;
  paymentStatus?: string;
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
  picture?: string;
  phone?: string;
  lastLogin?: string;
  isPriority?: boolean;
  userType?: "priority" | "normal";
};

type AccountUser = {
  id: string;
  name: string;
  studentId?: string;
  email: string;
  phone?: string;
  lastLogin?: string;
  role: string;
  isPriority?: boolean;
  userType?: "priority" | "normal";
  approvalStatus?: "pending" | "approved" | "rejected";
  createdAt?: string;
};

type NotificationItem = {
  id: string;
  title: string;
  text: string;
  tone: "success" | "warning" | "info" | "urgent";
  time?: string;
  actionView?: View;
  requestId?: string;
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
    priority: "Urgent",
    lineNumber: 1,
    copies: 2,
    pickupDate: "Oct 05, 2026",
  },
  {
    id: "QLR-2026-002",
    student: "Maria Santos",
    studentId: "2022-10412",
    document: "Certificate of Good Moral",
    purpose: "Employment",
    date: "Sep 19, 2026",
    status: "Processing",
    priority: "Priority",
    lineNumber: 2,
    copies: 1,
    pickupDate: "Oct 07, 2026",
  },
  {
    id: "QLR-2026-003",
    student: "Angel Ferrer",
    studentId: "2021-10008",
    document: "Certificate of Grades",
    purpose: "Transfer",
    date: "Sep 16, 2026",
    status: "Claimed",
    priority: "Regular",
    lineNumber: 3,
    copies: 1,
    pickupDate: "Sep 22, 2026",
  },
  {
    id: "QLR-2026-004",
    student: "Juan Dela Cruz",
    studentId: "2022-10045",
    document: "Certificate of Enrollment",
    purpose: "Scholarship",
    date: "Sep 20, 2026",
    status: "Pending",
    priority: "Regular",
    lineNumber: 4,
    copies: 1,
    pickupDate: "Oct 12, 2026",
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
    priority: "Regular",
    lineNumber: 5,
    copies: 1,
    pickupDate: "Oct 15, 2026",
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

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activeReceiptModal, setActiveReceiptModal] =
    useState<RequestItem | null>(null);

  const [adminUsers, setAdminUsers] = useState<AccountUser[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("queueless_read_notifications");
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  const markNotificationAsRead = (id: string) => {
    setReadNotificationIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(
          "queueless_read_notifications",
          JSON.stringify(next)
        );
      } catch {
        // ignore
      }
      return next;
    });
  };

  const fetchAdminUsers = async () => {
    const token = localStorage.getItem("queueless_token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok && result.users) {
        setAdminUsers(result.users);
      }
    } catch (err) {
      console.error("Fetch admin users error:", err);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("queueless_user");
    const savedToken = localStorage.getItem("queueless_token");

    if (!savedUser || !savedToken) {
      localStorage.removeItem("queueless_user");
      localStorage.removeItem("queueless_token");
      return;
    }

    try {
      const user: AuthUser =
        JSON.parse(savedUser);

      if (!user.lastLogin) {
        user.lastLogin = new Date().toISOString();
        localStorage.setItem("queueless_user", JSON.stringify(user));
      }

      setCurrentUser(user);
      setRole(user.role);
      setSignedIn(true);

      if (user.role === "admin") {
        fetchAdminUsers();
      }

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
            result.map((request: Record<string, unknown>, idx: number) => ({
              id: String(request.requestNumber ?? ""),
              student: String(request.student ?? ""),
              studentId: String(request.studentId ?? ""),
              phone: String(request.phone ?? ""),
              document: String(request.document ?? ""),
              purpose: String(request.purpose ?? ""),
              date: String(request.date ?? ""),
              status: (request.status as Status) || "Pending",
              remarks: String(request.remarks || ""),
              lineNumber: typeof request.lineNumber === "number" ? request.lineNumber : idx + 1,
              priority: (request.priority as Priority) || "Regular",
              copies: request.copies || 1,
              pickupDate: request.pickupDate || "",
              paymentStatus: typeof request.paymentStatus === "string" ? request.paymentStatus : "Proceed to Registrar Staff",
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
    const userWithLogin: AuthUser = {
      ...user,
      lastLogin: user.lastLogin || new Date().toISOString(),
    };
    setCurrentUser(userWithLogin);
    setRole(userWithLogin.role);
    setSignedIn(true);

    if (userWithLogin.role === "admin") {
      fetchAdminUsers();
    }

    localStorage.setItem(
      "queueless_user",
      JSON.stringify(userWithLogin)
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
        result.map((request: Record<string, unknown>, idx: number) => ({
          id: String(request.requestNumber ?? ""),
          student: String(request.student ?? ""),
          studentId: String(request.studentId ?? ""),
          phone: String(request.phone ?? ""),
          document: String(request.document ?? ""),
          purpose: String(request.purpose ?? ""),
          date: String(request.date ?? ""),
          status: (request.status as Status) || "Pending",
          remarks: String(request.remarks || ""),
          lineNumber: typeof request.lineNumber === "number" ? request.lineNumber : idx + 1,
          priority: (request.priority as Priority) || "Regular",
          copies: typeof request.copies === "number" ? request.copies : 1,
          pickupDate: typeof request.pickupDate === "string" ? request.pickupDate : "",
          paymentStatus: typeof request.paymentStatus === "string" ? request.paymentStatus : "Proceed to Registrar Staff",
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
   * Notifications for Student, Staff, and Admin.
   */
  const notifications: NotificationItem[] = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    const currentRole = currentUser.role;

    if (currentRole === "student") {
      const list: NotificationItem[] = [];
      const studentIdClean = (currentUser.studentId || "").trim().toLowerCase();
      const studentIdDigits = studentIdClean.replace(/[^a-z0-9]/g, "");
      const studentNameClean = (currentUser.name || "").trim().toLowerCase();

      const mine = requests.filter((request) => {
        const reqIdClean = (request.studentId || "").trim().toLowerCase();
        const reqIdDigits = reqIdClean.replace(/[^a-z0-9]/g, "");
        const reqNameClean = (request.student || "").trim().toLowerCase();

        return (
          (reqIdClean && reqIdClean === studentIdClean) ||
          (reqIdDigits && studentIdDigits && reqIdDigits === studentIdDigits) ||
          (reqNameClean && reqNameClean === studentNameClean)
        );
      });

      mine.forEach((request) => {
        if (request.status === "Ready for Claiming") {
          list.push({
            id: `ready-${request.id}`,
            title: `Ready for Pickup! (${request.document})`,
            text: `Your ${request.document} (${request.id}) is verified and ready for collection! Scheduled: ${request.pickupDate || "Today"}. Present your school ID at Counter #${request.lineNumber ?? 1}.`,
            tone: "success",
            time: request.pickupDate || request.date,
            actionView: "requests",
            requestId: request.id,
          });
        } else if (request.status === "Needs Correction") {
          list.push({
            id: `correction-${request.id}`,
            title: `Action Required: Correction Needed (${request.id})`,
            text: `${request.document}: ${request.remarks || "Please review registrar notes and provide necessary corrections."}`,
            tone: "warning",
            time: request.date,
            actionView: "requests",
            requestId: request.id,
          });
        } else if (request.status === "Processing") {
          list.push({
            id: `processing-${request.id}`,
            title: `Now Processing: Line #${request.lineNumber ?? 1}`,
            text: `Registrar staff is actively preparing ${request.document} (${request.id}). Target release date: ${request.pickupDate || "Scheduled soon"}.`,
            tone: "info",
            time: request.date,
            actionView: "requests",
            requestId: request.id,
          });
        } else if (request.status === "Claimed") {
          list.push({
            id: `claimed-${request.id}`,
            title: `Document Claimed & Released (${request.id})`,
            text: `Your ${request.document} was successfully released on ${request.pickupDate || request.date}. Thank you for using QueueLess!`,
            tone: "success",
            time: request.pickupDate || request.date,
            actionView: "requests",
            requestId: request.id,
          });
        } else if (request.status === "Pending") {
          list.push({
            id: `pending-${request.id}`,
            title: `In Queue: Line #${request.lineNumber ?? 1}`,
            text: `Your request for ${request.document} (${request.id}) was received and is in line. Estimated pickup: ${request.pickupDate || "3-5 business days"}.`,
            tone: "info",
            time: request.date,
            actionView: "requests",
            requestId: request.id,
          });
        }

        // Calendar pickup reminder for scheduled requests
        if (request.pickupDate && request.status !== "Claimed") {
          list.push({
            id: `calendar-${request.id}`,
            title: `📅 Scheduled Pickup: ${request.pickupDate}`,
            text: `Calendar Reminder: ${request.document} (${request.id}) is scheduled for release on ${request.pickupDate}. Counter hours: 8:00 AM - 5:00 PM.`,
            tone: "info",
            time: request.pickupDate,
            actionView: "requests",
            requestId: request.id,
          });
        }
      });

      if (currentUser.userType === "priority" || currentUser.isPriority) {
        list.unshift({
          id: "student-priority-banner",
          title: "Priority Student Active ⭐",
          text: "Your account is verified for Priority Line Processing at the Registrar.",
          tone: "success",
          time: "Official",
          actionView: "dashboard",
        });
      }

      return list;
    }

    // --- STAFF NOTIFICATIONS ---
    if (currentRole === "staff") {
      const list: NotificationItem[] = [];

      // Urgent requests
      const urgentRequests = requests.filter(
        (r) => r.priority === "Urgent" && r.status !== "Claimed"
      );
      urgentRequests.forEach((r) => {
        list.push({
          id: `staff-urgent-${r.id}`,
          title: `⚡ Urgent Request: ${r.id}`,
          text: `${r.student} requested ${r.document} (Line #${r.lineNumber ?? 1}). Requires express processing.`,
          tone: "urgent",
          time: r.date,
          actionView: "requests",
          requestId: r.id,
        });
      });

      // Pending requests in queue
      const pendingRequests = requests.filter((r) => r.status === "Pending");
      pendingRequests.slice(0, 5).forEach((r) => {
        list.push({
          id: `staff-pending-${r.id}`,
          title: `New Request: ${r.id}`,
          text: `${r.student} submitted ${r.document} (${r.purpose}).`,
          tone: "info",
          time: r.date,
          actionView: "requests",
          requestId: r.id,
        });
      });

      // Requests needing correction
      const correctionRequests = requests.filter(
        (r) => r.status === "Needs Correction"
      );
      correctionRequests.slice(0, 3).forEach((r) => {
        list.push({
          id: `staff-correction-${r.id}`,
          title: `Correction Flagged: ${r.id}`,
          text: `${r.student} - ${r.document}: ${r.remarks || "Awaiting student response"}`,
          tone: "warning",
          time: r.date,
          actionView: "requests",
          requestId: r.id,
        });
      });

      // Ready for claiming summary
      const readyCount = requests.filter(
        (r) => r.status === "Ready for Claiming"
      ).length;
      if (readyCount > 0) {
        list.push({
          id: "staff-ready-summary",
          title: `Ready for Claiming (${readyCount})`,
          text: `${readyCount} document(s) are prepared and waiting for student pickup at the window.`,
          tone: "success",
          time: "Today",
          actionView: "requests",
        });
      }

      return list;
    }

    if (currentRole === "admin") {
      const list: NotificationItem[] = [];

      // Pending student registrations
      const pendingUsers = adminUsers.filter(
        (u) => u.approvalStatus === "pending"
      );
      if (pendingUsers.length > 0) {
        list.push({
          id: `admin-pending-${pendingUsers.length}`,
          title: `⚠️ ${pendingUsers.length} Student Registration(s) Pending`,
          text: `New student account applications require admission review. Click to admit or reject.`,
          tone: "warning",
          time: "Action required",
          actionView: "users",
        });
      }

      // Urgent requests alert
      const urgentRequests = requests.filter(
        (r) => r.priority === "Urgent" && r.status !== "Claimed"
      );
      urgentRequests.slice(0, 3).forEach((r) => {
        list.push({
          id: `admin-urgent-${r.id}`,
          title: `⚡ Urgent Priority: ${r.id}`,
          text: `${r.student} - ${r.document} (${r.status}). Express processing flagged.`,
          tone: "urgent",
          time: r.date,
          actionView: "dashboard",
          requestId: r.id,
        });
      });

      // Active queue overview
      const pendingRequestsCount = requests.filter(
        (r) => r.status === "Pending"
      ).length;
      if (pendingRequestsCount > 0) {
        list.push({
          id: "admin-queue-overview",
          title: `Registrar Queue: ${pendingRequestsCount} Pending`,
          text: `${pendingRequestsCount} document requests currently queued for registrar action.`,
          tone: "info",
          time: "Live Queue",
          actionView: "dashboard",
        });
      }

      // System operational status
      list.push({
        id: "admin-system-active",
        title: "System Operational",
        text: `Connected as Administrator (${currentUser.email}). MongoDB Atlas cluster active.`,
        tone: "success",
        time: "Online",
        actionView: "dashboard",
      });

      return list;
    }

    return [];
  }, [requests, currentUser, adminUsers]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !readNotificationIds.includes(n.id))
      .length;
  }, [notifications, readNotificationIds]);

  const markAllNotificationsAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadNotificationIds(allIds);
    try {
      localStorage.setItem(
        "queueless_read_notifications",
        JSON.stringify(allIds)
      );
    } catch {
      // ignore
    }
  };

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
            <Button
              variant="ghost"
              size="icon"
              aria-label="Pickup Calendar & Schedule"
              title="Registrar Pickup Calendar & Schedule"
              onClick={() => setCalendarOpen(true)}
              className="relative cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <Calendar className="size-5" />
            </Button>

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
                className="relative cursor-pointer"
              >
                <Bell className="size-5" />

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white shadow ring-2 ring-card animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>

              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setNotificationsOpen(false)}
                  />

                  <div className="absolute right-0 top-12 z-40 w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-border bg-card p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-border/80 pb-3">
                      <div className="flex items-center gap-2">
                        <p className="font-display text-base font-bold text-foreground">
                          Notifications
                        </p>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-extrabold text-primary">
                            {unreadCount} new
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={markAllNotificationsAsRead}
                            className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Close notifications"
                          className="size-7 rounded-md cursor-pointer"
                          onClick={() => setNotificationsOpen(false)}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 max-h-[380px] overflow-y-auto space-y-2.5 pr-0.5">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <Notice
                            key={notification.id}
                            title={notification.title}
                            text={notification.text}
                            tone={notification.tone}
                            time={notification.time}
                            isUnread={
                              !readNotificationIds.includes(notification.id)
                            }
                            onClick={() => {
                              markNotificationAsRead(notification.id);
                              if (notification.requestId) {
                                const found = requests.find(
                                  (r) => r.id === notification.requestId
                                );
                                if (found) {
                                  setActiveReceiptModal(found);
                                }
                              }
                              if (notification.actionView) {
                                navigate(notification.actionView);
                              }
                              setNotificationsOpen(false);
                            }}
                          />
                        ))
                      ) : (
                        <div className="py-8 text-center">
                          <Bell className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                          <p className="text-sm font-medium text-foreground">
                            No notifications yet
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            You're all caught up with your updates!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
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

            <button
              type="button"
              onClick={() => {
                if (role === "student" || role === "guest") {
                  navigate("profile");
                }
              }}
              title={role === "student" || role === "guest" ? "Click to open My Profile & Password" : undefined}
              className={`ml-2 hidden items-center gap-3 border-l border-border pl-4 md:flex text-left transition rounded-xl py-1 px-2 -mr-2 ${
                role === "student" || role === "guest"
                  ? "hover:bg-accent/60 cursor-pointer group"
                  : ""
              }`}
            >
              <div className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground ring-2 ring-transparent group-hover:ring-primary/40 transition">
                {currentUser?.picture ? (
                  <img
                    src={currentUser.picture}
                    alt={name}
                    className="size-full object-cover"
                  />
                ) : (
                  <UserRound className="size-4" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold group-hover:text-primary transition">
                    {name}
                  </p>
                  {role === "student" && (
                    currentUser?.isPriority || currentUser?.userType === "priority" ? (
                      <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        ★ Priority
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border">
                        Guest
                      </span>
                    )
                  )}
                  {role === "guest" && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border">
                      Guest
                    </span>
                  )}
                </div>

                <p className="text-xs capitalize text-muted-foreground">
                  {role === "staff"
                    ? "Registrar staff"
                    : role === "guest" || currentUser?.userType === "normal" || currentUser?.studentId?.startsWith("GUEST")
                    ? "Guest"
                    : role}
                </p>
              </div>
            </button>
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

            {(role === "student" || role === "guest") && (
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

          {role === "student" || role === "guest" ? (
            <StudentView
              view={view}
              navigate={navigate}
              requests={requests}
              setRequests={setRequests}
              setFlash={setFlash}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              onOpenCalendar={() => setCalendarOpen(true)}
            />
          ) : role === "staff" ? (
            <StaffView
              view={view}
              navigate={navigate}
              requests={requests}
              setRequests={setRequests}
              setFlash={setFlash}
              onOpenCalendar={() => setCalendarOpen(true)}
            />
          ) : (
            <AdminView
              view={view}
              navigate={navigate}
              requests={requests}
              setFlash={setFlash}
              users={adminUsers}
              onUsersUpdated={fetchAdminUsers}
              onOpenCalendar={() => setCalendarOpen(true)}
            />
          )}
        </main>
      </div>

      {calendarOpen && (
        <PickupCalendarModal
          requests={requests}
          currentUser={currentUser}
          onClose={() => setCalendarOpen(false)}
          onSelectRequest={(req) => setActiveReceiptModal(req)}
          onUpdateRequest={(updated) =>
            setRequests(
              requests.map((r) => (r.id === updated.id ? updated : r))
            )
          }
        />
      )}

      {activeReceiptModal && (
        <DigitalReceiptModal
          request={activeReceiptModal}
          onClose={() => setActiveReceiptModal(null)}
          isStaff={currentUser?.role === "staff" || currentUser?.role === "admin"}
          onOpenCalendar={() => {
            setActiveReceiptModal(null);
            setCalendarOpen(true);
          }}
        />
      )}
    </div>
  );
}

function GoogleIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function AuthScreen({
  onSignIn,
}: {
  onSignIn: (user: AuthUser) => void;
}) {
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [mode, setMode] =
    useState<"login" | "register" | "guest-register" | "forgot-password">(
      "login"
    );

  const [registrationNotice, setRegistrationNotice] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [showGoogleModal, setShowGoogleModal] =
    useState(false);

  const [hasGoogleBtn, setHasGoogleBtn] =
    useState(false);

  const [customClientId, setCustomClientId] =
    useState(() => {
      return (
        (typeof window !== "undefined"
          ? localStorage.getItem("queueless_google_client_id")
          : "") ||
        (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
        ""
      );
    });

  const handleGoogleSuccess = async (authPayload: {
    credential?: string;
    access_token?: string;
  }) => {
    try {
      setGoogleLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...authPayload,
          loginType: "student",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (
          response.status === 403 ||
          (result.message &&
            (result.message.includes("registered as") ||
              result.message.includes("cannot sign in") ||
              result.message.includes("Cannot sign in") ||
              result.message.includes("Admin and Staff") ||
              result.message.includes("correct login option")))
        ) {
          setError("Cannot sign in.");
          return;
        }

        setError(result.message || "Google sign-in failed.");
        return;
      }

      if (!result.user || !result.token) {
        setError("Google sign-in succeeded, but session data is missing.");
        return;
      }

      if (result.user.role !== "student") {
        setError("Cannot sign in.");
        return;
      }

      localStorage.setItem("queueless_token", result.token);

      onSignIn({
        id: result.user.id,
        name: result.user.name,
        studentId: result.user.studentId,
        email: result.user.email,
        role: result.user.role,
        picture: result.user.picture,
        phone: result.user.phone || "",
        lastLogin: result.user.lastLogin || new Date().toISOString(),
        isPriority: result.user.isPriority,
        userType: result.user.userType,
      });
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Cannot connect to server. Ensure the backend is running.");
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    const activeClientId =
      customClientId || (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || "";
    if (!activeClientId) return;

    let isMounted = true;

    const setupGoogle = () => {
      // @ts-expect-error Google Identity Services loaded via script
      const google = window.google;
      if (!google?.accounts) return;

      if (google.accounts.id) {
        google.accounts.id.initialize({
          client_id: activeClientId,
          callback: (res: { credential?: string }) => {
            if (res.credential) {
              handleGoogleSuccess({ credential: res.credential });
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const container = document.getElementById("google-signin-btn-container");
        if (container && isMounted) {
          container.innerHTML = "";
          google.accounts.id.renderButton(container, {
            theme: "outline",
            size: "large",
            shape: "rectangular",
            text: "continue_with",
            logo_alignment: "left",
            width: 320,
          });
          setHasGoogleBtn(true);
        }
      }
    };

    setupGoogle();
    const timer = setInterval(() => {
      // @ts-expect-error Google Identity Services
      if (window.google?.accounts) {
        setupGoogle();
        clearInterval(timer);
      }
    }, 350);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customClientId, mode]);

  const handleCustomGoogleClick = () => {
    const activeClientId =
      customClientId || (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || "";
    if (!activeClientId) {
      setShowGoogleModal(true);
      return;
    }

    // @ts-expect-error Google Identity Services
    const google = window.google;

    // Use Google Identity Services OAuth 2.0 Token Client (opens the exact Account Chooser popup)
    if (google?.accounts?.oauth2) {
      try {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: activeClientId,
          scope: "openid email profile",
          prompt: "select_account",
          callback: (tokenResponse: { error?: string; access_token?: string }) => {
            if (tokenResponse.error) {
              if (tokenResponse.error !== "access_denied") {
                setError(`Google sign-in error: ${tokenResponse.error}`);
              }
              return;
            }
            if (tokenResponse.access_token) {
              handleGoogleSuccess({ access_token: tokenResponse.access_token });
            }
          },
        });
        tokenClient.requestAccessToken({ prompt: "select_account" });
        return;
      } catch (err) {
        console.error("Google OAuth2 token client error:", err);
      }
    }

    // Fallback direct OAuth 2.0 popup with prompt=select_account
    const width = 500;
    const height = 650;
    const left = window.screenLeft + (window.outerWidth - width) / 2;
    const top = window.screenTop + (window.outerHeight - height) / 2;

    const popupUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      activeClientId
    )}&redirect_uri=${encodeURIComponent(
      window.location.origin
    )}&response_type=token%20id_token&scope=openid%20email%20profile&prompt=select_account&nonce=${Date.now()}`;

    window.open(
      popupUrl,
      "GoogleSignInPopup",
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
    );
  };

  const submitLogin = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");

    const data = new FormData(
      e.currentTarget
    );

    const identity = String(
      data.get("identity") ?? ""
    ).trim();

    const password = String(
      data.get("password") ?? ""
    );

    if (!identity || password.length < 6) {
      setError(
        "Enter your Student ID or email, and a password with at least 6 characters."
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
            identifier: identity,
            email: identity,
            studentId: identity,
            password,
            loginType: "student",
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        if (
          result.message &&
          (result.message.includes("registered as") ||
            result.message === "Cannot sign in." ||
            result.message.includes("Admin and Staff"))
        ) {
          setError("Cannot sign in.");
          return;
        }

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

      if (result.user.role !== "student") {
        setError("Cannot sign in.");
        return;
      }

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

      onSignIn({
        id: result.user.id,
        name: result.user.name,
        studentId:
          result.user.studentId,
        email: result.user.email,
        role: result.user.role,
        picture: result.user.picture,
        phone: result.user.phone || "",
        lastLogin: result.user.lastLogin || new Date().toISOString(),
        isPriority: result.user.isPriority,
        userType: result.user.userType,
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

    const email = String(
      data.get("email") ?? ""
    ).trim();

    const studentId = String(
      data.get("studentId") ?? ""
    ).trim();

    const password = String(
      data.get("password") ?? ""
    );

    const confirmPassword = String(
      data.get("confirmPassword") ?? ""
    );

    if (
      !fullName ||
      !email
    ) {
      setError(
        "Please complete all required fields."
      );
      return;
    }

    const cleanEmail = email.toLowerCase();
    const isEduPh = cleanEmail.includes(".edu.ph") || cleanEmail.includes("phinmaed.com");

    if (!isEduPh) {
      setError(
        "Account creation is strictly for students with an official school email (.edu.ph or @phinmaed.com)."
      );
      return;
    }

    if (!studentId) {
      setError("Student ID is required (format: 00-0000-000000).");
      return;
    }

    const studentIdPattern = /^\d{2}-\d{4}-\d{5,6}$/;
    if (!studentIdPattern.test(studentId)) {
      setError(
        "Invalid Student ID format. Please use 00-0000-000000 (e.g. 02-2324-001234)."
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
            email,
            studentId,
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
      setRegistrationNotice(
        result.message ||
          "Thank you for joining us! Please just wait for 24hrs to be reviewed."
      );
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

  const submitGuestRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const data = new FormData(e.currentTarget);
    const fullName = String(data.get("fullName") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");

    if (!fullName || !email) {
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and Confirm Password must match.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (phone && cleanPhone.length < 10) {
      setError("Enter your valid phone number");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/register-guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          phone,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to create guest account.");
        return;
      }

      if (result.token && result.user) {
        localStorage.setItem("queueless_token", result.token);
        localStorage.setItem("queueless_user", JSON.stringify(result.user));
        onSignIn(result.user);
      } else {
        setMode("login");
      }
    } catch (error) {
      console.error("Guest registration error:", error);
      setError("Cannot connect to the server. Make sure the backend is running.");
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

          {registrationNotice ? (
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="size-8" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Registration Submitted
              </h2>
              <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40 p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Account Status: Pending Review
                </p>
                <p className="mt-1 text-sm font-bold text-emerald-950 dark:text-emerald-100">
                  {registrationNotice}
                </p>
                <p className="mt-2 text-xs text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                  The administrator has been notified. You will receive an email confirmation once your account has been reviewed.
                </p>
              </div>

              <Button
                className="mt-6 w-full"
                size="lg"
                onClick={() => {
                  setRegistrationNotice(null);
                  setMode("login");
                  setError("");
                }}
              >
                Back to Sign in
              </Button>
            </div>
          ) : mode === "login" ? (
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
                <Field label="Student ID or Email">
                  <input
                    name="identity"
                    type="text"
                    autoComplete="username"
                    className="field"
                    placeholder="Enter your username"
                    required
                  />
                </Field>

                <Field label="Password">
                  <div className="relative">
                    <input
                      name="password"
                      type={showLoginPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className="field pr-10"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </Field>

                <div className="flex justify-end -mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot-password");
                      setError("");
                    }}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

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

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 font-bold tracking-wider text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full gap-3 border-border font-semibold shadow-sm transition hover:bg-muted"
                  disabled={loading || googleLoading}
                  onClick={handleCustomGoogleClick}
                >
                  {googleLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Connecting with Google...</span>
                    </>
                  ) : (
                    <>
                      <GoogleIcon className="size-5 shrink-0" />
                      <span>Sign in with Google</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 text-xs">
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
          ) : mode === "register" ? (
            <Registration
              onBack={() => {
                setMode("login");
                setError("");
              }}
              onSubmit={submitRegister}
              error={error}
              loading={loading}
            />
          ) : mode === "guest-register" ? (
            <GuestRegistration
              onBack={() => {
                setMode("login");
                setError("");
              }}
              onSubmit={submitGuestRegister}
              error={error}
              loading={loading}
            />
          ) : (
            <ForgotPasswordWithOtp
              onBack={() => {
                setMode("login");
                setError("");
              }}
              onSuccess={() => {
                setMode("login");
                setError("");
              }}
            />
          )}
        </section>
      </div>

      {showGoogleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowGoogleModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <GoogleIcon className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Google Sign-In Configuration
                </h3>
                <p className="text-xs text-muted-foreground">
                  Connect your Google OAuth Client ID to activate Sign in with Google
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                To enable live Google Sign-In for PHINMA UPang, you need a Google OAuth Client ID:
              </p>
              <ol className="list-decimal space-y-1.5 pl-4 text-foreground/90">
                <li>
                  Go to{" "}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-primary underline"
                  >
                    Google Cloud Console &rarr; Credentials
                  </a>
                </li>
                <li>
                  Create an <strong>OAuth 2.0 Client ID</strong> (Application type: <strong>Web application</strong>).
                </li>
                <li>
                  Add Authorized JavaScript origin:{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-primary font-mono text-[11px]">
                    http://localhost:5173
                  </code>
                </li>
                <li>
                  Paste your Client ID below (or save in your <code className="rounded bg-muted px-1 py-0.5 font-mono">.env</code> file):
                </li>
              </ol>

              <div className="pt-2">
                <label className="block text-xs font-bold text-foreground">
                  Google Client ID:
                  <input
                    type="text"
                    value={customClientId}
                    onChange={(e) => setCustomClientId(e.target.value)}
                    placeholder="xxxxxxxxxxxx-xxxxxxxxxxxxxxxx.apps.googleusercontent.com"
                    className="field mt-1.5 w-full font-mono text-xs"
                  />
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowGoogleModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (customClientId.trim()) {
                    localStorage.setItem("queueless_google_client_id", customClientId.trim());
                  }
                  setShowGoogleModal(false);
                }}
              >
                Save & Initialize
              </Button>
            </div>
          </div>
        </div>
      )}
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
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  error: string;
  loading: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        Account creation is strictly for students with an official school email (.edu.ph / phinmaed.com) and Student ID (00-0000-000000).
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

        <div className="sm:col-span-2">
          <Field label="Student ID (Format: 00-0000-000000)">
            <input
              name="studentId"
              required
              className="field"
              placeholder="02-2324-001234"
              pattern="^\d{2}-\d{4}-\d{5,6}$"
              title="Please enter in 00-0000-000000 format (e.g. 02-2324-001234)"
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Institutional Email (.edu.ph / phinmaed.com)">
            <input
              name="email"
              type="email"
              required
              className="field"
              placeholder="yourname.edu.ph@gmail.com or student@up.phinma.edu.ph"
            />
          </Field>
        </div>

        
        <div className="sm:col-span-2">
          <Field label="Password">
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="field pr-10"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Confirm Password">
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                className="field pr-10"
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
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
            ? "Submitting registration..."
            : "Create account"}

          {!loading && (
            <ArrowRight />
          )}
        </Button>
      </form>
    </>
  );
}

function GuestRegistration({
  onBack,
  onSubmit,
  error,
  loading,
}: {
  onBack: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
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
        Outsider / Guest Portal
      </p>

      <h2 className="mt-2 font-display text-3xl font-bold">
        Guest Registration
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        For outsiders, alumni, and non-enrolled individuals requesting school documents. No student ID or institutional email required.
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
              placeholder="e.g. Maria Clara"
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Email Address (Any email e.g. Gmail, Yahoo)">
            <input
              name="email"
              type="email"
              required
              className="field"
              placeholder="e.g. yourname@gmail.com"
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Phone Number">
            <input
              name="phone"
              type="tel"
              inputMode="numeric"
              className="field font-mono text-sm"
              placeholder="Enter your valid phone number"
              maxLength={11}
              onInput={(e) => {
                const target = e.currentTarget;
                target.value = target.value.replace(/\D/g, "").slice(0, 11);
              }}
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Password">
            <input
              name="password"
              type="password"
              required
              className="field"
              placeholder="At least 6 characters"
              minLength={6}
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
              minLength={6}
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
            ? "Creating guest account..."
            : "Create Guest Account"}

          {!loading && (
            <ArrowRight />
          )}
        </Button>
      </form>
    </>
  );
}

function ForgotPasswordWithOtp({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<"request" | "verify" | "reset" | "success">("request");
  const [email, setEmail] = useState("");
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

  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || (res.status === 404 ? "No account found with this email address." : "Failed to send verification code."));
        return;
      }

      setStep("verify");
      setResendCooldown(60);
    } catch (err) {
      console.error(err);
      setError("Cannot connect to server. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
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
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Invalid or expired verification code.");
        return;
      }

      setStep("reset");
    } catch (err) {
      console.error(err);
      setError("Cannot connect to server. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
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
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Failed to reset password.");
        return;
      }

      setStep("success");
    } catch (err) {
      console.error(err);
      setError("Cannot connect to server. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

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

      {step === "request" && (
        <>
          <p className="mt-5 text-xs font-bold uppercase text-primary">
            Account recovery
          </p>

          <h2 className="mt-2 font-display text-3xl font-bold">
            Forgot password?
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Enter your registered email address (.edu.ph official school email or personal Gmail). We'll send you a 6-digit OTP code to verify your identity.
          </p>

          <form onSubmit={handleRequestOtp} className="mt-6 space-y-4">
            <Field label="Registered Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name.edu.ph@gmail.com or personal email"
                required
                className="field"
                autoFocus
              />
            </Field>

            {error && <InlineError text={error} />}

            <Button
              size="lg"
              className="w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending code..." : "Send Verification Code"}
              {!loading && <ArrowRight />}
            </Button>
          </form>
        </>
      )}

      {step === "verify" && (
        <>
          <p className="mt-5 text-xs font-bold uppercase text-primary">
            Step 2 of 3: Email Verification
          </p>

          <h2 className="mt-2 font-display text-3xl font-bold">
            Enter 6-digit OTP
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            We sent a 6-digit verification code to{" "}
            <strong className="text-foreground font-semibold">{email}</strong>.
            Please check your Gmail inbox and enter the code below.
          </p>

          <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
            <Field label="6-Digit Verification Code">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                required
                className="field text-center font-mono text-2xl font-bold tracking-[0.4em]"
                autoFocus
              />
            </Field>

            {error && <InlineError text={error} />}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Didn't receive code?</span>
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={handleRequestOtp}
                className="font-semibold text-primary hover:underline disabled:opacity-50 cursor-pointer"
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend Code"}
              </button>
            </div>

            <Button
              size="lg"
              className="w-full"
              type="submit"
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying..." : "Verify Code"}
              {!loading && <ArrowRight />}
            </Button>
          </form>
        </>
      )}

      {step === "reset" && (
        <>
          <p className="mt-5 text-xs font-bold uppercase text-primary">
            Step 3 of 3: New Password
          </p>

          <h2 className="mt-2 font-display text-3xl font-bold">
            Create new password
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Your email has been authenticated. Enter a new password for your account.
          </p>

          <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
            <Field label="New Password">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="field pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Eye className="size-4" />
                </button>
              </div>
            </Field>

            <Field label="Confirm New Password">
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                required
                className="field"
              />
            </Field>

            {error && <InlineError text={error} />}

            <Button
              size="lg"
              className="w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Resetting password..." : "Reset Password"}
              {!loading && <ArrowRight />}
            </Button>
          </form>
        </>
      )}

      {step === "success" && (
        <div className="mt-4 text-center py-4">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="size-8" />
          </div>

          <h3 className="text-2xl font-bold text-foreground">
            Password reset complete!
          </h3>

          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Your password has been securely updated. You can now sign in with your new credentials.
          </p>

          <Button
            size="lg"
            className="w-full mt-6"
            type="button"
            onClick={onSuccess}
          >
            Sign in to QueueLess <ArrowRight />
          </Button>
        </div>
      )}
    </>
  );
}

function StudentProfileView({
  currentUser,
  setCurrentUser,
  setFlash,
  onBack,
}: {
  currentUser: AuthUser;
  setCurrentUser: (u: AuthUser | null) => void;
  setFlash: (f: Flash) => void;
  onBack: () => void;
}) {
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.phone || "");
  const [editPicture, setEditPicture] = useState(currentUser.picture || "");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const formatLastLogin = (dateStr?: string) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    const validDate = isNaN(d.getTime()) ? new Date() : d;
    const dateFormatted = validDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeFormatted = validDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${dateFormatted}, ${timeFormatted}`;
  };

  const handleSaveProfile = async () => {
    const cleanDigits = editPhone.replace(/\D/g, "");
    if (!cleanDigits || cleanDigits.length < 10) {
      setFlash({
        tone: "error",
        text: "Enter your valid phone number",
      });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("queueless_token");
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName.trim(),
          phone: cleanDigits,
          picture: editPicture.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile.");

      const updatedUser: AuthUser = { ...currentUser, ...data.user };
      setCurrentUser(updatedUser);
      localStorage.setItem("queueless_user", JSON.stringify(updatedUser));

      setFlash({ tone: "success", text: "Profile updated successfully." });
    } catch (err) {
      setFlash({
        tone: "error",
        text: err instanceof Error ? err.message : "Failed to update profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const token = localStorage.getItem("queueless_token");
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password.");

      setPwSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const isGuestUser =
    currentUser.role === "guest" ||
    currentUser.userType === "normal" ||
    Boolean(currentUser.studentId?.startsWith("GUEST"));

  return (
    <div className="animate-rise">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-8 cursor-pointer">
          <ChevronLeft className="size-4" />
        </Button>
        <PageHeading
          eyebrow="Account settings"
          title="My Profile"
          text="View and manage your account information."
        />
      </div>

      {/* Profile Card */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Left: Profile Info */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
            <UserRound className="size-4 text-primary" /> Profile Information
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Update your personal details. Staff can view your phone number.</p>

          <div className="mt-5 space-y-4">
            {/* Avatar with Image Upload */}
            <div className="flex items-center gap-4">
              <div className="relative flex size-18 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary overflow-hidden border border-border">
                {editPicture ? (
                  <img src={editPicture} alt="Profile" className="size-full object-cover" />
                ) : (
                  <UserRound className="size-9" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-xs font-semibold text-foreground">Profile Photo</p>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-accent/80 text-xs font-bold hover:bg-accent cursor-pointer transition shadow-xs">
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === "string") {
                              setEditPicture(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {editPicture && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                      onClick={() => setEditPicture("")}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Field label="Full Name">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="field"
                required
              />
            </Field>

            <Field label="Phone Number">
              <input
                type="tel"
                inputMode="numeric"
                value={editPhone}
                onChange={(e) => {
                  const numbersOnly = e.target.value.replace(/\D/g, "");
                  setEditPhone(numbersOnly.slice(0, 11));
                }}
                placeholder="Enter your valid phone number"
                className="field"
                maxLength={11}
                required
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Enter your valid phone number
              </p>
            </Field>

            {/* Read-only fields */}
            <Field label="Email Address">
              <input type="email" value={currentUser.email} className="field bg-muted/50" readOnly />
            </Field>



            <div className="flex items-center justify-between rounded-lg bg-muted/50 border border-border px-4 py-3">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Last Login</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{formatLastLogin(currentUser.lastLogin)}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Role</p>
                <p className="text-sm font-bold text-foreground mt-0.5 capitalize">{isGuestUser ? "Guest" : currentUser.role}</p>
              </div>
            </div>

            <Button onClick={handleSaveProfile} disabled={saving} className="w-full gap-2 cursor-pointer">
              {saving ? (
                <><Loader2 className="size-4 animate-spin" /> Saving...</>
              ) : (
                <><CheckCircle2 className="size-4" /> Save Profile</>
              )}
            </Button>
          </div>
        </div>

        {/* Right: Change Password */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
            <Shield className="size-4 text-primary" /> Change Password
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Update your password to keep your account secure.</p>

          <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
            <Field label="Current Password">
              <div className="relative">
                <input
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="field pr-10"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showCurrentPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>

            <Field label="New Password">
              <div className="relative">
                <input
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="field pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showNewPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>

            <Field label="Confirm New Password">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="field"
                required
                minLength={6}
              />
            </Field>

            {pwError && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-2.5 text-xs font-semibold text-red-600 dark:text-red-400">
                {pwError}
              </div>
            )}

            {pwSuccess && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" /> {pwSuccess}
              </div>
            )}

            <Button type="submit" variant="outline" disabled={changingPassword} className="w-full gap-2 cursor-pointer">
              {changingPassword ? (
                <><Loader2 className="size-4 animate-spin" /> Changing...</>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>

          {/* Account Info */}
          <div className="mt-6 border-t border-border pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Account Details</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Account Type</span>
                <span className="font-semibold capitalize">{isGuestUser ? "Guest" : currentUser.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Priority Status</span>
                <span className="font-semibold">
                  {currentUser.isPriority ? "⭐ Priority Student" : "Regular Queue"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-semibold font-mono">{currentUser.phone || "Not set"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentView({
  view,
  navigate,
  requests,
  setRequests,
  setFlash,
  currentUser,
  setCurrentUser,
  onOpenCalendar,
}: {
  view: View;
  navigate: (v: View) => void;
  requests: RequestItem[];
  setRequests: (r: RequestItem[]) => void;
  setFlash: (f: Flash) => void;
  currentUser: AuthUser | null;
  setCurrentUser: (u: AuthUser | null) => void;
  onOpenCalendar?: () => void;
}) {
  const [selectedReceipt, setSelectedReceipt] = useState<RequestItem | null>(null);

  if (!currentUser) {
    return null;
  }

  const studentIdClean = (currentUser.studentId || "").trim().toLowerCase();
  const studentIdDigits = studentIdClean.replace(/[^a-z0-9]/g, "");
  const studentNameClean = (currentUser.name || "").trim().toLowerCase();

  const mine = requests.filter((r) => {
    const reqIdClean = (r.studentId || "").trim().toLowerCase();
    const reqIdDigits = reqIdClean.replace(/[^a-z0-9]/g, "");
    const reqNameClean = (r.student || "").trim().toLowerCase();

    return (
      (reqIdClean && reqIdClean === studentIdClean) ||
      (reqIdDigits && studentIdDigits && reqIdDigits === studentIdDigits) ||
      (reqNameClean && reqNameClean === studentNameClean)
    );
  });

  const isGuestUser =
    currentUser.role === "guest" ||
    currentUser.userType === "normal" ||
    Boolean(currentUser.studentId?.startsWith("GUEST"));

  if (view === "new") {
    if (isGuestUser && (!currentUser.phone || !currentUser.phone.trim())) {
      return (
        <div className="animate-rise max-w-xl mx-auto my-8">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center shadow-lg">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 mb-3">
              <Phone className="size-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">
              Contact Information Required
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Enter your valid phone number before requesting a document.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="outline"
                size="default"
                onClick={() => navigate("dashboard")}
                className="w-full sm:w-auto cursor-pointer"
              >
                Back to Dashboard
              </Button>
              <Button
                size="default"
                onClick={() => navigate("profile")}
                className="w-full sm:w-auto gap-2 font-bold cursor-pointer"
              >
                <UserRound className="size-4" /> Update Profile Now
              </Button>
            </div>
          </div>
        </div>
      );
    }

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

  if (view === "profile") {
    return (
      <StudentProfileView
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        setFlash={setFlash}
        onBack={() => navigate("dashboard")}
      />
    );
  }

  const isUserPriority = Boolean(
    currentUser.isPriority || currentUser.userType === "priority"
  );

  const formatLastLogin = (dateStr?: string) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    const validDate = isNaN(d.getTime()) ? new Date() : d;
    const dateFormatted = validDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeFormatted = validDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${dateFormatted}, ${timeFormatted}`;
  };

  return (
    <div className="animate-rise">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-border shadow-xs overflow-hidden">
            {currentUser.picture ? (
              <img src={currentUser.picture} alt={currentUser.name} className="size-full object-cover" />
            ) : (
              <UserRound className="size-7" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {isGuestUser ? "Guest Portal" : `Student portal • ID: ${currentUser.studentId}`}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Good day, {currentUser.name}!
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>PHINMA University of Pangasinan</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-semibold text-primary">
                <Clock3 className="size-3" />
                Last Login: {formatLastLogin(currentUser.lastLogin)}
              </span>
              {currentUser.phone && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-mono text-foreground font-medium">
                    <Phone className="size-3 text-emerald-600" />
                    {currentUser.phone}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Clean Quick Actions Row */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          size="default"
          onClick={() => {
            if (isGuestUser && (!currentUser.phone || !currentUser.phone.trim() || currentUser.phone.replace(/\D/g, "").length < 10)) {
              setFlash({
                tone: "error",
                text: "Enter your valid phone number",
              });
              navigate("profile");
            } else {
              navigate("new");
            }
          }}
          className="gap-2 cursor-pointer shadow-sm"
        >
          <FilePlus2 className="size-4" /> Request a Document
        </Button>

        {onOpenCalendar && (
          <Button
            variant="outline"
            size="default"
            onClick={onOpenCalendar}
            className="gap-2 cursor-pointer"
          >
            <Calendar className="size-4" /> Pickup Calendar
          </Button>
        )}

        <Button
          variant="outline"
          size="default"
          onClick={() => navigate("requests")}
          className="gap-2 cursor-pointer"
        >
          <ClipboardList className="size-4" /> View My Requests ({mine.length})
        </Button>
      </div>

      {/* Ready for Claiming Highlight Banner */}
      {mine.filter((r) => r.status === "Ready for Claiming").length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Document Ready for Claiming!</p>
              <p className="text-xs opacity-90">
                You have {mine.filter((r) => r.status === "Ready for Claiming").length} document(s) prepared and waiting at the registrar counter today.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              const readyReq = mine.find((r) => r.status === "Ready for Claiming");
              if (readyReq) setSelectedReceipt(readyReq);
            }}
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
          >
            View Release Pass & Receipt
          </Button>
        </div>
      )}

      {/* 4 Clean Activity Metrics */}
      <section className="mt-8">
        <SectionTitle
          eyebrow="Request overview"
          title="Your activity"
        />

        <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Metric
            label="Active queue"
            value={mine.filter((r) => r.status !== "Claimed").length}
            icon={<Clock3 />}
          />

          <Metric
            label="Processing"
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

          <Metric
            label="Claimed & Done"
            value={
              mine.filter(
                (r) =>
                  r.status ===
                  "Claimed"
              ).length
            }
            icon={<FileCheck2 />}
          />
        </div>
      </section>

      {/* Recent Requests Section */}
      <section className="mt-8">
        <SectionTitle
          eyebrow="Recent requests"
          title="Latest documents"
          action={mine.length > 0 ? "View all" : undefined}
          onAction={mine.length > 0 ? () => navigate("requests") : undefined}
        />

        <div className="mt-4">
          {mine.length > 0 ? (
            <RequestCards
              requests={[...mine]
                .sort((a, b) => {
                  if (a.status === "Claimed" && b.status !== "Claimed") return 1;
                  if (a.status !== "Claimed" && b.status === "Claimed") return -1;
                  return 0;
                })
                .slice(0, 3)}
              onSelect={setSelectedReceipt}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <FilePlus2 className="mx-auto size-8 text-muted-foreground/60 mb-2" />
              <p className="text-sm font-semibold text-foreground">No document requests yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                You haven't requested any documents yet. Submit your first request online anytime.
              </p>
              <Button
                size="sm"
                onClick={() => navigate("new")}
                className="mt-4 gap-2 cursor-pointer"
              >
                <FilePlus2 className="size-4" /> Start First Request
              </Button>
            </div>
          )}
        </div>
      </section>

      {selectedReceipt && (
        <DigitalReceiptModal
          request={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          isStaff={false}
          onOpenCalendar={onOpenCalendar}
        />
      )}
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

  const [copies, setCopies] =
    useState<number>(1);

  const [phone, setPhone] =
    useState(currentUser.phone || "");

  const [remarks, setRemarks] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [showConfirmModal, setShowConfirmModal] =
    useState(false);

  const handlePreSubmit = (
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

    const cleanDigits = phone.replace(/\D/g, "");
    if (!cleanDigits || cleanDigits.length < 10) {
      setError("Enter your valid phone number");
      return;
    }

    setShowConfirmModal(true);
  };

  const executeSubmit = async () => {
    setError("");

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

      if (!token) {
        setError("You are not authenticated. Please sign in again.");
        return;
      }

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
              student:
                currentUser.name,
              studentId:
                currentUser.studentId,
              document: doc,
              purpose:
                purpose.trim(),
              phone: phone.trim(),
              copies,
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
        phone: result.request.phone || phone.trim(),
        document: result.request.document,
        purpose: result.request.purpose,
        remarks: result.request.remarks || "",
        date: result.request.date,
        status: result.request.status,
        lineNumber: result.request.lineNumber,
        priority: result.request.priority || "Regular",
        copies: result.request.copies || copies || 1,
        pickupDate: result.request.pickupDate || "",
        paymentStatus: result.request.paymentStatus || "Proceed to Registrar Staff",
      };

      setShowConfirmModal(false);
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
        onSubmit={handlePreSubmit}
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
              <select
                className="field"
                value={copies}
                onChange={(e) => setCopies(Number(e.target.value))}
              >
                <option value={1}>
                  1 copy
                </option>

                <option value={2}>
                  2 copies
                </option>

                <option value={3}>
                  3 copies
                </option>
              </select>
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Phone Number">
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => {
                  const numbersOnly = e.target.value.replace(/\D/g, "");
                  setPhone(numbersOnly.slice(0, 11));
                }}
                placeholder="Enter your valid phone number"
                className="field"
                maxLength={11}
                required
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Enter your valid phone number
              </p>
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
              : "Review & Submit Request"}

            {!loading && (
              <ArrowRight />
            )}
          </Button>
        </div>
      </form>

      {/* Student Request Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => !loading && setShowConfirmModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirm Request Submission"
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 border-b border-border pb-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileCheck2 className="size-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Confirm Document Request
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Please review the details below before submitting to the Registrar's Office.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 rounded-xl border border-border bg-muted/20 p-4 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Document:</span>
                <span className="font-bold text-foreground text-right">{doc}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Number of Copies:</span>
                <span className="font-bold text-foreground">{copies} {copies === 1 ? "copy" : "copies"}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Purpose:</span>
                <span className="font-bold text-foreground text-right">{purpose}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Student Name:</span>
                <span className="font-semibold text-foreground">{currentUser.name}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Student ID Number:</span>
                <span className="font-mono font-semibold text-foreground">{currentUser.studentId}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Queue Ranking:</span>
                <span className="font-bold text-foreground">
                  {currentUser.isPriority || currentUser.userType === "priority" ? "⭐ Priority Lane (Official PHINMA)" : "Regular Queue"}
                </span>
              </div>
              {remarks.trim() && (
                <div className="flex flex-col py-1.5">
                  <span className="text-muted-foreground font-medium mb-1">Additional Remarks:</span>
                  <p className="rounded-md border border-border bg-background p-2.5 text-foreground font-medium italic">
                    "{remarks.trim()}"
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3 rounded-lg bg-primary/5 border border-primary/20 p-2.5 text-[11px] text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary shrink-0" />
              <span>An official Digital Request Receipt with your assigned queue line will be created immediately upon confirmation.</span>
            </div>

            {error && (
              <div className="mt-3">
                <InlineError text={error} />
              </div>
            )}

            <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
              >
                Back to Edit
              </Button>
              <Button
                type="button"
                onClick={executeSubmit}
                disabled={loading}
                className="gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    Confirm & Submit <CheckCircle2 className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ClaimedRecordBackup {
  id: string;
  student: string;
  studentId: string;
  document: string;
  purpose: string;
  remarks?: string;
  date: string;
  claimedAt: string;
  releasedBy: string;
  lineNumber?: number;
  priority?: Priority;
  copies?: number;
  pickupDate?: string;
}

const getClaimedBackupRecords = (allRequests: RequestItem[]): ClaimedRecordBackup[] => {
  try {
    const raw = localStorage.getItem("queueless_claimed_backup");
    const stored: ClaimedRecordBackup[] = raw ? JSON.parse(raw) : [];

    // Sync any requests with status "Claimed" that might not be in the archive yet
    const claimedInRequests = allRequests.filter((r) => r.status === "Claimed");
    let changed = false;

    claimedInRequests.forEach((req) => {
      if (!stored.some((item) => item.id === req.id)) {
        stored.unshift({
          id: req.id,
          student: req.student,
          studentId: req.studentId,
          document: req.document,
          purpose: req.purpose,
          remarks: req.remarks || "",
          date: req.date,
          claimedAt: req.pickupDate || req.date || "Completed",
          releasedBy: "Registrar Counter Officer",
          lineNumber: req.lineNumber,
          priority: req.priority,
          copies: req.copies || 1,
          pickupDate: req.pickupDate,
        });
        changed = true;
      }
    });

    if (changed) {
      localStorage.setItem("queueless_claimed_backup", JSON.stringify(stored));
    }

    return stored;
  } catch {
    return [];
  }
};

const archiveClaimedRecord = (req: RequestItem, staffName?: string) => {
  try {
    const raw = localStorage.getItem("queueless_claimed_backup");
    const stored: ClaimedRecordBackup[] = raw ? JSON.parse(raw) : [];
    const nowStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const existingIndex = stored.findIndex((s) => s.id === req.id);
    const newRecord: ClaimedRecordBackup = {
      id: req.id,
      student: req.student,
      studentId: req.studentId,
      document: req.document,
      purpose: req.purpose,
      remarks: req.remarks || "",
      date: req.date,
      claimedAt: nowStr,
      releasedBy: staffName || "Registrar Counter Officer",
      lineNumber: req.lineNumber,
      priority: req.priority,
      copies: req.copies || 1,
      pickupDate: req.pickupDate,
    };

    if (existingIndex >= 0) {
      stored[existingIndex] = newRecord;
    } else {
      stored.unshift(newRecord);
    }

    localStorage.setItem("queueless_claimed_backup", JSON.stringify(stored));
  } catch (err) {
    console.error("Archive claimed record error:", err);
  }
};

const exportClaimedBackupCsv = (records: ClaimedRecordBackup[]) => {
  const headers = [
    "Reference ID",
    "Student Name",
    "Student ID",
    "Document Type",
    "Purpose",
    "Copies",
    "Date Requested",
    "Date Claimed / Released",
    "Released By Officer",
    "Priority",
    "Queue Line",
  ];

  const rows = records.map((r) => [
    `"${r.id}"`,
    `"${(r.student || "").replace(/"/g, '""')}"`,
    `"${(r.studentId || "").replace(/"/g, '""')}"`,
    `"${(r.document || "").replace(/"/g, '""')}"`,
    `"${(r.purpose || "").replace(/"/g, '""')}"`,
    r.copies || 1,
    `"${r.date || ""}"`,
    `"${r.claimedAt || ""}"`,
    `"${(r.releasedBy || "Registrar Counter Officer").replace(/"/g, '""')}"`,
    `"${r.priority || "Regular"}"`,
    r.lineNumber || 1,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `QueueLess_Claimed_Documents_Backup_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function StaffView({
  view,
  navigate,
  requests,
  setRequests,
  setFlash,
  onOpenCalendar,
}: {
  view: View;
  navigate: (v: View) => void;
  requests: RequestItem[];
  setRequests: (
    r: RequestItem[]
  ) => void;
  setFlash: (f: Flash) => void;
  onOpenCalendar?: () => void;
}) {
  const [selectedReceipt, setSelectedReceipt] = useState<RequestItem | null>(null);
  const [staffTab, setStaffTab] = useState<"operations" | "claimed_vault">("operations");
  const [backupSearch, setBackupSearch] = useState("");
  const [backupRecords, setBackupRecords] = useState<ClaimedRecordBackup[]>(() =>
    getClaimedBackupRecords(requests)
  );

  useEffect(() => {
    setBackupRecords(getClaimedBackupRecords(requests));
  }, [requests]);

  if (view === "requests") {
    return (
      <ManageRequests
        requests={requests}
        setRequests={setRequests}
        setFlash={setFlash}
      />
    );
  }

  const filteredBackup = backupRecords.filter((b) => {
    const q = backupSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      b.id.toLowerCase().includes(q) ||
      b.student.toLowerCase().includes(q) ||
      b.studentId.toLowerCase().includes(q) ||
      b.document.toLowerCase().includes(q) ||
      b.purpose.toLowerCase().includes(q)
    );
  });

  return (
    <div className="animate-rise">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeading
          eyebrow="Registrar workspace"
          title="Staff Operations & Archive"
          text="Review, process, and permanently archive released student documents."
        />

        {/* Tab switchers */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-1">
          <Button
            size="sm"
            variant={staffTab === "operations" ? "default" : "ghost"}
            onClick={() => setStaffTab("operations")}
            className="text-xs h-8 gap-1.5"
          >
            <ClipboardList className="size-3.5" /> Active Queue
          </Button>
          <Button
            size="sm"
            variant={staffTab === "claimed_vault" ? "default" : "ghost"}
            onClick={() => setStaffTab("claimed_vault")}
            className="text-xs h-8 gap-1.5"
          >
            <FileCheck2 className="size-3.5" /> Claimed Backup Vault
            <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.2 text-[10px] font-black">
              {backupRecords.length}
            </span>
          </Button>
          {onOpenCalendar && (
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenCalendar}
              className="text-xs h-8 gap-1.5 ml-1 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
            >
              <Calendar className="size-3.5" /> Pickup Calendar
            </Button>
          )}
        </div>
      </div>

      {staffTab === "operations" ? (
        <>
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
              label="Ready for Pickup"
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
              label="Done / Claimed"
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
                requests={[...requests]
                  .sort((a, b) => {
                    // Active requests first so new requests are immediately visible
                    if (a.status === "Claimed" && b.status !== "Claimed") return 1;
                    if (a.status !== "Claimed" && b.status === "Claimed") return -1;
                    return 0;
                  })
                  .slice(0, 4)}
                onSelect={setSelectedReceipt}
              />
            </div>
          </section>
        </>
      ) : (
        /* CLAIMED DOCUMENTS BACKUP VAULT TAB */
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary">
                    Permanent Records Ledger
                  </span>
                  <span className="text-xs text-muted-foreground">
                    • 100% Backed Up & Verified
                  </span>
                </div>
                <h3 className="mt-1 font-display text-lg font-bold text-foreground">
                  Claimed Documents Backup Archive
                </h3>
                <p className="text-xs text-muted-foreground">
                  Safely stores completed and received student credentials. Used for accreditation audits, re-verifications, and records ledger.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportClaimedBackupCsv(filteredBackup)}
                  disabled={filteredBackup.length === 0}
                  className="gap-1.5 text-xs h-9 cursor-pointer"
                >
                  <Printer className="size-3.5" /> Export Backup (.CSV)
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    setBackupRecords(getClaimedBackupRecords(requests));
                    setFlash({
                      tone: "success",
                      text: "Claimed documents ledger synchronized successfully.",
                    });
                  }}
                  className="gap-1.5 text-xs h-9 cursor-pointer"
                >
                  <CheckCircle2 className="size-3.5" /> Sync Ledger
                </Button>
              </div>
            </div>

            {/* Archive Metrics */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-primary/10 pt-4">
              <div>
                <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                  Total Archived Releases
                </p>
                <p className="text-xl font-black text-foreground mt-0.5">
                  {backupRecords.length}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                  Transcripts (TOR)
                </p>
                <p className="text-xl font-black text-foreground mt-0.5">
                  {backupRecords.filter((b) => b.document.includes("Transcript")).length}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                  Certificates / Diplomas
                </p>
                <p className="text-xl font-black text-foreground mt-0.5">
                  {backupRecords.filter((b) => !b.document.includes("Transcript")).length}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                  Vault Integrity
                </p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="size-4" /> Active & Ledger Synced
                </p>
              </div>
            </div>
          </div>

          {/* Search Filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search archive by student name, ID number, document type, or reference ID..."
                value={backupSearch}
                onChange={(e) => setSearchBackup(e.target.value)}
                className="field pl-9 h-10 text-xs"
              />
            </div>
            {backupSearch && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchBackup("")}
                className="text-xs h-10"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Claimed Documents Table / Cards */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
            <div className="border-b border-border bg-muted/40 px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Archived Release Slips ({filteredBackup.length})
              </span>
              <span className="text-[11px] text-muted-foreground">
                Click any record to inspect or print official release receipt
              </span>
            </div>

            {filteredBackup.length > 0 ? (
              <div className="divide-y divide-border">
                {filteredBackup.map((rec) => {
                  // Find full request object if available to render receipt
                  const fullReq = requests.find((r) => r.id === rec.id) || {
                    id: rec.id,
                    student: rec.student,
                    studentId: rec.studentId,
                    document: rec.document,
                    purpose: rec.purpose,
                    remarks: rec.remarks || "",
                    date: rec.date,
                    status: "Claimed" as Status,
                    lineNumber: rec.lineNumber || 1,
                    priority: rec.priority || "Regular",
                    copies: rec.copies || 1,
                    pickupDate: rec.pickupDate || rec.claimedAt,
                  };

                  return (
                    <div
                      key={rec.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-muted/30 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-mono font-bold text-xs">
                          ✓
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-foreground">
                              {rec.id}
                            </span>
                            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                              Claimed & Released
                            </span>
                            {rec.priority === "Urgent" && (
                              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                                ⚡ Urgent
                              </span>
                            )}
                            {rec.priority === "Priority" && (
                              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                                ★ Priority
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs font-bold text-foreground">
                            {rec.document}{" "}
                            <span className="font-normal text-muted-foreground">
                              ({rec.copies || 1} {rec.copies === 1 ? "copy" : "copies"})
                            </span>
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                            <span>
                              Student:{" "}
                              <strong className="text-foreground">
                                {rec.student}
                              </strong>{" "}
                              ({rec.studentId})
                            </span>
                            <span>•</span>
                            <span>
                              Purpose: <em>{rec.purpose}</em>
                            </span>
                            <span>•</span>
                            <span>
                              Released:{" "}
                              <span className="text-foreground font-medium">
                                {rec.claimedAt}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedReceipt(fullReq)}
                          className="h-8 text-xs gap-1.5 cursor-pointer"
                        >
                          <FileText className="size-3.5" /> View Release Slip
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <FileCheck2 className="mx-auto size-8 opacity-40 mb-2" />
                <p className="text-xs font-semibold text-foreground">No claimed records found</p>
                <p className="text-[11px] opacity-75 mt-0.5">
                  {backupSearch
                    ? "No archived documents match your search query."
                    : "When students claim their requested documents, they will automatically be preserved in this backup vault."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedReceipt && (
        <DigitalReceiptModal
          request={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          isStaff={true}
          onOpenCalendar={onOpenCalendar}
        />
      )}
    </div>
  );
}

function StaffCalendarEditModal({
  request,
  onClose,
  onSave,
  saving = false,
}: {
  request: RequestItem;
  onClose: () => void;
  onSave: (updated: {
    pickupDate: string;
    status: Status;
    lineNumber: number;
    priority: Priority;
    remarks: string;
  }) => void;
  saving?: boolean;
}) {
  const [pickupDate, setPickupDate] = useState(request.pickupDate || "");
  const [status, setStatus] = useState<Status>(request.status);
  const [lineNumber, setLineNumber] = useState<number>(request.lineNumber ?? 1);
  const [priority, setPriority] = useState<Priority>(request.priority || "Regular");
  const [remarks, setRemarks] = useState(request.remarks || "");

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      pickupDate: pickupDate.trim(),
      status,
      lineNumber: Number(lineNumber),
      priority,
      remarks: remarks.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={() => !saving && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Staff Reschedule Request"
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Calendar className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Staff Reschedule & Queue Editor
              </h3>
              <p className="text-xs text-muted-foreground">
                {request.id} • {request.student}
              </p>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            disabled={saving}
            className="size-8"
          >
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleFormSubmit} className="mt-4 space-y-3.5">
          <Field label="Scheduled Counter Pickup Date">
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="field"
              required
            />
          </Field>

          {/* Dynamic quick date shortcuts for upcoming weekdays */}
          <div className="flex flex-wrap gap-1.5 text-[10px]">
            <span className="text-muted-foreground font-semibold self-center mr-1">Quick:</span>
            {(() => {
              const shortcuts: { label: string; value: string }[] = [];
              const d = new Date();
              d.setDate(d.getDate() + 1);
              while (shortcuts.length < 3) {
                const day = d.getDay();
                if (day !== 0 && day !== 6) {
                  const yyyy = d.getFullYear();
                  const mm = String(d.getMonth() + 1).padStart(2, "0");
                  const dd = String(d.getDate()).padStart(2, "0");
                  const isoDate = `${yyyy}-${mm}-${dd}`;
                  const label = d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
                  shortcuts.push({ label, value: isoDate });
                }
                d.setDate(d.getDate() + 1);
              }
              return shortcuts.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setPickupDate(s.value)}
                  className="rounded-md border border-border bg-muted/60 px-2 py-0.5 font-medium hover:border-primary cursor-pointer"
                >
                  {s.label}
                </button>
              ));
            })()}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Queue Line #">
              <input
                type="number"
                min={1}
                value={lineNumber}
                onChange={(e) => setLineNumber(Number(e.target.value))}
                className="field"
                required
              />
            </Field>

            <Field label="Priority Level">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="field"
              >
                <option value="Regular">Regular</option>
                <option value="Priority">Priority</option>
                <option value="Urgent">Urgent</option>
              </select>
            </Field>
          </div>

          <Field label="Status">
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

          <Field label="Registrar Instructions / Remarks">
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Window 2 ready for pickup"
              className="field resize-none py-2 text-xs"
            />
          </Field>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="gap-1.5 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Saving...
                </>
              ) : (
                "Save Schedule & Update"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PickupCalendarModal({
  requests,
  currentUser,
  onClose,
  onSelectRequest,
  onUpdateRequest,
}: {
  requests: RequestItem[];
  currentUser: AuthenticatedUser | null;
  onClose: () => void;
  onSelectRequest?: (req: RequestItem) => void;
  onUpdateRequest?: (req: RequestItem) => void;
}) {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<number | null>(() => new Date().getDate());
  const [filterType, setFilterType] = useState<
    "active" | "all" | "ready" | "processing" | "done" | "mine"
  >("active");
  const [editingReq, setEditingReq] = useState<RequestItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [statusNotice, setStatusNotice] = useState("");

  const isStaffUser =
    currentUser?.role === "staff" || currentUser?.role === "admin";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(today.getDate());
  };

  // Accurate local timezone-safe date parser
  const parseRequestDate = (dateStr?: string): Date | null => {
    if (!dateStr || typeof dateStr !== "string") return null;
    const trimmed = dateStr.trim();
    if (!trimmed) return null;

    const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
      return new Date(
        parseInt(isoMatch[1], 10),
        parseInt(isoMatch[2], 10) - 1,
        parseInt(isoMatch[3], 10)
      );
    }

    const textMatch = trimmed.match(/^([a-zA-Z]+)\s+(\d{1,2}),?\s*(\d{4})/);
    if (textMatch) {
      const monthPrefix = textMatch[1].slice(0, 3).toLowerCase();
      const monthMap: Record<string, number> = {
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11,
      };
      if (monthMap[monthPrefix] !== undefined) {
        return new Date(
          parseInt(textMatch[3], 10),
          monthMap[monthPrefix],
          parseInt(textMatch[2], 10)
        );
      }
    }

    const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slashMatch) {
      return new Date(
        parseInt(slashMatch[3], 10),
        parseInt(slashMatch[1], 10) - 1,
        parseInt(slashMatch[2], 10)
      );
    }

    const fallback = new Date(trimmed);
    return isNaN(fallback.getTime()) ? null : fallback;
  };

  // Group requests by day in current active month
  const requestsByDay = useMemo(() => {
    const map: Record<number, RequestItem[]> = {};

    requests.forEach((req) => {
      const d = parseRequestDate(req.pickupDate) || parseRequestDate(req.date);
      if (d && d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(req);
      }
    });

    return map;
  }, [requests, year, month]);

  // Appointment counts: active appointments (reduced when claimed) vs done/claimed
  const { activeThisMonth, doneThisMonth, totalThisMonth } = useMemo(() => {
    let active = 0;
    let done = 0;
    let total = 0;
    Object.values(requestsByDay).forEach((items) => {
      items.forEach((item) => {
        total++;
        if (item.status === "Claimed") {
          done++;
        } else {
          active++;
        }
      });
    });
    return { activeThisMonth: active, doneThisMonth: done, totalThisMonth: total };
  }, [requestsByDay]);

  const displayedRequests = useMemo(() => {
    let list: RequestItem[] = [];

    if (selectedDay !== null) {
      list = requestsByDay[selectedDay] || [];
    } else {
      Object.keys(requestsByDay).forEach((key) => {
        list.push(...requestsByDay[Number(key)]);
      });
    }

    if (filterType === "active") {
      list = list.filter((r) => r.status !== "Claimed");
    } else if (filterType === "ready") {
      list = list.filter((r) => r.status === "Ready for Claiming");
    } else if (filterType === "processing") {
      list = list.filter((r) => r.status === "Processing");
    } else if (filterType === "done") {
      list = list.filter((r) => r.status === "Claimed");
    } else if (filterType === "mine" && currentUser) {
      const studentIdClean = (currentUser.studentId || "").trim().toLowerCase();
      const studentNameClean = (currentUser.name || "").trim().toLowerCase();
      list = list.filter(
        (r) =>
          (r.studentId &&
            r.studentId.trim().toLowerCase() === studentIdClean) ||
          (r.student && r.student.trim().toLowerCase() === studentNameClean)
      );
    }

    return list;
  }, [requestsByDay, selectedDay, filterType, currentUser]);

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  // Handle staff saving calendar schedule changes
  const handleSaveCalendarSchedule = async (updated: {
    pickupDate: string;
    status: Status;
    lineNumber: number;
    priority: Priority;
    remarks: string;
  }) => {
    if (!editingReq) return;

    const token = localStorage.getItem("queueless_token");
    setSavingEdit(true);

    try {
      if (token) {
        await fetch(
          `${API_URL}/api/requests/${encodeURIComponent(editingReq.id)}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updated),
          }
        );
      }

      const updatedItem: RequestItem = {
        ...editingReq,
        ...updated,
      };

      if (onUpdateRequest) {
        onUpdateRequest(updatedItem);
      }

      if (updated.status === "Claimed") {
        archiveClaimedRecord(updatedItem, currentUser?.name || "Registrar Staff");
      }

      setStatusNotice(`Schedule for ${editingReq.id} updated successfully.`);
      setTimeout(() => setStatusNotice(""), 4000);
      setEditingReq(null);
    } catch (err) {
      console.error("Calendar schedule save error:", err);
      // Fallback local update
      const updatedItem: RequestItem = {
        ...editingReq,
        ...updated,
      };
      if (onUpdateRequest) {
        onUpdateRequest(updatedItem);
      }
      setEditingReq(null);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Registrar Pickup Calendar & Schedule"
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Calendar className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold text-foreground">
                  Registrar Pickup Calendar & Schedule
                </h3>
                {isStaffUser ? (
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                    Staff Mode (Editable)
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    Student View
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Track document releasing dates, counter schedules, and claim deadlines
              </p>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            aria-label="Close calendar"
            className="size-8 cursor-pointer"
          >
            <X className="size-4" />
          </Button>
        </div>

        {statusNotice && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Month Navigation & Controls */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h4 className="font-display text-base font-bold text-foreground">
              {monthNames[month]} {year}
            </h4>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
              {activeThisMonth} scheduled
            </span>
            {doneThisMonth > 0 && (
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                ✓ {doneThisMonth} Done
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={jumpToToday}
              className="h-8 text-xs font-semibold cursor-pointer"
            >
              Today
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={prevMonth}
              aria-label="Previous Month"
              className="size-8 cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={nextMonth}
              aria-label="Next Month"
              className="size-8 cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-[11px] font-bold py-2">
            <div className="text-red-400/70">Sun</div>
            <div className="text-muted-foreground">Mon</div>
            <div className="text-muted-foreground">Tue</div>
            <div className="text-muted-foreground">Wed</div>
            <div className="text-muted-foreground">Thu</div>
            <div className="text-muted-foreground">Fri</div>
            <div className="text-red-400/70">Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr gap-px bg-border/60">
            {/* Blank cells */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div
                key={`blank-${i}`}
                className="bg-card/40 min-h-[58px] sm:min-h-[68px] p-1.5 opacity-30"
              />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isToday = isCurrentMonth && today.getDate() === dayNum;
              const isSelected = selectedDay === dayNum;
              const dayOfWeek = new Date(year, month, dayNum).getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const dayRequests = requestsByDay[dayNum] || [];
              const activeRequests = dayRequests.filter(
                (r) => r.status !== "Claimed"
              );
              const doneRequests = dayRequests.filter(
                (r) => r.status === "Claimed"
              );
              const activeCount = activeRequests.length;
              const doneCount = doneRequests.length;

              const hasReady = activeRequests.some(
                (r) => r.status === "Ready for Claiming"
              );
              const hasProcessing = activeRequests.some(
                (r) => r.status === "Processing"
              );

              return (
                <button
                  type="button"
                  key={`day-${dayNum}`}
                  onClick={() =>
                    setSelectedDay(dayNum === selectedDay ? null : dayNum)
                  }
                  className={`relative min-h-[58px] sm:min-h-[68px] p-1.5 text-left transition flex flex-col justify-between ${
                    isSelected
                      ? "bg-primary/10 ring-2 ring-primary ring-inset z-10"
                      : isWeekend
                      ? "bg-muted/30 cursor-pointer"
                      : "bg-card hover:bg-muted/50 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                        isToday
                          ? "bg-primary text-primary-foreground font-black shadow-sm"
                          : isSelected
                          ? "text-primary font-black"
                          : isWeekend
                          ? "text-muted-foreground/60"
                          : "text-foreground"
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Weekend label */}
                    {isWeekend && activeCount === 0 && doneCount === 0 ? (
                      <span className="text-[8px] font-semibold text-muted-foreground/50 uppercase">
                        Closed
                      </span>
                    ) : activeCount > 0 ? (
                      <span className="rounded-full bg-primary/15 px-1.5 py-0.2 text-[9px] font-black text-primary">
                        {activeCount}
                      </span>
                    ) : doneCount > 0 ? (
                      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                        ✓ Done
                      </span>
                    ) : null}
                  </div>

                  {activeCount > 0 ? (
                    <div className="mt-1 flex items-center gap-1 flex-wrap">
                      {hasReady && (
                        <span
                          className="size-2 rounded-full bg-emerald-500"
                          title="Ready for Claiming"
                        />
                      )}
                      {hasProcessing && (
                        <span
                          className="size-2 rounded-full bg-blue-500"
                          title="Processing"
                        />
                      )}
                      {!hasReady && !hasProcessing && (
                        <span
                          className="size-2 rounded-full bg-amber-500"
                          title="Pending / Scheduled"
                        />
                      )}
                      <span className="text-[9px] font-semibold text-muted-foreground truncate hidden sm:inline">
                        {activeRequests[0].document.split(" ")[0]}
                      </span>
                    </div>
                  ) : doneCount > 0 ? (
                    <div className="mt-1 flex items-center gap-1 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-2.5 shrink-0" />
                      <span className="truncate hidden sm:inline">All Claimed</span>
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground px-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" /> Ready for Claiming
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-blue-500" /> Processing
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-500" /> Pending / Scheduled
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" /> Done / Claimed (Reduced)
            </span>
          </div>
          <span className="text-[10px] italic">
            Counter Releasing Hours: 8:00 AM - 5:00 PM (Mon-Fri)
          </span>
        </div>

        {/* Schedule List Filter & Heading */}
        <div className="mt-5 border-t border-border pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {selectedDay !== null
                  ? `Appointments on ${monthNames[month]} ${selectedDay}, ${year}`
                  : `All Scheduled Pickups in ${monthNames[month]} ${year}`}
              </h4>
              <p className="text-xs text-foreground font-semibold mt-0.5">
                {displayedRequests.length} document request(s) found
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                size="sm"
                variant={filterType === "active" ? "default" : "outline"}
                onClick={() => setFilterType("active")}
                className="h-7 text-xs px-2.5 cursor-pointer"
              >
                Active ({activeThisMonth})
              </Button>
              <Button
                size="sm"
                variant={filterType === "all" ? "default" : "outline"}
                onClick={() => setFilterType("all")}
                className="h-7 text-xs px-2.5 cursor-pointer"
              >
                All ({totalThisMonth})
              </Button>
              <Button
                size="sm"
                variant={filterType === "ready" ? "default" : "outline"}
                onClick={() => setFilterType("ready")}
                className="h-7 text-xs px-2.5 cursor-pointer"
              >
                Ready
              </Button>
              <Button
                size="sm"
                variant={filterType === "processing" ? "default" : "outline"}
                onClick={() => setFilterType("processing")}
                className="h-7 text-xs px-2.5 cursor-pointer"
              >
                Processing
              </Button>
              <Button
                size="sm"
                variant={filterType === "done" ? "default" : "outline"}
                onClick={() => setFilterType("done")}
                className="h-7 text-xs px-2.5 cursor-pointer text-emerald-600 dark:text-emerald-400"
              >
                ✓ Done ({doneThisMonth})
              </Button>
              {currentUser?.role === "student" && (
                <Button
                  size="sm"
                  variant={filterType === "mine" ? "default" : "outline"}
                  onClick={() => setFilterType("mine")}
                  className="h-7 text-xs px-2.5 cursor-pointer"
                >
                  My Requests
                </Button>
              )}
            </div>
          </div>

          {/* List of Requests */}
          <div className="mt-3 space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {displayedRequests.length > 0 ? (
              displayedRequests.map((req) => (
                <div
                  key={req.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border p-3 shadow-xs transition ${
                    req.status === "Claimed"
                      ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
                        req.status === "Claimed"
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {req.status === "Claimed" ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        `#${req.lineNumber ?? 1}`
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {req.id}
                        </span>
                        <StatusBadge status={req.status} />
                        {req.status === "Claimed" && (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            ✓ Done & Released
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-foreground mt-0.5">
                        {req.document}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Student: {req.student} • Pickup:{" "}
                        <span
                          className={`font-medium ${
                            req.status === "Claimed"
                              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                              : "text-foreground"
                          }`}
                        >
                          {req.pickupDate || req.date}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Staff Only: Reschedule / Edit Schedule */}
                    {isStaffUser && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingReq(req)}
                        className="h-7 text-xs gap-1 cursor-pointer"
                      >
                        <Edit3 className="size-3.5" /> Edit Schedule
                      </Button>
                    )}

                    {onSelectRequest && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onSelectRequest(req);
                          onClose();
                        }}
                        className="h-7 text-xs gap-1 cursor-pointer"
                      >
                        <FileText className="size-3.5" /> View Receipt
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border py-8 text-center text-muted-foreground">
                <Calendar className="mx-auto size-7 mb-1.5 opacity-40" />
                <p className="text-xs font-medium">No pickup appointments scheduled</p>
                <p className="text-[11px] opacity-75 mt-0.5">
                  {selectedDay !== null
                    ? `No releases scheduled for ${monthNames[month]} ${selectedDay}, ${year}. Click another day or filter.`
                    : "No requests found matching the current filter."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-end border-t border-border pt-3">
          <Button size="sm" onClick={onClose} className="cursor-pointer">
            Close
          </Button>
        </div>
      </div>

      {/* Staff Calendar Reschedule Modal */}
      {editingReq && isStaffUser && (
        <StaffCalendarEditModal
          request={editingReq}
          onClose={() => setEditingReq(null)}
          onSave={handleSaveCalendarSchedule}
          saving={savingEdit}
        />
      )}
    </div>
  );
}

function DigitalReceiptModal({
  request,
  onClose,
  isStaff = false,
  onEdit,
  onOpenCalendar,
}: {
  request: RequestItem;
  onClose: () => void;
  isStaff?: boolean;
  onEdit?: () => void;
  onOpenCalendar?: () => void;
}) {
  const [currentReq, setCurrentReq] = useState<RequestItem>(request);
  const [showInternalEdit, setShowInternalEdit] = useState(false);
  const [internalSaving, setInternalSaving] = useState(false);
  const [editFlash, setEditFlash] = useState("");

  const lineNum = currentReq.lineNumber ?? 1;
  const isClaimed = currentReq.status === "Claimed";
  const isReadyForClaiming = currentReq.status === "Ready for Claiming";

  useEffect(() => {
    document.body.classList.add("modal-receipt-open");
    return () => {
      document.body.classList.remove("modal-receipt-open");
    };
  }, []);

  const getPriorityBadge = (p?: Priority) => {
    if (p === "Urgent") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive print:border-black print:bg-white print:text-black">
          Urgent
        </span>
      );
    }
    if (p === "Priority") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 print:border-black print:bg-white print:text-black">
          Priority Lane
        </span>
      );
    }
    return null;
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
    paymentStatus: string;
  }) => {
    try {
      setInternalSaving(true);
      const token = localStorage.getItem("queueless_token");

      if (token) {
        await fetch(
          `${API_URL}/api/requests/${encodeURIComponent(currentReq.id)}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updated),
          }
        );
      }

      const updatedItem: RequestItem = {
        ...currentReq,
        ...updated,
      };

      setCurrentReq(updatedItem);

      if (updated.status === "Claimed") {
        archiveClaimedRecord(updatedItem, "Registrar Staff");
      }

      if (onEdit) {
        onEdit();
      }

      setEditFlash("Receipt & line details updated successfully.");
      setTimeout(() => setEditFlash(""), 3500);
      setShowInternalEdit(false);
    } catch (err) {
      console.error("Save receipt error:", err);
      setCurrentReq((prev) => ({ ...prev, ...updated }));
      setShowInternalEdit(false);
    } finally {
      setInternalSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150 print:relative print:inset-auto print:bg-white print:p-0 print:block print-receipt-container"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Official Document Receipt"
        className="relative w-full max-w-xl max-h-[94vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl print:border-none print:shadow-none print:max-w-full print:p-0 print-receipt-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Screen Close Button */}
        <div className="flex justify-end print:hidden -mt-1 -mr-1 mb-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            aria-label="Close receipt"
            className="cursor-pointer size-8"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Official Institutional Letterhead */}
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground print:text-black">
            PHINMA Education • Republic of the Philippines
          </p>
          <h1 className="font-serif text-lg font-black uppercase tracking-wider text-foreground print:text-black leading-tight mt-0.5">
            PHINMA University of Pangasinan
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-wide text-primary print:text-black">
            Office of the University Registrar
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground print:text-gray-700">
            Arellano Street, Dagupan City, Pangasinan 2400 • Tel: (075) 522-5635
          </p>
        </div>

        {/* Divider Rule */}
        <div className="my-3 border-t-2 border-b border-foreground/30 py-0.5 print:border-black" />

        {/* Receipt Title & Status Bar */}
        <div className="flex items-center justify-between border-b border-border pb-3 print:border-black">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-foreground print:text-black">
              {isClaimed
                ? "Official Document Release Receipt"
                : isReadyForClaiming
                ? "Official Document Claim Stub"
                : "Registrar Request Receipt"}
            </h2>
            <p className="text-[10px] text-muted-foreground print:text-gray-700">
              {isClaimed
                ? "Proof of document release and claim acknowledgement"
                : isReadyForClaiming
                ? "Present at registrar counter to claim your requested document"
                : "Student copy • Keep for tracking your request"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {currentReq.priority && currentReq.priority !== "Regular" && getPriorityBadge(currentReq.priority)}
            <StatusBadge status={currentReq.status} />
          </div>
        </div>

        {editFlash && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 print:hidden">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{editFlash}</span>
          </div>
        )}

        {/* Ready for Claiming Info Box */}
        {isReadyForClaiming && (
          <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs print:border-black print:bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 font-semibold">
              <span className="text-foreground print:text-black">
                Line #{lineNum} • Counter Window 2 (Releasing Desk)
              </span>
              <span className="text-xs font-bold text-primary print:text-black">
                When to Claim: {currentReq.pickupDate || "Within the day"}
              </span>
            </div>
            {currentReq.paymentStatus && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground print:text-black">Payment:</span>
                <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-bold ${
                  currentReq.paymentStatus === "Paid"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 print:border-black print:text-black"
                    : currentReq.paymentStatus.toLowerCase().includes("within the day")
                    ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 print:border-black print:text-black"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 print:border-black print:text-black"
                }`}>
                  {currentReq.paymentStatus}
                </span>
              </div>
            )}
            <p className="mt-1 text-[11px] text-muted-foreground print:text-gray-700">
              Please present your valid student ID or authorization letter when claiming at the registrar counter.
            </p>
          </div>
        )}

        {/* In Queue Helper */}
        {!isClaimed && !isReadyForClaiming && (
          <div className="mt-3 rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs print:border-black print:bg-white">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground print:text-black">
                Queue Line #{lineNum}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground print:text-black">
                When to Claim: {currentReq.pickupDate || "Standard Schedule"}
              </span>
            </div>
            {currentReq.paymentStatus && (
              <p className="mt-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 print:text-black">
                Payment: {currentReq.paymentStatus}
              </p>
            )}
          </div>
        )}

        {/* Receipt Details Grid */}
        <div className="mt-4 rounded-xl border border-border bg-muted/15 p-4 sm:p-5 print:border-black print:bg-white print:p-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground print:text-gray-600">
                Reference No.
              </p>
              <p className="mt-0.5 font-mono text-sm font-bold text-foreground print:text-black">
                {currentReq.id}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-muted-foreground print:text-gray-600">
                Date Filed
              </p>
              <p className="mt-0.5 text-sm font-semibold text-foreground print:text-black">
                {currentReq.date}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-muted-foreground print:text-gray-600">
                Student Name
              </p>
              <p className="mt-0.5 text-sm font-bold text-foreground print:text-black">
                {currentReq.student}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-muted-foreground print:text-gray-600">
                Student ID No.
              </p>
              <p className="mt-0.5 font-mono text-sm font-bold text-foreground print:text-black">
                {currentReq.studentId}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-muted-foreground print:text-gray-600">
                Contact Phone
              </p>
              <p className="mt-0.5 text-sm font-medium text-foreground print:text-black">
                {currentReq.phone || "On File"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-muted-foreground print:text-gray-600">
                Queue Line
              </p>
              <p className="mt-0.5 text-sm font-bold text-foreground print:text-black">
                Line #{lineNum}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-muted-foreground print:text-gray-600">
                Document Requested
              </p>
              <p className="mt-0.5 text-sm font-bold text-foreground print:text-black">
                {currentReq.document}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-muted-foreground print:text-gray-600">
                Copies
              </p>
              <p className="mt-0.5 text-sm font-medium text-foreground print:text-black">
                {currentReq.copies || 1} {currentReq.copies === 1 ? "copy" : "copies"}
              </p>
            </div>

            <div className="col-span-2 border-t border-border/60 pt-3 print:border-gray-300">
              <p className="text-[11px] font-medium text-muted-foreground print:text-gray-600">
                Purpose
              </p>
              <p className="mt-0.5 text-sm font-medium text-foreground print:text-black">
                {currentReq.purpose || "Official Record Request"}
              </p>
            </div>

            <div className="border-t border-border/60 pt-3 print:border-gray-300">
              <p className="text-[11px] font-medium text-muted-foreground print:text-gray-600">
                {isClaimed ? "Date Claimed" : "When to Claim"}
              </p>
              <p className="mt-0.5 text-sm font-bold text-foreground print:text-black">
                {currentReq.pickupDate || (isClaimed ? currentReq.date : "Within the day")}
              </p>
            </div>

            <div className="border-t border-border/60 pt-3 print:border-gray-300">
              <p className="text-[11px] font-medium text-muted-foreground print:text-gray-600">
                Payment Requirement
              </p>
              <div className="mt-0.5">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${
                    currentReq.paymentStatus === "Paid"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 print:border-black print:text-black"
                      : currentReq.paymentStatus?.toLowerCase().includes("within the day")
                      ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 print:border-black print:text-black"
                      : currentReq.paymentStatus === "Exempted / Free of Charge"
                      ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30 print:border-black print:text-black"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 print:border-black print:text-black"
                  }`}
                >
                  {currentReq.paymentStatus || "Proceed to Registrar Staff"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Remarks */}
        {currentReq.remarks && (
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-900 dark:text-amber-200 print:border-black print:bg-white print:text-black">
            <p className="font-bold">Remarks:</p>
            <p className="mt-0.5">{currentReq.remarks}</p>
          </div>
        )}

        {/* Signatures Section */}
        <div className="mt-6 border-t border-border pt-4 print:border-black">
          <div className="grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-b border-foreground/60 print:border-black w-4/5 mx-auto mb-1 h-8"></div>
              <p className="font-bold text-foreground print:text-black">{currentReq.student}</p>
              <p className="text-[10px] text-muted-foreground print:text-gray-700">
                {isClaimed ? "Receiver's Signature" : "Student Signature"}
              </p>
            </div>

            <div>
              <div className="border-b border-foreground/60 print:border-black w-4/5 mx-auto mb-1 h-8"></div>
              <p className="font-bold text-foreground print:text-black">Registrar Staff</p>
              <p className="text-[10px] text-muted-foreground print:text-gray-700">Authorized Signature</p>
            </div>
          </div>
        </div>

        {/* Action Buttons (Screen Only) */}
        <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4 print:hidden">
          {isStaff && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInternalEdit(true)}
              className="gap-1.5 cursor-pointer text-xs"
            >
              <Edit3 className="size-3.5" /> Edit Details & Line
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 cursor-pointer font-bold shadow-sm text-xs"
          >
            <Printer className="size-3.5" /> Print Receipt
          </Button>
          <Button size="sm" variant="outline" onClick={onClose} className="cursor-pointer text-xs">
            Close
          </Button>
        </div>
      </section>

      {/* Staff Edit Modal */}
      {showInternalEdit && (
        <EditReceiptModal
          request={currentReq}
          onClose={() => setShowInternalEdit(false)}
          onSave={handleSaveReceiptEdit}
          loading={internalSaving}
        />
      )}
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
    paymentStatus: string;
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
  const [paymentStatus, setPaymentStatus] = useState<string>(
    request.paymentStatus || "Proceed to Registrar Staff"
  );

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
      paymentStatus: paymentStatus.trim(),
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
            <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2 mt-0.5">
              <span>{request.id} • {request.student} ({request.studentId})</span>
              {request.phone && (
                <a
                  href={`tel:${request.phone}`}
                  className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                  title="Call student"
                >
                  <Phone className="size-3" /> {request.phone}
                </a>
              )}
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

          <Field label="When to Claim (Release Schedule)">
            <div className="space-y-1.5">
              <input
                type="text"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                placeholder="e.g. Within the day (Today) • Window 2 (1:00 PM)"
                className="field"
              />
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {[
                  "Within the day (Today)",
                  "Tomorrow • Window 2",
                  "Ready for Claiming Now",
                  "Standard Schedule",
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setPickupDate(preset)}
                    className={`rounded border px-2 py-0.5 font-medium transition-colors cursor-pointer ${
                      pickupDate === preset
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </Field>

          <Field label="Payment Requirement & Instruction">
            <div className="space-y-1.5">
              <input
                type="text"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                placeholder="e.g. Prepare payment within the day"
                className="field"
              />
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {[
                  "Prepare payment within the day",
                  "Proceed to Registrar Staff",
                  "Paid",
                  "Pending Payment",
                  "Pay upon claiming at Counter",
                  "Exempted / Free of Charge",
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setPaymentStatus(preset)}
                    className={`rounded border px-2 py-0.5 font-medium transition-colors cursor-pointer ${
                      paymentStatus === preset
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
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
  const [status, setStatus] = useState("Active");

  // Receipt view and edit modals
  const [viewingReceipt, setViewingReceipt] = useState<RequestItem | null>(null);
  const [editingReceipt, setEditingReceipt] = useState<RequestItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const shown = useMemo(
    () =>
      requests
        .filter((r) => {
          // If status is "Active", remove Claimed/Done items so new requests come there!
          const statusMatch =
            status === "Active"
              ? r.status !== "Claimed"
              : status === "All"
              ? true
              : r.status === status;

          const queryMatch = `${r.id} ${r.student} ${r.document} line #${r.lineNumber ?? 1}`
            .toLowerCase()
            .includes(query.toLowerCase());

          return statusMatch && queryMatch;
        })
        .sort((a, b) => {
          const pWeight = { Urgent: 3, Priority: 2, Regular: 1 };
          const wA = pWeight[a.priority ?? "Regular"] ?? 1;
          const wB = pWeight[b.priority ?? "Regular"] ?? 1;
          if (wA !== wB) return wB - wA;
          return (a.lineNumber ?? 0) - (b.lineNumber ?? 0);
        }),
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

      if (result.request.status === "Claimed") {
        const found = requests.find((r) => r.id === id);
        if (found) {
          archiveClaimedRecord(
            { ...found, status: "Claimed" },
            "Registrar Staff"
          );
        }
      }

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
    paymentStatus: string;
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

      if (updated.status === "Claimed") {
        archiveClaimedRecord(updatedItem, "Registrar Staff");
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
          className="field sm:w-56 font-medium"
        >
          <option value="Active">Active Queue (Excludes Claimed)</option>
          <option value="All">All Requests (Including Claimed)</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Ready for Claiming">Ready for Claiming</option>
          <option value="Needs Correction">Needs Correction</option>
          <option value="Claimed">Claimed / Done (Archived)</option>
        </select>
      </div>

      {/* Claimed Archival Notice */}
      {status === "Active" && requests.some((r) => r.status === "Claimed") && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
            <span>
              {requests.filter((r) => r.status === "Claimed").length} completed/claimed document(s) have been removed from the active queue and stored in the <strong>Claimed Documents Backup Vault</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setStatus("Claimed")}
            className="text-primary hover:underline font-semibold shrink-0 cursor-pointer"
          >
            Show Claimed
          </button>
        </div>
      )}

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
                  <p className="text-xs text-muted-foreground font-mono">{r.studentId}</p>
                  {r.phone ? (
                    <a
                      href={`tel:${r.phone}`}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                      title="Click to call student"
                    >
                      <Phone className="size-3" />
                      {r.phone}
                    </a>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/60 italic">No phone</span>
                  )}
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
  users = [],
  onUsersUpdated,
  onOpenCalendar,
}: {
  view: View;
  navigate: (v: View) => void;
  requests: RequestItem[];
  setFlash: (f: Flash) => void;
  users?: AccountUser[];
  onUsersUpdated?: () => void;
  onOpenCalendar?: () => void;
}) {
  const [selectedReceipt, setSelectedReceipt] = useState<RequestItem | null>(null);

  if (view === "users") {
    return (
      <UsersPanel
        setFlash={setFlash}
        onUsersUpdated={onUsersUpdated}
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

  const pendingCount = users.filter((u) => u.approvalStatus === "pending").length;

  return (
    <div className="animate-rise">
      <PageHeading
        eyebrow="Administration"
        title="System overview"
        text="Manage access, document types, and system records."
      />

      {pendingCount > 0 && (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between text-amber-950 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-sm">
                {pendingCount} Student Application{pendingCount > 1 ? "s" : ""} Pending Review
              </p>
              <p className="text-xs opacity-90">
                New student registrations are waiting for admission verification.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 font-bold cursor-pointer"
            onClick={() => navigate("users")}
          >
            Review Applications →
          </Button>
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric
          label="User accounts"
          value={users.length}
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
            onSelect={setSelectedReceipt}
          />
        </div>
      </section>

      {selectedReceipt && (
        <DigitalReceiptModal
          request={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          isStaff={true}
          onOpenCalendar={onOpenCalendar}
        />
      )}
    </div>
  );
}

function UsersPanel({
  setFlash,
  onUsersUpdated,
}: {
  setFlash: (f: Flash) => void;
  onUsersUpdated?: () => void;
}) {
  const [users, setUsers] = useState<AccountUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Role Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "pending" | "student" | "staff" | "admin"
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
      onUsersUpdated?.();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const createdStaff = result.user as { id?: string; _id?: string; name: string; studentId?: string };
      setUsers((prev) => [
        {
          id:
            createdStaff.id ||
            createdStaff._id ||
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

  const handleApproveUser = async (u: AccountUser) => {
    const token = localStorage.getItem("queueless_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/auth/users/${u.id}/approve`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to admit account.");

      setFlash({
        tone: "success",
        text: `${u.name} has been admitted/approved.`,
      });
      fetchUsers();
    } catch (err) {
      setFlash({
        tone: "error",
        text: err instanceof Error ? err.message : "Failed to admit account.",
      });
    }
  };

  const handleRejectUser = async (u: AccountUser) => {
    const token = localStorage.getItem("queueless_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/auth/users/${u.id}/reject`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reject account.");

      setFlash({
        tone: "success",
        text: `${u.name}'s registration has been rejected.`,
      });
      fetchUsers();
    } catch (err) {
      setFlash({
        tone: "error",
        text: err instanceof Error ? err.message : "Failed to reject account.",
      });
    }
  };

  // Filtered accounts
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const roleMatch =
        roleFilter === "all"
          ? true
          : roleFilter === "pending"
          ? u.approvalStatus === "pending"
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
      pending: users.filter((u) => u.approvalStatus === "pending").length,
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
              onClick={() => setRoleFilter("pending")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                roleFilter === "pending"
                  ? "bg-amber-600 text-white font-bold"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <span>Pending Review</span>
              {counts.pending > 0 && (
                <span className="rounded-full bg-amber-100 text-amber-900 px-1.5 py-0.2 text-[10px] font-extrabold">
                  {counts.pending}
                </span>
              )}
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
                  {u.approvalStatus === "pending" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                      <Clock3 className="size-3" /> Pending Review (24h)
                    </span>
                  )}
                  {u.approvalStatus === "rejected" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-700 dark:text-rose-400">
                      <X className="size-3" /> Rejected
                    </span>
                  )}
                  {isCurrentUser && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                      You
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span>{u.studentId || u.id}</span>
                  <span>·</span>
                  <span>{u.email}</span>
                  {u.phone && (
                    <>
                      <span>·</span>
                      <a
                        href={`tel:${u.phone}`}
                        className="font-mono font-semibold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        title="Call user"
                      >
                        <Phone className="size-3" /> {u.phone}
                      </a>
                    </>
                  )}
                  {u.lastLogin && (
                    <>
                      <span>·</span>
                      <span className="text-[11px] text-muted-foreground/80">
                        Last login: {new Date(u.lastLogin).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {u.approvalStatus === "pending" && (
                  <>
                    <Button
                      size="sm"
                      className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                      onClick={() => handleApproveUser(u)}
                    >
                      <Check className="size-3.5" /> Admit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 text-xs gap-1"
                      onClick={() => handleRejectUser(u)}
                    >
                      <X className="size-3.5" /> Reject
                    </Button>
                  </>
                )}
                {u.approvalStatus === "rejected" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1"
                    onClick={() => handleApproveUser(u)}
                  >
                    <Check className="size-3.5" /> Admit
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={Boolean(isCurrentUser)}
                  title={
                    isCurrentUser
                      ? "You cannot delete your own active admin account"
                      : `Delete ${u.name}`
                  }
                  className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive text-xs"
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
            <div
              className={`flex sm:flex-col items-center justify-center rounded-lg border px-3 py-1.5 min-w-[70px] text-center ${
                r.status === "Claimed"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-primary/20 bg-primary/10 text-primary"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1 sm:mr-0">
                {r.status === "Claimed" ? "Done" : "Line"}
              </span>
              <span
                className={`text-base font-black ${
                  r.status === "Claimed"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-primary"
                }`}
              >
                {r.status === "Claimed" ? "✓" : `#${r.lineNumber ?? 1}`}
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
    status === "Ready for Claiming"
      ? "bg-success-soft text-success border border-emerald-500/30"
      : status === "Processing"
      ? "bg-info-soft text-info border border-blue-500/30"
      : status === "Claimed"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40"
      : status === "Needs Correction"
      ? "bg-warning-soft text-warning-foreground border border-amber-500/30"
      : "bg-muted text-muted-foreground border border-border";

  return (
    <span
      className={`${tone} inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold`}
    >
      {status === "Claimed" ? (
        <>
          <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" /> Done / Claimed
        </>
      ) : (
        status
      )}
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
  tone = "info",
  time,
  isUnread = false,
  onClick,
}: {
  title: string;
  text: string;
  tone?: "success" | "warning" | "info" | "urgent";
  time?: string;
  isUnread?: boolean;
  onClick?: () => void;
}) {
  const getIcon = () => {
    switch (tone) {
      case "urgent":
        return <AlertTriangle className="size-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />;
      case "success":
        return <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Clock3 className="size-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getIconBg = () => {
    switch (tone) {
      case "urgent":
        return "bg-destructive/15 text-destructive border-destructive/20";
      case "warning":
        return "bg-amber-500/15 text-amber-600 border-amber-500/20";
      case "success":
        return "bg-emerald-500/15 text-emerald-600 border-emerald-500/20";
      default:
        return "bg-blue-500/15 text-blue-600 border-blue-500/20";
    }
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`group relative flex gap-3 rounded-lg border p-3 text-left transition ${
        isUnread
          ? "border-primary/40 bg-primary/5 shadow-xs hover:bg-primary/10"
          : "border-border/60 bg-muted/40 hover:bg-muted"
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      <div
        className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border ${getIconBg()}`}
      >
        {getIcon()}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <p className="text-xs font-bold text-foreground truncate">{title}</p>
          {time && (
            <span className="shrink-0 text-[10px] text-muted-foreground font-medium">
              {time}
            </span>
          )}
        </div>

        <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {text}
        </p>

        {onClick && (
          <p className="mt-1.5 text-[10px] font-semibold text-primary group-hover:underline flex items-center gap-1">
            Open details <ChevronRight className="size-3" />
          </p>
        )}
      </div>

      {isUnread && (
        <span className="absolute top-3 right-2 size-2 rounded-full bg-primary" />
      )}
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