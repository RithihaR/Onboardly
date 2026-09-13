// app/page.tsx
'use client';

import { Fraunces, Caveat, Inter } from 'next/font/google';
import Link from 'next/link';
import { motion, useScroll, useSpring, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';
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

function Counter({ to, suffix = '', prefix = '' }: { to: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1] as const });
      return () => controls.stop();
    }
  }, [inView, to, count]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
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
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D1821" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" />
    </svg>
  ),
  globe: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D1821" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.8 2.5 15.2 0 18M12 3c-2.5 2.8-2.5 15.2 0 18" />
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D1821" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  ),
};

function FeatureCard({ icon, title, description }: { icon: keyof typeof icons; title: string; description: string }) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl p-7 border"
      style={{ borderColor: '#BFCC9455', backgroundColor: '#BFCC9422' }}
      whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(13,24,33,0.08)', transition: { duration: 0.25 } }}
    >
      <div className="w-10 h-10 rounded-full mb-5 flex items-center justify-center" style={{ backgroundColor: '#BFCC94' }}>{icons[icon]}</div>
      <h3 className="text-base font-medium mb-2">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: '#344966' }}>{description}</p>
    </motion.div>
  );
}

function ScenarioCard({ title, description, href, tag, image }: { title: string; description: string; href: string; tag: string; image: string }) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(13,24,33,0.12)' }} transition={{ duration: 0.25 }} className="rounded-2xl">
      <Link href={href} className="block rounded-2xl border h-full overflow-hidden group" style={{ borderColor: '#0D182122', backgroundColor: '#FFFFFF' }}>
        <div className="h-52 w-full overflow-hidden">
          <motion.img
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="p-8">
          <span className="inline-block text-xs px-3 py-1 rounded-full mb-4" style={{ backgroundColor: '#BFCC94', color: '#0D1821' }}>{tag}</span>
          <h3 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '20px', fontWeight: 500 }} className="mb-3">{title}</h3>
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#344966' }}>{description}</p>
          <span className="text-sm font-medium inline-flex items-center gap-2" style={{ color: '#0D1821' }}>
            Try this scenario <span>→</span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroImgY = useTransform(heroProgress, [0, 1], [0, 60]);

  return (
    <div className={`${fraunces.variable} ${caveat.variable} ${inter.variable}`} style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F0F4EF', color: '#0D1821' }}>
      {/* Scroll progress */}
      <motion.div style={{ scaleX, transformOrigin: '0%', backgroundColor: '#BFCC94' }} className="fixed top-0 left-0 right-0 h-1 z-50" />

      {/* Nav */}
      <motion.nav initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between px-8 py-5 border-b sticky top-0 z-40 backdrop-blur" style={{ borderColor: '#34496622', backgroundColor: '#F0F4EFcc' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center border" style={{ borderColor: '#0D1821', fontFamily: 'var(--font-caveat)', fontSize: '15px' }}>OB</div>
          <span style={{ fontFamily: 'var(--font-caveat)', fontSize: '26px', fontWeight: 700 }}>OnBoardly</span>
        </div>
        <a href="#scenarios" className="hidden sm:inline-block px-5 py-2 rounded-full text-sm" style={{ backgroundColor: '#0D1821', color: '#F0F4EF' }}>Try the demo</a>
      </motion.nav>

      {/* Hero — split with real photo */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30"><AnimatedGlowBackground /></div>
        <div className="max-w-6xl mx-auto px-8 pt-24 pb-24 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mb-6">
              <span className="inline-flex items-center gap-2 text-xs px-4 py-1.5 rounded-full border" style={{ borderColor: '#34496633', backgroundColor: '#FFFFFF', color: '#344966' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#BFCC94' }} />
                Built for Australian frontline workplaces
              </span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} style={{ fontFamily: 'var(--font-fraunces)', fontSize: '46px', lineHeight: 1.12, fontWeight: 500, letterSpacing: '-0.02em' }} className="mb-6">
              Every new worker understands day one — in their own language.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="text-lg leading-relaxed mb-8" style={{ color: '#344966' }}>
              A tablet at the site entrance narrates induction, safety steps, and pay basics
              in English, Mandarin, or Punjabi, then confirms understanding.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="flex items-center gap-3 mb-9">
              {['EN', '中文', 'ਪੰ'].map((l) => (
                <motion.span key={l} whileHover={{ y: -3 }} className="w-11 h-11 rounded-full flex items-center justify-center text-sm border cursor-default" style={{ borderColor: '#0D182133', backgroundColor: '#B4CDED55' }}>{l}</motion.span>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}>
              <motion.a whileHover={{ y: -2 }} href="#scenarios" className="inline-block px-7 py-3.5 rounded-full text-sm" style={{ backgroundColor: '#BFCC94', color: '#0D1821' }}>
                See how it works ↓
              </motion.a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            style={{ y: heroImgY }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl">
              <img src="/frontline-tablet.jpg" alt="A frontline worker using a tablet on site" className="w-full h-full object-cover" />
            </div>
            {/* Floating caption card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.9 }}
              className="absolute -bottom-5 -left-5 rounded-2xl px-5 py-4 shadow-lg max-w-[220px]"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#BFCC94' }} />
                <span className="text-xs font-medium">Step 2 of 5 · ਪੰਜਾਬੀ</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#344966' }}>Narrating: personal protective equipment</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y" style={{ borderColor: '#34496618', backgroundColor: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-8 py-7">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm" style={{ color: '#344966' }}>
            {['Construction sites', 'Warehousing & logistics', 'Hospitality', 'Aged care', 'Emergency services'].map((s) => (
              <motion.span key={s} variants={fadeUp} className="inline-flex items-center gap-2">
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#BFCC94' }} />
                {s}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <Reveal><h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '30px', fontWeight: 500 }} className="mb-3 text-center">Built for people the software industry forgot</h2></Reveal>
        <Reveal><p className="text-base max-w-xl mx-auto mb-14 text-center leading-relaxed" style={{ color: '#344966' }}>No personal phone. No app store. No literacy assumption. Just a device at the door that speaks.</p></Reveal>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <FeatureCard icon="headphones" title="Spoken induction" description="Real voice narration of every safety and HR step, not just text on a screen." />
          <FeatureCard icon="check" title="Understood, not just delivered" description="Workers confirm each step so managers know it landed, not just that it played." />
          <FeatureCard icon="chart" title="Live manager view" description="Completion status per worker, per language, updating without a paper checklist." />
          <FeatureCard icon="globe" title="Three languages, day one" description="English, Mandarin, and Punjabi — chosen from actual Australian census data, not guesswork." />
          <FeatureCard icon="shield" title="Answers, never guesses" description="Questions it can't answer from approved documents escalate to a supervisor instead." />
          <FeatureCard icon="clock" title="Ready in minutes" description="Load your induction content, sit a tablet at the entrance, and you're running." />
        </motion.div>
      </section>

      {/* Problem section with photo */}
      <section className="border-t" style={{ borderColor: '#34496622', backgroundColor: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-8 py-24 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <Reveal>
            <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-xl">
              <img src="/warehouse-worker.jpg" alt="A warehouse worker filling in a paper logbook" loading="lazy" className="w-full h-full object-cover" />
            </div>
          </Reveal>
          <div>
            <Reveal>
              <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '32px', fontWeight: 500, lineHeight: 1.25 }} className="mb-6">
                Right now, this is what "onboarding" looks like.
              </h2>
            </Reveal>
            <Reveal>
              <p className="text-base leading-relaxed mb-5" style={{ color: '#344966' }}>
                A paper form in a language you half-read. A supervisor reciting safety rules from memory,
                in a hurry, in English. A nod that means "I don't want to look slow," not "I understand."
              </p>
            </Reveal>
            <Reveal>
              <p className="text-base leading-relaxed" style={{ color: '#344966' }}>
                The compliance box gets ticked. The understanding never happens. And the risk sits with
                the person who understood the least.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t" style={{ borderColor: '#34496622', backgroundColor: '#344966', color: '#F0F4EF' }}>
        <div className="max-w-6xl mx-auto px-8 py-24">
          <Reveal><h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '30px', fontWeight: 500 }} className="mb-12">Why we built this</h2></Reveal>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-sm leading-relaxed">
            <motion.div variants={fadeUp}>
              <p className="text-4xl mb-3" style={{ fontFamily: 'var(--font-fraunces)', color: '#BFCC94' }}><Counter to={239000} suffix="+" /></p>
              <p style={{ color: '#B4CDED' }}>Punjabi speakers in Australia, the fastest growing language in the country — most onboarding still happens in English only.</p>
            </motion.div>
            <motion.div variants={fadeUp}>
              <p className="text-4xl mb-3" style={{ fontFamily: 'var(--font-fraunces)', color: '#BFCC94' }}>1 in 3</p>
              <p style={{ color: '#B4CDED' }}>Migrant workers surveyed were paid roughly half the legal minimum, often because entitlements were never explained clearly.</p>
            </motion.div>
            <motion.div variants={fadeUp}>
              <p className="text-4xl mb-3" style={{ fontFamily: 'var(--font-fraunces)', color: '#BFCC94' }}>0 apps</p>
              <p style={{ color: '#B4CDED' }}>No smartphone, no data plan, no account to make — just a device already sitting at the site entrance.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pull quote */}
      <section className="max-w-3xl mx-auto px-8 py-24 text-center">
        <Reveal>
          <p style={{ fontFamily: 'var(--font-fraunces)', fontSize: '28px', lineHeight: 1.5, fontWeight: 400 }}>
            "Workers nod along because saying <span style={{ color: '#344966' }}>I don't understand</span> costs more than pretending."
          </p>
        </Reveal>
        <Reveal><p className="text-sm mt-6" style={{ color: '#344966' }}>The problem OnBoardly is built to remove</p></Reveal>
      </section>

      {/* How it works */}
      <section className="border-t" style={{ borderColor: '#34496622' }}>
        <div className="max-w-6xl mx-auto px-8 py-24 grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <Reveal><h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '30px', fontWeight: 500 }} className="mb-10">What actually happens</h2></Reveal>
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className="space-y-7">
              {[
                { title: 'Pick a language', body: 'English, Mandarin, or Punjabi — one tap, no menus to dig through.' },
                { title: 'Listen to each step', body: 'PPE, exits, hazard reporting, pay — narrated aloud with a transcript on screen.' },
                { title: 'Ask anything, out loud', body: 'Speak a question, get a grounded answer — or a clear handoff to a supervisor.' },
                { title: 'Confirm you understood', body: 'A tap or spoken response. No long quiz before a first shift.' },
                { title: 'Manager sees it live', body: "Who's done what, in which language, without chasing paper." },
              ].map((step, i) => (
                <motion.div key={step.title} variants={fadeUp} className="flex gap-5 items-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 font-medium" style={{ backgroundColor: '#BFCC94', color: '#0D1821' }}>{i + 1}</div>
                  <div>
                    <h3 className="text-base font-medium mb-1">{step.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#344966' }}>{step.body}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <Reveal className="flex items-center">
            <div className="rounded-3xl overflow-hidden aspect-[3/4] shadow-xl w-full">
              <img src="/warehouse-checking.jpg" alt="A supervisor checking progress on a tablet in a warehouse" loading="lazy" className="w-full h-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Manager dashboard section */}
      <section className="border-t" style={{ borderColor: '#34496622', backgroundColor: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-8 py-24 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <div>
            <Reveal><h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '32px', fontWeight: 500, lineHeight: 1.25 }} className="mb-6">Managers stop guessing who's actually ready.</h2></Reveal>
            <Reveal>
              <p className="text-base leading-relaxed mb-6" style={{ color: '#344966' }}>
                Every confirmation, every question asked, every escalation — logged as it happens.
                Not a signature on a clipboard that proves someone held a pen.
              </p>
            </Reveal>
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-3">
              {['Completion status per worker, per module', 'Which language each worker chose', 'Questions that needed a human answer'].map((item) => (
                <motion.div key={item} variants={fadeUp} className="flex items-center gap-3 text-sm" style={{ color: '#344966' }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#BFCC94' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0D1821" strokeWidth="3" strokeLinecap="round"><path d="M5 13l4 4L19 7" /></svg>
                  </span>
                  {item}
                </motion.div>
              ))}
            </motion.div>
          </div>
          <Reveal>
            <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-xl">
              <img src="/dashboard.jpg" alt="A manager reviewing a compliance dashboard" loading="lazy" className="w-full h-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Scenarios */}
      <section id="scenarios" className="border-t" style={{ borderColor: '#34496622' }}>
        <div className="max-w-5xl mx-auto px-8 py-28">
          <Reveal><h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '34px', fontWeight: 500 }} className="mb-4 text-center">Two real scenarios, ready to try</h2></Reveal>
          <Reveal><p className="text-base leading-relaxed max-w-lg mx-auto mb-14 text-center" style={{ color: '#344966' }}>These aren't mockups — pick one and go through the actual flow, with real voice narration and live answers.</p></Reveal>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ScenarioCard tag="Frontline" title="Warehouse worker" description="A frontline warehouse hire goes through site safety, PPE, and hazard reporting in their own language before their first shift." href="/onboarding/warehouse" image="/warehouse-checking.jpg" />
            <ScenarioCard tag="Office" title="Office / software new hire" description="A new office employee walks through company policy, tools, and team basics — the same voice-first approach, a different setting." href="/onboarding/software" image="/office-team.jpg" />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 pt-16 pb-10" style={{ backgroundColor: '#0D1821', color: '#F0F4EF' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 pb-12 border-b" style={{ borderColor: '#F0F4EF22' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-caveat)', fontSize: '26px' }}>OnBoardly</span>
              <p className="text-sm mt-3 leading-relaxed" style={{ color: '#B4CDED' }}>
                Voice-first onboarding for frontline workplaces, in the languages your workers actually speak.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Try it</p>
              <div className="flex flex-col gap-2 text-sm" style={{ color: '#B4CDED' }}>
                <Link href="/onboarding/warehouse" className="hover:underline">Warehouse scenario</Link>
                <Link href="/onboarding/software" className="hover:underline">Office scenario</Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Languages</p>
              <div className="flex flex-col gap-2 text-sm" style={{ color: '#B4CDED' }}>
                <span>English</span>
                <span>中文 · Mandarin</span>
                <span>ਪੰਜਾਬੀ · Punjabi</span>
              </div>
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: '#B4CDED' }}>
            <span>All workers, sites, and records shown are synthetic, for demonstration only.</span>
            <span>Built in 48 hours · Melbourne</span>
          </div>
        </div>
      </footer>
    </div>
  );
}