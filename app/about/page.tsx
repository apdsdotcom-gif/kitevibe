"use client";

export default function AboutPage() {
  return (
    <main className="relative overflow-hidden min-h-screen py-20 px-6 bg-gradient-to-b from-[#FDF8F4] to-[#E8F2EC] text-center text-[#3a2e2a]">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-playfair text-4xl mb-6">🪁 About Kite Vibe</h1>

        <p className="text-base leading-relaxed mb-4">
          <strong>Kite Vibe</strong> is a creative community inspired by{" "}
          <a
            href="https://gokite.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#B17C4A] hover:text-[#8C5E2D] underline"
          >
            gokite.ai
          </a>
          . This website is <em>unofficial</em>, but serves as a platform for
          ideas, collaboration, and community creations — combining a warm,
          classic, and modern retro aesthetic.
        </p>

        <p className="text-base leading-relaxed mb-6">
          Our goal is to contribute and offer a unique experience through
          interactive features such as:
        </p>

        <ul className="text-left inline-block text-sm md:text-base leading-relaxed mb-8 space-y-3">
          <li>
            🎩 <strong>Kite Hat Studio</strong> — Create and customize hats
            featuring the Gokite logo. Perfect for profile photos or showing
            your community spirit.
          </li>
          <li>
            🪁 <strong>Kite Fly Game</strong> — A light, casual game made more
            fun with community badges.
          </li>
          <li>
            🖼️ <strong>Kite Frame</strong> — A showcase of top Gokite community
            members who have made amazing contributions on X and Discord.
          </li>
        </ul>

        <p className="italic text-[#5a4b44] mb-6">
          Build with the community. Fly together. Create together.
        </p>

        <p className="mb-8">
          We’d love to hear from you! If you have creative ideas or suggestions,
          feel free to reach out via{" "}
          <a
            href="https://x.com/Agus_pamungkasS"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#B17C4A] hover:text-[#8C5E2D] underline"
          >
            Twitter: Agus Pamungkas DS
          </a>
          .
        </p>

        <div className="text-xs text-[#7c6a5d] space-y-1">
          <p>
            VR, Bottle, Hat images, and other visual assets are sourced from:
          </p>
          <a
            href="https://drive.google.com/drive/folders/1QzBP9QjNje1GbX5Yad6QuJim1TwDpFDD"
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:underline text-[#B17C4A]"
          >
            Google Drive Folder 1
          </a>
          <a
            href="https://drive.google.com/drive/u/0/folders/1n3SvHwR2_RrCng5hUZAlqPXo5vrjaRvg"
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:underline text-[#B17C4A]"
          >
            Google Drive Folder 2
          </a>
        </div>
      </div>
      {/* Animated clouds */}
      <img src="/images/cloud-1.svg" alt="" className="cloud absolute left-4 top-6 w-28" />
      <img src="/images/cloud-2.svg" alt="" className="cloud absolute left-1/4 top-24 w-24" />
      <img src="/images/cloud-1.svg" alt="" className="cloud absolute right-6 top-8 w-32" />
      <img src="/images/cloud-2.svg" alt="" className="cloud absolute right-1/4 top-24 w-24" />
      <img src="/images/cloud-1.svg" alt="" className="cloud absolute right-10 bottom-8 w-40" />
      <img src="/images/cloud-1.svg" alt="" className="cloud absolute left-10 bottom-8 w-40 opacity-70" />

      {/* Kites */}
      <img src="/images/kite-left.svg" alt="" className="kite absolute left-6 md:left-12 top-40 w-20" />
      <img src="/images/kite-right.svg" alt="" className="kite absolute right-6 md:right-12 top-40 w-20 [animation-duration:9s]" />
    </main>
  );
}
