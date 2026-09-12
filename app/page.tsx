import OnboardlyWidget from "../components/onboardly-widget/OnboardlyWidget";

export default function Home() {
  return (
    <div>
      <div style={{ padding: 24, fontFamily: "sans-serif" }}>
        Onboardly backend running — widget preview below
      </div>
      <OnboardlyWidget />
    </div>
  );
}
