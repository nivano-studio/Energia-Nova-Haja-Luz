import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useMemo } from 'react';

export default function FlyingAnimations() {
  const { flyItems, removeFlyItem } = useCart();

  // Calcula a posição do carrinho no momento da renderização
  const getCartTarget = useMemo(() => {
    return () => {
      const isMobile = window.innerWidth < 768;
      const targetId = isMobile ? 'cart-icon-mobile' : 'cart-icon-desktop';
      const element = document.getElementById(targetId);
      
      if (element) {
        const rect = element.getBoundingClientRect();
        return { 
          x: rect.left + rect.width / 2, 
          y: rect.top + rect.height / 2 
        };
      }
      
      // Fallback
      return {
        x: isMobile ? window.innerWidth - 60 : window.innerWidth - 160,
        y: isMobile ? window.innerHeight - 40 : 40
      };
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[10000]">
      <AnimatePresence>
        {flyItems.map(item => {
          const target = getCartTarget();
          return (
            <motion.div
              key={`fly-${item.id}`}
              initial={{ 
                left: item.x - 40, 
                top: item.y - 40, 
                scale: 1, 
                opacity: 1,
              }}
              animate={{ 
                left: target.x - 10, 
                top: target.y - 10, 
                scale: 0.2, 
                opacity: 0.5,
              }}
              transition={{ 
                duration: 1.2, 
                ease: [0.25, 0.1, 0.25, 1]
              }}
              onAnimationComplete={() => removeFlyItem(item.id)}
              className="fixed w-20 h-20 z-[10000]"
            >
              <img
                src={item.image}
                alt=""
                className="w-full h-full object-cover rounded-full bg-white p-1.5 border-2 border-[#1C2978]"
                style={{ 
                  boxShadow: '0 8px 30px rgba(28, 41, 120, 0.4), 0 4px 15px rgba(0, 0, 0, 0.2)' 
                }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
