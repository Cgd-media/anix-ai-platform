"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  Megaphone,
  WalletCards,
  X,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
} from "lucide-react";

import AppShell from "../../components/AppShell";
import styles from "./clients.module.css";

const initialClients = [
  {
    id: 1,
    name: "CGD Media",
    business: "Digital Marketing Agency",
    email: "cgd@gmail.com",
    phone: "+91 88888 11111",
    campaigns: 0,
    spend: "₹0",
    status: "Active",
  },
  {
    id: 2,
    name: "SRTH Events",
    business: "Events & Decorations",
    email: "srthevents@gmail.com",
    phone: "+91 95503 50683",
    campaigns: 3,
    spend: "₹18,250",
    status: "Active",
  },
  {
    id: 3,
    name: "Hanuman Events",
    business: "Event Management",
    email: "hanumanevents@gmail.com",
    phone: "+91 90000 11111",
    campaigns: 2,
    spend: "₹10,700",
    status: "Active",
  },
];

const emptyForm = {
  name: "",
  business: "",
  email: "",
  phone: "",
  status: "Active",
};

export default function ClientsPage() {
  const [clients, setClients] = useState(initialClients);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.business.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingClient(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);

    setForm({
      name: client.name,
      business: client.business,
      email: client.email,
      phone: client.phone,
      status: client.status,
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingClient(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const saveClient = (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.business.trim() ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      return;
    }

    if (editingClient) {
      setClients((current) =>
        current.map((client) =>
          client.id === editingClient.id
            ? {
                ...client,
                name: form.name.trim(),
                business: form.business.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                status: form.status,
              }
            : client
        )
      );
    } else {
      const newClient = {
        id: Date.now(),
        name: form.name.trim(),
        business: form.business.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        campaigns: 0,
        spend: "₹0",
        status: form.status,
      };

      setClients((current) => [newClient, ...current]);
    }

    closeModal();
  };

  const deleteClient = (id) => {
    const client = clients.find((item) => item.id === id);

    if (!client) return;

    if (!window.confirm(`Delete ${client.name}?`)) return;

    setClients((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const activeClients = clients.filter(
    (client) => client.status === "Active"
  ).length;

  const activeCampaigns = clients.reduce(
    (total, client) => total + client.campaigns,
    0
  );

  return (
    <AppShell>
      <main className={styles.page}>
        {/* HEADER */}
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              CRM / CLIENT MANAGEMENT
            </p>

            <h1>Clients</h1>

            <p>
              Manage your agency clients and their advertising
              accounts.
            </p>
          </div>

          <button
            className={styles.primary}
            onClick={openAddModal}
          >
            <Plus size={17} />
            Add Client
          </button>
        </div>

        {/* STATS */}
        <div className={styles.stats}>
          <Stat
            icon={Users}
            title="Total Clients"
            value={clients.length}
          />

          <Stat
            icon={Megaphone}
            title="Active Campaigns"
            value={activeCampaigns}
          />

          <Stat
            icon={WalletCards}
            title="Active Clients"
            value={activeClients}
          />
        </div>

        {/* CLIENT TABLE */}
        <section className={styles.card}>
          <div className={styles.toolbar}>
            <div>
              <h2>All Clients</h2>

              <p>
                {clients.length} clients in your workspace.
              </p>
            </div>

            <div className={styles.search}>
              <Search size={17} />

              <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>CLIENT</th>
                  <th>BUSINESS</th>
                  <th>CONTACT</th>
                  <th>CAMPAIGNS</th>
                  <th>AD SPEND</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div className={styles.client}>
                        <div className={styles.avatar}>
                          {client.name.charAt(0).toUpperCase()}
                        </div>

                        <strong>{client.name}</strong>
                      </div>
                    </td>

                    <td>{client.business}</td>

                    <td>
                      <div className={styles.contact}>
                        <span>{client.email}</span>
                        <small>{client.phone}</small>
                      </div>
                    </td>

                    <td>{client.campaigns}</td>

                    <td>{client.spend}</td>

                    <td>
                      <span
                        className={`${styles.status} ${
                          client.status === "Active"
                            ? styles.active
                            : styles.inactive
                        }`}
                      >
                        <i />
                        {client.status}
                      </span>
                    </td>

                    <td>
                      <div className={styles.actions}>
                        {/* EDIT */}
                        <button
                          title="Edit Client"
                          onClick={() =>
                            openEditModal(client)
                          }
                        >
                          <Pencil size={15} />
                        </button>

                        {/* DELETE */}
                        <button
                          title="Delete Client"
                          onClick={() =>
                            deleteClient(client.id)
                          }
                        >
                          <Trash2 size={15} />
                        </button>

                        {/* MORE */}
                        <button title="More">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className={styles.empty}>
              <Users size={28} />

              <strong>No clients found</strong>

              <span>
                Try another search or add a new client.
              </span>
            </div>
          )}
        </section>
      </main>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div
          className={styles.overlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className={styles.modal}>
            {/* MODAL HEADER */}
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalEyebrow}>
                  CLIENT MANAGEMENT
                </p>

                <h2>
                  {editingClient
                    ? "Edit Client"
                    : "Add Client"}
                </h2>

                <p>
                  {editingClient
                    ? "Update client information."
                    : "Add a new client to your workspace."}
                </p>
              </div>

              <button
                className={styles.closeButton}
                onClick={closeModal}
                type="button"
                title="Close"
              >
                <X size={19} />
              </button>
            </div>

            {/* FORM */}
            <form
              className={styles.form}
              onSubmit={saveClient}
            >
              <div className={styles.formGrid}>
                {/* CLIENT NAME */}
                <div className={styles.field}>
                  <label>
                    Client Name
                    <span>*</span>
                  </label>

                  <div className={styles.inputBox}>
                    <Users size={16} />

                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. CGD Media"
                      value={form.name}
                      onChange={handleChange}
                      autoFocus
                    />
                  </div>
                </div>

                {/* BUSINESS */}
                <div className={styles.field}>
                  <label>
                    Business Name
                    <span>*</span>
                  </label>

                  <div className={styles.inputBox}>
                    <Building2 size={16} />

                    <input
                      type="text"
                      name="business"
                      placeholder="e.g. Digital Marketing Agency"
                      value={form.business}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div className={styles.field}>
                  <label>
                    Email
                    <span>*</span>
                  </label>

                  <div className={styles.inputBox}>
                    <Mail size={16} />

                    <input
                      type="email"
                      name="email"
                      placeholder="client@email.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* PHONE */}
                <div className={styles.field}>
                  <label>
                    Phone
                    <span>*</span>
                  </label>

                  <div className={styles.inputBox}>
                    <Phone size={16} />

                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* STATUS */}
                <div className={styles.field}>
                  <label>Status</label>

                  <div className={styles.selectBox}>
                    <CheckCircle2 size={16} />

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="Active">
                        Active
                      </option>

                      <option value="Inactive">
                        Inactive
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.saveButton}
                >
                  {editingClient
                    ? "Update Client"
                    : "Save Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Stat({ icon: Icon, title, value }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statIcon}>
        <Icon size={18} />
      </div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}