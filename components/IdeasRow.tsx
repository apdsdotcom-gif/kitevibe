"use client";

export default function IdeasRow() {
  return (
    <section id="ideas" className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-3 gap-6">
      {/* Hat Studio */}
      <article className="card-soft bg-[#E9C6A9]">
        <div className="flex items-start gap-3">
          <img src="/images/hat-icon.svg" className="w-12 h-12" alt="Hat icon"/>
          <h3 className="h-playfair text-2xl font-bold">Kite Hat Studio</h3>
        </div>
        <p className="mt-4 text-sm leading-relaxed">
          Upload photo → otomatis pakai topi. <br/>
          Dapat digeser manual dan download hasil.
        </p>
        <a href="/hat-studio" className="btn-primary mt-6 inline-block">Open Hat Studio</a>
      </article>

      {/* Fly Game */}
      <article className="card bg-[#EED2B3]">
        <div className="flex items-start gap-3">
          <img src="/images/game-icon.svg" className="w-12 h-12" alt="Kite icon"/>
          <h3 className="h-playfair text-2xl font-bold">Kite Fly Game</h3>
        </div>
        <p className="mt-4 text-sm leading-relaxed">
          Game ringan, poin dari topi, botol, VR doodle. <br/>
          Pause, restart, badge (Kite Dreamer–Kite Legend–Kite High Flyer).
        </p>
        <a href="/fly-game" className="btn-outline mt-6 inline-block">Play Kite Fly Game</a>
      </article>

      {/* Frame */}
      <article className="card-soft bg-[#D78A76] text-cream">
        <div className="flex items-start gap-3">
          <img src="/images/frame-icon.svg" className="w-12 h-12" alt="Frame icon"/>
          <h3 className="h-playfair text-2xl font-bold">Kite Frame</h3>
        </div>
        <p className="mt-4 text-sm leading-relaxed">
          Upload hasil dari topi dan game. <br/>
          Badge & karya mingguan.
        </p>
        <a href="/frame" className="mt-6 inline-block bg-cream text-brown rounded-full px-6 py-2 font-semibold shadow-retro">Open Community Gallery</a>
      </article>
    </section>
  );
}
