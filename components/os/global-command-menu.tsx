"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bot,
  Calendar,
  FileText,
  Lightbulb,
  Search,
  Settings,
  Sparkles,
  Users,
  WandSparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

const navigation = [
  { label: "AI Command Center", href: "/command-center", icon: Bot, shortcut: "G C" },
  { label: "Schedule", href: "/schedule", icon: Calendar, shortcut: "G S" },
  { label: "Ideas", href: "/ideas", icon: Lightbulb, shortcut: "G I" },
  { label: "Settings", href: "/settings", icon: Settings, shortcut: "G T" },
  { label: "Billing", href: "/billing", icon: FileText, shortcut: "G B" },
];

const actions = [
  { label: "Generate campaign", icon: WandSparkles },
  { label: "Predict performance", icon: BarChart3 },
  { label: "Open approval queue", icon: Users },
  { label: "Research viral opportunities", icon: Sparkles },
];

export function GlobalCommandMenu({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={cn(
          "h-9 w-full justify-start gap-2 border-border/70 bg-background/80 px-3 text-muted-foreground shadow-none sm:w-[320px]",
          className,
        )}
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span className="min-w-0 flex-1 truncate text-left">Search or run a command</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
          Cmd K
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="SocialPilot command palette"
        description="Search navigation and AI operating-system actions."
        className="max-w-2xl"
      >
        <Command className="rounded-lg">
          <CommandInput placeholder="Search SocialPilot OS..." />
          <CommandList>
            <CommandEmpty>No command found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              {navigation.map((item) => (
                <CommandItem key={item.href} value={item.label} onSelect={() => navigate(item.href)}>
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                  <CommandShortcut>{item.shortcut}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="AI Actions">
              {actions.map((item) => (
                <CommandItem
                  key={item.label}
                  value={item.label}
                  onSelect={() => navigate("/command-center")}
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                  <CommandShortcut>AI</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
