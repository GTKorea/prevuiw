"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// Add a notification bell placeholder (Task 7 will fill it in)

export function NavBar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-lg font-bold">prevuiw</Link>
          <span className="text-sm text-muted-foreground">Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Notification bell placeholder */}
          <div className="text-muted-foreground text-sm">🔔</div>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-muted-foreground text-xs">{user.email}</DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
