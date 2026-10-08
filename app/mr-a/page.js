"use client";

import { useState } from "react";

import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Crosshair,
  Globe2,
  Layers3,
  MapPin,
  Megaphone,
  Sparkles,
  Target,
  Users,
  Video,
  Wallet,
} from "lucide-react";

import AppShell from "../../components/AppShell";
import styles from "./page.module.css";

/* =========================================================
   EXAMPLES
========================================================= */

const EXAMPLES = [
  "Furniture leads in Hyderabad, ₹700 budget for 3 days",
  "Real estate leads in Hyderabad, ₹5,000 for 7 days",
  "Gym membership leads, ₹2,000 budget for 5 days",
];

const DEFAULT_BRIEF =
  "Furniture leads in Hyderabad, ₹700 budget for 3 days";

/* =========================================================
   SAFE VALUE HELPERS
========================================================= */

/*
  AI responses can sometimes contain:

  "Hyderabad"

  OR

  ["Hyderabad", "Secunderabad"]

  OR

  {
    city: "Hyderabad",
    radius: "15 km"
  }

  React cannot directly render an object.

  These helpers make every AI field safe to display.
*/

function safeText(value, fallback = "Not specified") {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => safeText(item, ""))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    /*
      Prefer common readable properties.
    */

    const preferredKeys = [
      "name",
      "title",
      "label",
      "value",
      "text",
      "description",
      "type",
      "objective",
      "adSetName",
      "placement",
      "platform",
    ];

    for (const key of preferredKeys) {
      if (
        value[key] !== undefined &&
        value[key] !== null &&
        value[key] !== ""
      ) {
        return safeText(
          value[key],
          fallback
        );
      }
    }

    /*
      Last resort: convert object to readable JSON.
    */

    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }

  return fallback;
}

/* =========================================================
   SAFE ARRAY
========================================================= */

function safeArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value;
}

/* =========================================================
   FORMAT CURRENCY
========================================================= */

function formatCurrency(
  value,
  currency = "INR"
) {
  const amount =
    Number(value) || 0;

  if (currency === "INR") {
    return `₹${amount.toLocaleString(
      "en-IN"
    )}`;
  }

  return `${currency} ${amount.toLocaleString(
    "en-IN"
  )}`;
}

/* =========================================================
   FORMAT OBJECT FOR DISPLAY
========================================================= */

function formatObject(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        formatObject(item)
      )
      .filter(Boolean)
      .join(" · ");
  }

  if (typeof value === "object") {
    const parts = [];

    Object.entries(value).forEach(
      ([key, val]) => {
        if (
          val === null ||
          val === undefined ||
          val === ""
        ) {
          return;
        }

        parts.push(
          `${key}: ${formatObject(val)}`
        );
      }
    );

    return parts.join(" · ");
  }

  return String(value);
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon}>
        <Icon size={16} />
      </div>

      <div className={styles.statContent}>
        <span>{label}</span>

        <strong>
          {safeText(value)}
        </strong>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  icon: Icon,
  eyebrow,
  title,
}) {
  return (
    <div className={styles.sectionTitle}>
      <div className={styles.sectionTitleIcon}>
        <Icon size={16} />
      </div>

      <div>
        <span>{eyebrow}</span>

        <h3>{title}</h3>
      </div>
    </div>
  );
}

/* =========================================================
   AI LIST ITEM
========================================================= */

function AIListItem({
  item,
  index,
}) {
  const object =
    item &&
    typeof item === "object" &&
    !Array.isArray(item)
      ? item
      : null;

  return (
    <div>
      <span>
        {String(index + 1).padStart(
          2,
          "0"
        )}
      </span>

      <p>
        {object
          ? formatObject(object)
          : safeText(item)}
      </p>
    </div>
  );
}

/* =========================================================
   CAMPAIGN STRUCTURE ITEM
========================================================= */

function CampaignStructureItem({
  item,
  index,
}) {
  const isObject =
    item &&
    typeof item === "object" &&
    !Array.isArray(item);

  if (!isObject) {
    return (
      <div
        className={
          styles.architectureItem
        }
      >
        <span>
          {String(index + 1).padStart(
            2,
            "0"
          )}
        </span>

        <div>
          <strong>
            {safeText(item)}
          </strong>

          <small>
            AI campaign recommendation
          </small>
        </div>
      </div>
    );
  }

  const title =
    item.adSetName ||
    item.name ||
    item.title ||
    `Campaign Layer ${
      index + 1
    }`;

  const targeting =
    item.targeting;

  const budget =
    item.budgetAllocation;

  return (
    <div
      className={
        styles.architectureItem
      }
    >
      <span>
        {String(index + 1).padStart(
          2,
          "0"
        )}
      </span>

      <div>
        <strong>
          {safeText(title)}
        </strong>

        {targeting && (
          <small>
            Targeting:{" "}
            {safeText(
              targeting
            )}
          </small>
        )}

        {budget !== undefined &&
          budget !== null && (
            <small>
              Budget allocation:{" "}
              {safeText(
                budget
              )}
            </small>
          )}

        {!targeting &&
          budget === undefined && (
            <small>
              {formatObject(
                item
              )}
            </small>
          )}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function MrAPage() {
  const [brief, setBrief] =
    useState(DEFAULT_BRIEF);

  const [platform, setPlatform] =
    useState("Meta Ads");

  const [campaign, setCampaign] =
    useState(null);

  const [built, setBuilt] =
    useState(false);

  const [isBuilding, setIsBuilding] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     BUILD CAMPAIGN
  ======================================================= */

  async function buildCampaign() {
    const cleanBrief =
      brief.trim();

    if (!cleanBrief) {
      setError(
        "Please describe your campaign first."
      );

      return;
    }

    setIsBuilding(true);
    setBuilt(false);
    setCampaign(null);
    setError("");

    try {
      console.log(
        "MR.A → Building campaign..."
      );

      const response =
        await fetch(
          "/api/mr-a",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              prompt: `
User campaign brief:
${cleanBrief}

Preferred advertising platform:
${platform}

Build the campaign around the user's brief.

If the user did not specify a platform,
use the preferred platform.

Respect the user's exact budget,
location and duration.
`,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data?.error ||
            "MR.A could not build the campaign."
        );
      }

      if (!data.campaign) {
        throw new Error(
          "MR.A returned an empty campaign."
        );
      }

      console.log(
        "MR.A → Campaign received:",
        data.campaign
      );

      setCampaign(
        data.campaign
      );

      setBuilt(true);

      /*
        Scroll to generated result.
      */

      window.setTimeout(() => {
        document
          .getElementById(
            "campaign-result"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (buildError) {
      console.error(
        "MR.A BUILD ERROR:",
        buildError
      );

      setError(
        buildError?.message ||
          "MR.A could not build the campaign."
      );

      setBuilt(false);
    } finally {
      setIsBuilding(false);
    }
  }

  /* =======================================================
     EXAMPLE
  ======================================================= */

  function useExample(
    example
  ) {
    setBrief(example);
    setCampaign(null);
    setBuilt(false);
    setError("");
  }

  /* =======================================================
     REFINE
  ======================================================= */

  function refineBrief() {
    document
      .getElementById(
        "campaign-brief"
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }

  /* =======================================================
     CONTINUE
  ======================================================= */

  function continueSetup() {
    window.location.href =
      "/campaigns";
  }

  /* =======================================================
     SAFE CAMPAIGN VALUES
  ======================================================= */

  const campaignPlatform =
    safeText(
      campaign?.platform,
      platform
    );

  const objective =
    safeText(
      campaign?.objective,
      "Leads"
    );

  const industry =
    safeText(
      campaign?.industry,
      "General Business"
    );

  const location =
    safeText(
      campaign?.location,
      "India"
    );

  const budgetAmount =
    Number(
      campaign?.budget?.amount
    ) || 0;

  const budgetCurrency =
    safeText(
      campaign?.budget?.currency,
      "INR"
    );

  const budgetType =
    safeText(
      campaign?.budget?.type,
      "Lifetime"
    );

  const duration =
    Number(
      campaign?.duration?.days
    ) || 1;

  const dailyBudget =
    duration > 0
      ? Math.round(
          budgetAmount /
            duration
        )
      : budgetAmount;

  const targeting =
    campaign?.targeting || {};

  const targetLocation =
    safeText(
      targeting.location,
      location
    );

  const radius =
    safeText(
      targeting.radius,
      "AI recommended"
    );

  const age =
    safeText(
      targeting.age,
      "23–50"
    );

  const gender =
    safeText(
      targeting.gender,
      "All"
    );

  const interests =
    safeArray(
      targeting.interests
    );

  const behaviors =
    safeArray(
      targeting.behaviors
    );

  const placements =
    safeArray(
      campaign?.placements
    );

  const campaignStructure =
    safeArray(
      campaign?.campaignStructure
    );

  const recommendations =
    safeArray(
      campaign?.recommendations
    );

  const creativeDirection =
    safeText(
      campaign?.creativeDirection,
      "AI-generated creative direction."
    );

  const adCopyDirection =
    safeText(
      campaign?.adCopyDirection,
      "Benefit-focused advertising copy with a clear CTA."
    );

  const leadFormStrategy =
    safeText(
      campaign?.leadFormStrategy,
      "Use a short qualification form."
    );

  const optimization =
    safeText(
      campaign?.optimization,
      "Maximize campaign results"
    );

  const aiNote =
    safeText(
      campaign?.aiNote,
      "MR.A generated this campaign strategy using AI."
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <AppShell>
      <main
        className={
          styles.page
        }
      >
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <header
          className={
            styles.pageHeader
          }
        >
          <div>
            <div
              className={
                styles.statusLine
              }
            >
              <span
                className={
                  styles.statusDot
                }
              />

              MR.A ONLINE
            </div>

            <div
              className={
                styles.eyebrow
              }
            >
              CAMPAIGN INTELLIGENCE
              ENGINE
            </div>

            <h1>
              Tell{" "}
              <span>
                MR.A.
              </span>

              <br />

              We build the campaign.
            </h1>

            <p>
              Describe what you want
              in plain language. MR.A
              will transform your brief
              into a complete advertising
              strategy.
            </p>
          </div>

          <div
            className={
              styles.engineBadge
            }
          >
            <Sparkles
              size={14}
            />

            AI CAMPAIGN ENGINE
          </div>
        </header>

        {/* =================================================
            BRIEF BUILDER
        ================================================= */}

        <section
          id="campaign-brief"
          className={
            styles.briefCard
          }
        >
          <div
            className={
              styles.briefHeader
            }
          >
            <div
              className={
                styles.briefLabel
              }
            >
              <Sparkles
                size={15}
              />

              DESCRIBE YOUR CAMPAIGN
            </div>

            <span>
              MR.A INTELLIGENCE
            </span>
          </div>

          <textarea
            value={brief}
            onChange={(event) =>
              setBrief(
                event.target.value
              )
            }
            placeholder="Example: Generate leads for my furniture business in Hyderabad..."
            className={
              styles.briefInput
            }
            disabled={
              isBuilding
            }
          />

          <div
            className={
              styles.exampleArea
            }
          >
            <span>
              Try:
            </span>

            {EXAMPLES.map(
              (example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() =>
                    useExample(
                      example
                    )
                  }
                  className={
                    styles.exampleButton
                  }
                  disabled={
                    isBuilding
                  }
                >
                  {example}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            onClick={
              buildCampaign
            }
            disabled={
              isBuilding
            }
            className={
              styles.buildButton
            }
          >
            <Sparkles
              size={15}
            />

            {isBuilding
              ? "MR.A IS THINKING..."
              : "BUILD WITH MR.A"}

            <ArrowRight
              size={16}
            />
          </button>

          {/* ERROR */}

          {error && (
            <div
              style={{
                marginTop:
                  "12px",
                padding:
                  "12px 14px",
                border:
                  "1px solid #fecaca",
                background:
                  "#fff5f5",
                color:
                  "#dc2626",
                borderRadius:
                  "10px",
                fontSize:
                  "13px",
                lineHeight:
                  "1.5",
              }}
            >
              {error}
            </div>
          )}
        </section>

        {/* =================================================
            PLATFORM SELECTOR
        ================================================= */}

        <section
          className={
            styles.platformGrid
          }
        >
          {/* META */}

          <button
            type="button"
            onClick={() =>
              setPlatform(
                "Meta Ads"
              )
            }
            className={`${
              styles.platformCard
            } ${
              platform ===
              "Meta Ads"
                ? styles.platformActive
                : ""
            }`}
          >
            <div
              className={
                styles.platformLogo
              }
            >
              M
            </div>

            <div
              className={
                styles.platformInfo
              }
            >
              <strong>
                Meta Ads
              </strong>

              <span>
                Facebook · Instagram ·
                Messenger
              </span>
            </div>

            <div
              className={
                styles.radio
              }
            >
              {platform ===
                "Meta Ads" && (
                <Check
                  size={13}
                />
              )}
            </div>
          </button>

          {/* GOOGLE */}

          <button
            type="button"
            onClick={() =>
              setPlatform(
                "Google Ads"
              )
            }
            className={`${
              styles.platformCard
            } ${
              platform ===
              "Google Ads"
                ? styles.platformActive
                : ""
            }`}
          >
            <div
              className={
                styles.platformLogo
              }
            >
              G
            </div>

            <div
              className={
                styles.platformInfo
              }
            >
              <strong>
                Google Ads
              </strong>

              <span>
                Search · Display ·
                YouTube
              </span>
            </div>

            <div
              className={
                styles.radio
              }
            >
              {platform ===
                "Google Ads" && (
                <Check
                  size={13}
                />
              )}
            </div>
          </button>
        </section>

        {/* =================================================
            LOADING
        ================================================= */}

        {isBuilding && (
          <section
            style={{
              marginTop:
                "18px",
              padding:
                "22px",
              border:
                "1px solid #dbe7f5",
              borderRadius:
                "14px",
              background:
                "#ffffff",
              textAlign:
                "center",
            }}
          >
            <Sparkles
              size={22}
              style={{
                marginBottom:
                  "8px",
              }}
            />

            <div
              style={{
                fontWeight:
                  700,
                fontSize:
                  "14px",
              }}
            >
              MR.A is building
              your campaign...
            </div>

            <div
              style={{
                marginTop:
                  "5px",
                fontSize:
                  "12px",
                color:
                  "#64748b",
              }}
            >
              Analyzing audience,
              budget, targeting,
              placements and
              campaign structure.
            </div>
          </section>
        )}

        {/* =================================================
            RESULT
        ================================================= */}

        {built &&
          campaign && (
            <section
              id="campaign-result"
              className={
                styles.resultCard
              }
            >
              {/* RESULT HEADER */}

              <div
                className={
                  styles.resultHeader
                }
              >
                <div>
                  <div
                    className={
                      styles.resultEyebrow
                    }
                  >
                    <Sparkles
                      size={14}
                    />

                    MR.A CAMPAIGN
                    ARCHITECTURE
                  </div>

                  <h2>
                    {safeText(
                      campaign?.campaignName,
                      `${industry} Leads Campaign`
                    )}
                  </h2>

                  <p>
                    MR.A has interpreted
                    your brief and
                    generated a campaign
                    structure for review.
                  </p>
                </div>

                <div
                  className={
                    styles.readyBadge
                  }
                >
                  <span />

                  PLAN READY
                </div>
              </div>

              {/* =================================================
                  SUMMARY
              ================================================= */}

              <div
                className={
                  styles.summaryGrid
                }
              >
                <StatCard
                  icon={Layers3}
                  label="PLATFORM"
                  value={
                    campaignPlatform
                  }
                />

                <StatCard
                  icon={Target}
                  label="OBJECTIVE"
                  value={
                    objective
                  }
                />

                <StatCard
                  icon={MapPin}
                  label="LOCATION"
                  value={
                    location
                  }
                />

                <StatCard
                  icon={Megaphone}
                  label="INDUSTRY"
                  value={
                    industry
                  }
                />

                <StatCard
                  icon={Wallet}
                  label="BUDGET"
                  value={formatCurrency(
                    budgetAmount,
                    budgetCurrency
                  )}
                />

                <StatCard
                  icon={Clock3}
                  label="DURATION"
                  value={`${duration} days`}
                />
              </div>

              {/* =================================================
                  CAMPAIGN SETTINGS
              ================================================= */}

              <div
                className={
                  styles.settingsGrid
                }
              >
                {/* SETTINGS */}

                <div
                  className={
                    styles.settingsCard
                  }
                >
                  <SectionTitle
                    icon={
                      Target
                    }
                    eyebrow="CAMPAIGN SETTINGS"
                    title="Campaign configuration"
                  />

                  <div
                    className={
                      styles.formGrid
                    }
                  >
                    <label>
                      <span>
                        OBJECTIVE
                      </span>

                      <select
                        defaultValue={
                          objective
                        }
                      >
                        <option>
                          Leads
                        </option>

                        <option>
                          Traffic
                        </option>

                        <option>
                          Engagement
                        </option>

                        <option>
                          Sales
                        </option>

                        <option>
                          Awareness
                        </option>
                      </select>
                    </label>

                    <label>
                      <span>
                        BUDGET TYPE
                      </span>

                      <select
                        defaultValue={
                          budgetType
                        }
                      >
                        <option>
                          Lifetime
                        </option>

                        <option>
                          Daily
                        </option>
                      </select>
                    </label>

                    <label>
                      <span>
                        START DATE
                      </span>

                      <input
                        type="date"
                      />
                    </label>

                    <label>
                      <span>
                        END DATE
                      </span>

                      <input
                        type="date"
                      />
                    </label>
                  </div>
                </div>

                {/* AUDIENCE */}

                <div
                  className={
                    styles.settingsCard
                  }
                >
                  <SectionTitle
                    icon={
                      Users
                    }
                    eyebrow="AUDIENCE INTELLIGENCE"
                    title="Suggested audience"
                  />

                  <div
                    className={
                      styles.audienceRows
                    }
                  >
                    <div>
                      <span>
                        LOCATION
                      </span>

                      <strong>
                        {
                          targetLocation
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        RADIUS
                      </span>

                      <strong>
                        {radius}
                      </strong>
                    </div>

                    <div>
                      <span>
                        AGE
                      </span>

                      <strong>
                        {age}
                      </strong>
                    </div>

                    <div>
                      <span>
                        GENDER
                      </span>

                      <strong>
                        {gender}
                      </strong>
                    </div>
                  </div>

                  {/* INTERESTS */}

                  {interests.length >
                    0 && (
                    <div
                      className={
                        styles.chips
                      }
                    >
                      {interests.map(
                        (
                          item,
                          index
                        ) => (
                          <span
                            key={`interest-${index}`}
                          >
                            {safeText(
                              item
                            )}
                          </span>
                        )
                      )}
                    </div>
                  )}

                  {/* BEHAVIORS */}

                  {behaviors.length >
                    0 && (
                    <div
                      className={
                        styles.chips
                      }
                      style={{
                        marginTop:
                          "8px",
                      }}
                    >
                      {behaviors.map(
                        (
                          item,
                          index
                        ) => (
                          <span
                            key={`behavior-${index}`}
                          >
                            {safeText(
                              item
                            )}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* =================================================
                  CAMPAIGN ARCHITECTURE
              ================================================= */}

              <div
                className={
                  styles.architectureCard
                }
              >
                <SectionTitle
                  icon={
                    Layers3
                  }
                  eyebrow="CAMPAIGN ARCHITECTURE"
                  title="AI-generated campaign structure"
                />

                {campaignStructure.length >
                0 ? (
                  <div
                    className={
                      styles.architectureList
                    }
                  >
                    {campaignStructure.map(
                      (
                        item,
                        index
                      ) => (
                        <CampaignStructureItem
                          key={
                            index
                          }
                          item={
                            item
                          }
                          index={
                            index
                          }
                        />
                      )
                    )}
                  </div>
                ) : (
                  <div
                    className={
                      styles.architectureList
                    }
                  >
                    <div
                      className={
                        styles.architectureItem
                      }
                    >
                      <span>
                        01
                      </span>

                      <div>
                        <strong>
                          Campaign
                        </strong>

                        <small>
                          {safeText(
                            campaign?.campaignName
                          )}
                        </small>
                      </div>
                    </div>

                    <div
                      className={
                        styles.architectureItem
                      }
                    >
                      <span>
                        02
                      </span>

                      <div>
                        <strong>
                          Ad Set
                        </strong>

                        <small>
                          Audience + budget +
                          placements
                        </small>
                      </div>
                    </div>

                    <div
                      className={
                        styles.architectureItem
                      }
                    >
                      <span>
                        03
                      </span>

                      <div>
                        <strong>
                          Ad Creative
                        </strong>

                        <small>
                          AI-generated creative
                          direction
                        </small>
                      </div>
                    </div>

                    <div
                      className={
                        styles.architectureItem
                      }
                    >
                      <span>
                        04
                      </span>

                      <div>
                        <strong>
                          Lead Form /
                          Conversion
                        </strong>

                        <small>
                          Optimized conversion
                          destination
                        </small>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className={
                    styles.optimizationBox
                  }
                >
                  <div>
                    <Sparkles
                      size={15}
                    />

                    AI OPTIMIZATION
                  </div>

                  <strong>
                    {
                      optimization
                    }
                  </strong>
                </div>
              </div>

              {/* =================================================
                  BUDGET + SCHEDULE
              ================================================= */}

              <div
                className={
                  styles.twoColumn
                }
              >
                {/* BUDGET */}

                <div
                  className={
                    styles.infoCard
                  }
                >
                  <SectionTitle
                    icon={
                      Wallet
                    }
                    eyebrow="BUDGET INTELLIGENCE"
                    title="Budget allocation"
                  />

                  <div
                    className={
                      styles.metricRow
                    }
                  >
                    <span>
                      TOTAL BUDGET
                    </span>

                    <strong>
                      {formatCurrency(
                        budgetAmount,
                        budgetCurrency
                      )}
                    </strong>
                  </div>

                  <div
                    className={
                      styles.metricRow
                    }
                  >
                    <span>
                      DAILY AVERAGE
                    </span>

                    <strong>
                      {formatCurrency(
                        dailyBudget,
                        budgetCurrency
                      )}
                    </strong>
                  </div>

                  <div
                    className={
                      styles.metricRow
                    }
                  >
                    <span>
                      BUDGET TYPE
                    </span>

                    <strong>
                      {budgetType}
                    </strong>
                  </div>
                </div>

                {/* SCHEDULE */}

                <div
                  className={
                    styles.infoCard
                  }
                >
                  <SectionTitle
                    icon={
                      CalendarDays
                    }
                    eyebrow="SCHEDULE"
                    title="Campaign timing"
                  />

                  <div
                    className={
                      styles.metricRow
                    }
                  >
                    <span>
                      DURATION
                    </span>

                    <strong>
                      {duration} days
                    </strong>
                  </div>

                  <div
                    className={
                      styles.metricRow
                    }
                  >
                    <span>
                      START
                    </span>

                    <strong>
                      Not selected
                    </strong>
                  </div>

                  <div
                    className={
                      styles.metricRow
                    }
                  >
                    <span>
                      END
                    </span>

                    <strong>
                      Not selected
                    </strong>
                  </div>
                </div>
              </div>

              {/* =================================================
                  PLACEMENTS
              ================================================= */}

              <div
                className={
                  styles.fullInfoCard
                }
              >
                <SectionTitle
                  icon={
                    Globe2
                  }
                  eyebrow="RECOMMENDED PLACEMENTS"
                  title="Where your ads can appear"
                />

                <div
                  className={
                    styles.placementGrid
                  }
                >
                  {placements.length >
                  0 ? (
                    placements.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={
                            index
                          }
                        >
                          <Check
                            size={
                              14
                            }
                          />

                          {safeText(
                            item
                          )}
                        </div>
                      )
                    )
                  ) : (
                    <>
                      <div>
                        <Check
                          size={
                            14
                          }
                        />

                        Facebook Feed
                      </div>

                      <div>
                        <Check
                          size={
                            14
                          }
                        />

                        Instagram Feed
                      </div>

                      <div>
                        <Check
                          size={
                            14
                          }
                        />

                        Instagram Stories
                      </div>

                      <div>
                        <Check
                          size={
                            14
                          }
                        />

                        Instagram Reels
                      </div>

                      <div>
                        <Check
                          size={
                            14
                          }
                        />

                        Facebook Stories
                      </div>
                    </>
                  )}

                  {campaignPlatform ===
                    "Google Ads" && (
                    <div>
                      <Video
                        size={
                          14
                        }
                      />

                      YouTube
                    </div>
                  )}
                </div>
              </div>

              {/* =================================================
                  CREATIVE INTELLIGENCE
              ================================================= */}

              <div
                className={
                  styles.twoColumn
                }
              >
                <div
                  className={
                    styles.infoCard
                  }
                >
                  <SectionTitle
                    icon={
                      Sparkles
                    }
                    eyebrow="CREATIVE INTELLIGENCE"
                    title="Creative direction"
                  />

                  <p
                    style={{
                      margin:
                        "0",
                      lineHeight:
                        "1.6",
                    }}
                  >
                    {
                      creativeDirection
                    }
                  </p>
                </div>

                <div
                  className={
                    styles.infoCard
                  }
                >
                  <SectionTitle
                    icon={
                      Megaphone
                    }
                    eyebrow="AD COPY"
                    title="Messaging direction"
                  />

                  <p
                    style={{
                      margin:
                        "0",
                      lineHeight:
                        "1.6",
                    }}
                  >
                    {
                      adCopyDirection
                    }
                  </p>
                </div>
              </div>

              {/* =================================================
                  LEAD FORM
              ================================================= */}

              <div
                className={
                  styles.fullInfoCard
                }
              >
                <SectionTitle
                  icon={
                    Target
                  }
                  eyebrow="CONVERSION STRATEGY"
                  title="Lead form / conversion"
                />

                <p
                  style={{
                    margin:
                      "0",
                    lineHeight:
                      "1.6",
                  }}
                >
                  {
                    leadFormStrategy
                  }
                </p>
              </div>

              {/* =================================================
                  RECOMMENDATIONS
              ================================================= */}

              <div
                className={
                  styles.recommendationCard
                }
              >
                <SectionTitle
                  icon={
                    Crosshair
                  }
                  eyebrow="MR.A RECOMMENDATIONS"
                  title="Initial campaign guidance"
                />

                <div
                  className={
                    styles.recommendationList
                  }
                >
                  {recommendations.length >
                  0 ? (
                    recommendations.map(
                      (
                        item,
                        index
                      ) => (
                        <AIListItem
                          key={
                            index
                          }
                          item={
                            item
                          }
                          index={
                            index
                          }
                        />
                      )
                    )
                  ) : (
                    <>
                      <AIListItem
                        item={`Target users in ${location} first.`}
                        index={
                          0
                        }
                      />

                      <AIListItem
                        item={`Use ${industry.toLowerCase()}-specific creative messaging.`}
                        index={
                          1
                        }
                      />

                      <AIListItem
                        item="Optimize the campaign toward qualified leads."
                        index={
                          2
                        }
                      />

                      <AIListItem
                        item="Review lead quality before increasing budget."
                        index={
                          3
                        }
                      />
                    </>
                  )}
                </div>
              </div>

              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div
                className={
                  styles.resultActions
                }
              >
                <button
                  type="button"
                  onClick={
                    refineBrief
                  }
                  className={
                    styles.secondaryButton
                  }
                >
                  ← Refine Brief
                </button>

                <button
                  type="button"
                  onClick={
                    continueSetup
                  }
                  className={
                    styles.primaryButton
                  }
                >
                  Continue to
                  Campaign Setup

                  <ArrowRight
                    size={15}
                  />
                </button>
              </div>

              {/* =================================================
                  AI NOTE
              ================================================= */}

              <div
                className={
                  styles.resultNote
                }
              >
                <Sparkles
                  size={13}
                />

                {aiNote}
              </div>
            </section>
          )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer
          className={
            styles.footer
          }
        >
          <strong>
            “Your vision. Amplified by
            AI.”
          </strong>

          <span>
            ANIX AI · POWERED BY CGD MEDIA
          </span>
        </footer>
      </main>
    </AppShell>
  );
}