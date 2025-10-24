"use client";

export default function Hero() {
  return (
    <section className="pt-28 hero-bg relative">
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

      <div className="mx-auto max-w-4xl px-4 text-center py-20 md:py-24">
        <h1 className="h-playfair text-5xl md:text-7xl font-extrabold tracking-tight">KITE VIBE</h1>
        <p className="h-playfair mt-3 text-xl md:text-2xl tracking-widest">KITE AI COMMUNITY</p>
        <p className="mt-6 text-lg md:text-xl">Catch the vibe, Create. Fly. Explore.</p>
        <div className="mt-8">
          <a href="#ideas" className="btn-primary">Explore</a>
        </div>
      </div>
    </section>
  );
}
