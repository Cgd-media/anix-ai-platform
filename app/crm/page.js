"use client";

import { BriefcaseBusiness, Plus } from "lucide-react";
import AppShell from "../../components/AppShell";
import styles from "./crm.module.css";

export default function CRMPage() {
  return (
    <AppShell>
      <main className={styles.page}>
        <div className={styles.header}>
          <div>
            <p>RELATIONSHIP MANAGEMENT</p>
            <h1>CRM</h1>
            <span>
              Manage leads, follow-ups and client relationships.
            </span>
          </div>

          <button>
            <Plus size={17} />
            Add Lead
          </button>
        </div>

        <section className={styles.card}>
          <BriefcaseBusiness size={30} />
          <h2>CRM Workspace</h2>
          <p>
            Leads, follow-ups, notes, tasks and client communication
            will be managed here.
          </p>
        </section>
      </main>
    </AppShell>
  );
}