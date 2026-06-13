import { createContext, useContext, useState } from 'react';
import type { ReactNode, MouseEvent } from 'react';
import type { Product } from '../data/products';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface FlyItem {
  id: number;
  x: number;
  y: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  flyItems: FlyItem[];
  addToCart: (product: Product, event?: MouseEvent, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  setIsCartOpen: (isOpen: boolean) => void;
  removeFlyItem: (id: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [flyItems, setFlyItems] = useState<FlyItem[]>([]);

  const addToCart = (product: Product, event?: MouseEvent, quantity = 1) => {
    // Adiciona o efeito de voo se tiver evento de clique
    if (event) {
      const id = Date.now();
      
      // Usa o cartão do produto como origem (mais preciso que clientX/Y com zoom)
      const productCard = document.getElementById(`product-${product.id}`);
      let x: number, y: number;
      
      if (productCard) {
        const rect = productCard.getBoundingClientRect();
        // Centro do cartão do produto na viewport
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 3; // Um pouco acima do centro (área da imagem)
      } else {
        // Fallback: posição do clique
        x = event.clientX;
        y = event.clientY;
      }
      
      setFlyItems(prev => [...prev, { id, x, y, image: product.image }]);
    }

    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    
    // Abre o carrinho após 800ms (tempo da animação de voo)
    setTimeout(() => {
      setIsCartOpen(true);
    }, 800);
  };

  const removeFlyItem = (id: number) => {
    setFlyItems(prev => prev.filter(item => item.id !== id));
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{
      items,
      isCartOpen,
      flyItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      setIsCartOpen,
      removeFlyItem
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

