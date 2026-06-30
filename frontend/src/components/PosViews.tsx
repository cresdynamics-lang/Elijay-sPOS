"use client";

import { AppShell } from "@/components/AppShell";
import { PosTerminal } from "@/components/PosTerminal";
import type { Category } from "@/lib/catalog";

export function PosView({ categories }: { categories: Category[] }) {
  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="text-lg font-semibold accent-text">Point of Sale</h1>
        <p className="text-sm text-[var(--muted)]">
          Select your store — prices are set per shop for the same products.
        </p>
      </div>
      <PosTerminal categories={categories} />
    </AppShell>
  );
}
