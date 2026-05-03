'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";

const features = [
  { icon: "✨", title: "AI som jobbar åt dig", text: "Systemet visar exakt vad du ska göra – innan du ens tänker på det." },
  { icon: "📄", title: "Fakturera snabbare", text: "Skapa och skicka fakturor på sekunder, inte timmar." },
  { icon: "🧾", title: "Kvitton utan kaos", text: "Alla kvitton samlas automatiskt och kopplas rätt." },
  { icon: "📚", title: "Bokföring utan stress", text: "Full kontroll utan att behöva vara expert." },
  { icon: "🏛️", title: "Skatt & moms klart", text: "Se exakt vad du ska betala – innan det är för sent." },
  { icon: "⏱️", title: "Tid & projekt", text: "Se vem som jobbar, vad som faktureras och vad som saknas." },
];

const testimonials = [
  { text: "Vi sparar minst 10 timmar i veckan. Helt sjukt.", name: "Byggfirma Stockholm" },
  { text: "Första gången jag faktiskt har koll på ekonomin.", name: "Målerifirma Göteborg" },
];

const faqItems = [
  { question: "Vad är Ekonomi OS?", answer: "Ett modernt ekonomisystem där AI hjälper dig att driva företaget – inte bara bokföra det." },
  { question: "Passar det serviceföretag?", answer: "Ja, det är byggt för företag med kunder, projekt, personal och löpande arbete." },
  { question: "Ingår AI-assistenten?", answer: "Ja. Den guidar dig varje dag och visar vad som behöver göras." },
  { question: "Vad kostar det?", answer: "1 399 kr per månad inklusive moms. Inget krångel." },
  { question: "Kan vi få hjälp att komma igång?", answer: "Ja, onboarding och support ingår så att du snabbt kommer igång." },
];

function MiniOsPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mx-auto w-full max-w-xl rounded-[40px] bg-gradient-to-br from-slate-900 to-cyan-900 p-[2px] shadow-[0_40px_120px_rgba(0,200,255,0.25)]"
    >
      <div className="rounded-[38px] bg-slate-950 p-5 text-white">
        <div className="mb-4 text-xs text-cyan-300">✨ AI Ekonomikoll</div>
        <div className="text-lg font-semibold">Du har 4 saker att göra idag</div>
        <div className="mt-2 text-sm text-slate-300">2 kvitton, 1 faktura, 1 momsrapport</div>

        <div className="mt-4 grid grid-cols-4 gap-3">
          {[["🏦","184k"],["📄","32k"],["🏛️","58k"],["👷","6"]].map(([icon,value]) => (
            <div key={value} className="rounded-2xl bg-white/10 p-3 text-center">
              <div>{icon}</div>
              <div className="text-xs font-bold">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function FAQItem({
  item,
  open,
  onClick,
}: {
  item: { question: string; answer: string };
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="w-full rounded-2xl bg-white p-5 text-left shadow-sm">
      <div className="flex justify-between">
        <div className="font-semibold">{item.question}</div>
        <div>{open ? "−" : "+"}</div>
      </div>
      {open && <p className="mt-2 text-sm text-gray-600">{item.answer}</p>}
    </button>
  );
}

export default function EkonomiOsLandingPrototype() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-cyan-50 text-slate-900">
      {/* Sticky CTA */}
      <div className="fixed bottom-4 left-1/2 z-50 w-[92%] max-w-xl -translate-x-1/2 rounded-2xl bg-slate-900 p-3 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-slate-300">Starta idag – få onboarding direkt</div>
          <button className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white">Kom igång</button>
        </div>
      </div>

      <header className="flex justify-between px-6 py-4">
        <div className="font-bold">Ekonomi OS</div>
        <button className="rounded-full bg-cyan-500 px-4 py-2 text-white">Kom igång</button>
      </header>

      <main className="mx-auto max-w-7xl px-6">
        <section className="grid gap-12 py-20 lg:grid-cols-2">
          <div>
            <div className="mb-4 text-sm font-medium text-cyan-700">Används av 120+ företag</div>

            <h1 className="text-6xl font-bold leading-tight">
              Sluta jobba med bokföring
              <br />
              Låt systemet göra det åt dig
            </h1>

            <p className="mt-6 text-lg text-gray-600">
              Ekonomi OS är byggt för företag som vill ha kontroll utan att lägga tid på administration.
            </p>

            <div className="mt-8 flex gap-3">
              <button className="rounded-2xl bg-cyan-500 px-8 py-4 text-lg text-white shadow-xl">
                Kom igång
              </button>

              <button className="rounded-2xl bg-white px-6 py-4 text-lg text-slate-700 shadow">
                Se demo
              </button>
            </div>

            <div className="mt-4 text-sm text-cyan-700">
              Starta idag – få onboarding direkt
            </div>
          </div>

          <MiniOsPreview />
        </section>

        {/* Testimonials */}
        <section className="grid gap-4 py-10 md:grid-cols-2">
          {testimonials.map((t) => (
            <div key={t.text} className="rounded-2xl bg-white p-6 shadow">
              <div className="text-sm text-gray-600">“{t.text}”</div>
              <div className="mt-3 text-xs text-gray-400">— {t.name}</div>
            </div>
          ))}
        </section>

        {/* Before/After */}
        <section className="grid gap-6 py-10 md:grid-cols-2">
          <div className="rounded-2xl bg-red-50 p-6">
            <div className="font-semibold text-red-700">Före</div>
            <ul className="mt-3 space-y-1 text-sm text-red-600">
              <li>Excel och kaos</li>
              <li>Missade kvitton</li>
              <li>Ingen kontroll</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-green-50 p-6">
            <div className="font-semibold text-green-700">Efter</div>
            <ul className="mt-3 space-y-1 text-sm text-green-600">
              <li>AI visar vad du ska göra</li>
              <li>Allt samlat</li>
              <li>Full kontroll</li>
            </ul>
          </div>
        </section>

        <section className="grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl bg-white p-6 shadow">
              <div className="text-xl">{f.icon}</div>
              <div className="mt-2 font-semibold">{f.title}</div>
              <div className="text-sm text-gray-500">{f.text}</div>
            </div>
          ))}
        </section>

        {/* Pricing */}
        <section className="py-20 text-center">
          <div className="text-5xl font-bold">1 399 kr / månad</div>
          <div className="text-gray-500">inkl. moms</div>
          <div className="mt-3 text-sm text-gray-500">30 dagars garanti – testa utan risk</div>
          <button className="mt-6 rounded-2xl bg-cyan-500 px-8 py-4 text-white">
            Starta direkt
          </button>
        </section>

        <section className="py-16">
          <h2 className="mb-6 text-center text-3xl font-bold">Vanliga frågor</h2>
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <FAQItem key={item.question} item={item} open={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? -1 : index)} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export function LandingPage() {
  return <EkonomiOsLandingPrototype />;
}
