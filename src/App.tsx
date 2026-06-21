import { useState, lazy, Suspense } from 'react';
import { CartProvider } from './contexts/CartContext';
import CartDrawer from './components/product/CartDrawer';
import FlyingAnimations from './components/ui/FlyingAnimations';
import Header from './components/layout/Header';
import HeroBanner from './components/ui/HeroBanner';

// Lazy loading below-the-fold components to speed up FCP and TTI
const BestSellers = lazy(() => import('./sections/BestSellers'));
const TopProducts = lazy(() => import('./sections/TopProducts'));
const CategoryShowcase = lazy(() => import('./sections/CategoryShowcase'));
const AboutStore = lazy(() => import('./sections/AboutStore'));
const FAQ = lazy(() => import('./components/ui/FAQ'));
const Footer = lazy(() => import('./components/layout/Footer'));

import BottomNavigation from './components/layout/BottomNavigation';
import WhatsAppFloatingButton from './components/ui/WhatsAppFloatingButton';
import SideProgress from './components/layout/SideProgress';
import SplashScreen from './components/ui/SplashScreen';
import ChatAssistant from './components/ChatAssistant/ChatAssistant';
import AdminControls from './components/admin/AdminControls';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <CartProvider>
      {isLoading && <SplashScreen onFinish={() => setIsLoading(false)} />}
      <div className={`min-h-screen bg-[#f3f4f6] text-slate-800 font-sans selection:bg-[#1C2978] selection:text-white pb-16 md:pb-0 ${isLoading ? 'h-screen overflow-hidden' : ''}`}>
        <Header />
        <HeroBanner />
        
        <main className="w-full max-w-[1240px] mx-auto min-h-screen relative pt-2 md:pt-6 px-0 md:px-4">
          <Suspense fallback={<div className="h-40 flex items-center justify-center text-[#1C2978]/50 font-medium">Carregando catálogo...</div>}>
            <BestSellers />
            <TopProducts />
            <CategoryShowcase />
          </Suspense>
        </main>

        <Suspense fallback={null}>
          <AboutStore />
          <FAQ />
          <Footer />
        </Suspense>
        
        <div className="md:hidden">
          <BottomNavigation />
        </div>
        <CartDrawer />
        <FlyingAnimations />
        <WhatsAppFloatingButton />
        <ChatAssistant />
        <SideProgress />
        <AdminControls />
      </div>
    </CartProvider>
  )
}

export default App;


