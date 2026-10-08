"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

import { auth, db } from "../../lib/firebase";
import styles from "./client-dashboard.module.css";

export default function ClientDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          if (!firebaseUser) {
            router.replace("/login");
            return;
          }

          const userRef = doc(
            db,
            "users",
            firebaseUser.uid
          );

          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            setError(
              "Your ANIX AI user profile could not be found."
            );
            setLoading(false);
            return;
          }

          const data = userSnap.data();

          const accountType = String(
            data.accountType || ""
          ).toLowerCase();

          const status = String(
            data.status || ""
          ).toLowerCase();

          if (accountType !== "client") {
            router.replace("/");
            return;
          }

          if (status !== "active") {
            await signOut(auth);
            router.replace("/login");
            return;
          }

          setUserData({
            name:
              data.name ||
              firebaseUser.displayName ||
              "User",

            email:
              data.email ||
              firebaseUser.email ||
              "",

            role: data.role || "viewer",

            clientId: data.clientId || "",

            clientName:
              data.clientName ||
              "Client Workspace",
          });

          setLoading(false);
        } catch (err) {
          console.error(
            "Client dashboard error:",
            err
          );

          setError(
            "Unable to load your client workspace."
          );

          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [router]);

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await signOut(auth);

      router.replace("/login");
    } catch (err) {
      console.error("Logout error:", err);

      setLoggingOut(false);

      setError(
        "Unable to sign out. Please try again."
      );
    }
  }

  function formatRole(role) {
    if (!role) return "Viewer";

    return (
      role.charAt(0).toUpperCase() +
      role.slice(1)
    );
  }

  if (loading) {
    return (
      <main className={styles.loadingPage}>
        <div className={styles.loadingBox}>
          <div className={styles.loadingLogo}>
            A
          </div>

          <p>Loading your workspace...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.errorPage}>
        <div className={styles.errorBox}>
          <div className={styles.logo}>A</div>

          <h2>Unable to load workspace</h2>

          <p>{error}</p>

          <button
            className={styles.primaryButton}
            onClick={() =>
              router.replace("/login")
            }
          >
            Back to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      {/* ================= HEADER ================= */}

      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>A</div>

          <div className={styles.brandText}>
            <strong>ANIX AI</strong>
            <span>Powered by CGD Media</span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.workspaceStatus}>
            <span className={styles.statusDot}></span>
            Workspace online
          </div>

          <div className={styles.profile}>
            <div className={styles.avatar}>
              {userData?.name
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <div className={styles.profileInfo}>
              <strong>{userData?.name}</strong>
              <span>
                {formatRole(userData?.role)}
              </span>
            </div>
          </div>

          <button
            className={styles.logoutButton}
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut
              ? "Signing out..."
              : "Log out"}
          </button>
        </div>
      </header>

      {/* ================= CONTENT ================= */}

      <div className={styles.container}>
        {/* Page heading */}

        <section className={styles.pageHeading}>
          <div>
            <div className={styles.eyebrow}>
              CLIENT WORKSPACE
            </div>

            <h1>
              Welcome, {userData?.name}
            </h1>

            <p>
              Here's what's happening with your
              {userData?.clientName
                ? ` ${userData.clientName}`
                : " business"}.
            </p>
          </div>

          <div className={styles.clientBadge}>
            <span>Client</span>
            <strong>
              {userData?.clientName}
            </strong>
          </div>
        </section>

        {/* Account information */}

        <section className={styles.infoGrid}>
          <InfoCard
            label="Client"
            value={userData?.clientName}
          />

          <InfoCard
            label="Your Role"
            value={formatRole(
              userData?.role
            )}
          />

          <InfoCard
            label="Account Status"
            value="Active"
            active
          />

          <InfoCard
            label="Account Email"
            value={userData?.email}
          />
        </section>

        {/* Performance */}

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Performance Overview</h2>
              <p>
                Your advertising performance
                will appear here.
              </p>
            </div>

            <span className={styles.period}>
              Last 30 days
            </span>
          </div>

          <div className={styles.performanceGrid}>
            <MetricCard
              title="Ad Spend"
              value="—"
              description="Campaign spend"
            />

            <MetricCard
              title="Leads"
              value="—"
              description="Generated leads"
            />

            <MetricCard
              title="Reach"
              value="—"
              description="People reached"
            />

            <MetricCard
              title="Engagement"
              value="—"
              description="Total engagement"
            />
          </div>
        </section>

        {/* Modules */}

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Your Workspace</h2>
              <p>
                Access your marketing information
                and reports.
              </p>
            </div>
          </div>

          <div className={styles.moduleGrid}>
            <ModuleCard
              title="Campaigns"
              description="View your advertising campaigns, status and performance."
              icon="↗"
            />

            <ModuleCard
              title="Analytics"
              description="Track leads, reach, engagement and advertising performance."
              icon="◔"
            />

            <ModuleCard
              title="Reports"
              description="View reports and performance summaries prepared for your business."
              icon="▤"
            />
          </div>
        </section>

        {/* Footer */}

        <footer className={styles.footer}>
          <span>
            ANIX AI · Client Workspace
          </span>

          <span>
            {userData?.clientName}
          </span>
        </footer>
      </div>
    </main>
  );
}

/* ================= INFO CARD ================= */

function InfoCard({
  label,
  value,
  active = false,
}) {
  return (
    <div className={styles.infoCard}>
      <span>{label}</span>

      <strong>{value}</strong>

      {active && (
        <small className={styles.activeStatus}>
          ● Active
        </small>
      )}
    </div>
  );
}

/* ================= METRIC CARD ================= */

function MetricCard({
  title,
  value,
  description,
}) {
  return (
    <div className={styles.metricCard}>
      <span>{title}</span>

      <strong>{value}</strong>

      <small>{description}</small>
    </div>
  );
}

/* ================= MODULE CARD ================= */

function ModuleCard({
  title,
  description,
  icon,
}) {
  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleIcon}>
        {icon}
      </div>

      <div>
        <h3>{title}</h3>

        <p>{description}</p>
      </div>

      <span className={styles.arrow}>
        →
      </span>
    </div>
  );
}