'use client';
import * as React from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { type VariantProps, cva } from "class-variance-authority";
import { ChevronDown, Home as HomeIcon, Menu, MoreHorizontal } from "lucide-react";

type IconType = React.ComponentType<{ className?: string }>;

export type NavItem = {
  label: string;
  href: string;
  icon?: IconType;
  badge?: React.ReactNode;
  exact?: boolean;
};

export type NavSection = {
  label?: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
};

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
export type LinkComponent = React.ComponentType<LinkProps>;

export type Density = "comfortable" | "compact";

const navItemVariants = cva(
  "group inline-flex w-full items-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      active: {
        true: "bg-accent text-accent-foreground",
        false: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      },
      density: {
        comfortable: "gap-3 px-3.5 py-2.5",
        compact: "gap-2.5 px-3 py-2",
      },
    },
    defaultVariants: { active: false, density: "compact" },
  }
);

const sectionHeaderVariants = cva("px-3 text-xs font-medium uppercase text-muted-foreground", {
  variants: {
    density: {
      comfortable: "mt-5 mb-2",
      compact: "mt-4 mb-1.5",
    },
  },
  defaultVariants: { density: "compact" },
});

function isActivePath(currentPath: string, href: string, exact?: boolean) {
  if (!currentPath) return false;
  if (exact) return currentPath === href;
  // Normalize trailing slashes
  const norm = (p: string) => (p.endsWith("/") && p.length > 1 ? p.slice(0, -1) : p);
  const a = norm(currentPath);
  const b = norm(href);
  return a === b || a.startsWith(b + "/");
}

export interface AppShellProps {
  home: { label: string; href: string; icon?: IconType; logo?: React.ReactNode };
  sections: NavSection[];
  currentPath: string;
  density?: Density;
  linkComponent?: LinkComponent;
  topbarActions?: React.ReactNode;
  userMenu?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function AppShell({
  home,
  sections,
  currentPath,
  density = "compact",
  linkComponent,
  topbarActions,
  userMenu,
  sidebarFooter,
  children,
  className,
}: AppShellProps) {
  const Link = linkComponent ?? ((props: LinkProps) => <a {...props} />);

  return (
    <div className={cn("flex h-dvh min-h-0 w-full flex-col bg-background", className)}>
      <Topbar
        home={home}
        density={density}
        Link={Link}
        right={
          <div className="flex items-center gap-1.5">
            {topbarActions}
            {userMenu ?? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="More">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        }
      >
        <MobileNavDrawer
          sections={sections}
          currentPath={currentPath}
          density={density}
          Link={Link}
          home={home}
        />
      </Topbar>

      <div className="flex min-h-0 flex-1">
        <aside className="sticky top-0 hidden h-[calc(100dvh-theme(spacing.14))] w-[260px] shrink-0 border-r lg:block">
          <SidebarNav sections={sections} currentPath={currentPath} density={density} Link={Link} home={home} footer={sidebarFooter} />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

interface TopbarProps extends VariantProps<typeof topbarVariants> {
  home: AppShellProps["home"];
  Link: LinkComponent;
  right?: React.ReactNode;
  children?: React.ReactNode; // Left slot, e.g., mobile menu trigger
}

const topbarVariants = cva("sticky top-0 z-40 border-b bg-background/80 backdrop-blur", {
  variants: {
    density: {
      comfortable: "h-16",
      compact: "h-14",
    },
  },
  defaultVariants: { density: "compact" },
});

function Topbar({ home, Link, density, right, children }: TopbarProps) {
  const HomeIconCmp = home.icon ?? HomeIcon;
  return (
    <header className={cn(topbarVariants({ density }))}>
      <div className={cn("mx-auto flex h-full w-full items-center gap-2 px-3 sm:px-4")}>
        <div className="flex items-center gap-1.5 lg:hidden">{children}</div>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Link
            href={home.href}
            aria-label="Home"
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-1.5 py-1 text-sm font-semibold text-foreground hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            {home.logo ?? <HomeIconCmp className="h-4 w-4" />}
            <span className="truncate">{home.label}</span>
          </Link>
        </div>
        <div className="flex items-center gap-1.5">{right}</div>
      </div>
    </header>
  );
}

interface SidebarNavProps {
  home?: AppShellProps["home"];
  sections: NavSection[];
  currentPath: string;
  density?: Density;
  Link?: LinkComponent;
  footer?: React.ReactNode;
}

export function SidebarNav({ home, sections, currentPath, density = "compact", Link: LinkProp, footer }: SidebarNavProps) {
  const DefaultLink: LinkComponent = (p) => <a {...p} />;
  const Link = LinkProp ?? DefaultLink;
  return (
    <nav aria-label="Primary" className="flex h-full flex-col overflow-y-auto">
      <div className={cn("px-3 py-3", density === "comfortable" ? "py-4" : "py-3")}>{home ? <HomeLink home={home} density={density} Link={Link} /> : null}</div>
      <div className="flex-1 space-y-2 px-3 pb-3">
        {sections.map((section, idx) => (
          <Section key={idx} section={section} currentPath={currentPath} density={density} Link={Link} />
        ))}
      </div>
      {footer ? <div className="border-t px-3 py-3">{footer}</div> : null}
    </nav>
  );
}

function HomeLink({ home, density, Link }: { home: AppShellProps["home"]; density: Density; Link: LinkComponent }) {
  const Icon = home.icon ?? HomeIcon;
  return (
    <Link
      href={home.href}
      className={cn(
        "inline-flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm font-semibold hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        density === "comfortable" ? "py-2.5" : "py-2"
      )}
      aria-label="Go to home"
    >
      <Icon className="h-4 w-4" />
      <span className="truncate">{home.label}</span>
    </Link>
  );
}

function Section({ section, currentPath, density, Link }: { section: NavSection; currentPath: string; density: Density; Link: LinkComponent }) {
  if (section.collapsible) {
    return (
      <Collapsible defaultOpen={section.defaultOpen ?? true}>
        {section.label ? (
          <CollapsibleTrigger asChild>
            <button className={cn(sectionHeaderVariants({ density }), "flex w-full items-center gap-1.5 text-left hover:text-foreground")}>
              <ChevronDown className="h-3.5 w-3.5 transition-transform data-[state=closed]:-rotate-90" />
              <span className="truncate">{section.label}</span>
            </button>
          </CollapsibleTrigger>
        ) : null}
        <CollapsibleContent asChild>
          <ul className={cn("mt-1 space-y-1", !section.label && "mt-0")}>
            {section.items.map((item, i) => (
              <li key={i}>
                <NavLink item={item} currentPath={currentPath} density={density} Link={Link} />
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div>
      {section.label ? <div className={cn(sectionHeaderVariants({ density }))}>{section.label}</div> : null}
      <ul className={cn("mt-1 space-y-1", !section.label && "mt-0")}>
        {section.items.map((item, i) => (
          <li key={i}>
            <NavLink item={item} currentPath={currentPath} density={density} Link={Link} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function NavLink({ item, currentPath, density, Link }: { item: NavItem; currentPath: string; density: Density; Link: LinkComponent }) {
  const Icon = item.icon;
  const active = isActivePath(currentPath, item.href, item.exact);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(navItemVariants({ active, density }))}
    >
      {Icon ? (
        <TooltipProvider disableHoverableContent>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center justify-center">
                <Icon className="h-4 w-4 shrink-0" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" className="hidden lg:block">
              {item.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
      <span className={cn("truncate", Icon && "ml-0.5")}>{item.label}</span>
      {item.badge ? <span className="ml-auto inline-flex shrink-0 items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{item.badge}</span> : null}
    </Link>
  );
}

function MobileNavDrawer({ home, sections, currentPath, density, Link }: { home: AppShellProps["home"]; sections: NavSection[]; currentPath: string; density: Density; Link: LinkComponent }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="px-3 py-3 text-left">
          <SheetTitle>
            <Link href={home.href} className="inline-flex items-center gap-2 text-base font-semibold">
              {home.logo ?? <HomeIcon className="h-4 w-4" />}
              <span>{home.label}</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        <div className="border-t" />
        <div className="h-[calc(100dvh-theme(spacing.14))] overflow-y-auto">
          <div className="px-3 py-3">
            <HomeLink home={home} density={density} Link={Link} />
          </div>
          <div className="space-y-2 px-3 pb-3">
            {sections.map((section, idx) => (
              <Section key={idx} section={section} currentPath={currentPath} density={density} Link={Link} />
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default AppShell;
