"use client";

export default function FramePage() {
  const embeds = [
    `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Imagine you hired an assistant to help u with online shopping. But that assistant has no ID card, no bank account and no way to prove who is he. Stores would never trust them to make purchases on your behalf, right?<br><br>That is exactly the problem with AI agents today. They are… <a href="https://t.co/eQ7MF2XYTG">pic.twitter.com/eQ7MF2XYTG</a></p>&mdash; Zun (@Zun2025) <a href="https://twitter.com/Zun2025/status/1980611998904971634?ref_src=twsrc%5Etfw">October 21, 2025</a></blockquote>`,
    `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">We just shipped something new for developers 🚀</p>&mdash; Vercel (@vercel) <a href="https://x.com/vercel/status/1824092465356994689">August 14, 2025</a></blockquote>`,
    ``,
    ``,
    ``,
    ``,
    ``,
    ``,
    ``,
    ``,
  ];

  return (
    <main className="relative overflow-hidden min-h-screen py-20 px-4 bg-gradient-to-b from-[#FAF7F2] to-[#EAF3F9] text-center">
      <div className="relative z-10 mx-auto max-w-6xl">
        <h1 className="font-playfair text-3xl md:text-4xl text-[#3a2e2a] mb-2">
          Kite Frame
        </h1>
        <p className="text-[#6b5a52] mb-10 text-sm md:text-base">
          A showcase of the best creations and thoughts from our GO KITE AI community — directly from X.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {embeds.map((embed, i) =>
            embed ? (
              <div
                key={i}
                className="relative w-full max-w-sm bg-white/80 rounded-xl shadow-sm border border-[#e4d9c8] p-3 transform transition duration-700 ease-out opacity-0 translate-y-6 animate-fadeIn hover:-translate-y-2 hover:shadow-md hover:shadow-[#e8dfcf]/80"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationFillMode: "forwards",
                }}
                dangerouslySetInnerHTML={{ __html: embed }}
              />
            ) : null
          )}
        </div>
      </div>

      <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>

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
