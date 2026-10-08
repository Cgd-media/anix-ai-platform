"use client";

import { Settings as SettingsIcon } from "lucide-react";
import AppShell from "../../components/AppShell";
import styles from "./settings.module.css";

export default function SettingsPage() {
  return (
    <AppShell>
      <main className={styles.page}>
        <p>CONFIGURATION</p>
        <h1>Settings</h1>
        <span>Manage your ANIX AI workspace configuration.</span>

        <section className={styles.card}>
          <SettingsIcon size={25} />
          <h2>Workspace Settings</h2>
          <div className={styles.row}>
            <span>Workspace</span>
            <strong>CGD Media</strong>
          </div>

          <div className={styles.row}>
            <span>Account Type</span>
            <strong>Agency Administrator</strong>
          </div>

          <div className={styles.row}>
            <span>Platform Status</span>
            <strong className={styles.online}>Online</strong>
          </div>
        </section>
      </main>
    </AppShell>
  );
}