// app/page.tsx
'use client';

import { Fraunces, Caveat, Inter } from 'next/font/google';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AnimatedGlowBackground } from '@/components/layout/AnimatedGlowBackground';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-fraunces' });
const caveat = Caveat({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-caveat' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-inter' });

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
      {children}
    </motion.div>
  );
}

const icons = {
  headphones: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D1821" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" />
    </svg>
  ),
  check: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D1821" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.2 2.2 4.8-5" />
    </svg>
  ),
  chart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D1821" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 20V10M12 20V4M20 20v-7" />
    </svg>
  ),
};

function FeatureCard({ icon, title, description }: { icon: keyof typeof icons; title: string; description: string }) {
  return (
    <motion.div variants={fadeUp} className="rounded-2xl p-7 border" style={{ borderColor: '#BFCC9455', backgroundColor: '#BFCC9422' }} whileHover={{ y: -6, transition: { duration: 0.25 } }}>
      <div className="w-10 h-10 rounded-full mb-5 flex items-center justify-center" style={{ backgroundColor: '#BFCC94' }}>{icons[icon]}</div>
      <h3 className="text-base font-medium mb-2">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: '#344966' }}>{description}</p>
    </motion.div>
  );
}

function ScenarioCard({ title, description, href, tag }: { title: string; description: string; href: string; tag: string }) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -6 }} transition={{ duration: 0.25 }}>
      <Link href={href} className="block rounded-2xl border h-full p-8" style={{ borderColor: '#0D182122', backgroundColor: '#FFFFFF' }}>
        <span className="inline-block text-xs px-3 py-1 rounded-full mb-5" style={{ backgroundColor: '#BFCC94', color: '#0D1821' }}>{tag}</span>
        <h3 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '20px', fontWeight: 500 }} className="mb-3">{title}</h3>
        <p className="text-sm leading-relaxed mb-6" style={{ color: '#344966' }}>{description}</p>
        <span className="text-sm font-medium" style={{ color: '#0D1821' }}>Try this scenario →</span>
      </Link>
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className={`${fraunces.variable} ${caveat.variable} ${inter.variable}`} style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F0F4EF', color: '#0D1821' }}>
      {/* Nav */}
      <motion.nav initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center px-8 py-5 border-b sticky top-0 z-20 backdrop-blur" style={{ borderColor: '#34496622', backgroundColor: '#F0F4EFcc' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center border" style={{ borderColor: '#0D1821', fontFamily: 'var(--font-caveat)', fontSize: '15px' }}>OB</div>
          <span style={{ fontFamily: 'var(--font-caveat)', fontSize: '26px', fontWeight: 700 }}>OnBoardly</span>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-40"><AnimatedGlowBackground /></div>
        <div className="max-w-5xl mx-auto px-8 pt-28 pb-20 text-center">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-sm mb-5" style={{ color: '#344966' }}>
            For construction, warehousing, and hospitality employers
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} style={{ fontFamily: 'var(--font-fraunces)', fontSize: '48px', lineHeight: 1.15, fontWeight: 500 }} className="mb-6">
            Every new worker understands day one — in their own language.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="text-lg leading-relaxed max-w-xl mx-auto mb-9" style={{ color: '#344966' }}>
            A tablet at the site entrance narrates induction, safety steps, and pay basics
            in English, Mandarin, or Punjabi, then confirms understanding.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="flex items-center justify-center gap-3 mb-10">
            {['EN', '中文', 'ਪੰ'].map((l) => (
              <span key={l} className="w-10 h-10 rounded-full flex items-center justify-center text-sm border" style={{ borderColor: '#0D182133', backgroundColor: '#B4CDED55' }}>{l}</span>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}>
            <a href="#scenarios" className="inline-block px-6 py-3 rounded-full text-sm" style={{ backgroundColor: '#BFCC94', color: '#0D1821' }}>See how it works ↓</a>
          </motion.div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-5xl mx-auto px-8 py-16">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <FeatureCard icon="headphones" title="Spoken induction" description="Real voice narration of every safety and HR step, not just text on a screen." />
          <FeatureCard icon="check" title="Understood, not just delivered" description="Workers confirm each step so managers know it landed, not just that it played." />
          <FeatureCard icon="chart" title="Live manager view" description="Completion status per worker, per language, updating without a paper checklist." />
        </motion.div>
      </section>

      {/* Why section */}
      <section className="border-t" style={{ borderColor: '#34496622', backgroundColor: '#344966', color: '#F0F4EF' }}>
        <div className="max-w-5xl mx-auto px-8 py-24">
          <Reveal><h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '28px', fontWeight: 500 }} className="mb-10">Why we built this</h2></Reveal>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-sm leading-relaxed">
            {[
              { stat: '239k+', body: 'Punjabi speakers in Australia, the fastest growing language in the country — most onboarding still happens in English only.' },
              { stat: '1 in 3', body: 'Migrant workers surveyed were paid roughly half the legal minimum, often because entitlements were never explained clearly.' },
              { stat: '0 apps', body: 'No smartphone, no data plan, no account to make — just a device already sitting at the site entrance.' },
            ].map((item) => (
              <motion.div key={item.stat} variants={fadeUp}>
                <p className="text-3xl mb-2" style={{ fontFamily: 'var(--font-fraunces)', color: '#BFCC94' }}>{item.stat}</p>
                <p style={{ color: '#B4CDED' }}>{item.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-8 py-24">
        <Reveal><h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '28px', fontWeight: 500 }} className="mb-10">What actually happens</h2></Reveal>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className="space-y-8">
          {[
            { title: 'Pick a language', body: 'English, Mandarin, or Punjabi — one tap, no menus to dig through.' },
            { title: 'Listen to each step', body: 'PPE, exits, hazard reporting, pay — narrated aloud with a transcript on screen at the same time.' },
            { title: 'Confirm you understood', body: "A simple tap or spoken response — no long quiz standing between a worker and their first shift." },
            { title: 'Manager sees it happen live', body: "Who's done what, in which language, updating without anyone chasing a paper form." },
          ].map((step, i) => (
            <motion.div key={step.title} variants={fadeUp} className="flex gap-5 items-start">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5" style={{ backgroundColor: '#BFCC94', color: '#0D1821' }}>{i + 1}</div>
              <div>
                <h3 className="text-base font-medium mb-1">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#344966' }}>{step.body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Scenarios */}
      <section id="scenarios" className="border-t" style={{ borderColor: '#34496622' }}>
        <div className="max-w-5xl mx-auto px-8 py-28">
          <Reveal><h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '32px', fontWeight: 500 }} className="mb-4 text-center">Two real scenarios, ready to try</h2></Reveal>
          <Reveal><p className="text-base leading-relaxed max-w-lg mx-auto mb-14 text-center" style={{ color: '#344966' }}>These aren't mockups — pick one and go through the actual flow, with real ElevenLabs voice narration.</p></Reveal>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ScenarioCard tag="Frontline" title="Warehouse worker" description="A frontline warehouse hire goes through site safety, PPE, and hazard reporting in their own language before their first shift." href="/onboarding/warehouse" />
            <ScenarioCard tag="Office" title="Office / software new hire" description="A new office employee walks through company policy, tools, and team basics — the same voice-first approach, a different setting." href="/onboarding/software" />
          </motion.div>
        </div>
      </section>

      <footer className="px-8 py-10 text-sm flex items-center justify-between" style={{ backgroundColor: '#0D1821', color: '#F0F4EF' }}>
        <span style={{ fontFamily: 'var(--font-caveat)', fontSize: '20px' }}>OnBoardly</span>
        <span style={{ color: '#B4CDED' }}>All data shown is synthetic, for demo purposes only.</span>
      </footer>
    </div>
  );
} 