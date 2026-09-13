// app/pitch/page.tsx
import { SiteNav } from "@/components/layout/SiteNav";

const YOUTUBE_VIDEO_ID = "REPLACE_WITH_YOUR_VIDEO_ID";

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      <main className="max-w-3xl mx-auto px-8 py-20">
        <h1 className="text-3xl font-bold text-zinc-900 mb-6">Our Pitch</h1>
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}`}
            title="Onboardly Pitch Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </main>
    </div>
  );
}