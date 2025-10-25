import type { Metadata } from "next";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: "Kite Vibe | Go Kite AI Community Not Official",
  description:
    "A retro-classic AI community to explore creativity — design hats, play kite fly game, and share frames. Join the warm kite-inspired vibe.",
  keywords:
    "Kite Vibe, kite game, AI community, retro classic website, Kite Hat Studio, Kite Fly Game, Kite Frame, creativity, design, play, share",
  openGraph: {
    title: "Kite Vibe | Go Kite AI Community Not Official",
    description:
      "A creative retro-classic Go Kite AI community Not Official — explore Hat Studio, Fly Game, and Frame. Join the vibe!",
    url: "https://www.kitevibe.xyz",
    siteName: "Kite Vibe",
    images: [
      {
        url: "https://www.kitevibe.xyz/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kite Vibe | Go Kite AI Community Not Official",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream text-brown flex flex-col">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
