import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function AuthCard({
  mode = "signup",
  setMode = () => {},
  onAuthSuccess,
}) {
  const isSignup = mode === "signup";

  // FORM STATE
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const emailOk = email.includes("@") && email.includes(".com");
  const passwordOk = password.length >= 6;
  const confirmOk = !isSignup || (confirmPassword && confirmPassword === password);

  const isFormValid = Boolean(
    email.trim() &&
      password.trim() &&
      emailOk &&
      passwordOk &&
      confirmOk &&
      (!isSignup || (firstName.trim() && lastName.trim()))
  );

  const handleSubmit = async () => {
    if (!isFormValid || loading) return;

    setLoading(true);

    try {
      const endpoint = isSignup
        ? `${API_BASE}/api/auth/signup`
        : `${API_BASE}/api/auth/login`;

      const payload = isSignup
        ? { firstName, lastName, email, password }
        : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        data = null;
      }

      if (!res.ok) {
        const msg = data?.message || "Authentication failed";
        alert(msg);
        return;
      }

      if (!data?.token || !data?.user) {
        alert("Invalid response from server");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isAuthenticated", "true");

      onAuthSuccess?.(data.user);
    } catch (err) {
      console.error(err);
      alert(`Backend not reachable: ${err?.message || "network error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      className="w-[420px] rounded-2xl bg-white/70 backdrop-blur-xl shadow-2xl p-6"
    >
      {/* TOGGLE */}
      <div className="flex bg-white/60 rounded-full p-1 mb-6">
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 py-2 rounded-full text-sm font-medium transition
            ${isSignup ? "bg-white shadow" : "text-gray-500"}`}
        >
          Sign up
        </button>
        <button
          onClick={() => setMode("login")}
          className={`flex-1 py-2 rounded-full text-sm font-medium transition
            ${!isSignup ? "bg-white shadow" : "text-gray-500"}`}
        >
          Sign in
        </button>
      </div>

      {/* TITLE */}
      <h2 className="text-xl font-semibold mb-4">
        {isSignup ? "Create an account" : "Welcome back"}
      </h2>

      {/* FORM */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: isSignup ? 40 : -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isSignup ? -40 : 40 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          {isSignup && (
            <div className="flex gap-2">
              <input
                className="auth-input"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                className="auth-input"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          )}

          <input
            className="auth-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {email && !emailOk && (
            <p className="text-xs text-red-500">
              Email must include @ and .com
            </p>
          )}

          <input
            type="password"
            className="auth-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password && !passwordOk && (
            <p className="text-xs text-red-500">
              Password must be at least 6 characters
            </p>
          )}

          {isSignup && (
            <>
              <input
                type="password"
                className="auth-input"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword && !confirmOk && (
                <p className="text-xs text-red-500">
                  Passwords do not match
                </p>
              )}
            </>
          )}

          {/* SUBMIT */}
          <button
            disabled={!isFormValid || loading}
            onClick={handleSubmit}
            className={`w-full mt-4 py-3 rounded-lg font-medium transition
              ${
                isFormValid && !loading
                  ? "bg-[#142D4C] text-white hover:bg-[#5682B1]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            {loading
              ? isSignup
                ? "Creating..."
                : "Signing in..."
              : isSignup
                ? "Create account"
                : "Sign in"}
          </button>
        </motion.div>
      </AnimatePresence>

      {/* FOOTER */}
      <p className="text-[11px] text-gray-500 mt-4 text-center">
        By continuing, you agree to our Terms & Privacy Policy
      </p>
    </motion.div>
  );
}
