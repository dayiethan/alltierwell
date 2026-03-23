"use client";

import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/ThemeProvider";
import { ERA_THEMES, getThemeById } from "@/lib/themes";
import type { EraTheme } from "@/lib/themes";

const THEME_ALBUM_IMAGES = new Set(
  ERA_THEMES.map((t) => t.albumImage).filter(Boolean) as string[]
);

function isThemeAlbumImage(url: string | null): boolean {
  if (!url) return false;
  return THEME_ALBUM_IMAGES.has(url);
}
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Username availability
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Danger zone confirmations
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [resetting, setResetting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("users")
        .select("username, display_name, is_public, avatar_url")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUsername(profile.username);
        setOriginalUsername(profile.username);
        setDisplayName(profile.display_name);
        setIsPublic(profile.is_public);
        setAvatarUrl(profile.avatar_url);
      }
      setLoading(false);
    };
    load();
  }, [supabase, router]);

  // Debounced username availability check
  const checkAvailability = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (value === originalUsername) {
        setAvailable(null);
        return;
      }
      if (!USERNAME_REGEX.test(value)) {
        setAvailable(null);
        return;
      }
      setChecking(true);
      debounceRef.current = setTimeout(async () => {
        const { data } = await supabase
          .from("users")
          .select("username")
          .eq("username", value)
          .single();
        setAvailable(!data);
        setChecking(false);
      }, 400);
    },
    [supabase, originalUsername]
  );

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(value);
    checkAvailability(value);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // Validate file
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setSaveMessage("Image must be under 2MB.");
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setSaveMessage("Only JPG, PNG, and WebP images are supported.");
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    setUploadingAvatar(true);
    setSaveMessage(null);

    const ext = file.name.split(".").pop() ?? "jpg";
    const filePath = `${userId}/avatar.${ext}`;

    // Upload to Supabase Storage (upsert)
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      setSaveMessage(`Failed to upload image: ${uploadError.message}`);
      setTimeout(() => setSaveMessage(null), 5000);
      setUploadingAvatar(false);
      return;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // Update the user's avatar_url in the database
    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar_url: newUrl })
      .eq("id", userId);

    if (updateError) {
      setSaveMessage("Failed to update profile picture.");
      setTimeout(() => setSaveMessage(null), 3000);
    } else {
      setAvatarUrl(newUrl);
      setSaveMessage("Profile picture updated.");
      setTimeout(() => setSaveMessage(null), 3000);
    }

    setUploadingAvatar(false);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveAvatar = async () => {
    if (!userId) return;
    setUploadingAvatar(true);

    // Update database to remove avatar
    await supabase
      .from("users")
      .update({ avatar_url: null })
      .eq("id", userId);

    setAvatarUrl(null);
    setSaveMessage("Profile picture removed.");
    setTimeout(() => setSaveMessage(null), 3000);
    setUploadingAvatar(false);
  };

  const handleUseEraArt = async () => {
    if (!userId) return;
    const themeDef = getThemeById(theme);
    if (!themeDef.albumImage) return;

    setUploadingAvatar(true);
    await supabase
      .from("users")
      .update({ avatar_url: themeDef.albumImage })
      .eq("id", userId);

    setAvatarUrl(themeDef.albumImage);
    setSaveMessage("Profile picture set to era theme art.");
    setTimeout(() => setSaveMessage(null), 3000);
    setUploadingAvatar(false);
  };

  const handleUseGooglePhoto = async () => {
    if (!userId) return;
    setUploadingAvatar(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const googleUrl = user?.user_metadata?.avatar_url ?? null;

    if (!googleUrl) {
      setSaveMessage("No Google profile picture found.");
      setTimeout(() => setSaveMessage(null), 3000);
      setUploadingAvatar(false);
      return;
    }

    await supabase
      .from("users")
      .update({ avatar_url: googleUrl })
      .eq("id", userId);

    setAvatarUrl(googleUrl);
    setSaveMessage("Profile picture set to Google photo.");
    setTimeout(() => setSaveMessage(null), 3000);
    setUploadingAvatar(false);
  };

  // When theme changes, auto-update avatar if using era art
  const handleThemeChange = async (newTheme: EraTheme) => {
    setTheme(newTheme);

    if (isThemeAlbumImage(avatarUrl) && userId) {
      const newThemeDef = getThemeById(newTheme);
      const newImage = newThemeDef.albumImage ?? null;
      await supabase
        .from("users")
        .update({ avatar_url: newImage })
        .eq("id", userId);
      setAvatarUrl(newImage);
    }
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    const usernameChanged = username !== originalUsername;
    if (usernameChanged && !available) return;
    if (!USERNAME_REGEX.test(username)) return;

    setSaving(true);
    setSaveMessage(null);

    const { error } = await supabase
      .from("users")
      .update({
        username,
        display_name: displayName || username,
        is_public: isPublic,
      })
      .eq("id", userId);

    if (error) {
      if (error.code === "23505") {
        setSaveMessage("Username is already taken.");
      } else {
        setSaveMessage("Something went wrong. Please try again.");
      }
    } else {
      setOriginalUsername(username);
      setAvailable(null);
      setSaveMessage("Settings saved.");
      setTimeout(() => setSaveMessage(null), 3000);
    }
    setSaving(false);
  };

  const handleResetTierList = async () => {
    if (!userId || resetConfirmText !== "RESET") return;
    setResetting(true);
    await supabase.from("tier_entries").delete().eq("user_id", userId);
    setResetting(false);
    setShowResetConfirm(false);
    setResetConfirmText("");
    setSaveMessage("Tier list cleared.");
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleDeleteAccount = async () => {
    if (!userId || deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    // Delete tier entries first, then user profile
    await supabase.from("tier_entries").delete().eq("user_id", userId);
    await supabase.from("users").delete().eq("id", userId);
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const isUsernameValid = USERNAME_REGEX.test(username);
  const usernameChanged = username !== originalUsername;
  const canSave =
    isUsernameValid && (!usernameChanged || available === true) && !saving;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-12">
      <h1 className="text-2xl font-bold">Settings</h1>

      {saveMessage && (
        <div className="rounded-lg border border-border bg-muted px-4 py-3 text-sm">
          {saveMessage}
        </div>
      )}

      {/* Profile section */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Profile
        </h2>
        <div className="mt-4 space-y-4 rounded-xl border border-border bg-card p-5">
          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-3">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="h-16 w-16 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-bold text-muted-foreground">
                  {displayName?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                  </button>
                  <button
                    onClick={handleUseGooglePhoto}
                    disabled={uploadingAvatar}
                    className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    Google Photo
                  </button>
                  {getThemeById(theme).albumImage && (
                    <button
                      onClick={handleUseEraArt}
                      disabled={uploadingAvatar}
                      className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      Use Era Art
                    </button>
                  )}
                </div>
                {avatarUrl && (
                  <button
                    onClick={handleRemoveAvatar}
                    disabled={uploadingAvatar}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 text-left"
                  >
                    Remove picture
                  </button>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {isThemeAlbumImage(avatarUrl)
                ? "Using era theme art — changes automatically when you switch themes."
                : "JPG, PNG, or WebP. Max 2MB."}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Username
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                maxLength={20}
                className="w-full rounded-md border border-border bg-background py-2 pl-8 pr-10 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {usernameChanged && username.length >= 3 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                  {checking ? (
                    <span className="text-muted-foreground">...</span>
                  ) : available ? (
                    <span className="text-green-600">Available</span>
                  ) : available === false ? (
                    <span className="text-red-500">Taken</span>
                  ) : null}
                </span>
              )}
            </div>
            {username.length > 0 && !isUsernameValid && (
              <p className="mt-1 text-xs text-muted-foreground">
                3-20 characters, lowercase letters, numbers, and underscores
                only
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Public Profile</p>
              <p className="text-xs text-muted-foreground">
                Allow others to view your tier list
              </p>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublic ? "bg-accent" : "bg-border"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  isPublic ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={!canSave}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </section>

      {/* Era Theme section */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Era Theme
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose an era to change the look and feel of the entire site.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {ERA_THEMES.map((t) => {
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id as EraTheme)}
                className="group relative overflow-hidden rounded-xl border-2 p-3 text-left transition-all"
                style={{
                  borderColor: isActive ? t.colors.accent : t.colors.border,
                  backgroundColor: t.colors.card,
                }}
              >
                {/* Color preview strip */}
                <div className="flex gap-1 mb-3">
                  <div
                    className="h-6 flex-1 rounded"
                    style={{ backgroundColor: t.colors.background }}
                  />
                  <div
                    className="h-6 flex-1 rounded"
                    style={{ backgroundColor: t.colors.accent }}
                  />
                  <div
                    className="h-6 flex-1 rounded"
                    style={{ backgroundColor: t.colors.muted }}
                  />
                  <div
                    className="h-6 flex-1 rounded"
                    style={{ backgroundColor: t.colors.foreground }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  {t.albumImage && (
                    <img
                      src={t.albumImage}
                      alt=""
                      className="h-8 w-8 rounded object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: t.colors.foreground }}
                    >
                      {t.label}
                    </p>
                  </div>
                </div>

                {isActive && (
                  <div
                    className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: t.colors.accent,
                      color: t.colors.accentForeground,
                    }}
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Account section */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Account
        </h2>
        <div className="mt-4 space-y-3">
          <button
            onClick={handleSignOut}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-left text-sm font-medium hover:bg-muted transition-colors"
          >
            Sign Out
          </button>
        </div>
      </section>

      {/* Danger zone */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-red-500">
          Danger Zone
        </h2>
        <div className="mt-4 space-y-3 rounded-xl border border-red-200 p-5">
          {/* Reset tier list */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Reset Tier List</p>
                <p className="text-xs text-muted-foreground">
                  Remove all song rankings. This cannot be undone.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowResetConfirm(!showResetConfirm);
                  setResetConfirmText("");
                }}
                className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Reset
              </button>
            </div>
            {showResetConfirm && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">
                  Type <strong>RESET</strong> to confirm clearing your entire
                  tier list.
                </p>
                <input
                  type="text"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  className="mt-2 w-full rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-red-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder='Type "RESET"'
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleResetTierList}
                    disabled={resetConfirmText !== "RESET" || resetting}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {resetting ? "Resetting..." : "Confirm Reset"}
                  </button>
                  <button
                    onClick={() => {
                      setShowResetConfirm(false);
                      setResetConfirmText("");
                    }}
                    className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-red-200" />

          {/* Delete account */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Delete Account</p>
                <p className="text-xs text-muted-foreground">
                  Permanently delete your account and all data. This cannot be
                  undone.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDeleteConfirm(!showDeleteConfirm);
                  setDeleteConfirmText("");
                }}
                className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
            {showDeleteConfirm && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">
                  Type <strong>DELETE</strong> to confirm permanently deleting
                  your account, tier list, and all associated data.
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="mt-2 w-full rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-red-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder='Type "DELETE"'
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== "DELETE" || deleting}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting ? "Deleting..." : "Permanently Delete Account"}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText("");
                    }}
                    className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
