import React, { useState } from "react";
import Lottie from "lottie-react";
import AuthCard from "../components/auth/AuthCard";

// ✅ IMPORT YOUR JSON FILE
import authBgAnimation from "../assets/Gradient Header.json";

export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("signup");

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* 🎞️ LOTTIE BACKGROUND */}
      <Lottie
        animationData={authBgAnimation}
        loop
        autoplay
        className="absolute inset-0 w-full h-full object-cover opacity-90 scale-110 -translate-y-4"

      />

      {/* 🌫️ OVERLAY FOR READABILITY */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />

      {/* 🔐 AUTH CARD */}
      <div className="relative z-10">
        <AuthCard
          mode={mode}
          setMode={setMode}
          onAuthSuccess={onAuthSuccess}
        />
      </div>

    </div>
  );
}
