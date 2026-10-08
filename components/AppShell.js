"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserRound,
  Megaphone,
  BarChart3,
  FileText,
  BriefcaseBusiness,
  Bot,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  LogOut,
  CircleHelp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../lib/firebase";
import styles from "./AppShell.module.css";

const agencyNavigation = [
  {
    section: "WORKSPACE",
    items: [
      {
        label: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
      },
      {
        label: "Clients",
        href: "/clients",
        icon: Users,
      },
      {
        label: "Client Users",
        href: "/client-users",
        icon: UserRound,
      },
      {
        label: "Campaigns",
        href: "/campaigns",
        icon: Megaphone,
      },
      {
        label: "Analytics",
        href: "/analytics",
        icon: BarChart3,
      },
      {
        label: "Reports",
        href: "/reports",
        icon: FileText,
      },
      {
        label: "CRM",
        href: "/crm",
        icon: BriefcaseBusiness,
      },
    ],
  },
  {
    section: "AI TOOLS",
    items: [
      {
        label: "MR.A",
        href: "/mr-a",
        icon: Bot,
      },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

const clientNavigation = [
  {
    section: "CLIENT WORKSPACE",
    items: [
      {
        label: "Dashboard",
        href: "/client-dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Campaigns",
        href: "/campaigns",
        icon: Megaphone,
      },
      {
        label: "Analytics",
        href: "/analytics",
        icon: BarChart3,
      },
      {
        label: "Reports",
        href: "/reports",
        icon: FileText,
      },
    ],
  },
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!currentUser) {
          setUser(null);
          setUserData(null);
          setAuthLoading(false);

          if (pathname !== "/login") {
            router.replace("/login");
          }

          return;
        }

        setUser(currentUser);

        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.error("ANIX AI user profile not found.");

          await signOut(auth);
          router.replace("/login");
          return;
        }

        const data = userSnap.data();

        const role = String(data.role || "").toLowerCase();
        const accountType = String(data.accountType || "").toLowerCase();
        const status = String(data.status || "").toLowerCase();

        const profile = {
          name:
            data.name ||
            currentUser.displayName ||
            currentUser.email?.split("@")[0] ||
            "User",

          email: data.email || currentUser.email || "",

          role,
          accountType,
          status,

          clientId: data.clientId || "",
          clientName: data.clientName || "",
        };

        setUserData(profile);

        if (status !== "active") {
          await signOut(auth);
          router.replace("/login");
          return;
        }

        if (accountType === "client") {
          if (
            pathname !== "/client-dashboard" &&
            pathname !== "/login"
          ) {
            router.replace("/client-dashboard");
            return;
          }
        }

        setAuthLoading(false);
      } catch (error) {
        console.error("AppShell authentication error:", error);
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      setProfileOpen(false);
      setMobileOpen(false);

      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);

      alert("Unable to sign out. Please try again.");
    }
  };

  const userName =
    userData?.name ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Administrator";

  const userEmail =
    userData?.email ||
    user?.email ||
    "";

  const isClient = userData?.accountType === "client";

  const navigation = isClient
    ? clientNavigation
    : agencyNavigation;

  const displayRole = isClient
    ? userData?.role || "viewer"
    : "Administrator";

  const workspaceName = isClient
    ? userData?.clientName || "Client Workspace"
    : "CGD Media";

  if (authLoading && pathname !== "/login") {
    return (
      <div className={styles.authLoading}>
        <div className={styles.authLoadingLogo}>A</div>
        <p>Loading ANIX AI...</p>
      </div>
    );
  }

  return (
    <div className={styles.shell}>

      {/* SIDEBAR */}
      <aside
        className={`${styles.sidebar} ${
          mobileOpen ? styles.sidebarOpen : ""
        }`}
      >

        {/* BRAND */}
        <div className={styles.brand}>

          <div className={styles.brandLogo}>
            A
          </div>

          <div className={styles.brandText}>
            <strong>ANIX AI</strong>
            <span>Powered by CGD Media</span>
          </div>

          <button
            className={styles.mobileClose}
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>

        </div>

        {/* NAVIGATION */}
        <div className={styles.sidebarContent}>

          <div className={styles.workspaceLabel}>
            {isClient
              ? workspaceName.toUpperCase()
              : "AGENCY WORKSPACE"}
          </div>

          {navigation.map((group) => (
            <div
              className={styles.navGroup}
              key={group.section}
            >

              <div className={styles.sectionTitle}>
                {group.section}
              </div>

              {group.items.map((item) => {
                const Icon = item.icon;

                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    href={item.href}
                    key={item.href}
                    className={`${styles.navItem} ${
                      active ? styles.active : ""
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon
                      size={19}
                      strokeWidth={1.8}
                    />

                    <span>{item.label}</span>

                    {item.href === "/mr-a" && (
                      <span className={styles.aiDot} />
                    )}
                  </Link>
                );
              })}

            </div>
          ))}

        </div>

        {/* SIDEBAR BOTTOM */}
        <div className={styles.sidebarBottom}>

          <div className={styles.helpCard}>
            <div className={styles.helpIcon}>
              <CircleHelp size={17} />
            </div>

            <div>
              <strong>Need help?</strong>
              <span>Enter MR.A</span>
            </div>
          </div>

          <div className={styles.agencyCard}>

            <div className={styles.agencyLogo}>
              {isClient
                ? workspaceName.charAt(0).toUpperCase()
                : "CGD"}
            </div>

            <div className={styles.agencyText}>
              <strong>{workspaceName}</strong>

              <span>
                {isClient
                  ? `${displayRole.charAt(0).toUpperCase()}${displayRole.slice(
                      1
                    )} Workspace`
                  : "Agency Workspace"}
              </span>
            </div>

            <ChevronDown size={16} />

          </div>

          <button
            className={styles.logoutButton}
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={17} />

            {loggingOut
              ? "Signing out..."
              : "Sign out"}
          </button>

        </div>

      </aside>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <button
          className={styles.overlay}
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* MAIN AREA */}
      <div className={styles.mainArea}>

        {/* TOPBAR */}
        <header className={styles.topbar}>

          <div className={styles.topbarLeft}>

            <button
              className={styles.menuButton}
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>

            <div className={styles.search}>

              <Search size={18} />

              <input
                placeholder="Search ANIX AI..."
                type="text"
              />

              <kbd>⌘ K</kbd>

            </div>

          </div>

          <div className={styles.topbarRight}>

            <div className={styles.online}>
              <span />
              Workspace online
            </div>

            <button
              className={styles.notification}
              aria-label="Notifications"
            >
              <Bell size={20} />
              <i />
            </button>

            <div className={styles.profileWrapper}>

              <button
                className={styles.profile}
                onClick={() =>
                  setProfileOpen(!profileOpen)
                }
              >

                <div className={styles.avatar}>
                  {userName.charAt(0).toUpperCase()}
                </div>

                <div className={styles.profileInfo}>
                  <strong>{userName}</strong>

                  <span>
                    {isClient
                      ? `${displayRole.charAt(0).toUpperCase()}${displayRole.slice(
                          1
                        )}`
                      : "Administrator"}
                  </span>
                </div>

                <ChevronDown size={16} />

              </button>

              {profileOpen && (
                <div className={styles.profileMenu}>

                  <div className={styles.profileMenuInfo}>
                    <strong>{userName}</strong>
                    <span>{userEmail}</span>
                  </div>

                  {!isClient && (
                    <>
                      <Link
                        href="/settings"
                        onClick={() =>
                          setProfileOpen(false)
                        }
                      >
                        Account Settings
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() =>
                          setProfileOpen(false)
                        }
                      >
                        Workspace Settings
                      </Link>
                    </>
                  )}

                  {isClient && (
                    <Link
                      href="/client-dashboard"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                    >
                      My Workspace
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    <LogOut size={16} />

                    {loggingOut
                      ? "Signing out..."
                      : "Sign out"}
                  </button>

                </div>
              )}

            </div>

          </div>

        </header>

        {/* PAGE CONTENT */}
        <main className={styles.content}>
          {children}
        </main>

      </div>

    </div>
  );
}