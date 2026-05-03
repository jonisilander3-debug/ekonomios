'use client';

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createMockPlatformData } from "@/features/platform-data/mock-data";
import { usePlatformState } from "@/features/platform-data/use-platform-state";

const initialApps = [
  { id: 1, label: "Kunder", icon: "👥", badge: "12" },
  { id: 2, label: "Projekt", icon: "💼", badge: "8" },
  { id: 3, label: "Fakturor", icon: "📄", badge: "5" },
  { id: 4, label: "Kvitton", icon: "🧾", badge: "3" },
  { id: 5, label: "Bokföring", icon: "📚" },
  { id: 6, label: "Löner", icon: "💳", badge: "2" },
  { id: 7, label: "Moms", icon: "%", badge: "1" },
  { id: 8, label: "Rapporter", icon: "📊" },
];

type DesktopApp = (typeof initialApps)[number];

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
      whileHover={{ scale: editMode ? 1.02 : 1.05 }}
      animate={editMode ? { rotate: [0, -1, 1, 0] } : { rotate: 0 }}
      transition={editMode ? { repeat: Infinity, duration: 0.55 } : { duration: 0.2 }}
      className={`relative flex flex-col items-center gap-1 ${editMode ? "cursor-default" : "cursor-pointer"}`}
    >
      <div className="relative">
        {app.badge && (
          <div className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-[10px] text-white">
            {app.badge}
          </div>
        )}

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-xl shadow-sm">
          {app.icon}
        </div>

        {hover && !editMode && (
          <div className="absolute left-1/2 top-16 z-20 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black px-2 py-1 text-xs text-white">
            Öppna {app.label}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-600">{app.label}</div>

      {editMode && (
        <div className="mt-1 grid grid-cols-3 gap-1 rounded-xl bg-white p-1 shadow-sm">
          <button onClick={() => onMove(app.id, -6)} className="col-start-2 rounded bg-gray-100 px-1 text-[10px]">↑</button>
          <button onClick={() => onMove(app.id, -1)} className="rounded bg-gray-100 px-1 text-[10px]">←</button>
          <button onClick={() => onMove(app.id, 1)} className="rounded bg-gray-100 px-1 text-[10px]">→</button>
          <button onClick={() => onMove(app.id, 6)} className="rounded bg-gray-100 px-1 text-[10px]">↓</button>
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
      className="rounded-[30px] bg-black p-6 text-white shadow-xl"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 text-xs text-green-300">✨ AI Ekonomikoll</div>
          <h2 className="text-xl font-semibold">God morgon, Joni</h2>
          <p className="mt-1 text-sm text-gray-300">Här är det viktigaste idag</p>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">7</div>
          <div className="text-xs">insikter</div>
        </div>
      </div>

      <div className="mt-3 space-y-2 text-sm">
        <div>⚠️ 3 kvitton behöver kontrolleras</div>
        <div>✅ 2 fakturor redo att skickas</div>
        <div>⏱️ Momsrapport nästan klar</div>
      </div>

      <button className="mt-4 w-full rounded-xl bg-white py-2 text-sm font-semibold text-black">
        Öppna AI
      </button>
    </motion.div>
  );
}

function FinanceStatusWidget() {
  const items = [
    // TODO: fetch from API
    { label: "Banksaldo", value: "184 250 kr", icon: "🏦" },
    // TODO: fetch from API
    { label: "Förfallna", value: "32 900 kr", icon: "📄" },
    // TODO: calculate from VAT + payroll
    { label: "Skatt", value: "58 420 kr", icon: "🏛️" },
    // TODO: fetch active users
    { label: "Personal", value: "6", icon: "👷" },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
            {item.icon}
          </div>
          <div className="text-[11px] text-gray-500">{item.label}</div>
          <div className="text-sm font-semibold">{item.value}</div>
        </div>
      ))}
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
    <div className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">🏢</div>
        <div>
          <div className="text-sm font-semibold">Ekonomi OS</div>
          <div className="text-xs text-gray-500">{companyName}</div>
        </div>
      </div>

      <button onClick={onOpenSpotlight} className="hidden rounded-xl bg-gray-100 px-4 py-2 text-sm md:flex">
        🔎 Sök (Ctrl+K)
      </button>

      <button onClick={toggleEdit} className="rounded-xl bg-gray-100 px-3 py-2 text-xs">
        {editMode ? "Klar" : "Redigera"}
      </button>
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
    <div className="fixed inset-0 flex items-start justify-center bg-black/40 pt-24" onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sök eller fråga AI..."
          className="w-full border-b pb-2 outline-none"
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
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-center gap-2">
      <div className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm">
        Fråga Ekonomi AI
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-xl text-white shadow-xl transition hover:scale-105"
        aria-label="Öppna Ekonomi AI"
      >
        ✨
      </button>
    </div>
  );
}

export default function FinancialDesktopUI() {
  const { onboardingData, currentCompanyId } = usePlatformState();
  const [apps, setApps] = useState(initialApps);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const companies = createMockPlatformData(onboardingData).companies;
  const activeCompanyName =
    companies.find((company) => company.id === currentCompanyId)?.name ??
    companies[0]?.name ??
    "Aktivt företag";

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

  const openApp = (app: DesktopApp) => {
    // TODO: connect routing
    // example: router.push("/invoices")
    console.log(`Öppnar ${app.label}`);
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <TopBar
          onOpenSpotlight={() => setSpotlightOpen(true)}
          toggleEdit={() => setEditMode(!editMode)}
          editMode={editMode}
          companyName={activeCompanyName}
        />

        <AiWidget />

        <FinanceStatusWidget />

        {/* Drag & Drop grid */}
        {editMode && (
          <div className="rounded-2xl bg-white px-4 py-3 text-center text-xs text-gray-500 shadow-sm">
            Använd pilarna på varje ikon för att flytta den vänster, höger, upp eller ner. Klicka på Klar när du är färdig.
          </div>
        )}

        <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6">
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

      <Spotlight open={spotlightOpen} onClose={() => setSpotlightOpen(false)} />
      <FloatingAiBubble onOpen={() => setSpotlightOpen(true)} />
    </div>
  );
}
