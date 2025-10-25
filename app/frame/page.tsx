"use client";

import { useEffect } from "react";

export default function FramePage() {
  const tweets = [
    "https://x.com/vercel/status/1824092465356994689",
    "https://x.com/nextjs/status/1816115837029589292",
    "https://x.com/reactjs/status/1809876543210123456",
    "https://x.com/tailwindcss/status/1789901234567891234",
    "https://x.com/typescript/status/1788809876543210000",
    "https://x.com/openai/status/1823104567893210000",
    "https://x.com/github/status/1821006549876543210",
    "https://x.com/microsoft/status/1819503456789000000",
    "https://x.com/googledevs/status/1817009876543000000",
    "https://x.com/nodejs/status/1815008765432100000",
    "https://x.com/figma/status/1808008765432100000",
    "https://x.com/astro/status/1806009876543210000",
    "https://x.com/remix_run/status/1804009876543210000",
  ];

  // memastikan semua tweet dari x.com
  const normalizeTweetUrl = (url: string) => url.replace("twitter.com", "x.com");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.onload = () => {
      if ((window as any).twttr?.widgets) {
        (window as any).twttr.widgets.load();
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <main className="relative overflow-hidden min-h-screen py-20 px-4 bg-gradient-to-b from-[#FAF7F2] to-[#EAF3F9] text-center">
      {/* Clouds and kites (you can add later) */}

      <div className="relative z-10 mx-auto max-w-6xl">
        <h1 className="font-playfair text-3xl md:text-4xl text-[#3a2e2a] mb-2">
          Kite Frame
        </h1>
        <p className="text-[#6b5a52] mb-10 text-sm md:text-base">
          A showcase of the best creations and thoughts from GO KITE AI community — directly from X.
        </p>

        {/* Tweet grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {tweets.map((url, index) => (
            <div
              key={url}
              className="relative w-full max-w-sm bg-white/80 rounded-xl shadow-sm border border-[#e4d9c8] p-3 transform transition duration-700 ease-out opacity-0 translate-y-6 animate-fadeIn"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationFillMode: "forwards",
              }}
            >
              <blockquote className="twitter-tweet relative z-10" data-theme="light">
                <a href={normalizeTweetUrl(url)}>Loading Tweet...</a>
              </blockquote>
              <a
                href={normalizeTweetUrl(url)}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-3 text-sm text-[#a36a2a] hover:text-[#74461a] transition font-medium"
              >
                View on X ↗
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease forwards;
        }
      `}</style>
    </main>
  );
}
