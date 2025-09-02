"use client";
import React from "react";
import Link from "next/link";
import AppShell, { type NavSection } from "@repo/ui/components/navigation/app-nav";
import { LayoutDashboard, FilePlus2, Upload, ClipboardList, Home } from "lucide-react";
import { usePathname } from "next/navigation";
import { stripBasePath } from "../lib/routing";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentPath = stripBasePath(pathname);

  const sections: NavSection[] = [
    {
      label: "Overview",
      collapsible: false,
      items: [
        { label: "Dashboard", href: "/", icon: LayoutDashboard, exact: true },
      ],
    },
    {
      label: "Operations",
      collapsible: true,
      defaultOpen: true,
      items: [
        { label: "Intakes", href: "/intakes", icon: ClipboardList },
        { label: "New Intake", href: "/intakes/new", icon: FilePlus2, exact: true },
        { label: "Uploads", href: "/uploads", icon: Upload },
      ],
    },
  ];

  return (
    <AppShell
      home={{ label: "Enrollment Dashboard", href: "/", icon: Home }}
      sections={sections}
      currentPath={currentPath}
      density="compact"
      linkComponent={Link}
      showTopbarHome={false}
      topbarActions={null}
    >
      {children}
    </AppShell>
  );
}

export default AppFrame;
