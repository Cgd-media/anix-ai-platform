"use client";

import {
  ArrowUpRight,
  BarChart3,
  Eye,
  MousePointerClick,
  Plus,
  Target,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

import AppShell from "../components/AppShell";
import styles from "./page.module.css";

const campaigns = [
  {
    name: "Mancherial Fashion Week",
    client: "CGD Media",
    spend: "₹16,450",
    leads: "284",
    status: "Active",
  },
  {
    name: "Ganesh Campaign",
    client: "SRTH Events",
    spend: "₹9,280",
    leads: "173",
    status: "Active",
  },
  {
    name: "Brand Awareness",
    client: "Hanuman Events",
    spend: "₹6,740",
    leads: "91",
    status: "Paused",
  },
];

export default function Dashboard() {
  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>AGENCY OVERVIEW</p>
            <h1>Good morning, Abhi</h1>
            <p>
              Here&apos;s what&apos;s happening across your agency today.
            </p>
          </div>

          <button className={styles.primaryButton}>
            <Plus size={17} />
            Create Campaign
          </button>
        </div>

        <section className={styles.statsGrid}>
          <Stat
            title="Total Ad Spend"
            value="₹32.4K"
            change="+12.8%"
            icon={WalletCards}
            positive
          />

          <Stat
            title="Total Leads"
            value="548"
            change="+18.4%"
            icon={Target}
            positive
          />

          <Stat
            title="Total Reach"
            value="168.2K"
            change="+9.6%"
            icon={Eye}
            positive
          />

          <Stat
            title="Active Clients"
            value="12"
            change="+2 this month"
            icon={Users}
            positive
          />
        </section>

        <section className={styles.mainGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Performance Overview</h2>
                <p>Advertising performance across all clients.</p>
              </div>

              <select>
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>This year</option>
              </select>
            </div>

            <div className={styles.chartArea}>
              <div className={styles.chartLegend}>
                <span>
                  <i className={styles.blueDot} />
                  Spend
                </span>
                <span>
                  <i className={styles.greenDot} />
                  Leads
                </span>
              </div>

              <div className={styles.fakeChart}>
                <div className={styles.chartLine}>
                  <span style={{ height: "35%" }} />
                  <span style={{ height: "48%" }} />
                  <span style={{ height: "42%" }} />
                  <span style={{ height: "63%" }} />
                  <span style={{ height: "57%" }} />
                  <span style={{ height: "74%" }} />
                  <span style={{ height: "68%" }} />
                  <span style={{ height: "88%" }} />
                  <span style={{ height: "79%" }} />
                  <span style={{ height: "94%" }} />
                </div>

                <div className={styles.chartLabels}>
                  <span>01 Sep</span>
                  <span>05 Sep</span>
                  <span>10 Sep</span>
                  <span>15 Sep</span>
                  <span>20 Sep</span>
                  <span>25 Sep</span>
                  <span>30 Sep</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Quick Insights</h2>
                <p>AI-powered observations.</p>
              </div>

              <div className={styles.aiBadge}>NIA</div>
            </div>

            <div className={styles.insight}>
              <div className={styles.insightIcon}>
                <TrendingUp size={18} />
              </div>
              <div>
                <strong>Lead volume increased</strong>
                <p>
                  Your campaigns generated 18.4% more leads this period.
                </p>
              </div>
            </div>

            <div className={styles.insight}>
              <div className={styles.insightIcon}>
                <MousePointerClick size={18} />
              </div>
              <div>
                <strong>CTR is improving</strong>
                <p>
                  Overall click-through rate is currently 4.31%.
                </p>
              </div>
            </div>

            <button className={styles.secondaryButton}>
              View AI Insights
              <ArrowUpRight size={15} />
            </button>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Recent Campaigns</h2>
              <p>Your latest advertising campaigns.</p>
            </div>

            <a href="/campaigns">View all</a>
          </div>

          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>CAMPAIGN</span>
              <span>CLIENT</span>
              <span>SPEND</span>
              <span>LEADS</span>
              <span>STATUS</span>
            </div>

            {campaigns.map((campaign) => (
              <div className={styles.tableRow} key={campaign.name}>
                <div className={styles.campaignName}>
                  <div className={styles.campaignIcon}>
                    <BarChart3 size={16} />
                  </div>
                  <strong>{campaign.name}</strong>
                </div>

                <span>{campaign.client}</span>
                <span>{campaign.spend}</span>
                <span>{campaign.leads}</span>

                <span
                  className={
                    campaign.status === "Active"
                      ? styles.active
                      : styles.paused
                  }
                >
                  {campaign.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Stat({
  title,
  value,
  change,
  icon: Icon,
  positive,
}) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statTop}>
        <div className={styles.statIcon}>
          <Icon size={19} />
        </div>

        <span className={positive ? styles.change : styles.changeNeutral}>
          {change}
        </span>
      </div>

      <span className={styles.statTitle}>{title}</span>
      <strong className={styles.statValue}>{value}</strong>
    </div>
  );
}