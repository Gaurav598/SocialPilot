import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./_common/app-sidebar";
import { GlobalCommandMenu } from "@/components/os/global-command-menu";
import { ModeToggle } from "@/components/dark-mode-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-svh border-none bg-muted/35">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/70 bg-background/85 px-3 backdrop-blur md:px-5">
          <SidebarTrigger className="md:hidden" />
          <div className="hidden min-w-0 flex-1 items-center gap-2 md:flex">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="truncate text-sm text-muted-foreground">
              SocialPilot OS is monitoring campaigns, approvals, and trend windows.
            </span>
          </div>
          <div className="flex flex-1 justify-end gap-2">
            <GlobalCommandMenu className="max-w-full" />
            <ModeToggle />
          </div>
        </header>
        <div className="flex-1 p-2 md:p-4">
          <div className="min-h-[calc(100svh-5.5rem)] overflow-hidden rounded-lg border border-border/70 bg-background shadow-sm">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
