// src/components/Sidebar.js
import React from "react";
import logo from "../assets/logo2.png";

const NavItem = ({ icon, label, collapsed, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition
               text-gray-300 hover:bg-white/5"
  >
    <div className="w-6 h-6 text-lg">{icon}</div>
    {!collapsed && (
      <div className="text-sm font-medium whitespace-nowrap">{label}</div>
    )}
  </div>
);
export default function Sidebar({
  onShowScanner,
  onShowDashboard,
  onShowItems,
  onShowProfile,
  onLogout,
  collapsed,
  onToggleSidebar,
  user,
}) {
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
    <aside
      className={`bg-[#142D4C] text-gray-200 min-h-screen sticky top-0
              transition-[width] duration-500 ease-in-out
              ${collapsed ? "w-16" : "w-64"} flex flex-col`}
    >

      <div className="px-4 py-4 relative">

        {/* ☰ TOGGLE */}
        <button
          onClick={onToggleSidebar}
          className="absolute top-4 left-4 h-9 w-9 rounded-full border border-white/10 bg-white/5 text-lg text-gray-200 shadow-sm transition hover:bg-white/10 hover:text-white"
          aria-label="Toggle sidebar"
        >
          <span className="block -mt-[1px]">☰</span>
        </button>

        {/* LOGO */}
        <div className="flex items-center gap-3 px-4 py-3 mb-6 mt-12">
          <div className="w-8 h-8">
            <img
              src={logo}
              alt="App Logo"
              className="w-full h-full object-contain"
            />
          </div>

          {!collapsed && (
            <div>
              <div className="text-lg font-semibold">ChronoShelf</div>
              <div className="text-xs text-gray-400">Inventory</div>
            </div>
          )}
        </div>

        {/* NAV */}
        <nav className="space-y-2">
          <NavItem
            icon="🏠"
            label="Overview"
            collapsed={collapsed}
            onClick={onShowDashboard}
          />

          <NavItem
            icon="📦"
            label="Items"
            collapsed={collapsed}
            onClick={onShowItems}
          />

          <NavItem
            icon="📸"
            label="Scanner"
            collapsed={collapsed}
            onClick={onShowScanner}
          />
        </nav>

        {/* ACCOUNT */}
        <div className="mt-10">
          {!collapsed && (
            <div className="text-xs text-gray-400 uppercase mb-3">
              Account
            </div>
          )}

          <div
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition cursor-pointer"
            onClick={onShowProfile}
          >
            {/* AVATAR */}
            <div className="w-8 h-8 rounded-full bg-gray-300/20 flex items-center justify-center font-semibold overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>

            {!collapsed && (
              <div className="text-sm">
                <div className="font-medium">{fullName}</div>
                <div className="text-xs text-gray-400">{email}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LOGOUT */}
      <div className="mt-auto px-4 pb-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-white/10 text-gray-200 hover:bg-white/10 transition"
        >
          <span className="text-lg">⎋</span>
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
