import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import IdeasRow from "../components/IdeasRow";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <IdeasRow />
      <Footer />
    </main>
  );
}
