import { LazyCartDrawer } from './features/cart/components/LazyCartDrawer';
import { ProductPage } from './features/product/components/ProductPage';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <LazyCartDrawer />
      <ProductPage />
      <Footer />
    </div>
  );
}

export default App;
