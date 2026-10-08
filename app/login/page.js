"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

import { auth, db } from "../../lib/firebase";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      // -----------------------------------------
      // 1. Firebase Authentication
      // -----------------------------------------
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

      const firebaseUser = userCredential.user;

      // -----------------------------------------
      // 2. Get ANIX AI user profile from Firestore
      // -----------------------------------------
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await auth.signOut();

        setError(
          "Your ANIX AI user profile was not found. Please contact your administrator."
        );

        return;
      }

      const userData = userSnap.data();

      const role = String(userData.role || "").toLowerCase();
      const accountType = String(
        userData.accountType || ""
      ).toLowerCase();

      const status = String(
        userData.status || ""
      ).toLowerCase();

      // -----------------------------------------
      // 3. Check account status
      // -----------------------------------------
      if (status !== "active") {
        await auth.signOut();

        setError(
          "Your account is inactive. Please contact your administrator."
        );

        return;
      }

      // -----------------------------------------
      // 4. Agency Admin
      // -----------------------------------------
      if (
        role === "admin" &&
        accountType !== "client"
      ) {
        router.replace("/");
        return;
      }

      // -----------------------------------------
      // 5. Client User
      // -----------------------------------------
      if (
        accountType === "client" &&
        userData.clientId
      ) {
        router.replace("/client-dashboard");
        return;
      }

      // -----------------------------------------
      // 6. Unknown account configuration
      // -----------------------------------------
      await auth.signOut();

      setError(
        "Your account configuration is incomplete. Please contact your administrator."
      );
    } catch (err) {
      console.error("Login error:", err);

      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        setError("Invalid email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError(
          "Too many attempts. Please try again later."
        );
      } else {
        setError(
          err.message ||
            "Unable to sign in. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>

        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.logo}>A</div>

          <div className={styles.brandText}>
            <strong>ANIX AI</strong>
            <span>Powered by CGD Media</span>
          </div>
        </div>

        {/* Heading */}
        <div className={styles.heading}>
          <h1>Welcome back</h1>
          <p>
            Sign in to your ANIX AI workspace.
          </p>
        </div>

        {/* Form */}
        <form
          className={styles.form}
          onSubmit={handleLogin}
        >

          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label}>
              Email address
            </label>

            <input
              className={styles.input}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label}>
                Password
              </label>

              <button
                type="button"
                className={styles.forgot}
                onClick={() => {
                  setError(
                    "Password reset will be available soon."
                  );
                }}
              >
                Forgot password?
              </button>
            </div>

            <div className={styles.passwordBox}>
              <input
                className={styles.input}
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className={styles.showPassword}
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {/* Remember */}
          <div className={styles.options}>
            <label className={styles.remember}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) =>
                  setRemember(
                    e.target.checked
                  )
                }
              />
              Remember me
            </label>
          </div>

          {/* Login */}
          <button
            className={styles.button}
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>

        </form>

        {/* Footer */}
        <div className={styles.footer}>
          <strong>ANIX AI</strong>
          <span>
            Secure agency workspace
          </span>
        </div>

      </div>
    </main>
  );
}