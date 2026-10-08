"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Target,
  MousePointerClick,
  DollarSign,
  Users,
  CalendarDays,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import AppShell from "../../components/AppShell";
import styles from "./analytics.module.css";

const analyticsData = {
  "7D": {
    spend: "₹14.8K",
    spendChange: "+8.4%",
    reach: "42.6K",
    reachChange: "+12.7%",
    impressions: "68.9K",
    impressionsChange: "+10.2%",
    clicks: "1,842",
    clicksChange: "+6.8%",
    leads: "126",
    leadsChange: "+14.5%",
    ctr: "4.31%",
    ctrChange: "+0.42%",
  },

  "30D": {
    spend: "₹61.3K",
    spendChange: "+16.8%",
    reach: "168.2K",
    reachChange: "+21.4%",
    impressions: "284.6K",
    impressionsChange: "+18.7%",
    clicks: "7,052",
    clicksChange: "+12.6%",
    leads: "548",
    leadsChange: "+19.3%",
    ctr: "4.31%",
    ctrChange: "+0.36%",
  },

  "90D": {
    spend: "₹1.72L",
    spendChange: "+24.6%",
    reach: "492.8K",
    reachChange: "+28.2%",
    impressions: "824.5K",
    impressionsChange: "+22.1%",
    clicks: "21,846",
    clicksChange: "+17.8%",
    leads: "1,684",
    leadsChange: "+23.7%",
    ctr: "4.18%",
    ctrChange: "+0.29%",
  },
};

const campaignData = [
  {
    name: "Mancherial Fashion Week",
    client: "CGD Media",
    platform: "Facebook & Instagram",
    spend: "₹16,450",
    reach: "84.2K",
    clicks: "3,842",
    leads: "286",
    ctr: "4.56%",
    cpl: "₹57.52",
  },
  {
    name: "SRTH Events - Ganesh Campaign",
    client: "SRTH Events",
    platform: "Facebook & Instagram",
    spend: "₹9,280",
    reach: "52.6K",
    clicks: "2,184",
    leads: "174",
    ctr: "4.15%",
    cpl: "₹53.33",
  },
  {
    name: "Brand Awareness Campaign",
    client: "Hanuman Events",
    platform: "Facebook",
    spend: "₹6,740",
    reach: "31.4K",
    clicks: "1,026",
    leads: "88",
    ctr: "3.27%",
    cpl: "₹76.59",
  },
  {
    name: "Summer Lead Generation",
    client: "CGD Media",
    platform: "Instagram",
    spend: "₹7,850",
    reach: "28.7K",
    clicks: "1,164",
    leads: "92",
    ctr: "4.06%",
    cpl: "₹85.33",
  },
  {
    name: "Event Booking Campaign",
    client: "SRTH Events",
    platform: "Facebook",
    spend: "₹5,960",
    reach: "22.8K",
    clicks: "836",
    leads: "61",
    ctr: "3.67%",
    cpl: "₹97.70",
  },
];

const chartData = {
  "7D": [28, 36, 31, 44, 39, 51, 58],
  "30D": [30, 42, 36, 55, 47, 63, 58, 71, 64, 76, 69, 82],
  "90D": [25, 38, 32, 46, 41, 57, 51, 64, 59, 72, 68, 79],
};

export default function AnalyticsPage() {
  const [range, setRange] = useState("30D");
  const [platform, setPlatform] = useState("All Platforms");
  const [client, setClient] = useState("All Clients");

  const stats = analyticsData[range];

  const filteredCampaigns = useMemo(() => {
    return campaignData.filter((campaign) => {
      const platformMatch =
        platform === "All Platforms" ||
        campaign.platform.includes(platform);

      const clientMatch =
        client === "All Clients" ||
        campaign.client === client;

      return platformMatch && clientMatch;
    });
  }, [platform, client]);

  return (
    <AppShell>
      <main className={styles.page}>

        {/* HEADER */}

        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              PERFORMANCE / INSIGHTS
            </p>

            <h1>Analytics</h1>

            <p className={styles.subtitle}>
              Track advertising performance across your agency.
            </p>
          </div>

          <div className={styles.headerControls}>
            <div className={styles.select}>
              <CalendarDays size={15} />

              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
              >
                <option value="7D">Last 7 Days</option>
                <option value="30D">Last 30 Days</option>
                <option value="90D">Last 90 Days</option>
              </select>

              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        {/* FILTERS */}

        <div className={styles.filters}>

          <div className={styles.filterGroup}>
            <span>Platform</span>

            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option>All Platforms</option>
              <option>Facebook</option>
              <option>Instagram</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <span>Client</span>

            <select
              value={client}
              onChange={(e) => setClient(e.target.value)}
            >
              <option>All Clients</option>
              <option>CGD Media</option>
              <option>SRTH Events</option>
              <option>Hanuman Events</option>
            </select>
          </div>

          <div className={styles.filterInfo}>
            Showing performance for{" "}
            <strong>{range}</strong>
          </div>

        </div>

        {/* STATS */}

        <section className={styles.stats}>

          <MetricCard
            icon={DollarSign}
            title="Total Spend"
            value={stats.spend}
            change={stats.spendChange}
          />

          <MetricCard
            icon={Eye}
            title="Reach"
            value={stats.reach}
            change={stats.reachChange}
          />

          <MetricCard
            icon={BarChart3}
            title="Impressions"
            value={stats.impressions}
            change={stats.impressionsChange}
          />

          <MetricCard
            icon={MousePointerClick}
            title="Clicks"
            value={stats.clicks}
            change={stats.clicksChange}
          />

          <MetricCard
            icon={Target}
            title="Leads"
            value={stats.leads}
            change={stats.leadsChange}
          />

          <MetricCard
            icon={TrendingUp}
            title="Average CTR"
            value={stats.ctr}
            change={stats.ctrChange}
          />

        </section>

        {/* CHART */}

        <section className={styles.mainGrid}>

          <div className={styles.chartCard}>

            <div className={styles.cardHeader}>
              <div>
                <h2>Performance Overview</h2>
                <p>
                  Advertising activity over selected period.
                </p>
              </div>

              <div className={styles.legend}>
                <span>
                  <i className={styles.spendDot} />
                  Spend
                </span>

                <span>
                  <i className={styles.resultDot} />
                  Results
                </span>
              </div>
            </div>

            <div className={styles.chart}>

              <div className={styles.yAxis}>
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>

              <div className={styles.chartArea}>

                <div className={styles.gridLine} />
                <div className={styles.gridLine} />
                <div className={styles.gridLine} />
                <div className={styles.gridLine} />

                <div className={styles.bars}>
                  {chartData[range].map((height, index) => (
                    <div
                      className={styles.barGroup}
                      key={index}
                    >
                      <div
                        className={styles.bar}
                        style={{
                          height: `${height}%`,
                        }}
                      />

                      <div
                        className={styles.resultBar}
                        style={{
                          height: `${Math.max(
                            height - 14,
                            12
                          )}%`,
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className={styles.xAxis}>
                  {chartData[range].map((_, index) => (
                    <span key={index}>
                      {index + 1}
                    </span>
                  ))}
                </div>

              </div>

            </div>

          </div>

          {/* PLATFORM */}

          <div className={styles.platformCard}>

            <div className={styles.cardHeader}>
              <div>
                <h2>Platform Breakdown</h2>
                <p>Performance by platform.</p>
              </div>
            </div>

            <PlatformRow
              type="FB"
              name="Facebook"
              spend="₹38.7K"
              percentage="63%"
              width="63%"
            />

            <PlatformRow
              type="IG"
              name="Instagram"
              spend="₹22.6K"
              percentage="37%"
              width="37%"
            />

            <div className={styles.platformTotal}>
              <span>Total Platform Spend</span>
              <strong>₹61.3K</strong>
            </div>

          </div>

        </section>

        {/* MINI METRICS */}

        <section className={styles.miniGrid}>

          <MiniMetric
            icon={Users}
            title="Cost Per Lead"
            value="₹63.92"
            description="Average cost for each lead"
          />

          <MiniMetric
            icon={MousePointerClick}
            title="Cost Per Click"
            value="₹8.69"
            description="Average cost per click"
          />

          <MiniMetric
            icon={TrendingUp}
            title="Conversion Rate"
            value="7.77%"
            description="Clicks converted into leads"
          />

        </section>

        {/* CAMPAIGN TABLE */}

        <section className={styles.tableCard}>

          <div className={styles.tableHeader}>
            <div>
              <h2>Campaign Performance</h2>

              <p>
                {filteredCampaigns.length} campaigns matching
                your filters.
              </p>
            </div>
          </div>

          <div className={styles.tableWrapper}>

            <table className={styles.table}>

              <thead>
                <tr>
                  <th>CAMPAIGN</th>
                  <th>CLIENT</th>
                  <th>PLATFORM</th>
                  <th>SPEND</th>
                  <th>REACH</th>
                  <th>CLICKS</th>
                  <th>LEADS</th>
                  <th>CTR</th>
                  <th>CPL</th>
                </tr>
              </thead>

              <tbody>

                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.name}>

                    <td>
                      <div className={styles.campaignName}>

                        <div className={styles.campaignIcon}>
                          <BarChart3 size={15} />
                        </div>

                        <strong>
                          {campaign.name}
                        </strong>

                      </div>
                    </td>

                    <td>{campaign.client}</td>

                    <td>
                      <div className={styles.platform}>

                        {campaign.platform.includes("Facebook") && (
                          <span className={styles.socialBadge}>
                            FB
                          </span>
                        )}

                        {campaign.platform.includes("Instagram") && (
                          <span className={styles.socialBadge}>
                            IG
                          </span>
                        )}

                        <span>
                          {campaign.platform}
                        </span>

                      </div>
                    </td>

                    <td>{campaign.spend}</td>

                    <td>{campaign.reach}</td>

                    <td>{campaign.clicks}</td>

                    <td className={styles.leads}>
                      {campaign.leads}
                    </td>

                    <td>{campaign.ctr}</td>

                    <td className={styles.cpl}>
                      {campaign.cpl}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          {filteredCampaigns.length === 0 && (
            <div className={styles.empty}>
              No campaigns match the selected filters.
            </div>
          )}

        </section>

      </main>
    </AppShell>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  change,
}) {
  return (
    <div className={styles.metricCard}>

      <div className={styles.metricTop}>

        <div className={styles.metricIcon}>
          <Icon size={17} />
        </div>

        <span className={styles.positive}>
          <ArrowUpRight size={12} />
          {change}
        </span>

      </div>

      <span className={styles.metricTitle}>
        {title}
      </span>

      <strong className={styles.metricValue}>
        {value}
      </strong>

    </div>
  );
}

function PlatformRow({
  type,
  name,
  spend,
  percentage,
  width,
}) {
  return (
    <div className={styles.platformRow}>

      <div className={styles.platformInfo}>

        <div className={styles.socialIcon}>
          {type}
        </div>

        <div>
          <strong>{name}</strong>
          <span>{spend}</span>
        </div>

        <b>{percentage}</b>

      </div>

      <div className={styles.progress}>
        <div
          className={styles.progressFill}
          style={{ width }}
        />
      </div>

    </div>
  );
}

function MiniMetric({
  icon: Icon,
  title,
  value,
  description,
}) {
  return (
    <div className={styles.miniMetric}>

      <div className={styles.miniIcon}>
        <Icon size={16} />
      </div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{description}</small>
      </div>

    </div>
  );
}