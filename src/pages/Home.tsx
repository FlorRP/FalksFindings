import HeroSection from '../components/HeroSection';
import ProductGrid from '../components/ProductGrid';
import ContactSection from '../components/ContactSection';

type Props = {
  scrollTo: 'home' | 'products' | 'contact' | null;
  onScrolled: () => void;
};

export default function Home({ scrollTo, onScrolled }: Props) {
  const handleBrowse = () => {
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (scrollTo) {
    setTimeout(() => {
      const el = document.getElementById(scrollTo);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      onScrolled();
    }, 50);
  }

  return (
    <main className="bg-theme">
      <div id="home">
        <HeroSection onBrowse={handleBrowse} />
      </div>
      <ProductGrid />
      <ContactSection />
    </main>
  );
}
