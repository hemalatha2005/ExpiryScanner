import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AddItemModal from "./components/items/AddItemModal";

import DashboardPage from "./pages/DashboardPage";
import ScannerPage from "./pages/ScannerPage";
import CookingInsights from "./pages/CookingInsights";
import ItemsPage from "./pages/ItemsPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";

const VALID_PAGES = new Set(["auth", "dashboard", "scanner", "cooking", "items", "profile"]);

const getPageFromHash = () => {
  const hashPage = window.location.hash.replace(/^#/, "");
  return VALID_PAGES.has(hashPage) ? hashPage : "auth";
};

export default function App() {
  const [page, setPage] = useState(getPageFromHash);

  // user is set ONLY after login
  const [user, setUser] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const syncPageWithHash = () => {
      const nextPage = getPageFromHash();
      const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

      if (!isAuthenticated && nextPage !== "auth") {
        setPage("auth");
        if (window.location.hash !== "#auth") {
          window.history.replaceState(null, "", "#auth");
        }
        return;
      }

      setPage(nextPage);
    };

    syncPageWithHash();
    window.addEventListener("hashchange", syncPageWithHash);

    return () => {
      window.removeEventListener("hashchange", syncPageWithHash);
    };
  }, []);

  const navigateToPage = (nextPage, { replace = false } = {}) => {
    const safePage = VALID_PAGES.has(nextPage) ? nextPage : "auth";
    const nextHash = `#${safePage}`;

    if (window.location.hash === nextHash) {
      setPage(safePage);
      return;
    }

    if (replace) {
      window.history.replaceState(null, "", nextHash);
      setPage(safePage);
      return;
    }

    window.location.hash = safePage;
  };

  const openAddItemModal = () => setShowAddModal(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    setUser(null);
    navigateToPage("auth", { replace: true });
  };

  const handleScannerSave = async (scanPayload) => {
    const token = localStorage.getItem("token") || "";
    const productName = (scanPayload?.productName || "").trim();
    const barcode = (scanPayload?.barcode || "").trim();
    const expiryDate = scanPayload?.expiry || null;
    const productDetails = scanPayload?.productDetails || {};

    if (!expiryDate) {
      throw new Error("Expiry date not detected yet");
    }

    const name = productName || (barcode ? `Barcode ${barcode}` : "Unknown Product");

    const res = await fetch(`${apiBase}/api/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        category: "Scanned",
        quantity: 1,
        expiryDate,
        pricePerUnit: 0,
        barcode: barcode || null,
        brand: productDetails.brand || null,
        ingredients: productDetails.ingredients || null,
        allergens: Array.isArray(productDetails.allergens)
          ? productDetails.allergens
          : [],
        additives: Array.isArray(productDetails.additives)
          ? productDetails.additives
          : Array.isArray(productDetails.possibleChemicals)
          ? productDetails.possibleChemicals
          : [],
        nutritionGrade: productDetails.nutritionGrade || null,
        novaGroup: productDetails.novaGroup || null,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data?._id) {
      throw new Error(data?.message || "Failed to add scanned item");
    }

    navigateToPage("items");
    return data;
  };

  return (
    <div className="flex min-h-screen bg-[#DFFFD8]/40">
      {/* SIDEBAR (HIDDEN ON AUTH) */}
      {page !== "auth" && (
        <Sidebar
          user={user}
          onShowScanner={() => navigateToPage("scanner")}
          onShowDashboard={() => navigateToPage("dashboard")}
          onShowItems={() => navigateToPage("items")}
          onShowProfile={() => navigateToPage("profile")}
          onLogout={handleLogout}
          collapsed={!sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      )}

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* HEADER (HIDDEN ON AUTH) */}
        {page !== "auth" && (
          <Header
            onShowScanner={() => navigateToPage("scanner")}
            onShowProfile={() => navigateToPage("profile")}
            user={user}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        )}

        {/* PAGE CONTENT */}
        <div key={page} className="flex-1 animate-[fadeIn_0.3s_ease-out]">
          {/* AUTH */}
          {page === "auth" && (
            <AuthPage
              onAuthSuccess={(userData) => {
                setUser(userData);
                navigateToPage("dashboard", { replace: true });
              }}
            />
          )}

          {/* DASHBOARD */}
          {page === "dashboard" && (
            <DashboardPage
              onShowCooking={() => navigateToPage("cooking")}
              onShowItems={() => navigateToPage("items")}
              onAddItem={openAddItemModal}
              onLogout={handleLogout}
              onShowScanner={() => navigateToPage("scanner")}
            />
          )}

          {/* SCANNER */}
          {page === "scanner" && (
            <ScannerPage onBack={() => navigateToPage("dashboard")} onSave={handleScannerSave} />
          )}

          {/* COOKING */}
          {page === "cooking" && (
            <CookingInsights onBack={() => navigateToPage("dashboard")} />
          )}

          {/* ITEMS */}
          {page === "items" && <ItemsPage />}

          {/* PROFILE */}
          {page === "profile" && <ProfilePage user={user} />}
        </div>
      </div>

      {/* ADD ITEM MODAL */}
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onAddItem={(item) => {
            console.log("Item added:", item);
          }}
        />
      )}
    </div>
  );
}

