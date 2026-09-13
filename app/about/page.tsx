// app/about/page.tsx
import { Fraunces, Caveat, Inter } from 'next/font/google';
import Link from 'next/link';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-fraunces' });
const caveat = Caveat({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-caveat' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-inter' });

const team = [
  { name: 'Jenny', role: 'Pitch and demo narrative' },
  { name: 'Jessie', role: 'Worker onboarding flow' },
  { name: 'Rithiha', role: 'Manager dashboard' },
  { name: 'Jake', role: 'Backend and data' },
  { name: 'Suryaja', role: 'Voice integration' },
];

const languages = [
  { code: 'EN', label: 'English' },
  { code: '中文', label: 'Mandarin' },
  { code: 'ਪੰ', label: 'Punjabi' },
];

export default function AboutPage() {
  return (
    <div className={`${fraunces.variable} ${caveat.variable} ${inter.variable}`} style={{ fontFamily: 'var(--font-inter)', backgroundColor: '#F0F4EF', color: '#0D1821' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: '#34496622' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center border"
            style={{ borderColor: '#0D1821', fontFamily: 'var(--font-caveat)', fontSize: '15px' }}
          >
            OB
          </div>
          <span style={{ fontFamily: 'var(--font-caveat)', fontSize: '26px', fontWeight: 700 }}>OnBoardly</span>
        </div>
        <div className="flex items-center gap-8 text-sm" style={{ color: '#344966' }}>
          <Link href="/demo" className="hover:underline">Try the demo</Link>
          <Link href="/" className="hover:underline">Home</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-8 pt-24 pb-20">
        <p className="text-sm tracking-normal mb-5" style={{ color: '#344966' }}>
          A 72-hour build for frontline workers who don't speak English at work
        </p>
        <h1
          className="mb-6"
          style={{ fontFamily: 'var(--font-fraunces)', fontSize: '44px', lineHeight: 1.15, fontWeight: 500 }}
        >
          Onboarding shouldn't depend on how well you speak the boss's language.
        </h1>
        <p className="text-lg leading-relaxed max-w-xl mb-10" style={{ color: '#344966' }}>
          OnBoardly plays a new worker their site induction, safety steps, and pay basics
          out loud, in their own language, on a tablet at the site entrance. No app to
          install, no phone plan required, no supervisor doing it from memory.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/demo"
            className="inline-block px-6 py-3 rounded-full text-sm"
            style={{ backgroundColor: '#0D1821', color: '#F0F4EF' }}
          >
            Watch a worker go through it
          </Link>
          <div className="flex items-center gap-2">
            {languages.map((l) => (
              <span
                key={l.code}
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs"
                style={{ backgroundColor: '#B4CDED', color: '#0D1821' }}
                title={l.label}
              >
                {l.code}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Why this exists */}
      <section className="border-t" style={{ borderColor: '#34496622', backgroundColor: '#344966', color: '#F0F4EF' }}>
        <div className="max-w-3xl mx-auto px-8 py-20">
          <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '28px', fontWeight: 500 }} className="mb-8">
            Why we built this
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-sm leading-relaxed">
            <div>
              <p className="text-3xl mb-2" style={{ fontFamily: 'var(--font-fraunces)' }}>239k+</p>
              <p style={{ color: '#B4CDED' }}>
                Punjabi speakers in Australia, the fastest growing language in the country — most onboarding still happens in English only.
              </p>
            </div>
            <div>
              <p className="text-3xl mb-2" style={{ fontFamily: 'var(--font-fraunces)' }}>1 in 3</p>
              <p style={{ color: '#B4CDED' }}>
                Migrant workers surveyed were paid roughly half the legal minimum — often because entitlements were never explained clearly.
              </p>
            </div>
            <div>
              <p className="text-3xl mb-2" style={{ fontFamily: 'var(--font-fraunces)' }}>0 apps</p>
              <p style={{ color: '#B4CDED' }}>
                No smartphone, no data plan, no account to make. Just a device already sitting at the site entrance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-8 py-20">
        <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '28px', fontWeight: 500 }} className="mb-10">
          What actually happens
        </h2>
        <div className="space-y-8">
          {[
            { title: 'Pick a language', body: 'English, Mandarin, or Punjabi — one tap, no menus to dig through.' },
            { title: 'Listen to each step', body: 'PPE, exits, hazard reporting, pay — narrated aloud with a transcript on screen at the same time.' },
            { title: 'Confirm you understood', body: 'A simple tap or spoken response — no long quiz standing between a worker and their first shift.' },
            { title: 'Manager sees it happen live', body: 'Who\u2019s done what, in which language, updates on the dashboard without anyone chasing a paper form.' },
          ].map((step) => (
            <div key={step.title} className="flex gap-5 items-start">
              <div
                className="w-2 h-2 rounded-full mt-2 shrink-0"
                style={{ backgroundColor: '#BFCC94' }}
              />
              <div>
                <h3 className="text-base font-medium mb-1">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#344966' }}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Honest proof, not fake logos */}
      <section className="border-t" style={{ borderColor: '#344966' + '22' }}>
        <div className="max-w-3xl mx-auto px-8 py-16">
          <div
            className="rounded-2xl p-8"
            style={{ backgroundColor: '#BFCC94' }}
          >
            <p className="text-sm" style={{ color: '#0D1821' }}>
              Built in 48 hours by five people, for a hackathon — not a funded company yet.
              The voice narration and Q&amp;A you'll see in the demo are real ElevenLabs calls,
              not a mockup.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-3xl mx-auto px-8 py-20">
        <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '28px', fontWeight: 500 }} className="mb-10">
          Who made it
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
          {team.map((person) => (
            <div key={person.name}>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3 border"
                style={{ borderColor: '#0D1821', fontFamily: 'var(--font-caveat)', fontSize: '16px' }}
              >
                {person.name[0]}
              </div>
              <p className="text-sm font-medium">{person.name}</p>
              <p className="text-xs" style={{ color: '#344966' }}>{person.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-8 py-10 text-sm flex items-center justify-between"
        style={{ backgroundColor: '#0D1821', color: '#F0F4EF' }}
      >
        <span style={{ fontFamily: 'var(--font-caveat)', fontSize: '20px' }}>OnBoardly</span>
        <span style={{ color: '#B4CDED' }}>All data shown is synthetic, for demo purposes only.</span>
      </footer>
    </div>
  );
}