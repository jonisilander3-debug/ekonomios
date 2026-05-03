'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";

// Shared styles
const pageBg =
  "min-h-screen bg-[radial-gradient(circle_at_top_right,#d8fbff_0,transparent_35%),radial-gradient(circle_at_top_left,#e8f6ff_0,transparent_35%),linear-gradient(180deg,#ffffff,#f4fbff)] text-slate-900";
const glassCard =
  "rounded-3xl bg-white/80 backdrop-blur-xl ring-1 ring-cyan-100 shadow-xl shadow-cyan-900/5";
const primaryBtn =
  "rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition";
const secondaryBtn =
  "rounded-2xl bg-white px-6 py-3 font-semibold text-slate-700 shadow ring-1 ring-slate-200 hover:bg-slate-50";

const features = [
  { icon: "✨", title: "AI som jobbar åt dig", text: "Systemet visar exakt vad du ska göra – innan du ens tänker på det." },
  { icon: "📄", title: "Fakturera snabbare", text: "Skapa och skicka fakturor på sekunder." },
  { icon: "🧾", title: "Kvitton utan kaos", text: "Alla kvitton samlas automatiskt." },
  { icon: "📚", title: "Bokföring utan stress", text: "Full kontroll utan att vara expert." },
  { icon: "🏛️", title: "Skatt & moms", text: "Se vad du ska betala i förväg." },
  { icon: "⏱️", title: "Tid & projekt", text: "Följ arbete och fakturering enkelt." },
];

const testimonials = [
  { text: "Vi sparar minst 10 timmar i veckan.", name: "Byggfirma Stockholm" },
  { text: "Första gången jag har full kontroll.", name: "Målerifirma Göteborg" },
];

function Header({ onLogin }: { onLogin: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="font-bold tracking-wide">Ekonomi OS</div>
        <div className="flex items-center gap-3">
          <button onClick={onLogin} className="rounded-full px-4 py-2 text-sm text-slate-600 hover:text-cyan-700">
            Logga in
          </button>
          <button className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-white">Kom igång</button>
        </div>
      </div>
    </header>
  );
}

function MiniOsPreview() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${glassCard} p-5`}>
      <div className="rounded-2xl bg-slate-950 p-4 text-white">
        <div className="text-xs text-cyan-300">✨ AI Ekonomikoll</div>
        <div className="text-lg font-semibold">4 saker att göra</div>
        <div className="mt-2 text-sm text-slate-300">Kvitton, faktura, moms</div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {["🏦", "📄", "🏛️", "👷"].map((i, idx) => (
          <div key={idx} className="rounded-xl bg-slate-50 p-3 text-center">
            {i}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function LoginPage({ onBack }: { onBack: () => void }) {
  return (
    <div className={pageBg}>
      <Header onLogin={onBack} />
      <main className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1fr_420px]">
        <div>
          <h1 className="text-5xl font-bold">Logga in</h1>
          <p className="mt-4 text-slate-600">Fortsätt där du slutade.</p>
        </div>
        <div className={`${glassCard} mx-auto w-full max-w-md p-6`}>
          <input placeholder="E-post" className="mb-3 w-full rounded-xl border px-4 py-3 text-sm" />
          <input placeholder="Lösenord" type="password" className="mb-4 w-full rounded-xl border px-4 py-3 text-sm" />
          <button className={`${primaryBtn} w-full py-3 text-sm`}>Logga in</button>
          <button className="mt-3 w-full rounded-xl bg-slate-900 py-3 text-sm text-white">BankID</button>
        </div>
      </main>
    </div>
  );
}

export default function EkonomiOsLandingPrototype() {
  const [showLogin, setShowLogin] = useState(false);

  if (showLogin) return <LoginPage onBack={() => setShowLogin(false)} />;

  return (
    <div className={pageBg}>
      <Header onLogin={() => setShowLogin(true)} />

      <main className="mx-auto max-w-7xl px-6">
        <section className="grid gap-12 py-20 lg:grid-cols-2">
          <div>
            <div className="text-sm text-cyan-700">Används av 120+ företag</div>
            <h1 className="text-6xl font-bold leading-tight">Sluta jobba med bokföring</h1>
            <p className="mt-6 text-lg text-slate-600">Låt systemet göra jobbet åt dig.</p>
            <div className="mt-6 flex gap-3">
              <button className={primaryBtn}>Kom igång</button>
              <button className={secondaryBtn}>Se demo</button>
            </div>
          </div>
          <MiniOsPreview />
        </section>

        <section className="grid gap-4 py-10 md:grid-cols-2">
          {testimonials.map((t) => (
            <div key={t.text} className={`${glassCard} p-5`}>
              “{t.text}”
              <div className="mt-2 text-xs text-slate-400">— {t.name}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-4 py-10 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className={`${glassCard} p-5`}>
              <div>{f.icon}</div>
              <div className="mt-2 font-semibold">{f.title}</div>
              <div className="text-sm text-slate-500">{f.text}</div>
            </div>
          ))}
        </section>

        <section className="py-16 text-center">
          <div className="text-4xl font-bold">1 399 kr / månad</div>
          <div className="text-sm text-slate-500">inkl. moms</div>
          <button className={`mt-6 ${primaryBtn}`}>Starta direkt</button>
        </section>
      </main>
    </div>
  );
}

export function LandingPage() {
  return <EkonomiOsLandingPrototype />;
}
