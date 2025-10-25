"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

export default function FramePage() {
  const tweets = [
    "https://twitter.com/Tweet1",
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
    // Load Twitter widgets when page mounts
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
      {/* kamu nanti bisa tambahkan awan & layangan di sini */}

      <div className="mx-auto max-w-5xl">
        <h1 className="font-playfair text-3xl md:text-4xl text-[#3a2e2a] mb-2">Kite Frame</h1>
        <p className="text-[#6b5a52] mb-10 text-sm md:text-base">
          A showcase of the best creations and thoughts from our community — directly from Twitter.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {tweets.map((url, index) => (
            <motion.div
              key={url}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative w-full max-w-sm bg-white/80 rounded-xl shadow-sm border border-[#eadfce] p-3"
            >
              {/* Skeleton shimmer */}
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#f4f1ec] via-[#f7f3ee] to-[#f4f1ec] bg-[length:200%_100%] rounded-xl" />

              {/* Tweet embed */}
              <blockquote className="twitter-tweet relative z-10" data-theme="light">
                <a href={url}>Loading Tweet...</a>
              </blockquote>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
