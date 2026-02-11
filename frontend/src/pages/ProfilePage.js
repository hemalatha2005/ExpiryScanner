import React, { useState } from "react";

export default function ProfilePage({ user }) {
  const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token") || "";
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const activeUser = user && Object.keys(user).length > 0 ? user : storedUser;

  const profileKeyBase =
    activeUser?._id
      ? `profile:${activeUser._id}`
      : activeUser?.email
      ? `profile:${activeUser.email}`
      : "profile:default";
  const imageKey = `${profileKeyBase}:image`;
  const legacyImageKey =
    activeUser?._id
      ? `profileImage:${activeUser._id}`
      : activeUser?.email
      ? `profileImage:${activeUser.email}`
      : "profileImage:default";
  const dataKey = `${profileKeyBase}:data`;
  const savedProfile = JSON.parse(localStorage.getItem(dataKey) || "{}");

  const fullName =
    activeUser?.fullName ||
    `${activeUser?.firstName || ""} ${activeUser?.lastName || ""}`.trim() ||
    "User";
  const email = activeUser?.email || "";
  const initial = fullName.charAt(0).toUpperCase();

  const [displayName, setDisplayName] = useState(
    savedProfile.displayName || fullName
  );
  const [phone, setPhone] = useState(
    savedProfile.phone || activeUser?.phone || ""
  );
  const [bio, setBio] = useState(savedProfile.bio || activeUser?.bio || "");
  const [timezone, setTimezone] = useState(
    savedProfile.timezone || activeUser?.timezone || "Asia/Kolkata"
  );
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem(imageKey) ||
      localStorage.getItem(legacyImageKey) ||
      activeUser?.profileImage ||
      ""
  );
  const [profileFileName, setProfileFileName] = useState("No file selected");
  const [phoneError, setPhoneError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleProfileImage = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setProfileFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setProfileImage(result);
      localStorage.setItem(imageKey, result);
      localStorage.setItem(legacyImageKey, result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const phoneRegex = /^\d{10}$/;
    const cleanPhone = (phone || "").trim();
    if (cleanPhone && !phoneRegex.test(cleanPhone)) {
      setPhoneError("Phone number must be exactly 10 digits");
      setSaveMessage("");
      return;
    }

    setPhoneError("");
    const data = { displayName, phone, bio, timezone };
    localStorage.setItem(dataKey, JSON.stringify(data));
    setSaveMessage("Saved changes successfully");
  };

  const handleCancel = () => {
    setDisplayName(savedProfile.displayName || fullName);
    setPhone(savedProfile.phone || activeUser?.phone || "");
    setPhoneError("");
    setSaveMessage("");
    setBio(savedProfile.bio || activeUser?.bio || "");
    setTimezone(savedProfile.timezone || activeUser?.timezone || "Asia/Kolkata");
  };

  const handleUpdatePassword = async () => {
    if (passwordLoading) return;
    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("Fill all password fields");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New password and confirm password do not match");
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await fetch(`${apiBase}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data?.message || "Could not update password");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordMessage(data?.message || "Password updated successfully");
    } catch (err) {
      console.error(err);
      setPasswordError("Could not update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#142D4C] flex items-center justify-center text-2xl font-semibold overflow-hidden">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <div>
                <div className="text-2xl font-semibold text-[#142D4C]">
                  {fullName}
                </div>
                <div className="text-sm text-gray-500">{email}</div>
                <div className="text-xs text-gray-400 mt-1">
                  Profile settings and preferences
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-[#142D4C] text-white hover:bg-[#5682B1] transition"
              >
                Save Changes
              </button>
            </div>
          </div>
          {saveMessage && (
            <div className="mt-3 text-sm text-green-600">{saveMessage}</div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-11 self-start h-fit">
            <h3 className="text-lg font-semibold text-[#142D4C] mb-2 -mt-5 -ml-5 text-left w-full">
              Profile Photo
            </h3>
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl font-semibold text-gray-500 overflow-hidden">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>
              <div className="w-full">
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleProfileImage(e.target.files?.[0])}
                />
                <label
                  htmlFor="profile-upload"
                  className="inline-block w-full px-3 py-2 rounded-lg bg-[#142D4C] text-white text-sm text-center cursor-pointer hover:bg-[#5682B1] transition"
                >
                  Choose File
                </label>
                <div className="text-xs text-gray-500 mt-2 truncate w-full">
                  {profileFileName}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  JPG/PNG up to 2MB
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-3">
            <h3 className="text-lg font-semibold text-[#142D4C] mb-4">
              Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Display name</label>
                <input
                  className="auth-input mt-1"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Email</label>
                <input
                  className="auth-input mt-1"
                  value={email}
                  disabled
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Phone</label>
                <input
                  className="auth-input mt-1"
                  value={phone}
                  onChange={(e) => {
                    const nextValue = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setPhone(nextValue);
                    if (phoneError) setPhoneError("");
                  }}
                  placeholder="9876543210"
                  inputMode="numeric"
                />
                {phoneError && (
                  <div className="text-xs text-red-600 mt-1">{phoneError}</div>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-500">Timezone</label>
                <select
                  className="auth-input mt-1"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                  <option value="UTC">UTC</option>
                  <option value="Asia/Dubai">Asia/Dubai</option>
                  <option value="Europe/London">Europe/London</option>
                </select>
              </div>
              {/* <div className="md:col-span-2">
                <label className="text-xs text-gray-500">Bio</label>
                <textarea
                  className="auth-input mt-1 min-h-[90px]"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a little about yourself..."
                />
              </div> */}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-[#142D4C] mb-4">
              Security
            </h3>
            <div className="space-y-3">
              <input
                type="password"
                className="auth-input"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <input
                type="password"
                className="auth-input"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                className="auth-input"
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
              {passwordError && (
                <div className="text-xs text-red-600">{passwordError}</div>
              )}
              {passwordMessage && (
                <div className="text-xs text-green-600">{passwordMessage}</div>
              )}
              <button
                onClick={handleUpdatePassword}
                disabled={passwordLoading}
                className={`w-full py-2 rounded-lg border transition ${
                  passwordLoading
                    ? "border-gray-300 text-gray-400 cursor-not-allowed"
                    : "border-[#142D4C] text-[#142D4C] hover:bg-[#142D4C] hover:text-white"
                }`}
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:col-span-2">
            <h3 className="text-lg font-semibold text-[#142D4C] mb-4">
              Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Low stock alerts</div>
                  <div className="text-xs text-gray-400">
                    Get notified about expiring items
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Weekly summary</div>
                  <div className="text-xs text-gray-400">
                    Inventory recap every week
                  </div>
                </div>
                <input type="checkbox" className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Expiry reminders</div>
                  <div className="text-xs text-gray-400">
                    Remind me 2 days before expiry
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Price drop alerts</div>
                  <div className="text-xs text-gray-400">
                    Notify when saved items drop in price
                  </div>
                </div>
                <input type="checkbox" className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-4">
            <h3 className="text-lg font-semibold text-[#142D4C] mb-4">
              Activity & Privacy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#DFFFD8]/40 border border-[#DFFFD8]">
                <div className="text-xs text-gray-500">Last login</div>
                <div className="text-sm font-medium">Today, 09:20 AM</div>
              </div>
              <div className="p-4 rounded-xl bg-[#DFFFD8]/40 border border-[#DFFFD8]">
                <div className="text-xs text-gray-500">Inventory items</div>
                <div className="text-sm font-medium">Tracked: 28</div>
              </div>
              <div className="p-4 rounded-xl bg-[#DFFFD8]/40 border border-[#DFFFD8]">
                <div className="text-xs text-gray-500">Storage used</div>
                <div className="text-sm font-medium">1.4 GB</div>
              </div>
            </div>
            <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="text-xs text-gray-400">
                Manage data and privacy settings from your account dashboard.
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
