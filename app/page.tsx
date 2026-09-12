// Alternative to page.tsx — keeps a visible landing page with a button,
// instead of redirecting automatically. Rename this to page.tsx if you
// want this version instead of the auto-redirect.

import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <div>Onboardly backend running</div>
      <Link
        href="/onboarding"
        style={{
          display: "inline-block", marginTop: 16, background: "#1A1F26", color: "#fff",
          padding: "10px 18px", borderRadius: 6, textDecoration: "none", fontWeight: 700,
        }}
      >
        Go to onboarding →
      </Link>
    </div>
  );
}
