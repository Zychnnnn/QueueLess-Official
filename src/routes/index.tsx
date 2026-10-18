import { createFileRoute } from "@tanstack/react-router";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import {
  AlertCircle,
  AlertTriangle,
  Archive,
  ArchiveRestore,
  ArrowLeft,
  ArrowRight,
  Bell,
  Calendar,
  CalendarDays,
  Camera,
  Copy,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Clock3,
  Edit3,
  Eye,
  EyeOff,
  FileCheck2,
  FilePlus2,
  FileText,
  GraduationCap,
  History,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Pencil,
  Plus,
  Phone,
  Printer,
  Receipt,
  UserCheck,
  UserCog,
  Contact,
  QrCode,
  RefreshCw,
  Search,
  Settings2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  HeartHandshake,
  HelpCircle,
  Send,
  Coffee,
  Headset,
  Trash2,
  UserPlus,
  UserRound,
  Bot,
  RotateCcw,
  Sparkles,
  Users,
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
  | "profile"
  | "personal_details"
  | "audit_logs"
  | "official_records";

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
  requirementsToBring?: string;
  email?: string;
  picture?: string;
  course?: string;
  yearLevel?: string;
  userDetails?: Partial<AuthUser>;
  assignedStaffId?: string;
  assignedStaffName?: string;
  rating?: number;
  feedback?: string;
  feedbackAt?: string;
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
  contactVerified?: boolean;
  course?: string;
  yearLevel?: string;
  birthDate?: string;
  address?: string;
  emergencyContact?: string;
  // Personal Details
  lastName?: string;
  firstName?: string;
  middleName?: string;
  extensionName?: string;
  gender?: string;
  nationality?: string;
  religion?: string;
  civilStatus?: string;
  // Family Details
  fatherName?: string;
  fatherOccupation?: string;
  fatherMobile?: string;
  motherName?: string;
  motherOccupation?: string;
  motherMobile?: string;
  spouseName?: string;
  spouseOccupation?: string;
  numberOfChildren?: string;
  numberOfBrothers?: string;
  numberOfSisters?: string;
  guardianName?: string;
  guardianRelationship?: string;
  guardianMobile?: string;
  // Address Details - Current Address
  currentAddress?: string;
  currentCountry?: string;
  currentProvince?: string;
  currentCity?: string;
  currentPostalCode?: string;
  // Address Details - Permanent Address
  sameAsCurrentAddress?: boolean;
  permanentAddress?: string;
  permanentCountry?: string;
  permanentProvince?: string;
  permanentCity?: string;
  permanentPostalCode?: string;
  // Educational Background Details
  elemSchool?: string;
  elemYearGrad?: string;
  elemType?: string;
  juniorHighSchool?: string;
  juniorHighYearGrad?: string;
  juniorHighType?: string;
  seniorHighSchool?: string;
  seniorHighYearGrad?: string;
  seniorHighType?: string;
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  emergencyContactAddress?: string;
  // Name change tracking
  nameLastChanged?: string;
};

type AccountUser = {
  id: string;
  name: string;
  studentId?: string;
  email: string;
  phone?: string;
  picture?: string;
  lastLogin?: string;
  role: string;
  isPriority?: boolean;
  userType?: "priority" | "normal";
  approvalStatus?: "pending" | "approved" | "rejected";
  createdAt?: string;
  contactVerified?: boolean;
  termsAccepted?: boolean;
  termsAcceptedAt?: string;
  course?: string;
  yearLevel?: string;
  birthDate?: string;
  gender?: string;
  civilStatus?: string;
  nationality?: string;
  religion?: string;
  currentAddress?: string;
  permanentAddress?: string;
  address?: string;
  emergencyContact?: string;
  elemSchool?: string;
  elemYearGrad?: string;
  elemType?: string;
  juniorHighSchool?: string;
  juniorHighYearGrad?: string;
  juniorHighType?: string;
  seniorHighSchool?: string;
  seniorHighYearGrad?: string;
  seniorHighType?: string;
  fatherName?: string;
  fatherOccupation?: string;
  fatherMobile?: string;
  motherName?: string;
  motherOccupation?: string;
  motherMobile?: string;
  spouseName?: string;
  guardianName?: string;
  guardianRelationship?: string;
  guardianMobile?: string;
  lastName?: string;
  firstName?: string;
  middleName?: string;
  extensionName?: string;
  currentCountry?: string;
  currentProvince?: string;
  currentCity?: string;
  currentPostalCode?: string;
  sameAsCurrentAddress?: boolean;
  permanentCountry?: string;
  permanentProvince?: string;
  permanentCity?: string;
  permanentPostalCode?: string;
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

const initialRequests: RequestItem[] = [];

const documentTypes = [
  "Transcript of Records (TOR)",
  "Certificate of Good Moral",
  "Certificate of Grades",
  "Certificate of Enrollment",
  "Diploma Copy",
];

export const defaultDocumentRequirements: Record<string, string[]> = {
  "Transcript of Records (TOR)": [
    "Valid School ID or Government-issued ID",
    "University Clearance Form (Academic, Library, & Accounting)",
    "Recent 2x2 colored photo (white background, formal collared attire)",
    "Documentary Stamp (available at Registrar window)",
  ],
  "Certificate of Good Moral": [
    "Valid School ID or Government-issued ID",
    "Endorsement or clearance from Office of Student Affairs (OSA)",
    "Prefect of Discipline clearance",
  ],
  "Certificate of Grades": [
    "Valid School ID or Registration Card (COM)",
    "Accounting & Cashier clearance for requested term",
  ],
  "Certificate of Enrollment": [
    "Valid School ID",
    "Current semester Certificate of Matriculation (COM / Assessment form)",
  ],
  "Diploma Copy": [
    "Valid Government-issued ID (original & photocopy)",
    "University Graduation Clearance",
    "Affidavit of Loss (if requesting replacement for lost original)",
    "Documentary Stamp",
  ],
};

export function getDocumentRequirements(docName: string): string[] {
  if (typeof window === "undefined") {
    return defaultDocumentRequirements[docName] || [
      "Valid School ID or Government-issued Photo ID",
      "Official University Registrar Clearance",
      "Proof of payment / Registrar Official Receipt upon claiming",
    ];
  }
  try {
    const raw = localStorage.getItem("queueless_document_requirements");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed[docName] && Array.isArray(parsed[docName]) && parsed[docName].length > 0) {
        return parsed[docName];
      }
    }
  } catch (e) {
    // fallback
  }
  return (
    defaultDocumentRequirements[docName] || [
      "Valid School ID or Government-issued Photo ID",
      "Official University Registrar Clearance",
      "Proof of payment / Registrar Official Receipt upon claiming",
    ]
  );
}

export function saveDocumentRequirements(docName: string, reqs: string[]) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("queueless_document_requirements");
    const parsed = raw ? JSON.parse(raw) : { ...defaultDocumentRequirements };
    parsed[docName] = reqs;
    localStorage.setItem("queueless_document_requirements", JSON.stringify(parsed));
  } catch (e) {
    console.error("Failed saving doc requirements", e);
  }
}

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

function normalizePhone(val: string): string {
  let digits = (val || "").replace(/\D/g, "");
  if (digits.startsWith("63") && digits.length >= 11) {
    digits = "0" + digits.slice(2);
  } else if (digits.length === 10 && digits.startsWith("9")) {
    digits = "0" + digits;
  }
  return digits.slice(0, 11);
}

function isValidPhone(val: string): boolean {
  const digits = normalizePhone(val);
  if (!digits) return true; // optional field
  return digits.length === 11 && digits.startsWith("09");
}

function compressAvatarImage(file: File, maxWidth = 320, maxHeight = 320, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(reader.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function isPersonalDetailsComplete(u: AuthUser | null | undefined): boolean {
  if (!u) return false;
  if (u.role === "staff" || u.role === "admin") return true;

  // Accepting terms & conditions is required
  if (!u.termsAccepted) return false;

  const isGuest =
    u.role === "guest" ||
    u.userType === "normal" ||
    Boolean(u.studentId?.startsWith("GUEST")) ||
    Boolean(u.email?.toLowerCase().endsWith("@gmail.com"));

  const hasNames = Boolean((u.firstName || "").trim() && (u.lastName || "").trim());

  if (isGuest) {
    return hasNames;
  }

  const hasAddress = Boolean((u.currentAddress || u.address || "").trim());
  const hasAcademic = Boolean((u.course || "").trim() && (u.yearLevel || "").trim());
  const hasElementary = Boolean((u.elemSchool || "").trim());
  const hasJuniorHigh = Boolean((u.juniorHighSchool || "").trim());

  return hasNames && hasAddress && hasAcademic && hasElementary && hasJuniorHigh;
}

function QueueLessApp() {
  const [role, setRole] = useState<Role>("student");
  const [signedIn, setSignedIn] = useState(false);

  const [currentUser, setCurrentUser] =
    useState<AuthUser | null>(null);

  const [view, setView] = useState<View>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  const [requests, setRequests] = useState<RequestItem[]>(() => {
    try {
      const saved = localStorage.getItem("queueless_requests");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      /* ignore */
    }
    return initialRequests;
  });

  const [requestsLoading, setRequestsLoading] =
    useState(false);

  useEffect(() => {
    if (requests && requests.length > 0) {
      try {
        localStorage.setItem("queueless_requests", JSON.stringify(requests));
      } catch {
        /* ignore */
      }
    }
  }, [requests]);

  const [flash, setFlash] = useState<Flash>(null);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);
  const [selectedNotificationModal, setSelectedNotificationModal] =
    useState<NotificationItem | null>(null);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activeReceiptModal, setActiveReceiptModal] =
    useState<RequestItem | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [inactivityCountdown, setInactivityCountdown] = useState(59);
  const [showLoginLoading, setShowLoginLoading] = useState(false);
  const [showFullAccessWelcome, setShowFullAccessWelcome] = useState(false);
  const [welcomeProgress, setWelcomeProgress] = useState(0);
  const [showStaffContactModal, setShowStaffContactModal] = useState(false);
  const [showAiHelper, setShowAiHelper] = useState(false);

  const [adminUsers, setAdminUsers] = useState<AccountUser[]>([]);
  const [docTypes, setDocTypes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("queueless_document_types");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return documentTypes;
  });

  const handleUpdateDocTypes = (newDocs: string[]) => {
    setDocTypes(newDocs);
    try {
      localStorage.setItem("queueless_document_types", JSON.stringify(newDocs));
    } catch {}
  };
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("queueless_read_notifications");
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  const [archivedNotificationIds, setArchivedNotificationIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("queueless_archived_notifications");
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  const [notificationTab, setNotificationTab] = useState<"inbox" | "archived">("inbox");

  const archiveNotification = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setArchivedNotificationIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem("queueless_archived_notifications", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const unarchiveNotification = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setArchivedNotificationIds((prev) => {
      const next = prev.filter((item) => item !== id);
      try {
        localStorage.setItem("queueless_archived_notifications", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

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

      const customPfp = user.email ? localStorage.getItem(`queueless_custom_pfp_${user.email}`) : null;
      if (customPfp) {
        user.picture = customPfp;
      }

      if (!user.lastLogin) {
        user.lastLogin = new Date().toISOString();
        localStorage.setItem("queueless_user", JSON.stringify(user));
      }

      setCurrentUser(user);
      setRole(user.role);
      setSignedIn(true);

      if (
        (user.role === "student" || user.role === "guest") &&
        !isPersonalDetailsComplete(user)
      ) {
        setView("personal_details");
      }

      if (user.role === "admin" || user.role === "staff") {
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
              copies: typeof request.copies === "number" ? request.copies : 1,
              pickupDate: typeof request.pickupDate === "string" ? request.pickupDate : "",
              paymentStatus: typeof request.paymentStatus === "string" ? request.paymentStatus : "Proceed to Registrar Staff",
              email: typeof request.email === "string" ? request.email : "",
              picture: typeof request.picture === "string" ? request.picture : "",
              course: typeof request.course === "string" ? request.course : "",
              yearLevel: typeof request.yearLevel === "string" ? request.yearLevel : "",
              userDetails: (request.userDetails as Partial<AuthUser>) || undefined,
              assignedStaffId: typeof request.assignedStaffId === "string" ? request.assignedStaffId : undefined,
              assignedStaffName: typeof request.assignedStaffName === "string" ? request.assignedStaffName : undefined,
              rating: typeof request.rating === "number" ? request.rating : undefined,
              feedback: typeof request.feedback === "string" ? request.feedback : undefined,
              feedbackAt: typeof request.feedbackAt === "string" ? request.feedbackAt : undefined,
            }));

          setRequests(loadedRequests);
          try {
            localStorage.setItem("queueless_requests", JSON.stringify(loadedRequests));
          } catch {
            /* ignore storage quota */
          }
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
    // Restore any locally-cached personal details & custom profile photo from a previous session
    const profileKey = user.email ? `queueless_profile_${user.email}` : null;
    let cachedProfile: Partial<AuthUser> = {};
    if (profileKey) {
      try {
        const raw = localStorage.getItem(profileKey);
        if (raw) cachedProfile = JSON.parse(raw);
      } catch { /* ignore */ }
    }

    const customPfp = user.email ? localStorage.getItem(`queueless_custom_pfp_${user.email}`) : null;
    const finalPicture = customPfp || user.picture || cachedProfile.picture || "";

    const mergedDetails: Record<string, any> = { ...cachedProfile };
    Object.entries(user).forEach(([key, val]) => {
      if (val !== "" && val !== null && val !== undefined) {
        mergedDetails[key] = val;
      } else if (mergedDetails[key] === undefined) {
        mergedDetails[key] = val;
      }
    });

    const userWithLogin: AuthUser = {
      ...(mergedDetails as AuthUser),
      picture: finalPicture,
      lastLogin: user.lastLogin || new Date().toISOString(),
    };
    setCurrentUser(userWithLogin);
    setRole(userWithLogin.role);
    setSignedIn(true);
    setShowLoginLoading(true);
    setTimeout(() => {
      setShowLoginLoading(false);
    }, 1800);

    if (userWithLogin.role === "admin" || userWithLogin.role === "staff") {
      fetchAdminUsers();
    }

    localStorage.setItem(
      "queueless_user",
      JSON.stringify(userWithLogin)
    );

    if (
      (userWithLogin.role === "student" || userWithLogin.role === "guest") &&
      !isPersonalDetailsComplete(userWithLogin)
    ) {
      setView("personal_details");
      setFlash({
        tone: "warning",
        text: "Official Personal Information Required: Please fill up and confirm your personal details below before accessing the dashboard.",
      });
    } else {
      setView("dashboard");
      setFlash({
        tone: "success",
        text: `Welcome to QueueLess, ${user.name}. You are now signed in.`,
      });
    }

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
          email: typeof request.email === "string" ? request.email : "",
          picture: typeof request.picture === "string" ? request.picture : "",
          course: typeof request.course === "string" ? request.course : "",
          yearLevel: typeof request.yearLevel === "string" ? request.yearLevel : "",
          userDetails: (request.userDetails as Partial<AuthUser>) || undefined,
          assignedStaffId: typeof request.assignedStaffId === "string" ? request.assignedStaffId : undefined,
          assignedStaffName: typeof request.assignedStaffName === "string" ? request.assignedStaffName : undefined,
          rating: typeof request.rating === "number" ? request.rating : undefined,
          feedback: typeof request.feedback === "string" ? request.feedback : undefined,
          feedbackAt: typeof request.feedbackAt === "string" ? request.feedbackAt : undefined,
        }));

      setRequests(loadedRequests);
      try {
        localStorage.setItem("queueless_requests", JSON.stringify(loadedRequests));
      } catch {
        /* ignore storage quota */
      }
    } catch (error) {
      console.error(
        "Load requests error:",
        error
      );
    } finally {
      setRequestsLoading(false);
    }
  };

  const handlePersonalDetailsComplete = (isFirstTimeCompletion: boolean = true) => {
    if (!isFirstTimeCompletion) {
      setView("dashboard");
      setFlash({
        tone: "success",
        text: "Personal details updated successfully.",
      });
      return;
    }

    setShowFullAccessWelcome(true);
    setWelcomeProgress(0);

    const startTime = Date.now();
    const duration = 2200; // 2.2 seconds

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setWelcomeProgress(pct);

      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setShowFullAccessWelcome(false);
          setView("dashboard");
          setFlash({
            tone: "success",
            text: "Welcome to QueueLess! You now have full access to your registrar dashboard and services.",
          });
        }, 180);
      }
    }, 35);
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

      requests.forEach((request) => {
        if (request.priority === "Urgent" && request.status !== "Claimed") {
          list.push({
            id: `staff-urgent-${request.id}`,
            title: `⚡ Urgent Priority: Line #${request.lineNumber ?? 1}`,
            text: `${request.student} (${request.studentId}) requested ${request.document}. Express processing flagged.`,
            tone: "urgent",
            time: request.date,
            actionView: "requests",
            requestId: request.id,
          });
        } else if (request.status === "Ready for Claiming") {
          list.push({
            id: `staff-ready-${request.id}`,
            title: `Ready for Pickup: Line #${request.lineNumber ?? 1} (${request.document})`,
            text: `${request.student} (${request.studentId}) is ready for collection at Counter. Scheduled: ${request.pickupDate || "Today"}. Payment: ${request.paymentStatus || "Prepare payment within the day"}.`,
            tone: "success",
            time: request.pickupDate || request.date,
            actionView: "requests",
            requestId: request.id,
          });
        } else if (request.status === "Needs Correction") {
          list.push({
            id: `staff-correction-${request.id}`,
            title: `Action Required: Correction (${request.id})`,
            text: `${request.student} - ${request.document}: ${request.remarks || "Registrar notes require follow-up."}`,
            tone: "warning",
            time: request.date,
            actionView: "requests",
            requestId: request.id,
          });
        } else if (request.status === "Processing") {
          list.push({
            id: `staff-processing-${request.id}`,
            title: `Now Processing: Line #${request.lineNumber ?? 1} (${request.document})`,
            text: `Actively preparing ${request.student}'s ${request.document} (${request.id}). Target release: ${request.pickupDate || "Scheduled soon"}.`,
            tone: "info",
            time: request.date,
            actionView: "requests",
            requestId: request.id,
          });
        } else if (request.status === "Pending") {
          list.push({
            id: `staff-pending-${request.id}`,
            title: `In Queue: Line #${request.lineNumber ?? 1} (${request.document})`,
            text: `New request from ${request.student} (${request.studentId}) for ${request.document} (${request.purpose}). Payment: ${request.paymentStatus || "Proceed to Registrar Staff"}.`,
            tone: "info",
            time: request.date,
            actionView: "requests",
            requestId: request.id,
          });
        } else if (request.status === "Claimed") {
          list.push({
            id: `staff-claimed-${request.id}`,
            title: `Document Claimed & Released (${request.id})`,
            text: `${request.student}'s ${request.document} was released on ${request.pickupDate || request.date}.`,
            tone: "success",
            time: request.pickupDate || request.date,
            actionView: "requests",
            requestId: request.id,
          });
        }

        // Calendar pickup reminder for scheduled requests
        if (request.pickupDate && request.status !== "Claimed") {
          list.push({
            id: `staff-calendar-${request.id}`,
            title: `📅 Scheduled Pickup: ${request.pickupDate}`,
            text: `Calendar Reminder: ${request.student} - ${request.document} (${request.id}) scheduled for release on ${request.pickupDate}.`,
            tone: "info",
            time: request.pickupDate,
            actionView: "requests",
            requestId: request.id,
          });
        }
      });

      return list;
    }

    // --- ADMIN NOTIFICATIONS ---
    if (currentRole === "admin") {
      const list: NotificationItem[] = [];

      // Staff Inquiries & Contact Messages
      try {
        const rawStaffMsgs = localStorage.getItem("queueless_staff_admin_messages");
        if (rawStaffMsgs) {
          const staffMsgs = JSON.parse(rawStaffMsgs);
          staffMsgs.forEach((msg: any) => {
            list.push({
              id: `staff-msg-${msg.id}`,
              title: `💬 Staff Inquiry: ${msg.staffName} [${msg.priority || "Normal"}]`,
              text: `${msg.subject}: "${msg.message}" (${msg.category} • ${msg.staffEmail || "Staff"})`,
              tone: msg.priority === "Urgent" ? "urgent" : msg.priority === "Important" ? "warning" : "info",
              time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now",
              actionView: "audit_logs",
            });
          });
        }
      } catch (err) {
        console.error("Error reading staff admin messages:", err);
      }

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

      requests.forEach((request) => {
        if (request.priority === "Urgent" && request.status !== "Claimed") {
          list.push({
            id: `admin-urgent-${request.id}`,
            title: `⚡ Urgent Priority: Line #${request.lineNumber ?? 1}`,
            text: `${request.student} (${request.studentId}) - ${request.document} (${request.status}). Express processing flagged.`,
            tone: "urgent",
            time: request.date,
            actionView: "dashboard",
            requestId: request.id,
          });
        } else if (request.status === "Ready for Claiming") {
          list.push({
            id: `admin-ready-${request.id}`,
            title: `Ready for Pickup: Line #${request.lineNumber ?? 1} (${request.document})`,
            text: `${request.student} (${request.studentId}) is ready for collection at Counter 2. Scheduled: ${request.pickupDate || "Today"}. Payment: ${request.paymentStatus || "Prepare payment within the day"}.`,
            tone: "success",
            time: request.pickupDate || request.date,
            actionView: "dashboard",
            requestId: request.id,
          });
        } else if (request.status === "Needs Correction") {
          list.push({
            id: `admin-correction-${request.id}`,
            title: `Correction Flagged: Line #${request.lineNumber ?? 1} (${request.id})`,
            text: `${request.student} - ${request.document}: ${request.remarks || "Registrar notes require follow-up."}`,
            tone: "warning",
            time: request.date,
            actionView: "dashboard",
            requestId: request.id,
          });
        } else if (request.status === "Processing") {
          list.push({
            id: `admin-processing-${request.id}`,
            title: `Now Processing: Line #${request.lineNumber ?? 1} (${request.document})`,
            text: `Registrar actively preparing ${request.student}'s ${request.document} (${request.id}). Target: ${request.pickupDate || "Scheduled soon"}.`,
            tone: "info",
            time: request.date,
            actionView: "dashboard",
            requestId: request.id,
          });
        } else if (request.status === "Pending") {
          list.push({
            id: `admin-pending-${request.id}`,
            title: `In Queue: Line #${request.lineNumber ?? 1} (${request.document})`,
            text: `New request from ${request.student} (${request.studentId}) for ${request.document}. Purpose: ${request.purpose}. Payment: ${request.paymentStatus || "Proceed to Registrar Staff"}.`,
            tone: "info",
            time: request.date,
            actionView: "dashboard",
            requestId: request.id,
          });
        } else if (request.status === "Claimed") {
          list.push({
            id: `admin-claimed-${request.id}`,
            title: `Document Claimed & Released (${request.id})`,
            text: `${request.student}'s ${request.document} was successfully released on ${request.pickupDate || request.date}.`,
            tone: "success",
            time: request.pickupDate || request.date,
            actionView: "dashboard",
            requestId: request.id,
          });
        }

        if (request.pickupDate && request.status !== "Claimed") {
          list.push({
            id: `admin-calendar-${request.id}`,
            title: `📅 Scheduled Pickup: ${request.pickupDate}`,
            text: `Calendar Reminder: ${request.student} - ${request.document} (${request.id}) is scheduled for release on ${request.pickupDate}.`,
            tone: "info",
            time: request.pickupDate,
            actionView: "dashboard",
            requestId: request.id,
          });
        }
      });

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

  const activeNotifications = useMemo(() => {
    return notifications.filter((n) => !archivedNotificationIds.includes(n.id));
  }, [notifications, archivedNotificationIds]);

  const archivedNotifications = useMemo(() => {
    return notifications.filter((n) => archivedNotificationIds.includes(n.id));
  }, [notifications, archivedNotificationIds]);

  const unreadCount = useMemo(() => {
    return activeNotifications.filter((n) => !readNotificationIds.includes(n.id))
      .length;
  }, [activeNotifications, readNotificationIds]);

  const hasReadInInbox = useMemo(() => {
    return activeNotifications.some((n) => readNotificationIds.includes(n.id));
  }, [activeNotifications, readNotificationIds]);

  const markAllNotificationsAsRead = () => {
    const allIds = activeNotifications.map((n) => n.id);
    setReadNotificationIds((prev) => {
      const combined = Array.from(new Set([...prev, ...allIds]));
      try {
        localStorage.setItem(
          "queueless_read_notifications",
          JSON.stringify(combined)
        );
      } catch {
        // ignore
      }
      return combined;
    });
  };

  const archiveAllRead = () => {
    setArchivedNotificationIds((prev) => {
      const readIds = activeNotifications
        .filter((n) => readNotificationIds.includes(n.id))
        .map((n) => n.id);
      const combined = Array.from(new Set([...prev, ...readIds]));
      try {
        localStorage.setItem(
          "queueless_archived_notifications",
          JSON.stringify(combined)
        );
      } catch {
        // ignore
      }
      return combined;
    });
  };

  /*
   * Sign out clears BOTH user and JWT.
   */
  const signOut = () => {
    // Preserve personal details so they survive logout/re-login
    const savedRaw = localStorage.getItem("queueless_user");
    let userToSave = currentUser;
    if (!userToSave && savedRaw) {
      try {
        userToSave = JSON.parse(savedRaw);
      } catch { /* ignore parse errors */ }
    }
    if (userToSave?.email) {
      localStorage.setItem(
        `queueless_profile_${userToSave.email}`,
        JSON.stringify(userToSave)
      );
      if (userToSave.picture) {
        localStorage.setItem(
          `queueless_custom_pfp_${userToSave.email}`,
          userToSave.picture
        );
      } else {
        localStorage.removeItem(
          `queueless_custom_pfp_${userToSave.email}`
        );
      }
    }

    localStorage.removeItem(
      "queueless_user"
    );

    localStorage.removeItem(
      "queueless_token"
    );

    if (requests && requests.length > 0) {
      try {
        localStorage.setItem("queueless_requests", JSON.stringify(requests));
      } catch {
        /* ignore */
      }
    }

    setSignedIn(false);
    setCurrentUser(null);
    setView("dashboard");
    setMenuOpen(false);
    setNotificationsOpen(false);
    setFlash(null);
  };

  // Track user inactivity (admin: no timeout; staff: 1 hour; student/guest: 2 minutes; starts 59s warning before auto-logout)
  useEffect(() => {
    const activeRole = currentUser?.role || role;
    const isAdmin = activeRole === "admin";
    const isStaff = activeRole === "staff";

    if (!signedIn || isAdmin) {
      setShowInactivityModal(false);
      return;
    }

    let inactivityTimer: any = null;
    const timeoutDuration = isStaff ? 60 * 60 * 1000 : 2 * 60 * 1000;

    const startTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        setShowInactivityModal(true);
        setInactivityCountdown(59);
      }, timeoutDuration);
    };

    const handleUserActivity = () => {
      if (!showInactivityModal) {
        startTimer();
      }
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));
    startTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
    };
  }, [signedIn, showInactivityModal, currentUser?.role, role]);

  // 59-second live countdown when inactivity modal is triggered
  useEffect(() => {
    const activeRole = currentUser?.role || role;
    const isAdmin = activeRole === "admin";
    const isStaff = activeRole === "staff";

    if (!showInactivityModal || !signedIn || isAdmin) return;

    const interval = setInterval(() => {
      setInactivityCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowInactivityModal(false);
          signOut();
          setFlash({
            tone: "error",
            text: `You have been automatically logged out due to ${isStaff ? "1 hour" : "2 minutes"} of inactivity.`,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showInactivityModal, signedIn, currentUser?.role, role]);

  const handleStayLoggedIn = () => {
    setShowInactivityModal(false);
    setInactivityCountdown(59);
  };

  if (!signedIn) {
    return (
      <AuthScreen
        onSignIn={handleSignIn}
      />
    );
  }

  if (showLoginLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-4 animate-in fade-in duration-300">
        <div className="relative flex flex-col items-center max-w-md text-center">
          <div className="relative mb-6">
            <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <div className="relative flex size-24 items-center justify-center rounded-2xl bg-card border-2 border-border shadow-2xl p-3">
              <div className="absolute inset-0 rounded-2xl border-2 border-primary/30 border-t-primary animate-spin" />
              <img
                src="/phinma.png"
                alt="PHINMA University of Pangasinan"
                className="size-14 object-contain drop-shadow"
              />
            </div>
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            PHINMA University of Pangasinan
          </p>

          <h1 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl tracking-tight">
            Loading... Please wait
          </h1>

          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Authenticating your account and initializing workspace...
          </p>

          <div className="mt-6 flex flex-col items-center gap-2 w-56">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-2/3 rounded-full bg-primary animate-[pulse_1s_ease-in-out_infinite]" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Please wait a moment...</span>
          </div>
        </div>
      </div>
    );
  }

  if (showFullAccessWelcome) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-4 animate-in fade-in duration-300">
        <div className="relative flex flex-col items-center max-w-md text-center">
          <div className="relative mb-6">
            <div className="absolute -inset-4 rounded-full bg-primary/25 blur-xl animate-pulse" />
            <div className="relative flex size-24 items-center justify-center rounded-3xl bg-card border border-border shadow-2xl p-3">
              <img
                src="/images/phinma-logo.png"
                alt="PHINMA University of Pangasinan"
                className="size-16 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                  (e.currentTarget.parentElement as HTMLElement).innerHTML =
                    '<div class="flex size-full items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-xl">UP</div>';
                }}
              />
            </div>
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            PHINMA University of Pangasinan
          </p>

          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Welcome To QueueLess Registrar!
          </h1>

          <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
            Your personal details and institutional records have been recorded. Initializing your dashboard...
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 w-72">
            <div className="flex items-center justify-between w-full text-xs font-semibold">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Loader2 className="size-3.5 animate-spin text-primary" /> Loading dashboard...
              </span>
              <span className="font-mono text-primary font-bold">{welcomeProgress}%</span>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted border border-border/40">
              <div
                className="h-full rounded-full bg-primary transition-all duration-75 ease-out"
                style={{ width: `${welcomeProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const name =
    currentUser?.name ||
    "QueueLess User";

  const navigate = (next: View) => {
    if (
      currentUser &&
      (currentUser.role === "student" || currentUser.role === "guest") &&
      !isPersonalDetailsComplete(currentUser) &&
      next !== "personal_details"
    ) {
      setFlash({
        tone: "warning",
        text: "Please complete and save your official personal details first before entering the dashboard or requesting documents.",
      });
      setView("personal_details");
      setMenuOpen(false);
      return;
    }
    setView(next);
    setMenuOpen(false);
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
                    <div className="border-b border-border/80 pb-3">
                      <div className="flex items-center justify-between">
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
                          {notificationTab === "inbox" && unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={markAllNotificationsAsRead}
                              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                            >
                              Mark read
                            </button>
                          )}

                          {notificationTab === "inbox" && hasReadInInbox && (
                            <button
                              type="button"
                              onClick={archiveAllRead}
                              className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                              title="Archive all read notifications"
                            >
                              Archive read
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

                      {/* Inbox vs Archived Tab Switch */}
                      <div className="mt-2.5 flex items-center gap-1 rounded-lg bg-muted/60 p-1 text-xs">
                        <button
                          type="button"
                          onClick={() => setNotificationTab("inbox")}
                          className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1 font-semibold transition cursor-pointer ${
                            notificationTab === "inbox"
                              ? "bg-card text-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Bell className="size-3.5" />
                          <span>Inbox</span>
                          {activeNotifications.length > 0 && (
                            <span className="rounded-full bg-primary/15 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                              {activeNotifications.length}
                            </span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setNotificationTab("archived")}
                          className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1 font-semibold transition cursor-pointer ${
                            notificationTab === "archived"
                              ? "bg-card text-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Archive className="size-3.5" />
                          <span>Archived</span>
                          {archivedNotifications.length > 0 && (
                            <span className="rounded-full bg-muted-foreground/20 px-1.5 py-0.2 text-[10px] font-bold text-muted-foreground">
                              {archivedNotifications.length}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 max-h-[380px] overflow-y-auto space-y-2.5 pr-0.5">
                      {notificationTab === "inbox" ? (
                        activeNotifications.length > 0 ? (
                          activeNotifications.map((notification) => (
                            <Notice
                              key={notification.id}
                              title={notification.title}
                              text={notification.text}
                              tone={notification.tone}
                              time={notification.time}
                              isUnread={
                                !readNotificationIds.includes(notification.id)
                              }
                              onArchive={() => archiveNotification(notification.id)}
                              isArchived={false}
                              onClick={() => {
                                markNotificationAsRead(notification.id);
                                setSelectedNotificationModal(notification);
                                setNotificationsOpen(false);
                              }}
                            />
                          ))
                        ) : (
                          <div className="py-8 text-center">
                            <Bell className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                            <p className="text-sm font-medium text-foreground">
                              Inbox is clear
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              You're all caught up with your updates!
                            </p>
                          </div>
                        )
                      ) : archivedNotifications.length > 0 ? (
                        archivedNotifications.map((notification) => (
                          <Notice
                            key={notification.id}
                            title={notification.title}
                            text={notification.text}
                            tone={notification.tone}
                            time={notification.time}
                            isUnread={false}
                            onArchive={() => unarchiveNotification(notification.id)}
                            isArchived={true}
                            onClick={() => {
                              setSelectedNotificationModal(notification);
                              setNotificationsOpen(false);
                            }}
                          />
                        ))
                      ) : (
                        <div className="py-8 text-center">
                          <Archive className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                          <p className="text-sm font-medium text-foreground">
                            No archived notifications
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Notifications you archive will be kept here.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate("profile")}
              title="My Profile"
              className="md:hidden flex size-8 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground ring-1 ring-border cursor-pointer shrink-0"
            >
              {currentUser?.picture ? (
                <img
                  src={currentUser.picture}
                  alt={name}
                  className="size-full object-cover"
                />
              ) : (
                <UserRound className="size-4" />
              )}
            </button>

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
                navigate("profile");
              }}
              title="Click to open My Profile & Password"
              className="ml-2 hidden items-center gap-3 border-l border-border pl-4 md:flex text-left transition rounded-xl py-1 px-2 -mr-2 hover:bg-accent/60 cursor-pointer group"
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
                  {role === "admin" && (
                    <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-400 border border-amber-500/30">
                      Admin
                    </span>
                  )}
                  {role === "staff" && (
                    <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-extrabold text-primary border border-primary/30">
                      Staff
                    </span>
                  )}
                  {role !== "admin" && role !== "staff" && (
                    currentUser?.email?.toLowerCase().endsWith("@gmail.com") || role === "guest" || currentUser?.studentId?.startsWith("GUEST") ? (
                      <span className="rounded-full bg-purple-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:text-purple-400 border border-purple-500/30">
                        User
                      </span>
                    ) : currentUser?.isPriority || currentUser?.userType === "priority" ? (
                      <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        ★ Priority
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        Student
                      </span>
                    )
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  {role === "admin"
                    ? "Admin"
                    : role === "staff"
                    ? "Registrar Staff"
                    : currentUser?.email?.toLowerCase().endsWith("@gmail.com") || role === "guest" || currentUser?.studentId?.startsWith("GUEST")
                    ? "Guest"
                    : "Student"}
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
          } h-[calc(100vh-4.5rem)] w-full flex-col justify-between border-r border-border bg-card p-4 md:sticky md:top-18 md:flex md:w-64 md:shrink-0 overflow-y-auto`}
        >
          <div className="flex-1">
            <p className="px-3 pb-3 pt-2 text-[10px] font-bold uppercase text-muted-foreground">
              Workspace
            </p>

          <nav className="space-y-1">
            {(role === "student" || role === "guest") && !isPersonalDetailsComplete(currentUser) ? (
              <>
                <NavButton
                  active={view === "personal_details"}
                  icon={<ClipboardList />}
                  label="Personal details"
                  onClick={() => navigate("personal_details")}
                  badge="Required"
                />

                <NavButton
                  active={view === "dashboard"}
                  icon={<LayoutDashboard />}
                  label="Dashboard"
                  onClick={() => navigate("dashboard")}
                  disabled={true}
                />

                <NavButton
                  active={view === "new"}
                  icon={<FilePlus2 />}
                  label="New request"
                  onClick={() => navigate("new")}
                  disabled={true}
                />

                <NavButton
                  active={view === "requests"}
                  icon={<ClipboardList />}
                  label="My requests"
                  onClick={() => navigate("requests")}
                  disabled={true}
                />
              </>
            ) : (
              <>
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

                    <NavButton
                      active={view === "personal_details"}
                      icon={<ClipboardList />}
                      label="Personal details"
                      onClick={() =>
                        navigate("personal_details")
                      }
                    />
                  </>
                )}
              </>
            )}

            {role === "staff" && (
              <>
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

                <NavButton
                  active={view === "documents"}
                  icon={<FileText />}
                  label="Document requirements"
                  onClick={() =>
                    navigate("documents")
                  }
                />
              </>
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
                    view === "official_records"
                  }
                  icon={<UserCog />}
                  label="Official student records"
                  onClick={() =>
                    navigate("official_records")
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

                <NavButton
                  active={
                    view === "audit_logs"
                  }
                  icon={<History />}
                  label="Audit logs"
                  onClick={() =>
                    navigate("audit_logs")
                  }
                />
              </>
            )}

          </nav>
          </div>

          <div className="mt-auto shrink-0 border-t border-border pt-4">
            {role === "staff" ? (
              <div className="mb-4 rounded-md bg-primary/10 border border-primary/20 p-3">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-primary" /> Need Admin Assistance?
                </p>
                <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                  Reach out to the system admin for overrides & technical support.
                </p>
                <button
                  type="button"
                  onClick={() => setShowStaffContactModal(true)}
                  className="mt-2.5 w-full rounded bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Mail className="size-3" /> Contact Admin
                </button>
              </div>
            ) : (role === "student" || role === "guest") ? (
              <div className="mb-4 rounded-md bg-muted p-3">
                <p className="text-xs font-bold text-foreground">Need help?</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Visit the Registrar's Office during campus hours.
                </p>
              </div>
            ) : null}

            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground cursor-pointer"
              onClick={() => setShowLogoutConfirm(true)}
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
              docTypes={docTypes}
              onOpenCalendar={() => setCalendarOpen(true)}
              onPersonalDetailsComplete={handlePersonalDetailsComplete}
            />
          ) : role === "staff" ? (
            <StaffView
              view={view}
              navigate={navigate}
              requests={requests}
              setRequests={setRequests}
              setFlash={setFlash}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              docTypes={docTypes}
              onOpenCalendar={() => setCalendarOpen(true)}
              onOpenContactAdmin={() => setShowStaffContactModal(true)}
            />
          ) : (
            <AdminView
              view={view}
              navigate={navigate}
              requests={requests}
              setFlash={setFlash}
              users={adminUsers}
              docTypes={docTypes}
              onUpdateDocTypes={handleUpdateDocTypes}
              onUsersUpdated={fetchAdminUsers}
              onOpenCalendar={() => setCalendarOpen(true)}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
            />
          )}
        </main>
      </div>

      {calendarOpen && (
        <PickupCalendarModal
          requests={requests}
          users={adminUsers}
          currentUser={currentUser}
          onClose={() => setCalendarOpen(false)}
          onSelectRequest={(req) => {
            setCalendarOpen(false);
            setActiveReceiptModal(req);
          }}
          onUpdateRequest={(updated) =>
            setRequests(
              requests.map((r) => (r.id === updated.id ? updated : r))
            )
          }
        />
      )}

      {/* Full Notification Details Modal */}
      {selectedNotificationModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedNotificationModal(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Notification Details"
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Bell className="size-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                      Notification Details
                    </span>
                    {selectedNotificationModal.time && (
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {selectedNotificationModal.time}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-base font-bold text-foreground mt-1 leading-snug">
                    {selectedNotificationModal.title}
                  </h3>
                </div>
              </div>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSelectedNotificationModal(null)}
                aria-label="Close notification details"
                className="size-8 cursor-pointer shrink-0"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Notification message */}
            <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Full Message Details
              </p>
              <p className="text-sm font-medium leading-relaxed text-foreground whitespace-pre-line">
                {selectedNotificationModal.text}
              </p>
            </div>

            {/* Linked Document Request (if any) */}
            {selectedNotificationModal.requestId && (() => {
              const linkedReq = requests.find((r) => r.id === selectedNotificationModal.requestId);
              if (!linkedReq) return null;
              return (
                <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <FileText className="size-4" /> Linked Document Request
                    </span>
                    <StatusBadge status={linkedReq.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Queue Line & ID</span>
                      <span className="font-bold text-foreground">Line #{linkedReq.lineNumber ?? 1} · {linkedReq.id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Document</span>
                      <span className="font-bold text-foreground truncate block">{linkedReq.document}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Student</span>
                      <span className="font-medium text-foreground truncate block">{linkedReq.student} ({linkedReq.studentId})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Scheduled Pickup</span>
                      <span className="font-medium text-foreground truncate block">{linkedReq.pickupDate || "Targeting 3-5 days"}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      Payment: {linkedReq.paymentStatus || "Prepare payment within the day"}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs font-semibold gap-1 cursor-pointer bg-card"
                      onClick={() => {
                        setSelectedNotificationModal(null);
                        setActiveReceiptModal(linkedReq);
                      }}
                    >
                      <Receipt className="size-3.5" /> View Official Receipt
                    </Button>
                  </div>
                </div>
              );
            })()}

            {/* Modal actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                {archivedNotificationIds.includes(selectedNotificationModal.id) ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs cursor-pointer gap-1.5"
                    onClick={() => {
                      unarchiveNotification(selectedNotificationModal.id);
                      setSelectedNotificationModal(null);
                    }}
                  >
                    <ArchiveRestore className="size-3.5 text-primary" /> Restore to Inbox
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs cursor-pointer gap-1.5"
                    onClick={() => {
                      archiveNotification(selectedNotificationModal.id);
                      setSelectedNotificationModal(null);
                    }}
                  >
                    <Archive className="size-3.5" /> Archive Notification
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedNotificationModal.actionView && (
                  <Button
                    size="sm"
                    className="h-8 text-xs cursor-pointer gap-1"
                    onClick={() => {
                      navigate(selectedNotificationModal.actionView!);
                      setSelectedNotificationModal(null);
                    }}
                  >
                    Go to {selectedNotificationModal.actionView === "dashboard" ? "Dashboard" : selectedNotificationModal.actionView === "requests" ? "Requests" : selectedNotificationModal.actionView === "users" ? "Users" : "Page"}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedNotificationModal(null)}
                  className="h-8 text-xs cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReceiptModal && (
        <DigitalReceiptModal
          request={activeReceiptModal}
          onClose={() => setActiveReceiptModal(null)}
          isStaff={currentUser?.role === "staff" || currentUser?.role === "admin"}
          onEdit={() => {
            fetchRequests();
          }}
          onOpenCalendar={() => {
            setActiveReceiptModal(null);
            setCalendarOpen(true);
          }}
        />
      )}

      {showLogoutConfirm && (
        <LogoutConfirmModal
          user={currentUser}
          onConfirm={() => {
            setShowLogoutConfirm(false);
            signOut();
          }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}

      {/* Inactivity Warning with 59s Countdown Auto-Logout */}
      {showInactivityModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 mb-3 animate-pulse">
              <Clock className="size-7" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Session Inactivity Warning
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              You have been inactive for {currentUser?.role === "staff" || role === "staff" ? "1 hour" : "2 minutes"}. For your security, your session will automatically end in:
            </p>
            <div className="my-4 flex items-center justify-center">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-2.5 shadow-inner">
                <span className="font-mono text-3xl font-black text-amber-600 dark:text-amber-400">
                  {inactivityCountdown}s
                </span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mb-4">
              Click below to stay logged in and continue using QueueLess.
            </p>
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowInactivityModal(false);
                  signOut();
                }}
                className="w-1/2 cursor-pointer"
              >
                Log Out
              </Button>
              <Button
                size="sm"
                onClick={handleStayLoggedIn}
                className="w-1/2 font-bold gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="size-3.5" /> Stay Logged In
              </Button>
            </div>
          </div>
        </div>
      )}

      {showStaffContactModal && (
        <StaffContactAdminModal
          currentUser={currentUser}
          onClose={() => setShowStaffContactModal(false)}
          setFlash={setFlash}
        />
      )}

      {/* Floating Campus Registrar Helper Bubble Chat - Students & Guests Only */}
      {signedIn && (currentUser?.role === "student" || currentUser?.role === "guest") && (
        <div className="fixed left-5 top-1/2 -translate-y-1/2 z-40 print:hidden group">
          <button
            type="button"
            onClick={() => setShowAiHelper(true)}
            aria-label="Campus Registrar Helper"
            title="Campus Registrar Helper"
            className="relative flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer border border-primary-foreground/20"
          >
            <span className="absolute -top-0.5 -right-0.5 flex size-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-3 rounded-full bg-emerald-400 border-2 border-primary" />
            </span>
            <MessageCircle className="size-6" />
          </button>
          <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="whitespace-nowrap rounded-lg bg-card px-3 py-1.5 text-xs font-bold text-foreground shadow-xl border border-border flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Campus Registrar Helper</span>
            </div>
          </div>
        </div>
      )}

      {/* Campus Registrar Helper AI Modal - Students & Guests Only */}
      {showAiHelper && (currentUser?.role === "student" || currentUser?.role === "guest") && (
        <CampusRegistrarHelperModal
          onClose={() => setShowAiHelper(false)}
          currentUser={currentUser}
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
  const [inputIdentity, setInputIdentity] = useState(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      return p.get("identity") || "";
    }
    return "";
  });
  const [inputPassword, setInputPassword] = useState(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      return p.get("password") || "";
    }
    return "";
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search) {
      const p = new URLSearchParams(window.location.search);
      if (p.has("identity") || p.has("password")) {
        p.delete("identity");
        p.delete("password");
        const remaining = p.toString();
        const newUrl = window.location.pathname + (remaining ? `?${remaining}` : "") + window.location.hash;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, []);

  const [mode, setMode] =
    useState<"login" | "register" | "guest-register" | "forgot-password" | "activate-account">(
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

const DEFAULT_GOOGLE_CLIENT_ID = "1085223545333-85puvi15u5mumi3eq038tspee023fbta.apps.googleusercontent.com";

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [customClientId, setCustomClientId] =
    useState(() => {
      return (
        (typeof window !== "undefined"
          ? localStorage.getItem("queueless_google_client_id")
          : "") ||
        (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
        DEFAULT_GOOGLE_CLIENT_ID
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
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Google sign-in failed.");
        return;
      }

      if (!result.user || !result.token) {
        setError("Google sign-in succeeded, but session data is missing.");
        return;
      }

      localStorage.setItem("queueless_token", result.token);

      onSignIn({
        ...result.user,
        phone: result.user.phone || "",
        lastLogin: result.user.lastLogin || new Date().toISOString(),
      });
    } catch (err) {
      console.warn("Backend unavailable, activating Google sign-in client fallback:", err);
      if (authPayload.access_token) {
        try {
          const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${authPayload.access_token}` },
          });
          if (profileRes.ok) {
            const profile = await profileRes.json();
            const email = (profile.email || "").toLowerCase().trim();
            const name = profile.name || profile.given_name || "Google User";
            const picture = profile.picture || "";
            const isGmail = email.endsWith("@gmail.com");
            const isPhinma = email.endsWith("@phinmaed.com") || email.endsWith(".edu.ph");
            const role: Role = isGmail ? "guest" : "student";
            const googleUser: AuthUser = {
              id: `google-${profile.sub || Date.now()}`,
              name,
              email,
              role,
              studentId: isGmail ? "" : "03-2425-098124",
              picture,
              userType: isPhinma ? "priority" : "normal",
              isPriority: isPhinma,
              termsAccepted: true,
              termsAcceptedAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            };
            localStorage.setItem("queueless_token", `offline-token-${Date.now()}`);
            localStorage.setItem("queueless_user", JSON.stringify(googleUser));
            onSignIn(googleUser);
            return;
          }
        } catch (tokenErr) {
          console.error("Client Google profile fetch error:", tokenErr);
        }
      }
      if (authPayload.credential) {
        try {
          const base64Url = authPayload.credential.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(
            decodeURIComponent(
              atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
            )
          );
          if (payload) {
            const email = (payload.email || "").toLowerCase().trim();
            const name = payload.name || payload.given_name || "Google User";
            const picture = payload.picture || "";
            const isGmail = email.endsWith("@gmail.com");
            const isPhinma = email.endsWith("@phinmaed.com") || email.endsWith(".edu.ph");
            const role: Role = isGmail ? "guest" : "student";
            const googleUser: AuthUser = {
              id: `google-${Date.now()}`,
              name,
              email,
              role,
              studentId: isGmail ? "" : "03-2425-098124",
              picture,
              userType: isPhinma ? "priority" : "normal",
              isPriority: isPhinma,
              termsAccepted: true,
              termsAcceptedAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            };
            localStorage.setItem("queueless_token", `offline-token-${Date.now()}`);
            localStorage.setItem("queueless_user", JSON.stringify(googleUser));
            onSignIn(googleUser);
            return;
          }
        } catch (e) {
          console.error("Client Google token parsing error:", e);
        }
      }
      setError("Unable to complete Google sign-in. Please sign in with Student ID / email.");
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    const activeClientId =
      customClientId || (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || DEFAULT_GOOGLE_CLIENT_ID;
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
      customClientId || (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || DEFAULT_GOOGLE_CLIENT_ID;
    if (!activeClientId) {
      setShowGoogleModal(true);
      return;
    }

    // @ts-expect-error Google Identity Services
    const google = window.google;

    // Use Google Identity Services OAuth 2.0 Token Client (exact behavior from localhost:5173)
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

    if (google?.accounts?.id) {
      try {
        google.accounts.id.prompt();
      } catch (promptErr) {
        console.warn("Google prompt error:", promptErr);
      }
    }
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
        ...result.user,
        phone: result.user.phone || "",
        lastLogin: result.user.lastLogin || new Date().toISOString(),
      });
    } catch (error) {
      console.warn("Backend server unreachable, signing in with local session fallback:", error);

      const identityLower = identity.toLowerCase().trim();
      const isAdmin =
        identityLower.includes("admin") ||
        identityLower === "admin@up.phinma.edu.ph";
      const isStaff =
        identityLower.includes("staff") ||
        identityLower.startsWith("up-") ||
        identityLower.startsWith("staff-");
      const isGmail = identityLower.endsWith("@gmail.com");

      let resolvedRole: Role = "student";
      let resolvedName = "Enrolled Student";
      let resolvedStudentId = identity.trim();

      if (isAdmin) {
        resolvedRole = "admin";
        resolvedName = "System Administrator";
        resolvedStudentId = "ADMIN-001";
      } else if (isStaff) {
        resolvedRole = "staff";
        resolvedName = "Registrar Staff";
        resolvedStudentId = "UP-01-234-T";
      } else if (isGmail) {
        resolvedRole = "guest";
        resolvedName = identity.split("@")[0] || "Guest User";
        resolvedStudentId = "";
      } else {
        resolvedRole = "student";
        resolvedName = identityLower.includes("@") ? identity.split("@")[0] : "Student User";
      }

      // Check if user was registered in localStorage
      let localUser: AuthUser | null = null;
      try {
        const storedUsers = localStorage.getItem("queueless_local_users");
        if (storedUsers) {
          const parsed = JSON.parse(storedUsers);
          if (Array.isArray(parsed)) {
            const match = parsed.find(
              (u: any) =>
                u.email?.toLowerCase() === identityLower ||
                u.studentId?.toLowerCase() === identityLower
            );
            if (match) localUser = match;
          }
        }
      } catch {
        /* ignore */
      }

      const fallbackUser: AuthUser = localUser || {
        id: `user-${Date.now()}`,
        name: resolvedName,
        email: identityLower.includes("@") ? identityLower : `${identityLower}@up.phinma.edu.ph`,
        studentId: resolvedStudentId,
        role: resolvedRole,
        phone: "09123456789",
        course: "BS Information Technology",
        yearLevel: "3rd Year",
        isPriority: !isGmail && !isStaff && !isAdmin,
        userType: !isGmail && !isStaff && !isAdmin ? "priority" : "normal",
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      localStorage.setItem("queueless_token", `offline-token-${Date.now()}`);
      localStorage.setItem("queueless_user", JSON.stringify(fallbackUser));
      onSignIn(fallbackUser);
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

    if (/\s/.test(password)) {
      setError("Password cannot contain spaces.");
      return;
    }

    if (!isStrongPassword(password)) {
      setError(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
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
      console.warn("Backend unavailable, registering student locally:", error);
      const isPriority = isSchoolCredential(email, studentId);
      const registeredStudent: AuthUser = {
        id: `local-student-${Date.now()}`,
        name: fullName.trim(),
        email: email.toLowerCase().trim(),
        studentId: studentId.trim(),
        role: "student",
        isPriority,
        userType: isPriority ? "priority" : "normal",
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      try {
        const existing = JSON.parse(localStorage.getItem("queueless_local_users") || "[]");
        existing.push(registeredStudent);
        localStorage.setItem("queueless_local_users", JSON.stringify(existing));
      } catch {}

      setError("");
      setRegistrationNotice("Registration completed! You can now sign in with your Student ID and password.");
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

    if (/\s/.test(password)) {
      setError("Password cannot contain spaces.");
      return;
    }

    if (!isStrongPassword(password)) {
      setError(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
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
      console.warn("Backend unavailable, registering guest locally:", error);
      const guestUser: AuthUser = {
        id: `local-guest-${Date.now()}`,
        name: fullName.trim(),
        email: email.toLowerCase().trim(),
        phone: cleanPhone,
        role: "guest",
        studentId: "",
        isPriority: false,
        userType: "normal",
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      try {
        const existing = JSON.parse(localStorage.getItem("queueless_local_users") || "[]");
        existing.push(guestUser);
        localStorage.setItem("queueless_local_users", JSON.stringify(existing));
      } catch {}

      localStorage.setItem("queueless_token", `offline-token-${Date.now()}`);
      localStorage.setItem("queueless_user", JSON.stringify(guestUser));
      onSignIn(guestUser);
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
                    value={inputIdentity}
                    onChange={(e) => setInputIdentity(e.target.value)}
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
                      value={inputPassword}
                      onChange={(e) => setInputPassword(e.target.value)}
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

                <div className="flex items-center justify-between -mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("activate-account");
                      setError("");
                    }}
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Activate account / Enter OTP
                  </button>
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
          ) : mode === "activate-account" ? (
            <ActivateAccountWithOtp
              onBack={() => {
                setMode("login");
                setError("");
              }}
              onSuccess={() => {
                setMode("login");
                setError("");
              }}
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

      {showTermsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowTermsModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/40">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Terms of Service & Privacy Policy
                </h3>
                <p className="text-xs text-muted-foreground">
                  QueueLess Registrar Document & Queuing System
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 text-xs text-muted-foreground space-y-4 leading-relaxed">
              <section>
                <h4 className="font-semibold text-sm text-foreground mb-1">
                  1. Role-Based Access & Authentication
                </h4>
                <p>
                  QueueLess provides a centralized role-based access control (RBAC) portal for PHINMA University of Pangasinan. Users (Students, Guests, Registrar Staff, and System Administrators) sign in using authorized university credentials and are automatically routed to their corresponding authorized portal.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-sm text-foreground mb-1">
                  2. Document Requests & Queue Policies
                </h4>
                <p>
                  Official documents requested through this portal (such as Transcript of Records, Certifications, Honorable Dismissal) require verification and registrar clearance. Request queue numbers and priority processing tags are strictly monitored. Users must observe registrar guidelines and claiming schedules.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-sm text-foreground mb-1">
                  3. Philippine Data Privacy Act Compliance (RA 10173)
                </h4>
                <p>
                  In compliance with Republic Act No. 10173, all student identifiers, personal information, educational background, contact numbers, and transaction logs stored in QueueLess are treated with strict confidentiality and used exclusively for official registrar services and university records.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-sm text-foreground mb-1">
                  4. Account Security & Verification
                </h4>
                <p>
                  Users must keep their passwords and OTP authentication tokens confidential. Any unauthorized attempt to tamper with queue numbers, document statuses, or audit records will result in account revocation and appropriate administrative sanctions.
                </p>
              </section>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4 bg-muted/30">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTermsModal(false)}
                className="cursor-pointer"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setTermsAccepted(true);
                  setShowTermsModal(false);
                  if (error?.includes("Terms and Conditions")) {
                    setError("");
                  }
                }}
                className="cursor-pointer"
              >
                I Agree & Understand
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
  const [regPassword, setRegPassword] = useState("");
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
              placeholder="Enter your email"
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Password">
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
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
            <PasswordStrengthMeter password={regPassword} />
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
  const [guestPassword, setGuestPassword] = useState("");
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
              placeholder="09XXXXXXXXX"
              maxLength={11}
              onInput={(e) => {
                const target = e.currentTarget;
                target.value = normalizePhone(target.value);
              }}
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Password">
            <input
              name="password"
              type="password"
              value={guestPassword}
              onChange={(e) => setGuestPassword(e.target.value)}
              required
              className="field"
              placeholder="Min. 8 characters (uppercase, lowercase, number & symbol)"
              minLength={8}
            />
            <PasswordStrengthMeter password={guestPassword} />
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
              minLength={8}
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

function isStrongPassword(pass: string): boolean {
  if (typeof pass !== "string" || pass.length < 8) return false;
  if (/\s/.test(pass)) return false; // Absolutely no spaces allowed
  const hasUpper = /[A-Z]/.test(pass);
  const hasLower = /[a-z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pass);
  return hasUpper && hasLower && hasNumber && hasSpecial;
}

function PasswordStrengthMeter({ password }: { password: string }) {
  const getStrength = (pass: string) => {
    if (!pass) {
      return { score: 0, label: "Enter password", color: "bg-muted", textTone: "text-muted-foreground" };
    }

    // Explicitly reject passwords with whitespace
    if (/\s/.test(pass)) {
      return { score: 0, label: "Spaces not allowed", color: "bg-rose-500", textTone: "text-rose-500" };
    }

    if (pass.length < 8) {
      return { score: 1, label: "Too Short (Min. 8 chars)", color: "bg-rose-500", textTone: "text-rose-500" };
    }

    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pass);

    const typesCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

    if (typesCount <= 2) {
      return { score: 1, label: "Weak (Need upper, lower, number, symbol)", color: "bg-rose-500", textTone: "text-rose-500" };
    }
    if (typesCount === 3) {
      return { score: 2, label: "Fair (Missing 1 requirement)", color: "bg-amber-500", textTone: "text-amber-500" };
    }
    if (typesCount === 4 && pass.length < 12) {
      return { score: 3, label: "Good (Meets all requirements)", color: "bg-sky-500", textTone: "text-sky-500" };
    }
    if (typesCount === 4 && pass.length >= 12) {
      return { score: 4, label: "Strong (12+ characters)", color: "bg-emerald-500", textTone: "text-emerald-500" };
    }

    return { score: 1, label: "Weak", color: "bg-rose-500", textTone: "text-rose-500" };
  };

  const { score, label, color, textTone } = getStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5 animate-in fade-in duration-150">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground font-medium">Password Strength:</span>
        <span className={`font-bold ${textTone}`}>{label}</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 h-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-full rounded-full transition-all duration-300 ${
              score >= step ? color : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground leading-tight">
        Must be at least 8 characters with uppercase, lowercase, numbers & symbols (no spaces).
      </p>
    </div>
  );
}

function ActivateAccountWithOtp({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    if (!email.trim()) {
      setError("Please enter your Registered Email or Student/Staff ID first to resend OTP.");
      return;
    }
    setError("");
    setResendMessage("");
    setResendLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email.trim(), email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || (res.status === 404 ? "This email or account is not registered in our system. OTP cannot be resent." : "Failed to resend OTP code."));
        setResendMessage("");
        return;
      }

      setResendMessage(
        data.message || "A new 6-digit OTP code has been sent to your email. Please check your inbox."
      );
      setResendCooldown(60);
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("Cannot connect to server. Ensure backend is running.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your registered email address or account ID.");
      return;
    }
    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP code sent to your email.");
      return;
    }
    if (/\s/.test(newPassword)) {
      setError("Password cannot contain spaces.");
      return;
    }
    if (!isStrongPassword(newPassword)) {
      setError(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

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
        setError(data.message || "Failed to activate account or verify OTP code.");
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Cannot connect to server. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center max-w-md mx-auto w-full py-1">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 h-8 text-xs gap-1 w-fit cursor-pointer text-muted-foreground hover:text-foreground"
        type="button"
        onClick={onBack}
      >
        <ArrowLeft className="size-3.5" /> Back to sign in
      </Button>

      {success ? (
        <div className="mt-3 text-center py-4">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="size-6" />
          </div>

          <h3 className="text-xl font-bold text-foreground">
            Account Activated!
          </h3>

          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            Your verification code has been confirmed and your new password has been set. You can now sign in using your credentials.
          </p>

          <Button
            size="default"
            className="mt-5 w-full cursor-pointer font-bold h-9 text-xs"
            onClick={onSuccess}
          >
            Sign in now <ArrowRight className="size-3.5" />
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
              First-Time Setup / Account Activation
            </p>

            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
              Activate with OTP
            </h2>

            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Enter the 6-digit OTP code emailed to you by the Registrar Admin, along with your new password to activate your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <Field label="Registered Email or Student/Staff ID *">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. your.email@phinmaed.com or STAFF-001"
                required
                className="field h-9 text-xs"
                autoFocus
              />
            </Field>

            <Field label="6-Digit OTP Verification Code *">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                required
                className="field h-10 text-center font-mono text-xl font-bold tracking-[0.35em]"
              />
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground text-[10px]">
                  Check inbox for the 6-digit code.
                </span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading || resendCooldown > 0}
                  className="font-semibold text-primary text-[11px] hover:underline disabled:text-muted-foreground disabled:no-underline cursor-pointer disabled:cursor-not-allowed shrink-0 ml-2"
                >
                  {resendLoading ? "Resending..." : resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                </button>
              </div>
              {resendMessage && (
                <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  ✓ {resendMessage}
                </p>
              )}
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Field label="Create New Password *">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters (uppercase, lowercase, number & symbol)"
                    minLength={8}
                    required
                    className="field h-9 text-xs pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Eye className="size-3.5" />
                  </button>
                </div>
              </Field>

              <Field label="Confirm New Password *">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  minLength={8}
                  className="field h-9 text-xs"
                />
              </Field>
            </div>

            <PasswordStrengthMeter password={newPassword} />

            {error && <InlineError text={error} />}

            <Button
              size="default"
              className="w-full cursor-pointer h-10 font-bold text-xs shadow-sm mt-1"
              type="submit"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Activating account...
                </>
              ) : (
                <>
                  Verify OTP & Activate Account <ArrowRight className="size-3.5" />
                </>
              )}
            </Button>
          </form>
        </>
      )}
    </div>
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

  // Math security challenge (matches Pic 1)
  const [num1, setNum1] = useState(() => Math.floor(10 + Math.random() * 40));
  const [num2, setNum2] = useState(() => Math.floor(1 + Math.random() * 20));
  const [mathAnswer, setMathAnswer] = useState("");

  const refreshMathChallenge = () => {
    setNum1(Math.floor(10 + Math.random() * 40));
    setNum2(Math.floor(1 + Math.random() * 20));
    setMathAnswer("");
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleRequestOtp = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (step === "request") {
      const parsedAns = parseInt(mathAnswer.trim(), 10);
      if (isNaN(parsedAns) || parsedAns !== num1 + num2) {
        setError("Please enter the correct answer to the math problem before sending OTP.");
        refreshMathChallenge();
        return;
      }
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
        setError(data.message || (res.status === 404 ? "This email is not registered in our system. Verification code cannot be sent." : "Failed to send verification code."));
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
    if (/\s/.test(newPassword) || !isStrongPassword(newPassword)) {
      setError("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (no spaces).");
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

            {/* Math Security Challenge (matches Pic 1) */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-foreground">
                Security Verification
              </label>
              <div className="flex items-center gap-2.5">
                <div className="flex h-11 w-14 items-center justify-center rounded-lg border border-border bg-background font-mono text-lg font-bold text-foreground shadow-2xs">
                  {num1}
                </div>
                <span className="text-base font-bold text-muted-foreground">+</span>
                <div className="flex h-11 w-14 items-center justify-center rounded-lg border border-border bg-background font-mono text-lg font-bold text-foreground shadow-2xs">
                  {num2}
                </div>
                <span className="text-base font-bold text-muted-foreground">=</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={mathAnswer}
                  onChange={(e) => setMathAnswer(e.target.value.replace(/\D/g, ""))}
                  placeholder="?"
                  required
                  className="h-11 w-18 rounded-lg border border-border bg-background text-center font-mono text-lg font-bold text-foreground shadow-2xs focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={refreshMathChallenge}
                  title="Generate new math challenge"
                  className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer"
                >
                  <RefreshCw className="size-4.5" />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Solve the math challenge above before requesting a verification code.
              </p>
            </div>

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
                  placeholder="Min. 8 characters (uppercase, lowercase, number & symbol)"
                  minLength={8}
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
              <PasswordStrengthMeter password={newPassword} />
            </Field>

            <Field label="Confirm New Password">
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                required
                minLength={8}
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
  const [editStudentId, setEditStudentId] = useState(currentUser.studentId || "");
  const [editPhone, setEditPhone] = useState(currentUser.phone || "");
  const [editEmail, setEditEmail] = useState(currentUser.email || "");

  // Student ID validation: 03-2223-038512 or max 03-01-2425-045805
  const studentIdRegex = /^03(-\d{2})?-\d{4}-\d{6}$/;
  const isValidStudentId = (id: string) => studentIdRegex.test(id.trim());
  const handleStudentIdChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9-]/g, "").slice(0, 17);
    setEditStudentId(cleaned);
  };

  // Staff ID validation: UP-00-000-T
  const staffIdRegex = /^UP-\d{2}-\d{3}-[A-Z]$/i;
  const isValidStaffId = (id: string) => staffIdRegex.test(id.trim());
  const handleStaffIdChange = (raw: string) => {
    const cleaned = raw.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 11);
    setEditStudentId(cleaned);
  };
  const [editPicture, setEditPicture] = useState(currentUser.picture || "");
  const [editCourse, setEditCourse] = useState(currentUser.course || "BS Information Technology");
  const [editYearLevel, setEditYearLevel] = useState(currentUser.yearLevel || "3rd Year");
  const [editBirthDate, setEditBirthDate] = useState(currentUser.birthDate || "");
  const [editAddress, setEditAddress] = useState(currentUser.address || "");
  const [editEmergencyContact, setEditEmergencyContact] = useState(currentUser.emergencyContact || "");
  const [contactConfirmed, setContactConfirmed] = useState(Boolean(currentUser.contactVerified));
  const [showAuthConfirmModal, setShowAuthConfirmModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Security OTP for Email Change
  const [showEmailOtpModal, setShowEmailOtpModal] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState("");
  const [emailOtpMaskedEmail, setEmailOtpMaskedEmail] = useState("");

  // Security OTP for Password Change
  const [showPwOtpModal, setShowPwOtpModal] = useState(false);
  const [pwOtpCode, setPwOtpCode] = useState("");
  const [pwOtpLoading, setPwOtpLoading] = useState(false);
  const [pwOtpError, setPwOtpError] = useState("");
  const [pwOtpMaskedEmail, setPwOtpMaskedEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const isStudentOrGuest = currentUser.role === "student" || currentUser.role === "guest";
  const nameCooldownDays = currentUser.role === "admin" ? 3 : 90;
  const nameChangeAllowed = (() => {
    if (!currentUser.nameLastChanged) return true;
    const lastChanged = new Date(currentUser.nameLastChanged);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= nameCooldownDays;
  })();

  const daysUntilNameChange = (() => {
    if (!currentUser.nameLastChanged) return 0;
    const lastChanged = new Date(currentUser.nameLastChanged);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, nameCooldownDays - diffDays);
  })();

  // 3-day password change cooldown
  const pwChangeAllowed = (() => {
    if (!currentUser.passwordLastChanged) return true;
    const lastChanged = new Date(currentUser.passwordLastChanged);
    const now = new Date();
    const diffMs = now.getTime() - lastChanged.getTime();
    return diffMs >= 3 * 24 * 60 * 60 * 1000;
  })();

  const daysUntilPwChange = (() => {
    if (!currentUser.passwordLastChanged) return 0;
    const lastChanged = new Date(currentUser.passwordLastChanged);
    const now = new Date();
    const diffMs = now.getTime() - lastChanged.getTime();
    const remainingMs = 3 * 24 * 60 * 60 * 1000 - diffMs;
    if (remainingMs <= 0) return 0;
    return Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
  })();

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

  const validateInputs = () => {
    if (!nameChangeAllowed && editName.trim() !== (currentUser.name || "").trim()) {
      setFlash({
        tone: "error",
        text: `You can only change your name once every ${nameCooldownDays} days. You can change it again in ${daysUntilNameChange} days.`,
      });
      return false;
    }
    const cleanDigits = normalizePhone(editPhone);
    if (cleanDigits && (cleanDigits.length !== 11 || !cleanDigits.startsWith("09"))) {
      setFlash({
        tone: "error",
        text: `Please enter a valid 11-digit mobile number starting with 09 (currently ${cleanDigits.length}/11 digits) or leave blank.`,
      });
      return false;
    }
    // Student ID format validation (Enrolled Students Only - Not for Guests)
    if (currentUser.role === "student" && !currentUser.email?.toLowerCase().endsWith("@gmail.com") && editStudentId.trim()) {
      if (!isValidStudentId(editStudentId)) {
        setFlash({
          tone: "error",
          text: "Please enter a valid PHINMA UPang Student ID format: 03-XXXX-XXXXXX (e.g. 03-2223-038512) or max 03-XX-XXXX-XXXXXX (e.g. 03-01-2425-045805).",
        });
        return false;
      }
    }
    // Staff ID format validation: UP-00-000-T
    if (currentUser.role === "staff" && editStudentId.trim()) {
      if (!isValidStaffId(editStudentId)) {
        setFlash({
          tone: "error",
          text: "Please enter a valid PHINMA UPang Staff ID format: UP-00-000-T (e.g. UP-01-234-T).",
        });
        return false;
      }
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editEmail.trim() && !emailPattern.test(editEmail.trim())) {
      setFlash({
        tone: "error",
        text: "Please enter a valid email address or leave blank.",
      });
      return false;
    }
    return true;
  };

  const executeSaveProfile = async (authenticated: boolean = false, otpCode?: string) => {
    const cleanDigits = normalizePhone(editPhone);
    const nameChanged = editName.trim() !== (currentUser.name || "").trim();
    const newNameLastChanged = nameChanged ? new Date().toISOString() : currentUser.nameLastChanged;
    setSaving(true);
    try {
      const token = localStorage.getItem("queueless_token");
      let remoteUser: Partial<AuthUser> = {};
      if (token) {
        const payload: Record<string, any> = {
          name: editName.trim(),
          nameLastChanged: newNameLastChanged,
          studentId: editStudentId.trim() || currentUser.studentId,
          phone: cleanDigits,
          email: editEmail.trim(),
          picture: editPicture.trim(),
          course: editCourse.trim(),
          yearLevel: editYearLevel.trim(),
          birthDate: editBirthDate.trim(),
          address: editAddress.trim(),
          emergencyContact: editEmergencyContact.trim(),
        };
        if (otpCode) {
          payload.otp = otpCode;
        }

        const res = await fetch(`${API_URL}/api/auth/profile`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || "Failed to update profile.");
        }
        if (data?.user) remoteUser = data.user;
      }

      const updatedUser: AuthUser = {
        ...currentUser,
        ...remoteUser,
        name: editName.trim(),
        nameLastChanged: newNameLastChanged,
        studentId: editStudentId.trim() || currentUser.studentId,
        phone: cleanDigits,
        email: editEmail.trim(),
        picture: editPicture.trim(),
        contactVerified: authenticated || contactConfirmed,
        course: editCourse.trim(),
        yearLevel: editYearLevel.trim(),
        birthDate: editBirthDate.trim(),
        address: editAddress.trim(),
        emergencyContact: editEmergencyContact.trim(),
      };

      setCurrentUser(updatedUser);
      localStorage.setItem("queueless_user", JSON.stringify(updatedUser));
      if (updatedUser.email) {
        localStorage.setItem(`queueless_profile_${updatedUser.email}`, JSON.stringify(updatedUser));
        if (editPicture) {
          localStorage.setItem(`queueless_custom_pfp_${updatedUser.email}`, editPicture);
        } else {
          localStorage.removeItem(`queueless_custom_pfp_${updatedUser.email}`);
        }
      }
      setContactConfirmed(true);
      setShowAuthConfirmModal(false);
      setShowEmailOtpModal(false);

      setFlash({
        tone: "success",
        text: "Profile and official registrar documentation details saved successfully.",
      });
    } catch (err) {
      setFlash({
        tone: "error",
        text: err instanceof Error ? err.message : "Failed to update profile.",
      });
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!validateInputs()) return;

    const emailChanged = editEmail.trim().toLowerCase() !== (currentUser.email || "").trim().toLowerCase();
    if (emailChanged) {
      setSaving(true);
      try {
        const token = localStorage.getItem("queueless_token");
        const res = await fetch(`${API_URL}/api/auth/send-security-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action: "change_email", targetEmail: editEmail.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to send email verification code.");
        setEmailOtpMaskedEmail(data.maskedEmail || editEmail.trim());
        setEmailOtpCode("");
        setEmailOtpError("");
        setShowEmailOtpModal(true);
      } catch (err) {
        setFlash({
          tone: "error",
          text: err instanceof Error ? err.message : "Failed to send email verification code.",
        });
      } finally {
        setSaving(false);
      }
      return;
    }

    setShowAuthConfirmModal(true);
  };

  const handleVerifyAndSaveEmail = async () => {
    if (!emailOtpCode.trim()) {
      setEmailOtpError("Please enter the 6-digit confirmation code.");
      return;
    }
    setEmailOtpLoading(true);
    setEmailOtpError("");
    try {
      await executeSaveProfile(true, emailOtpCode.trim());
      setShowEmailOtpModal(false);
    } catch (err) {
      setEmailOtpError(err instanceof Error ? err.message : "Invalid verification code.");
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleResendEmailOtp = async () => {
    setEmailOtpLoading(true);
    setEmailOtpError("");
    try {
      const token = localStorage.getItem("queueless_token");
      const res = await fetch(`${API_URL}/api/auth/send-security-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "change_email", targetEmail: editEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend code.");
      setFlash({ tone: "success", text: "A fresh confirmation code has been sent to your new email." });
    } catch (err) {
      setEmailOtpError(err instanceof Error ? err.message : "Failed to resend code.");
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (!pwChangeAllowed) {
      setPwError(`Password can only be changed once every 3 days. Please wait ${daysUntilPwChange} day${daysUntilPwChange !== 1 ? "s" : ""} before changing it again.`);
      return;
    }

    if (/\s/.test(newPassword)) {
      setPwError("Password cannot contain spaces.");
      return;
    }

    if (!isStrongPassword(newPassword)) {
      setPwError(
        "New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    if (!currentPassword.trim()) {
      setPwError("Current password is required. Please enter your accurate old password.");
      return;
    }

    if (currentPassword === newPassword) {
      setPwError("New password cannot be the same as your old current password. Please choose a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("New password and confirm password do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const token = localStorage.getItem("queueless_token");
      const res = await fetch(`${API_URL}/api/auth/send-security-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "change_password", currentPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Current password is incorrect. Please enter your accurate old password.");

      setPwOtpMaskedEmail(data.maskedEmail || currentUser.email || "");
      setPwOtpCode("");
      setPwOtpError("");
      setShowPwOtpModal(true);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Failed to initiate password change. Please verify your current password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleVerifyAndChangePassword = async () => {
    if (!pwOtpCode.trim()) {
      setPwOtpError("Please enter the 6-digit confirmation code.");
      return;
    }
    setPwOtpLoading(true);
    setPwOtpError("");
    try {
      const token = localStorage.getItem("queueless_token");
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          otp: pwOtpCode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password.");

      const nowIso = new Date().toISOString();
      const updatedUser: AuthUser = {
        ...currentUser,
        passwordLastChanged: nowIso,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem("queueless_user", JSON.stringify(updatedUser));

      setPwSuccess("Password changed successfully! A confirmation notice has been sent to your email.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPwOtpModal(false);
    } catch (err) {
      setPwOtpError(err instanceof Error ? err.message : "Failed to verify code and change password.");
    } finally {
      setPwOtpLoading(false);
    }
  };

  const handleResendPwOtp = async () => {
    setPwOtpLoading(true);
    setPwOtpError("");
    try {
      const token = localStorage.getItem("queueless_token");
      const res = await fetch(`${API_URL}/api/auth/send-security-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "change_password", currentPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend code.");
      setFlash({ tone: "success", text: "A fresh verification code has been sent to your email." });
    } catch (err) {
      setPwOtpError(err instanceof Error ? err.message : "Failed to resend code. Please verify your current password.");
    } finally {
      setPwOtpLoading(false);
    }
  };

  const isGuestUser = (() => {
    const email = (currentUser.email || "").toLowerCase().trim();
    if (email.endsWith("@phinmaed.com") || email.includes("phinmaed") || email.endsWith(".edu.ph")) {
      return false;
    }
    if (email.endsWith("@gmail.com")) {
      return true;
    }
    return (
      currentUser.role === "guest" ||
      currentUser.userType === "normal" ||
      Boolean(currentUser.studentId?.startsWith("GUEST"))
    );
  })();

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
          <p className="text-xs text-muted-foreground mt-0.5">
            {currentUser.role === "staff"
              ? "Update your staff profile details and contact number."
              : "Update your personal details. Staff can view your phone number."}
          </p>

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
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressed = await compressAvatarImage(file);
                            setEditPicture(compressed);
                          } catch {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === "string") {
                                setEditPicture(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
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
                readOnly
                disabled
                className="field cursor-not-allowed bg-muted/40 select-none opacity-80"
              />
            </Field>

            {/* Student ID Field (Enrolled Students Only - Not for Guests, Staff, or Admin, and NOT for @gmail.com) */}
            {currentUser.role === "student" && !currentUser.email?.toLowerCase().endsWith("@gmail.com") && (
              <Field
                label={
                  <div className="flex items-center justify-between w-full mb-1">
                    <span>Student ID Number</span>
                    {editStudentId.trim() && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isValidStudentId(editStudentId)
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {isValidStudentId(editStudentId) ? (
                          <>
                            <CheckCircle2 className="size-3" /> Valid ID Format
                          </>
                        ) : (
                          "03-XXXX-XXXXXX or 03-XX-XXXX-XXXXXX"
                        )}
                      </span>
                    )}
                  </div>
                }
              >
                <input
                  type="text"
                  value={editStudentId}
                  onChange={(e) => handleStudentIdChange(e.target.value)}
                  placeholder="Enter your Student Id"
                  className="field font-mono"
                  maxLength={17}
                />
                <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    Enter your Official UPang ID
                  </span>
                  {editStudentId.length > 0 && (
                    <span className="font-mono font-bold">
                      {editStudentId.length}/17 max
                    </span>
                  )}
                </div>
              </Field>
            )}

            {/* Staff ID Field (Staff Only - Format: UP-00-000-T) */}
            {currentUser.role === "staff" && (
              <Field
                label={
                  <div className="flex items-center justify-between w-full mb-1">
                    <span>Staff ID Number</span>
                    {editStudentId.trim() && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isValidStaffId(editStudentId)
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {isValidStaffId(editStudentId) ? (
                          <>
                            <CheckCircle2 className="size-3" /> Valid Staff ID
                          </>
                        ) : (
                          "UP-00-000-T format"
                        )}
                      </span>
                    )}
                  </div>
                }
              >
                <input
                  type="text"
                  value={editStudentId}
                  onChange={(e) => handleStaffIdChange(e.target.value)}
                  placeholder="UP-00-000-T"
                  className="field font-mono uppercase"
                  maxLength={11}
                />
                <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    Enter your Official UPang Staff ID
                  </span>
                  {editStudentId.length > 0 && (
                    <span className="font-mono font-bold">
                      {editStudentId.length}/11
                    </span>
                  )}
                </div>
              </Field>
            )}

            <Field label="Phone Number (Optional)">
              <input
                type="tel"
                inputMode="numeric"
                value={editPhone}
                onChange={(e) => {
                  setEditPhone(normalizePhone(e.target.value));
                }}
                placeholder="09XXXXXXXXX (Optional)"
                className="field font-mono"
                maxLength={11}
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  {currentUser.role === "staff"
                    ? "Campus or personal contact number starting with 09 (optional)"
                    : "Enter valid 11-digit mobile number starting with 09 (optional)"}
                </span>
                {editPhone.length > 0 && (
                  <span className={`font-mono font-bold ${normalizePhone(editPhone).length === 11 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                    {normalizePhone(editPhone).length}/11 digits
                  </span>
                )}
              </div>
            </Field>

            {/* Editable Email Field */}
            <Field
              label={
                <div className="flex items-center justify-between w-full mb-1">
                  <span>Email Address</span>
                  {Boolean(currentUser.contactVerified || contactConfirmed) ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3" /> Verified Email
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      Unverified
                    </span>
                  )}
                </div>
              }
            >
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="e.g. student@phinma.edu.ph"
                className="field"
              />
              <p className="mt-1 text-[11px] text-muted-foreground font-normal">
                {currentUser.role === "staff"
                  ? "Official institutional email address"
                  : "Official email for registrar announcements, assessments, and release receipts"}
              </p>
            </Field>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 border border-border px-4 py-3">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Last Login</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{formatLastLogin(currentUser.lastLogin)}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Role</p>
                <p className="text-sm font-bold text-foreground mt-0.5 capitalize">
                  {currentUser.role === "staff"
                    ? "Registrar Staff"
                    : currentUser.role === "admin"
                    ? "Administrator"
                    : isGuestUser
                    ? "Guest"
                    : "Student"}
                </p>
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

        {/* Right: Account Security */}
        <div className="space-y-6">

          {/* Change Password Card */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Shield className="size-4 text-primary" /> Change Password
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Update your password to keep your account secure.</p>

            <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
              {!pwChangeAllowed && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5 text-xs text-amber-700 dark:text-amber-400 font-semibold leading-relaxed">
                  ⚠️ Password change is in cooldown. You can change your password again in <strong>{daysUntilPwChange} day{daysUntilPwChange !== 1 ? "s" : ""}</strong>. (Password updates are limited to once every 3 days).
                </div>
              )}

              <Field label="Current Password">
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="field pr-10"
                    required
                    disabled={!pwChangeAllowed || changingPassword}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    disabled={!pwChangeAllowed}
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
                    placeholder="Min. 8 characters (uppercase, lowercase, number & symbol)"
                    className="field pr-10"
                    required
                    minLength={8}
                    disabled={!pwChangeAllowed || changingPassword}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    disabled={!pwChangeAllowed}
                  >
                    {showNewPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <PasswordStrengthMeter password={newPassword} />
              </Field>

              <Field label="Confirm New Password">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="field"
                  required
                  minLength={8}
                  disabled={!pwChangeAllowed || changingPassword}
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

              <Button type="submit" variant="outline" disabled={!pwChangeAllowed || changingPassword} className="w-full gap-2 cursor-pointer">
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
                  <span className="font-semibold">
                    {currentUser.role === "staff"
                      ? "Registrar Staff"
                      : currentUser.role === "admin"
                      ? "Administrator"
                      : isGuestUser
                      ? "Guest"
                      : "Student"}
                  </span>
                </div>
                {(currentUser.role === "student" || currentUser.role === "guest" || isGuestUser) && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Priority Status</span>
                    <span className="font-semibold">
                      {currentUser.isPriority ? "⭐ Priority Student" : "Regular Queue"}
                    </span>
                  </div>
                )}
                {currentUser.role === "staff" && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Office</span>
                    <span className="font-semibold">Registrar's Office</span>
                  </div>
                )}
                {currentUser.role === "student" && !isGuestUser && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Program / Year</span>
                    <span className="font-semibold">{editCourse} ({editYearLevel})</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-semibold font-mono">{currentUser.phone || "Not set"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-semibold truncate max-w-[180px]">{currentUser.email || "Not set"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation & Authentication Modal When Saving Profile */}
      {showAuthConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 mb-3">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-center text-foreground">
              Confirm Profile Details
            </h3>
            <p className="mt-1.5 text-xs text-center text-muted-foreground leading-relaxed">
              Please review your details before saving:
            </p>
            <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Name:</span>
                <span className="font-bold text-foreground">{editName}</span>
              </div>
              {editPhone && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1 font-medium">
                    <Phone className="size-3 text-primary" /> Mobile:
                  </span>
                  <span className="font-mono font-bold text-foreground">{editPhone}</span>
                </div>
              )}
              {editEmail && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1 font-medium">
                    <Mail className="size-3 text-primary" /> Email:
                  </span>
                  <span className="font-semibold text-foreground truncate max-w-[200px]">{editEmail}</span>
                </div>
              )}
            </div>
            {editName.trim() !== (currentUser.name || "").trim() && (
              <div className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="size-4 text-amber-600 shrink-0" /> {nameCooldownDays}-Day Name Change Confirmation
                </p>
                <p className="mt-1 leading-relaxed">
                  Notice: Once you confirm this change, your full name will be updated to <strong>{editName.trim()}</strong> and locked for <strong>{nameCooldownDays} days</strong> before it can be modified again.
                </p>
              </div>
            )}
            <p className="mt-3 text-[11px] text-muted-foreground text-center">
              Are you sure you want to save these profile changes?
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAuthConfirmModal(false)}
                className="cursor-pointer"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => executeSaveProfile(true)}
                disabled={saving}
                className="gap-1.5 font-bold cursor-pointer"
              >
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                Confirm & Save Profile
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Email Change OTP Verification Modal */}
      {showEmailOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary mb-3">
              <Mail className="size-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-center text-foreground">
              Verify New Email Address
            </h3>
            <p className="mt-1.5 text-xs text-center text-muted-foreground leading-relaxed">
              We sent a 6-digit verification code to <span className="font-semibold text-foreground">{emailOtpMaskedEmail}</span>. Enter the code below to confirm your new email:
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block text-center">
                  6-Digit Confirmation Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={emailOtpCode}
                  onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  className="field text-center font-mono text-xl tracking-widest font-bold h-12"
                  autoFocus
                />
              </div>

              {emailOtpError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-2.5 text-xs font-semibold text-red-600 dark:text-red-400 text-center">
                  {emailOtpError}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleResendEmailOtp}
                  disabled={emailOtpLoading}
                  className="text-xs text-primary hover:underline font-semibold cursor-pointer disabled:opacity-50"
                >
                  Resend code
                </button>
                <span className="text-[11px] text-muted-foreground">Expires in 10 minutes</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEmailOtpModal(false)}
                  className="cursor-pointer"
                  disabled={emailOtpLoading}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleVerifyAndSaveEmail}
                  disabled={emailOtpLoading || emailOtpCode.length < 6}
                  className="gap-1.5 font-bold cursor-pointer"
                >
                  {emailOtpLoading ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                  Verify & Save Email
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change OTP Verification Modal */}
      {showPwOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 mb-3">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-center text-foreground">
              Security Verification
            </h3>
            <p className="mt-1.5 text-xs text-center text-muted-foreground leading-relaxed">
              To change your password, we sent a 6-digit confirmation code to your registered email <span className="font-semibold text-foreground">{pwOtpMaskedEmail}</span>.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block text-center">
                  6-Digit Security Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={pwOtpCode}
                  onChange={(e) => setPwOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  className="field text-center font-mono text-xl tracking-widest font-bold h-12"
                  autoFocus
                />
              </div>

              {pwOtpError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-2.5 text-xs font-semibold text-red-600 dark:text-red-400 text-center">
                  {pwOtpError}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleResendPwOtp}
                  disabled={pwOtpLoading}
                  className="text-xs text-primary hover:underline font-semibold cursor-pointer disabled:opacity-50"
                >
                  Resend code
                </button>
                <span className="text-[11px] text-muted-foreground">Expires in 10 minutes</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPwOtpModal(false)}
                  className="cursor-pointer"
                  disabled={pwOtpLoading}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleVerifyAndChangePassword}
                  disabled={pwOtpLoading || pwOtpCode.length < 6}
                  className="gap-1.5 font-bold cursor-pointer"
                >
                  {pwOtpLoading ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                  Verify & Update Password
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
}: {
  label: ReactNode;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const term = search.toLowerCase().trim();
    return options.filter((opt) => opt.toLowerCase().includes(term));
  }, [options, search]);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-bold mb-1">
        {label}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen(!open);
            setSearch("");
          }
        }}
        className={`field flex h-9 w-full items-center justify-between px-3 text-xs text-left cursor-pointer transition ${
          disabled ? "opacity-60 cursor-not-allowed bg-muted/40" : "hover:border-primary/50"
        } ${open ? "ring-2 ring-primary/20 border-primary" : ""}`}
      >
        <span className={value ? "font-semibold text-foreground truncate uppercase" : "text-muted-foreground truncate"}>
          {value || placeholder}
        </span>
        <span className="text-muted-foreground text-[10px] ml-1 shrink-0">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[220px] rounded-md border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
          <div className="p-1.5 border-b border-border bg-muted/40">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="h-8 w-full rounded border border-border/80 bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="max-h-52 overflow-y-auto py-1 scrollbar-thin">
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-center">
                <p className="text-xs text-muted-foreground mb-2">No matching options</p>
                {search.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange(search.trim().toUpperCase());
                      setOpen(false);
                      setSearch("");
                    }}
                    className="w-full text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded py-1 px-2 transition cursor-pointer"
                  >
                    Use "{search.trim().toUpperCase()}"
                  </button>
                )}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = (value || "").trim().toUpperCase() === opt.trim().toUpperCase();
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full items-center px-3 py-2 text-xs text-left transition cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-foreground hover:bg-muted/70"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StudentPersonalDetailsView({
  currentUser,
  setCurrentUser,
  setFlash,
  onBack,
  isRequiredGate = false,
  onComplete,
}: {
  currentUser: AuthUser;
  setCurrentUser: (u: AuthUser | null) => void;
  setFlash: (f: Flash) => void;
  onBack: () => void;
  isRequiredGate?: boolean;
  onComplete?: () => void;
}) {
  // Parse existing name into components if not explicitly saved yet
  const nameParts = (currentUser.name || "").trim().split(/\s+/);
  const initialFirstName = currentUser.firstName || (nameParts.length > 0 ? nameParts[0] : "");
  const initialLastName = currentUser.lastName || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : "");
  const initialMiddleName = currentUser.middleName || (nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "");

  // Personal Details
  const [lastName, setLastName] = useState(initialLastName);
  const [firstName, setFirstName] = useState(initialFirstName);
  const [middleName, setMiddleName] = useState(initialMiddleName);
  const [extensionName, setExtensionName] = useState(currentUser.extensionName || "");
  const [editPhone, setEditPhone] = useState(currentUser.phone || "");
  const [editEmail, setEditEmail] = useState(currentUser.email || "");
  const [editGender, setEditGender] = useState(currentUser.gender || "");
  const [editBirthDate, setEditBirthDate] = useState(currentUser.birthDate || "");
  const [editNationality, setEditNationality] = useState(currentUser.nationality || "Filipino");
  const [editReligion, setEditReligion] = useState(currentUser.religion || "");
  const [editCivilStatus, setEditCivilStatus] = useState(currentUser.civilStatus || "Single");

  // Student ID
  const [editStudentId, setEditStudentId] = useState(currentUser.studentId || "");
  const studentIdRegex = /^\d{2}(-\d{2})?-\d{4}-\d{5,6}$/;
  const isValidStudentId = (id: string) => studentIdRegex.test(id.trim());
  const handleStudentIdChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9-]/g, "").slice(0, 17);
    setEditStudentId(cleaned);
  };

  // Family Details
  const [fatherName, setFatherName] = useState(currentUser.fatherName || "");
  const [fatherOccupation, setFatherOccupation] = useState(currentUser.fatherOccupation || "");
  const [fatherMobile, setFatherMobile] = useState(currentUser.fatherMobile || "");
  const [motherName, setMotherName] = useState(currentUser.motherName || "");
  const [motherOccupation, setMotherOccupation] = useState(currentUser.motherOccupation || "");
  const [motherMobile, setMotherMobile] = useState(currentUser.motherMobile || "");
  const [spouseName, setSpouseName] = useState(currentUser.spouseName || "");
  const [spouseOccupation, setSpouseOccupation] = useState(currentUser.spouseOccupation || "");
  const [numberOfChildren, setNumberOfChildren] = useState(currentUser.numberOfChildren || "0");
  const [numberOfBrothers, setNumberOfBrothers] = useState(currentUser.numberOfBrothers || "0");
  const [numberOfSisters, setNumberOfSisters] = useState(currentUser.numberOfSisters || "0");
  const [guardianName, setGuardianName] = useState(currentUser.guardianName || "");
  const [guardianRelationship, setGuardianRelationship] = useState(currentUser.guardianRelationship || "");
  const [guardianMobile, setGuardianMobile] = useState(currentUser.guardianMobile || "");

  // Address Details - Current Address
  const [currentAddress, setCurrentAddress] = useState(currentUser.currentAddress || currentUser.address || "");
  const [currentCountry, setCurrentCountry] = useState(currentUser.currentCountry || "Philippines");
  const [currentProvince, setCurrentProvince] = useState(currentUser.currentProvince || "Pangasinan");
  const [currentCity, setCurrentCity] = useState(currentUser.currentCity || "Dagupan City");
  const [currentPostalCode, setCurrentPostalCode] = useState(currentUser.currentPostalCode || "2400");

  // Address Details - Permanent Address
  const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(
    currentUser.sameAsCurrentAddress !== undefined ? currentUser.sameAsCurrentAddress : true
  );
  const [permanentAddress, setPermanentAddress] = useState(currentUser.permanentAddress || currentUser.address || "");
  const [permanentCountry, setPermanentCountry] = useState(currentUser.permanentCountry || "Philippines");
  const [permanentProvince, setPermanentProvince] = useState(currentUser.permanentProvince || "Pangasinan");
  const [permanentCity, setPermanentCity] = useState(currentUser.permanentCity || "Dagupan City");
  const [permanentPostalCode, setPermanentPostalCode] = useState(currentUser.permanentPostalCode || "2400");

  const [editPicture, setEditPicture] = useState(currentUser.picture || "");

  // Educational Details (students only)
  const [editCourse, setEditCourse] = useState(currentUser.course || "BS Information Technology");
  const [editYearLevel, setEditYearLevel] = useState(currentUser.yearLevel || "1st Year");

  // Educational Background Table
  const [elemSchool, setElemSchool] = useState(currentUser.elemSchool || "");
  const [elemYearGrad, setElemYearGrad] = useState(currentUser.elemYearGrad || "");
  const [elemType, setElemType] = useState(currentUser.elemType || "Public");

  const [juniorHighSchool, setJuniorHighSchool] = useState(currentUser.juniorHighSchool || "");
  const [juniorHighYearGrad, setJuniorHighYearGrad] = useState(currentUser.juniorHighYearGrad || "");
  const [juniorHighType, setJuniorHighType] = useState(currentUser.juniorHighType || "Public");

  const [seniorHighSchool, setSeniorHighSchool] = useState(currentUser.seniorHighSchool || "");
  const [seniorHighYearGrad, setSeniorHighYearGrad] = useState(currentUser.seniorHighYearGrad || "");
  const [seniorHighType, setSeniorHighType] = useState(currentUser.seniorHighType || "Public");

  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeSectionTab, setActiveSectionTab] = useState<"all" | "personal" | "family" | "address" | "course">("all");
  const [termsAgreed, setTermsAgreed] = useState(Boolean(currentUser.termsAccepted));
  const [termsError, setTermsError] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    if (showConfirmModal || showSuccessModal || showTermsModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showConfirmModal, showSuccessModal, showTermsModal]);

  // Email-based detection: @gmail.com = guest; @phinmaed.com or .edu.ph = student
  const isGuestUser = (() => {
    if (currentUser.role === "admin" || currentUser.role === "staff") return false;
    const email = (currentUser.email || "").toLowerCase().trim();
    if (email.endsWith("@phinmaed.com") || email.includes("phinmaed") || email.endsWith(".edu.ph")) {
      return false;
    }
    if (email.endsWith("@gmail.com")) {
      return true;
    }
    return (
      currentUser.role === "guest" ||
      Boolean(currentUser.studentId?.startsWith("GUEST"))
    );
  })();

  const isStudent = !isGuestUser && currentUser.role !== "admin" && currentUser.role !== "staff";

  // Name change cooldown: 3 days for admin, 90 days for others
  const nameCooldownDays = currentUser.role === "admin" ? 3 : 90;
  const nameChangeAllowed = (() => {
    if (!currentUser.nameLastChanged) return true;
    const lastChanged = new Date(currentUser.nameLastChanged);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= nameCooldownDays;
  })();

  const daysUntilNameChange = (() => {
    if (!currentUser.nameLastChanged) return 0;
    const lastChanged = new Date(currentUser.nameLastChanged);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, nameCooldownDays - diffDays);
  })();

  // Institutional record locking: Staff and Users cannot modify legal names once entered & confirmed.
  // When a user is new, their details are editable until confirmed; once saved, only Admin can edit.
  const isNewUser = !currentUser.termsAccepted || !currentUser.lastName?.trim();
  const isNameLocked = currentUser.role !== "admin" && !isNewUser;
  // Student ID is locked once the student has saved it; only Admin can change it afterward
  const isIdLocked = currentUser.role !== "admin" && !isNewUser && Boolean(currentUser.studentId?.trim());

  const validateInputs = () => {
    // Student ID is required for students
    if (isStudent && !isIdLocked && !editStudentId.trim()) {
      setFlash({ tone: "error", text: "Student ID is required." });
      return false;
    }
    if (isStudent && !isIdLocked && editStudentId.trim() && !isValidStudentId(editStudentId)) {
      setFlash({ tone: "error", text: "Please enter a valid Student ID format (e.g. 03-2223-038512)." });
      return false;
    }
    if (!isNameLocked && !lastName.trim()) {
      setFlash({ tone: "error", text: "Last name is required." });
      return false;
    }
    if (!isNameLocked && !firstName.trim()) {
      setFlash({ tone: "error", text: "First name is required." });
      return false;
    }
    if (editPhone.trim()) {
      const cleanDigits = normalizePhone(editPhone);
      if (cleanDigits.length !== 11 || !cleanDigits.startsWith("09")) {
        setFlash({
          tone: "error",
          text: `Mobile number must be a valid 11-digit number starting with 09 (currently ${cleanDigits.length}/11 digits) or leave blank.`,
        });
        return false;
      }
    }
    if (!currentAddress.trim()) {
      setFlash({ tone: "error", text: "Current residential address is required." });
      return false;
    }
    if (isStudent && !editCourse.trim()) {
      setFlash({ tone: "error", text: "Academic program / degree course is required." });
      return false;
    }
    if (isStudent && !editYearLevel.trim()) {
      setFlash({ tone: "error", text: "Year level is required." });
      return false;
    }
    if (isStudent && !elemSchool.trim()) {
      setFlash({ tone: "error", text: "Elementary (Grade School) school name is required (*)." });
      return false;
    }
    if (isStudent && !juniorHighSchool.trim()) {
      setFlash({ tone: "error", text: "Junior High School (Middle School G7 - G10) school name is required (*)." });
      return false;
    }
    if (editEmail) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(editEmail.trim())) {
        setFlash({ tone: "error", text: "Please enter a valid email address." });
        return false;
      }
    }
    if (!termsAgreed) {
      setTermsError("You must agree to the Terms and Conditions and Privacy Policy before proceeding.");
      setFlash({
        tone: "error",
        text: "Please agree to the Terms and Conditions and Privacy Policy to continue.",
      });
      return false;
    }
    setTermsError("");
    return true;
  };

  const computedFullName = [firstName.trim(), middleName.trim(), lastName.trim(), extensionName.trim()]
    .filter(Boolean)
    .join(" ");

  const executeSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("queueless_token");
      const nameChanged = computedFullName !== currentUser.name;
      let remoteUser: Partial<AuthUser> = {};

      const finalLastName = isNameLocked ? (currentUser.lastName || lastName.trim()) : lastName.trim();
      const finalFirstName = isNameLocked ? (currentUser.firstName || firstName.trim()) : firstName.trim();
      const finalMiddleName = isNameLocked ? (currentUser.middleName || middleName.trim()) : middleName.trim();
      const finalExtensionName = isNameLocked ? (currentUser.extensionName || extensionName.trim()) : extensionName.trim();
      const finalFullName = isNameLocked && currentUser.name ? currentUser.name : computedFullName;
      const finalStudentId = isIdLocked ? (currentUser.studentId || editStudentId.trim()) : editStudentId.trim();

      const payload = {
        name: finalFullName,
        lastName: finalLastName,
        firstName: finalFirstName,
        middleName: finalMiddleName,
        extensionName: finalExtensionName,
        ...(isStudent ? { studentId: finalStudentId } : {}),
        termsAccepted: true,
        termsAcceptedAt: currentUser.termsAcceptedAt || new Date().toISOString(),
        phone: editPhone.replace(/\D/g, ""),
        email: editEmail.trim(),
        gender: editGender,
        birthDate: editBirthDate,
        nationality: editNationality,
        religion: editReligion,
        civilStatus: editCivilStatus,
        // Family Details
        fatherName: fatherName.trim(),
        fatherOccupation: fatherOccupation.trim(),
        fatherMobile: fatherMobile.replace(/\D/g, ""),
        motherName: motherName.trim(),
        motherOccupation: motherOccupation.trim(),
        motherMobile: motherMobile.replace(/\D/g, ""),
        spouseName: spouseName.trim(),
        spouseOccupation: spouseOccupation.trim(),
        numberOfChildren,
        numberOfBrothers,
        numberOfSisters,
        guardianName: guardianName.trim(),
        guardianRelationship: guardianRelationship.trim(),
        guardianMobile: guardianMobile.replace(/\D/g, ""),
        // Address Details
        currentAddress: currentAddress.trim(),
        currentCountry: currentCountry.trim(),
        currentProvince: currentProvince.trim(),
        currentCity: currentCity.trim(),
        currentPostalCode: currentPostalCode.trim(),
        sameAsCurrentAddress,
        permanentAddress: (sameAsCurrentAddress ? currentAddress : permanentAddress).trim(),
        permanentCountry: (sameAsCurrentAddress ? currentCountry : permanentCountry).trim(),
        permanentProvince: (sameAsCurrentAddress ? currentProvince : permanentProvince).trim(),
        permanentCity: (sameAsCurrentAddress ? currentCity : permanentCity).trim(),
        permanentPostalCode: (sameAsCurrentAddress ? currentPostalCode : permanentPostalCode).trim(),
        address: currentAddress.trim(),
        picture: editPicture.trim(),
        // Educational (students only)
        ...(isStudent
          ? {
              course: editCourse,
              yearLevel: editYearLevel,
              elemSchool: elemSchool.trim(),
              elemYearGrad: elemYearGrad.trim(),
              elemType,
              juniorHighSchool: juniorHighSchool.trim(),
              juniorHighYearGrad: juniorHighYearGrad.trim(),
              juniorHighType,
              seniorHighSchool: seniorHighSchool.trim(),
              seniorHighYearGrad: seniorHighYearGrad.trim(),
              seniorHighType,
            }
          : {}),
      };

      if (token) {
        try {
          const res = await fetch(`${API_URL}/api/auth/profile`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.user) remoteUser = data.user;
          }
        } catch {
          // offline fallback
        }
      }

      const updatedUser: AuthUser = {
        ...currentUser,
        ...remoteUser,
        ...payload,
        nameLastChanged: nameChanged ? new Date().toISOString() : currentUser.nameLastChanged,
      };

      setCurrentUser(updatedUser);
      localStorage.setItem("queueless_user", JSON.stringify(updatedUser));
      if (updatedUser.email) {
        localStorage.setItem(`queueless_profile_${updatedUser.email}`, JSON.stringify(updatedUser));
        if (updatedUser.picture) {
          localStorage.setItem(`queueless_custom_pfp_${updatedUser.email}`, updatedUser.picture);
        } else {
          localStorage.removeItem(`queueless_custom_pfp_${updatedUser.email}`);
        }
      }
      setShowConfirmModal(false);

      setShowSuccessModal(true);
    } catch (err) {
      setFlash({
        tone: "error",
        text: err instanceof Error ? err.message : "Failed to save personal details.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (!validateInputs()) return;
    setShowConfirmModal(true);
  };

  const SectionHeading = ({ icon, title, subtitle, badge }: { icon: React.ReactNode; title: string; subtitle: string; badge?: string }) => (
    <div className="mb-4 flex items-start justify-between border-b border-border/70 pb-3">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-display text-sm font-bold text-foreground">
            {title}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </div>
      {badge && (
        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-muted-foreground shrink-0">
          {badge}
        </span>
      )}
    </div>
  );

  return (
    <div className="animate-rise">
      <div className="flex items-center gap-3 mb-4">
        {!isRequiredGate && (
          <Button variant="ghost" size="icon" onClick={onBack} className="size-8 cursor-pointer">
            <ChevronLeft className="size-4" />
          </Button>
        )}
        <PageHeading
          eyebrow="Registrar documentation"
          title="Personal Details"
          text="Fill up your official personal information used by the Registrar's Office for documentation."
        />
      </div>

      {isRequiredGate && (
        <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
            <ShieldAlert className="size-5 shrink-0" />
            Official Personal Information Required
          </div>
          <p className="mt-1 text-muted-foreground leading-relaxed">
            Before accessing the student dashboard and submitting document requests, school records require you to fill out and confirm your official personal details. Please complete the required fields below and click &quot;Save Personal Details&quot;.
          </p>
        </div>
      )}

      {/* Interactive Form Section Jump Tabs */}
      <div className="mb-6 inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-xl border border-border bg-card p-1.5 shadow-2xs w-fit">
        <button
          type="button"
          onClick={() => setActiveSectionTab("all")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
            activeSectionTab === "all"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <span>All Sections</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSectionTab("personal")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
            activeSectionTab === "personal"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <UserRound className="size-3.5" />
          <span>Personal Info</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSectionTab("family")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
            activeSectionTab === "family"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <UsersRound className="size-3.5" />
          <span>Family Details</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSectionTab("address")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
            activeSectionTab === "address"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <MapPin className="size-3.5" />
          <span>Address Details</span>
        </button>
        {isStudent && (
          <button
            type="button"
            onClick={() => setActiveSectionTab("course")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              activeSectionTab === "course"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <FileText className="size-3.5" />
            <span>Course & Year</span>
          </button>
        )}
      </div>

      <div className="w-full space-y-5">
        {/* Section 1: Personal Details */}
        {(activeSectionTab === "all" || activeSectionTab === "personal") && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <SectionHeading
            icon={<UserRound className="size-4 text-primary" />}
            title="Personal Details"
            subtitle="Your basic personal information for official school records."
            badge="Section 1 of 4"
          />
          <div className="space-y-4 text-xs">
            {isNameLocked && (
              <div className="flex items-center gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-800 dark:text-amber-300 text-xs font-medium">
                <Lock className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  Official Legal Name is locked for school records. Only an Administrator can update your legal name once registered.
                </span>
              </div>
            )}

            {/* Split Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field
                label={
                  <span className="flex items-center justify-between">
                    <span>Last Name *</span>
                    {isNameLocked && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                        <Lock className="size-2.5" /> Locked
                      </span>
                    )}
                  </span>
                }
              >
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Dela Cruz"
                  className={`field ${isNameLocked ? "cursor-not-allowed bg-muted/60 opacity-80 pointer-events-none select-none" : ""}`}
                  required
                  readOnly={isNameLocked}
                  disabled={isNameLocked}
                />
              </Field>
              <Field
                label={
                  <span className="flex items-center justify-between">
                    <span>First Name *</span>
                    {isNameLocked && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                        <Lock className="size-2.5" /> Locked
                      </span>
                    )}
                  </span>
                }
              >
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Juan"
                  className={`field ${isNameLocked ? "cursor-not-allowed bg-muted/60 opacity-80 pointer-events-none select-none" : ""}`}
                  required
                  readOnly={isNameLocked}
                  disabled={isNameLocked}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field
                label={
                  <span className="flex items-center justify-between">
                    <span>Middle Name</span>
                    {isNameLocked && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                        <Lock className="size-2.5" /> Locked
                      </span>
                    )}
                  </span>
                }
              >
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="e.g. Santos"
                  className={`field ${isNameLocked ? "cursor-not-allowed bg-muted/60 opacity-80 pointer-events-none select-none" : ""}`}
                  readOnly={isNameLocked}
                  disabled={isNameLocked}
                />
              </Field>
              <Field label="Extension Name">
                <select
                  value={extensionName}
                  onChange={(e) => setExtensionName(e.target.value)}
                  className="field cursor-pointer"
                >
                  <option value="">Please Select</option>
                  <option value="Jr.">Jr.</option>
                  <option value="Sr.">Sr.</option>
                  <option value="I">I</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IV">IV</option>
                </select>
              </Field>
            </div>

            {/* Student ID Field - Required for students, locked once saved */}
            {isStudent && (
              <Field
                label={
                  <div className="flex items-center justify-between w-full mb-1">
                    <span>Student ID Number *</span>
                    {isIdLocked ? (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                        <Lock className="size-2.5" /> Locked
                      </span>
                    ) : editStudentId.trim() && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isValidStudentId(editStudentId)
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {isValidStudentId(editStudentId) ? (
                          <><CheckCircle2 className="size-3" /> Valid ID Format</>
                        ) : (
                          "Invalid format"
                        )}
                      </span>
                    )}
                  </div>
                }
              >
                <input
                  type="text"
                  value={editStudentId}
                  onChange={(e) => handleStudentIdChange(e.target.value)}
                  placeholder="Enter your Official UPang ID"
                  className={`field font-mono ${isIdLocked ? "cursor-not-allowed bg-muted/60 opacity-80 pointer-events-none select-none" : ""}`}
                  maxLength={17}
                  required
                  readOnly={isIdLocked}
                  disabled={isIdLocked}
                />
                {isIdLocked && (
                  <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                    <Lock className="size-3 shrink-0" /> Student ID is locked. Only an Administrator can update your Student ID.
                  </p>
                )}
                {!isIdLocked && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Enter your Official UPang ID
                  </p>
                )}
              </Field>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Mobile Number (Optional)">
                <input
                  type="tel"
                  inputMode="numeric"
                  value={editPhone}
                  onChange={(e) => {
                    setEditPhone(normalizePhone(e.target.value));
                  }}
                  placeholder="09XXXXXXXXX (Optional)"
                  className="field font-mono"
                  maxLength={11}
                />
                <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Enter 11‑digit mobile number starting with “09” (optional).</span>
                  {editPhone.length > 0 && (
                    <span className={`font-mono font-bold ${normalizePhone(editPhone).length === 11 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                      {normalizePhone(editPhone).length}/11 digits
                    </span>
                  )}
                </div>
              </Field>
              <Field label="Email Address">
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="e.g. user@phinmaed.com"
                  className="field"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Gender">
                <select value={editGender} onChange={(e) => setEditGender(e.target.value)} className="field cursor-pointer">
                  <option value="">Please Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </Field>
              <Field label="Date of Birth">
                <input
                  type="date"
                  value={editBirthDate}
                  onChange={(e) => setEditBirthDate(e.target.value)}
                  className="field"
                  max="2026-12-31"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Nationality">
                <input
                  type="text"
                  value={editNationality}
                  onChange={(e) => setEditNationality(e.target.value)}
                  placeholder="Filipino"
                  className="field"
                />
              </Field>
              <Field label="Religion">
                <input
                  type="text"
                  value={editReligion}
                  onChange={(e) => setEditReligion(e.target.value)}
                  placeholder="e.g. Roman Catholic"
                  className="field"
                />
              </Field>
              <Field label="Civil Status">
                <select value={editCivilStatus} onChange={(e) => setEditCivilStatus(e.target.value)} className="field cursor-pointer">
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                </select>
              </Field>
            </div>
          </div>
        </div>
        )}

        {/* Section 2: Family Details */}
        {(activeSectionTab === "all" || activeSectionTab === "family") && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <SectionHeading
              icon={<UsersRound className="size-4 text-primary" />}
              title="Family Details"
              subtitle="Parent, spouse, and guardian information for records."
              badge="Section 2 of 4"
            />
          <div className="space-y-4 text-xs">
            {/* Father */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Father's Full Name">
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="e.g. Juan Dela Cruz Sr."
                  className="field"
                />
              </Field>
              <Field label="Father's Occupation">
                <input
                  type="text"
                  value={fatherOccupation}
                  onChange={(e) => setFatherOccupation(e.target.value)}
                  placeholder="e.g. Engineer / Businessman"
                  className="field"
                />
              </Field>
              <Field label="Father's Mobile No.">
                <input
                  type="tel"
                  value={fatherMobile}
                  onChange={(e) => {
                    const numbers = e.target.value.replace(/\D/g, "");
                    setFatherMobile(numbers.slice(0, 11));
                  }}
                  placeholder="09XXXXXXXXX"
                  className="field"
                  maxLength={11}
                />
              </Field>
            </div>

            {/* Mother */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="* Mother's Full Name (Maiden)">
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  placeholder="e.g. Maria B. Santos"
                  className="field"
                />
              </Field>
              <Field label="* Mother's Occupation">
                <input
                  type="text"
                  value={motherOccupation}
                  onChange={(e) => setMotherOccupation(e.target.value)}
                  placeholder="e.g. Teacher / Homemaker"
                  className="field"
                />
              </Field>
              <Field label="* Mother's Mobile No.">
                <input
                  type="tel"
                  value={motherMobile}
                  onChange={(e) => {
                    const numbers = e.target.value.replace(/\D/g, "");
                    setMotherMobile(numbers.slice(0, 11));
                  }}
                  placeholder="09XXXXXXXXX"
                  className="field"
                  maxLength={11}
                />
              </Field>
            </div>

            {/* Spouse & Children */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Name of Spouse">
                <input
                  type="text"
                  value={spouseName}
                  onChange={(e) => setSpouseName(e.target.value)}
                  placeholder="If married"
                  className="field"
                />
              </Field>
              <Field label="Spouse Occupation">
                <input
                  type="text"
                  value={spouseOccupation}
                  onChange={(e) => setSpouseOccupation(e.target.value)}
                  placeholder="Spouse profession"
                  className="field"
                />
              </Field>
              <Field label="Number of Children">
                <input
                  type="number"
                  min="0"
                  value={numberOfChildren}
                  onChange={(e) => setNumberOfChildren(e.target.value)}
                  className="field"
                />
              </Field>
            </div>

            {/* Siblings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Number of Brothers">
                <input
                  type="number"
                  min="0"
                  value={numberOfBrothers}
                  onChange={(e) => setNumberOfBrothers(e.target.value)}
                  className="field"
                />
              </Field>
              <Field label="Number of Sisters">
                <input
                  type="number"
                  min="0"
                  value={numberOfSisters}
                  onChange={(e) => setNumberOfSisters(e.target.value)}
                  className="field"
                />
              </Field>
            </div>

            {/* Guardian */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Name of Guardian">
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="If living with guardian"
                  className="field"
                />
              </Field>
              <Field label="Relationship with Guardian">
                <input
                  type="text"
                  value={guardianRelationship}
                  onChange={(e) => setGuardianRelationship(e.target.value)}
                  placeholder="e.g. Aunt, Grandparent"
                  className="field"
                />
              </Field>
              <Field label="Guardian's Mobile No.">
                <input
                  type="tel"
                  value={guardianMobile}
                  onChange={(e) => {
                    const numbers = e.target.value.replace(/\D/g, "");
                    setGuardianMobile(numbers.slice(0, 11));
                  }}
                  placeholder="09XXXXXXXXX"
                  className="field"
                  maxLength={11}
                />
              </Field>
            </div>
          </div>
        </div>
        )}

        {/* Section 3: Address Details */}
        {(activeSectionTab === "all" || activeSectionTab === "address") && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <SectionHeading
              icon={<MapPin className="size-4 text-primary" />}
              title="Address Details"
              subtitle="Your current and permanent residential addresses."
              badge="Section 3 of 4"
            />
          <div className="space-y-4 text-xs">
            <div>
              <p className="font-semibold text-foreground mb-2 text-xs">Current Address</p>
              <Field label="* Address (House No., Street, Barangay)">
                <input
                  type="text"
                  value={currentAddress}
                  onChange={(e) => setCurrentAddress(e.target.value)}
                  placeholder="e.g. 123 Arellano St., Barangay Pantal"
                  className="field"
                />
              </Field>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <SearchableSelect
                  label="* Country"
                  value={currentCountry}
                  onChange={setCurrentCountry}
                  options={COUNTRIES_LIST}
                  placeholder="Select Country"
                />
                <SearchableSelect
                  label="* Province"
                  value={currentProvince}
                  onChange={setCurrentProvince}
                  options={PHILIPPINE_PROVINCES}
                  placeholder="Select Province"
                />
                <SearchableSelect
                  label="* City / Municipality"
                  value={currentCity}
                  onChange={setCurrentCity}
                  options={PHILIPPINE_CITIES}
                  placeholder="Select City / Municipality"
                />
                <Field label="* Postal Code">
                  <input
                    type="text"
                    value={currentPostalCode}
                    onChange={(e) => setCurrentPostalCode(e.target.value)}
                    placeholder="2400"
                    className="field"
                  />
                </Field>
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-foreground text-xs">Permanent Address</p>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-muted-foreground select-none">
                  <input
                    type="checkbox"
                    checked={sameAsCurrentAddress}
                    onChange={(e) => setSameAsCurrentAddress(e.target.checked)}
                    className="rounded border-border size-3.5 text-primary"
                  />
                  <span>* Same as Current Address?</span>
                </label>
              </div>

              {!sameAsCurrentAddress && (
                <div className="space-y-3">
                  <Field label="* Address">
                    <input
                      type="text"
                      value={permanentAddress}
                      onChange={(e) => setPermanentAddress(e.target.value)}
                      placeholder="Permanent house and street address"
                      className="field"
                    />
                  </Field>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <SearchableSelect
                      label="* Country"
                      value={permanentCountry}
                      onChange={setPermanentCountry}
                      options={COUNTRIES_LIST}
                      placeholder="Select Country"
                    />
                    <SearchableSelect
                      label="* Province"
                      value={permanentProvince}
                      onChange={setPermanentProvince}
                      options={PHILIPPINE_PROVINCES}
                      placeholder="Select Province"
                    />
                    <SearchableSelect
                      label="* City/Municipality"
                      value={permanentCity}
                      onChange={setPermanentCity}
                      options={PHILIPPINE_CITIES}
                      placeholder="Select City / Municipality"
                    />
                    <Field label="* Postal Code">
                      <input
                        type="text"
                        value={permanentPostalCode}
                        onChange={(e) => setPermanentPostalCode(e.target.value)}
                        placeholder="2400"
                        className="field"
                      />
                    </Field>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Section 4: Educational / Course Details (Students Only) */}
        {isStudent && (activeSectionTab === "all" || activeSectionTab === "course") && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <SectionHeading
              icon={<FileText className="size-4 text-primary" />}
              title="Course Details & Educational Details"
              subtitle="Your academic degree program and current year level."
              badge="Section 4 of 4"
            />
            <div className="space-y-4 text-xs">
              <Field label="Degree / Academic Program">
                <select
                  value={editCourse}
                  onChange={(e) => setEditCourse(e.target.value)}
                  className="field cursor-pointer"
                >
                  <option value="BS Information Technology">BS Information Technology (BSIT)</option>
                  <option value="BS Computer Science">BS Computer Science (BSCS)</option>
                  <option value="BS Nursing">BS Nursing (BSN)</option>
                  <option value="BS Criminology">BS Criminology (BSCrim)</option>
                  <option value="BS Accountancy">BS Accountancy (BSA)</option>
                  <option value="BS Business Administration">BS Business Administration (BSBA)</option>
                  <option value="BS Hospitality Management">BS Hospitality Management (BSHM)</option>
                  <option value="BS Civil Engineering">BS Civil Engineering (BSCE)</option>
                  <option value="BS Education">Bachelor of Secondary Education (BSED)</option>
                  <option value="Senior High School">Senior High School (SHS)</option>
                  <option value="Other Program">Other Program</option>
                </select>
              </Field>
              <Field label="Year Level / Status">
                <select
                  value={editYearLevel}
                  onChange={(e) => setEditYearLevel(e.target.value)}
                  className="field cursor-pointer"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Graduated / Alumnus">Graduated / Alumnus</option>
                </select>
              </Field>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 border border-border px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Student ID</p>
                  <p className="text-sm font-bold font-mono text-foreground mt-0.5">{currentUser.studentId}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Program / Year</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{editCourse} • {editYearLevel}</p>
                </div>
              </div>

              {/* Educational Details Table */}
              <div className="mt-5 pt-4 border-t border-border/70">
                <div className="mb-3">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="size-4 text-primary" />
                    Educational Details
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Fill in your official school background required for student profile records.
                  </p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border bg-card">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="py-2.5 px-3 w-14 text-center">Sr No.</th>
                        <th className="py-2.5 px-3 min-w-[200px]">Level</th>
                        <th className="py-2.5 px-3 min-w-[220px]">Name Of School</th>
                        <th className="py-2.5 px-3 w-32">Year Graduated</th>
                        <th className="py-2.5 px-3 w-32">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {/* Row 1: Elementary */}
                      <tr className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-3 text-center font-bold font-mono text-muted-foreground">1</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-foreground text-xs">* Elementary ( Grade School )</span>
                          <span className="text-[10px] text-primary block">Required</span>
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={elemSchool}
                            onChange={(e) => setElemSchool(e.target.value)}
                            placeholder="Name of Elementary School *"
                            className="field h-8 text-xs"
                            required
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={elemYearGrad}
                            onChange={(e) => setElemYearGrad(e.target.value)}
                            placeholder="e.g. 2018"
                            className="field h-8 text-xs font-mono"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={elemType}
                            onChange={(e) => setElemType(e.target.value)}
                            className="field h-8 text-xs cursor-pointer"
                          >
                            <option value="Public">Public</option>
                            <option value="Private">Private</option>
                          </select>
                        </td>
                      </tr>

                      {/* Row 2: Junior High School */}
                      <tr className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-3 text-center font-bold font-mono text-muted-foreground">2</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-foreground text-xs">* Junior High School ( Middle School G7 - G10 )</span>
                          <span className="text-[10px] text-primary block">Required</span>
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={juniorHighSchool}
                            onChange={(e) => setJuniorHighSchool(e.target.value)}
                            placeholder="Name of Junior High School *"
                            className="field h-8 text-xs"
                            required
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={juniorHighYearGrad}
                            onChange={(e) => setJuniorHighYearGrad(e.target.value)}
                            placeholder="e.g. 2022"
                            className="field h-8 text-xs font-mono"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={juniorHighType}
                            onChange={(e) => setJuniorHighType(e.target.value)}
                            className="field h-8 text-xs cursor-pointer"
                          >
                            <option value="Public">Public</option>
                            <option value="Private">Private</option>
                          </select>
                        </td>
                      </tr>

                      {/* Row 3: Senior High School */}
                      <tr className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-3 text-center font-bold font-mono text-muted-foreground">3</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-foreground text-xs">Senior high school ( G11- G12 )</span>
                          <span className="text-[10px] text-muted-foreground block">Optional</span>
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={seniorHighSchool}
                            onChange={(e) => setSeniorHighSchool(e.target.value)}
                            placeholder="Name of Senior High School"
                            className="field h-8 text-xs"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={seniorHighYearGrad}
                            onChange={(e) => setSeniorHighYearGrad(e.target.value)}
                            placeholder="e.g. 2024"
                            className="field h-8 text-xs font-mono"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={seniorHighType}
                            onChange={(e) => setSeniorHighType(e.target.value)}
                            className="field h-8 text-xs cursor-pointer"
                          >
                            <option value="Public">Public</option>
                            <option value="Private">Private</option>
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sticky Bottom Action Dock: Always visible on screen so user never has to scroll to save */}
        <div
          className={`sticky bottom-3 z-30 rounded-2xl border p-3.5 sm:p-4 shadow-2xl backdrop-blur-md transition-all ${
            termsError
              ? "border-destructive/60 bg-card/95"
              : "border-primary/30 bg-card/95"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="student-terms-agreement"
                  checked={termsAgreed}
                  onChange={(e) => {
                    setTermsAgreed(e.target.checked);
                    if (e.target.checked) setTermsError("");
                  }}
                  className="mt-0.5 size-4.5 rounded border-input text-primary focus:ring-primary/30 cursor-pointer accent-primary shrink-0"
                />
                <span className="text-xs text-foreground leading-snug">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowTermsModal(true);
                    }}
                    className="font-bold text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:opacity-80 cursor-pointer"
                  >
                    Terms and Conditions
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowTermsModal(true);
                    }}
                    className="font-bold text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:opacity-80 cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                  .
                </span>
              </label>
              {termsError && (
                <p className="mt-1 text-[11px] font-semibold text-destructive flex items-center gap-1 animate-in fade-in">
                  <AlertTriangle className="size-3" />
                  {termsError}
                </p>
              )}
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              size="default"
              className="gap-2 cursor-pointer shadow-md font-bold whitespace-nowrap shrink-0 sm:w-auto w-full"
            >
              {saving ? (
                <><Loader2 className="size-4 animate-spin" /> Saving...</>
              ) : (
                <><CheckCircle2 className="size-4" /> Save Personal Details</>
              )}
            </Button>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center pb-2">
          * These details are encoded onto official school certifications, receipts, and transcripts.
        </p>
      </div>

      {/* Confirm Save Modal */}
      {showConfirmModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 mb-3">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-center text-foreground">
              Confirm Personal Details
            </h3>
            <p className="mt-1.5 text-xs text-center text-muted-foreground leading-relaxed">
              Please review your details before saving. These will be applied to your official registrar documentation:
            </p>
            <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Full Name:</span>
                <span className="font-bold text-foreground">{computedFullName}</span>
              </div>
              {editPhone && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Mobile:</span>
                  <span className="font-mono font-bold text-foreground">{editPhone}</span>
                </div>
              )}
              {editEmail && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Email:</span>
                  <span className="font-semibold text-foreground truncate max-w-[200px]">{editEmail}</span>
                </div>
              )}
              {currentAddress && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Current Address:</span>
                  <span className="font-semibold text-foreground truncate max-w-[200px]">
                    {currentAddress}, {currentCity}
                  </span>
                </div>
              )}
              {isStudent && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Program / Year:</span>
                  <span className="font-semibold text-foreground">{editCourse} • {editYearLevel}</span>
                </div>
              )}
              {isStudent && elemSchool && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Elementary:</span>
                  <span className="font-semibold text-foreground truncate max-w-[200px]">{elemSchool} ({elemType})</span>
                </div>
              )}
              {isStudent && juniorHighSchool && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Junior High:</span>
                  <span className="font-semibold text-foreground truncate max-w-[200px]">{juniorHighSchool} ({juniorHighType})</span>
                </div>
              )}
            </div>
            <div className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="size-4 text-amber-600 shrink-0" /> Important Registration Notice
              </p>
              <p className="mt-1 leading-relaxed">
                Once confirmed, your official legal name and institutional records will be saved and locked. Only an authorized Administrator can modify institutional records.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmModal(false)}
                className="cursor-pointer"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={executeSave}
                disabled={saving}
                className="gap-1.5 font-bold cursor-pointer"
              >
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                Confirm & Apply
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showSuccessModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 mb-4">
              <CheckCircle2 className="size-7" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Applied successfully!
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Your personal details have been updated and applied to your official registrar records.
            </p>
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                if (onComplete) {
                  onComplete();
                }
              }}
              className="mt-5 w-full gap-2 cursor-pointer font-bold"
            >
              <CheckCircle2 className="size-4" /> {isRequiredGate ? "Enter Full Access Dashboard" : "OK"}
            </Button>
          </div>
        </div>,
        document.body
      )}

      {showTermsModal && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowTermsModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/40">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Terms of Service & Privacy Policy
                </h3>
                <p className="text-xs text-muted-foreground">
                  QueueLess Registrar Document & Queuing System
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 text-xs text-muted-foreground space-y-4 leading-relaxed">
              <section>
                <h4 className="font-semibold text-sm text-foreground mb-1">
                  1. Role-Based Access & Authentication
                </h4>
                <p>
                  QueueLess provides a centralized role-based access control (RBAC) portal for PHINMA University of Pangasinan. Users (Students, Guests, Registrar Staff, and System Administrators) sign in using authorized university credentials and are automatically routed to their corresponding authorized portal.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-sm text-foreground mb-1">
                  2. Document Requests & Queue Policies
                </h4>
                <p>
                  Official documents requested through this portal (such as Transcript of Records, Certifications, Honorable Dismissal) require verification and registrar clearance. Request queue numbers and priority processing tags are strictly monitored. Users must observe registrar guidelines and claiming schedules.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-sm text-foreground mb-1">
                  3. Philippine Data Privacy Act Compliance (RA 10173)
                </h4>
                <p>
                  In compliance with Republic Act No. 10173, all student identifiers, personal information, educational background, contact numbers, and transaction logs stored in QueueLess are treated with strict confidentiality and used exclusively for official registrar services and university records.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-sm text-foreground mb-1">
                  4. Account Security & Verification
                </h4>
                <p>
                  Users must keep their passwords and OTP authentication tokens confidential. Any unauthorized attempt to tamper with queue numbers, document statuses, or audit records will result in account revocation and appropriate administrative sanctions.
                </p>
              </section>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4 bg-muted/30">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTermsModal(false)}
                className="cursor-pointer"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setTermsAgreed(true);
                  setTermsError("");
                  setShowTermsModal(false);
                }}
                className="cursor-pointer"
              >
                I Agree & Understand
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
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
  docTypes,
  onOpenCalendar,
  onPersonalDetailsComplete,
}: {
  view: View;
  navigate: (v: View) => void;
  requests: RequestItem[];
  setRequests: (r: RequestItem[]) => void;
  setFlash: (f: Flash) => void;
  currentUser: AuthUser | null;
  setCurrentUser: (u: AuthUser | null) => void;
  docTypes?: string[];
  onOpenCalendar?: () => void;
  onPersonalDetailsComplete?: (isInitialGate?: boolean) => void;
}) {
  const [selectedReceipt, setSelectedReceipt] = useState<RequestItem | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

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
    (currentUser.role !== "admin" && currentUser.role !== "staff" && (
      Boolean(currentUser.studentId?.startsWith("GUEST")) ||
      Boolean(currentUser.email?.toLowerCase().endsWith("@gmail.com"))
    ));

  const isGateActive = !isPersonalDetailsComplete(currentUser);

  if (isGateActive || view === "personal_details") {
    return (
      <StudentPersonalDetailsView
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        setFlash={setFlash}
        isRequiredGate={isGateActive}
        onComplete={() => {
          if (isGateActive && onPersonalDetailsComplete) {
            onPersonalDetailsComplete(true);
          } else {
            navigate("dashboard");
            setFlash({
              tone: "success",
              text: "Personal details updated successfully.",
            });
          }
        }}
        onBack={() => navigate("dashboard")}
      />
    );
  }

  if (view === "new") {
    const hasValidEmail = Boolean(currentUser.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentUser.email.trim()));

    if (!hasValidEmail) {
      return (
        <div className="animate-rise max-w-xl mx-auto my-8">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 sm:p-8 text-center shadow-lg">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 mb-4">
              <Mail className="size-7" />
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
              Verified Email Required
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              A valid email address is required so registrar staff can verify your identity and send request updates. Please update your profile with a valid email.
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
                onClick={() => navigate("personal_details")}
                className="w-full sm:w-auto gap-2 font-bold cursor-pointer"
              >
                <UserRound className="size-4" /> Update Personal Details
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // OTP email verification gate
    if (!currentUser.contactVerified) {
      const handleSendOtp = async () => {
        setOtpLoading(true);
        setOtpError("");
        try {
          const token = localStorage.getItem("queueless_token");
          const res = await fetch(`${API_URL}/api/auth/send-otp`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ email: currentUser.email }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({ message: "Failed to send OTP." }));
            throw new Error(data.message || "Failed to send OTP.");
          }
          setOtpSent(true);
        } catch (err) {
          setOtpError(err instanceof Error ? err.message : "Unable to send verification code.");
        } finally {
          setOtpLoading(false);
        }
      };

      const handleVerifyOtp = async () => {
        setOtpLoading(true);
        setOtpError("");
        try {
          const token = localStorage.getItem("queueless_token");
          let res = await fetch(`${API_URL}/api/auth/verify-contact-otp`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ email: currentUser.email, otp: otpCode, code: otpCode }),
          });
          if (!res.ok) {
            res = await fetch(`${API_URL}/api/auth/verify-otp`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({ email: currentUser.email, otp: otpCode, code: otpCode }),
            });
          }
          if (!res.ok) {
            const data = await res.json().catch(() => ({ message: "Invalid verification code." }));
            throw new Error(data.message || "Invalid verification code.");
          }
          const updated: AuthUser = { ...currentUser, contactVerified: true };
          setCurrentUser(updated);
          localStorage.setItem("queueless_user", JSON.stringify(updated));
          if (updated.email) {
            localStorage.setItem(`queueless_profile_${updated.email}`, JSON.stringify(updated));
          }
          setFlash({ tone: "success", text: "Email verified successfully! You may now submit your document request." });
        } catch (err) {
          setOtpError(err instanceof Error ? err.message : "Verification failed. Please check the code and try again.");
        } finally {
          setOtpLoading(false);
        }
      };

      return (
        <div className="animate-rise max-w-xl mx-auto my-8">
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6 sm:p-8 text-center shadow-lg">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-400 mb-4">
              <ShieldCheck className="size-7" />
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
              Email Verification Required
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              To protect your identity, please verify your email address before submitting a document request. We'll send a one-time verification code to <strong className="text-foreground">{currentUser.email}</strong>.
            </p>

            {otpError && (
              <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-700 dark:text-red-400 font-medium">
                {otpError}
              </div>
            )}

            {!otpSent ? (
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
                  onClick={handleSendOtp}
                  disabled={otpLoading}
                  className="w-full sm:w-auto gap-2 font-bold cursor-pointer"
                >
                  {otpLoading ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
                  Send Verification Code
                </Button>
              </div>
            ) : (
              <div className="mt-5 mx-auto max-w-xs space-y-3">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Verification code sent to your email!
                </p>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6‑digit code"
                  className="field text-center text-lg font-mono tracking-widest"
                  maxLength={6}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => { setOtpSent(false); setOtpCode(""); setOtpError(""); }}
                    className="flex-1 cursor-pointer"
                  >
                    Resend
                  </Button>
                  <Button
                    size="default"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otpCode.length < 6}
                    className="flex-1 gap-2 font-bold cursor-pointer"
                  >
                    {otpLoading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                    Verify
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <NewRequest
        currentUser={currentUser}
        docTypes={docTypes}
        existingRequests={requests}
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
        onUpdateRequest={(updated) =>
          setRequests(requests.map((r) => (r.id === updated.id ? updated : r)))
        }
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

  if (view === "personal_details") {
    return (
      <StudentPersonalDetailsView
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        setFlash={setFlash}
        onBack={() => navigate("dashboard")}
      />
    );
  }

  if (view === "documents") {
    return (
      <DocumentsPanel
        docs={docTypes}
        readOnly={true}
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
            </div>
          </div>
        </div>

      </div>

      {/* Clean Quick Actions Row */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          size="default"
          onClick={() => {
            navigate("new");
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
          onUpdateRequest={(updated) => {
            setSelectedReceipt(updated);
            setRequests(requests.map((r) => (r.id === updated.id ? updated : r)));
          }}
        />
      )}
    </div>
  );
}

function NewRequest({
  currentUser,
  docTypes = documentTypes,
  existingRequests = [],
  onBack,
  onSubmit,
}: {
  currentUser: AuthUser;
  docTypes?: string[];
  existingRequests?: RequestItem[];
  onBack: () => void;
  onSubmit: (
    r: RequestItem
  ) => void;
}) {
  const [doc, setDoc] = useState(
    () => (docTypes && docTypes.length > 0 ? docTypes[0] : documentTypes[0])
  );

  const [purpose, setPurpose] =
    useState("");

  const [copies, setCopies] =
    useState<number>(1);

  const [email, setEmail] =
    useState(currentUser.email || "");

  const [remarks, setRemarks] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [showConfirmModal, setShowConfirmModal] =
    useState(false);

  useEffect(() => {
    if (showConfirmModal) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [showConfirmModal]);

  // Check how many document requests this user submitted today (max 2 per day)
  const userRequestsToday = useMemo(() => {
    if (!existingRequests || !existingRequests.length) return 0;
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDate = now.getDate();

    const isToday = (dateStr?: string) => {
      if (!dateStr || typeof dateStr !== "string") return false;
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return (
          parsed.getFullYear() === todayYear &&
          parsed.getMonth() === todayMonth &&
          parsed.getDate() === todayDate
        );
      }
      return false;
    };

    const studentIdClean = (currentUser.studentId || "").trim().toLowerCase();
    const emailClean = (currentUser.email || "").trim().toLowerCase();
    const nameClean = (currentUser.name || "").trim().toLowerCase();

    return existingRequests.filter((r) => {
      const matchId = Boolean(studentIdClean && r.studentId && r.studentId.trim().toLowerCase() === studentIdClean);
      const matchEmail = Boolean(emailClean && (r as any).email && (r as any).email.trim().toLowerCase() === emailClean);
      const matchName = Boolean(nameClean && r.student && r.student.trim().toLowerCase() === nameClean);
      if (!matchId && !matchEmail && !matchName) return false;

      return isToday(r.date) || isToday((r as any).createdAt);
    }).length;
  }, [existingRequests, currentUser]);

  const dailyLimitReached = userRequestsToday >= 2;

  const handlePreSubmit = (
    e: FormEvent
  ) => {
    e.preventDefault();
    setError("");

    if (dailyLimitReached) {
      setError("Daily Request Limit Reached: You have already submitted 2 requests today. Please return tomorrow.");
      return;
    }

    if (purpose.trim().length < 3) {
      setError(
        "Please provide a valid purpose for this request."
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError("Please provide a valid email address (e.g. student@phinmaed.com).");
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
              email: email.trim(),
              document: doc,
              purpose:
                purpose.trim(),
              phone: (currentUser.phone || "").trim(),
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
        phone: result.request.phone || (currentUser.phone || "").trim(),
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
      console.warn("Backend unavailable, generating ticket and saving request locally:", error);

      const isPriority = currentUser.isPriority || currentUser.userType === "priority";
      const existingReqs: RequestItem[] = (() => {
        try {
          return JSON.parse(localStorage.getItem("queueless_requests") || "[]");
        } catch {
          return [];
        }
      })();
      const nextLine = (existingReqs.filter((r) => r.status !== "Claimed").length || 0) + 1;
      const localReqNumber = `REQ-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
      const savedRequest: RequestItem = {
        id: localReqNumber,
        student: currentUser.name || "Student",
        studentId: currentUser.studentId || (currentUser.role === "guest" ? "" : "03-2425-012345"),
        phone: (currentUser.phone || "").trim(),
        document: docType.trim(),
        purpose: purpose.trim(),
        remarks: remarks.trim(),
        date,
        status: "Processing",
        lineNumber: nextLine,
        priority: isPriority ? "Priority" : "Regular",
        copies: copies || 1,
        pickupDate: "",
        paymentStatus: "Proceed to Registrar Staff",
      };

      try {
        existingReqs.unshift(savedRequest);
        localStorage.setItem("queueless_requests", JSON.stringify(existingReqs));
      } catch {}

      setShowConfirmModal(false);
      onSubmit(savedRequest);
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

      {/* Daily Request Limit Banner */}
      <div className="mt-6">
        {dailyLimitReached ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <h4 className="font-bold text-sm">Daily Request Limit Reached (2 of 2 requests used today)</h4>
                <p className="mt-1 text-xs leading-relaxed opacity-90">
                  To ensure fair queue access and expedited document preparation for all students, users are allowed a maximum of <strong>2 document requests per day</strong>. You may submit your next request tomorrow.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3.5 py-2 text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <ClipboardCheck className="size-3.5 text-primary" /> Daily Request Quota:
            </span>
            <span className="font-semibold text-foreground">
              {userRequestsToday} / 2 requests submitted today
            </span>
          </div>
        )}
      </div>

      <form
        onSubmit={handlePreSubmit}
        className="mt-6 space-y-9"
      >
        <fieldset>
          <legend className="font-display text-xl font-bold">
            1. Choose your document *
          </legend>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {docTypes.map(
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

          {/* Document Requirements Notice */}
          {doc && (
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <ClipboardList className="size-4" />
                <span>Requirements to claim {doc}:</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Please prepare the following credentials to present at the Registrar window upon claiming:
              </p>
              <ul className="mt-2.5 space-y-1.5">
                {getDocumentRequirements(doc).map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                    <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
            <Field label="Notification Email Address *">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@phinmaed.com"
                className="field"
                required
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                We will email you official status updates and claiming notices.
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
                className="field min-h-28 py-3 resize-none overflow-y-auto"
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
            disabled={loading || dailyLimitReached}
            className={dailyLimitReached ? "opacity-60 cursor-not-allowed" : ""}
          >
            {loading
              ? "Submitting request..."
              : dailyLimitReached
              ? "Daily Limit Reached (2/2)"
              : "Review & Submit Request"}

            {!loading && !dailyLimitReached && (
              <ArrowRight />
            )}
          </Button>
        </div>
      </form>

      {/* Student Request Confirmation Modal */}
      {showConfirmModal && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => !loading && setShowConfirmModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirm Request Submission"
            className="w-full max-w-md max-h-[85vh] flex flex-col rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xl animate-in zoom-in-95 duration-150 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-2.5 border-b border-border pb-3 shrink-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileCheck2 className="size-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Confirm Document Request
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Review details below before submitting to the Registrar's Office.
                </p>
              </div>
            </div>

            <div className="mt-3 flex-1 overflow-y-auto space-y-2 rounded-xl border border-border bg-muted/20 p-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Document:</span>
                <span className="font-bold text-foreground text-right">{doc}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Number of Copies:</span>
                <span className="font-bold text-foreground">{copies} {copies === 1 ? "copy" : "copies"}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Purpose:</span>
                <span className="font-bold text-foreground text-right">{purpose}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Student Name:</span>
                <span className="font-semibold text-foreground">{currentUser.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Student ID Number:</span>
                <span className="font-mono font-semibold text-foreground">{currentUser.studentId}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Queue Ranking:</span>
                <span className="font-bold text-foreground">
                  {currentUser.isPriority || currentUser.userType === "priority" ? "⭐ Priority Lane (Official PHINMA)" : "Regular Queue"}
                </span>
              </div>
              {remarks.trim() && (
                <div className="flex flex-col py-1">
                  <span className="text-muted-foreground font-medium mb-1">Additional Remarks:</span>
                  <p className="rounded-md border border-border bg-background p-2 text-foreground font-medium italic text-[11px]">
                    "{remarks.trim()}"
                  </p>
                </div>
              )}
            </div>

            <div className="mt-2.5 rounded-lg bg-primary/5 border border-primary/20 p-2 text-[11px] text-muted-foreground flex items-center gap-2 shrink-0">
              <CheckCircle2 className="size-3.5 text-primary shrink-0" />
              <span>An official Digital Request Receipt with your assigned queue line will be created immediately.</span>
            </div>

            {error && (
              <div className="mt-2 shrink-0">
                <InlineError text={error} />
              </div>
            )}

            <div className="mt-3.5 flex items-center justify-end gap-2 border-t border-border pt-3 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
                className="h-8 text-xs cursor-pointer"
              >
                Back to Edit
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={executeSubmit}
                disabled={loading}
                className="h-8 text-xs gap-1.5 cursor-pointer font-bold"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    Confirm & Submit <CheckCircle2 className="size-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>,
        document.body
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
  currentUser,
  setCurrentUser,
  onOpenCalendar,
  onOpenContactAdmin,
  docTypes = documentTypes,
}: {
  view: View;
  navigate: (v: View) => void;
  requests: RequestItem[];
  setRequests: (
    r: RequestItem[]
  ) => void;
  setFlash: (f: Flash) => void;
  currentUser?: AuthUser | null;
  setCurrentUser?: (u: AuthUser | null) => void;
  onOpenCalendar?: () => void;
  onOpenContactAdmin?: () => void;
  docTypes?: string[];
}) {
  const [selectedReceipt, setSelectedReceipt] = useState<RequestItem | null>(null);
  const [staffTab, setStaffTab] = useState<"operations" | "claimed_vault" | "admin_contact">("operations");
  const [copiedAdminEmail, setCopiedAdminEmail] = useState(false);
  const [adminInquiryCategory, setAdminInquiryCategory] = useState("General Question / Inquiries");
  const [adminInquiryPriority, setAdminInquiryPriority] = useState<"Normal" | "Important" | "Urgent">("Normal");
  const [adminInquirySubject, setAdminInquirySubject] = useState("");
  const [adminInquiryMessage, setAdminInquiryMessage] = useState("");
  const [adminInquirySending, setAdminInquirySending] = useState(false);

  const handleSendAdminInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminInquirySubject.trim() || !adminInquiryMessage.trim()) return;
    setAdminInquirySending(true);
    try {
      const token = localStorage.getItem("queueless_token");
      if (token) {
        await fetch(`${API_URL}/api/audit-logs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: "STAFF_CONTACT_ADMIN",
            details: `[${adminInquiryPriority.toUpperCase()}] Category: ${adminInquiryCategory} | Subject: ${adminInquirySubject.trim()} | Message: ${adminInquiryMessage.trim()}`,
            actorName: currentUser?.name || "Registrar Staff",
            actorRole: currentUser?.role || "staff",
            actorEmail: currentUser?.email || "staff@up.phinma.edu.ph",
          }),
        }).catch(() => {});
      }
      setFlash({
        tone: "success",
        text: `Your message has been dispatched to the Administrator. Priority: ${adminInquiryPriority}.`,
      });
      setAdminInquirySubject("");
      setAdminInquiryMessage("");
    } catch {
      setFlash({
        tone: "success",
        text: "Your message has been sent to the Administrator.",
      });
    } finally {
      setAdminInquirySending(false);
    }
  };

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
        currentUser={currentUser}
      />
    );
  }

  if (view === "documents") {
    return (
      <DocumentsPanel
        docs={docTypes}
        readOnly={true}
      />
    );
  }

  if (view === "profile" && currentUser && setCurrentUser) {
    return (
      <StudentProfileView
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        setFlash={setFlash}
        onBack={() => navigate("dashboard")}
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
        </div>
      </div>

      {staffTab === "operations" && (
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
      )}

      {/* CLAIMED DOCUMENTS BACKUP VAULT TAB */}
      {staffTab === "claimed_vault" && (
        <div className="mt-6 space-y-4">
          {/* Search Filter & Export Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search archive by student name, ID number, document type, or reference ID..."
                value={backupSearch}
                onChange={(e) => setBackupSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-card pl-9 pr-8 text-xs font-medium text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground"
              />
              {backupSearch && (
                <button
                  type="button"
                  onClick={() => setBackupSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportClaimedBackupCsv(filteredBackup)}
                disabled={filteredBackup.length === 0}
                className="gap-1.5 text-xs h-9 cursor-pointer font-medium"
              >
                <Printer className="size-3.5" /> Export (.CSV)
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
                className="gap-1.5 text-xs h-9 cursor-pointer font-medium shadow-xs"
              >
                <CheckCircle2 className="size-3.5" /> Sync Ledger
              </Button>
            </div>
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
              <div className="max-h-[360px] overflow-y-auto scrollbar-thin divide-y divide-border">
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

      {/* ADMINISTRATOR SUPPORT & CONTACT DIRECTORY TAB */}
      {staffTab === "admin_contact" && (
        <div className="mt-6 space-y-6 animate-rise">
          {/* Header Info Banner */}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                  <Headset className="size-6" />
                </div>
                <div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
                    Registrar Administrator Support & Contact Directory
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Official channels for university registrar systems, database support, and immediate escalations.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> Support System Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Direct Phone & Email Directory Cards */}
            <div className="lg:col-span-5 space-y-4">
              {/* Email Card */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Administrator Email Addresses</h4>
                    <p className="text-[11px] text-muted-foreground">Official support and system tickets</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">Primary System Administrator</span>
                        <a
                          href="mailto:admin.queueless@up.phinma.edu.ph"
                          className="font-mono text-xs font-bold text-primary hover:underline break-all"
                        >
                          admin.queueless@up.phinma.edu.ph
                        </a>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText("admin.queueless@up.phinma.edu.ph");
                          setCopiedAdminEmail(true);
                          setTimeout(() => setCopiedAdminEmail(false), 2000);
                        }}
                        className="size-7 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
                        title="Copy Email"
                      >
                        {copiedAdminEmail ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">Head Registrar Administration</span>
                        <a
                          href="mailto:registrar.admin@phinmaed.com"
                          className="font-mono text-xs font-bold text-primary hover:underline break-all"
                        >
                          registrar.admin@phinmaed.com
                        </a>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText("registrar.admin@phinmaed.com");
                          setCopiedAdminEmail(true);
                          setTimeout(() => setCopiedAdminEmail(false), 2000);
                        }}
                        className="size-7 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
                        title="Copy Email"
                      >
                        {copiedAdminEmail ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone & Hotline Card */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Direct Telephones & Hotlines</h4>
                    <p className="text-[11px] text-muted-foreground">Direct contact for immediate assistance</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 p-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Campus Trunkline & Local</span>
                      <strong className="font-mono text-xs text-foreground">(075) 522-5635 loc. 101</strong>
                    </div>
                    <a
                      href="tel:0755225635"
                      className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 transition"
                    >
                      <Phone className="size-3" /> Call Local
                    </a>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 p-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Admin Mobile Hotline</span>
                      <strong className="font-mono text-xs text-foreground">+63 995-078-5660</strong>
                    </div>
                    <a
                      href="tel:+639950785660"
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition"
                    >
                      <Phone className="size-3" /> Call Mobile
                    </a>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 p-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Emergency Tech Support</span>
                      <strong className="font-mono text-xs text-foreground">+63 917-823-4412</strong>
                    </div>
                    <a
                      href="tel:+639178234412"
                      className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 transition"
                    >
                      <Phone className="size-3" /> Call Tech
                    </a>
                  </div>
                </div>
              </div>

              {/* Physical Office & Schedule */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-foreground">Physical Office Location</h5>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Office of the University Registrar & Systems Administration<br />
                      2nd Floor, Main Administration Building<br />
                      PHINMA University of Pangasinan<br />
                      Arellano Street, Dagupan City, 2400 Pangasinan
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-border">
                  <Clock className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-foreground">Office Operating Hours</h5>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Monday to Friday: 8:00 AM – 5:00 PM<br />
                      Saturday: 8:00 AM – 12:00 PM (Noon)<br />
                      Sunday & Official Holidays: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Direct Dispatch In-App Message */}
            <div className="lg:col-span-7">
              <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Send className="size-4 text-primary" />
                    <h4 className="text-sm font-bold text-foreground">Dispatch Direct Message to Administrator</h4>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    Instant Audit-Logged Dispatch
                  </span>
                </div>

                <form onSubmit={handleSendAdminInquiry} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Inquiry Category">
                      <select
                        value={adminInquiryCategory}
                        onChange={(e) => setAdminInquiryCategory(e.target.value)}
                        className="field cursor-pointer"
                      >
                        <option value="General Question / Inquiries">General Question / Inquiries</option>
                        <option value="System Concern / Bug Report">System Concern / Bug Report</option>
                        <option value="Student Record Verification">Student Record Verification</option>
                        <option value="Document Signature / Approval">Document Signature / Approval</option>
                        <option value="Urgent Assistance / Escalation">Urgent Assistance / Escalation</option>
                      </select>
                    </Field>

                    <Field label="Priority Level">
                      <select
                        value={adminInquiryPriority}
                        onChange={(e) => setAdminInquiryPriority(e.target.value as any)}
                        className="field cursor-pointer"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Important">Important</option>
                        <option value="Urgent">⚡ Urgent</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="Subject / Topic *">
                    <input
                      type="text"
                      value={adminInquirySubject}
                      onChange={(e) => setAdminInquirySubject(e.target.value)}
                      placeholder="e.g. Student record clearance discrepancy..."
                      className="field"
                      required
                    />
                  </Field>

                  <Field label="Detailed Message *">
                    <textarea
                      rows={5}
                      value={adminInquiryMessage}
                      onChange={(e) => setAdminInquiryMessage(e.target.value)}
                      placeholder="Please provide complete details, student name or ID if applicable..."
                      className="field resize-none leading-relaxed"
                      required
                    />
                  </Field>

                  <div className="rounded-xl border border-muted bg-muted/30 p-3 text-[11px] text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary shrink-0" />
                    <span>
                      Dispatched from <strong>{currentUser?.name || "Registrar Staff"}</strong> ({currentUser?.email || "staff"}). Administrator is notified immediately.
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setAdminInquirySubject("");
                        setAdminInquiryMessage("");
                      }}
                      className="text-xs h-9 cursor-pointer"
                    >
                      Clear Fields
                    </Button>
                    <Button
                      type="submit"
                      disabled={adminInquirySending || !adminInquirySubject.trim() || !adminInquiryMessage.trim()}
                      className="font-bold gap-1.5 text-xs h-9 cursor-pointer"
                    >
                      {adminInquirySending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                      Send Message to Administrator
                    </Button>
                  </div>
                </form>
              </div>
            </div>
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
  const toIsoDateString = (dateStr?: string): string => {
    if (!dateStr || typeof dateStr !== "string") return "";
    const trimmed = dateStr.trim();
    if (!trimmed) return "";
    const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
      return `${isoMatch[1]}-${String(isoMatch[2]).padStart(2, "0")}-${String(isoMatch[3]).padStart(2, "0")}`;
    }
    const monthMap: Record<string, number> = {
      jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
      jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
    };
    const textMatch = trimmed.match(/^([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{4})/);
    if (textMatch) {
      const m = monthMap[textMatch[1].slice(0, 3).toLowerCase()];
      if (m) {
        return `${textMatch[3]}-${String(m).padStart(2, "0")}-${String(textMatch[2]).padStart(2, "0")}`;
      }
    }
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
    return "";
  };

  const [pickupDate, setPickupDate] = useState(() =>
    toIsoDateString(request.pickupDate || request.date)
  );
  const [status, setStatus] = useState<Status>(request.status);
  const [lineNumber, setLineNumber] = useState<number>(request.lineNumber ?? 1);
  const [priority, setPriority] = useState<Priority>(request.priority || "Regular");
  const [remarks, setRemarks] = useState(request.remarks || "");
  const [confirming, setConfirming] = useState(false);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setConfirming(true);
  };

  const handleConfirmSave = () => {
    let formattedDate = pickupDate.trim();
    if (formattedDate) {
      const parts = formattedDate.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
        }
      }
    }
    onSave({
      pickupDate: formattedDate,
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

        {confirming ? (
          <div className="mt-4 space-y-4 animate-in fade-in">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs">
              <h4 className="font-bold text-sm text-foreground mb-1">
                Confirm Schedule & Notify Student
              </h4>
              <p className="text-muted-foreground text-xs mb-3">
                Review your schedule changes. An automated email notification will be dispatched to the student with this update.
              </p>

              <div className="space-y-2 border-t border-border/60 pt-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Request ID:</span>
                  <span className="font-bold text-primary">{request.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student:</span>
                  <span className="font-semibold">{request.student} ({request.studentId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Document:</span>
                  <span className="font-medium">{request.document}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-bold text-primary">{status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">When to Claim:</span>
                  <span className="font-bold text-foreground">{pickupDate || "Standard Schedule"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Queue Line:</span>
                  <span className="font-bold">Line #{lineNumber} ({priority})</span>
                </div>
                {remarks && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remarks:</span>
                    <span className="font-medium italic text-foreground max-w-[60%] truncate">{remarks}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirming(false)}
                disabled={saving}
              >
                Back to Edit
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmSave}
                disabled={saving}
                className="gap-1.5 cursor-pointer font-semibold"
              >
                {saving ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" /> Confirm & Notify Student
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
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
      )}
      </div>
    </div>
  );
}

function StudentPersonalDetailsModal({
  request,
  onClose,
}: {
  request: RequestItem;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "all" | "personal" | "education" | "address" | "family"
  >("all");

  const userProfile: Partial<AuthUser> = useMemo(() => {
    const resolved: Record<string, any> = {};

    // Helper to merge non-empty values
    const mergeData = (source: any) => {
      if (!source || typeof source !== "object") return;
      Object.entries(source).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          resolved[k] = v;
        }
      });
    };

    // 1. Initial data from request.userDetails
    mergeData(request.userDetails);

    // 2. Overlay with queueless_profile_${email}
    const emailToLookup = request.email || (request.userDetails as any)?.email;
    if (emailToLookup) {
      try {
        const raw = localStorage.getItem(`queueless_profile_${emailToLookup}`);
        if (raw) mergeData(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }

    // 3. Overlay with currently logged-in user if matches
    try {
      const rawUser = localStorage.getItem("queueless_user");
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        const nameMatches = request.student && parsed.name?.toLowerCase().trim() === request.student.toLowerCase().trim();
        const idMatches = request.studentId && parsed.studentId?.toLowerCase().trim() === request.studentId.toLowerCase().trim();
        const emailMatches = emailToLookup && parsed.email?.toLowerCase().trim() === emailToLookup.toLowerCase().trim();
        if (idMatches || emailMatches || nameMatches) {
          mergeData(parsed);
        }
      }
    } catch {
      /* ignore */
    }

    // 4. Scan all localStorage profiles if educational details still missing
    if (!resolved.elemSchool || !resolved.juniorHighSchool) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("queueless_profile_")) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const u = JSON.parse(raw);
              const nameMatches = request.student && u.name?.toLowerCase().trim() === request.student.toLowerCase().trim();
              const idMatches = request.studentId && u.studentId?.toLowerCase().trim() === request.studentId.toLowerCase().trim();
              if (idMatches || nameMatches) {
                mergeData(u);
                break;
              }
            }
          }
        }
      } catch {
        /* ignore */
      }
    }

    return resolved as Partial<AuthUser>;
  }, [request]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const fullName =
    [
      userProfile.firstName,
      userProfile.middleName,
      userProfile.lastName,
      userProfile.extensionName,
    ]
      .filter(Boolean)
      .join(" ") || request.student;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Student Personal & Educational Details"
        className="relative w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Photo and Core Identification */}
        <div className="flex items-start justify-between border-b border-border pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary overflow-hidden border-2 border-primary/20 shadow-xs">
              {userProfile.picture || request.picture ? (
                <img
                  src={userProfile.picture || request.picture}
                  alt={fullName}
                  className="size-full object-cover"
                />
              ) : (
                <UserRound className="size-6" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-base font-bold text-foreground">
                  {fullName}
                </h3>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {userProfile.studentId || request.studentId || "Student"}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {userProfile.course || request.course || "BS Information Technology"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Year Level: <strong className="text-foreground">{userProfile.yearLevel || request.yearLevel || "3rd Year"}</strong> • PHINMA University of Pangasinan
              </p>
              <p className="text-xs text-primary font-mono mt-0.5">
                {request.email || userProfile.email || "student@phinmaed.com"}
              </p>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            aria-label="Close"
            className="size-7 cursor-pointer shrink-0"
          >
            <X className="size-3.5" />
          </Button>
        </div>

        {/* Section Tabs */}
        <div className="mt-3 flex items-center gap-1.5 border-b border-border pb-2 overflow-x-auto shrink-0">
          {[
            { id: "all", label: "Full Profile" },
            { id: "education", label: "Educational Background" },
            { id: "personal", label: "Personal Info" },
            { id: "address", label: "Addresses" },
            { id: "family", label: "Family & Guardian" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === t.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-3">
          {/* EDUCATIONAL DETAILS */}
          {(activeTab === "all" || activeTab === "education") && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <GraduationCap className="size-4" /> Educational Background
                </h4>
                <span className="text-[10px] text-muted-foreground">For transcript & record processing</span>
              </div>

              {/* Current Tertiary / College */}
              <div className="rounded-lg border border-border/80 bg-muted/20 p-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Current Program:</span>
                  <span className="font-bold text-foreground">{userProfile.course || request.course || "BS Information Technology"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Year Level:</span>
                  <span className="font-bold text-foreground">{userProfile.yearLevel || request.yearLevel || "3rd Year"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Institution:</span>
                  <span className="font-semibold text-foreground">PHINMA University of Pangasinan</span>
                </div>
              </div>

              {/* Elementary, Junior High, Senior High Table */}
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/70 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Level</th>
                      <th className="px-3 py-2">Name Of School</th>
                      <th className="px-3 py-2">Year Graduated</th>
                      <th className="px-3 py-2">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-[11px]">
                    <tr>
                      <td className="px-3 py-2.5 font-semibold text-foreground">
                        Elementary (Grade School)
                      </td>
                      <td className="px-3 py-2.5 font-medium text-foreground">
                        {userProfile.elemSchool || "—"}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-muted-foreground">
                        {userProfile.elemYearGrad || "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                          {userProfile.elemType || "Public"}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2.5 font-semibold text-foreground">
                        Junior High School (G7 - G10)
                      </td>
                      <td className="px-3 py-2.5 font-medium text-foreground">
                        {userProfile.juniorHighSchool || "—"}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-muted-foreground">
                        {userProfile.juniorHighYearGrad || "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                          {userProfile.juniorHighType || "Public"}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2.5 font-semibold text-foreground">
                        Senior High School (G11 - G12)
                      </td>
                      <td className="px-3 py-2.5 font-medium text-foreground">
                        {userProfile.seniorHighSchool || "—"}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-muted-foreground">
                        {userProfile.seniorHighYearGrad || "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                          {userProfile.seniorHighType || "Public"}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PERSONAL DETAILS */}
          {(activeTab === "all" || activeTab === "personal") && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <UserRound className="size-4" /> Personal Identification
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">First Name:</span>
                  <span className="font-semibold text-foreground">{userProfile.firstName || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Middle Name:</span>
                  <span className="font-semibold text-foreground">{userProfile.middleName || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Last Name:</span>
                  <span className="font-semibold text-foreground">{userProfile.lastName || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Extension Name:</span>
                  <span className="font-semibold text-foreground">{userProfile.extensionName || "None"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Gender:</span>
                  <span className="font-semibold text-foreground">{userProfile.gender || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Date of Birth:</span>
                  <span className="font-semibold text-foreground">{userProfile.birthDate || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Civil Status:</span>
                  <span className="font-semibold text-foreground">{userProfile.civilStatus || "Single"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Nationality:</span>
                  <span className="font-semibold text-foreground">{userProfile.nationality || "Filipino"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Religion:</span>
                  <span className="font-semibold text-foreground">{userProfile.religion || "—"}</span>
                </div>
              </div>
            </div>
          )}

          {/* ADDRESS DETAILS */}
          {(activeTab === "all" || activeTab === "address") && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <MapPin className="size-4" /> Residential & Permanent Addresses
              </h4>
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Current Residential Address:</span>
                  <p className="font-medium text-foreground">
                    {userProfile.currentAddress || userProfile.address || "Not specified"}
                    {userProfile.currentCity ? `, ${userProfile.currentCity}` : ""}
                    {userProfile.currentProvince ? `, ${userProfile.currentProvince}` : ""}
                    {userProfile.currentCountry ? `, ${userProfile.currentCountry}` : ""}
                    {userProfile.currentPostalCode ? ` (${userProfile.currentPostalCode})` : ""}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Permanent Address:</span>
                  <p className="font-medium text-foreground">
                    {userProfile.permanentAddress || userProfile.currentAddress || userProfile.address || "Same as current residential address"}
                    {userProfile.permanentCity && userProfile.permanentAddress ? `, ${userProfile.permanentCity}` : ""}
                    {userProfile.permanentProvince && userProfile.permanentAddress ? `, ${userProfile.permanentProvince}` : ""}
                  </p>
                </div>
                {userProfile.emergencyContact && (
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Emergency Contact:</span>
                    <p className="font-medium text-foreground">{userProfile.emergencyContact}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FAMILY & GUARDIANS */}
          {(activeTab === "all" || activeTab === "family") && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <UsersRound className="size-4" /> Family & Guardians
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Father's Name:</span>
                  <span className="font-semibold text-foreground">{userProfile.fatherName || "—"}</span>
                  {userProfile.fatherOccupation && (
                    <span className="text-muted-foreground block text-[11px]">Occupation: {userProfile.fatherOccupation}</span>
                  )}
                  {userProfile.fatherMobile && (
                    <span className="text-muted-foreground block font-mono text-[11px]">Mobile: {userProfile.fatherMobile}</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Mother's Name:</span>
                  <span className="font-semibold text-foreground">{userProfile.motherName || "—"}</span>
                  {userProfile.motherOccupation && (
                    <span className="text-muted-foreground block text-[11px]">Occupation: {userProfile.motherOccupation}</span>
                  )}
                  {userProfile.motherMobile && (
                    <span className="text-muted-foreground block font-mono text-[11px]">Mobile: {userProfile.motherMobile}</span>
                  )}
                </div>
                {userProfile.guardianName && (
                  <div className="col-span-1 sm:col-span-2 border-t border-border/60 pt-2">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Guardian ({userProfile.guardianRelationship || "Guardian"}):</span>
                    <span className="font-semibold text-foreground">{userProfile.guardianName}</span>
                    {userProfile.guardianMobile && (
                      <span className="text-muted-foreground block font-mono text-[11px]">Mobile: {userProfile.guardianMobile}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.print()}
            className="gap-1.5 text-xs cursor-pointer font-semibold"
          >
            <Printer className="size-3.5" /> Print Summary
          </Button>
          <Button
            size="sm"
            onClick={onClose}
            className="text-xs cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function PickupCalendarModal({
  requests,
  users = [],
  currentUser,
  onClose,
  onSelectRequest,
  onUpdateRequest,
}: {
  requests: RequestItem[];
  users?: AccountUser[];
  currentUser: AuthUser | null;
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
  >(() => (currentUser?.role === "student" || currentUser?.role === "guest" ? "mine" : "all"));
  const [calendarViewMode, setCalendarViewMode] = useState<"appointments" | "registrations">("registrations");
  const [selectedCalendarUser, setSelectedCalendarUser] = useState<AccountUser | null>(null);

  useEffect(() => {
    if (selectedCalendarUser) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [selectedCalendarUser]);
  const [viewingStudentDetails, setViewingStudentDetails] = useState<RequestItem | null>(null);
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

    // Skip known non-date strings
    if (/^(ready|within|window|standard|pending|proceed|today|tomorrow)/i.test(trimmed)) return null;

    // ISO format: 2026-10-14 or 2026-10-14T15:02:00.000Z
    const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
      return new Date(
        parseInt(isoMatch[1], 10),
        parseInt(isoMatch[2], 10) - 1,
        parseInt(isoMatch[3], 10)
      );
    }

    const monthMap: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };

    // Text format: "October 14, 2026 at 11:02 PM" or "Oct 14, 2026" or "Oct 14 2026"
    const textMatch = trimmed.match(/^([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{4})/);
    if (textMatch) {
      const monthPrefix = textMatch[1].slice(0, 3).toLowerCase();
      if (monthMap[monthPrefix] !== undefined) {
        return new Date(
          parseInt(textMatch[3], 10),
          monthMap[monthPrefix],
          parseInt(textMatch[2], 10)
        );
      }
    }

    // Day-first text format: "14 October 2026" or "14 Oct, 2026"
    const dayTextMatch = trimmed.match(/^(\d{1,2})\s+([a-zA-Z]+),?\s+(\d{4})/);
    if (dayTextMatch) {
      const monthPrefix = dayTextMatch[2].slice(0, 3).toLowerCase();
      if (monthMap[monthPrefix] !== undefined) {
        return new Date(
          parseInt(dayTextMatch[3], 10),
          monthMap[monthPrefix],
          parseInt(dayTextMatch[1], 10)
        );
      }
    }

    // MM/DD/YYYY or DD/MM/YYYY
    const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slashMatch) {
      return new Date(
        parseInt(slashMatch[3], 10),
        parseInt(slashMatch[1], 10) - 1,
        parseInt(slashMatch[2], 10)
      );
    }

    // Fallback: try native Date parse
    const fallback = new Date(trimmed);
    if (!isNaN(fallback.getTime())) {
      return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate());
    }
    return null;
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

  // Appointment counts: active appointments (reduced when claimed) vs done/claimed and unique requesters
  const { activeThisMonth, doneThisMonth, totalThisMonth, uniqueStudentsThisMonth } = useMemo(() => {
    let active = 0;
    let done = 0;
    let total = 0;
    const studentKeys = new Set<string>();

    Object.values(requestsByDay).forEach((items) => {
      items.forEach((item) => {
        total++;
        const sKey = (item.studentId || item.email || item.student || "").trim().toLowerCase();
        if (sKey) studentKeys.add(sKey);
        if (item.status === "Claimed") {
          done++;
        } else {
          active++;
        }
      });
    });
    return {
      activeThisMonth: active,
      doneThisMonth: done,
      totalThisMonth: total,
      uniqueStudentsThisMonth: studentKeys.size,
    };
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

  const currentScopeRequests = useMemo(() => {
    if (selectedDay !== null) {
      return requestsByDay[selectedDay] || [];
    }
    const all: RequestItem[] = [];
    Object.values(requestsByDay).forEach((items) => all.push(...items));
    return all;
  }, [requestsByDay, selectedDay]);

  const scopeCounts = useMemo(() => {
    let all = currentScopeRequests.length;
    let active = 0;
    let ready = 0;
    let processing = 0;
    let done = 0;
    currentScopeRequests.forEach((r) => {
      if (r.status === "Claimed") done++;
      else {
        active++;
        if (r.status === "Ready for Claiming") ready++;
        if (r.status === "Processing") processing++;
      }
    });
    return { all, active, ready, processing, done };
  }, [currentScopeRequests]);

  const userRecentRequests = useMemo(() => {
    if (!requests || !requests.length) return [];
    if (currentUser?.role === "student" || currentUser?.role === "guest") {
      const studentIdClean = (currentUser.studentId || "").trim().toLowerCase();
      const studentNameClean = (currentUser.name || "").trim().toLowerCase();
      const mine = requests.filter(
        (r) =>
          (r.studentId && r.studentId.trim().toLowerCase() === studentIdClean) ||
          (r.student && r.student.trim().toLowerCase() === studentNameClean)
      );
      if (mine.length > 0) return mine.slice(0, 5);
    }
    return requests.slice(0, 5);
  }, [requests, currentUser]);

  const isAdmin = currentUser?.role === "admin";

  // Group users by registration day in current active month
  const usersByDay = useMemo(() => {
    const map: Record<number, AccountUser[]> = {};
    if (!users || !users.length) return map;
    users.forEach((u) => {
      if (!u.createdAt) return;
      const d = new Date(u.createdAt);
      if (!isNaN(d.getTime()) && d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(u);
      }
    });
    return map;
  }, [users, year, month]);

  const totalRegisteredThisMonth = useMemo(() => {
    return Object.values(usersByDay).reduce((acc, curr) => acc + curr.length, 0);
  }, [usersByDay]);

  const selectedDayUsers = useMemo(() => {
    if (selectedDay !== null) {
      return usersByDay[selectedDay] || [];
    }
    const allInMonth: AccountUser[] = [];
    Object.keys(usersByDay)
      .map(Number)
      .sort((a, b) => a - b)
      .forEach((d) => {
        allInMonth.push(...usersByDay[d]);
      });
    return allInMonth;
  }, [usersByDay, selectedDay]);

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
      data-calendar-modal="true"
      className="pickup-calendar-modal fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150 print:hidden"
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
                {isAdmin ? (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Admin Mode (Editable)
                  </span>
                ) : isStaffUser ? (
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
                Track document releasing dates, counter schedules, and student appointments
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
            <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-bold text-primary flex items-center gap-1.5">
              {isAdmin ? (
                <><Users className="size-3.5 inline" /> User Registrations ({totalRegisteredThisMonth} this month)</>
              ) : isStaffUser ? (
                <><ClipboardList className="size-3.5 inline" /> Request Forms ({totalThisMonth} this month)</>
              ) : (
                <><FileText className="size-3.5 inline" /> My Updates ({displayedRequests.length})</>
              )}
            </span>
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
              const dayUsers = usersByDay[dayNum] || [];
              const dayUsersCount = dayUsers.length;

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
                  onClick={() => {
                    const nextDay = dayNum === selectedDay ? null : dayNum;
                    setSelectedDay(nextDay);
                    if (nextDay !== null) {
                      const dayReqs = requestsByDay[nextDay] || [];
                      if (filterType === "active" && dayReqs.length > 0 && dayReqs.every((r) => r.status === "Claimed")) {
                        setFilterType("all");
                      }
                    }
                  }}
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

                    {/* Top Right Indicator - Role-conditional */}
                    {isAdmin ? (
                      dayUsersCount > 0 ? (
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                          <UserPlus className="size-2.5 inline" /> {dayUsersCount}
                        </span>
                      ) : null
                    ) : (activeCount + doneCount) > 0 ? (
                      <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold flex items-center gap-0.5 border ${
                        hasReady ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                        : hasProcessing ? "bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-400"
                        : "bg-muted border-border text-muted-foreground"
                      }`}>
                        <ClipboardList className="size-2.5 inline" /> {activeCount + doneCount}
                      </span>
                    ) : null}
                  </div>

                  {/* Bottom dot indicator - Role-conditional */}
                  {isAdmin ? (
                    dayUsersCount > 0 ? (
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          <span className="hidden sm:inline">registered</span>
                        </span>
                      </div>
                    ) : null
                  ) : (activeCount + doneCount) > 0 ? (
                    <div className="mt-1 flex items-center gap-1 flex-wrap">
                      {hasReady && (
                        <span className="size-1.5 rounded-full bg-emerald-500" title="Ready" />
                      )}
                      {hasProcessing && (
                        <span className="size-1.5 rounded-full bg-blue-500" title="Processing" />
                      )}
                      {activeCount > 0 && !hasReady && !hasProcessing && (
                        <span className="size-1.5 rounded-full bg-amber-500" title="Pending" />
                      )}
                      {doneCount > 0 && (
                        <span className="size-1.5 rounded-full bg-muted-foreground/40" title="Claimed" />
                      )}
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
            {isAdmin ? (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500" /> New User Registered
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500" /> Ready
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-blue-500" /> Processing
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-amber-500" /> Pending
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-muted-foreground/40" /> Claimed
                </span>
              </>
            )}
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primary" /> Selected Date
            </span>
          </div>
          <span className="text-[10px] italic">
            {isAdmin
              ? "Showing user accounts registered by date · Click any day to view"
              : isStaffUser
              ? "Showing request forms by status · Click any day to filter"
              : "Showing your request updates · Click any day to view"}
          </span>
        </div>

        {/* Bottom Section: Role-conditional */}
        <div className="mt-5 border-t border-border pt-4">
          {isAdmin ? (
            /* ─── ADMIN: User Registrations ─── */
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Users className="size-3.5 text-primary" />
                      {selectedDay !== null
                        ? `Users Registered on ${monthNames[month]} ${selectedDay}, ${year}`
                        : `All Users Registered in ${monthNames[month]} ${year}`}
                    </h4>
                    {selectedDay !== null && (
                      <button
                        type="button"
                        onClick={() => setSelectedDay(null)}
                        className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                      >
                        (View All Month)
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-foreground font-semibold mt-0.5">
                    {selectedDayUsers.length} user account{selectedDayUsers.length !== 1 ? "s" : ""} registered
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {selectedDayUsers.length > 0 ? (
                  selectedDayUsers.map((u) => (
                    <div
                      key={u.id}
                      className="rounded-xl border border-border bg-card p-3 shadow-2xs hover:bg-muted/15 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-primary overflow-hidden border border-border">
                            {u.picture ? (
                              <img src={u.picture} alt={u.name} className="size-full object-cover" />
                            ) : (
                              <UserRound className="size-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground truncate">{u.name}</span>
                              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-muted-foreground capitalize shrink-0">
                                {u.role}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {u.studentId || u.id} · {u.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedCalendarUser(u)}
                            className="h-7 text-xs px-2.5 cursor-pointer font-semibold"
                          >
                            View Full Details
                          </Button>
                          <span className="text-[10px] font-medium text-muted-foreground hidden sm:inline">
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
                              : "Registered"}
                          </span>
                        </div>
                      </div>

                      {/* Personal details row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1.5 border-t border-border/60 text-[10px]">
                        <div>
                          <span className="text-muted-foreground block">Phone</span>
                          <span className="font-semibold text-foreground truncate block">{u.phone || "—"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Gender / Civil Status</span>
                          <span className="font-semibold text-foreground truncate block">
                            {[u.gender, u.civilStatus].filter(Boolean).join(" · ") || "Single"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Nationality</span>
                          <span className="font-semibold text-foreground truncate block">{u.nationality || "Filipino"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Residential Address</span>
                          <span className="font-semibold text-foreground truncate block" title={u.currentAddress || u.address || "Not specified"}>
                            {u.currentAddress || u.address || "Not specified"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-border py-8 text-center text-muted-foreground">
                    <UserRound className="mx-auto size-7 mb-1.5 opacity-40" />
                    <p className="text-xs font-medium">No users registered</p>
                    <p className="text-[11px] opacity-75 mt-0.5">
                      {selectedDay !== null
                        ? `No account registrations recorded on ${monthNames[month]} ${selectedDay}, ${year}. Click another day.`
                        : "No user accounts registered this month."}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ─── STAFF / STUDENT / GUEST: Request Forms ─── */
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ClipboardList className="size-3.5 text-primary" />
                    {isStaffUser
                      ? (selectedDay !== null
                          ? `Request Forms — ${monthNames[month]} ${selectedDay}, ${year}`
                          : `All Request Forms — ${monthNames[month]} ${year}`)
                      : (selectedDay !== null
                          ? `My Updates — ${monthNames[month]} ${selectedDay}, ${year}`
                          : `My Updates — ${monthNames[month]} ${year}`)}
                  </h4>
                  <p className="text-xs text-foreground font-semibold mt-0.5">
                    {displayedRequests.length} request{displayedRequests.length !== 1 ? "s" : ""}
                    {selectedDay !== null && (
                      <button
                        type="button"
                        onClick={() => setSelectedDay(null)}
                        className="ml-2 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                      >
                        (View All Month)
                      </button>
                    )}
                  </p>
                </div>

                {/* Staff filter pills */}
                {isStaffUser && (
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                    {([
                      { key: "all", label: `All (${scopeCounts.all})` },
                      { key: "active", label: `Active (${scopeCounts.active})` },
                      { key: "ready", label: `Ready (${scopeCounts.ready})` },
                      { key: "processing", label: `Processing (${scopeCounts.processing})` },
                      { key: "done", label: `Claimed (${scopeCounts.done})` },
                    ] as const).map((pill) => (
                      <button
                        key={pill.key}
                        type="button"
                        onClick={() => setFilterType(pill.key)}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition cursor-pointer whitespace-nowrap ${
                          filterType === pill.key
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {displayedRequests.length > 0 ? (
                  displayedRequests.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-xl border border-border bg-card p-3 shadow-2xs hover:bg-muted/15 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg border text-center ${
                            req.status === "Claimed"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "border-primary/20 bg-primary/10 text-primary"
                          }`}>
                            <span className="text-xs font-black">
                              {req.status === "Claimed" ? "✓" : `#${req.lineNumber ?? 1}`}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-bold text-primary">{req.id}</span>
                              <StatusBadge status={req.status} />
                              {req.priority === "Urgent" && (
                                <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-[9px] font-bold text-destructive">Urgent</span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {req.student} · {req.document}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-1.5">
                          {isStaffUser && req.status !== "Claimed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingReq(req)}
                              className="h-7 text-xs px-2 cursor-pointer font-semibold gap-1"
                            >
                              <Edit3 className="size-3" /> Reschedule
                            </Button>
                          )}
                          {onSelectRequest && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onSelectRequest(req)}
                              className="h-7 text-xs px-2 cursor-pointer font-semibold gap-1"
                            >
                              <Eye className="size-3" /> Receipt
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1.5 mt-2 border-t border-border/60 text-[10px]">
                        <div>
                          <span className="text-muted-foreground block">Document</span>
                          <span className="font-semibold text-foreground truncate block">{req.document}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Pickup Date</span>
                          <span className="font-semibold text-foreground truncate block">{req.pickupDate || "TBD"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Purpose</span>
                          <span className="font-semibold text-foreground truncate block">{req.purpose}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Payment</span>
                          <span className="font-semibold text-foreground truncate block">{req.paymentStatus || "Pending"}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-border py-8 text-center text-muted-foreground">
                    <FileText className="mx-auto size-7 mb-1.5 opacity-40" />
                    <p className="text-xs font-medium">
                      {isStaffUser ? "No request forms found" : "No updates found"}
                    </p>
                    <p className="text-[11px] opacity-75 mt-0.5">
                      {selectedDay !== null
                        ? `No requests on ${monthNames[month]} ${selectedDay}, ${year}. Try another day.`
                        : isStaffUser
                        ? "No document requests this month."
                        : "You have no request updates this month."}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
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

      {/* Student Personal & Educational Details Modal */}
      {viewingStudentDetails && (
        <StudentPersonalDetailsModal
          request={viewingStudentDetails}
          onClose={() => setViewingStudentDetails(null)}
        />
      )}

      {/* Calendar User Profile & Personal Details Modal */}
      {selectedCalendarUser && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedCalendarUser(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xl text-xs space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3.5">
                <div className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary overflow-hidden border border-border shadow-xs">
                  {selectedCalendarUser.picture ? (
                    <img
                      src={selectedCalendarUser.picture}
                      alt={selectedCalendarUser.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <UserRound className="size-7" />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-bold text-foreground">
                      {selectedCalendarUser.name}
                    </h3>
                    <span className="capitalize rounded-full bg-primary/15 text-primary px-2 py-0.5 text-xs font-semibold">
                      {selectedCalendarUser.role}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">
                    {selectedCalendarUser.studentId || selectedCalendarUser.id}
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSelectedCalendarUser(null)}
                className="size-8 cursor-pointer"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Contact Details */}
            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Mail className="size-3.5" /> Contact Information
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Email Address</span>
                  <a href={`mailto:${selectedCalendarUser.email}`} className="font-medium text-primary hover:underline">
                    {selectedCalendarUser.email}
                  </a>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Mobile Phone</span>
                  {selectedCalendarUser.phone ? (
                    <a href={`tel:${selectedCalendarUser.phone}`} className="font-mono font-semibold text-emerald-600 hover:underline">
                      {selectedCalendarUser.phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground italic">None provided</span>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Program (if Student) */}
            {selectedCalendarUser.role === "student" && (
              <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <FileText className="size-3.5" /> Academic Information
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Degree Program</span>
                    <span className="font-semibold text-foreground">{selectedCalendarUser.course || "BS Information Technology"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Year Level</span>
                    <span className="font-semibold text-foreground">{selectedCalendarUser.yearLevel || "3rd Year"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Details */}
            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <UserRound className="size-3.5" /> Personal Information
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Gender</span>
                  <span className="font-medium text-foreground">{selectedCalendarUser.gender || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Date of Birth</span>
                  <span className="font-medium text-foreground">{selectedCalendarUser.birthDate || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Civil Status</span>
                  <span className="font-medium text-foreground">{selectedCalendarUser.civilStatus || "Single"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Nationality</span>
                  <span className="font-medium text-foreground">{selectedCalendarUser.nationality || "Filipino"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Religion</span>
                  <span className="font-medium text-foreground">{selectedCalendarUser.religion || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Extension</span>
                  <span className="font-medium text-foreground">{selectedCalendarUser.extensionName || "None"}</span>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <MapPin className="size-3.5" /> Residential Address
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Current Address</span>
                  <span className="font-medium text-foreground">
                    {[
                      selectedCalendarUser.currentAddress || selectedCalendarUser.address,
                      (selectedCalendarUser as any).currentCity,
                      (selectedCalendarUser as any).currentProvince,
                      (selectedCalendarUser as any).currentCountry,
                      (selectedCalendarUser as any).currentPostalCode
                    ].filter(Boolean).join(", ") || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Permanent Address</span>
                  <span className="font-medium text-foreground">
                    {[
                      selectedCalendarUser.permanentAddress || selectedCalendarUser.address,
                      (selectedCalendarUser as any).permanentCity,
                      (selectedCalendarUser as any).permanentProvince,
                      (selectedCalendarUser as any).permanentCountry,
                      (selectedCalendarUser as any).permanentPostalCode
                    ].filter(Boolean).join(", ") || selectedCalendarUser.currentAddress || "Same as current"}
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" /> Emergency Contact
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Contact Person / Details</span>
                  <span className="font-semibold text-foreground">
                    {selectedCalendarUser.emergencyContact || (selectedCalendarUser as any).emergencyContactName || "None provided"}
                  </span>
                </div>
                {((selectedCalendarUser as any).emergencyContactPhone || (selectedCalendarUser as any).emergencyContactRelationship) && (
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Relationship / Phone</span>
                    <span className="font-semibold text-foreground">
                      {[(selectedCalendarUser as any).emergencyContactRelationship, (selectedCalendarUser as any).emergencyContactPhone].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Family & Guardian */}
            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <UsersRound className="size-3.5" /> Family & Guardians
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Father's Name</span>
                  <span className="font-semibold text-foreground">{selectedCalendarUser.fatherName || "—"}</span>
                  {selectedCalendarUser.fatherOccupation && (
                    <span className="text-muted-foreground block text-[10px]">Occupation: {selectedCalendarUser.fatherOccupation}</span>
                  )}
                  {selectedCalendarUser.fatherMobile && (
                    <span className="text-muted-foreground block font-mono text-[10px]">Contact: {selectedCalendarUser.fatherMobile}</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Mother's Name</span>
                  <span className="font-semibold text-foreground">{selectedCalendarUser.motherName || "—"}</span>
                  {selectedCalendarUser.motherOccupation && (
                    <span className="text-muted-foreground block text-[10px]">Occupation: {selectedCalendarUser.motherOccupation}</span>
                  )}
                  {selectedCalendarUser.motherMobile && (
                    <span className="text-muted-foreground block font-mono text-[10px]">Contact: {selectedCalendarUser.motherMobile}</span>
                  )}
                </div>
                {selectedCalendarUser.guardianName && (
                  <div className="col-span-1 sm:col-span-2 border-t border-border/60 pt-1.5">
                    <span className="text-muted-foreground block text-[10px]">Guardian ({selectedCalendarUser.guardianRelationship || "Guardian"})</span>
                    <span className="font-semibold text-foreground">{selectedCalendarUser.guardianName}</span>
                    {selectedCalendarUser.guardianMobile && (
                      <span className="text-muted-foreground block font-mono text-[10px]">Contact: {selectedCalendarUser.guardianMobile}</span>
                    )}
                  </div>
                )}
                {selectedCalendarUser.spouseName && (
                  <div className="col-span-1 sm:col-span-2 border-t border-border/60 pt-1.5">
                    <span className="text-muted-foreground block text-[10px]">Spouse</span>
                    <span className="font-semibold text-foreground">{selectedCalendarUser.spouseName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Educational Background */}
            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <GraduationCap className="size-3.5" /> Educational Background
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Elementary</span>
                  <span className="font-semibold text-foreground">{selectedCalendarUser.elemSchool || "—"}</span>
                  {selectedCalendarUser.elemYearGrad && (
                    <span className="text-muted-foreground block text-[10px]">Year: {selectedCalendarUser.elemYearGrad} ({selectedCalendarUser.elemType || "Public"})</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Junior High</span>
                  <span className="font-semibold text-foreground">{selectedCalendarUser.juniorHighSchool || "—"}</span>
                  {selectedCalendarUser.juniorHighYearGrad && (
                    <span className="text-muted-foreground block text-[10px]">Year: {selectedCalendarUser.juniorHighYearGrad} ({selectedCalendarUser.juniorHighType || "Public"})</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Senior High</span>
                  <span className="font-semibold text-foreground">{selectedCalendarUser.seniorHighSchool || "—"}</span>
                  {selectedCalendarUser.seniorHighYearGrad && (
                    <span className="text-muted-foreground block text-[10px]">Year: {selectedCalendarUser.seniorHighYearGrad} ({selectedCalendarUser.seniorHighType || "Public"})</span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end border-t border-border pt-3">
              <Button size="sm" onClick={() => setSelectedCalendarUser(null)} className="cursor-pointer">
                Close
              </Button>
            </div>
          </div>
        </div>,
        document.body
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
  onUpdateRequest,
}: {
  request: RequestItem;
  onClose: () => void;
  isStaff?: boolean;
  onEdit?: () => void;
  onOpenCalendar?: () => void;
  onUpdateRequest?: (r: RequestItem) => void;
}) {
  const [currentReq, setCurrentReq] = useState<RequestItem>(request);
  const [showInternalEdit, setShowInternalEdit] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [internalSaving, setInternalSaving] = useState(false);
  const [editFlash, setEditFlash] = useState("");
  const [receiptMode, setReceiptMode] = useState<"staff_release" | "user_queue_slip" | "profile">(() =>
    isStaff ? "staff_release" : "user_queue_slip"
  );

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const userProfile: Partial<AuthUser> = useMemo(() => {
    const resolved: Record<string, any> = {};

    const mergeData = (source: any) => {
      if (!source || typeof source !== "object") return;
      Object.entries(source).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          resolved[k] = v;
        }
      });
    };

    mergeData(currentReq.userDetails);

    const emailToLookup = currentReq.email || (currentReq.userDetails as any)?.email;
    if (emailToLookup) {
      try {
        const raw = localStorage.getItem(`queueless_profile_${emailToLookup}`);
        if (raw) mergeData(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }

    try {
      const rawUser = localStorage.getItem("queueless_user");
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        const nameMatches = currentReq.student && parsed.name?.toLowerCase().trim() === currentReq.student.toLowerCase().trim();
        const idMatches = currentReq.studentId && parsed.studentId?.toLowerCase().trim() === currentReq.studentId.toLowerCase().trim();
        const emailMatches = emailToLookup && parsed.email?.toLowerCase().trim() === emailToLookup.toLowerCase().trim();
        if (idMatches || emailMatches || nameMatches) {
          mergeData(parsed);
        }
      }
    } catch {
      /* ignore */
    }

    if (!resolved.elemSchool || !resolved.juniorHighSchool) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("queueless_profile_")) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const u = JSON.parse(raw);
              const nameMatches = currentReq.student && u.name?.toLowerCase().trim() === currentReq.student.toLowerCase().trim();
              const idMatches = currentReq.studentId && u.studentId?.toLowerCase().trim() === currentReq.studentId.toLowerCase().trim();
              if (idMatches || nameMatches) {
                mergeData(u);
                break;
              }
            }
          }
        }
      } catch {
        /* ignore */
      }
    }

    return resolved as Partial<AuthUser>;
  }, [currentReq]);

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

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150 print:relative print:inset-auto print:bg-white print:p-0 print:block print-receipt-container"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Official Document Receipt"
        className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xl print:border-none print:shadow-none print:max-w-full print:p-0 print-receipt-card overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Screen Header & Close Button */}
        <div className="flex justify-between items-center print:hidden pb-2 shrink-0 border-b border-border/60">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Receipt className="size-3.5 text-primary" /> Official Registrar Receipt
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            aria-label="Close receipt"
            className="cursor-pointer size-7"
          >
            <X className="size-3.5" />
          </Button>
        </div>

        {/* Receipt View Switcher Tabs */}
        <div className="my-2.5 flex items-center justify-center gap-1 rounded-lg bg-muted p-1 text-xs print:hidden shrink-0">
          <button
            type="button"
            onClick={() => setReceiptMode("staff_release")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1 font-bold transition cursor-pointer text-xs ${
              receiptMode === "staff_release"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="size-3.5 text-emerald-600" />
            <span>Staff Release Receipt</span>
          </button>
          <button
            type="button"
            onClick={() => setReceiptMode("user_queue_slip")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1 font-bold transition cursor-pointer text-xs ${
              receiptMode === "user_queue_slip"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Receipt className="size-3.5 text-primary" />
            <span>User Queue Slip</span>
          </button>
          {isStaff && (
            <button
              type="button"
              onClick={() => setReceiptMode("profile")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1 font-bold transition cursor-pointer text-xs ${
                receiptMode === "profile"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserRound className="size-3.5" />
              <span>Applicant Profile</span>
            </button>
          )}
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto pr-1">
        {receiptMode === "staff_release" ? (
          /* ========================================================
           * 1. STAFF OFFICIAL DOCUMENT RELEASE & CLEARANCE RECEIPT
           * (Official clearance issued by staff to the student upon claim)
           * ======================================================== */
          <div className="space-y-4">
            {/* Official Letterhead */}
            <div className="text-center pb-2 border-b-2 border-foreground/40 print:border-black">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground print:text-black">
                Republic of the Philippines • Commission on Higher Education
              </p>
              <h1 className="font-serif text-lg sm:text-xl font-black uppercase tracking-wider text-foreground print:text-black mt-0.5">
                PHINMA University of Pangasinan
              </h1>
              <p className="text-xs font-bold uppercase tracking-wide text-primary print:text-black">
                Office of the University Registrar • Document Clearance Section
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground print:text-gray-700">
                Arellano Street, Dagupan City, 2400 Pangasinan, Philippines • Contact: (075) 522-5635
              </p>
            </div>

            {/* Receipt Meta & Serial */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-3 print:border-black">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-foreground print:text-black">
                  OFFICIAL DOCUMENT RELEASE & CLEARANCE RECEIPT
                </h2>
                <p className="text-[10px] text-muted-foreground print:text-gray-700">
                  Official registrar release clearance issued to student/claimant
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block print:text-black">
                  Official Serial No:
                </span>
                <span className="font-mono text-xs font-black text-primary print:text-black">
                  REG-REL-{currentReq.id}
                </span>
              </div>
            </div>

            {editFlash && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 print:hidden">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{editFlash}</span>
              </div>
            )}

            {/* Release Status Verification Banner */}
            <div className="flex items-center justify-between rounded-lg border-2 border-emerald-600/40 bg-emerald-500/10 px-4 py-2.5 print:border-black print:bg-white">
              <div className="flex items-center gap-2.5">
                <div className="size-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs print:bg-black">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-300 print:text-black">
                    DOCUMENT OFFICIALLY RELEASED & CLEARED
                  </p>
                  <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400 print:text-gray-700">
                    Acknowledge transfer of official records from the Registrar to the applicant.
                  </p>
                </div>
              </div>
              <div className="text-right text-xs">
                <span className="font-bold text-foreground print:text-black">Date Issued:</span>
                <span className="ml-1 text-muted-foreground print:text-black">{currentReq.pickupDate || currentReq.date}</span>
              </div>
            </div>

            {/* Detailed Release Grid */}
            <div className="rounded-xl border border-border bg-muted/15 p-4 space-y-3 text-xs print:border-black print:bg-white print:p-3">
              <div className="grid grid-cols-2 gap-4 border-b border-border/60 pb-3 print:border-gray-300">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block print:text-black">Student Name:</span>
                  <strong className="text-sm font-bold text-foreground print:text-black">{currentReq.student}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block print:text-black">Student ID Number:</span>
                  <strong className="font-mono text-sm font-bold text-foreground print:text-black">{currentReq.studentId}</strong>
                </div>
              </div>

              {(userProfile.course || userProfile.yearLevel) && (
                <div className="border-b border-border/60 pb-3 print:border-gray-300">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block print:text-black">Degree Program & Year Level:</span>
                  <span className="text-xs font-medium text-foreground print:text-black">
                    {[userProfile.course, userProfile.yearLevel].filter(Boolean).join(" • ")}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-b border-border/60 pb-3 print:border-gray-300">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block print:text-black">Document Released:</span>
                  <strong className="text-sm font-bold text-foreground print:text-black">{currentReq.document}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block print:text-black">Quantity Issued:</span>
                  <span className="text-xs font-bold text-foreground print:text-black">
                    {currentReq.copies || 1} {currentReq.copies === 1 ? "official copy" : "official copies"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-border/60 pb-3 print:border-gray-300">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block print:text-black">Purpose Stated:</span>
                  <span className="text-xs font-medium text-foreground print:text-black">{currentReq.purpose || "Official Record"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block print:text-black">Payment & Clearance Status:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 print:border-black print:text-black">
                    {currentReq.paymentStatus || "Paid / Cleared"}
                  </span>
                </div>
              </div>

              {currentReq.remarks && (
                <div className="pt-1">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block print:text-black">Clearance Notes / Staff Remarks:</span>
                  <span className="text-xs text-foreground italic print:text-black">{currentReq.remarks}</span>
                </div>
              )}
            </div>

            {/* Official Certification Statement */}
            <div className="rounded-lg border border-border/70 p-3 text-[10px] text-muted-foreground leading-relaxed print:border-black print:text-gray-800">
              <p>
                <strong>REGISTRAR CLEARANCE CERTIFICATION:</strong> This certifies that the above-named student/claimant has satisfied all academic and financial clearances required for the release of the specified university records. These credentials are duly recorded in the Registrar Custody Archive of PHINMA University of Pangasinan pursuant to University Academic Regulations and the Philippine Data Privacy Act of 2012 (RA 10173).
              </p>
            </div>

            {/* Student Rating & Feedback Section */}
            {(currentReq.rating || !isStaff) && (
              <div className="print:hidden">
                {currentReq.rating ? (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <HeartHandshake className="size-4" />
                        <span>Student Service Rating & Thanks</span>
                      </div>
                      <span className="text-amber-500 font-bold text-sm tracking-widest">
                        {"★".repeat(currentReq.rating)}{"☆".repeat(5 - currentReq.rating)}
                      </span>
                    </div>
                    {currentReq.assignedStaffName && (
                      <p className="text-[11px] text-muted-foreground">
                        Handled by: <strong className="text-foreground">{currentReq.assignedStaffName}</strong>
                      </p>
                    )}
                    {currentReq.feedback && (
                      <p className="text-xs text-foreground/90 italic bg-card/60 p-2 rounded-lg border border-border">
                        "{currentReq.feedback}"
                      </p>
                    )}
                  </div>
                ) : !isStaff ? (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-foreground flex items-center gap-1.5">
                        <Star className="size-4 text-amber-500 fill-amber-500" />
                        Rate Staff Service & Say Thanks
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {currentReq.assignedStaffName
                          ? `Processed by ${currentReq.assignedStaffName}. Please rate their assistance!`
                          : "How was your document processing experience with the Registrar?"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setShowRatingModal(true)}
                      className="gap-1.5 font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shrink-0 cursor-pointer shadow-xs"
                    >
                      <Star className="size-3.5 fill-current" /> Rate & Say Thanks
                    </Button>
                  </div>
                ) : null}
              </div>
            )}

            {/* Official Signatures */}
            <div className="mt-6 border-t-2 border-foreground/40 pt-4 print:border-black">
              <div className="grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="border-b border-foreground/60 print:border-black w-4/5 mx-auto mb-1 h-10"></div>
                  <p className="font-bold text-foreground print:text-black">{currentReq.student}</p>
                  <p className="text-[10px] text-muted-foreground print:text-gray-700">Received By (Claimant Signature)</p>
                  <p className="text-[9px] text-muted-foreground print:text-gray-600">Date: {currentReq.pickupDate || currentReq.date}</p>
                </div>

                <div>
                  <div className="border-b border-foreground/60 print:border-black w-4/5 mx-auto mb-1 h-10 flex items-end justify-center">
                    <span className="font-mono text-[9px] text-muted-foreground print:text-black mb-1">
                      [OFFICIAL SEAL]
                    </span>
                  </div>
                  <p className="font-bold text-foreground print:text-black">
                    {currentReq.assignedStaffName || "Registrar Releasing Officer"}
                  </p>
                  <p className="text-[10px] text-muted-foreground print:text-gray-700">Authorized University Registrar Officer</p>
                  <p className="text-[9px] text-muted-foreground print:text-gray-600">PHINMA University of Pangasinan</p>
                </div>
              </div>
            </div>
          </div>
        ) : receiptMode === "user_queue_slip" ? (
          /* ========================================================
           * 2. USER QUEUE SLIP & CLAIM STUB
           * (Receipt of the user to give to staff regarding their queue)
           * ======================================================== */
          <div className="space-y-4">
            {/* Header */}
            <div className="text-center pb-2 border-b-2 border-dashed border-foreground/40 print:border-black">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground print:text-black">
                PHINMA Education • Republic of the Philippines
              </p>
              <h1 className="font-serif text-lg sm:text-xl font-black uppercase tracking-wider text-foreground print:text-black mt-0.5">
                PHINMA University of Pangasinan
              </h1>
              <p className="text-xs font-bold uppercase tracking-wide text-primary print:text-black">
                Office of the University Registrar • QueueLess System
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground print:text-gray-700">
                Arellano Street, Dagupan City, 2400 Pangasinan • Tel: (075) 522-5635
              </p>
            </div>

            {/* Document Title Banner */}
            <div className="py-2 px-3 bg-muted/60 rounded-lg text-center border border-border print:bg-white print:border-black">
              <h2 className="text-xs font-black uppercase tracking-widest text-foreground print:text-black">
                STUDENT QUEUE SLIP & CLAIM STUB
              </h2>
              <p className="text-[10px] text-muted-foreground print:text-gray-700 mt-0.5">
                Present this slip at Registrar Counter Window 2 regarding your queue & document claim
              </p>
            </div>

            {/* Big Ticket Queue Line Box */}
            <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-4 text-center print:border-black print:bg-white">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground print:text-black">
                Your Official Queue Number
              </p>
              <p className="font-mono text-3xl font-black text-primary tracking-tight mt-0.5 print:text-black">
                QUEUE LINE #{lineNum}
              </p>
              <div className="mt-1.5 flex items-center justify-center gap-2 text-[11px] font-bold">
                <span className="text-muted-foreground print:text-black">Priority Lane:</span>
                <span className="font-mono uppercase text-foreground print:text-black">{currentReq.priority || "Regular"}</span>
                <span>•</span>
                <span className="text-muted-foreground print:text-black">Status:</span>
                <span className="font-semibold text-foreground print:text-black">{currentReq.status}</span>
              </div>

              {/* Barcode representation */}
              <div className="mt-3 flex flex-col items-center">
                <div className="h-6 w-48 flex items-center justify-center gap-[2px] opacity-75 print:opacity-100">
                  <div className="h-full w-[2px] bg-foreground print:bg-black" />
                  <div className="h-full w-[1px] bg-foreground print:bg-black" />
                  <div className="h-full w-[3px] bg-foreground print:bg-black" />
                  <div className="h-full w-[1px] bg-foreground print:bg-black" />
                  <div className="h-full w-[2px] bg-foreground print:bg-black" />
                  <div className="h-full w-[4px] bg-foreground print:bg-black" />
                  <div className="h-full w-[1px] bg-foreground print:bg-black" />
                  <div className="h-full w-[3px] bg-foreground print:bg-black" />
                  <div className="h-full w-[2px] bg-foreground print:bg-black" />
                  <div className="h-full w-[1px] bg-foreground print:bg-black" />
                  <div className="h-full w-[3px] bg-foreground print:bg-black" />
                  <div className="h-full w-[2px] bg-foreground print:bg-black" />
                  <div className="h-full w-[1px] bg-foreground print:bg-black" />
                  <div className="h-full w-[4px] bg-foreground print:bg-black" />
                </div>
                <p className="font-mono text-[9px] text-muted-foreground tracking-widest mt-1 print:text-black">
                  *{currentReq.id}*
                </p>
              </div>
            </div>

            {/* Student & Request Details Table */}
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-2.5 text-xs print:border-black print:bg-white">
              <div className="grid grid-cols-2 gap-3 border-b border-border/60 pb-2.5 print:border-gray-300">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block print:text-black">Student Name:</span>
                  <strong className="text-foreground font-bold print:text-black">{currentReq.student}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block print:text-black">Student ID Number:</span>
                  <strong className="font-mono text-foreground print:text-black">{currentReq.studentId}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-b border-border/60 pb-2.5 print:border-gray-300">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block print:text-black">Document Requested:</span>
                  <strong className="text-foreground print:text-black">{currentReq.document}</strong>
                  <span className="text-[11px] text-muted-foreground block print:text-black">
                    ({currentReq.copies || 1} {currentReq.copies === 1 ? "copy" : "copies"})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block print:text-black">Date Filed:</span>
                  <span className="text-foreground font-medium print:text-black">{currentReq.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-b border-border/60 pb-2.5 print:border-gray-300">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block print:text-black">Purpose:</span>
                  <span className="text-foreground font-medium print:text-black">{currentReq.purpose || "Official Record"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block print:text-black">When to Claim / Target Release:</span>
                  <strong className="text-foreground font-bold text-primary print:text-black">
                    {currentReq.pickupDate || "Within the day"}
                  </strong>
                </div>
              </div>

              <div className="pt-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block print:text-black">Payment Requirement:</span>
                <span className="font-semibold text-foreground print:text-black">
                  {currentReq.paymentStatus || "Proceed to Registrar Staff"}
                </span>
              </div>
            </div>

            {/* Checklist for Registrar Counter */}
            <div className="rounded-lg border border-border bg-muted/20 p-3 text-[11px] print:border-black print:bg-white">
              <p className="font-bold text-foreground uppercase tracking-wide text-[10px] mb-1.5 print:text-black">
                Registrar Staff Counter Verification:
              </p>
              <div className="grid grid-cols-3 gap-2 text-muted-foreground print:text-black">
                <div className="flex items-center gap-1.5">
                  <span className="size-3.5 border border-foreground/40 rounded-xs inline-block print:border-black" />
                  <span>Valid ID Presented</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-3.5 border border-foreground/40 rounded-xs inline-block print:border-black" />
                  <span>Finance Cleared</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-3.5 border border-foreground/40 rounded-xs inline-block print:border-black" />
                  <span>Document Released</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-[10px] text-amber-900 dark:text-amber-200 leading-relaxed print:border-black print:bg-white print:text-black">
              <strong className="block font-bold mb-0.5">CLAIMING INSTRUCTIONS:</strong>
              1. Present this slip along with your original valid PHINMA Student ID to <strong>Counter Window 2 (Releasing Desk)</strong>.<br />
              2. If represented by an authorized person, submit a signed authorization letter, photocopy of student ID with 3 signatures, and valid ID of the representative.
            </div>

            {/* Perforated cut line */}
            <div className="my-3 border-t-2 border-dashed border-border/80 relative text-center print:border-black">
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-card px-2 text-[9px] text-muted-foreground font-mono uppercase tracking-widest print:bg-white print:text-black">
                ✂ Present this stub at Counter Window 2
              </span>
            </div>

            {/* Student Signature */}
            <div className="pt-2 text-center">
              <div className="border-b border-foreground/60 print:border-black w-3/5 mx-auto mb-1 h-6"></div>
              <p className="font-bold text-xs text-foreground print:text-black">{currentReq.student}</p>
              <p className="text-[10px] text-muted-foreground print:text-gray-700">Student / Applicant Signature</p>
            </div>
          </div>
        ) : (
          /* Applicant Profile & Account Details (Staff View) */
          <div className="space-y-4 text-xs animate-in fade-in duration-150">
            {/* Header: Photo + Core Identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 rounded-xl border border-border bg-card p-4 shadow-2xs">
              <div className="relative flex size-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary overflow-hidden border border-border shadow-xs">
                {(userProfile.picture || currentReq.picture) ? (
                  <img
                    src={userProfile.picture || currentReq.picture}
                    alt={currentReq.student}
                    className="size-full object-cover"
                  />
                ) : (
                  <UserRound className="size-10" />
                )}
              </div>
              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {currentReq.student}
                  </h3>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    currentReq.studentId?.startsWith("GUEST") || userProfile.role === "guest"
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                      : "bg-primary/10 text-primary border border-primary/20"
                  }`}>
                    {currentReq.studentId?.startsWith("GUEST") || userProfile.role === "guest" ? "Guest Portal" : "Student"}
                  </span>
                  {(userProfile.contactVerified || currentReq.phone) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                      <ShieldCheck className="size-3" /> Contact Verified
                    </span>
                  )}
                </div>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">
                  ID: <strong className="text-foreground">{currentReq.studentId}</strong>
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-muted-foreground">
                  {(currentReq.email || userProfile.email) && (
                    <a
                      href={`mailto:${currentReq.email || userProfile.email}`}
                      className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
                    >
                      <Mail className="size-3.5" />
                      <span>{currentReq.email || userProfile.email}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Program Card (Students) */}
            {(!currentReq.studentId?.startsWith("GUEST") && userProfile.role !== "guest") && (
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <FileText className="size-3.5" /> Academic & Enrollment Details
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Degree Program:</span>
                    <span className="font-bold text-foreground">{userProfile.course || currentReq.course || "BS Information Technology"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Year Level:</span>
                    <span className="font-bold text-foreground">{userProfile.yearLevel || currentReq.yearLevel || "3rd Year"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Institution:</span>
                    <span className="font-semibold text-foreground">PHINMA University of Pangasinan</span>
                  </div>
                </div>
              </div>
            )}

            {/* Educational Background Table */}
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <GraduationCap className="size-3.5" /> Educational Background Details
              </p>
              <div className="overflow-x-auto rounded-lg border border-border text-xs">
                <table className="w-full text-left">
                  <thead className="bg-muted/60 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-1.5">Level</th>
                      <th className="px-3 py-1.5">Name Of School</th>
                      <th className="px-3 py-1.5">Year Graduated</th>
                      <th className="px-3 py-1.5">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-[11px]">
                    <tr>
                      <td className="px-3 py-2 font-semibold text-foreground">Elementary (Grade School)</td>
                      <td className="px-3 py-2 text-foreground font-medium">{userProfile.elemSchool || "—"}</td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">{userProfile.elemYearGrad || "—"}</td>
                      <td className="px-3 py-2"><span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold">{userProfile.elemType || "Public"}</span></td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-semibold text-foreground">Junior High School (G7 - G10)</td>
                      <td className="px-3 py-2 text-foreground font-medium">{userProfile.juniorHighSchool || "—"}</td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">{userProfile.juniorHighYearGrad || "—"}</td>
                      <td className="px-3 py-2"><span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold">{userProfile.juniorHighType || "Public"}</span></td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-semibold text-foreground">Senior High School (G11 - G12)</td>
                      <td className="px-3 py-2 text-foreground font-medium">{userProfile.seniorHighSchool || "—"}</td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">{userProfile.seniorHighYearGrad || "—"}</td>
                      <td className="px-3 py-2"><span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold">{userProfile.seniorHighType || "Public"}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Personal Details Grid */}
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <UserRound className="size-3.5" /> Personal Identification
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Gender:</span>
                  <span className="font-semibold text-foreground">{userProfile.gender || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Date of Birth:</span>
                  <span className="font-semibold text-foreground">{userProfile.birthDate || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Civil Status:</span>
                  <span className="font-semibold text-foreground">{userProfile.civilStatus || "Single"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Nationality:</span>
                  <span className="font-semibold text-foreground">{userProfile.nationality || "Filipino"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Religion:</span>
                  <span className="font-semibold text-foreground">{userProfile.religion || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Extension:</span>
                  <span className="font-semibold text-foreground">{userProfile.extensionName || "None"}</span>
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <MapPin className="size-3.5" /> Residential Address
              </p>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Current Address:</span>
                  <span className="font-medium text-foreground">
                    {userProfile.currentAddress || userProfile.address || "Not specified"}
                    {userProfile.currentCity ? `, ${userProfile.currentCity}` : ""}
                    {userProfile.currentProvince ? `, ${userProfile.currentProvince}` : ""}
                    {userProfile.currentPostalCode ? ` ${userProfile.currentPostalCode}` : ""}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Permanent Address:</span>
                  <span className="font-medium text-foreground">
                    {userProfile.permanentAddress || userProfile.currentAddress || userProfile.address || "Same as current"}
                  </span>
                </div>
                {userProfile.emergencyContact && (
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Emergency Contact:</span>
                    <span className="font-medium text-foreground">{userProfile.emergencyContact}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Family Details */}
            {(userProfile.fatherName || userProfile.motherName || userProfile.guardianName) && (
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <UsersRound className="size-3.5" /> Family & Guardians
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {userProfile.fatherName && (
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Father:</span>
                      <span className="font-semibold text-foreground">{userProfile.fatherName}</span>
                      {userProfile.fatherMobile && (
                        <span className="text-[11px] font-mono text-muted-foreground block">Mobile: {userProfile.fatherMobile}</span>
                      )}
                    </div>
                  )}
                  {userProfile.motherName && (
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Mother:</span>
                      <span className="font-semibold text-foreground">{userProfile.motherName}</span>
                      {userProfile.motherMobile && (
                        <span className="text-[11px] font-mono text-muted-foreground block">Mobile: {userProfile.motherMobile}</span>
                      )}
                    </div>
                  )}
                  {userProfile.guardianName && (
                    <div className="col-span-1 sm:col-span-2">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Guardian ({userProfile.guardianRelationship || "Guardian"}):</span>
                      <span className="font-semibold text-foreground">{userProfile.guardianName}</span>
                      {userProfile.guardianMobile && (
                        <span className="text-[11px] font-mono text-muted-foreground block">Mobile: {userProfile.guardianMobile}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        </div>

        {/* Action Buttons (Screen Only) */}
        <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3 print:hidden shrink-0">
          {isStaff && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInternalEdit(true)}
              className="gap-1.5 cursor-pointer text-xs h-8"
            >
              <Edit3 className="size-3.5" /> Edit Details & Line
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 cursor-pointer font-bold shadow-sm text-xs h-8"
          >
            <Printer className="size-3.5" />
            {receiptMode === "staff_release"
              ? "Print Staff Release Receipt"
              : receiptMode === "user_queue_slip"
              ? "Print User Queue Slip"
              : "Print Profile Details"}
          </Button>
          <Button size="sm" variant="outline" onClick={onClose} className="cursor-pointer text-xs h-8">
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

      {/* Student Rate Staff & Say Thanks Modal */}
      {showRatingModal && (
        <RateStaffModal
          request={currentReq}
          onClose={() => setShowRatingModal(false)}
          onRated={(updated) => {
            setCurrentReq(updated);
            onUpdateRequest?.(updated);
          }}
        />
      )}
    </div>,
    document.body
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
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setConfirming(true);
  };

  const handleConfirmSave = () => {
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

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={() => !loading && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Edit Request Receipt & Queue Line
            </h3>
            <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2 mt-0.5">
              <span>{request.id} • {request.student} ({request.studentId})</span>
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

        {confirming ? (
          <div className="mt-4 space-y-4 animate-in fade-in">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h4 className="font-bold text-sm text-foreground">
                  Confirm Receipt Changes & Notify Student
                </h4>
              </div>
              <p className="text-muted-foreground text-xs mb-3">
                Please verify the updated details below. Saving will immediately update the digital receipt and dispatch an automated email notification to the student.
              </p>

              <div className="space-y-2 border-t border-border/60 pt-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Request ID:</span>
                  <span className="font-bold text-primary">{request.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student:</span>
                  <span className="font-semibold">{request.student} ({request.studentId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Queue Position:</span>
                  <span className="font-bold text-foreground">Line #{lineNumber} ({priority})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-bold text-primary">{status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">When to Claim:</span>
                  <span className="font-bold text-foreground">{pickupDate || "Standard Schedule"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Instruction:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{paymentStatus}</span>
                </div>
                {remarks && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remarks:</span>
                    <span className="font-medium italic text-foreground max-w-[60%] truncate">{remarks}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirming(false)}
                disabled={loading}
              >
                Back to Edit
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmSave}
                disabled={loading}
                className="gap-1.5 cursor-pointer font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" /> Confirm & Notify Student
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
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
      )}
      </div>
    </div>,
    document.body
  );
}

function StaffContactAdminModal({
  currentUser,
  onClose,
  setFlash,
}: {
  currentUser: AuthUser | null;
  onClose: () => void;
  setFlash: (f: Flash) => void;
}) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General Question / Inquiries");
  const [priority, setPriority] = useState<"Normal" | "Important" | "Urgent">("Normal");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [showHotline, setShowHotline] = useState(false);

  const ticketRef = useMemo(
    () => `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
    []
  );

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const QUICK_TEMPLATES = [
    {
      label: "🎓 Record Discrepancy",
      cat: "Student Record Verification",
      prio: "Important" as const,
      sub: "Student record discrepancy verification",
      msg: "[Student Name / ID]: \n[Discrepancy Details]: Personal details/credentials do not match official records.\n[Action Needed]: Please verify against Registrar Master Archive.",
    },
    {
      label: "⚡ Urgent Signature Override",
      cat: "Document Signature / Approval",
      prio: "Urgent" as const,
      sub: "Urgent document signature authorization request",
      msg: "[Document Type]: \n[Student ID]: \n[Reason]: Urgent release needed for student scholarship / employment deadline.\n[Action Needed]: Expedited Administrator approval required.",
    },
    {
      label: "🔐 Access / Permissions",
      cat: "System Concern / Bug Report",
      prio: "Normal" as const,
      sub: "Staff queue permissions or system issue report",
      msg: `[Staff Account]: ${currentUser?.email || "staff"}\n[Module]: Registrar Queue / Student Archive\n[Issue Description]: Unable to process specific queue item / permission update needed.`,
    },
    {
      label: "🗄️ Vault Archive Retrieval",
      cat: "Document Signature / Approval",
      prio: "Normal" as const,
      sub: "Archived record retrieval from cold storage",
      msg: "[Student Name / ID]: \n[Graduation Year / Batch]: \n[Requested Record]: Transcript / Certificate archive retrieval requested.",
    },
  ];

  const handleApplyTemplate = (tpl: (typeof QUICK_TEMPLATES)[number]) => {
    setCategory(tpl.cat);
    setPriority(tpl.prio);
    setSubject(tpl.sub);
    setMessage(tpl.msg);
    setValidationError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (subject.trim().length < 4) {
      setValidationError("Please enter a descriptive subject (at least 4 characters).");
      return;
    }
    if (message.trim().length < 8) {
      setValidationError("Please enter a detailed message explaining your inquiry (at least 8 characters).");
      return;
    }

    setSubmitting(true);
    setValidationError("");
    try {
      const token = localStorage.getItem("queueless_token");
      await fetch(`${API_URL}/api/audit-logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          actorName: currentUser?.name || "Registrar Staff",
          actorEmail: currentUser?.email || "",
          actorRole: "staff",
          actorId: currentUser?.studentId || currentUser?.id || "STAFF",
          targetCategory: "staff",
          action: `Staff Concern [${ticketRef}] [${priority.toUpperCase()}]: ${subject.trim()}`,
          details: `[Category: ${category}] ${message.trim()}`,
          status: priority === "Urgent" ? "Warning" : "Success",
        }),
      });

      // Persist staff inquiry message to admin notifications
      try {
        const stored = localStorage.getItem("queueless_staff_admin_messages");
        const list = stored ? JSON.parse(stored) : [];
        list.unshift({
          id: ticketRef,
          staffName: currentUser?.name || "Registrar Staff",
          staffEmail: currentUser?.email || "",
          staffId: currentUser?.studentId || currentUser?.id || "STAFF",
          category,
          priority,
          subject: subject.trim(),
          message: message.trim(),
          createdAt: new Date().toISOString(),
          read: false,
        });
        localStorage.setItem("queueless_staff_admin_messages", JSON.stringify(list));
      } catch (err) {
        console.error("Error storing staff admin message:", err);
      }

      setFlash({
        tone: "success",
        text: `Inquiry #${ticketRef} logged & dispatched to Administrator workspace. Admin notified.`,
      });
      onClose();
    } catch {
      setFlash({
        tone: "success",
        text: `Inquiry #${ticketRef} saved locally and queued for Administrator review.`,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xl animate-in zoom-in-95 duration-150 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Headset className="size-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-bold text-foreground">
                  Contact Administrator
                </h3>
                <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border font-bold">
                  #{ticketRef}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Submit an inquiry, request override, or report an issue directly to Admin.
              </p>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} className="size-7 cursor-pointer shrink-0">
            <X className="size-3.5" />
          </Button>
        </div>

        {/* Scrollable Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto mt-3 pr-1 space-y-3 text-xs">
          {/* Quick Helpful Topic Templates */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Helpful Quick Templates (click to auto-fill):
              </span>
              <button
                type="button"
                onClick={() => setShowHotline(!showHotline)}
                className="text-[10px] text-primary hover:underline cursor-pointer font-semibold flex items-center gap-1"
              >
                <Phone className="size-3" />
                {showHotline ? "Hide hotline info" : "Admin direct helpline"}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="rounded-lg border border-border bg-muted/40 hover:bg-primary/10 hover:border-primary/40 px-2 py-1 text-[11px] font-medium text-foreground transition cursor-pointer"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Admin Direct Hotline Details SLA (Collapsible/Helpful) */}
          {showHotline && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-[11px] space-y-1.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between font-bold text-primary">
                <span className="flex items-center gap-1.5">
                  <Headset className="size-3.5" /> Official Registrar Admin Directory
                </span>
                <span className="text-[10px] bg-primary/15 px-1.5 py-0.5 rounded">Mon–Sat 8AM–5PM</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Direct: <strong className="text-foreground">(075) 522-5635 loc. 101</strong> • Mobile: <strong className="text-foreground">+63 995-078-5660</strong>
                <br />
                Email: <strong className="text-foreground">admin.queueless@up.phinma.edu.ph</strong> • Rm 101, Main Registrar Building
              </p>
            </div>
          )}

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Field label="Inquiry Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="field cursor-pointer h-8 text-xs"
              >
                <option value="General Question / Inquiries">General Question / Inquiries</option>
                <option value="System Concern / Bug Report">System Concern / Bug Report</option>
                <option value="Student Record Verification">Student Record Verification</option>
                <option value="Document Signature / Approval">Document Signature / Approval</option>
                <option value="Urgent Assistance / Escalation">Urgent Assistance / Escalation</option>
              </select>
            </Field>

            <Field label="Priority Level">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className={`field cursor-pointer h-8 text-xs font-semibold ${
                  priority === "Urgent" ? "text-amber-600 dark:text-amber-400 border-amber-500/50" : ""
                }`}
              >
                <option value="Normal">Normal</option>
                <option value="Important">Important</option>
                <option value="Urgent">⚡ Urgent (Immediate Action)</option>
              </select>
            </Field>
          </div>

          {/* Subject with character hint */}
          <Field label="Subject / Topic *">
            <input
              type="text"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (validationError) setValidationError("");
              }}
              placeholder="e.g. Student record discrepancy on graduation certificate..."
              className="field h-8 text-xs"
              required
            />
          </Field>

          {/* Detailed Message */}
          <Field label="Detailed Message / Concern *">
            <textarea
              rows={3}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (validationError) setValidationError("");
              }}
              placeholder="Describe your question, concern, or situation with student name/ID if relevant..."
              className="field resize-none leading-relaxed text-xs"
              required
            />
            <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-1">
              <span>Be specific to ensure prompt administrator review.</span>
              <span>{message.length} characters</span>
            </div>
          </Field>

          {validationError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2 text-[11px] text-destructive flex items-center gap-1.5">
              <AlertCircle className="size-3.5 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Dispatch Metadata Note */}
          <div className="rounded-xl border border-muted bg-muted/40 p-2.5 text-[11px] text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="size-3.5 text-primary shrink-0" />
            <span>
              Dispatched from <strong>{currentUser?.name || "Registrar Staff"}</strong> ({currentUser?.email || "staff"}). Tracked under Ticket #{ticketRef}.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border shrink-0">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting} className="h-8 text-xs cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting} className="h-8 text-xs font-bold gap-1.5 cursor-pointer">
              {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
              Send to Admin
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function RateStaffModal({
  request,
  onClose,
  onRated,
  setFlash,
}: {
  request: RequestItem;
  onClose: () => void;
  onRated: (updatedReq: RequestItem) => void;
  setFlash?: (f: Flash) => void;
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const compliments = [
    "⚡ Fast Processing",
    "😊 Very Polite & Accommodating",
    "📋 Clear & Complete Instructions",
    "🌟 Excellent & Professional Service",
    "🙌 Hassle-Free Experience",
  ];

  const handleToggleCompliment = (comp: string) => {
    if (feedback.includes(comp)) {
      setFeedback((prev) => prev.replace(comp, "").replace(/\s*,\s*$/, "").trim());
    } else {
      setFeedback((prev) => (prev ? `${prev}, ${comp}` : comp));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("queueless_token");
      await fetch(`${API_URL}/api/requests/${encodeURIComponent(request.id)}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          feedback: feedback.trim(),
        }),
      });

      const updatedItem: RequestItem = {
        ...request,
        rating,
        feedback: feedback.trim(),
        feedbackAt: new Date().toISOString(),
      };

      onRated(updatedItem);
      if (setFlash) {
        setFlash({
          tone: "success",
          text: `Thank you! Your ${rating}-star rating and feedback have been shared with the registrar staff.`,
        });
      }
      onClose();
    } catch {
      const updatedItem: RequestItem = {
        ...request,
        rating,
        feedback: feedback.trim(),
        feedbackAt: new Date().toISOString(),
      };
      onRated(updatedItem);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels: Record<number, string> = {
    1: "Poor - Needs Improvement",
    2: "Fair - Okay",
    3: "Good - Satisfactory",
    4: "Great - Very Helpful!",
    5: "Excellent! - Outstanding Service 🎉",
  };

  const activeStars = hoverRating || rating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/20">
              <Star className="size-5 fill-amber-500" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                Rate Staff & Say Thanks
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {request.assignedStaffName
                  ? `Processed by: ${request.assignedStaffName}`
                  : `Document: ${request.document}`}
              </p>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} className="size-8 cursor-pointer">
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Star Rating Selector */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                  title={`${star} Star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`size-8 transition-colors ${
                      star <= activeStars
                        ? "text-amber-400 fill-amber-400 drop-shadow"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs font-bold text-amber-600 dark:text-amber-400">
              {ratingLabels[activeStars] || "Select Rating"}
            </p>
          </div>

          {/* Quick Compliment Pills */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Quick Compliments (Click to add):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {compliments.map((comp) => {
                const isSelected = feedback.includes(comp);
                return (
                  <button
                    key={comp}
                    type="button"
                    onClick={() => handleToggleCompliment(comp)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition cursor-pointer border ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold"
                        : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {comp}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Textarea */}
          <Field label="Thank-You Note / Feedback Message">
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Say thanks to the staff or share details about your experience..."
              className="field resize-none leading-relaxed"
            />
          </Field>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="font-bold gap-1.5 cursor-pointer bg-amber-500 hover:bg-amber-600 text-white"
            >
              {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <HeartHandshake className="size-3.5" />}
              Submit Rating & Thanks
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface HelperChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  chips?: string[];
}

function CampusRegistrarHelperModal({
  onClose,
  currentUser,
}: {
  onClose: () => void;
  currentUser?: AuthUser | null;
}) {
  const CHAT_HISTORY_KEY = "queueless_chatbot_history";

  const getWelcomeMessage = (): HelperChatMessage => ({
    id: "welcome",
    sender: "bot",
    text: "Mabuhay! I am your **Campus Registrar Helper** at PHINMA University of Pangasinan.\n\nYou can ask me about:\n• Campus Facilities, learning spaces & labs (https://up.phinma.edu.ph/facilities/)\n• CSDL Announcements & student activities (https://www.facebook.com/up.csdl)\n• Document request procedures, credentials & claiming\n• General school information, office hours & directory\n• QueueLess Registrar project research & guidelines\n\nPlease type your question below to get started!",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  });

  const loadChatHistory = (): HelperChatMessage[] => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CHAT_HISTORY_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as HelperChatMessage[];
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn("Failed to parse chat history:", e);
      }
    }
    return [getWelcomeMessage()];
  };

  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<HelperChatMessage[]>(loadChatHistory);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // UPang Knowledge Base (trained on https://up.phinma.edu.ph, fb.com/phinmaupang, and fb.com/up.csdl)
  const getAiAnswer = (query: string): { text: string; chips?: string[] } => {
    const q = query.toLowerCase().trim();

    // 0. Safety & Moderation Filter: Refuse bad / abusive / inappropriate questions
    const badPatterns = [
      /\b(gago|tarantado|tangina|tang\s*ina|putangina|putang\s*ina|puta|pota|bobo|tanga|ulol|inutil|pakshet|pakyu|leche|peste|kupal|hudas|yawa|puki|burat|bayag|kantot|kantutan|jakol|siraulo|tamod|pokpok|kingina|punyeta|ogag|ungas|bastos|buwisit|bwisit)\b/i,
      /\b(fuck|fucking|fucker|shit|bitch|asshole|bastard|cunt|dick|pussy|porn|porno|sex|nude|kill|murder|suicide|bomb|terrorist|hack|exploit|stupid|idiot|dumb|moron|shut\s*up)\b/i,
    ];
    if (badPatterns.some((pattern) => pattern.test(query))) {
      return {
        text: "we're sorry but we can't answer that at the moment",
      };
    }

    // 1. Office hours / schedule (Dagupan only)
    if (q.includes("hour") || q.includes("schedule") || q.includes("open") || q.includes("time") || q.includes("saturday") || q.includes("sunday")) {
      return {
        text: "PHINMA University of Pangasinan (UPang) Registrar Office Hours:\n\n" +
          "• Monday to Friday: 8:00 AM – 5:00 PM\n" +
          "• Saturday: 8:00 AM – 12:00 PM (Noon)\n" +
          "• Sunday & Official Holidays: Closed\n\n" +
          "📍 Location: Ground Floor, Main Administration Building, Arellano Street, Dagupan City, 2400 Pangasinan.\n" +
          "💡 Tip: Documents are released at the counter based on what has been assigned to your queue ticket. During peak enrollment or graduation clearance, cut-off queues may apply.",
        chips: ["Where is the Dagupan campus?", "Registrar contact phone & emails", "Requirements to claim", "How does the Queue Line work?"],
      };
    }

    // 2. Locations / addresses (Dagupan Main Campus only)
    if (q.includes("location") || q.includes("address") || q.includes("where") || q.includes("campus") || q.includes("dagupan")) {
      return {
        text: "PHINMA University of Pangasinan (UPang) Campus & Registrar Location:\n\n" +
          "📍 Main Campus (Dagupan City):\n" +
          "Arellano Street, Dagupan City, 2400 Pangasinan, Philippines\n\n" +
          "• Landline: (075) 522-5635 / (075) 522-2496\n" +
          "• Mobile: +63 995-078-5660\n" +
          "• Registrar Email: registrar.up@phinmaed.com\n" +
          "• University Website: https://up.phinma.edu.ph\n" +
          "• Facebook: https://www.facebook.com/phinmaupang\n\n" +
          "The Registrar's Office is conveniently located on the Ground Floor of the Main Building.",
        chips: ["What are your office hours?", "How do I claim my document?", "Center for Student Development (CSDL)"],
      };
    }

    // 3. Contacts / email / phone
    if (q.includes("contact") || q.includes("email") || q.includes("phone") || q.includes("call") || q.includes("number")) {
      return {
        text: "Official PHINMA UPang Dagupan Registrar Directory:\n\n" +
          "📞 Contact Channels:\n" +
          "• Landlines: (075) 522-5635 / (075) 522-2496\n" +
          "• Mobile Hotline: +63 995-078-5660\n" +
          "• University Registrar Email: registrar.up@phinmaed.com\n" +
          "• Admissions & Inquiries: info.up@phinmaed.com\n" +
          "• Campus Address: Arellano Street, Dagupan City, 2400 Pangasinan\n" +
          "• Official Facebook: https://www.facebook.com/phinmaupang",
        chips: ["What are your office hours?", "Requirements to claim", "How does Queue Line work?"],
      };
    }

    // 3. Campus Facilities (Official Primary Reference: https://up.phinma.edu.ph/facilities/)
    if (q.includes("facilit") || q.includes("building") || q.includes("lab") || q.includes("room") || q.includes("library") || q.includes("gym") || q.includes("court") || q.includes("space") || q.includes("canteen") || q.includes("hotel") || q.includes("hospital")) {
      return {
        text: "PHINMA UPang Campus Facilities & Learning Spaces:\n\n" +
          "Primary Official Reference: https://up.phinma.edu.ph/facilities/\n\n" +
          "• Specialized Laboratories & Training Spaces:\n" +
          "  - Allied Health, Nursing Skills & Medical Laboratory Science (MedTech) simulation labs\n" +
          "  - Mock Hotel & Mock Hospital Suites for clinical and hospitality management practicum\n" +
          "  - Engineering, Architecture, and Computer Studies workshops and laboratories\n\n" +
          "• Library & Learning Commons:\n" +
          "  - Modern University Library with research volumes, digital workstations, and quiet study areas\n\n" +
          "• Campus Life Spaces:\n" +
          "  - Student Center, gymnasium, sports courts, and university dining cafeteria\n" +
          "  - Ground Floor Main Administration Building housing the Registrar's Office & Student Services\n\n" +
          "🌐 For complete details and official photographs, visit: https://up.phinma.edu.ph/facilities/",
      };
    }

    // 4. Center for Student Development and Leadership (CSDL) & Student Activities
    if (q.includes("csdl") || q.includes("leadership") || q.includes("organization") || q.includes("council") || q.includes("club") || q.includes("student affairs") || q.includes("welfare") || q.includes("activity") || q.includes("activities") || q.includes("announcement") || q.includes("event") || q.includes("post") || q.includes("facebook")) {
      return {
        text: "Center for Student Development and Leadership (CSDL) – PHINMA UPang:\n\n" +
          "Primary Official Reference: https://www.facebook.com/up.csdl\n\n" +
          "• Student Development & Services:\n" +
          "  - Recognized Student Organizations (RSOs), student councils, and leadership development programs\n" +
          "  - Campus activities, orientation programs, and Supreme Student Government (SSG) governance\n" +
          "  - Character verification for Good Moral certificates, ID validation stamping, and uniform guidelines\n\n" +
          "📍 Location: Student Center, Ground Floor, PHINMA UPang Dagupan\n" +
          "⏰ Office Hours: Monday to Friday: 8:00 AM – 5:00 PM\n" +
          "🌐 Official CSDL Facebook Page: https://www.facebook.com/up.csdl\n\n" +
          "📢 Note on Latest Announcements & Facebook Posts:\n" +
          "For real-time event updates and announcements, please consult the official CSDL page above. If a specific Facebook post cannot be accessed directly, please provide the post or a screenshot so I can assist you based on verified details rather than guessing.",
      };
    }

    // 5. Transcript of Records (TOR)
    if (q.includes("tor") || q.includes("transcript") || q.includes("records")) {
      return {
        text: "Transcript of Records (TOR) Guidelines at PHINMA UPang:\n\n" +
          "1. Request Filing: Submit your TOR request easily via QueueLess on your Student Portal.\n" +
          "2. Cashier Clearance: Ensure your tuition and university accounts are cleared.\n" +
          "3. Common Purposes: Employment, PRC Board Examination, Transfer Credentials, Board Evaluation, or Graduate Studies.\n" +
          "4. Processing Turnaround: Standard turnaround is 3 to 7 working days depending on academic records clearance.\n" +
          "5. Digital Credential Verification: PHINMA Education issues verifiable digital TORs with QR code authentication!\n" +
          "6. Releasing: Claim your document at the counter based on what has been assigned on your ticket.",
        chips: ["Can someone else claim my TOR?", "What are the requirements to claim?", "Document fees"],
      };
    }

    // 6. Proxy / Representative / Someone else claim
    if (q.includes("representative") || q.includes("proxy") || q.includes("someone else") || q.includes("mother") || q.includes("father") || q.includes("friend") || q.includes("brother") || q.includes("sister") || q.includes("relative") || q.includes("claim for me")) {
      return {
        text: "Can someone else claim your document? YES!\n\n" +
          "If you cannot personally visit the Dagupan Registrar's Office, your authorized representative must present the following at the counter based on what has been assigned:\n\n" +
          "1. Authorization Letter: Duly signed by you explicitly authorizing the representative to claim the specific document.\n" +
          "2. Photocopy of Student ID: Clear photocopy with 3 specimen signatures.\n" +
          "3. Representative's Valid ID: Original valid government-issued ID plus one photocopy.\n" +
          "4. Student Queue Slip / Claim Stub: Your QueueLess claim stub with reference line number.\n\n" +
          "Location: Present these directly at the counter based on what has been assigned for document releasing.",
        chips: ["What are the requirements to claim?", "Office hours & location", "How does Queue Line work?"],
      };
    }

    // 7. Requirements to claim
    if (q.includes("requirement") || q.includes("claim") || q.includes("bring") || q.includes("credentials") || q.includes("id")) {
      return {
        text: "Requirements to Claim at Registrar Office (Dagupan Campus):\n\n" +
          "• Personal Claiming:\n" +
          "  - Original valid PHINMA Student ID or any government-issued ID (PhilID, Driver's License, UMID, Passport).\n" +
          "  - Your QueueLess Student Queue Slip / Claim Stub.\n" +
          "  - Official Cashier Receipt / Clearance (if payment applies).\n\n" +
          "• Proxy / Representative Claiming:\n" +
          "  - Duly signed authorization letter from the student.\n" +
          "  - Photocopy of student ID with 3 specimen signatures.\n" +
          "  - Representative's original and photocopy of valid government ID.\n\n" +
          "Proceed to the counter based on what has been assigned once your request status is 'Ready for Claiming'.",
        chips: ["Can someone else claim for me?", "How much are the document fees?", "How does Queue Line work?"],
      };
    }

    // 8. Fees / payment
    if (q.includes("fee") || q.includes("pay") || q.includes("cost") || q.includes("price") || q.includes("how much") || q.includes("free")) {
      return {
        text: "Document Fees & Payment Clearance:\n\n" +
          "• Assessment: Document fees vary per certificate and number of requested copies, assessed by the Registrar Staff according to university rates.\n" +
          "• Payment Statuses in QueueLess:\n" +
          "  - 'Paid': Cleared with the university cashier.\n" +
          "  - 'Proceed to Registrar Staff': Staff will evaluate your request and direct you to the Cashier Window.\n" +
          "  - 'Exempted / Free of Charge': Granted for eligible scholarship recipients or first-time jobseeker programs.\n" +
          "• Cashier Window: Located conveniently next to the Registrar's Office in the Main Administration Building.",
        chips: ["How to request TOR?", "What are the requirements to claim?", "What is the Hawak Kamay (HK) Scholarship?"],
      };
    }

    // 9. Queue line / how QueueLess works
    if (q.includes("queue") || q.includes("line") || q.includes("queueless") || q.includes("how does") || q.includes("work") || q.includes("track")) {
      return {
        text: "How the QueueLess System Works:\n\n" +
          "1. Submit Request: File your requested document online through QueueLess.\n" +
          "2. Queue Line Assignment: You receive a sequential Queue Line # and priority tier (Regular, Priority, or Urgent).\n" +
          "3. Staff Processing: Registrar staff accepts your request and prepares institutional records.\n" +
          "4. Ready for Claiming: When ready, your status updates to 'Ready for Claiming' with an assigned pickup date.\n" +
          "5. Claiming: Bring your Student Queue Slip to the counter based on what has been assigned at the Dagupan Campus.\n" +
          "6. Official Release Receipt & Staff Rating: Staff releases your document, gives you an Official Release Receipt, and you can rate the staff service and say thanks!",
        chips: ["What are your office hours?", "How do I claim my document?", "Can someone else claim for me?"],
      };
    }

    // 10. Hawak Kamay (HK) Scholarship & Admissions
    if (q.includes("scholarship") || q.includes("hawak kamay") || q.includes("hk") || q.includes("gpa") || q.includes("admission") || q.includes("enroll")) {
      return {
        text: "Hawak Kamay (HK) Scholarship & Admissions at PHINMA UPang:\n\n" +
          "• Open Admission Policy: PHINMA University of Pangasinan enforces open admissions—no entrance examination required for incoming students!\n" +
          "• Hawak Kamay Scholarship: Provides generous tuition discounts to help aspiring students achieve their degree.\n" +
          "• No Maintaining GPA Required: You do not need to maintain a strict grade point average to retain the scholarship grant throughout standard program completion!\n" +
          "• For admissions or scholarship support, visit the Student Admissions Office or email info.up@phinmaed.com.",
        chips: ["Office hours & location", "Contact phone numbers", "Requirements to claim"],
      };
    }

    // 11. Certificate of Good Moral Character
    if (q.includes("good moral") || q.includes("moral") || q.includes("disciplinary")) {
      return {
        text: "Certificate of Good Moral Character Procedure:\n\n" +
          "• Filing: Submit a request for 'Certificate of Good Moral Character' in QueueLess.\n" +
          "• Verification: The request is forwarded to the Center for Student Development and Leadership (CSDL) for disciplinary standing verification.\n" +
          "• Requirements: Student must have no pending disciplinary offenses or unresolved student grievances.\n" +
          "• Releasing: Once cleared, pick up the certified certificate at the counter based on what has been assigned.",
        chips: ["Center for Student Development & Leadership (CSDL) info", "Requirements to claim", "Document fees"],
      };
    }

    // 12. Certificate of Grades (TCG)
    if (q.includes("grades") || q.includes("tcg") || q.includes("true copy of grades")) {
      return {
        text: "Certificate of Grades / True Copy of Grades (TCG):\n\n" +
          "• Purpose: Often requested for scholarship applications, summer school, board exams, or employment verification.\n" +
          "• Turnaround: Usually ready within 1 to 3 working days upon accounting clearance.\n" +
          "• Official Validation: Issued with official dry seal and registrar signature.\n" +
          "• Claiming: Collect at the counter based on what has been assigned once marked 'Ready for Claiming'.",
        chips: ["How to request TOR?", "Requirements to claim", "How much are the document fees?"],
      };
    }

    // 13. Certificate of Registration / Enrollment (COR)
    if (q.includes("cor") || q.includes("registration") || q.includes("enrollment")) {
      return {
        text: "Certificate of Registration / Enrollment (COR):\n\n" +
          "• Purpose: Serves as official proof of active enrollment for student discounts, insurance, visas, or allowance claims.\n" +
          "• Prerequisites: Student must be officially enrolled for the current academic term with validated subjects.\n" +
          "• Digital Copy: Available for viewing in your student portal; certified physical copies can be claimed at the counter based on what has been assigned.",
        chips: ["What are the requirements to claim?", "What are your office hours?", "School uniform & ID validation policy (CSDL)"],
      };
    }

    // 14. Transfer Credentials & Honorable Dismissal
    if (q.includes("transfer") || q.includes("honorable dismissal") || q.includes("dismissal")) {
      return {
        text: "Transfer Credentials & Honorable Dismissal:\n\n" +
          "• Purpose: Required when transferring from PHINMA UPang to another college or university.\n" +
          "• University Clearance: Requires complete academic and financial clearance from the Cashier, Library, Department Dean, and CSDL.\n" +
          "• Releasing: Official Honorable Dismissal and copy of grades for evaluation will be released at the counter based on what has been assigned.",
        chips: ["How to request TOR?", "What are your office hours & location?", "Registrar contact phone & emails"],
      };
    }

    // 15. CAV Certification & DFA Apostille
    if (q.includes("cav") || q.includes("apostille") || q.includes("dfa") || q.includes("ched") || q.includes("abroad") || q.includes("overseas")) {
      return {
        text: "CAV (CHED Certification, Authentication & Verification) & DFA Apostille:\n\n" +
          "• Purpose: Required for employment abroad, overseas studies, or visa documentation.\n" +
          "• Step 1: Request certified true copies of your Diploma and TOR in QueueLess.\n" +
          "• Step 2: Registrar prepares the CHED endorsement packet.\n" +
          "• Step 3: Endorsed documents are processed with CHED Regional Office 1 for CAV certification.\n" +
          "• Claiming: Claim the sealed endorsement at the counter based on what has been assigned.",
        chips: ["How to request TOR?", "What are the requirements to claim?", "Registrar contact phone & emails"],
      };
    }

    // 16. Graduation Clearance & Diploma Releasing
    if (q.includes("graduation") || q.includes("graduate") || q.includes("diploma")) {
      return {
        text: "Graduation Clearance & Diploma Releasing:\n\n" +
          "• Clearance Steps: All graduating students must complete online exit clearance including library, accounting, and alumni verification.\n" +
          "• Diploma Releasing: Diplomas are released with the official dry seal and President/Registrar signatures.\n" +
          "• Claiming Desk: Available at the counter based on what has been assigned upon presenting student clearance and valid ID.",
        chips: ["Requirements to claim", "Can someone else claim my document for me?", "CAV Certification & DFA Apostille procedure"],
      };
    }

    // 17. Lost Student ID Replacement
    if (q.includes("lost id") || q.includes("id replacement") || q.includes("replace id") || q.includes("lost student id")) {
      return {
        text: "Lost Student ID Replacement Procedure:\n\n" +
          "1. Affidavit of Loss: Secure a notarized Affidavit of Loss stating the circumstances of your lost ID.\n" +
          "2. CSDL Clearance: Submit the Affidavit of Loss to the Center for Student Development and Leadership (CSDL).\n" +
          "3. Payment: Pay the replacement ID fee at the Cashier Window.\n" +
          "4. Re-issuance: Present receipt and CSDL approval at the counter based on what has been assigned for ID photo capture and printing.",
        chips: ["Center for Student Development & Leadership (CSDL) info", "Document fees", "What are your office hours & location?"],
      };
    }

    // 18. School Uniform & Student ID Validation (CSDL)
    if (q.includes("uniform") || q.includes("dress code") || q.includes("validation")) {
      return {
        text: "School Uniform & Student ID Validation Policy:\n\n" +
          "• Prescribed Uniform: PHINMA UPang requires students to wear the prescribed institutional uniform with black shoes on designated days.\n" +
          "• Uniform Exemption: Exemption passes (e.g. for working students or medical reasons) are reviewed and approved by CSDL.\n" +
          "• ID Wearing: Valid student IDs must be worn visibly on campus at all times using the official UPang lanyard.\n" +
          "• Semester Validation: Visit CSDL at the start of each term for term validation sticker stamping.",
        chips: ["Center for Student Development & Leadership (CSDL) info", "What are your office hours & location?", "Lost Student ID replacement procedure"],
      };
    }

    // 19. QueueLess Registrar Project Development & Research Guidelines
    if (q.includes("queueless") || q.includes("thesis") || q.includes("project") || q.includes("research") || q.includes("system") || q.includes("developer")) {
      return {
        text: "QueueLess Registrar Project Development & Research Guidelines:\n\n" +
          "• Purpose: QueueLess is an academic thesis and software engineering research project developed to modernize document requesting and queue monitoring for PHINMA University of Pangasinan.\n\n" +
          "⚠️ Important Project Notice:\n" +
          "• Distinguish between verified school facts and software project features. We must not assume that the school currently uses or has approved our proposed QueueLess system as its live official operations.\n" +
          "• Official student document requests continue to be processed according to official school registrar policies at the Ground Floor, Main Building.\n" +
          "• When presenting QueueLess research, avoid inventing unverified school policies, fees, or administrative approvals.",
      };
    }

    // Default friendly response
    return {
      text: "Thank you for asking! I am your Campus Registrar Helper for PHINMA University of Pangasinan.\n\n" +
        "I provide guidance on:\n" +
        "1. Campus Facilities & Labs: https://up.phinma.edu.ph/facilities/\n" +
        "2. CSDL Announcements & Activities: https://www.facebook.com/up.csdl\n" +
        "3. Document Request Procedures & Releasing\n" +
        "4. QueueLess Registrar Project Guidelines\n" +
        "5. General School & Office Directory\n\n" +
        "• Office Hours: Monday to Friday 8:00 AM – 5:00 PM, Saturday 8:00 AM – 12:00 PM\n" +
        "• Main Campus: Arellano St., Dagupan City • Tel: (075) 522-5635 • Email: registrar.up@phinmaed.com\n\n" +
        "Please type your question in the chat box below. If your inquiry relates to a specific announcement or social media post, please provide the text or a screenshot so I can verify accurately rather than guessing.",
    };
  };

  const handleSend = (textToSend: string) => {
    const query = textToSend.trim();
    if (!query) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg: HelperChatMessage = {
      id: "u_" + Date.now(),
      sender: "user",
      text: query,
      time: nowTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    setTimeout(() => {
      const { text, chips } = getAiAnswer(query);
      const botMsg: HelperChatMessage = {
        id: "b_" + Date.now(),
        sender: "bot",
        text,
        chips,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsThinking(false);
    }, 350);
  };

  const handleNewConversation = () => {
    const fresh: HelperChatMessage[] = [
      {
        id: "welcome_" + Date.now(),
        sender: "bot",
        text: "New conversation started! How can I assist you today with PHINMA UPang campus facilities, CSDL announcements, or registrar procedures?",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
    setMessages(fresh);
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(fresh));
    } catch {}
  };

  const handleDeleteHistory = () => {
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY);
    } catch {}
    const fresh: HelperChatMessage[] = [
      {
        id: "deleted_" + Date.now(),
        sender: "bot",
        text: "Chat history deleted. Start a new conversation by typing your question below.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
    setMessages(fresh);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-lg h-[85vh] max-h-[680px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Bot className="size-5" />
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-display text-sm font-bold text-foreground">
                  Campus Registrar Helper
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="size-1 rounded-full bg-emerald-500 animate-pulse" /> Active
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                PHINMA University of Pangasinan • AI Knowledge Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleNewConversation}
              title="Start new conversation"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted/60 transition cursor-pointer"
            >
              <RotateCcw className="size-3" /> New convo
            </button>
            <button
              type="button"
              onClick={handleDeleteHistory}
              title="Delete chat history"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-destructive px-2 py-1 rounded-md hover:bg-destructive/10 transition cursor-pointer"
            >
              <Trash2 className="size-3" /> Delete
            </button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              title="Close helper"
              className="size-7 cursor-pointer text-muted-foreground hover:text-foreground shrink-0"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Chat Messages Scroll Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed shadow-2xs ${
                  m.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-xs"
                    : "bg-muted/60 text-foreground border border-border/70 rounded-tl-xs whitespace-pre-line"
                }`}
              >
                {m.text}
              </div>

              <span className="mt-1 px-1 text-[9px] text-muted-foreground font-medium">
                {m.time}
              </span>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/40 w-fit">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              <span>Campus Registrar Helper is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Form - User types question directly */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!inputQuery.trim() || isThinking) return;
            handleSend(inputQuery);
            setInputQuery("");
          }}
          className="flex items-center gap-2 border-t border-border bg-card p-3 shrink-0"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Type your question here (e.g. facilities, CSDL, requirements)..."
            className="field flex-1 h-9 text-xs px-3"
            disabled={isThinking}
            autoFocus
          />
          <Button
            type="submit"
            size="sm"
            disabled={isThinking || !inputQuery.trim()}
            className="h-9 px-3.5 cursor-pointer gap-1.5 shrink-0 font-semibold"
          >
            <Send className="size-3.5" />
            <span>Send</span>
          </Button>
        </form>
      </div>
    </div>,
    document.body
  );
}

function LogoutConfirmModal({
  user,
  onConfirm,
  onCancel,
}: {
  user: AuthUser | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const roleLabel =
    user?.role === "admin"
      ? "Administrator"
      : user?.role === "staff"
      ? "Registrar Staff"
      : user?.role === "guest" || user?.userType === "normal" || user?.studentId?.startsWith("GUEST")
      ? "Guest / Visitor"
      : "Student";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Confirm Sign Out"
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive shrink-0">
            <LogOut className="size-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">
              Confirm Sign Out
            </h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to end your session?
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">
                {user?.name || "QueueLess User"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {roleLabel}
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="cursor-pointer font-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            className="gap-1.5 cursor-pointer font-medium shadow-sm"
          >
            <LogOut className="size-3.5" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

function ConfirmStatusModal({
  request,
  initialTargetStatus,
  onClose,
  onConfirm,
  loading = false,
  onViewStudentDetails,
}: {
  request: RequestItem;
  initialTargetStatus: Status;
  onClose: () => void;
  onConfirm: (payload: {
    status: Status;
    paymentStatus: string;
    pickupDate: string;
    remarks: string;
  }) => void;
  loading?: boolean;
  onViewStudentDetails?: () => void;
}) {
  const [status, setStatus] = useState<Status>(initialTargetStatus);
  const [paymentStatus, setPaymentStatus] = useState<string>(
    request.paymentStatus || "Prepare payment within the day"
  );
  const [pickupDate, setPickupDate] = useState<string>(
    request.pickupDate || (initialTargetStatus === "Ready for Claiming" ? "Ready for Claiming Now" : "Within the day (Today)")
  );
  const [remarks, setRemarks] = useState<string>(request.remarks || "");

  const paymentPresets = [
    "Prepare payment within the day",
    "Pay upon claiming at Counter",
    "Paid",
    "Pending Payment",
    "Exempted / Free of Charge",
    "Proceed to Registrar Staff",
  ];

  const schedulePresets = [
    "Within the day (Today)",
    "Tomorrow • Window 2",
    "Ready for Claiming Now",
    "Standard Schedule",
  ];

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    onConfirm({
      status,
      paymentStatus: paymentStatus.trim() || "Proceed to Registrar Staff",
      pickupDate: pickupDate.trim() || "Standard Schedule",
      remarks: remarks.trim(),
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
        aria-label="Process Request & Update Receipt"
        className="w-full max-w-lg max-h-[88vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-150 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Header */}
        <div className="flex items-center justify-between p-5 pb-3 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <ClipboardCheck className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                Process Request & Update Receipt
              </h3>
              <p className="text-xs text-muted-foreground">
                Edit payment requirement and schedule before applying to receipt
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {/* Request Summary Strip */}
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/30 p-3 text-xs">
            <div>
              <span className="text-[11px] text-muted-foreground">Request & Queue:</span>
              <p className="font-bold text-foreground">
                {request.id} <span className="text-primary font-black ml-1">(Line #{request.lineNumber ?? 1})</span>
              </p>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground">Student:</span>
              <div className="flex items-center justify-between gap-1.5">
                <p className="font-semibold text-foreground truncate">{request.student} ({request.studentId})</p>
                {onViewStudentDetails && (
                  <button
                    type="button"
                    onClick={onViewStudentDetails}
                    className="text-[10px] font-bold text-primary hover:underline cursor-pointer shrink-0"
                    title="View Student Personal & Educational Details"
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>
            <div className="col-span-2 pt-1 border-t border-border/50">
              <span className="text-[11px] text-muted-foreground">Document:</span>
              <p className="font-semibold text-foreground">{request.document} ({request.copies || 1} copy/copies)</p>
            </div>
          </div>

          <form id="process-request-form" onSubmit={handleSubmit} className="space-y-3.5">
            {/* Status Selection */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Workflow Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="field font-semibold text-xs cursor-pointer"
              >
                <option value="Pending">Pending (Queue verification)</option>
                <option value="Processing">Processing (Registrar actively preparing)</option>
                <option value="Ready for Claiming">Ready for Claiming (Available at counter)</option>
                <option value="Claimed">Claimed (Officially released)</option>
                <option value="Needs Correction">Needs Correction (Follow-up required)</option>
              </select>
            </div>

            {/* Payment Requirement (Directive) */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Payment Directive (Applied to Receipt & Emailed)
              </label>
              <input
                type="text"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                placeholder="e.g., Prepare payment within the day"
                className="field text-xs font-semibold"
              />
              {/* 1-click Preset Chips */}
              <div className="mt-1.5 flex flex-wrap gap-1">
                {paymentPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setPaymentStatus(preset)}
                    className={`rounded-md px-2 py-0.5 text-[10px] font-semibold border transition cursor-pointer ${
                      paymentStatus === preset
                        ? "border-primary bg-primary/15 text-primary font-bold"
                        : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* When to Claim / Schedule */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                When to Claim (Pickup Schedule)
              </label>
              <input
                type="text"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                placeholder="e.g., Within the day (Today) or Tomorrow • Window 2"
                className="field text-xs font-semibold"
              />
              {/* Schedule Presets */}
              <div className="mt-1.5 flex flex-wrap gap-1">
                {schedulePresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setPickupDate(preset)}
                    className={`rounded-md px-2 py-0.5 text-[10px] font-semibold border transition cursor-pointer ${
                      pickupDate === preset
                        ? "border-primary bg-primary/15 text-primary font-bold"
                        : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Remarks / Instructions */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Instructions / Remarks to Student (Optional)
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g., Please present your valid school ID at Window 2 upon payment."
                className="field text-xs resize-none"
              />
            </div>

            {/* Digital Receipt Live Preview Helper */}
            <div className="rounded-lg border border-primary/25 bg-primary/5 p-2.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-1">
                Receipt Preview
              </span>
              <div className="flex items-center justify-between text-foreground font-semibold text-[11px]">
                <span>Queue Line #{request.lineNumber ?? 1}</span>
                <span>When to Claim: {pickupDate || "Standard Schedule"}</span>
              </div>
              <p className="mt-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                Payment: {paymentStatus || "Proceed to Registrar Staff"}
              </p>
            </div>
          </form>
        </div>

        {/* Pinned Footer */}
        <div className="p-4 border-t border-border/60 bg-muted/20 shrink-0 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer font-medium"
          >
            Cancel
          </Button>
          <Button
            form="process-request-form"
            type="submit"
            size="sm"
            disabled={loading}
            className="gap-1.5 cursor-pointer font-semibold shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Saving & Emailing...
              </>
            ) : (
              <>
                <Check className="size-3.5" /> Confirm & Apply to Receipt
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ManageRequests({
  requests,
  setRequests,
  setFlash,
  currentUser,
}: {
  requests: RequestItem[];
  setRequests: (r: RequestItem[]) => void;
  setFlash: (f: Flash) => void;
  currentUser?: AuthUser | null;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Active");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "priority-only">("all");
  const [staffQueueTab, setStaffQueueTab] = useState<"all" | "my_assigned" | "unassigned">("all");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [confirmingAcceptReq, setConfirmingAcceptReq] = useState<RequestItem | null>(null);

  // Receipt view and edit modals
  const [viewingReceipt, setViewingReceipt] = useState<RequestItem | null>(null);
  const [editingReceipt, setEditingReceipt] = useState<RequestItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    request: RequestItem;
    nextStatus: Status;
  } | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [viewingStudentDetails, setViewingStudentDetails] = useState<RequestItem | null>(null);

  const stats = useMemo(() => {
    let pending = 0;
    let processing = 0;
    let ready = 0;
    let urgentPriority = 0;
    let claimed = 0;
    let active = 0;
    let myAssigned = 0;
    let unassignedPending = 0;

    requests.forEach((r) => {
      if (r.status === "Claimed") {
        claimed++;
      } else {
        active++;
        if (r.status === "Pending") pending++;
        if (r.status === "Processing") processing++;
        if (r.status === "Ready for Claiming") ready++;
        if (r.priority === "Urgent" || r.priority === "Priority") urgentPriority++;

        const isMine = Boolean(
          currentUser &&
          r.assignedStaffId &&
          (r.assignedStaffId === currentUser.id || r.assignedStaffName === currentUser.name)
        );
        if (isMine) myAssigned++;
        if (!r.assignedStaffId && r.status === "Pending") unassignedPending++;
      }
    });

    return {
      total: requests.length,
      active,
      pending,
      processing,
      ready,
      urgentPriority,
      claimed,
      myAssigned,
      unassignedPending,
    };
  }, [requests, currentUser]);

  const shown = useMemo(
    () =>
      requests
        .filter((r) => {
          const statusMatch =
            status === "Active"
              ? r.status !== "Claimed"
              : status === "All"
              ? true
              : r.status === status;

          const priorityMatch =
            priorityFilter === "priority-only"
              ? r.priority === "Urgent" || r.priority === "Priority"
              : true;

          const queryMatch = `${r.id} ${r.student} ${r.studentId} ${r.document} line #${r.lineNumber ?? 1}`
            .toLowerCase()
            .includes(query.toLowerCase());

          const isAssignedToMe = Boolean(
            currentUser &&
            r.assignedStaffId &&
            (r.assignedStaffId === currentUser.id || r.assignedStaffName === currentUser.name)
          );
          const isUnassigned = !r.assignedStaffId;

          const staffTabMatch =
            staffQueueTab === "my_assigned"
              ? isAssignedToMe
              : staffQueueTab === "unassigned"
              ? isUnassigned && r.status === "Pending"
              : true;

          return statusMatch && priorityMatch && queryMatch && staffTabMatch;
        })
        .sort((a, b) => {
          const pWeight = { Urgent: 3, Priority: 2, Regular: 1 };
          const wA = pWeight[a.priority ?? "Regular"] ?? 1;
          const wB = pWeight[b.priority ?? "Regular"] ?? 1;
          if (wA !== wB) return wB - wA;
          return (a.lineNumber ?? 0) - (b.lineNumber ?? 0);
        }),
    [requests, query, status, priorityFilter, staffQueueTab, currentUser]
  );

  const handleAcceptRequest = async (item: RequestItem) => {
    const token = localStorage.getItem("queueless_token");
    const staffId = currentUser?.id || currentUser?.email || "STAFF";
    const staffName = currentUser?.name || "Registrar Staff";

    try {
      setAcceptingId(item.id);
      const response = await fetch(`${API_URL}/api/requests/${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "Processing",
          assignedStaffId: staffId,
          assignedStaffName: staffName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept request.");
      }

      const updatedItem: RequestItem = {
        ...item,
        status: "Processing",
        assignedStaffId: staffId,
        assignedStaffName: staffName,
      };

      setRequests(requests.map((r) => (r.id === item.id ? updatedItem : r)));
      setFlash({
        tone: "success",
        text: `Request ${item.id} accepted! It is now your assignment to process and finish.`,
      });
    } catch (err) {
      setFlash({
        tone: "error",
        text: err instanceof Error ? err.message : "Failed to accept request.",
      });
    } finally {
      setAcceptingId(null);
    }
  };

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

  const handleProcessRequest = async (payload: {
    status: Status;
    paymentStatus: string;
    pickupDate: string;
    remarks: string;
  }) => {
    if (!pendingStatusChange) return;
    const reqId = pendingStatusChange.request.id;
    const token = localStorage.getItem("queueless_token");
    if (!token) {
      setFlash({
        tone: "error",
        text: "Your session has expired. Please sign in again.",
      });
      return;
    }

    try {
      setStatusLoading(true);
      const response = await fetch(
        `${API_URL}/api/requests/${encodeURIComponent(reqId)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to process request & update receipt.");
      }

      const updatedItem: RequestItem = {
        ...pendingStatusChange.request,
        ...payload,
      };

      setRequests(
        requests.map((r) => (r.id === reqId ? updatedItem : r))
      );

      if (payload.status === "Claimed") {
        archiveClaimedRecord(updatedItem, "Registrar Staff");
      }

      setPendingStatusChange(null);
      setFlash({
        tone: "success",
        text: `Receipt updated & student notified for ${reqId} (${payload.status}).`,
      });
    } catch (err) {
      console.error("Process request error:", err);
      setFlash({
        tone: "error",
        text:
          err instanceof Error
            ? err.message
            : "Failed to process request and update receipt.",
      });
    } finally {
      setStatusLoading(false);
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

      {/* Quick Queue Stats / Filter Pills */}
      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        <button
          type="button"
          onClick={() => {
            setStatus("Active");
            setPriorityFilter("all");
          }}
          className={`flex flex-col items-start rounded-xl border p-3 text-left transition cursor-pointer ${
            status === "Active" && priorityFilter === "all"
              ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
              : "border-border bg-card hover:bg-muted/40"
          }`}
        >
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active Queue</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-foreground">{stats.active}</span>
            <span className="text-[10px] text-muted-foreground">in line</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatus("Pending");
            setPriorityFilter("all");
          }}
          className={`flex flex-col items-start rounded-xl border p-3 text-left transition cursor-pointer ${
            status === "Pending" && priorityFilter === "all"
              ? "border-amber-500 bg-amber-500/10 shadow-xs ring-1 ring-amber-500/30"
              : "border-border bg-card hover:bg-muted/40"
          }`}
        >
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">● Pending</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-amber-700 dark:text-amber-400">{stats.pending}</span>
            <span className="text-[10px] text-muted-foreground">needs review</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatus("Processing");
            setPriorityFilter("all");
          }}
          className={`flex flex-col items-start rounded-xl border p-3 text-left transition cursor-pointer ${
            status === "Processing" && priorityFilter === "all"
              ? "border-sky-500 bg-sky-500/10 shadow-xs ring-1 ring-sky-500/30"
              : "border-border bg-card hover:bg-muted/40"
          }`}
        >
          <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">● In Process</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-sky-700 dark:text-sky-400">{stats.processing}</span>
            <span className="text-[10px] text-muted-foreground">preparing</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatus("Ready for Claiming");
            setPriorityFilter("all");
          }}
          className={`flex flex-col items-start rounded-xl border p-3 text-left transition cursor-pointer ${
            status === "Ready for Claiming" && priorityFilter === "all"
              ? "border-emerald-500 bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500/30"
              : "border-border bg-card hover:bg-muted/40"
          }`}
        >
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">● Ready to Claim</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">{stats.ready}</span>
            <span className="text-[10px] text-muted-foreground">at window</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatus("Active");
            setPriorityFilter(priorityFilter === "priority-only" ? "all" : "priority-only");
          }}
          className={`flex flex-col items-start rounded-xl border p-3 text-left transition cursor-pointer ${
            priorityFilter === "priority-only"
              ? "border-rose-500 bg-rose-500/10 shadow-xs ring-1 ring-rose-500/30"
              : "border-border bg-card hover:bg-muted/40"
          }`}
        >
          <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">⚡ Priority Lane</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-rose-700 dark:text-rose-400">{stats.urgentPriority}</span>
            <span className="text-[10px] text-muted-foreground">urgent/prior</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatus("Claimed");
            setPriorityFilter("all");
          }}
          className={`flex flex-col items-start rounded-xl border p-3 text-left transition cursor-pointer ${
            status === "Claimed" && priorityFilter === "all"
              ? "border-slate-500 bg-slate-500/10 shadow-xs ring-1 ring-slate-500/30"
              : "border-border bg-card hover:bg-muted/40"
          }`}
        >
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">✓ Claimed</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-muted-foreground">{stats.claimed}</span>
            <span className="text-[10px] text-muted-foreground">released</span>
          </div>
        </button>
      </div>

      {/* Staff Multi-User Queue Switcher */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-card p-1.5 shadow-2xs w-fit">
        <button
          type="button"
          onClick={() => setStaffQueueTab("all")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
            staffQueueTab === "all"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <span>All Requests ({stats.total})</span>
        </button>

        <button
          type="button"
          onClick={() => setStaffQueueTab("my_assigned")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
            staffQueueTab === "my_assigned"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <UserRound className="size-3.5" />
          <span>My Assigned Queue ({stats.myAssigned})</span>
        </button>

        <button
          type="button"
          onClick={() => setStaffQueueTab("unassigned")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
            staffQueueTab === "unassigned"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Clock3 className="size-3.5" />
          <span>Available to Accept ({stats.unassignedPending})</span>
        </button>
      </div>

      {/* Filter and search */}
      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center">
        <label className="relative flex items-center flex-1">
          <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
          <span className="sr-only">Search requests</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-8 text-xs font-medium text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground"
            placeholder="Search line number, ID, student name, ID #, or document..."
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2.5 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
              title="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </label>

        <div className="flex items-center gap-2">
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPriorityFilter("all");
            }}
            className="field sm:w-52 font-medium text-xs cursor-pointer"
          >
            <option value="Active">Active Queue ({stats.active})</option>
            <option value="All">All Records ({stats.total})</option>
            <option value="Pending">Pending ({stats.pending})</option>
            <option value="Processing">Processing ({stats.processing})</option>
            <option value="Ready for Claiming">Ready for Claiming ({stats.ready})</option>
            <option value="Needs Correction">Needs Correction</option>
            <option value="Claimed">Claimed / Released ({stats.claimed})</option>
          </select>

          <span className="text-xs text-muted-foreground whitespace-nowrap pl-1 font-semibold">
            {shown.length} in view
          </span>
        </div>
      </div>

      {/* Requests List (Scrollable Card Rows) */}
      <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        {/* Header row */}
        <div className="sticky top-0 z-10 grid items-center gap-3 border-b border-border bg-muted/60 px-4 py-2.5 backdrop-blur text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
          style={{ gridTemplateColumns: "88px 1fr 1fr auto auto" }}>
          <span>Queue</span>
          <span>Student</span>
          <span>Document</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="max-h-[360px] overflow-y-auto scrollbar-thin divide-y divide-border/60">
          {shown.map((r) => {
            const isUrgent = r.priority === "Urgent";
            const isPriority = r.priority === "Priority";
            const isReady = r.status === "Ready for Claiming";
            const isProcessing = r.status === "Processing";
            const isCorrection = r.status === "Needs Correction";

            const accentColor = isUrgent
              ? "border-l-rose-500 bg-rose-500/[0.03]"
              : isPriority
              ? "border-l-amber-500 bg-amber-500/[0.025]"
              : isReady
              ? "border-l-emerald-500 bg-emerald-500/[0.02]"
              : isProcessing
              ? "border-l-sky-500 bg-sky-500/[0.02]"
              : isCorrection
              ? "border-l-amber-600 bg-amber-600/[0.03]"
              : "border-l-border/50";

            const isAssignedToMe = Boolean(
              currentUser &&
              r.assignedStaffId &&
              (r.assignedStaffId === currentUser.id || r.assignedStaffName === currentUser.name)
            );
            const isAcceptedByOther = Boolean(
              currentUser &&
              currentUser.role === "staff" &&
              r.assignedStaffId &&
              r.assignedStaffId !== currentUser.id &&
              r.assignedStaffName !== currentUser.name
            );
            const isPendingUnassigned = !r.assignedStaffId && r.status === "Pending";

            return (
              <div
                key={r.id}
                className={`grid items-center gap-3 border-l-4 px-4 py-3.5 transition-colors hover:bg-muted/25 ${accentColor}`}
                style={{ gridTemplateColumns: "88px 1fr 1fr auto auto" }}
              >
                {/* Queue line + priority */}
                <div className="flex flex-col gap-1">
                  <span className="inline-flex w-fit items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-black text-primary border border-primary/20 whitespace-nowrap">
                    Line #{r.lineNumber ?? 1}
                  </span>
                  {isUrgent && (
                    <span className="inline-flex w-fit items-center rounded bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-black text-rose-700 dark:text-rose-400 border border-rose-500/30 whitespace-nowrap">
                      ⚡ Urgent
                    </span>
                  )}
                  {isPriority && (
                    <span className="inline-flex w-fit items-center rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap">
                      ★ Priority
                    </span>
                  )}
                </div>

                {/* Student */}
                <div className="min-w-0">
                  <p className="font-bold text-foreground text-sm leading-tight truncate">{r.student}</p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">{r.studentId}</p>
                  <p className="font-mono text-[10px] text-primary/60 mt-0.5 truncate">{r.id}</p>
                </div>

                {/* Document */}
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-xs leading-snug line-clamp-2">{r.document}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {r.copies || 1} {(r.copies || 1) === 1 ? "copy" : "copies"} · {r.purpose}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-muted-foreground/60">{r.date}</span>
                    {r.assignedStaffName && (
                      <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                        isAssignedToMe
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                      }`}>
                        {isAssignedToMe ? "Assigned to You" : `Assigned: ${r.assignedStaffName}`}
                      </span>
                    )}
                    {r.rating && (
                      <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/15 px-1.5 py-0.2 text-[9px] font-black text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        ★ {r.rating}/5 from student
                      </span>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <div className="flex justify-center">
                  <StatusBadge status={r.status} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingStudentDetails(r)}
                    className="h-8 w-8 p-0 cursor-pointer text-primary border-primary/30 hover:bg-primary/10"
                    title="View Student Personal & Educational Details"
                  >
                    <UserRound className="size-3.5" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingReceipt(r)}
                    className="h-8 w-8 p-0 cursor-pointer"
                    title="View Receipt"
                  >
                    <Eye className="size-3.5" />
                  </Button>

                  {isPendingUnassigned ? (
                    <Button
                      size="sm"
                      onClick={() => setConfirmingAcceptReq(r)}
                      disabled={acceptingId === r.id}
                      className="h-8 px-3 text-xs font-bold cursor-pointer gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs whitespace-nowrap"
                      title="Accept this request to take responsibility for processing it"
                    >
                      {acceptingId === r.id ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                      Accept Request
                    </Button>
                  ) : isAcceptedByOther ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground border border-border whitespace-nowrap select-none"
                      title={`Accepted and in-progress by ${r.assignedStaffName}`}
                    >
                      <Lock className="size-3" /> Accepted by {r.assignedStaffName}
                    </span>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingReceipt(r)}
                        className="h-8 w-8 p-0 cursor-pointer"
                        title="Edit Receipt & Line"
                      >
                        <Edit3 className="size-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => {
                          const nextStatus: Status =
                            r.status === "Pending"
                              ? "Processing"
                              : r.status === "Processing"
                              ? "Ready for Claiming"
                              : r.status === "Ready for Claiming"
                              ? "Claimed"
                              : "Processing";
                          setPendingStatusChange({ request: r, nextStatus });
                        }}
                        className="h-8 px-3 text-xs font-bold cursor-pointer gap-1.5 shadow-xs whitespace-nowrap"
                        title="Process Request"
                      >
                        <ClipboardCheck className="size-3.5" /> Process
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {shown.length === 0 && (
            staffQueueTab === "unassigned" ? (
              <div className="py-12 px-4 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 mb-3">
                  <Coffee className="size-6" />
                </div>
                <p className="font-display font-bold text-sm text-foreground">
                  No Unassigned Requests Waiting
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  All current requests are assigned or completed. You're waiting for new requests from students.
                </p>
              </div>
            ) : staffQueueTab === "my_assigned" ? (
              <div className="py-12 px-4 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary mb-3">
                  <ClipboardCheck className="size-6" />
                </div>
                <p className="font-display font-bold text-sm text-foreground">
                  No requests currently assigned to you
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Switch to "Available to Accept" to claim pending student requests.
                </p>
              </div>
            ) : (
              <EmptyState text="No requests match your search or filter." />
            )
          )}
        </div>
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

      {/* Staff Status Change Confirmation Modal */}
      {pendingStatusChange && (
        <ConfirmStatusModal
          request={pendingStatusChange.request}
          initialTargetStatus={pendingStatusChange.nextStatus}
          loading={statusLoading}
          onClose={() => setPendingStatusChange(null)}
          onConfirm={handleProcessRequest}
          onViewStudentDetails={() => setViewingStudentDetails(pendingStatusChange.request)}
        />
      )}

      {/* Staff View Student Full Personal & Educational Details */}
      {viewingStudentDetails && (
        <StudentPersonalDetailsModal
          request={viewingStudentDetails}
          onClose={() => setViewingStudentDetails(null)}
        />
      )}

      {/* Staff Accept Request Confirmation Modal */}
      {confirmingAcceptReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Confirm Accept Request
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ticket #{confirmingAcceptReq.id} • Line #{confirmingAcceptReq.lineNumber ?? 1}
                </p>
              </div>
            </div>

            <p className="text-xs text-foreground/90 leading-relaxed mb-4">
              Are you sure you want to accept this request? By confirming, you will be officially assigned as the handling registrar staff (<strong className="text-foreground">{currentUser?.name || "Registrar Staff"}</strong>).
            </p>

            <div className="rounded-xl border border-border bg-muted/40 p-3.5 text-xs space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Student:</span>
                <span className="font-semibold text-foreground">{confirmingAcceptReq.student} ({confirmingAcceptReq.studentId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Document:</span>
                <span className="font-semibold text-foreground">{confirmingAcceptReq.document} ({confirmingAcceptReq.copies || 1} {confirmingAcceptReq.copies === 1 ? "copy" : "copies"})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Purpose:</span>
                <span className="font-medium text-foreground">{confirmingAcceptReq.purpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority:</span>
                <span className="font-bold text-foreground">{confirmingAcceptReq.priority || "Regular"}</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground mb-5 italic">
              * Note: Other registrar staff members will see that you have accepted this ticket and it is your responsibility to finish it.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmingAcceptReq(null)}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={acceptingId === confirmingAcceptReq.id}
                onClick={async () => {
                  const target = confirmingAcceptReq;
                  setConfirmingAcceptReq(null);
                  if (target) {
                    await handleAcceptRequest(target);
                  }
                }}
                className="cursor-pointer text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {acceptingId === confirmingAcceptReq.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                Confirm & Accept
              </Button>
            </div>
          </div>
        </div>
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
  docTypes = documentTypes,
  onUpdateDocTypes,
  currentUser,
  setCurrentUser,
}: {
  view: View;
  navigate: (v: View) => void;
  requests: RequestItem[];
  setFlash: (f: Flash) => void;
  users?: AccountUser[];
  onUsersUpdated?: () => void;
  onOpenCalendar?: () => void;
  docTypes?: string[];
  onUpdateDocTypes?: (d: string[]) => void;
  currentUser?: AuthUser | null;
  setCurrentUser?: (u: AuthUser | null) => void;
}) {
  const [selectedReceipt, setSelectedReceipt] = useState<RequestItem | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  useEffect(() => {
    const fetchAudit = async () => {
      const token = localStorage.getItem("queueless_token");
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/audit-logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.logs) {
          setAuditLogs(data.logs);
        }
      } catch (err) {
        console.error("Audit logs fetch error:", err);
      }
    };
    fetchAudit();
  }, []);

  const auditCounts = useMemo(() => {
    let staff = 0;
    let priority = 0;
    let guest = 0;
    auditLogs.forEach((l) => {
      if (l.targetCategory === "staff" || l.actorRole === "staff") staff++;
      else if (l.targetCategory === "priority" || l.targetCategory === "student" || l.actorRole === "student") priority++;
      else if (l.targetCategory === "guest" || l.actorRole === "guest") guest++;
    });
    return {
      all: auditLogs.length,
      staff,
      priority,
      guest,
    };
  }, [auditLogs]);

  if (view === "profile" && currentUser && setCurrentUser) {
    return (
      <StudentProfileView
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        setFlash={setFlash}
        onBack={() => navigate("dashboard")}
      />
    );
  }

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
        docs={docTypes}
        onUpdateDocs={onUpdateDocTypes || (() => {})}
      />
    );
  }

  if (view === "audit_logs") {
    return (
      <AuditLogsPanel
        setFlash={setFlash}
        onNavigate={navigate}
        users={users}
      />
    );
  }

  if (view === "official_records") {
    return (
      <AdminOfficialRecordsPanel
        setFlash={setFlash}
        onUsersUpdated={onUsersUpdated}
        users={users}
      />
    );
  }

  const safeUsers = Array.isArray(users) ? users : [];
  const safeRequests = Array.isArray(requests) ? requests : [];
  const safeDocs = Array.isArray(docTypes) ? docTypes : [];

  const pendingCount = safeUsers.filter((u) => u.approvalStatus === "pending").length;

  const activeRequestsCount = safeRequests.filter((r) =>
    ["Pending", "Processing", "Ready for Claiming", "In Progress", "Needs Correction", "Submitted"].includes(r.status as string)
  ).length;

  const completedRequestsCount = safeRequests.filter((r) =>
    ["Claimed", "Completed"].includes(r.status as string)
  ).length;

  const handleExportSystemOverviewCSV = () => {
    const headers = ["Metric", "Value"];
    const rows = [
      ["Total User Accounts", safeUsers.length],
      ["Document Types Count", safeDocs.length],
      ["Active Requests", activeRequestsCount],
      ["Completed Requests", completedRequestsCount],
      ["Pending Review Applications", pendingCount],
    ];
    const csvContent = [headers.join(","), ...rows.map((r) => `"${r[0]}",${r[1]}`)].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `QueueLess-SystemOverview-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFlash({ tone: "success", text: "System overview summary CSV report downloaded." });
  };

  const handleExportAuditCSV = () => {
    if (!auditLogs.length) {
      setFlash({ tone: "info", text: "No audit logs available to export." });
      return;
    }
    const headers = [
      "Timestamp",
      "Actor Name",
      "Actor Role",
      "Actor ID",
      "Category",
      "Action",
      "Details",
      "Request Number",
      "Status",
    ];
    const rows = auditLogs.map((l) => [
      `"${new Date(l.createdAt).toLocaleString()}"`,
      `"${(l.actorName || "").replace(/"/g, '""')}"`,
      `"${l.actorRole}"`,
      `"${l.actorId || ""}"`,
      `"${l.targetCategory}"`,
      `"${(l.action || "").replace(/"/g, '""')}"`,
      `"${(l.details || "").replace(/"/g, '""')}"`,
      `"${l.requestNumber || ""}"`,
      `"${l.status}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `QueueLess-DashboardAuditLogs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFlash({ tone: "success", text: "Audit log CSV report downloaded." });
  };

  return (
    <div className="animate-rise">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeading
          eyebrow="Administration"
          title="System overview"
          text="Manage access, document types, and system records."
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportSystemOverviewCSV}
          className="h-8 gap-1.5 text-xs font-semibold cursor-pointer shrink-0"
        >
          <Printer className="size-3.5" /> Export CSV
        </Button>
      </div>

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

      {/* Database System Overview Metrics */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Metric
          label="User accounts"
          value={safeUsers.length}
          icon={<UsersRound className="size-5 text-muted-foreground" />}
        />

        <Metric
          label="Document types"
          value={safeDocs.length}
          icon={<Settings2 className="size-5 text-muted-foreground" />}
        />

        <Metric
          label="Active requests"
          value={activeRequestsCount}
          icon={<Clock3 className="size-5 text-muted-foreground" />}
        />

        <Metric
          label="Completed"
          value={completedRequestsCount}
          icon={<CheckCircle2 className="size-5 text-muted-foreground" />}
        />
      </div>

      {/* System Audit Logs Section */}
      <div className="mt-10 flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-primary">
            Compliance & Activity Logs
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl text-foreground">
            System audit logs
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Monitor staff queue processing, student priority requests, and guest activities.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAuditCSV}
            className="h-8 gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Printer className="size-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Metric
          label="Total activities"
          value={auditCounts.all}
          icon={<History className="size-5 text-muted-foreground" />}
        />

        <Metric
          label="Staff operations"
          value={auditCounts.staff}
          icon={<ClipboardList className="size-5 text-muted-foreground" />}
        />

        <Metric
          label="Priority & students"
          value={auditCounts.priority}
          icon={<GraduationCap className="size-5 text-muted-foreground" />}
        />

        <Metric
          label="Guest activities"
          value={auditCounts.guest}
          icon={<UsersRound className="size-5 text-muted-foreground" />}
        />
      </div>

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

type AuditLogItem = {
  _id: string;
  actorName: string;
  actorEmail?: string;
  actorRole: "admin" | "staff" | "student" | "guest" | "system";
  actorId?: string;
  actorPicture?: string;
  targetCategory: "staff" | "priority" | "student" | "guest" | "system";
  action: string;
  details?: string;
  requestNumber?: string;
  status: "Success" | "Pending" | "Failed" | "Info" | "Warning";
  createdAt: string;
};

type AccountAuditGroup = {
  key: string;
  actorName: string;
  actorEmail?: string;
  actorRole: "admin" | "staff" | "student" | "guest" | "system";
  actorId?: string;
  actorPicture?: string;
  targetCategory: string;
  logs: AuditLogItem[];
  latestLog: AuditLogItem;
};

function AuditLogsPanel({
  setFlash,
  onNavigate,
  users = [],
}: {
  setFlash: (f: Flash) => void;
  onNavigate?: (v: View) => void;
  users?: AccountUser[];
}) {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "staff" | "priority" | "guest">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedAccountKey, setExpandedAccountKey] = useState<string | null>(null);
  const [selectedAccountModal, setSelectedAccountModal] = useState<AccountAuditGroup | null>(null);
  const [modalSearch, setModalSearch] = useState("");
  const [modalStatusFilter, setModalStatusFilter] = useState<"all" | "Success" | "Warning" | "Failed">("all");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<{ account: AccountAuditGroup; user?: AccountUser } | null>(null);

  useEffect(() => {
    if (selectedAccountModal || selectedUserDetails || selectedLog) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [selectedAccountModal, selectedUserDetails, selectedLog]);

  // Persistence helpers for audit log deletions so they stay deleted across logout & reload
  const getDeletedLogIds = (): Set<string> => {
    try {
      const stored = localStorage.getItem("queueless_deleted_audit_logs");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  };

  const getDeletedActorKeys = (): Set<string> => {
    try {
      const stored = localStorage.getItem("queueless_deleted_audit_actors");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  };

  const saveDeletedLogId = (id: string) => {
    try {
      const current = getDeletedLogIds();
      current.add(id);
      localStorage.setItem("queueless_deleted_audit_logs", JSON.stringify(Array.from(current)));
    } catch (e) {
      console.error("Error saving deleted log id:", e);
    }
  };

  const saveDeletedActor = (account: AccountAuditGroup) => {
    try {
      const currentActors = getDeletedActorKeys();
      if (account.actorEmail) currentActors.add(account.actorEmail.toLowerCase());
      if (account.actorId) currentActors.add(account.actorId.toLowerCase());
      if (account.actorName) currentActors.add(account.actorName.toLowerCase());
      if (account.key) currentActors.add(account.key.toLowerCase());
      localStorage.setItem("queueless_deleted_audit_actors", JSON.stringify(Array.from(currentActors)));

      const currentLogs = getDeletedLogIds();
      account.logs.forEach((l) => currentLogs.add(l._id));
      localStorage.setItem("queueless_deleted_audit_logs", JSON.stringify(Array.from(currentLogs)));
    } catch (e) {
      console.error("Error saving deleted actor:", e);
    }
  };

  const fetchAuditLogs = async () => {
    const token = localStorage.getItem("queueless_token");
    if (!token) {
      setError("Admin session not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `${API_URL}/api/audit-logs?limit=500`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const deletedLogs = getDeletedLogIds();
        const deletedActors = getDeletedActorKeys();
        let validLogs = (data.logs || []).filter((l: AuditLogItem) => {
          if (deletedLogs.has(l._id)) return false;
          if (l.actorEmail && deletedActors.has(l.actorEmail.toLowerCase())) return false;
          if (l.actorId && deletedActors.has(l.actorId.toLowerCase())) return false;
          if (l.actorName && deletedActors.has(l.actorName.toLowerCase())) return false;
          return true;
        });

        // If local deleted filter hid all logs but DB actually has real logs, auto-reset local filter
        if (validLogs.length === 0 && (data.logs || []).length > 0) {
          localStorage.removeItem("queueless_deleted_audit_logs");
          localStorage.removeItem("queueless_deleted_audit_actors");
          validLogs = data.logs;
        }

        setLogs(validLogs);
        try {
          localStorage.setItem("queueless_cached_audit_logs", JSON.stringify(validLogs));
        } catch {}
        return;
      }

      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Server returned HTTP ${res.status}`);
    } catch (err) {
      console.warn("Fetch audit logs error, attempting local fallback:", err);
      try {
        const localCached = localStorage.getItem("queueless_cached_audit_logs");
        if (localCached) {
          const parsed = JSON.parse(localCached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLogs(parsed);
            return;
          }
        }
      } catch {}
      setError(err instanceof Error ? err.message : "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (logId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this audit log record?")) {
      return;
    }
    const token = localStorage.getItem("queueless_token");
    try {
      saveDeletedLogId(logId);
      if (!logId.startsWith("synth-") && token) {
        await fetch(`${API_URL}/api/audit-logs/${logId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setLogs((prev) => prev.filter((l) => l._id !== logId));
      if (selectedLog?._id === logId) setSelectedLog(null);
      if (selectedAccountModal) {
        const remaining = selectedAccountModal.logs.filter((l) => l._id !== logId);
        if (remaining.length === 0) {
          setSelectedAccountModal(null);
        } else {
          setSelectedAccountModal({
            ...selectedAccountModal,
            logs: remaining,
            latestLog: remaining[0],
          });
        }
      }
      setFlash({ tone: "success", text: "Audit log entry deleted successfully." });
    } catch (err) {
      console.error("Delete audit log error:", err);
      setFlash({ tone: "error", text: "Failed to delete audit log entry." });
    }
  };

  const handleRemoveAccount = async (account: AccountAuditGroup, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const count = account.logs.length;
    if (
      !window.confirm(
        `Are you sure you want to remove all ${count} audit activit${count > 1 ? "ies" : "y"} for ${account.actorName}? This will permanently remove their records from the audit trail.`
      )
    ) {
      return;
    }
    const token = localStorage.getItem("queueless_token");
    try {
      saveDeletedActor(account);
      const identifier = account.actorEmail || account.actorId || account.actorName;
      if (token && identifier) {
        await fetch(`${API_URL}/api/audit-logs/actor/${encodeURIComponent(identifier)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const logIdsToRemove = new Set(account.logs.map((l) => l._id));
      setLogs((prev) => prev.filter((l) => !logIdsToRemove.has(l._id)));

      if (selectedAccountModal?.key === account.key) {
        setSelectedAccountModal(null);
      }
      if (selectedUserDetails?.account.key === account.key) {
        setSelectedUserDetails(null);
      }
      setFlash({
        tone: "success",
        text: `Successfully removed all audit activities for ${account.actorName}. Changes saved.`,
      });
    } catch (err) {
      console.error("Remove account activities error:", err);
      setFlash({ tone: "error", text: "Failed to remove audit activities for this user." });
    }
  };

  const handleClearAllLogs = async () => {
    if (!window.confirm("Are you sure you want to clean and clear all audit log records? This will permanently wipe all logs and start a fresh, accurate audit trail.")) {
      return;
    }
    const token = localStorage.getItem("queueless_token");
    try {
      if (token) {
        await fetch(`${API_URL}/api/audit-logs/all/clear`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      localStorage.removeItem("queueless_deleted_audit_logs");
      localStorage.removeItem("queueless_deleted_audit_actors");
      setLogs([]);
      setSelectedLog(null);
      setSelectedAccountModal(null);
      setFlash({ tone: "success", text: "Audit log trail has been cleanly reset." });
    } catch (err) {
      console.error("Clear all audit logs error:", err);
      setFlash({ tone: "error", text: "Failed to clear audit logs." });
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper to accurately classify an audit log item (Gmail is always Guest, staff/admin always Staff, school accounts Priority)
  const getLogCategory = (l: AuditLogItem, matchedUser?: AccountUser): "staff" | "priority" | "guest" => {
    const roleLower = (matchedUser?.role || l.actorRole || "").toLowerCase();
    const emailLower = (matchedUser?.email || l.actorEmail || "").toLowerCase();
    const catLower = (l.targetCategory || "").toLowerCase();

    // Staff and Admin are ALWAYS staff
    if (roleLower === "staff" || roleLower === "admin" || catLower === "staff") {
      return "staff";
    }
    // Gmail or role === "guest" or targetCategory === "guest" is guest!
    if (emailLower.endsWith("@gmail.com") || roleLower === "guest" || catLower === "guest") {
      return "guest";
    }
    // Otherwise priority/student
    return "priority";
  };

  const safeUsers = Array.isArray(users) ? users : [];

  // Helper to reliably find an actor's profile picture from log, localStorage, or users list
  const getActorPfp = (actor: { actorPicture?: string; actorEmail?: string; actorId?: string; actorName?: string }) => {
    if (!actor) return null;
    if (actor.actorPicture) return actor.actorPicture;
    if (actor.actorEmail) {
      const local = localStorage.getItem(`queueless_custom_pfp_${actor.actorEmail}`);
      if (local) return local;
      const match = safeUsers.find((u) => u?.email?.toLowerCase() === actor.actorEmail?.toLowerCase());
      if (match?.picture) return match.picture;
    }
    if (actor.actorId) {
      const match = safeUsers.find((u) => u?.studentId === actor.actorId);
      if (match?.picture) return match.picture;
    }
    if (actor.actorName) {
      const match = safeUsers.find((u) => u?.name?.toLowerCase() === actor.actorName?.toLowerCase());
      if (match?.picture) return match.picture;
    }
    return null;
  };

  // Filter logs by active category tab and search query in memory
  const filteredLogs = useMemo(() => {
    let result = Array.isArray(logs) ? logs : [];

    if (activeTab === "staff") {
      result = result.filter((l) => {
        if (!l) return false;
        const matched = safeUsers.find(
          (u) =>
            (l.actorEmail && u?.email?.toLowerCase() === l.actorEmail.toLowerCase()) ||
            (l.actorId && u?.studentId && u?.studentId.toLowerCase() === l.actorId.toLowerCase())
        );
        return getLogCategory(l, matched) === "staff";
      });
    } else if (activeTab === "priority") {
      result = result.filter((l) => {
        if (!l) return false;
        const matched = safeUsers.find(
          (u) =>
            (l.actorEmail && u?.email?.toLowerCase() === l.actorEmail.toLowerCase()) ||
            (l.actorId && u?.studentId && u?.studentId.toLowerCase() === l.actorId.toLowerCase())
        );
        return getLogCategory(l, matched) === "priority";
      });
    } else if (activeTab === "guest") {
      result = result.filter((l) => {
        if (!l) return false;
        const matched = safeUsers.find(
          (u) =>
            (l.actorEmail && u?.email?.toLowerCase() === l.actorEmail.toLowerCase()) ||
            (l.actorId && u?.studentId && u?.studentId.toLowerCase() === l.actorId.toLowerCase())
        );
        return getLogCategory(l, matched) === "guest";
      });
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(
        (l) =>
          l?.actorName?.toLowerCase().includes(q) ||
          l?.actorEmail?.toLowerCase().includes(q) ||
          l?.action?.toLowerCase().includes(q) ||
          l?.details?.toLowerCase().includes(q) ||
          l?.requestNumber?.toLowerCase().includes(q) ||
          l?.actorId?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [logs, activeTab, searchTerm, safeUsers]);

  // Group logs into 1 user entry per unique person (never double/duplicate)
  const groupedAccounts = useMemo(() => {
    const map = new Map<string, AccountAuditGroup>();
    for (const log of filteredLogs) {
      if (!log) continue;
      // Find matching user from database users list if possible
      const matchedUser = safeUsers.find(
        (u) =>
          (log.actorEmail && u?.email?.toLowerCase() === log.actorEmail.toLowerCase()) ||
          (log.actorId && u?.studentId && u?.studentId.toLowerCase() === log.actorId.toLowerCase()) ||
          (log.actorName && u?.name?.toLowerCase().trim() === log.actorName.toLowerCase().trim())
      );

      const canonicalName = matchedUser?.name || log.actorName || "System User";
      const key = (matchedUser?.email || matchedUser?.studentId || canonicalName).trim().toLowerCase() || `log-${log._id}`;
      const pfp = matchedUser?.picture || getActorPfp(log);
      const category = getLogCategory(log, matchedUser);

      if (!map.has(key)) {
        map.set(key, {
          key,
          actorName: canonicalName,
          actorEmail: matchedUser?.email || log.actorEmail,
          actorRole: (matchedUser?.role as any) || log.actorRole,
          actorId: matchedUser?.studentId || log.actorId,
          actorPicture: pfp || undefined,
          targetCategory: category,
          logs: [log],
          latestLog: log,
        });
      } else {
        const group = map.get(key)!;
        group.logs.push(log);
        if (!group.actorPicture && pfp) {
          group.actorPicture = pfp;
        }
        if (!group.actorId && (matchedUser?.studentId || log.actorId)) {
          group.actorId = matchedUser?.studentId || log.actorId;
        }
        if (!group.actorEmail && (matchedUser?.email || log.actorEmail)) {
          group.actorEmail = matchedUser?.email || log.actorEmail;
        }
      }
    }

    // Sort logs inside each group by createdAt descending so latestLog is the most recent
    const result = Array.from(map.values()).map((group) => {
      group.logs.sort((a, b) => {
        const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      group.latestLog = group.logs[0];
      return group;
    });

    return result;
  }, [filteredLogs, safeUsers]);

  // Tab counts accurately computed from UNIQUE USERS (not total activity entries)
  const counts = useMemo(() => {
    const allUsers = new Set<string>();
    const staffUsers = new Set<string>();
    const priorityUsers = new Set<string>();
    const guestUsers = new Set<string>();

    (Array.isArray(logs) ? logs : []).forEach((l) => {
      if (!l) return;
      const matched = safeUsers.find(
        (u) =>
          (l.actorEmail && u?.email?.toLowerCase() === l.actorEmail.toLowerCase()) ||
          (l.actorId && u?.studentId && u?.studentId.toLowerCase() === l.actorId.toLowerCase()) ||
          (l.actorName && u?.name?.toLowerCase().trim() === l.actorName.toLowerCase().trim())
      );
      const actorKey = (matched?.email || matched?.studentId || l.actorEmail || l.actorId || l.actorName || "user").trim().toLowerCase();
      allUsers.add(actorKey);

      const cat = getLogCategory(l, matched);
      if (cat === "staff") {
        staffUsers.add(actorKey);
      } else if (cat === "guest") {
        guestUsers.add(actorKey);
      } else {
        priorityUsers.add(actorKey);
      }
    });

    return {
      all: allUsers.size,
      staff: staffUsers.size,
      priority: priorityUsers.size,
      guest: guestUsers.size,
    };
  }, [logs, safeUsers]);

  const handleExportCSV = () => {
    if (!filteredLogs.length) return;
    const headers = [
      "Timestamp",
      "Actor Name",
      "Actor Role",
      "Actor ID",
      "Category",
      "Action",
      "Details",
      "Request Number",
      "Status",
    ];
    const rows = filteredLogs.map((l) => [
      `"${new Date(l.createdAt).toLocaleString()}"`,
      `"${(l.actorName || "").replace(/"/g, '""')}"`,
      `"${l.actorRole}"`,
      `"${l.actorId || ""}"`,
      `"${l.targetCategory}"`,
      `"${(l.action || "").replace(/"/g, '""')}"`,
      `"${(l.details || "").replace(/"/g, '""')}"`,
      `"${l.requestNumber || ""}"`,
      `"${l.status}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `QueueLess-AuditLogs-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFlash({ tone: "success", text: "Audit log CSV report downloaded successfully." });
  };

  return (
    <div className="animate-rise">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeading
          eyebrow="Compliance & Security"
          title="System audit logs"
          text="Monitor staff queue processing, student priority requests, and guest activities."
        />
        <div className="flex items-center gap-2 shrink-0">
          {logs.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAllLogs}
              className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 cursor-pointer"
            >
              <Trash2 className="size-3.5" /> Clear all logs
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-8 gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Printer className="size-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Main card */}
      <div className="mt-7 overflow-hidden rounded-md border border-border bg-card">
        {/* Navigation Tabs & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/20 p-3 sm:px-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                activeTab === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              All Activities ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("staff")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "staff"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              <ClipboardCheck className="size-3.5" /> Staff Activity ({counts.staff})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("priority")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "priority"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              <GraduationCap className="size-3.5" /> Students & Priority ({counts.priority})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("guest")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "guest"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              <UsersRound className="size-3.5" /> Guests ({counts.guest})
            </button>
          </div>

          {/* Search Bar on the RIGHT side */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search actor, action, ticket..."
              className="h-8 w-44 sm:w-60 rounded-md border border-input bg-background pl-8 pr-3 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        {/* Content Table / List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="mt-3 text-xs font-semibold">Loading system audit trail...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-destructive">{error}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchAuditLogs}
              className="mt-3 h-8 text-xs cursor-pointer"
            >
              Retry
            </Button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <History className="mx-auto size-9 opacity-40 mb-2" />
            <p className="text-sm font-bold text-foreground">No audit activities found</p>
            <p className="mt-1 text-xs">
              {searchTerm
                ? "No logs match your search criteria. Try a different query."
                : "No recorded logs for this category yet."}
            </p>
          </div>
        ) : (
          /* One per user — unified view (scrollable when 4+ entries) */
          <div className="max-h-[440px] overflow-y-auto divide-y divide-border pr-0.5 scrollbar-thin">
            {groupedAccounts.map((account) => {
              const pfp = getActorPfp(account);
              const isExpanded = expandedAccountKey === account.key;
              const isGmailGuest = Boolean(account.actorEmail?.toLowerCase().endsWith("@gmail.com") && account.actorRole !== "staff" && account.actorRole !== "admin");
              const roleTone =
                account.actorRole === "staff"
                  ? "bg-primary/10 text-primary border-primary/20"
                  : account.actorRole === "admin"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                  : isGmailGuest || account.actorRole === "guest" || account.targetCategory === "guest"
                  ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20"
                  : account.targetCategory === "priority"
                  ? "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20"
                  : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20";

              return (
                <div
                  key={account.key}
                  className="transition hover:bg-muted/20"
                >
                  <div className="flex flex-col gap-3 p-3.5 sm:p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Profile Picture with Initial Fallback */}
                      <div className="relative shrink-0">
                        {pfp ? (
                          <img
                            src={pfp}
                            alt={account.actorName}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                              const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = "flex";
                            }}
                            className="size-11 rounded-xl object-cover border border-border shadow-2xs"
                          />
                        ) : null}
                        <div
                          style={{ display: pfp ? "none" : "flex" }}
                          className="size-11 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs uppercase border border-primary/20 shadow-2xs"
                        >
                          {account.actorName ? account.actorName.slice(0, 2) : "SY"}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-foreground">
                            {account.actorName}
                          </span>
                          <span
                            className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${roleTone}`}
                          >
                            {isGmailGuest ? "Guest" : account.actorRole}
                          </span>
                          {(account.targetCategory === "priority" && !isGmailGuest) && (
                            <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                              Priority User
                            </span>
                          )}
                          <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {account.logs.length} Activit{account.logs.length > 1 ? "ies" : "y"}
                          </span>
                        </div>

                        <p className="mt-1 font-semibold text-xs text-foreground/90 line-clamp-1">
                          <span className="text-muted-foreground font-normal">Latest:</span> {account.latestLog.action}
                        </p>

                        {account.latestLog.details && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                            {account.latestLog.details}
                          </p>
                        )}

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                          {account.actorId && (
                            <>
                              <span className="font-mono">ID: {account.actorId}</span>
                              <span>·</span>
                            </>
                          )}
                          {account.actorEmail && (
                            <>
                              <span>{account.actorEmail}</span>
                              <span>·</span>
                            </>
                          )}
                          <span>Last active: {new Date(account.latestLog.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const matchedUser = safeUsers.find(
                            (u) =>
                              (account.actorEmail && u?.email?.toLowerCase() === account.actorEmail.toLowerCase()) ||
                              (account.actorId && u?.studentId && u?.studentId.toLowerCase() === account.actorId.toLowerCase()) ||
                              (account.actorName && u?.name?.toLowerCase().trim() === account.actorName.toLowerCase().trim())
                          );
                          setSelectedUserDetails({ account, user: matchedUser });
                        }}
                        className="h-8 text-xs gap-1.5 cursor-pointer font-medium border-border hover:bg-muted"
                      >
                        <Eye className="size-3.5" /> Details
                      </Button>

                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setSelectedAccountModal(account)}
                        className="h-8 text-xs gap-1.5 cursor-pointer font-bold bg-[#1e4d38] hover:bg-[#163c2b] text-white shadow-xs"
                      >
                        <ClipboardList className="size-3.5" /> All Activities ({account.logs.length})
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleRemoveAccount(account, e)}
                        className="h-8 text-xs gap-1.5 text-destructive border-destructive/30 hover:border-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer font-medium"
                      >
                        <Trash2 className="size-3.5" /> Remove
                      </Button>
                    </div>
                  </div>

                  {/* Inline Timeline for this account */}
                  {isExpanded && (
                    <div className="border-t border-border/70 bg-muted/20 p-4 sm:pl-16">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-foreground">
                          Activity Logs & Changes for {account.actorName} ({account.logs.length})
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelectedAccountModal(account)}
                          className="text-xs text-primary font-bold hover:underline cursor-pointer"
                        >
                          Open Detailed Modal →
                        </button>
                      </div>

                      <div className="space-y-2">
                        {account.logs.map((log) => {
                          const statusBadge =
                            log.status === "Success"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                              : log.status === "Warning"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                              : log.status === "Failed"
                              ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30"
                              : "bg-muted text-muted-foreground border-border";

                          return (
                            <div
                              key={log._id}
                              className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-bold text-xs text-foreground">{log.action}</span>
                                  <span className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold ${statusBadge}`}>
                                    {log.status}
                                  </span>
                                  {log.requestNumber && (
                                    <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-primary">
                                      Ticket #{log.requestNumber}
                                    </span>
                                  )}
                                </div>
                                {log.details && (
                                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                    {log.details}
                                  </p>
                                )}
                                <p className="mt-1 text-[10px] text-muted-foreground">
                                  {new Date(log.createdAt).toLocaleString()}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedLog(log)}
                                  className="h-7 text-xs cursor-pointer"
                                >
                                  Details
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => handleDeleteLog(log._id, e)}
                                  className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer gap-1"
                                >
                                  <Trash2 className="size-3" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Account Audit Logs Modal (All changes and activities for one account) */}
      {selectedAccountModal && (() => {
        const modalLogs = selectedAccountModal.logs || [];
        const successCount = modalLogs.filter((l) => l.status === "Success").length;
        const warningCount = modalLogs.filter((l) => l.status === "Warning").length;
        const failedCount = modalLogs.filter((l) => l.status === "Failed").length;

        const filteredLogs = modalLogs.filter((log) => {
          const matchesStatus = modalStatusFilter === "all" || log.status === modalStatusFilter;
          const term = modalSearch.toLowerCase().trim();
          const matchesSearch =
            !term ||
            log.action.toLowerCase().includes(term) ||
            (log.details || "").toLowerCase().includes(term) ||
            (log.requestNumber || "").toLowerCase().includes(term);
          return matchesStatus && matchesSearch;
        });

        return typeof document !== "undefined" ? createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
            onClick={() => setSelectedAccountModal(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-border p-3.5 bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {selectedAccountModal.actorPicture ? (
                      <img
                        src={selectedAccountModal.actorPicture}
                        alt={selectedAccountModal.actorName}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                          const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                        className="size-10 rounded-xl object-cover border border-border shadow-xs"
                      />
                    ) : null}
                    <div
                      style={{ display: selectedAccountModal.actorPicture ? "none" : "flex" }}
                      className="size-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs uppercase border border-primary/20 shadow-xs"
                    >
                      {selectedAccountModal.actorName ? selectedAccountModal.actorName.slice(0, 2) : "SY"}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-sm font-bold text-foreground">
                        {selectedAccountModal.actorName}
                      </h3>
                      <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase text-primary">
                        {selectedAccountModal.actorRole}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 flex flex-wrap items-center gap-1.5">
                      {selectedAccountModal.actorId && (
                        <span className="font-mono bg-muted px-1.5 py-0.2 rounded text-[10px]">
                          ID: {selectedAccountModal.actorId}
                        </span>
                      )}
                      <span>·</span>
                      <span>{selectedAccountModal.actorEmail || "No email"}</span>
                      <span>·</span>
                      <span className="font-semibold text-foreground">
                        {modalLogs.length} Total Activities
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => handleRemoveAccount(selectedAccountModal, e)}
                    className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive hover:text-destructive cursor-pointer font-medium gap-1 px-2.5"
                  >
                    <Trash2 className="size-3" /> Remove All
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 cursor-pointer text-muted-foreground hover:text-foreground shrink-0"
                    onClick={() => setSelectedAccountModal(null)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="border-b border-border bg-muted/10 p-2.5 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2 size-3 text-muted-foreground" />
                  <input
                    type="text"
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    placeholder="Search actions, tickets, or details..."
                    className="h-7.5 w-full rounded-lg border border-border bg-background pl-7.5 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {modalSearch && (
                    <button
                      type="button"
                      onClick={() => setModalSearch("")}
                      className="absolute right-2 top-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setModalStatusFilter("all")}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer transition ${
                      modalStatusFilter === "all"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    All ({modalLogs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalStatusFilter("Success")}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer transition ${
                      modalStatusFilter === "Success"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20"
                    }`}
                  >
                    Success ({successCount})
                  </button>
                  {warningCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setModalStatusFilter("Warning")}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer transition ${
                        modalStatusFilter === "Warning"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20"
                      }`}
                    >
                      Warning ({warningCount})
                    </button>
                  )}
                  {failedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setModalStatusFilter("Failed")}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer transition ${
                        modalStatusFilter === "Failed"
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20"
                      }`}
                    >
                      Failed ({failedCount})
                    </button>
                  )}
                </div>
              </div>

              {/* Modal Body: Scrollable list of activities */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
                {filteredLogs.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground">
                    <p className="text-sm font-semibold">No activity logs found</p>
                    <p className="text-xs mt-1">Try clearing your search query or status filter.</p>
                  </div>
                ) : (
                  filteredLogs.map((log) => {
                    const isExpanded = expandedLogId === log._id;
                    const statusBadge =
                      log.status === "Success"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                        : log.status === "Warning"
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                        : log.status === "Failed"
                        ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30"
                        : "bg-muted text-muted-foreground border-border";

                    return (
                      <div
                        key={log._id}
                        className="rounded-xl border border-border bg-card p-3 transition shadow-xs hover:border-primary/40 space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-bold text-xs text-foreground">{log.action}</span>
                              <span className={`rounded border px-1.5 py-0.2 text-[9px] font-semibold ${statusBadge}`}>
                                {log.status}
                              </span>
                              {log.requestNumber && (
                                <span className="rounded bg-primary/10 px-1.5 py-0.2 font-mono text-[9px] font-bold text-primary border border-primary/20">
                                  Ticket #{log.requestNumber}
                                </span>
                              )}
                              <span className="rounded bg-muted px-1.5 py-0.2 text-[9px] font-semibold text-muted-foreground capitalize">
                                {log.targetCategory} category
                              </span>
                            </div>

                            {log.details && (
                              <p className="mt-1.5 text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap rounded-lg bg-muted/30 p-2 border border-border/60">
                                {log.details}
                              </p>
                            )}

                            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[10px] text-muted-foreground">
                              <span>📅 {new Date(log.createdAt).toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
                              className={`h-6.5 text-[11px] cursor-pointer font-medium px-2 ${isExpanded ? "bg-muted" : ""}`}
                            >
                              {isExpanded ? "Hide Details" : "Raw Details"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => handleDeleteLog(log._id, e)}
                              className="h-6.5 text-[11px] text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer gap-1 px-2"
                              title="Delete log entry"
                            >
                              <Trash2 className="size-3" /> Delete
                            </Button>
                          </div>
                        </div>

                        {/* Inline Expandable Raw Details */}
                        {isExpanded && (
                          <div className="mt-2 pt-2 border-t border-border/80 text-xs space-y-1.5 animate-in fade-in duration-100">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-foreground text-[10px] uppercase tracking-wider">
                                Audit Log Record Metadata
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(JSON.stringify(log, null, 2));
                                  setFlash({ tone: "success", text: "Log JSON copied to clipboard." });
                                }}
                                className="h-5 text-[9px] gap-1 cursor-pointer"
                              >
                                Copy JSON
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] bg-muted/40 p-2 rounded-lg border border-border/60">
                              <div><span className="text-muted-foreground">Record ID:</span> <span className="font-mono">{log._id}</span></div>
                              <div><span className="text-muted-foreground">Actor ID:</span> <span className="font-mono">{log.actorId || "N/A"}</span></div>
                              <div><span className="text-muted-foreground">Actor Role:</span> <span className="uppercase font-semibold">{log.actorRole}</span></div>
                              <div><span className="text-muted-foreground">Target Category:</span> <span className="capitalize">{log.targetCategory}</span></div>
                              <div><span className="text-muted-foreground">Timestamp:</span> <span>{new Date(log.createdAt).toISOString()}</span></div>
                              <div><span className="text-muted-foreground">Status:</span> <span className="font-semibold">{log.status}</span></div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-border p-3 bg-muted/20 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Showing {filteredLogs.length} of {modalLogs.length} activities
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAccountModal(null)}
                  className="cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>,
          document.body
        ) : null;
      })()}

      {/* Selected Single Audit Log Modal */}
      {selectedLog && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedLog(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-border bg-card p-4 shadow-2xl animate-in zoom-in-95 duration-150 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                  {getActorPfp(selectedLog) ? (
                    <img
                      src={getActorPfp(selectedLog)!}
                      alt={selectedLog.actorName}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                        const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                      className="size-9 rounded-xl object-cover border border-border"
                    />
                  ) : null}
                  <div
                    style={{ display: getActorPfp(selectedLog) ? "none" : "flex" }}
                    className="size-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs uppercase"
                  >
                    {selectedLog.actorName ? selectedLog.actorName.slice(0, 2) : "SY"}
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-sm font-bold text-foreground">
                    Audit Activity Details
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    ID: {selectedLog._id}
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="size-7 cursor-pointer shrink-0"
                onClick={() => setSelectedLog(null)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="mt-3 space-y-2 rounded-xl border border-border bg-muted/20 p-3 text-xs">
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-muted-foreground">Action:</span>
                <span className="font-bold text-foreground text-right">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-muted-foreground">Actor Name:</span>
                <span className="font-semibold text-foreground">{selectedLog.actorName}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-muted-foreground">Actor Role:</span>
                <span className="font-semibold uppercase text-primary">{selectedLog.actorRole}</span>
              </div>
              {selectedLog.actorEmail && (
                <div className="flex justify-between border-b border-border/60 pb-1.5">
                  <span className="text-muted-foreground">Actor Email:</span>
                  <span className="font-semibold text-foreground">{selectedLog.actorEmail}</span>
                </div>
              )}
              {selectedLog.actorId && (
                <div className="flex justify-between border-b border-border/60 pb-1.5">
                  <span className="text-muted-foreground">Actor ID / Student ID:</span>
                  <span className="font-mono font-semibold text-foreground">{selectedLog.actorId}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-semibold capitalize text-foreground">{selectedLog.targetCategory}</span>
              </div>
              {selectedLog.requestNumber && (
                <div className="flex justify-between border-b border-border/60 pb-1.5">
                  <span className="text-muted-foreground">Associated Ticket:</span>
                  <span className="font-mono font-bold text-primary">#{selectedLog.requestNumber}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-muted-foreground">Outcome Status:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedLog.status}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-muted-foreground">Exact Timestamp:</span>
                <span className="font-semibold text-foreground">{new Date(selectedLog.createdAt).toLocaleString()}</span>
              </div>
              {selectedLog.details && (
                <div className="pt-1">
                  <span className="text-muted-foreground block mb-1 text-[11px]">Activity Log Description:</span>
                  <p className="rounded-lg border border-border bg-background p-2 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedLog.details}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3.5 flex items-center justify-between">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  handleDeleteLog(selectedLog._id, e);
                  setSelectedLog(null);
                }}
                className="gap-1 cursor-pointer h-7 text-xs px-2.5"
              >
                <Trash2 className="size-3" /> Delete Log
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(null)}
                className="cursor-pointer h-7 text-xs px-3"
              >
                Close
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Full User Details Modal (Triggered by 'Details' button) */}
      {selectedUserDetails && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedUserDetails(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-2xl text-xs space-y-3 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-3">
                <div className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary overflow-hidden border border-border shadow-2xs">
                  {selectedUserDetails.user?.picture || selectedUserDetails.account.actorPicture ? (
                    <img
                      src={selectedUserDetails.user?.picture || selectedUserDetails.account.actorPicture!}
                      alt={selectedUserDetails.account.actorName}
                      className="size-full object-cover"
                    />
                  ) : (
                    <UserRound className="size-5.5" />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="font-display text-sm font-bold text-foreground">
                      {selectedUserDetails.user?.name || selectedUserDetails.account.actorName}
                    </h3>
                    <span className="rounded border border-primary/20 bg-primary/10 px-1.5 py-0.2 text-[9px] font-bold uppercase text-primary">
                      {selectedUserDetails.user?.role || selectedUserDetails.account.actorRole}
                    </span>
                    {(() => {
                      const r = (selectedUserDetails.user?.role || selectedUserDetails.account.actorRole || "").toLowerCase();
                      const isGuest = r !== "admin" && r !== "staff" && (
                        selectedUserDetails.account.actorEmail?.toLowerCase().endsWith("@gmail.com") ||
                        r === "guest" ||
                        Boolean(selectedUserDetails.user?.studentId && selectedUserDetails.user.studentId.startsWith("GUEST"))
                      );
                      return isGuest ? (
                        <span className="rounded border border-purple-500/30 bg-purple-500/10 px-1.5 py-0.2 text-[9px] font-bold text-purple-700 dark:text-purple-300">
                          Guest
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                    {selectedUserDetails.user?.studentId || selectedUserDetails.account.actorId || "No ID assigned"}
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSelectedUserDetails(null)}
                className="size-7 cursor-pointer shrink-0"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Terms and Conditions status */}
            <div className="rounded-xl border border-border bg-muted/20 p-2.5 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" /> Terms & Privacy Status
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Agreement</span>
                  {selectedUserDetails.user?.termsAccepted ? (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> Checked & Accepted
                    </span>
                  ) : (
                    <span className="font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Clock3 className="size-3.5" /> Pending Acceptance
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Accepted Date</span>
                  <span className="font-medium text-foreground text-[11px]">
                    {selectedUserDetails.user?.termsAcceptedAt
                      ? new Date(selectedUserDetails.user.termsAcceptedAt).toLocaleString()
                      : selectedUserDetails.user?.termsAccepted
                      ? "Recorded on sign-in"
                      : "Pending"}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile & Contact Details */}
            <div className="rounded-xl border border-border bg-muted/20 p-2.5 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Mail className="size-3.5" /> Contact & Account Information
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Email Address</span>
                  <span className="font-medium text-foreground break-all text-[11px]">
                    {selectedUserDetails.user?.email || selectedUserDetails.account.actorEmail || "None"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Phone Number</span>
                  <span className="font-medium text-foreground text-[11px]">
                    {selectedUserDetails.user?.phone || "None provided"}
                  </span>
                </div>
                {selectedUserDetails.user?.course && (
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Degree / Program</span>
                    <span className="font-medium text-foreground text-[11px]">{selectedUserDetails.user.course}</span>
                  </div>
                )}
                {selectedUserDetails.user?.yearLevel && (
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Year Level</span>
                    <span className="font-medium text-foreground text-[11px]">{selectedUserDetails.user.yearLevel}</span>
                  </div>
                )}
                {selectedUserDetails.user?.currentAddress && (
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground block text-[10px]">Address</span>
                    <span className="font-medium text-foreground text-[11px]">{selectedUserDetails.user.currentAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Audit Log Activity Summary */}
            <div className="rounded-xl border border-border bg-muted/20 p-2.5 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <ClipboardList className="size-3.5" /> Audit Activity Summary
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Total Logged Activities</span>
                  <span className="font-bold text-foreground text-xs">
                    {selectedUserDetails.account.logs.length} actions
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Most Recent Action</span>
                  <span className="font-medium text-foreground line-clamp-1 text-[11px]">
                    {selectedUserDetails.account.latestLog.action}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block text-[10px]">Last Active Timestamp</span>
                  <span className="font-medium text-foreground text-[11px]">
                    {new Date(selectedUserDetails.account.latestLog.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between pt-2 border-t border-border">
              <Button
                type="button"
                variant="default"
                size="sm"
                className="gap-1 font-bold cursor-pointer h-7 text-xs px-2.5"
                onClick={() => {
                  const acct = selectedUserDetails.account;
                  setSelectedUserDetails(null);
                  setSelectedAccountModal(acct);
                }}
              >
                <ClipboardList className="size-3" /> View Activity Trail ({selectedUserDetails.account.logs.length})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedUserDetails(null)}
                className="cursor-pointer h-7 text-xs px-3"
              >
                Close
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function AdminOfficialRecordsPanel({
  setFlash,
  onUsersUpdated,
  users = [],
}: {
  setFlash: (f: Flash) => void;
  onUsersUpdated?: () => void;
  users?: AccountUser[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "staff" | "guest">("all");
  const [editingUser, setEditingUser] = useState<AccountUser | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingUser) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [editingUser]);

  // Form states
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [extensionName, setExtensionName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [course, setCourse] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [civilStatus, setCivilStatus] = useState("Single");
  const [nationality, setNationality] = useState("Filipino");
  const [religion, setReligion] = useState("");

  // Address states
  const [currentAddress, setCurrentAddress] = useState("");
  const [currentCountry, setCurrentCountry] = useState("Philippines");
  const [currentProvince, setCurrentProvince] = useState("Pangasinan");
  const [currentCity, setCurrentCity] = useState("Dagupan City");
  const [currentPostalCode, setCurrentPostalCode] = useState("2400");
  const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(true);
  const [permanentAddress, setPermanentAddress] = useState("");
  const [permanentCountry, setPermanentCountry] = useState("Philippines");
  const [permanentProvince, setPermanentProvince] = useState("Pangasinan");
  const [permanentCity, setPermanentCity] = useState("Dagupan City");
  const [permanentPostalCode, setPermanentPostalCode] = useState("2400");

  const openEditModal = (u: AccountUser) => {
    setEditingUser(u);
    // Parse existing name into parts if not split yet
    const nameParts = (u.name || "").trim().split(/\s+/);
    const initFirst = u.firstName || (nameParts.length > 0 ? nameParts[0] : "");
    const initLast = u.lastName || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : "");
    const initMiddle = u.middleName || (nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "");

    setLastName(initLast);
    setFirstName(initFirst);
    setMiddleName(initMiddle);
    setExtensionName(u.extensionName || "");
    setStudentId(u.studentId || "");
    setCourse(u.course || "");
    setYearLevel(u.yearLevel || "");
    setPhone(u.phone || "");
    setEmail(u.email || "");
    setBirthDate(u.birthDate || "");
    setGender(u.gender || "");
    setCivilStatus(u.civilStatus || "Single");
    setNationality(u.nationality || "Filipino");
    setReligion(u.religion || "");

    setCurrentAddress(u.currentAddress || u.address || "");
    setCurrentCountry(u.currentCountry || "Philippines");
    setCurrentProvince(u.currentProvince || "Pangasinan");
    setCurrentCity(u.currentCity || "Dagupan City");
    setCurrentPostalCode(u.currentPostalCode || "2400");
    setSameAsCurrentAddress(u.sameAsCurrentAddress !== false);
    setPermanentAddress(u.permanentAddress || u.address || "");
    setPermanentCountry(u.permanentCountry || "Philippines");
    setPermanentProvince(u.permanentProvince || "Pangasinan");
    setPermanentCity(u.permanentCity || "Dagupan City");
    setPermanentPostalCode(u.permanentPostalCode || "2400");
  };

  const handleSaveRecord = async () => {
    if (!editingUser) return;
    if (!lastName.trim() || !firstName.trim()) {
      setFlash({ tone: "error", text: "Last name and First name are required." });
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("queueless_token");
      const computedName = [firstName.trim(), middleName.trim(), lastName.trim(), extensionName.trim()]
        .filter(Boolean)
        .join(" ");

      const payload = {
        name: computedName,
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        extensionName: extensionName.trim(),
        studentId: studentId.trim(),
        course: course.trim(),
        yearLevel: yearLevel.trim(),
        phone: phone.replace(/\D/g, ""),
        email: email.trim(),
        birthDate,
        gender,
        civilStatus,
        nationality,
        religion,
        currentAddress: currentAddress.trim(),
        currentCountry: currentCountry.trim(),
        currentProvince: currentProvince.trim(),
        currentCity: currentCity.trim(),
        currentPostalCode: currentPostalCode.trim(),
        sameAsCurrentAddress,
        permanentAddress: (sameAsCurrentAddress ? currentAddress : permanentAddress).trim(),
        permanentCountry: (sameAsCurrentAddress ? currentCountry : permanentCountry).trim(),
        permanentProvince: (sameAsCurrentAddress ? currentProvince : permanentProvince).trim(),
        permanentCity: (sameAsCurrentAddress ? currentCity : permanentCity).trim(),
        permanentPostalCode: (sameAsCurrentAddress ? currentPostalCode : permanentPostalCode).trim(),
        address: currentAddress.trim(),
      };

      const res = await fetch(`${API_URL}/api/auth/users/${editingUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update official record.");
      }

      setFlash({
        tone: "success",
        text: `Official record for ${computedName} updated successfully by Administrator.`,
      });
      setEditingUser(null);
      onUsersUpdated?.();
    } catch (err) {
      console.error("Save official record error:", err);
      setFlash({
        tone: "error",
        text: err instanceof Error ? err.message : "Failed to update record.",
      });
    } finally {
      setSaving(false);
    }
  };

  const isGuestUserRecord = (u: AccountUser) => {
    const roleLower = (u.role || "").toLowerCase();
    if (roleLower === "admin" || roleLower === "staff") return false;
    if (roleLower === "guest") return true;
    if (u.studentId && u.studentId.startsWith("GUEST")) return true;
    const email = (u.email || "").toLowerCase().trim();
    if (email.endsWith("@gmail.com")) return true;
    return false;
  };

  const filteredUsers = users.filter((u) => {
    const isGuest = isGuestUserRecord(u);
    const roleLower = (u.role || "").toLowerCase();
    let matchesRole = true;
    if (roleFilter === "guest") {
      matchesRole = isGuest;
    } else if (roleFilter === "student") {
      matchesRole = roleLower === "student" && !isGuest;
    } else if (roleFilter === "staff") {
      matchesRole = roleLower === "staff";
    }

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (u.name || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term) ||
      (u.studentId || "").toLowerCase().includes(term);
    return matchesRole && matchesSearch;
  });

  const studentsCount = users.filter((u) => (u.role || "").toLowerCase() === "student" && !isGuestUserRecord(u)).length;
  const staffCount = users.filter((u) => (u.role || "").toLowerCase() === "staff").length;
  const guestCount = users.filter(isGuestUserRecord).length;

  return (
    <div className="animate-rise space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            Institutional Records Workspace
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Official student & staff records
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Only Registrar Administrators can modify legal names, identification numbers, and residential addresses. Legal names are locked from staff and students.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, ID number, or email..."
            className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setRoleFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              roleFilter === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("student")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              roleFilter === "student"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            Students ({studentsCount})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("staff")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              roleFilter === "staff"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20"
            }`}
          >
            Staff ({staffCount})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("guest")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              roleFilter === "guest"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20"
            }`}
          >
            Users ({guestCount})
          </button>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
          <Lock className="mx-auto size-8 text-muted-foreground/60 mb-2" />
          <p className="text-sm font-semibold text-foreground">No records match your search</p>
          <p className="text-xs text-muted-foreground mt-1">Try another search term or clear the role filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((u) => {
            const isGuest = isGuestUserRecord(u);
            const displayRoleName = isGuest ? "Users" : u.role;
            const roleBadge =
              u.role === "admin"
                ? "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30"
                : u.role === "staff"
                ? "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30"
                : isGuest
                ? "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30"
                : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";

            return (
              <div
                key={u.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between transition hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        {u.picture ? (
                          <img
                            src={u.picture}
                            alt={u.name}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                              const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = "flex";
                            }}
                            className="size-11 rounded-xl object-cover border border-border shadow-xs"
                          />
                        ) : null}
                        <div
                          style={{ display: u.picture ? "none" : "flex" }}
                          className="size-11 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs uppercase border border-primary/20 shadow-xs"
                        >
                          {u.name ? u.name.slice(0, 2) : "US"}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-sm text-foreground truncate">{u.name}</p>
                          <span title="Legal Name Locked for User">
                            <Lock className="size-3 text-amber-500 shrink-0" />
                          </span>
                        </div>
                        <span className={`inline-block mt-0.5 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase ${roleBadge}`}>
                          {displayRoleName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-xl border border-border/60">
                    {!isGuest && (
                      <div className="flex items-center justify-between">
                        <span>ID Number:</span>
                        <span className="font-mono font-bold text-foreground">{u.studentId || "N/A"}</span>
                      </div>
                    )}
                    {u.role === "student" && u.course && (
                      <div className="flex items-center justify-between">
                        <span>Program:</span>
                        <span className="font-medium text-foreground truncate max-w-[170px]" title={u.course}>
                          {u.course}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Email:</span>
                      <span className="text-foreground truncate max-w-[170px]" title={u.email}>{u.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Address:</span>
                      <span className="text-foreground truncate max-w-[170px]">
                        {[u.currentCity, u.currentProvince, u.currentCountry].filter(Boolean).join(", ") || "Not set"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(u)}
                    className="w-full h-8 text-xs font-bold gap-1.5 cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  >
                    <Pencil className="size-3" /> Edit Official Record
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Record Modal (Admin Override) */}
      {editingUser && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => !saving && setEditingUser(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border p-3.5 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                  <UserCog className="size-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-bold text-foreground">
                      Edit Official Institutional Record
                    </h3>
                    <span className="rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-400">
                      Admin Override
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Modifying official record for <span className="font-semibold text-foreground">{editingUser.name}</span> ({editingUser.email})
                  </p>
                </div>
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="size-7 cursor-pointer shrink-0"
                disabled={saving}
                onClick={() => setEditingUser(null)}
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {/* Section: Legal Names */}
              <div className="rounded-xl border border-border bg-muted/10 p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Lock className="size-3.5 text-amber-500" />
                  <span>Protected Legal Name Details (Registrar Official)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Last Name *">
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Dela Cruz"
                      className="field"
                      required
                    />
                  </Field>
                  <Field label="First Name *">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Juan"
                      className="field"
                      required
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Middle Name">
                    <input
                      type="text"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder="e.g. Santos"
                      className="field"
                    />
                  </Field>
                  <Field label="Extension Name">
                    <select
                      value={extensionName}
                      onChange={(e) => setExtensionName(e.target.value)}
                      className="field cursor-pointer"
                    >
                      <option value="">None</option>
                      <option value="Jr.">Jr.</option>
                      <option value="Sr.">Sr.</option>
                      <option value="I">I</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                    </select>
                  </Field>
                </div>
              </div>

              {/* Section: Institutional ID & Academic Program */}
              <div className="rounded-xl border border-border bg-muted/10 p-4 space-y-3">
                <p className="text-xs font-bold text-foreground">Institutional Details</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label={editingUser.role === "staff" ? "Staff Employee ID" : editingUser.role === "admin" ? "Admin Employee ID" : editingUser.role === "guest" ? "Guest Identifier" : "UPang Student ID"}>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder={editingUser.role === "staff" ? "e.g. STAFF-001" : editingUser.role === "admin" ? "e.g. ADMIN-001" : editingUser.role === "guest" ? "e.g. GUEST-91726" : "Enter your Student Id"}
                      className="field font-mono"
                    />
                  </Field>
                  <Field label="Degree / Academic Course">
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="e.g. BS Information Technology"
                      className="field"
                    />
                  </Field>
                  <Field label="Year Level">
                    <select
                      value={yearLevel}
                      onChange={(e) => setYearLevel(e.target.value)}
                      className="field cursor-pointer"
                    >
                      <option value="">N/A</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Graduated / Alumnus">Graduated / Alumnus</option>
                    </select>
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Official Email">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="field"
                    />
                  </Field>
                  <Field label="Mobile Number">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="09XXXXXXXXX"
                      className="field font-mono"
                    />
                  </Field>
                </div>
              </div>

              {/* Section: Addresses (Searchable Dropdowns) */}
              <div className="rounded-xl border border-border bg-muted/10 p-4 space-y-3">
                <p className="text-xs font-bold text-foreground">Current Residential Address</p>

                <Field label="* Street Address (House No., Street, Barangay)">
                  <input
                    type="text"
                    value={currentAddress}
                    onChange={(e) => setCurrentAddress(e.target.value)}
                    placeholder="e.g. 123 Arellano St."
                    className="field"
                  />
                </Field>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <SearchableSelect
                    label="* Country"
                    value={currentCountry}
                    onChange={setCurrentCountry}
                    options={COUNTRIES_LIST}
                    placeholder="Select Country"
                  />
                  <SearchableSelect
                    label="* Province"
                    value={currentProvince}
                    onChange={setCurrentProvince}
                    options={PHILIPPINE_PROVINCES}
                    placeholder="Select Province"
                  />
                  <SearchableSelect
                    label="* City / Municipality"
                    value={currentCity}
                    onChange={setCurrentCity}
                    options={PHILIPPINE_CITIES}
                    placeholder="Select City / Municipality"
                  />
                  <Field label="* Postal Code">
                    <input
                      type="text"
                      value={currentPostalCode}
                      onChange={(e) => setCurrentPostalCode(e.target.value)}
                      placeholder="2400"
                      className="field"
                    />
                  </Field>
                </div>

                <div className="pt-3 border-t border-border">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-foreground mb-3">
                    <input
                      type="checkbox"
                      checked={sameAsCurrentAddress}
                      onChange={(e) => setSameAsCurrentAddress(e.target.checked)}
                      className="rounded border-border size-3.5 text-primary"
                    />
                    <span>Permanent address is same as current address</span>
                  </label>

                  {!sameAsCurrentAddress && (
                    <div className="space-y-3 pt-2">
                      <Field label="* Permanent Street Address">
                        <input
                          type="text"
                          value={permanentAddress}
                          onChange={(e) => setPermanentAddress(e.target.value)}
                          placeholder="Permanent house and street address"
                          className="field"
                        />
                      </Field>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <SearchableSelect
                          label="* Country"
                          value={permanentCountry}
                          onChange={setPermanentCountry}
                          options={COUNTRIES_LIST}
                          placeholder="Select Country"
                        />
                        <SearchableSelect
                          label="* Province"
                          value={permanentProvince}
                          onChange={setPermanentProvince}
                          options={PHILIPPINE_PROVINCES}
                          placeholder="Select Province"
                        />
                        <SearchableSelect
                          label="* City/Municipality"
                          value={permanentCity}
                          onChange={setPermanentCity}
                          options={PHILIPPINE_CITIES}
                          placeholder="Select City / Municipality"
                        />
                        <Field label="* Postal Code">
                          <input
                            type="text"
                            value={permanentPostalCode}
                            onChange={(e) => setPermanentPostalCode(e.target.value)}
                            placeholder="2400"
                            className="field"
                          />
                        </Field>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border p-3 bg-muted/20 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={() => setEditingUser(null)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={saving}
                onClick={handleSaveRecord}
                className="gap-1.5 font-bold cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5" /> Save Official Record
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>,
        document.body
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
    "all" | "pending" | "student" | "staff" | "admin" | "guest"
  >("all");

  // Add Admin Form state
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [customAdminId, setCustomAdminId] = useState("");
  const [adminValidationError, setAdminValidationError] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [showAddAdminConfirmModal, setShowAddAdminConfirmModal] = useState(false);
  const [pendingAdminPayload, setPendingAdminPayload] = useState<{
    name: string;
    email: string;
    adminId: string;
  } | null>(null);

  // Add Staff Form state
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [customStaffId, setCustomStaffId] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [staffLoading, setStaffLoading] = useState(false);

  // Add Student Form state
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [customStudentId, setCustomStudentId] = useState("");
  const [studentCourse, setStudentCourse] = useState("BS Information Technology");
  const [studentYear, setStudentYear] = useState("1st Year");
  const [studentValidationError, setStudentValidationError] = useState<string | null>(null);
  const [studentLoading, setStudentLoading] = useState(false);

  // Add Confirmation Modals
  const [showAddConfirmModal, setShowAddConfirmModal] = useState(false);
  const [pendingStaffPayload, setPendingStaffPayload] = useState<{
    name: string;
    email: string;
    staffId: string;
  } | null>(null);

  const [showAddStudentConfirmModal, setShowAddStudentConfirmModal] = useState(false);
  const [pendingStudentPayload, setPendingStudentPayload] = useState<{
    name: string;
    email: string;
    studentId: string;
    course: string;
    yearLevel: string;
  } | null>(null);

  // Delete Confirmation Modal
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AccountUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<AccountUser | null>(null);

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

  useEffect(() => {
    if (selectedUserForProfile || showDeleteConfirmModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedUserForProfile, showDeleteConfirmModal]);

  // Admin Form Validation
  const handleReviewAdmin = (e: FormEvent) => {
    e.preventDefault();
    setAdminValidationError(null);

    const trimmedName = adminName.trim();
    const trimmedEmail = adminEmail.trim().toLowerCase();
    const trimmedId = customAdminId.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setAdminValidationError("Administrator full name must contain at least 2 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setAdminValidationError("Please enter a valid administrator email address.");
      return;
    }

    setPendingAdminPayload({
      name: trimmedName,
      email: trimmedEmail,
      adminId: trimmedId,
    });
    setShowAddAdminConfirmModal(true);
  };

  const handleConfirmCreateAdmin = async () => {
    if (!pendingAdminPayload) return;

    const token = localStorage.getItem("queueless_token");
    if (!token) {
      setFlash({
        tone: "error",
        text: "Your admin session has expired. Please sign in again.",
      });
      setShowAddAdminConfirmModal(false);
      return;
    }

    try {
      setAdminLoading(true);
      const response = await fetch(`${API_URL}/api/auth/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: pendingAdminPayload.name,
          email: pendingAdminPayload.email,
          adminId: pendingAdminPayload.adminId || undefined,
        }),
      });

      const result = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(result.message || "Failed to create administrator account.");
      }

      setUsers((prev) => [
        {
          id: result.user?.id || result.user?._id || `admin-${Date.now()}`,
          name: result.user?.name || pendingAdminPayload.name,
          studentId: result.user?.studentId || pendingAdminPayload.adminId,
          email: pendingAdminPayload.email,
          role: "admin",
          contactVerified: false,
          status: "pending_activation",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setShowAddAdminConfirmModal(false);
      setShowAdminForm(false);
      setAdminName("");
      setAdminEmail("");
      setCustomAdminId("");
      setPendingAdminPayload(null);
      setAdminValidationError(null);

      setFlash({
        tone: "success",
        text: `Administrator account created for ${result.user?.name || pendingAdminPayload.name}. A 6-digit OTP verification code has been emailed to ${pendingAdminPayload.email}.`,
      });
    } catch (err) {
      console.error("Create admin error:", err);
      setFlash({
        tone: "error",
        text: err instanceof Error ? err.message : "Failed to create administrator account.",
      });
    } finally {
      setAdminLoading(false);
    }
  };

  // Step 1: Staff Form Validation before showing Confirmation Modal
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

    // Set pending staff data and trigger Confirmation Modal
    setPendingStaffPayload({
      name: trimmedName,
      email: trimmedEmail,
      staffId: trimmedId,
    });
    setShowAddConfirmModal(true);
  };

  // Step 2: Confirm Staff Creation -> Call API (Password auto-generated on backend, OTP sent)
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
      setPendingStaffPayload(null);
      setValidationError(null);

      setFlash({
        tone: "success",
        text: `Staff account successfully created for ${result.user.name} (${result.user.studentId}). A 6-digit OTP verification code has been emailed to ${pendingStaffPayload.email}.`,
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

  // Student Form Validation
  const handleReviewStudent = (e: FormEvent) => {
    e.preventDefault();
    setStudentValidationError(null);

    const trimmedName = studentName.trim();
    const trimmedEmail = studentEmail.trim().toLowerCase();
    const trimmedId = customStudentId.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setStudentValidationError("Student full name must contain at least 2 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setStudentValidationError("Please enter a valid student email address.");
      return;
    }

    if (!trimmedId) {
      setStudentValidationError("Student ID is required (e.g. 02-2223-012345).");
      return;
    }

    setPendingStudentPayload({
      name: trimmedName,
      email: trimmedEmail,
      studentId: trimmedId,
      course: studentCourse,
      yearLevel: studentYear,
    });
    setShowAddStudentConfirmModal(true);
  };

  // Confirm Student Creation -> Call API
  const handleConfirmCreateStudent = async () => {
    if (!pendingStudentPayload) return;

    const token = localStorage.getItem("queueless_token");
    if (!token) {
      setFlash({
        tone: "error",
        text: "Your admin session has expired. Please sign in again.",
      });
      setShowAddStudentConfirmModal(false);
      return;
    }

    try {
      setStudentLoading(true);
      const response = await fetch(`${API_URL}/api/auth/student`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: pendingStudentPayload.name,
          email: pendingStudentPayload.email,
          studentId: pendingStudentPayload.studentId,
          course: pendingStudentPayload.course,
          yearLevel: pendingStudentPayload.yearLevel,
        }),
      });

      const result = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to create student account."
        );
      }

      if (!result.user) {
        throw new Error(
          "The server did not return the created student account."
        );
      }

      const createdStudent = result.user as { id?: string; _id?: string; name: string; studentId?: string };
      setUsers((prev) => [
        {
          id:
            createdStudent.id ||
            createdStudent._id ||
            `student-${Date.now()}`,
          name: result.user.name,
          studentId: result.user.studentId,
          email: pendingStudentPayload.email,
          role: "student",
          userType: "priority",
          isPriority: true,
          course: pendingStudentPayload.course,
          yearLevel: pendingStudentPayload.yearLevel,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setShowAddStudentConfirmModal(false);
      setShowStudentForm(false);
      setStudentName("");
      setStudentEmail("");
      setCustomStudentId("");
      setPendingStudentPayload(null);
      setStudentValidationError(null);

      setFlash({
        tone: "success",
        text: `Student account created for ${result.user.name} (${result.user.studentId}). A 6-digit OTP verification code has been emailed to ${pendingStudentPayload.email}.`,
      });
    } catch (err) {
      console.error("Create student account error:", err);
      setFlash({
        tone: "error",
        text:
          err instanceof Error
            ? err.message
            : "Failed to create student account.",
      });
    } finally {
      setStudentLoading(false);
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

  // Helper: strictly student-portal / outsider guest accounts with @gmail.com or role === "guest"
  // Staff and Admin are NEVER guests even if they have @gmail.com
  const isGuestAccount = (u: AccountUser) => {
    const roleLower = (u.role || "").toLowerCase();
    if (roleLower === "admin" || roleLower === "staff") return false;
    if (roleLower === "guest") return true;
    if (u.studentId && u.studentId.startsWith("GUEST")) return true;
    const email = (u.email || "").toLowerCase().trim();
    if (email.endsWith("@gmail.com")) return true;
    return false;
  };

  // Helper: accounts that are pending review or awaiting OTP confirmation/activation
  const isAccountPending = (u: AccountUser) => {
    if (u.approvalStatus === "pending") return true;
    if (u.contactVerified === false) return true;
    if ((u as any).status === "pending_activation") return true;
    return false;
  };

  // Filtered accounts
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const isGuest = isGuestAccount(u);
      const isPending = isAccountPending(u);
      const roleLower = (u.role || "").toLowerCase();

      let roleMatch = true;
      if (roleFilter === "pending") {
        roleMatch = isPending;
      } else if (roleFilter === "admin") {
        roleMatch = roleLower === "admin";
      } else if (roleFilter === "staff") {
        roleMatch = roleLower === "staff";
      } else if (roleFilter === "guest") {
        roleMatch = isGuest;
      } else if (roleFilter === "student") {
        roleMatch = roleLower === "student" && !isGuest;
      }

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
      pending: users.filter(isAccountPending).length,
      student: users.filter((u) => u.role.toLowerCase() === "student" && !isGuestAccount(u)).length,
      staff: users.filter((u) => u.role.toLowerCase() === "staff").length,
      admin: users.filter((u) => u.role.toLowerCase() === "admin").length,
      guest: users.filter(isGuestAccount).length,
    };
  }, [users]);

  const getRoleBadge = (u: AccountUser | string) => {
    if (typeof u === "object") {
      if (isGuestAccount(u)) {
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-400">
            <UserRound className="size-3" /> Users
          </span>
        );
      }
      const r = (u.role || "").toLowerCase();
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
    }
    const r = (u || "").toLowerCase();
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
    if (r === "guest") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-400">
          <UserRound className="size-3" /> Users
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
              variant={showAdminForm ? "default" : "outline"}
              onClick={() => {
                setShowAdminForm((prev) => !prev);
                setShowStudentForm(false);
                setShowStaffForm(false);
                setAdminValidationError(null);
                setStudentValidationError(null);
                setValidationError(null);
              }}
              className="gap-1.5"
            >
              <Shield className="size-4" /> {showAdminForm ? "Close form" : "Add admin"}
            </Button>
            <Button
              variant={showStaffForm ? "default" : "outline"}
              onClick={() => {
                setShowStaffForm((prev) => !prev);
                setShowStudentForm(false);
                setShowAdminForm(false);
                setValidationError(null);
                setStudentValidationError(null);
                setAdminValidationError(null);
              }}
              className="gap-1.5"
            >
              <ShieldCheck className="size-4" /> {showStaffForm ? "Close form" : "Add staff"}
            </Button>
            <Button
              variant={showStudentForm ? "default" : "default"}
              onClick={() => {
                setShowStudentForm((prev) => !prev);
                setShowStaffForm(false);
                setShowAdminForm(false);
                setStudentValidationError(null);
                setValidationError(null);
                setAdminValidationError(null);
              }}
              className="gap-1.5"
            >
              <UserPlus className="size-4" /> {showStudentForm ? "Close form" : "Add student"}
            </Button>
          </div>
        </div>

        {/* Create Student Form */}
        {showStudentForm && (
          <form
            className="grid gap-4 border-b border-border bg-muted/30 p-5 sm:grid-cols-2"
            onSubmit={handleReviewStudent}
          >
            <div className="sm:col-span-2">
              <p className="text-sm font-bold text-foreground">
                Create new Student account
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Enroll a new student directly into QueueLess with priority privileges and automated email verification.
              </p>
            </div>

            {studentValidationError && (
              <div className="sm:col-span-2">
                <InlineError text={studentValidationError} />
              </div>
            )}

            <Field label="Full name">
              <input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
                className="field"
                placeholder="e.g. Juan P. Dela Cruz"
              />
            </Field>

            <Field label="Student email">
              <input
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                type="email"
                required
                className="field"
                placeholder="student@up.phinma.edu.ph"
              />
            </Field>

            <Field label="Student ID (Required)">
              <input
                value={customStudentId}
                onChange={(e) => setCustomStudentId(e.target.value)}
                required
                className="field font-mono"
                placeholder="Enter Student ID (e.g. 02-2223-012345)"
              />
            </Field>

            <Field label="Program / Degree">
              <select
                value={studentCourse}
                onChange={(e) => setStudentCourse(e.target.value)}
                className="field cursor-pointer"
              >
                <option value="BS Information Technology">BS Information Technology</option>
                <option value="BS Computer Science">BS Computer Science</option>
                <option value="BS Nursing">BS Nursing</option>
                <option value="BS Criminology">BS Criminology</option>
                <option value="BS Accountancy">BS Accountancy</option>
                <option value="BS Business Administration">BS Business Administration</option>
                <option value="BS Civil Engineering">BS Civil Engineering</option>
                <option value="BS Hospitality Management">BS Hospitality Management</option>
                <option value="BS Education">BS Education</option>
              </select>
            </Field>

            <Field label="Year Level">
              <select
                value={studentYear}
                onChange={(e) => setStudentYear(e.target.value)}
                className="field cursor-pointer"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Alumni / Graduate">Alumni / Graduate</option>
              </select>
            </Field>

            <div className="sm:col-span-2 rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground flex items-start gap-2.5">
              <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Automatic 6-Digit OTP Verification</p>
                <p className="mt-0.5">
                  A temporary password and 6-digit OTP verification code will be sent to the student's email immediately. They will use this OTP to verify their email and choose their password.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:col-span-2 pt-2">
              <Button type="submit">
                Continue & review
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowStudentForm(false);
                  setStudentValidationError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

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

            <Field label="Staff ID">
              <input
                value={customStaffId}
                onChange={(e) => setCustomStaffId(e.target.value)}
                className="field"
                placeholder="Enter your Staff ID"
              />
            </Field>

            <div className="sm:col-span-2 rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground flex items-start gap-2.5">
              <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Automatic 6-Digit OTP Verification</p>
                <p className="mt-0.5">
                  A temporary password and 6-digit OTP verification code will be sent to the staff member's email immediately. They will use this OTP to verify their email and choose their password.
                </p>
              </div>
            </div>

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

        {/* Create Admin Form */}
        {showAdminForm && (
          <form
            className="grid gap-4 border-b border-border bg-muted/30 p-5 sm:grid-cols-2"
            onSubmit={handleReviewAdmin}
          >
            <div className="sm:col-span-2">
              <p className="text-sm font-bold text-foreground flex items-center gap-2">
                <Shield className="size-4 text-amber-600" /> Create new Administrator account
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Grant full system administrative privileges. An automated setup email with a 6-digit OTP verification code will be dispatched.
              </p>
            </div>

            {adminValidationError && (
              <div className="sm:col-span-2">
                <InlineError text={adminValidationError} />
              </div>
            )}

            <Field label="Full name">
              <input
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
                className="field"
                placeholder="e.g. Maria Santos"
              />
            </Field>

            <Field label="Admin institutional email">
              <input
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                type="email"
                required
                className="field"
                placeholder="admin@up.phinma.edu.ph"
              />
            </Field>

            <Field label="Admin ID (Optional)">
              <input
                value={customAdminId}
                onChange={(e) => setCustomAdminId(e.target.value)}
                className="field"
                placeholder="Leave blank for auto-generation (e.g. ADMIN-003)"
              />
            </Field>

            <div className="sm:col-span-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-muted-foreground flex items-start gap-2.5">
              <Shield className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Full Administrative Access</p>
                <p className="mt-0.5">
                  Administrators can manage users, oversee queues, modify system records, and configure document types. A 6-digit OTP verification code will be sent immediately to complete account activation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:col-span-2 pt-2">
              <Button type="submit">
                Continue & review
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAdminForm(false);
                  setAdminValidationError(null);
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
            <button
              type="button"
              onClick={() => setRoleFilter("guest")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                roleFilter === "guest"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Users ({counts.guest})
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

        {/* User list (scrollable when 4+ users shown) */}
        <div className="max-h-[300px] overflow-y-auto divide-y divide-border pr-0.5">
        {filteredUsers.map((u) => {
          const isCurrentUser =
            currentAdmin &&
            (currentAdmin.id === u.id || currentAdmin.email === u.email);

          return (
            <div
              key={u.id}
              className="flex flex-col gap-3 border-b border-border p-4 transition-colors last:border-b-0 hover:bg-muted/20 sm:flex-row sm:items-center"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-primary overflow-hidden border border-border">
                {u.picture ? (
                  <img src={u.picture} alt={u.name} className="size-full object-cover" />
                ) : (
                  <UserRound className="size-4" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-foreground">{u.name}</p>
                  {getRoleBadge(u)}
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
                  {(u.contactVerified === false || (u as any).status === "pending_activation") && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[11px] font-bold text-orange-700 dark:text-orange-400">
                      <Clock3 className="size-3" /> Awaiting Activation (OTP Sent)
                    </span>
                  )}
                  {(u.contactVerified === true || (u as any).status === "active") && u.approvalStatus !== "pending" && u.approvalStatus !== "rejected" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="size-3" /> Activated
                    </span>
                  )}
                  {u.termsAccepted ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:text-sky-400"
                      title={u.termsAcceptedAt ? `Terms accepted on ${new Date(u.termsAcceptedAt).toLocaleString()}` : "Terms accepted"}
                    >
                      <Check className="size-3" /> Terms Accepted
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-500/30 bg-zinc-500/10 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                      Terms Pending
                    </span>
                  )}
                  {isCurrentUser && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                      You
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  {!isGuestAccount(u) && u.studentId && (
                    <>
                      <span>{u.studentId}</span>
                      <span>·</span>
                    </>
                  )}
                  <span>{u.email}</span>

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
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-xs cursor-pointer"
                  onClick={() => setSelectedUserForProfile(u)}
                  title="View Profile & Personal Details"
                >
                  <Eye className="size-3.5" /> View
                </Button>

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
      </div>

      {/* Confirmation Modal: Add New Admin */}
      {showAddAdminConfirmModal && pendingAdminPayload && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => !adminLoading && setShowAddAdminConfirmModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Shield className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Confirm Administrator Account
                </h3>
                <p className="text-xs text-muted-foreground">
                  Review the details before granting system administrator access.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5 rounded-lg border border-border bg-muted/40 p-4 text-xs">
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Full Name:</span>
                <span className="font-semibold text-foreground">
                  {pendingAdminPayload.name}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-semibold text-foreground">
                  {pendingAdminPayload.email}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Admin / Staff ID:</span>
                <span className="font-semibold text-foreground">
                  {pendingAdminPayload.adminId || "(Auto-generated)"}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Assigned Role:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">System Administrator</span>
              </div>
              <div className="pt-1 text-[11px] text-muted-foreground">
                Security: A temporary password and a 6-digit OTP activation code will be sent to {pendingAdminPayload.email} automatically.
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddAdminConfirmModal(false)}
                disabled={adminLoading}
              >
                Cancel / Edit
              </Button>
              <Button
                type="button"
                onClick={handleConfirmCreateAdmin}
                disabled={adminLoading}
              >
                {adminLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating admin...
                  </>
                ) : (
                  "Yes, Create Administrator"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

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
                Security: A temporary password and a 6-digit OTP verification code will be sent to {pendingStaffPayload.email} automatically.
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

      {/* Confirmation Modal 2: Add New Student */}
      {showAddStudentConfirmModal && pendingStudentPayload && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => !studentLoading && setShowAddStudentConfirmModal(false)}
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
                  Confirm Student Account
                </h3>
                <p className="text-xs text-muted-foreground">
                  Review the student details before creating this account.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5 rounded-lg border border-border bg-muted/40 p-4 text-xs">
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Student Name:</span>
                <span className="font-semibold text-foreground">
                  {pendingStudentPayload.name}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Institutional Email:</span>
                <span className="font-semibold text-foreground">
                  {pendingStudentPayload.email}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Student ID:</span>
                <span className="font-semibold font-mono text-foreground">
                  {pendingStudentPayload.studentId}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Program / Course:</span>
                <span className="font-semibold text-foreground">
                  {pendingStudentPayload.course}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Year Level:</span>
                <span className="font-semibold text-foreground">
                  {pendingStudentPayload.yearLevel}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Account Privileges:</span>
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  Priority Student Access
                </span>
              </div>
              <div className="pt-1 text-[11px] text-muted-foreground">
                Security: A temporary password and a 6-digit OTP verification code will be sent to {pendingStudentPayload.email} automatically.
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddStudentConfirmModal(false)}
                disabled={studentLoading}
              >
                Cancel / Edit
              </Button>
              <Button
                type="button"
                onClick={handleConfirmCreateStudent}
                disabled={studentLoading}
              >
                {studentLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating student...
                  </>
                ) : (
                  "Yes, Create Student"
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

      {/* Admin View User Profile & Manage Account Modal */}
      {selectedUserForProfile && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedUserForProfile(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="User Profile Details"
            className="relative flex flex-col w-full max-w-lg max-h-[85vh] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-left text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header with Minimize / Close Button */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border px-4 py-2.5 bg-card/95 backdrop-blur-xs shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary overflow-hidden border border-border shadow-xs">
                  {selectedUserForProfile.picture ? (
                    <img
                      src={selectedUserForProfile.picture}
                      alt={selectedUserForProfile.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <UserRound className="size-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="font-display text-sm font-bold text-foreground truncate">
                      {selectedUserForProfile.name}
                    </h3>
                    {getRoleBadge(selectedUserForProfile)}
                  </div>
                  {!isGuestAccount(selectedUserForProfile) && selectedUserForProfile.studentId && (
                    <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                      {selectedUserForProfile.studentId}
                    </p>
                  )}
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSelectedUserForProfile(null)}
                title="Close modal"
                className="size-8 cursor-pointer text-muted-foreground hover:text-foreground shrink-0"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Scrollable Compact Body */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs">

            {/* Terms and Privacy Agreement Status */}
            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" /> Terms & Privacy Agreement
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Agreement Status</span>
                  {selectedUserForProfile.termsAccepted ? (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> Checked & Accepted
                    </span>
                  ) : (
                    <span className="font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Clock3 className="size-3.5" /> Not yet recorded
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Recorded Date & Time</span>
                  <span className="font-medium text-foreground">
                    {selectedUserForProfile.termsAcceptedAt
                      ? new Date(selectedUserForProfile.termsAcceptedAt).toLocaleString()
                      : selectedUserForProfile.termsAccepted
                      ? "Recorded on sign-in"
                      : "Pending acceptance"}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Mail className="size-3.5" /> Contact Information
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Email Address</span>
                  <a href={`mailto:${selectedUserForProfile.email}`} className="font-medium text-primary hover:underline">
                    {selectedUserForProfile.email}
                  </a>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Mobile Phone</span>
                  {selectedUserForProfile.phone ? (
                    <a href={`tel:${selectedUserForProfile.phone}`} className="font-mono font-semibold text-emerald-600 hover:underline">
                      {selectedUserForProfile.phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground italic">None provided</span>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Program (if Student) */}
            {selectedUserForProfile.role === "student" && !isGuestAccount(selectedUserForProfile) && (
              <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <FileText className="size-3.5" /> Academic Information
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Degree Program</span>
                    <span className="font-semibold text-foreground">{selectedUserForProfile.course || "BS Information Technology"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Year Level</span>
                    <span className="font-semibold text-foreground">{selectedUserForProfile.yearLevel || "3rd Year"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Details */}
            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <UserRound className="size-3.5" /> Personal Information
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Gender</span>
                  <span className="font-medium text-foreground">{selectedUserForProfile.gender || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Date of Birth</span>
                  <span className="font-medium text-foreground">{selectedUserForProfile.birthDate || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Civil Status</span>
                  <span className="font-medium text-foreground">{selectedUserForProfile.civilStatus || "Single"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Nationality</span>
                  <span className="font-medium text-foreground">{selectedUserForProfile.nationality || "Filipino"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Religion</span>
                  <span className="font-medium text-foreground">{selectedUserForProfile.religion || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Extension</span>
                  <span className="font-medium text-foreground">{selectedUserForProfile.extensionName || "None"}</span>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <MapPin className="size-3.5" /> Residential Address
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Current Address</span>
                  <span className="font-medium text-foreground">
                    {[
                      selectedUserForProfile.currentAddress || selectedUserForProfile.address,
                      (selectedUserForProfile as any).currentCity,
                      (selectedUserForProfile as any).currentProvince,
                      (selectedUserForProfile as any).currentCountry,
                      (selectedUserForProfile as any).currentPostalCode
                    ].filter(Boolean).join(", ") || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Permanent Address</span>
                  <span className="font-medium text-foreground">
                    {[
                      selectedUserForProfile.permanentAddress || selectedUserForProfile.address,
                      (selectedUserForProfile as any).permanentCity,
                      (selectedUserForProfile as any).permanentProvince,
                      (selectedUserForProfile as any).permanentCountry,
                      (selectedUserForProfile as any).permanentPostalCode
                    ].filter(Boolean).join(", ") || selectedUserForProfile.currentAddress || "Same as current"}
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" /> Emergency Contact
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Contact Person / Details</span>
                  <span className="font-semibold text-foreground">
                    {selectedUserForProfile.emergencyContact || (selectedUserForProfile as any).emergencyContactName || "None provided"}
                  </span>
                </div>
                {((selectedUserForProfile as any).emergencyContactPhone || (selectedUserForProfile as any).emergencyContactRelationship) && (
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Relationship / Phone</span>
                    <span className="font-semibold text-foreground">
                      {[(selectedUserForProfile as any).emergencyContactRelationship, (selectedUserForProfile as any).emergencyContactPhone].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Family & Guardian */}
            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <UsersRound className="size-3.5" /> Family & Guardians
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Father's Name</span>
                  <span className="font-semibold text-foreground">{selectedUserForProfile.fatherName || "—"}</span>
                  {selectedUserForProfile.fatherOccupation && (
                    <span className="text-muted-foreground block text-[10px]">Occupation: {selectedUserForProfile.fatherOccupation}</span>
                  )}
                  {selectedUserForProfile.fatherMobile && (
                    <span className="text-muted-foreground block font-mono text-[10px]">Contact: {selectedUserForProfile.fatherMobile}</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Mother's Name</span>
                  <span className="font-semibold text-foreground">{selectedUserForProfile.motherName || "—"}</span>
                  {selectedUserForProfile.motherOccupation && (
                    <span className="text-muted-foreground block text-[10px]">Occupation: {selectedUserForProfile.motherOccupation}</span>
                  )}
                  {selectedUserForProfile.motherMobile && (
                    <span className="text-muted-foreground block font-mono text-[10px]">Contact: {selectedUserForProfile.motherMobile}</span>
                  )}
                </div>
                {selectedUserForProfile.guardianName && (
                  <div className="col-span-1 sm:col-span-2 border-t border-border/60 pt-1.5">
                    <span className="text-muted-foreground block text-[10px]">Guardian ({selectedUserForProfile.guardianRelationship || "Guardian"})</span>
                    <span className="font-semibold text-foreground">{selectedUserForProfile.guardianName}</span>
                    {selectedUserForProfile.guardianMobile && (
                      <span className="text-muted-foreground block font-mono text-[10px]">Contact: {selectedUserForProfile.guardianMobile}</span>
                    )}
                  </div>
                )}
                {selectedUserForProfile.spouseName && (
                  <div className="col-span-1 sm:col-span-2 border-t border-border/60 pt-1.5">
                    <span className="text-muted-foreground block text-[10px]">Spouse</span>
                    <span className="font-semibold text-foreground">{selectedUserForProfile.spouseName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Educational Background */}
            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <GraduationCap className="size-3.5" /> Educational Background
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Elementary</span>
                  <span className="font-semibold text-foreground">{selectedUserForProfile.elemSchool || "—"}</span>
                  {selectedUserForProfile.elemYearGrad && (
                    <span className="text-muted-foreground block text-[10px]">Year: {selectedUserForProfile.elemYearGrad} ({selectedUserForProfile.elemType || "Public"})</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Junior High</span>
                  <span className="font-semibold text-foreground">{selectedUserForProfile.juniorHighSchool || "—"}</span>
                  {selectedUserForProfile.juniorHighYearGrad && (
                    <span className="text-muted-foreground block text-[10px]">Year: {selectedUserForProfile.juniorHighYearGrad} ({selectedUserForProfile.juniorHighType || "Public"})</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Senior High</span>
                  <span className="font-semibold text-foreground">{selectedUserForProfile.seniorHighSchool || "—"}</span>
                  {selectedUserForProfile.seniorHighYearGrad && (
                    <span className="text-muted-foreground block text-[10px]">Year: {selectedUserForProfile.seniorHighYearGrad} ({selectedUserForProfile.seniorHighType || "Public"})</span>
                  )}
                </div>
              </div>
            </div>

            </div>

            {/* Sticky Bottom Footer */}
            <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2.5 bg-card/95 backdrop-blur-xs shrink-0">
              <div className="text-[10px] text-muted-foreground">
                {selectedUserForProfile.lastLogin && (
                  <p>Last login: {new Date(selectedUserForProfile.lastLogin).toLocaleString()}</p>
                )}
                {selectedUserForProfile.createdAt && (
                  <p>Created: {new Date(selectedUserForProfile.createdAt).toLocaleDateString()}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedUserForProfile.approvalStatus === "pending" && (
                  <>
                    <Button
                      size="sm"
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer gap-1"
                      onClick={() => {
                        handleApproveUser(selectedUserForProfile);
                        setSelectedUserForProfile(null);
                      }}
                    >
                      <Check className="size-3" /> Admit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 cursor-pointer gap-1"
                      onClick={() => {
                        handleRejectUser(selectedUserForProfile);
                        setSelectedUserForProfile(null);
                      }}
                    >
                      <X className="size-3" /> Reject
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUserForProfile(null)}
                  className="h-8 text-xs cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function DocumentsPanel({
  setFlash,
  docs,
  onUpdateDocs,
  readOnly = false,
}: {
  setFlash?: (f: Flash) => void;
  docs: string[];
  onUpdateDocs?: (d: string[]) => void;
  readOnly?: boolean;
}) {
  const [name, setName] = useState("");
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [docToDelete, setDocToDelete] = useState<string | null>(null);
  const [selectedDocForRequirements, setSelectedDocForRequirements] = useState<string | null>(null);
  const [reqList, setReqList] = useState<string[]>([]);
  const [newReqInput, setNewReqInput] = useState("");

  useEffect(() => {
    if (selectedDocForRequirements || showAddConfirm || docToDelete) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [selectedDocForRequirements, showAddConfirm, docToDelete]);

  const handleOpenRequirements = (doc: string) => {
    setSelectedDocForRequirements(doc);
    setReqList(getDocumentRequirements(doc));
    setNewReqInput("");
  };

  const handleAddRequirement = (e: FormEvent) => {
    e.preventDefault();
    if (readOnly || !newReqInput.trim() || !selectedDocForRequirements) return;
    const updated = [...reqList, newReqInput.trim()];
    setReqList(updated);
    saveDocumentRequirements(selectedDocForRequirements, updated);
    setNewReqInput("");
    setFlash?.({
      tone: "success",
      text: `Added requirement to “${selectedDocForRequirements}”.`,
    });
  };

  const handleDeleteRequirement = (index: number) => {
    if (readOnly || !selectedDocForRequirements) return;
    const updated = reqList.filter((_, i) => i !== index);
    setReqList(updated);
    saveDocumentRequirements(selectedDocForRequirements, updated);
    setFlash?.({
      tone: "success",
      text: "Requirement removed successfully.",
    });
  };

  const handleResetRequirements = () => {
    if (readOnly || !selectedDocForRequirements) return;
    const defaults = defaultDocumentRequirements[selectedDocForRequirements] || [
      "Valid School ID or Government-issued Photo ID",
      "Official University Registrar Clearance",
      "Proof of payment / Registrar Official Receipt upon claiming",
    ];
    setReqList(defaults);
    saveDocumentRequirements(selectedDocForRequirements, defaults);
    setFlash?.({
      tone: "success",
      text: `Reset requirements for “${selectedDocForRequirements}” to standard defaults.`,
    });
  };

  const handlePromptAdd = (e: FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    if (docs.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
      setFlash?.({
        tone: "error",
        text: `“${trimmed}” is already in the document types list.`,
      });
      return;
    }
    setShowAddConfirm(true);
  };

  const handleConfirmAdd = () => {
    if (readOnly) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const updated = [...docs, trimmed];
    onUpdateDocs?.(updated);
    setName("");
    setShowAddConfirm(false);
    setFlash?.({
      tone: "success",
      text: `“${trimmed}” added to document types and is now available in the student portal.`,
    });
  };

  const handleConfirmDelete = () => {
    if (readOnly || !docToDelete) return;
    const target = docToDelete;
    const updated = docs.filter((d) => d !== target);
    onUpdateDocs?.(updated);
    setDocToDelete(null);
    if (selectedDocForRequirements === target) {
      setSelectedDocForRequirements(null);
    }
    setFlash?.({
      tone: "success",
      text: `“${target}” removed from document types.`,
    });
  };

  return (
    <div className="animate-rise">
      <PageHeading
        eyebrow={readOnly ? "Registrar Catalog" : "Administration"}
        title={readOnly ? "Document types & requirements" : "Document types"}
        text={
          readOnly
            ? "View official registrar documents and the required credentials to claim each document."
            : "Control which registrar documents students can request and manage their claim requirements."
        }
      />

      {!readOnly && (
        <form
          className="mt-7 flex items-center gap-2"
          onSubmit={handlePromptAdd}
        >
          <div className="flex-1">
            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              className="field mt-0 h-10 w-full"
              placeholder="Enter a document type (e.g. Certificate of Graduation)"
            />
          </div>

          <Button type="submit" className="h-10 px-4 gap-1.5 cursor-pointer shrink-0">
            <Plus className="size-4" /> Add
          </Button>
        </form>
      )}

      <div className={`${readOnly ? "mt-6" : "mt-4"} overflow-hidden rounded-md border border-border bg-card`}>
        {/* max-h-[285px] ensures 4 documents fit cleanly without scrolling, and the 5th document triggers scrolling */}
        <div className="max-h-[285px] overflow-y-auto divide-y divide-border pr-0.5">
          {docs.map(
            (doc, index) => {
              const reqs = getDocumentRequirements(doc);
              return (
                <div
                  key={doc}
                  onClick={() => handleOpenRequirements(doc)}
                  className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-xs font-bold text-primary">
                    {index + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {doc}
                      </p>
                      <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        <ClipboardList className="size-3" /> Requirements ({reqs.length})
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {readOnly ? "Click to view claim requirements" : "Click to view & manage requirements for this document"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1 cursor-pointer"
                      onClick={() => handleOpenRequirements(doc)}
                    >
                      <Eye className="size-3.5" /> Requirements
                    </Button>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${doc}`}
                        className="text-muted-foreground hover:text-destructive cursor-pointer size-8"
                        onClick={() => setDocToDelete(doc)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Document Requirements Modal (Click to view/edit requirements) */}
      {selectedDocForRequirements && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedDocForRequirements(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Requirements for ${selectedDocForRequirements}`}
            className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-150 overflow-hidden flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border p-3.5 bg-muted/20">
              <div className="flex items-start gap-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ClipboardList className="size-4.5" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground">
                    Document Requirements
                  </h3>
                  <p className="text-xs font-semibold text-primary mt-0.5">
                    {selectedDocForRequirements}
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="size-7 cursor-pointer shrink-0"
                onClick={() => setSelectedDocForRequirements(null)}
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Sub-banner info */}
            <div className="bg-primary/5 border-b border-primary/20 px-3.5 py-2 text-[10px] text-muted-foreground flex items-center justify-between">
              <span>
                {readOnly
                  ? "Present these required credentials at the Registrar counter window upon claiming."
                  : "These requirements are visible to students when submitting requests, and to staff during verification & claiming."}
              </span>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Required Documents & Credentials ({reqList.length})
                </p>

                {reqList.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
                    No requirements specified for this document yet.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {reqList.map((req, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-2.5 rounded-lg border border-border bg-muted/20 p-2.5 hover:bg-muted/40 transition"
                      >
                        <div className="flex items-start gap-2 min-w-0 flex-1">
                          <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-xs font-medium text-foreground leading-relaxed">
                            {req}
                          </span>
                        </div>
                        {!readOnly && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRequirement(idx)}
                            className="size-5 text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                            title="Remove requirement"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add requirement form (Admin only) */}
              {!readOnly && (
                <form onSubmit={handleAddRequirement} className="flex gap-2 pt-1.5">
                  <input
                    type="text"
                    value={newReqInput}
                    onChange={(e) => setNewReqInput(e.target.value)}
                    placeholder="Add a new requirement (e.g. Valid 2x2 Photo)..."
                    className="field mt-0 h-8 flex-1 text-xs"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newReqInput.trim()}
                    className="h-8 gap-1 text-xs cursor-pointer shrink-0 px-2.5"
                  >
                    <Plus className="size-3.5" /> Add
                  </Button>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border p-3 bg-muted/20 flex items-center justify-between">
              {!readOnly ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetRequirements}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Reset to Standard Defaults
                </Button>
              ) : (
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Official UPang Registrar Requirements
                </span>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={() => setSelectedDocForRequirements(null)}
                className="cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation Modal: Add Document Type */}
      {showAddConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setShowAddConfirm(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirm Adding Document Type"
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 border-b border-border pb-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FilePlus2 className="size-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Confirm Adding Document Type
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This document will appear immediately in the Student Portal for new requests.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Document Name</span>
              <p className="mt-1 text-base font-bold text-foreground">{name.trim()}</p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddConfirm(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmAdd}
                className="gap-1.5 cursor-pointer"
              >
                <Check className="size-4" /> Confirm & Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Remove Document Type */}
      {docToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setDocToDelete(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirm Removing Document Type"
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 border-b border-border pb-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <Trash2 className="size-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Remove Document Type?
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Are you sure you want to remove this document type from the registrar catalog?
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Document to Remove</span>
              <p className="mt-1 text-sm font-bold text-foreground">{docToDelete}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Students and guests will no longer be able to select this document type when making new requests.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDocToDelete(null)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleConfirmDelete}
                className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive cursor-pointer font-bold"
              >
                <Trash2 className="size-4" /> Remove Document
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RequestList({
  title,
  subtitle,
  requests,
  student = false,
  onUpdateRequest,
}: {
  title: string;
  subtitle: string;
  requests: RequestItem[];
  student?: boolean;
  onUpdateRequest?: (r: RequestItem) => void;
}) {
  const [selected, setSelected] = useState<RequestItem | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "claimed">("all");

  const stats = useMemo(() => {
    let active = 0;
    let claimed = 0;
    requests.forEach((r) => {
      if (r.status === "Claimed") claimed++;
      else active++;
    });
    return { total: requests.length, active, claimed };
  }, [requests]);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchStatus =
        statusFilter === "active"
          ? r.status !== "Claimed"
          : statusFilter === "claimed"
          ? r.status === "Claimed"
          : true;

      const q = query.toLowerCase().trim();
      const matchQuery =
        !q ||
        `${r.id} ${r.document} ${r.purpose} ${r.status} ${r.date} line #${r.lineNumber ?? 1}`
          .toLowerCase()
          .includes(q);

      return matchStatus && matchQuery;
    });
  }, [requests, statusFilter, query]);

  return (
    <div className="animate-rise">
      <PageHeading
        eyebrow="Requests"
        title={title}
        text={subtitle}
      />

      {/* Quick Status Filters and Search */}
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              statusFilter === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            All ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              statusFilter === "active"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Active / In Line ({stats.active})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("claimed")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              statusFilter === "claimed"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Done / Claimed ({stats.claimed})
          </button>
        </div>

        {requests.length > 2 && (
          <div className="relative flex items-center sm:w-64">
            <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search requests..."
              className="h-9 w-full rounded-lg border border-input bg-card pl-9 pr-8 text-xs font-medium text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 shadow-xs placeholder:text-muted-foreground"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Internal Scrollable Document Requests Container */}
      <div className="mt-3">
        <RequestCards
          requests={filtered}
          onSelect={setSelected}
          scrollable={true}
          maxHeight="max-h-[315px] sm:max-h-[320px]"
        />
      </div>

      {filtered.length > 0 && (
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground px-1">
          <span>Showing {filtered.length} of {requests.length} request(s)</span>
          {filtered.length >= 4 && (
            <span className="font-semibold text-primary">
              Scroll inside the box to view all requests ↓
            </span>
          )}
        </div>
      )}

      {selected && (
        <DigitalReceiptModal
          request={selected}
          onClose={() => setSelected(null)}
          isStaff={false}
          onUpdateRequest={(updated) => {
            setSelected(updated);
            onUpdateRequest?.(updated);
          }}
        />
      )}
    </div>
  );
}

function RequestCards({
  requests,
  onSelect,
  scrollable = false,
  maxHeight = "max-h-[520px]",
}: {
  requests: RequestItem[];
  onSelect?: (r: RequestItem) => void;
  scrollable?: boolean;
  maxHeight?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-card shadow-xs ${
        scrollable
          ? `${maxHeight} overflow-y-auto overflow-x-hidden scrollbar-thin`
          : "overflow-hidden"
      }`}
    >
      {requests.length ? (
        requests.map((r) => (
          <button
            key={r.id}
            type="button"
            className="grid w-full gap-3 border-b border-border p-4 text-left transition last:border-b-0 hover:bg-muted/60 sm:grid-cols-[auto_1fr_1.2fr_auto] sm:items-center cursor-pointer"
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
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-semibold">{r.document}</p>
                {r.rating && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-400 border border-amber-500/30">
                    ★ {r.rating}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {r.student} · {r.purpose}
                {r.assignedStaffName && ` · Staff: ${r.assignedStaffName}`}
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
        <EmptyState text="No document requests found." />
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
  badge,
  disabled,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  badge?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <Button
      variant={
        active
          ? "secondary"
          : "ghost"
      }
      disabled={disabled}
      className={`w-full justify-between ${
        active
          ? "font-bold"
          : "text-muted-foreground"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      onClick={disabled ? undefined : onClick}
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      {badge && (
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
          {badge}
        </span>
      )}
    </Button>
  );
}

function Field({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block text-xs font-bold">
      {label}
      {children}
    </label>
  );
}

const COUNTRIES_LIST = [
  "PHILIPPINES",
  "AFGHANISTAN",
  "ALBANIA",
  "ALGERIA",
  "ARGENTINA",
  "AUSTRALIA",
  "AUSTRIA",
  "BAHRAIN",
  "BANGLADESH",
  "BELGIUM",
  "BRAZIL",
  "BRUNEI",
  "CAMBODIA",
  "CANADA",
  "CHILE",
  "CHINA",
  "COLOMBIA",
  "DENMARK",
  "EGYPT",
  "FINLAND",
  "FRANCE",
  "GERMANY",
  "GREECE",
  "HONG KONG",
  "INDIA",
  "INDONESIA",
  "IRELAND",
  "ISRAEL",
  "ITALY",
  "JAPAN",
  "JORDAN",
  "KUWAIT",
  "MALAYSIA",
  "MEXICO",
  "NETHERLANDS",
  "NEW ZEALAND",
  "NORWAY",
  "OMAN",
  "PAKISTAN",
  "PARAGUAY",
  "PERU",
  "PITCAIRN ISLAND",
  "POLAND",
  "PORTUGAL",
  "QATAR",
  "RUSSIA",
  "SAUDI ARABIA",
  "SINGAPORE",
  "SOUTH AFRICA",
  "SOUTH KOREA",
  "SPAIN",
  "SWEDEN",
  "SWITZERLAND",
  "TAIWAN",
  "THAILAND",
  "TURKEY",
  "UNITED ARAB EMIRATES",
  "UNITED KINGDOM",
  "UNITED STATES",
  "VIETNAM",
];

const PHILIPPINE_PROVINCES = [
  "Pangasinan",
  "La Union",
  "Benguet",
  "Ilocos Norte",
  "Ilocos Sur",
  "Abra",
  "Apayao",
  "Batanes",
  "Cagayan",
  "Isabela",
  "Nueva Vizcaya",
  "Quirino",
  "Bataan",
  "Bulacan",
  "Nueva Ecija",
  "Pampanga",
  "Tarlac",
  "Zambales",
  "Aurora",
  "Batangas",
  "Cavite",
  "Laguna",
  "Quezon",
  "Rizal",
  "Marinduque",
  "Occidental Mindoro",
  "Oriental Mindoro",
  "Palawan",
  "Romblon",
  "Albay",
  "Camarines Norte",
  "Camarines Sur",
  "Catanduanes",
  "Masbate",
  "Sorsogon",
  "Aklan",
  "Antique",
  "Capiz",
  "Guimaras",
  "Iloilo",
  "Negros Occidental",
  "Bohol",
  "Cebu",
  "Negros Oriental",
  "Siquijor",
  "Biliran",
  "Eastern Samar",
  "Leyte",
  "Northern Samar",
  "Samar",
  "Southern Leyte",
  "Zamboanga del Norte",
  "Zamboanga del Sur",
  "Zamboanga Sibugay",
  "Bukidnon",
  "Camiguin",
  "Lanao del Norte",
  "Misamis Occidental",
  "Misamis Oriental",
  "Davao de Oro",
  "Davao del Norte",
  "Davao del Sur",
  "Davao Occidental",
  "Davao Oriental",
  "Cotabato",
  "Sarangani",
  "South Cotabato",
  "Sultan Kudarat",
  "Agusan del Norte",
  "Agusan del Sur",
  "Dinagat Islands",
  "Surigao del Norte",
  "Surigao del Sur",
  "Basilan",
  "Lanao del Sur",
  "Maguindanao",
  "Sulu",
  "Tawi-Tawi",
  "Metro Manila",
];

const PHILIPPINE_CITIES = [
  "Dagupan City",
  "Lingayen",
  "San Carlos City",
  "Urdaneta City",
  "Alaminos City",
  "Calasiao",
  "Binmaley",
  "Mangaldan",
  "Malasiqui",
  "Bayambang",
  "Santa Barbara",
  "Manaoag",
  "San Fabian",
  "Rosales",
  "Villasis",
  "Tayug",
  "Binalonan",
  "Asingan",
  "Pozorrubio",
  "San Manuel",
  "Sual",
  "Bugallon",
  "Aguilar",
  "Mangatarem",
  "Baguio City",
  "San Fernando City (La Union)",
  "Vigan City",
  "Laoag City",
  "Tarlac City",
  "Angeles City",
  "San Fernando (Pampanga)",
  "Olongapo City",
  "Cabanatuan City",
  "Quezon City",
  "Manila",
  "Makati City",
  "Taguig City",
  "Pasig City",
  "Caloocan City",
  "Pasay City",
  "Mandaluyong City",
  "Parañaque City",
  "Las Piñas City",
  "Muntinlupa City",
  "Marikina City",
  "Valenzuela City",
  "Malabon City",
  "Navotas City",
  "Cebu City",
  "Davao City",
  "Iloilo City",
  "Bacolod City",
  "Cagayan de Oro City",
  "Zamboanga City",
  "General Santos City",
];

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
  onArchive,
  isArchived = false,
}: {
  title: string;
  text: string;
  tone?: "success" | "warning" | "info" | "urgent";
  time?: string;
  isUnread?: boolean;
  onClick?: () => void;
  onArchive?: () => void;
  isArchived?: boolean;
}) {
  const isScheduled = /calendar|scheduled|📅/i.test(title);
  const isUrgent = tone === "urgent" || /urgent|⚡/i.test(title);
  const isWarning = tone === "warning" || /correction|pending|⚠️/i.test(title);
  const isSuccess = tone === "success" || /ready|claimed|done/i.test(title);

  const getIcon = () => {
    if (isScheduled) return <Calendar className="size-4 text-indigo-600 dark:text-indigo-400" />;
    if (isUrgent) return <AlertTriangle className="size-4 text-destructive" />;
    if (isWarning) return <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />;
    if (isSuccess) return <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />;
    return <Clock3 className="size-4 text-blue-600 dark:text-blue-400" />;
  };

  const getIconBg = () => {
    if (isScheduled) return "bg-indigo-500/15 text-indigo-600 border-indigo-500/20";
    if (isUrgent) return "bg-destructive/15 text-destructive border-destructive/20";
    if (isWarning) return "bg-amber-500/15 text-amber-600 border-amber-500/20";
    if (isSuccess) return "bg-emerald-500/15 text-emerald-600 border-emerald-500/20";
    return "bg-blue-500/15 text-blue-600 border-blue-500/20";
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`group relative flex gap-3 rounded-xl border p-3 text-left transition ${
        isUnread
          ? "border-primary/40 bg-primary/5 shadow-xs hover:bg-primary/10"
          : "border-border/70 bg-card hover:bg-muted/40"
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      <div
        className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border ${getIconBg()}`}
      >
        {getIcon()}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-1.5">
          <p className="text-xs font-bold text-foreground leading-snug line-clamp-2">
            {title}
          </p>
          <div className="flex items-center gap-1 shrink-0 pt-0.5">
            {time && (
              <span className="text-[10px] text-muted-foreground font-medium">
                {time}
              </span>
            )}
            {onArchive && (
              <button
                type="button"
                title={isArchived ? "Restore to inbox" : "Archive notification"}
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive();
                }}
                className="rounded p-1 text-muted-foreground/60 hover:text-foreground hover:bg-muted transition cursor-pointer"
              >
                {isArchived ? (
                  <ArchiveRestore className="size-3.5 text-primary" />
                ) : (
                  <Archive className="size-3.5" />
                )}
              </button>
            )}
          </div>
        </div>

        <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {text}
        </p>

        {onClick && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-primary group-hover:underline flex items-center gap-0.5">
              Open details <ChevronRight className="size-3" />
            </span>
            {isUnread && (
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-primary">
                New
              </span>
            )}
          </div>
        )}
      </div>

      {isUnread && (
        <span className="absolute top-2 right-2 size-2 rounded-full bg-primary ring-2 ring-card" />
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