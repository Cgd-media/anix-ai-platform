"use client";

import { FileText, Plus } from "lucide-react";
import AppShell from "../../components/AppShell";
import styles from "./reports.module.css";

export default function ReportsPage() {
  return (
    <AppShell>
      <main className={styles.page}>
        <div className={styles.header}>
          <div>
            <p>REPORTING</p>
            <h1>Reports</h1>
            <span>
              Generate and manage client advertising reports.
            </span>
          </div>

          <button>
            <Plus size={17} />
            Generate Report
          </button>
        </div>

        <section className={styles.card}>
          <FileText size={30} />
          <h2>Agency Reports</h2>
          <p>
            Client reports, campaign summaries and performance
            reports will be managed here.
          </p>
        </section>
      </main>
    </AppShell>
  );
}