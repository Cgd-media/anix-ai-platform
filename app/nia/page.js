"use client";

import { Bot, Sparkles } from "lucide-react";
import AppShell from "../../components/AppShell";
import styles from "./nia.module.css";

export default function NIAPage() {
  return (
    <AppShell>
      <main className={styles.page}>
        <div className={styles.hero}>
          <div className={styles.icon}>
            <Bot size={28} />
          </div>

          <p>ANIX INTELLIGENCE</p>
          <h1>NIA Assistant</h1>

          <span>
            Your AI assistant for campaigns, analytics and digital
            marketing operations.
          </span>
        </div>

        <div className={styles.inputArea}>
          <Sparkles size={18} />
          <input
            placeholder="Ask NIA anything about your campaigns..."
          />
          <button>Ask NIA</button>
        </div>
      </main>
    </AppShell>
  );
}