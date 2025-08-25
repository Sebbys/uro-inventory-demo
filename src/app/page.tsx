"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Package, ArrowRight, Bell, Database, Zap, Shield } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="new-container relative !border-none sm:!border-dashed">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-dashed px-4">
        <Link href="/" className="flex flex-row items-center gap-2">
          <Package className="h-8 w-8 text-primary" />
          <span className="instrument-serif text-xl font-semibold">Inventory Notifier</span>
        </Link>

        <div className="flex flex-row items-center gap-3">
          <Switch className="h-[1.15rem] w-8" />
          <Link href="/products">
            <Button variant="secondary" className="h-8 px-4 py-2">
              <span>Manage Inventory</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex h-[calc(100svh-64px-200px)] flex-row items-center overflow-hidden border-b border-dashed">
        {/* Background Image */}
        <div className="absolute inset-0 h-full w-full overflow-hidden">
          <div className="h-full w-full bg-gradient-to-br from-background via-muted/20 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)]" />
        </div>

        {/* Hero Content */}
        <div className="z-10 flex flex-col gap-4">
          {/* Main Headlines */}
          <div className="instrument-serif flex flex-col gap-2 px-6 hero-title">
            <h1 className="dark:text-primary-foreground/30 text-secondary-foreground/50">
              Smart <span className="dark:text-primary-foreground text-secondary-foreground">Inventory</span> Notifications
            </h1>
            <h2 className="dark:text-primary-foreground/30 text-secondary-foreground/50">
              Never <span className="dark:text-primary-foreground text-secondary-foreground">Miss</span> Low Stock Again
            </h2>
          </div>

          {/* Description */}
          <div className="px-6">
            <p className="text-muted-foreground text-sm max-w-md">
              A proof-of-concept inventory management system with real-time Discord notifications for low stock alerts and comprehensive reporting.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="mt-4 flex flex-row gap-4 px-6">
            <Link href="/products">
              <Button className="button-highlighted-shadow h-8 px-4 py-2 transition-all-smooth hover:bg-blend-hue hover:cursor-pointer">
                <span>Get Started</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>   
          </div>
        </div>
      </section>

      {/* Features Section - Compact Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 border-b border-dashed">
        <div className="flex flex-col gap-3 p-4 border border-dashed rounded-lg">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h2 className="jetbrains-mono text-sm font-medium tracking-tight">Discord Notifications</h2>
          </div>
          <p className="jetbrains-mono text-muted-foreground text-xs tracking-tight">
            Real-time alerts sent directly to your Discord channel when products fall below threshold.
          </p>
        </div>
        
        <div className="flex flex-col gap-3 p-4 border border-dashed rounded-lg">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <h2 className="jetbrains-mono text-sm font-medium tracking-tight">Smart Reporting</h2>
          </div>
          <p className="jetbrains-mono text-muted-foreground text-xs tracking-tight">
            Comprehensive global reports with critical and low stock item summaries.
          </p>
        </div>
        
        <div className="flex flex-col gap-3 p-4 border border-dashed rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h2 className="jetbrains-mono text-sm font-medium tracking-tight">Real-time Updates</h2>
          </div>
          <p className="jetbrains-mono text-muted-foreground text-xs tracking-tight">
            Instant stock updates with automatic notification triggers and deduplication.
          </p>
        </div>
        
        <div className="flex flex-col gap-3 p-4 border border-dashed rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="jetbrains-mono text-sm font-medium tracking-tight">Optimized Performance</h2>
          </div>
          <p className="jetbrains-mono text-muted-foreground text-xs tracking-tight">
            Database indexing and connection pooling for efficient inventory management.
          </p>
        </div>
        
        <div className="flex flex-col gap-3 p-4 border border-dashed rounded-lg">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <h2 className="jetbrains-mono text-sm font-medium tracking-tight">Simple Management</h2>
          </div>
          <p className="jetbrains-mono text-muted-foreground text-xs tracking-tight">
            Easy-to-use interface for adding, updating, and monitoring product inventory.
          </p>
        </div>
        
        <div className="flex flex-col gap-3 p-4 border border-dashed rounded-lg">
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            <h2 className="jetbrains-mono text-sm font-medium tracking-tight">Ready to Deploy</h2>
          </div>
          <p className="jetbrains-mono text-muted-foreground text-xs tracking-tight">
            Production-ready POC with Neon database, Next.js, and Discord integration.
          </p>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="flex flex-col items-center border-b border-dashed py-8 px-6">
        <div className="flex flex-row items-center gap-2 mb-4">
          <div className="flex flex-row items-center">
            <div className="from-muted h-px w-24 bg-gradient-to-l to-transparent sm:w-40"></div>
            <div className="bg-muted/20 h-1.5 w-1.5 border"></div>
          </div>
          <div className="bg-muted/20 jetbrains-mono relative flex h-7 flex-row items-center gap-2 rounded-md border px-4 text-sm font-medium">
            <span>Quick Start</span>
          </div>
          <div className="flex flex-row items-center">
            <div className="bg-muted/20 h-1.5 w-1.5 border"></div>
            <div className="from-muted h-px w-24 bg-gradient-to-r to-transparent sm:w-40"></div>
          </div>
        </div>
        
        <div className="text-center max-w-md">
          <p className="jetbrains-mono text-muted-foreground text-sm tracking-tight mb-4">
            Set up your Discord webhook and start managing inventory with smart notifications.
          </p>
          <Link href="/products">
            <Button className="h-8 px-6">
              <Package className="mr-2 h-4 w-4" />
              Start Managing
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex h-[100px] items-center justify-center overflow-hidden px-4 sm:h-auto sm:px-0">
        <div className="text-4xl font-bold text-muted-foreground/20 tracking-wider">
          INVENTORY NOTIFIER
        </div>
      </footer>
    </div>
  );
}
