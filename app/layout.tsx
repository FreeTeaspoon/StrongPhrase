"use client";

import "./globals.css";
import { Raleway, Roboto, Roboto_Mono } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-raleway",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-roboto-mono",
});

const navLinks = [
  { href: "/", label: "Passphrase" },
  { href: "/more", label: "More" },
  { href: "/passcode", label: "Phone Passcode" },
  { href: "/username", label: "Username" },
  { href: "/identity", label: "Identity" },
  { href: "/table", label: "Cracking Times" },
];

function NavLink({ href, label, pathname, onClick }: { href: string; label: string; pathname: string; onClick?: () => void }) {
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {label}
    </Link>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <title>StrongPhrase.net - Create strong, memorable passphrases</title>
        <meta
          name="description"
          content="Generate strong, memorable passphrases for your master password and other important accounts."
        />
      </head>
      <body
        className={`${raleway.variable} ${roboto.variable} ${robotoMono.variable} font-sans antialiased`}
      >
        <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            <div className="max-w-screen-lg mx-auto w-full px-4 py-4 md:px-6 md:py-8 flex-1">
              <header className="mb-6">
                <div className="flex items-center mb-3">
                  <Lock className="h-6 w-6 md:h-10 md:w-10 mr-3 text-primary" />
                  <div>
                    <h1 className="text-2xl md:text-4xl font-heading font-extrabold tracking-tight">
                      StrongPhrase.net
                    </h1>
                    <p className="text-sm md:text-lg text-muted-foreground">
                      Create strong, memorable passphrases
                    </p>
                  </div>
                </div>

                {/* Desktop nav */}
                <nav className="hidden md:flex gap-1 bg-muted rounded-lg p-1">
                  {navLinks.map((link) => (
                    <NavLink key={link.href} {...link} pathname={pathname} />
                  ))}
                </nav>

                {/* Mobile nav */}
                <div className="md:hidden">
                  <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Menu className="h-4 w-4 mr-2" />
                        Menu
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64">
                      <nav className="flex flex-col gap-2 mt-8">
                        {navLinks.map((link) => (
                          <NavLink
                            key={link.href}
                            {...link}
                            pathname={pathname}
                            onClick={() => setMobileOpen(false)}
                          />
                        ))}
                      </nav>
                    </SheetContent>
                  </Sheet>
                </div>
              </header>

              <main>{children}</main>
            </div>

            <footer className="bg-slate-900 text-slate-300 py-10 px-6 mt-auto">
              <div className="max-w-screen-lg mx-auto flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <Lock className="h-8 w-8 text-slate-400 mt-0.5" />
                    <div>
                      <h3 className="text-xl font-heading font-bold text-white">
                        StrongPhrase.net
                      </h3>
                      <p className="italic text-sm text-slate-400">
                        Create a memorable passphrase to use as your master
                        password
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mt-4">
                    This site does not collect any data. All interactions and
                    passphrase generation happen directly in your browser and
                    stay on your computer.
                  </p>
                  <p className="text-sm text-slate-400 mt-3">
                    Passphrase code{" "}
                    <a
                      href="https://github.com/openidauthority/getapassphrase"
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:text-white"
                    >
                      originally written by Ryan Foster
                    </a>
                    . Re-designed and expanded by{" "}
                    <a
                      href="https://gitlab.com/strongphrase/strongphrase.net"
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:text-white"
                    >
                      Solar Kazoo
                    </a>
                    .
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider">
                    Connect
                  </h4>
                  <a
                    className="text-sm hover:text-white transition-colors"
                    href="https://gitlab.com/strongphrase/strongphrase.net"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Code on GitLab
                  </a>
                  <a
                    className="text-sm hover:text-white transition-colors"
                    href="https://gitlab.com/strongphrase/strongphrase.net/issues"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Submit a bug or request
                  </a>
                  <a
                    className="text-sm hover:text-white transition-colors"
                    href="https://forms.gle/pu1vqi8Mc1VYirGz6"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Contact
                  </a>
                </div>
              </div>
            </footer>
          </div>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
