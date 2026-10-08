"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Megaphone,
  Play,
  Pause,
  Wallet,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react";

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../lib/firebase";
import AppShell from "../../components/AppShell";

import styles from "./campaigns.module.css";

const EMPTY_FORM = {
  name: "",
  client: "",
  platform: "Meta",
  objective: "Traffic",
  budget: "",
  status: "Draft",
  spend: 0,
  results: 0,
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [clients, setClients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  /* =========================
     LOAD CAMPAIGNS
  ========================= */

  const loadCampaigns = async () => {
    try {
      setLoading(true);

      const snapshot = await getDocs(
        collection(db, "campaigns")
      );

      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setCampaigns(data);
    } catch (error) {
      console.error("Failed to load campaigns:", error);
      alert(
        "Unable to load campaigns. Please check Firestore permissions."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LOAD CLIENTS
  ========================= */

  const loadClients = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "clients")
      );

      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setClients(data);
    } catch (error) {
      console.error("Failed to load clients:", error);
    }
  };

  useEffect(() => {
    loadCampaigns();
    loadClients();
  }, []);

  /* =========================
     NORMALIZE DATA
  ========================= */

  const normalizedCampaigns = useMemo(() => {
    return campaigns.map((campaign) => ({
      ...campaign,

      displayName:
        campaign.name ||
        campaign.campaignName ||
        "Untitled Campaign",

      displayClient:
        campaign.client ||
        campaign.clientName ||
        "No client",

      displayPlatform:
        campaign.platform || "Meta",

      displayObjective:
        campaign.objective || "Traffic",

      displayBudget:
        Number(campaign.budget || 0),

      displaySpend:
        Number(campaign.spend || 0),

      displayResults:
        Number(campaign.results || 0),

      displayStatus:
        campaign.status || "Draft",
    }));
  }, [campaigns]);

  /* =========================
     SEARCH + FILTER
  ========================= */

  const filteredCampaigns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalizedCampaigns.filter((campaign) => {
      const matchesSearch =
        !query ||
        campaign.displayName
          .toLowerCase()
          .includes(query) ||
        campaign.displayClient
          .toLowerCase()
          .includes(query) ||
        campaign.displayPlatform
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === "All" ||
        campaign.displayStatus.toLowerCase() ===
          filter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [normalizedCampaigns, search, filter]);

  /* =========================
     STATISTICS
  ========================= */

  const totalCampaigns = normalizedCampaigns.length;

  const activeCampaigns = normalizedCampaigns.filter(
    (campaign) =>
      campaign.displayStatus.toLowerCase() === "active"
  ).length;

  const pausedCampaigns = normalizedCampaigns.filter(
    (campaign) =>
      campaign.displayStatus.toLowerCase() === "paused"
  ).length;

  const totalBudget = normalizedCampaigns.reduce(
    (total, campaign) =>
      total + campaign.displayBudget,
    0
  );

  /* =========================
     OPEN CREATE
  ========================= */

  const openCreate = () => {
    setEditingId(null);

    setForm({
      ...EMPTY_FORM,
      client:
        clients.length > 0
          ? clients[0].name ||
            clients[0].clientName ||
            ""
          : "",
    });

    setModalOpen(true);
  };

  /* =========================
     OPEN EDIT
  ========================= */

  const openEdit = (campaign) => {
    setEditingId(campaign.id);

    setForm({
      name:
        campaign.name ||
        campaign.campaignName ||
        "",

      client:
        campaign.client ||
        campaign.clientName ||
        "",

      platform:
        campaign.platform ||
        "Meta",

      objective:
        campaign.objective ||
        "Traffic",

      budget:
        campaign.budget ?? "",

      status:
        campaign.status ||
        "Draft",

      spend:
        campaign.spend || 0,

      results:
        campaign.results || 0,
    });

    setModalOpen(true);
  };

  /* =========================
     CLOSE MODAL
  ========================= */

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  /* =========================
     FORM CHANGE
  ========================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================
     SAVE CAMPAIGN
  ========================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter a campaign name.");
      return;
    }

    if (!form.client.trim()) {
      alert("Please enter a client name.");
      return;
    }

    if (!form.budget) {
      alert("Please enter a campaign budget.");
      return;
    }

    try {
      setSaving(true);

      const campaignData = {
        name: form.name.trim(),
        client: form.client.trim(),
        platform: form.platform,
        objective: form.objective,
        budget: Number(form.budget),
        status: form.status,
        spend: Number(form.spend || 0),
        results: Number(form.results || 0),
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(
          doc(db, "campaigns", editingId),
          campaignData
        );
      } else {
        await addDoc(collection(db, "campaigns"), {
          ...campaignData,
          createdAt: serverTimestamp(),
        });
      }

      await loadCampaigns();

      closeModal();
    } catch (error) {
      console.error("Save campaign error:", error);

      alert(
        "Unable to save campaign. Please check Firestore permissions."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     DELETE
  ========================= */

  const handleDelete = async (campaign) => {
    const confirmed = window.confirm(
      `Delete "${campaign.displayName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteDoc(
        doc(db, "campaigns", campaign.id)
      );

      await loadCampaigns();
    } catch (error) {
      console.error("Delete campaign error:", error);

      alert(
        "Unable to delete campaign. Please check Firestore permissions."
      );
    }
  };

  return (
    <AppShell>
      <div className={styles.page}>
        {/* ================= HEADER ================= */}

        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              CAMPAIGN MANAGEMENT
            </p>

            <h1>Campaigns</h1>

            <p className={styles.subtitle}>
              Create, manage and monitor your advertising
              campaigns.
            </p>
          </div>

          <button
            className={styles.createButton}
            onClick={openCreate}
          >
            <Plus size={17} />
            Create Campaign
          </button>
        </div>

        {/* ================= STATS ================= */}

        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statIcon}>
              <Megaphone size={18} />
            </div>

            <div>
              <span>Total Campaigns</span>
              <strong>{totalCampaigns}</strong>
            </div>
          </div>

          <div className={styles.stat}>
            <div className={styles.statIcon}>
              <Play size={18} />
            </div>

            <div>
              <span>Active</span>
              <strong>{activeCampaigns}</strong>
            </div>
          </div>

          <div className={styles.stat}>
            <div className={styles.statIcon}>
              <Pause size={18} />
            </div>

            <div>
              <span>Paused</span>
              <strong>{pausedCampaigns}</strong>
            </div>
          </div>

          <div className={styles.stat}>
            <div className={styles.statIcon}>
              <Wallet size={18} />
            </div>

            <div>
              <span>Total Budget</span>

              <strong>
                ₹
                {totalBudget.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>
        </div>

        {/* ================= CAMPAIGN CARD ================= */}

        <div className={styles.card}>
          <div className={styles.toolbar}>
            <div>
              <h2>All Campaigns</h2>

              <p>
                Manage your agency campaigns
              </p>
            </div>

            <div className={styles.search}>
              <Search size={16} />

              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>
          </div>

          {/* FILTERS */}

          <div className={styles.filters}>
            {[
              "All",
              "Active",
              "Paused",
              "Draft",
              "Completed",
            ].map((item) => (
              <button
                key={item}
                className={
                  filter === item
                    ? styles.filterActive
                    : styles.filterButton
                }
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {/* TABLE */}

          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>CAMPAIGN</th>
                  <th>CLIENT</th>
                  <th>PLATFORM</th>
                  <th>OBJECTIVE</th>
                  <th>BUDGET</th>
                  <th>STATUS</th>
                  <th>SPEND</th>
                  <th>RESULTS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="9"
                      className={styles.empty}
                    >
                      Loading campaigns...
                    </td>
                  </tr>
                ) : filteredCampaigns.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className={styles.empty}
                    >
                      <Megaphone
                        size={32}
                        strokeWidth={1.4}
                      />

                      <strong>
                        No campaigns found
                      </strong>

                      <span>
                        Create your first campaign to
                        get started.
                      </span>
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td>
                        <div className={styles.campaignName}>
                          <div className={styles.logo}>
                            {campaign.displayName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <strong>
                            {campaign.displayName}
                          </strong>
                        </div>
                      </td>

                      <td>
                        {campaign.displayClient}
                      </td>

                      <td>
                        <span className={styles.platform}>
                          {campaign.displayPlatform}
                        </span>
                      </td>

                      <td>
                        {campaign.displayObjective}
                      </td>

                      <td>
                        <strong className={styles.money}>
                          ₹
                          {campaign.displayBudget.toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`${styles.status} ${
                            styles[
                              campaign.displayStatus
                                .toLowerCase()
                            ] || styles.draft
                          }`}
                        >
                          <i />
                          {campaign.displayStatus}
                        </span>
                      </td>

                      <td>
                        ₹
                        {campaign.displaySpend.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td>
                        {campaign.displayResults}
                      </td>

                      <td>
                        <div className={styles.actions}>
                          <button
                            title="Edit campaign"
                            onClick={() =>
                              openEdit(campaign)
                            }
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            title="Delete campaign"
                            onClick={() =>
                              handleDelete(campaign)
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= MODAL ================= */}

        {modalOpen && (
          <div
            className={styles.modalOverlay}
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeModal();
              }
            }}
          >
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <div>
                  <span>
                    CAMPAIGN MANAGEMENT
                  </span>

                  <h2>
                    {editingId
                      ? "Edit Campaign"
                      : "Create Campaign"}
                  </h2>
                </div>

                <button
                  onClick={closeModal}
                  disabled={saving}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                  {/* NAME */}

                  <label>
                    Campaign Name

                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Digital Marketing Leads"
                    />
                  </label>

                  {/* CLIENT */}

                  <label>
                    Client

                    {clients.length > 0 ? (
                      <select
                        name="client"
                        value={form.client}
                        onChange={handleChange}
                      >
                        <option value="">
                          Select client
                        </option>

                        {clients.map((client) => {
                          const clientName =
                            client.name ||
                            client.clientName ||
                            "Unnamed Client";

                          return (
                            <option
                              key={client.id}
                              value={clientName}
                            >
                              {clientName}
                            </option>
                          );
                        })}
                      </select>
                    ) : (
                      <input
                        name="client"
                        value={form.client}
                        onChange={handleChange}
                        placeholder="Enter client name"
                      />
                    )}
                  </label>

                  {/* PLATFORM */}

                  <label>
                    Platform

                    <select
                      name="platform"
                      value={form.platform}
                      onChange={handleChange}
                    >
                      <option value="Meta">
                        Meta
                      </option>

                      <option value="Google">
                        Google
                      </option>

                      <option value="Instagram">
                        Instagram
                      </option>

                      <option value="LinkedIn">
                        LinkedIn
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </label>

                  {/* OBJECTIVE */}

                  <label>
                    Objective

                    <select
                      name="objective"
                      value={form.objective}
                      onChange={handleChange}
                    >
                      <option value="Traffic">
                        Traffic
                      </option>

                      <option value="Leads">
                        Leads
                      </option>

                      <option value="Sales">
                        Sales
                      </option>

                      <option value="Engagement">
                        Engagement
                      </option>

                      <option value="Awareness">
                        Awareness
                      </option>

                      <option value="Conversions">
                        Conversions
                      </option>
                    </select>
                  </label>

                  {/* BUDGET */}

                  <label>
                    Budget

                    <input
                      type="number"
                      min="0"
                      name="budget"
                      value={form.budget}
                      onChange={handleChange}
                      placeholder="10000"
                    />
                  </label>

                  {/* STATUS */}

                  <label>
                    Status

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="Draft">
                        Draft
                      </option>

                      <option value="Active">
                        Active
                      </option>

                      <option value="Paused">
                        Paused
                      </option>

                      <option value="Completed">
                        Completed
                      </option>
                    </select>
                  </label>

                  {/* SPEND */}

                  <label>
                    Spend

                    <input
                      type="number"
                      min="0"
                      name="spend"
                      value={form.spend}
                      onChange={handleChange}
                    />
                  </label>

                  {/* RESULTS */}

                  <label>
                    Results

                    <input
                      type="number"
                      min="0"
                      name="results"
                      value={form.results}
                      onChange={handleChange}
                    />
                  </label>
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancel}
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className={styles.save}
                    disabled={saving}
                  >
                    <Save size={16} />

                    {saving
                      ? "Saving..."
                      : editingId
                      ? "Update Campaign"
                      : "Create Campaign"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}