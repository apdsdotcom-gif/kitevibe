"use client";

import { useEffect } from "react";

export default function FramePage() {
  const tweets = [
    "https://x.com/Zun2025/status/1980611998904971634",
    "https://twitter.com/Tweet2",
    "https://twitter.com/Tweet3",
    "https://twitter.com/Tweet4",
    "https://twitter.com/Tweet5",
    "https://twitter.com/Tweet6",
    "https://twitter.com/Tweet7",
    "https://twitter.com/Tweet8",
    "https://twitter.com/Tweet9",
    "https://twitter.com/Tweet10",
  ];

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <main className="relative overflow-hidden min-h-screen py-20 px-4 bg-gradient-to-b from-[#FAF7F2] to-[#EAF3F9] text-center">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-playfair text-3xl md:text-4xl text-[#3a2e2a] mb-2">
          Kite Frame
        </h1>
        <p className="text-[#6b5a52] mb-10 text-sm md:text-base">
          A showcase of the best creations and thoughts from GO KITE AI community — directly from Twitter.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {tweets.map((url, index) => (
            <div
              key={url}
              className="relative w-full max-w-sm bg-white/80 rounded-xl shadow-sm border border-[#eadfce] p-3 transform transition duration-700 ease-out opacity-0 translate-y-6 animate-fadeIn"
              style={{ animationDelay: `${index * 0.15}s`, animationFillMode: "forwards" }}
            >
              {/* Skeleton shimmer */}
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#f4f1ec] via-[#f7f3ee] to-[#f4f1ec] bg-[length:200%_100%] rounded-xl" />

              {/* Tweet embed */}
              <blockquote className="twitter-tweet relative z-10" data-theme="light">
                <a href={url}>Loading Tweet...</a>
              </blockquote>
            </div>
          ))}
        </div>
      </div>

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
