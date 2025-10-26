export default function Footer() {
  return (
    <footer className="mt-16 bg-darkbrown text-cream">
      <div className="mx-auto max-w-6xl px-4 py-10 text-center space-y-6">
        <nav className="flex items-center justify-center gap-8 text-sm">
          <a href="/" className="footer-link">Home</a>
          <a href="/about" className="footer-link">About</a>
          <a href="/blog" className="footer-link">Blog</a>
          <a href="/contact" className="footer-link">Contact</a>
        </nav>
        <p className="text-xs opacity-90">© 2025 Kite Vibe Created By <a href="https://x.com/Agus_pamungkasS" target="_blank" rel="noopener noreferrer">Agus Pamungkas DS</a> For | A gokite ai Community</p>
      </div>
    </footer>
  );
}
