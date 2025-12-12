// src/components/Sidebar.js
import React from "react";
import logo from "../assets/logo2.png";


const NavItem = ({ icon, label, active }) => (
  <div
    className={
      "flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition " +
      (active ? "bg-emerald-600/10 text-emerald-600" : "text-gray-300 hover:bg-white/5")
    }
  >
    <div className="w-6 h-6 text-lg">{icon}</div>
    <div className="text-sm font-medium">{label}</div>
  </div>
);

export default function Sidebar() {
  return (
    <aside className="w-72 bg-[#142D4C] text-gray-200 min-h-screen sticky top-0">
      <div className="px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8">
            <div className="w-10 h-10">
              <img
                src={logo}
                alt="App Logo"
                className="w-full h-full object-contain rounded-md"
              />
            </div>

          </div>
          <div>
            <div className="text-lg font-semibold span">ChronoShelf</div>
            <div className="text-xs text-gray-400">Inventory</div>
          </div>
        </div>
        <nav className="space-y-2">
          <NavItem icon="🏠" label="Overview" active />
          <NavItem icon="📦" label="Items" />
          <NavItem icon="📊" label="Analytics" />
          <NavItem icon="🔔" label="Reminders" />
          <NavItem icon="⚙️" label="Settings" />
        </nav>

        <div className="mt-10">
          <div className="text-xs text-gray-400 uppercase mb-3">Account</div>
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition">
            <div className="w-8 h-8 rounded-full bg-gray-300/20 flex items-center justify-center">HN</div>
            <div className="text-sm">
              <div className="font-medium">Hemalatha</div>
              <div className="text-xs text-gray-400">View profile</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
