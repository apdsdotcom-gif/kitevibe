"use client";

export default function FramePage() {
  const embeds = [
    `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Imagine you hired an assistant to help u with online shopping. But that assistant has no ID card, no bank account and no way to prove who is he. Stores would never trust them to make purchases on your behalf, right?<br><br>That is exactly the problem with AI agents today. They are… <a href="https://t.co/eQ7MF2XYTG">pic.twitter.com/eQ7MF2XYTG</a></p>&mdash; Zun (@Zun2025) <a href="https://twitter.com/Zun2025/status/1980611998904971634?ref_src=twsrc%5Etfw">October 21, 2025</a></blockquote>`,
    `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">With $33M raised by <a href="https://twitter.com/GoKiteAI?ref_src=twsrc%5Etfw">@GoKiteAI</a> from backers like PayPal Ventures, Alchemy, Avalanche Foundation and others. <a href="https://twitter.com/GoKiteAI?ref_src=twsrc%5Etfw">@GoKiteAI</a> is a purpose-built Layer 1 blockchain platform specifically designed for AI applications.<br><br>Here are the key aspects of Kite AI: <br><br>- Portable agent memory and… <a href="https://t.co/lnKTVHu4e0">pic.twitter.com/lnKTVHu4e0</a></p>&mdash; hottiebabegem Ⓜ️Ⓜ️T (@HottieBabeGem) <a href="https://twitter.com/HottieBabeGem/status/1974216298113741033?ref_src=twsrc%5Etfw">October 3, 2025</a></blockquote>`,
    `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">unveiling <a href="https://twitter.com/GoKiteAI?ref_src=twsrc%5Etfw">@GoKiteAI</a> ‘s new DeFi hub! 🪁<br><br>we got a new shiny home for users to: <br>1️⃣ claim KITE test tokens<br>2️⃣ track on-chain activity <br>3️⃣ create multisig wallets<br>4️⃣ swap tokens<br>5️⃣ bridge across chains<br><br>finally a unified, seamless site for users to onboard onto kite chain<br><br>check it… <a href="https://t.co/tbTP86WP0S">pic.twitter.com/tbTP86WP0S</a></p>&mdash; Henry Lee (@Henryleemr) <a href="https://twitter.com/Henryleemr/status/1980831899317854593?ref_src=twsrc%5Etfw">October 22, 2025</a></blockquote>`,
    `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">gm, <br><br>Thank you so much for all the kind words and for being with <a href="https://twitter.com/GoKiteAI?ref_src=twsrc%5Etfw">@GoKiteAI</a> and me since the very beginning.<br><br>Every piece of feedback and contribution from you has helped KITE grow to where it is today. It’s because of all the Kiters that we continue to work hard and push… <a href="https://t.co/WzRwNp5DPB">pic.twitter.com/WzRwNp5DPB</a></p>&mdash; Trisha Lena (@trisha_lena) <a href="https://twitter.com/trisha_lena/status/1980655251205292240?ref_src=twsrc%5Etfw">October 21, 2025</a></blockquote>`,
    `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">As the Agentic Economy narrative gains momentum, more people realize that real value will not just come from smarter AI but from how AI systems transact, pay and collaborate autonomously<br><br>That is where KITE comes in, the financial execution layer for the Agentic Internet<br><br>The… <a href="https://t.co/EDmEV3AGR7">pic.twitter.com/EDmEV3AGR7</a></p>&mdash; PabloEsco 🪁 (@Esco0Pablo) <a href="https://twitter.com/Esco0Pablo/status/1982114733080932507?ref_src=twsrc%5Etfw">October 25, 2025</a></blockquote>`,
    `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Kite AI Layer 1 : Web3 Infrastructure for Autonomous AI<br><br>What is Kite AI?<br><br>Kite AI is a next-generation Layer-1 blockchain network designed specifically to bring together data, AI models, and autonomous AI agents into a decentralized and fair ecosystem.<br>Unlike traditional… <a href="https://t.co/f51OQEQRpC">pic.twitter.com/f51OQEQRpC</a></p>&mdash; sozu (@riyo13_) <a href="https://twitter.com/riyo13_/status/1980877982660194341?ref_src=twsrc%5Etfw">October 22, 2025</a></blockquote>`,
    ``,
    ``,
    ``,
    ``,
  ];

  return (
    <main className="relative overflow-hidden min-h-screen py-20 px-4 bg-gradient-to-b from-[#FDF7F0] to-[#E8EFFA] text-center">
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
