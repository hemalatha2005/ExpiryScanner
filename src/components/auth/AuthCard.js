import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  const isFormValid =
    email.trim() &&
    password.trim() &&
    (!isSignup || (firstName.trim() && lastName.trim()));

  const handleSubmit = () => {
    if (!isFormValid) return;

    const fullName = isSignup
      ? `${firstName.trim()} ${lastName.trim()}`
      : email.split("@")[0];

    const user = {
      fullName,
      email: email.trim(),
    };

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("token", "demo-token"); // placeholder for backend JWT

    onAuthSuccess(user);
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

          <input
            type="password"
            className="auth-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* SUBMIT */}
          <button
            disabled={!isFormValid}
            onClick={handleSubmit}
            className={`w-full mt-4 py-3 rounded-lg font-medium transition
              ${
                isFormValid
                  ? "bg-[#142D4C] text-white hover:bg-[#5682B1]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            {isSignup ? "Create account" : "Sign in"}
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
