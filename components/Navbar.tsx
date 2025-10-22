"use client";

export default function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-6xl px-4">
        <nav className="mt-4 flex items-center justify-between rounded-full bg-cream/80 backdrop-blur border border-brown/10 px-4 py-2 shadow-retro">
          <div className="font-semibold tracking-wide h-playfair text-xl">KITE VIBE</div>
          <ul className="hidden md:flex items-center gap-6 text-sm">
            <li><a className="nav-link" href="/">Home</a></li>
            <li><a className="nav-link" href="/about">About</a></li>
            <li><a className="nav-link" href="/blog">Blog</a></li>
            <li><a className="nav-link" href="/hat-studio">Hat Studio</a></li>
            <li><a className="nav-link" href="/fly-game">Fly Game</a></li>
            <li><a className="nav-link" href="/frame">Frame</a></li>
          </ul>
          <a href="#join" className="hidden md:inline-flex btn-primary bg-coral text-cream">Join the Vibe</a>
        </nav>
      </div>
    </header>
  );
}