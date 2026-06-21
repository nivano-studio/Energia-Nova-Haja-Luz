import { useEffect, useRef } from "react";
import gsap from "gsap";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Travar scroll da página durante o carregamento
    document.body.classList.add("loading");

    // Iniciar posições escondidas
    gsap.set([logoRef.current, textRef.current], { opacity: 0, y: 30 });
    gsap.set(progressBarRef.current, { scaleX: 0.9 });

    // Timeline de entrada suave
    const tl = gsap.timeline({
      onComplete: () => {
        startLoadingProcess();
      }
    });

    tl.to(logoRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "back.out(1.7)",
      delay: 0.2
    })
    .to(textRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.4");

    const startLoadingProcess = () => {
      const progress = { value: 0.9 };
      
      gsap.to(progress, {
        value: 1,
        duration: 1.2, // Duração de preenchimento da barra em segundos
        ease: "power2.inOut",
        onUpdate: () => {
          if (progressBarRef.current) {
            gsap.set(progressBarRef.current, { scaleX: progress.value });
          }
        },
        onComplete: finishLoading
      });
    };

    const finishLoading = () => {
      const exitTl = gsap.timeline({
        onComplete: () => {
          // Definir flag global após finalizar a animação totalmente
          (window as unknown as Record<string, unknown>).__loadingFinished = true;
          // Disparar evento para iniciar animações do site
          window.dispatchEvent(new Event("loadingComplete"));

          // Destrava o scroll da página e notifica conclusão
          document.body.classList.remove("loading");
          onFinish();
        }
      });

      exitTl.to([logoRef.current, textRef.current, progressContainerRef.current], {
        opacity: 0,
        y: -30,
        duration: 0.5,
        ease: "power2.in",
        stagger: 0.1
      })
      .to(bgRef.current, {
        yPercent: -100,
        duration: 0.8,
        ease: "expo.inOut"
      });
    };

    return () => {
      document.body.classList.remove("loading");
    };
  }, [onFinish]);

  return (
    <div
      ref={preloaderRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
    >
      {/* Painel de Fundo */}
      <div 
        ref={bgRef}
        className="absolute inset-0 bg-[#0C1236]"
      >
        {/* Faixa Decorativa Gradiente no Topo (Cores Haja Luz) */}
        <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-[#1C2978] via-[#FFD200] to-[#1C2978]"></div>
      </div>

      {/* Conteúdo Central */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Container do Logo + Brilho Pulsante Azul/Amarelo */}
        <div className="mb-10 relative">
          <div className="absolute -inset-6 bg-[#1C2978]/30 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <div className="absolute -inset-4 bg-[#FFD200]/10 blur-2xl rounded-full scale-125 animate-pulse" style={{ animationDelay: "1s" }}></div>
          <img
            ref={logoRef}
            src="/images/logos/logo-carregamento.webp"
            alt="Logo Energia Nova Haja Luz"
            className="w-52 sm:w-64 md:w-80 h-auto object-contain drop-shadow-[0_0_25px_rgba(28,41,120,0.5)] relative z-10"
          />
        </div>

        {/* Textos da Marca */}
        <div ref={textRef} className="text-center mb-8">
          <h2 className="text-[#FFD200] font-sans font-bold text-xs md:text-sm tracking-[0.4em] uppercase leading-none">
            ENERGIA NOVA
          </h2>
        </div>

        {/* Barra de Progresso */}
        <div ref={progressContainerRef} className="w-56 h-[3px] bg-white/10 rounded-full overflow-hidden relative">
          <div
            ref={progressBarRef}
            className="absolute top-0 left-0 h-full w-full bg-[#FFD200] origin-left"
          ></div>
        </div>

      </div>
    </div>
  );
}
