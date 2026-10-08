"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserPlus,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";

import AppShell from "../../components/AppShell";
import { auth, db } from "../../lib/firebase";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import styles from "./client-users.module.css";

// --------------------------------------------------
// EMPTY FORM
// --------------------------------------------------

const emptyForm = {
  name: "",
  email: "",
  password: "",
  client: "CGD Media",
  role: "Viewer",
  status: "Active",
};

// --------------------------------------------------
// CLIENT OPTIONS
// Temporary until Clients module is connected
// to realtime client documents.
// --------------------------------------------------

const clientOptions = [
  {
    name: "CGD Media",
    id: "cgd-media",
  },
  {
    name: "SRTH Events",
    id: "srth-events",
  },
  {
    name: "Hanuman Events",
    id: "hanuman-events",
  },
];

// --------------------------------------------------
// PAGE
// --------------------------------------------------

export default function ClientUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------------------------
  // LOAD CLIENT USERS FROM FIRESTORE
  // --------------------------------------------------

  useEffect(() => {
    setLoading(true);
    setError("");

    const usersRef = collection(db, "users");

    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        const firebaseUsers = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(
            (user) => user.accountType === "client"
          );

        setUsers(firebaseUsers);
        setLoading(false);
      },
      (firebaseError) => {
        console.error(
          "Firestore users load error:",
          firebaseError
        );

        setError(
          "Unable to load client users. Please check Firestore permissions."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      user.name
        ?.toLowerCase()
        .includes(query) ||
      user.email
        ?.toLowerCase()
        .includes(query) ||
      user.clientName
        ?.toLowerCase()
        .includes(query) ||
      user.role
        ?.toLowerCase()
        .includes(query)
    );
  });

  // --------------------------------------------------
  // OPEN ADD MODAL
  // --------------------------------------------------

  const openAddModal = () => {
    setEditingUser(null);
    setForm({
      ...emptyForm,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // --------------------------------------------------
  // OPEN EDIT MODAL
  // --------------------------------------------------

  const openEditModal = (user) => {
    setEditingUser(user);

    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      client: user.clientName || "CGD Media",
      role: formatRole(user.role),
      status: formatStatus(user.status),
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // --------------------------------------------------
  // CLOSE MODAL
  // --------------------------------------------------

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingUser(null);
    setForm({
      ...emptyForm,
    });

    setError("");
    setSuccess("");
  };

  // --------------------------------------------------
  // FORM CHANGE
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // CREATE / SAVE USER
  // --------------------------------------------------

  const saveUser = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (!form.name.trim()) {
      setError("Please enter the user's full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter the user's email address.");
      return;
    }

    if (!editingUser && !form.password) {
      setError("Please create a password for this user.");
      return;
    }

    if (!editingUser && form.password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (!form.client) {
      setError("Please select a client.");
      return;
    }

    try {
      setSaving(true);

      // --------------------------------------------------
      // CHECK CURRENT ADMIN SESSION
      // --------------------------------------------------

      const currentUser = auth.currentUser;

      if (!currentUser) {
        setError(
          "Your login session has expired. Please login again."
        );
        return;
      }

      // --------------------------------------------------
      // GET ADMIN ID TOKEN
      // --------------------------------------------------

      const idToken =
        await currentUser.getIdToken(true);

      // --------------------------------------------------
      // FIND SELECTED CLIENT
      // --------------------------------------------------

      const selectedClient =
        clientOptions.find(
          (client) =>
            client.name === form.client
        );

      if (!selectedClient) {
        setError("Invalid client selected.");
        return;
      }

      // --------------------------------------------------
      // EDIT
      // --------------------------------------------------

      if (editingUser) {
        setError(
          "User editing will be connected in the next step."
        );

        return;
      }

      // --------------------------------------------------
      // CREATE USER
      // --------------------------------------------------

      const response = await fetch(
        "/api/client-users",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },

          body: JSON.stringify({
            name: form.name.trim(),

            email: form.email
              .trim()
              .toLowerCase(),

            password: form.password,

            clientId: selectedClient.id,

            clientName: selectedClient.name,

            role: form.role,

            status: form.status,
          }),
        }
      );

      // --------------------------------------------------
      // READ RESPONSE SAFELY
      // --------------------------------------------------

      const responseText =
        await response.text();

      let result = {};

      if (responseText.trim()) {
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error(
            "API returned invalid JSON:",
            responseText
          );

          throw new Error(
            "Server returned an invalid response. Check the VS Code terminal for the actual server error."
          );
        }
      }

      // --------------------------------------------------
      // API ERROR
      // --------------------------------------------------

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Server error (${response.status}).`
        );
      }

      if (!result.success) {
        throw new Error(
          result.message ||
            "Unable to create client user."
        );
      }

      // --------------------------------------------------
      // SUCCESS
      // --------------------------------------------------

      setSuccess(
        "Client user created successfully."
      );

      setForm({
        ...emptyForm,
      });

      // Firestore onSnapshot will automatically
      // update the table.

      setTimeout(() => {
        setShowModal(false);
        setSuccess("");
        setEditingUser(null);
      }, 900);
    } catch (err) {
      console.error(
        "Client user creation error:",
        err
      );

      setError(
        err.message ||
          "Unable to create client user."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const deleteUser = (id) => {
    const user = users.find(
      (item) => item.id === id
    );

    if (!user) return;

    alert(
      `Delete functionality will be connected securely in the next step.\n\nUser: ${user.name}`
    );
  };

  // --------------------------------------------------
  // TOGGLE STATUS
  // --------------------------------------------------

  const toggleStatus = (id) => {
    const user = users.find(
      (item) => item.id === id
    );

    if (!user) return;

    alert(
      `Status management will be connected securely in the next step.\n\nUser: ${user.name}`
    );
  };

  // --------------------------------------------------
  // STATS
  // --------------------------------------------------

  const activeUsers = users.filter(
    (user) => user.status === "active"
  ).length;

  const adminUsers = users.filter(
    (user) => user.role === "admin"
  ).length;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <AppShell>
      <main className={styles.page}>
        {/* ==========================================
            HEADER
        ========================================== */}

        <div className={styles.header}>
          <div>
            <div className={styles.eyebrow}>
              ACCESS MANAGEMENT
            </div>

            <h1>Client Users</h1>

            <p className={styles.subtitle}>
              Manage client accounts, roles and
              workspace access.
            </p>
          </div>

          <button
            className={styles.primary}
            onClick={openAddModal}
          >
            <Plus size={18} />
            Add Client User
          </button>
        </div>

        {/* ==========================================
            ERROR OUTSIDE MODAL
        ========================================== */}

        {error && !showModal && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {/* ==========================================
            STATS
        ========================================== */}

        <div className={styles.stats}>
          <Stat
            icon={UserCheck}
            title="Total Users"
            value={users.length}
          />

          <Stat
            icon={ShieldCheck}
            title="Active Users"
            value={activeUsers}
          />

          <Stat
            icon={UserPlus}
            title="Admin Users"
            value={adminUsers}
          />
        </div>

        {/* ==========================================
            USERS CARD
        ========================================== */}

        <div className={styles.card}>
          <div className={styles.toolbar}>
            <div className={styles.search}>
              <Search size={18} />

              <input
                type="text"
                placeholder="Search users..."
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
                  <th>User</th>
                  <th>Client</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {/* LOADING */}

                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className={styles.empty}
                    >
                      Loading client users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  /* EMPTY */

                  <tr>
                    <td
                      colSpan="6"
                      className={styles.empty}
                    >
                      {search
                        ? "No users found."
                        : "No client users created yet."}
                    </td>
                  </tr>
                ) : (
                  /* USERS */

                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      {/* USER */}

                      <td>
                        <div
                          className={styles.user}
                        >
                          <div
                            className={styles.avatar}
                          >
                            {getInitials(
                              user.name
                            )}
                          </div>

                          <div>
                            <strong>
                              {user.name ||
                                "Unnamed User"}
                            </strong>

                            <span>
                              {user.email ||
                                "No email"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CLIENT */}

                      <td>
                        <div
                          className={styles.client}
                        >
                          {user.clientName || "—"}
                        </div>
                      </td>

                      {/* ROLE */}

                      <td>
                        <span
                          className={`${styles.role} ${
                            styles[
                              user.role ||
                                "viewer"
                            ]
                          }`}
                        >
                          {formatRole(
                            user.role
                          )}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`${styles.status} ${
                            user.status ===
                            "active"
                              ? styles.active
                              : styles.inactive
                          }`}
                        >
                          {formatStatus(
                            user.status
                          )}
                        </span>
                      </td>

                      {/* LAST LOGIN */}

                      <td>
                        <span
                          className={
                            styles.login
                          }
                        >
                          {user.lastLogin ||
                            "Never"}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td>
                        <div
                          className={
                            styles.actions
                          }
                        >
                          <button
                            type="button"
                            title="Edit"
                            onClick={() =>
                              openEditModal(user)
                            }
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            title="Status"
                            onClick={() =>
                              toggleStatus(
                                user.id
                              )
                            }
                          >
                            <MoreHorizontal
                              size={17}
                            />
                          </button>

                          <button
                            type="button"
                            title="Delete"
                            onClick={() =>
                              deleteUser(
                                user.id
                              )
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

        {/* ==========================================
            MODAL
        ========================================== */}

        {showModal && (
          <div className={styles.overlay}>
            <div className={styles.modal}>
              {/* MODAL HEADER */}

              <div
                className={styles.modalHeader}
              >
                <div>
                  <div
                    className={
                      styles.modalEyebrow
                    }
                  >
                    {editingUser
                      ? "EDIT CLIENT USER"
                      : "NEW CLIENT USER"}
                  </div>

                  <h2>
                    {editingUser
                      ? "Edit User"
                      : "Add Client User"}
                  </h2>
                </div>

                <button
                  type="button"
                  className={styles.close}
                  onClick={closeModal}
                  disabled={saving}
                >
                  <X size={20} />
                </button>
              </div>

              {/* FORM */}

              <form
                onSubmit={saveUser}
                className={styles.form}
              >
                <div
                  className={
                    styles.formGrid
                  }
                >
                  {/* NAME */}

                  <div
                    className={styles.field}
                  >
                    <label>
                      Full Name
                    </label>

                    <input
                      name="name"
                      type="text"
                      placeholder="Enter full name"
                      value={form.name}
                      onChange={handleChange}
                      disabled={saving}
                      autoComplete="name"
                    />
                  </div>

                  {/* EMAIL */}

                  <div
                    className={styles.field}
                  >
                    <label>
                      Email Address
                    </label>

                    <input
                      name="email"
                      type="email"
                      placeholder="user@example.com"
                      value={form.email}
                      onChange={handleChange}
                      disabled={
                        saving ||
                        !!editingUser
                      }
                      autoComplete="email"
                    />
                  </div>

                  {/* PASSWORD */}

                  {!editingUser && (
                    <div
                      className={
                        styles.field
                      }
                    >
                      <label>
                        Password
                      </label>

                      <input
                        name="password"
                        type="password"
                        placeholder="Create login password"
                        value={form.password}
                        onChange={
                          handleChange
                        }
                        disabled={saving}
                        autoComplete="new-password"
                      />
                    </div>
                  )}

                  {/* CLIENT */}

                  <div
                    className={styles.field}
                  >
                    <label>
                      Client
                    </label>

                    <select
                      name="client"
                      value={form.client}
                      onChange={handleChange}
                      disabled={saving}
                    >
                      {clientOptions.map(
                        (client) => (
                          <option
                            key={client.id}
                            value={
                              client.name
                            }
                          >
                            {client.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* ROLE */}

                  <div
                    className={styles.field}
                  >
                    <label>
                      Role
                    </label>

                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      disabled={saving}
                    >
                      <option value="Admin">
                        Admin
                      </option>

                      <option value="Manager">
                        Manager
                      </option>

                      <option value="Viewer">
                        Viewer
                      </option>
                    </select>
                  </div>

                  {/* STATUS */}

                  <div
                    className={styles.field}
                  >
                    <label>
                      Status
                    </label>

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      disabled={saving}
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

                {/* ERROR */}

                {error && (
                  <div
                    className={
                      styles.error
                    }
                  >
                    {error}
                  </div>
                )}

                {/* SUCCESS */}

                {success && (
                  <div
                    className={
                      styles.success
                    }
                  >
                    {success}
                  </div>
                )}

                {/* FOOTER */}

                <div
                  className={
                    styles.modalFooter
                  }
                >
                  <button
                    type="button"
                    className={
                      styles.cancel
                    }
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
                    {saving
                      ? "Creating..."
                      : editingUser
                      ? "Save Changes"
                      : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}

// ==================================================
// STAT COMPONENT
// ==================================================

function Stat({
  icon: Icon,
  title,
  value,
}) {
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

// ==================================================
// GET INITIALS
// ==================================================

function getInitials(name = "") {
  const cleanName = name.trim();

  if (!cleanName) {
    return "U";
  }

  const parts = cleanName.split(/\s+/);

  if (parts.length === 1) {
    return (
      parts[0]
        ?.charAt(0)
        .toUpperCase() || "U"
    );
  }

  return (
    (parts[0]?.charAt(0) || "") +
    (
      parts[parts.length - 1]
        ?.charAt(0) || ""
    )
  ).toUpperCase();
}

// ==================================================
// FORMAT ROLE
// ==================================================

function formatRole(role) {
  if (!role) {
    return "Viewer";
  }

  return (
    role.charAt(0).toUpperCase() +
    role.slice(1).toLowerCase()
  );
}

// ==================================================
// FORMAT STATUS
// ==================================================

function formatStatus(status) {
  if (!status) {
    return "Inactive";
  }

  return (
    status.charAt(0).toUpperCase() +
    status.slice(1).toLowerCase()
  );
}