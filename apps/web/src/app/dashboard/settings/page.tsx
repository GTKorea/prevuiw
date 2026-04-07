"use client";

import { useAuth } from "@/entities/auth";
import { Avatar, AvatarFallback, AvatarImage, Button, Badge } from "@/shared/ui";
import { LogOut, Trash2, Github } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/i18n/context";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { t } = useI18n();

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-semibold mb-6">{t("settings.title")}</h2>

      {/* Profile */}
      <section className="mb-8">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">{t("settings.profile")}</h3>
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
              <AvatarFallback className="text-lg">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-base font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Connected Accounts */}
      <section className="mb-8">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">{t("settings.connectedAccounts")}</h3>
        <div className="border border-border rounded-lg divide-y divide-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <GoogleIcon />
              <span className="text-sm font-medium">{t("settings.google")}</span>
            </div>
            <Badge variant="secondary" className="text-xs">{t("settings.connected")}</Badge>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Github className="size-4" />
              <span className="text-sm font-medium">{t("settings.github")}</span>
            </div>
            <span className="text-xs text-muted-foreground">{t("settings.notConnected")}</span>
          </div>
        </div>
      </section>

      {/* Session */}
      <section className="mb-8">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">{t("settings.session")}</h3>
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t("settings.signOut")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.signOutDesc")}</p>
            </div>
            <Button variant="outline" size="sm" onClick={logout} className="gap-1.5">
              <LogOut className="size-3.5" />
              {t("settings.signOut")}
            </Button>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <h3 className="text-sm font-medium text-destructive uppercase tracking-wide mb-3">{t("settings.dangerZone")}</h3>
        <div className="border border-destructive/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t("settings.deleteAccount")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.deleteAccountDesc")}</p>
            </div>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                  {t("settings.cancel")}
                </Button>
                <Button variant="destructive" size="sm" className="gap-1.5">
                  <Trash2 className="size-3.5" />
                  {t("settings.confirm")}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="size-3.5" />
                {t("settings.delete")}
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
