import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kite Vibe | Kite AI Community",
  description: "Catch the vibe. Create. Fly. Explore.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream text-brown">
        {children}
      </body>
    </html>
  );
}