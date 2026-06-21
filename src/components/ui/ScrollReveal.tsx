import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  xOffset?: number;
  blur?: string;
  className?: string;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  delay = 0,
  duration = 0.8,
  yOffset = 30,
  xOffset = 0,
  blur = '8px',
  className = '',
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const [isLocked, setIsLocked] = useState(() => {
    // Se o preloader já terminou no passado, não trava
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__loadingFinished) {
      return false;
    }
    // Se o preloader estiver ativo no body, começa travado
    return typeof document !== 'undefined' && document.body.classList.contains("loading");
  });
  const hasIntersectedRef = useRef(false);

  // Escuta o evento de finalização do preloader
  useEffect(() => {
    if (!isLocked) return;

    const handleLoadingComplete = () => {
      setIsLocked(false);
    };

    window.addEventListener("loadingComplete", handleLoadingComplete);
    return () => {
      window.removeEventListener("loadingComplete", handleLoadingComplete);
    };
  }, [isLocked]);

  // Se for destravado e já estava interceptando a tela, inicia a animação imediatamente
  useEffect(() => {
    if (!isLocked && hasIntersectedRef.current) {
      setIsIntersecting(true);
    }
  }, [isLocked]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          hasIntersectedRef.current = true;
          if (!isLocked) {
            setIsIntersecting(true);
            if (once) {
              observer.unobserve(el);
            }
          }
        } else if (!once) {
          hasIntersectedRef.current = false;
          setIsIntersecting(false);
        }
      },
      {
        threshold: 0.05,
        rootMargin: "0px -5% 0px -5%",
      }
    );

    observer.observe(el);
    return () => {
      observer.unobserve(el);
    };
  }, [once, isLocked]);

  // Cleanup animation classes/styles after transition finishes
  useEffect(() => {
    if (isIntersecting && once) {
      const totalDuration = (delay + duration) * 1000 + 100;
      const timer = setTimeout(() => {
        setAnimationDone(true);
      }, totalDuration);
      return () => clearTimeout(timer);
    }
  }, [isIntersecting, once, delay, duration]);

  // If the animation is done, render a plain div to free GPU layer memory
  if (animationDone) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  const style = {
    '--delay': `${delay}s`,
    '--duration': `${duration}s`,
    '--y-offset': `${yOffset}px`,
    '--x-offset': `${xOffset}px`,
    '--blur-amount': blur,
  } as React.CSSProperties;

  return (
    <div
      ref={ref}
      style={style}
      className={`animate-on-scroll ${isIntersecting ? 'animate' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

