import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Download,
  Trash2,
  ShieldAlert,
  Mail,
  HelpCircle,
  Info,
  Type,
  Contrast,
  Waves,
  Bell,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ImageWithFallback } from "./components/FamilyTrails/ImageWithFallback";
import { VisibilityPicker } from "./screens";
import { useApp } from "./App";
import { useAuth } from "./context/AuthContext";
import { useAccessibility, type TextSize } from "./context/AccessibilityContext";
import { uploadAvatarFile } from "./lib/uploadAvatarFile";
import { supabase } from "./lib/supabase";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function ScreenHeader({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <header className="bg-[#2E5C8A] p-6 text-white shrink-0 flex items-center gap-4">
      <button onClick={() => navigate(-1)} aria-label="Go back" className="p-1">
        <ArrowLeft className="w-6 h-6" />
      </button>
      <h1 className="text-xl font-bold">{title}</h1>
    </header>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "w-12 h-7 rounded-full transition-colors relative shrink-0",
        checked ? "bg-[#2E5C8A]" : "bg-gray-300",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function SettingsRow({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-2xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Icon className="w-5 h-5 text-[#2E5C8A] shrink-0" />
          <p className="font-bold text-sm text-gray-900 truncate">{title}</p>
        </div>
        {children}
      </div>
      {description && <p className="text-xs text-gray-500 mt-1 ml-8">{description}</p>}
    </div>
  );
}

// ============================================================
// Edit Profile
// ============================================================

export const EditProfileScreen = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const currentName = (user?.user_metadata?.full_name as string | undefined) || "";
  const currentAvatar = user?.user_metadata?.avatar_url as string | undefined;

  const [name, setName] = useState(currentName);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentAvatar ?? null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!user || !name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      let avatarUrl: string | undefined;
      if (avatarFile) {
        avatarUrl = await uploadAvatarFile(user.id, avatarFile);
      }
      const { error: updateError } = await updateProfile({
        fullName: name.trim(),
        ...(avatarUrl ? { avatarUrl } : {}),
      });
      if (updateError) throw new Error(updateError);
      navigate("/profile");
    } catch (err) {
      setError("Could not save your profile. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-white px-5 pb-6">
      <ScreenHeader title="Edit Profile" />

      <div className="flex flex-col items-center py-8">
        <div className="relative w-28 h-28 mb-4">
          {avatarPreview ? (
            <ImageWithFallback
              src={avatarPreview}
              alt=""
              className="w-28 h-28 rounded-full object-cover"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#2E5C8A] to-[#4A7BA7] flex items-center justify-center text-4xl font-black text-white">
              {(name || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <label
            htmlFor="avatar-input"
            aria-label="Change profile photo"
            className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white border-2 border-[#2E5C8A] flex items-center justify-center cursor-pointer"
          >
            <Camera className="w-4 h-4 text-[#2E5C8A]" />
          </label>
          <input
            type="file"
            accept="image/*"
            id="avatar-input"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setAvatarFile(file);
                setAvatarPreview(URL.createObjectURL(file));
              }
            }}
          />
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="name-input" className="text-xs text-gray-500 mb-2 block font-medium">
          Display name
        </label>
        <input
          id="name-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          className="w-full bg-gray-50 p-4 rounded-2xl text-sm border border-gray-200 focus:ring-2 focus:ring-[#2E5C8A] outline-none"
        />
      </div>

      {error && <div className="text-xs text-red-500 text-center mb-4">{error}</div>}

      <div className="flex gap-4 mt-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 py-4 rounded-2xl font-bold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className={cn(
            "flex-1 py-4 rounded-2xl font-bold transition-all",
            name.trim() && !saving ? "bg-[#2E5C8A] text-white shadow-md" : "bg-gray-100 text-gray-400",
          )}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

// ============================================================
// Settings (accessibility + notifications)
// ============================================================

const TEXT_SIZES: { value: TextSize; label: string }[] = [
  { value: "small", label: "S" },
  { value: "default", label: "M" },
  { value: "large", label: "L" },
  { value: "extra-large", label: "XL" },
];

export const SettingsScreen = () => {
  const { user, updateProfile } = useAuth();
  const { textSize, setTextSize, highContrast, setHighContrast, reduceMotion, setReduceMotion, effectiveReduceMotion } =
    useAccessibility();
  const notificationsEnabled = (user?.user_metadata?.notifications_enabled as boolean | undefined) ?? true;
  const [savingNotifications, setSavingNotifications] = useState(false);

  const handleNotificationsChange = async (value: boolean) => {
    setSavingNotifications(true);
    await updateProfile({ notificationsEnabled: value });
    setSavingNotifications(false);
  };

  return (
    <div className="flex flex-col min-h-full bg-white px-5 pb-8">
      <ScreenHeader title="Settings" />

      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mt-6 mb-3">
        Accessibility
      </h2>
      <div className="space-y-3">
        <SettingsRow icon={Type} title="Text size" description="Scales text across the whole app">
          <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shrink-0">
            {TEXT_SIZES.map((s) => (
              <button
                key={s.value}
                onClick={() => setTextSize(s.value)}
                aria-pressed={textSize === s.value}
                className={cn(
                  "px-3 py-2 text-xs font-bold transition-colors",
                  textSize === s.value ? "bg-[#2E5C8A] text-white" : "text-gray-500",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </SettingsRow>

        <SettingsRow
          icon={Contrast}
          title="High contrast"
          description="Stronger text and border contrast"
        >
          <Toggle checked={highContrast} onChange={setHighContrast} label="High contrast" />
        </SettingsRow>

        <SettingsRow
          icon={Waves}
          title="Reduce motion"
          description={
            reduceMotion === null
              ? `Following your device setting (currently ${effectiveReduceMotion ? "on" : "off"})`
              : undefined
          }
        >
          <Toggle
            checked={effectiveReduceMotion}
            onChange={setReduceMotion}
            label="Reduce motion"
          />
        </SettingsRow>
      </div>

      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mt-8 mb-3">
        Notifications
      </h2>
      <SettingsRow
        icon={Bell}
        title="Enable notifications"
        description="Alerts about nearby attractions and your memories"
      >
        <Toggle
          checked={notificationsEnabled}
          onChange={handleNotificationsChange}
          label="Enable notifications"
        />
      </SettingsRow>
      {savingNotifications && <p className="text-xs text-gray-400 mt-2">Saving...</p>}
    </div>
  );
};

// ============================================================
// Privacy
// ============================================================

export const PrivacyScreen = () => {
  const navigate = useNavigate();
  const { memories, updateMemoryVisibility } = useApp();
  const { user, updateProfile, signOut } = useAuth();
  const defaultVisibility =
    (user?.user_metadata?.default_visibility as "public" | "private" | undefined) ?? null;
  const publicMemories = memories.filter((m) => m.visibility === "public");

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDefaultVisibilityChange = async (value: "public" | "private") => {
    await updateProfile({ defaultVisibility: value });
  };

  const handleMakePrivate = async (id: string) => {
    setUpdatingId(id);
    await updateMemoryVisibility(id, "private");
    setUpdatingId(null);
  };

  const handleExport = () => {
    const payload = memories.map((m) => ({
      poi: m.poiName,
      type: m.type,
      content: m.content,
      caption: m.caption ?? null,
      visibility: m.visibility,
      date: m.date,
    }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "familytrails-my-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "This permanently deletes your account and all your memories. This cannot be undone. Continue?",
      )
    ) {
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      await signOut();
      navigate("/login");
    } catch (err) {
      setDeleteError("Could not delete your account. Please try again or contact support.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-white px-5 pb-8">
      <ScreenHeader title="Privacy Settings" />

      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mt-6 mb-3">
        Default visibility for new memories
      </h2>
      <VisibilityPicker value={defaultVisibility} onChange={handleDefaultVisibilityChange} />

      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mt-6 mb-3">
        Manage your public memories
      </h2>
      {publicMemories.length === 0 ? (
        <p className="text-sm text-gray-400 py-4">You don't have any public memories.</p>
      ) : (
        <div className="space-y-2 mb-2">
          {publicMemories.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-2xl"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{m.poiName}</p>
                <p className="text-xs text-gray-400">
                  {m.type} • {m.date}
                </p>
              </div>
              <button
                onClick={() => handleMakePrivate(m.id)}
                disabled={updatingId === m.id}
                className="text-xs font-bold text-[#2E5C8A] px-3 py-2 rounded-xl border border-[#2E5C8A] shrink-0 disabled:opacity-50"
              >
                {updatingId === m.id ? "..." : "Make private"}
              </button>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mt-8 mb-3">
        Your data
      </h2>
      <button
        onClick={handleExport}
        className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-2xl font-semibold text-gray-700 mb-3"
      >
        <Download className="w-5 h-5 text-[#2E5C8A]" />
        Export my data
      </button>

      <h2 className="text-sm font-bold text-red-400 uppercase tracking-wide mt-6 mb-3">
        Danger zone
      </h2>
      <button
        onClick={handleDeleteAccount}
        disabled={deleting}
        className="w-full flex items-center gap-3 p-4 bg-red-50 rounded-2xl font-semibold text-red-600 disabled:opacity-60"
      >
        <Trash2 className="w-5 h-5" />
        {deleting ? "Deleting account..." : "Delete my account"}
      </button>
      {deleteError && <p className="text-xs text-red-500 mt-2 text-center">{deleteError}</p>}
    </div>
  );
};

// ============================================================
// Help & Support
// ============================================================

export const HelpScreen = () => {
  const faqs = [
    {
      q: "How do I add a memory to an attraction?",
      a: "Open any attraction, tap 'Add Your Memory', and choose a photo, video, or written note.",
    },
    {
      q: "Who can see my memories?",
      a: "Each memory is either Private (only you) or Public (everyone). You choose when you save it, and you can change your default in Privacy Settings.",
    },
    {
      q: "Why aren't attractions sorted by distance?",
      a: "Location sorting needs GPS permission. Grant location access from the Home screen prompt, or from your browser/device settings if you previously denied it.",
    },
    {
      q: "How do I delete a memory?",
      a: "Open My Memories or the attraction's page, tap the three-dot menu on the memory, and choose Delete.",
    },
  ];

  return (
    <div className="flex flex-col min-h-full bg-white px-5 pb-8">
      <ScreenHeader title="Help & Support" />
      <div className="mt-6 space-y-4">
        {faqs.map((f) => (
          <div key={f.q} className="p-4 bg-gray-50 rounded-2xl">
            <div className="flex items-start gap-2 mb-1">
              <HelpCircle className="w-4 h-4 text-[#2E5C8A] mt-0.5 shrink-0" />
              <p className="font-bold text-sm text-gray-900">{f.q}</p>
            </div>
            <p className="text-sm text-gray-600 pl-6">{f.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-[#2E5C8A]/5 rounded-2xl flex items-start gap-3">
        <Mail className="w-5 h-5 text-[#2E5C8A] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm text-gray-900">Still need help?</p>
          <p className="text-sm text-gray-600 mt-1">
            Email <span className="font-semibold">support@familytrails.app</span> and we'll get
            back to you.
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// About
// ============================================================

export const AboutScreen = () => {
  return (
    <div className="flex flex-col min-h-full bg-white px-5 pb-8">
      <ScreenHeader title="About FamilyTrails" />
      <div className="mt-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2E5C8A] to-[#1e3c5a] flex items-center justify-center mb-4 shadow-lg">
          <Info className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-xl font-black text-gray-900">FamilyTrails</h2>
        <p className="text-sm text-gray-500 mt-1">Version 0.0.1</p>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed mt-8">
        FamilyTrails is a travel companion app that helps families discover and remember
        Bahrain's attractions together. Explore points of interest near you, and save photos,
        videos, and notes from every visit as lasting family memories.
      </p>

      <div className="mt-8 p-4 bg-gray-50 rounded-2xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#2E5C8A] shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600">
          Your memories are private by default. You control what's shared publicly at any time
          from Privacy Settings.
        </p>
      </div>
    </div>
  );
};
