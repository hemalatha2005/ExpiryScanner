// src/components/Header.js
import React from "react";
import logo from "../assets/logo3.png";

export default function Header({ onShowScanner, onShowProfile, user }) {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const activeUser = user && Object.keys(user).length > 0 ? user : storedUser;
  const fullName =
    activeUser?.fullName ||
    `${activeUser?.firstName || ""} ${activeUser?.lastName || ""}`.trim() ||
    "User";
  const email = activeUser?.email || "";
  const profileKey =
    activeUser?._id
      ? `profile:${activeUser._id}:image`
      : activeUser?.email
      ? `profile:${activeUser.email}:image`
      : "profile:default:image";
  const legacyProfileKey =
    activeUser?._id
      ? `profileImage:${activeUser._id}`
      : activeUser?.email
      ? `profileImage:${activeUser.email}`
      : "profileImage:default";
  const profileImage =
    localStorage.getItem(profileKey) ||
    localStorage.getItem(legacyProfileKey) ||
    activeUser?.profileImage ||
    "";

  return (
    <header className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <img
            src={logo}
            alt="App Logo"
            className="w-auto h-10 object-contain"
          />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {onShowScanner && (
            <button
              onClick={onShowScanner}
              className="px-3 py-2 bg-[#142D4C] text-white rounded-lg hover:bg-[#5682B1] transition"
            >
              Open Scanner
            </button>
          )}

          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={onShowProfile}
          >
            <div className="text-right">
              <div className="text-sm font-medium">{fullName}</div>
              <div className="text-xs text-gray-500">{email}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
