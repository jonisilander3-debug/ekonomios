'use client';

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createMockPlatformData } from "@/features/platform-data/mock-data";
import { usePlatformState } from "@/features/platform-data/use-platform-state";

const initialApps = [
  { id: 1, label: "Kunder", icon: "KU", badge: "12" },
  { id: 2, label: "Projekt", icon: "PR", badge: "8" },
  { id: 3, label: "Fakturor", icon: "FA", badge: "5" },
  { id: 4, label: "Kvitton", icon: "KV", badge: "3" },
  { id: 5, label: "Bokforing", icon: "BO" },
  { id: 6, label: "Loner", icon: "LO", badge: "2" },
  { id: 7, label: "Moms", icon: "MO", badge: "1" },
  { id: 8, label: "Rapporter", icon: "RA" },
];

type DesktopApp = (typeof initialApps)[number];
type LayoutMode = "mobile" | "tablet" | "desktop";

function DesktopAppIcon({
  app,
  editMode,
  onClick,
  onMove,
}: {
  app: DesktopApp;
  editMode: boolean;
  onClick: (app: DesktopApp) => void;
  onMove: (appId: number, direction: number) => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => !editMode && onClick(app)}
      whileHover={{ scale: editMode ? 1.01 : 1.04 }}
      animate={editMode ? { rotate: [0, -1, 1, 0] } : { rotate: 0 }}
      transition={editMode ? { repeat: Infinity, duration: 0.55 } : { duration: 0.18 }}
      className={`relative flex flex-col items-center gap-2 ${editMode ? "cursor-default" : "cursor-pointer"}`}
    >
      <div className="relative">
        {app.badge && (
          <div className="absolute -right-1 -top-1 z-10 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-semibold text-white">
            {app.badge}
          </div>
        )}

        <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-slate-200/80 bg-white text-sm font-semibold tracking-[0.18em] text-slate-600 shadow-[0_16px_32px_rgba(15,23,42,0.06)]">
          {app.icon}
        </div>

        {hover && !editMode && (
          <div className="absolute left-1/2 top-[4.75rem] z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-950 px-3 py-1.5 text-[11px] text-white shadow-lg">
            Oppna {app.label}
          </div>
        )}
      </div>

      <div className="text-sm font-medium text-slate-700">{app.label}</div>

      {editMode && (
        <div className="mt-1 grid grid-cols-3 gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          <button onClick={() => onMove(app.id, -6)} className="col-start-2 rounded-lg bg-slate-100 px-1.5 py-1 text-[10px]">U</button>
          <button onClick={() => onMove(app.id, -1)} className="rounded-lg bg-slate-100 px-1.5 py-1 text-[10px]">V</button>
          <button onClick={() => onMove(app.id, 1)} className="rounded-lg bg-slate-100 px-1.5 py-1 text-[10px]">H</button>
          <button onClick={() => onMove(app.id, 6)} className="rounded-lg bg-slate-100 px-1.5 py-1 text-[10px]">N</button>
        </div>
      )}
    </motion.div>
  );
}

function AiWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[28px] border border-slate-800/80 bg-[#0b1220] p-5 text-white shadow-[0_26px_70px_rgba(15,23,42,0.2)] sm:rounded-[30px] sm:p-6 xl:rounded-[32px] xl:p-7"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_280px] xl:gap-6">
        <div>
          <div className="mb-3 text-xs font-medium uppercase tracking-[0.28em] text-emerald-300">
            AI Ekonomikoll
          </div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-[2rem]">God morgon, Joni</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">Har ar det viktigaste i arbetsytan just nu.</p>

          <div className="mt-5 space-y-3 text-sm text-slate-100">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">3 kvitton behover kontrolleras</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">2 fakturor ar redo att skickas</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Momsrapport ar nastan klar</div>
          </div>

          <button className="mt-5 w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm sm:mt-6 sm:w-auto">
            Oppna AI
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-slate-400">Banksaldo</div>
            <div className="mt-3 text-2xl font-semibold">184 250 kr</div>
          </div>
          <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-slate-400">Forfallna</div>
            <div className="mt-3 text-2xl font-semibold">32 900 kr</div>
          </div>
          <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-slate-400">Skatt</div>
            <div className="mt-3 text-2xl font-semibold">58 420 kr</div>
          </div>
          <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-slate-400">Personal</div>
            <div className="mt-3 text-2xl font-semibold">6</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FinanceStatusWidget() {
  const items = [
    // TODO: fetch from API
    { label: "Banksaldo", value: "184 250 kr" },
    // TODO: fetch from API
    { label: "Forfallna", value: "32 900 kr" },
    // TODO: calculate from VAT + payroll
    { label: "Skatt", value: "58 420 kr" },
    // TODO: fetch active users
    { label: "Personal", value: "6" },
  ];

  return (
    <div className="rounded-[26px] border border-slate-200/80 bg-white/90 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur sm:rounded-[30px] sm:p-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 px-5 py-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
            <div className="mt-2 text-xl font-semibold text-slate-900">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopBar({
  onOpenSpotlight,
  toggleEdit,
  editMode,
  companyName,
}: {
  onOpenSpotlight: () => void;
  toggleEdit: () => void;
  editMode: boolean;
  companyName: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[26px] border border-slate-200/80 bg-white/90 px-4 py-4 shadow-[0_20px_44px_rgba(15,23,42,0.06)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4 xl:rounded-[30px] xl:px-6 xl:py-5">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold tracking-[0.16em] text-white">
          OS
        </div>
        <div>
          <div className="text-lg font-semibold text-slate-950">Ekonomi OS</div>
          <div className="text-sm text-slate-500">{companyName}</div>
        </div>
      </div>

      <div className="flex w-full items-center gap-3 sm:w-auto">
        <button onClick={onOpenSpotlight} className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 sm:min-w-[180px] sm:flex-none sm:px-5">
          Sok (Ctrl+K)
        </button>

        <button onClick={toggleEdit} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {editMode ? "Klar" : "Redigera"}
        </button>
      </div>
    </div>
  );
}

function Spotlight({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-slate-950/35 px-4 pt-24 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sok eller fraga AI..."
          className="w-full border-b border-slate-200 pb-3 text-base outline-none"
        />
      </div>
    </div>
  );
}

function FloatingAiBubble({
  onOpen,
}: {
  onOpen: () => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      <div className="rounded-full border border-slate-200/80 bg-white/95 px-4 py-2 text-xs font-medium text-slate-600 shadow-sm">
        Fraga Ekonomi AI
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold tracking-[0.18em] text-white shadow-[0_20px_45px_rgba(15,23,42,0.22)] transition hover:scale-105"
        aria-label="Oppna Ekonomi AI"
      >
        AI
      </button>
    </div>
  );
}

export default function FinancialDesktopUI() {
  const { onboardingData, currentCompanyId } = usePlatformState();
  const [apps, setApps] = useState(initialApps);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("desktop");
  const companies = createMockPlatformData(onboardingData).companies;
  const activeCompanyName =
    companies.find((company) => company.id === currentCompanyId)?.name ??
    companies[0]?.name ??
    "Aktivt foretag";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSpotlightOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const updateLayoutMode = () => {
      const width = window.innerWidth;
      const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

      if (width < 640 || (isCoarsePointer && width < 820)) {
        setLayoutMode("mobile");
        return;
      }

      if (width < 1180) {
        setLayoutMode("tablet");
        return;
      }

      setLayoutMode("desktop");
    };

    updateLayoutMode();
    window.addEventListener("resize", updateLayoutMode);
    return () => window.removeEventListener("resize", updateLayoutMode);
  }, []);

  const openApp = (app: DesktopApp) => {
    // TODO: connect routing
    // example: router.push("/invoices")
    console.log(`Oppnar ${app.label}`);
  };

  const moveApp = (appId: number, direction: number) => {
    setApps((currentApps) => {
      const currentIndex = currentApps.findIndex((app) => app.id === appId);
      if (currentIndex === -1) return currentApps;

      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= currentApps.length) return currentApps;

      const nextApps = [...currentApps];
      const [selectedApp] = nextApps.splice(currentIndex, 1);
      if (!selectedApp) return currentApps;
      nextApps.splice(nextIndex, 0, selectedApp);
      return nextApps;
    });
  };

  const wrapperMaxWidth =
    layoutMode === "desktop" ? "max-w-[1180px]" : layoutMode === "tablet" ? "max-w-[980px]" : "max-w-[640px]";
  const appGridClass =
    layoutMode === "desktop"
      ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6"
      : layoutMode === "tablet"
        ? "grid-cols-3 sm:grid-cols-4"
        : "grid-cols-2";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbff_0%,_#edf2f8_44%,_#e5ecf4_100%)] px-3 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-6">
      <div className={`mx-auto space-y-4 sm:space-y-5 ${wrapperMaxWidth}`}>
        <TopBar
          onOpenSpotlight={() => setSpotlightOpen(true)}
          toggleEdit={() => setEditMode(!editMode)}
          editMode={editMode}
          companyName={activeCompanyName}
        />

        <AiWidget />

        <FinanceStatusWidget />

        {editMode && (
          <div className="rounded-[26px] border border-slate-200/80 bg-white/90 px-4 py-3 text-center text-xs text-slate-500 shadow-sm">
            Anvand styrknapparna pa varje ikon for att flytta apparna och klicka pa Klar nar du ar fardig.
          </div>
        )}

        <div className="rounded-[28px] border border-slate-200/80 bg-white/75 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.05)] backdrop-blur sm:rounded-[30px] sm:p-6">
          <div className={`grid gap-x-6 gap-y-8 sm:gap-x-8 sm:gap-y-10 ${appGridClass}`}>
            {apps.map((app) => (
              <DesktopAppIcon
                key={app.id}
                app={app}
                editMode={editMode}
                onClick={openApp}
                onMove={moveApp}
              />
            ))}
          </div>
        </div>
      </div>

      <Spotlight open={spotlightOpen} onClose={() => setSpotlightOpen(false)} />
      <FloatingAiBubble onOpen={() => setSpotlightOpen(true)} />
    </div>
  );
}
