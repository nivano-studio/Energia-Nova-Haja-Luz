import { ArrowRight } from 'lucide-react';

export default function PromoBanners() {
  return (
    <section className="py-12 bg-[#f3f4f6]">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate3d(0, 0px, 0) rotate(0deg); }
          50% { transform: translate3d(0, -12px, 0) rotate(2deg); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translate3d(0, 0px, 0) rotate(0deg); }
          50% { transform: translate3d(0, -10px, 0) rotate(-3deg); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes shimmer {
          0% { transform: translate3d(-100%, 0, 0); }
          100% { transform: translate3d(100%, 0, 0); }
        }
      `}</style>

      <div className="container mx-auto px-4 max-w-[1240px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Banner 1 - Materiais para Instalação */}
          <div className="bg-gradient-to-br from-[#1C2978] via-[#0A2550] to-[#1C2978] rounded-[24px] p-6 md:p-10 relative overflow-hidden group flex flex-row items-center min-h-[200px] md:min-h-[300px] shadow-[0_20px_40px_-15px_rgba(28, 41, 120,0.6)] border border-white/5 cursor-pointer">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-[#FFD200]/10 rounded-full blur-3xl -translate-x-1/4 -translate-y-1/4"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#1C2978]/15 rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>
            
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" style={{ animation: 'shimmer 2s ease-in-out infinite' }}></div>
            </div>
            
            <div className="relative z-10 flex-1 pr-2 md:pr-4 text-left">
              <div className="inline-block bg-[#FFD200]/15 text-[#FFD200] text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full mb-2 md:mb-4 tracking-wider uppercase">
                ⚡ Instalação
              </div>
              <h3 className="text-lg md:text-[30px] font-display font-extrabold text-white mb-1 md:mb-3 leading-tight">
                Materiais para Instalação
              </h3>
              <p className="text-slate-300/90 text-[11px] md:text-[14px] mb-3 md:mb-6 max-w-[200px] md:max-w-[280px] leading-relaxed line-clamp-2 md:line-clamp-none">
                Tudo o que você precisa para instalações elétricas seguras e eficientes na sua obra.
              </p>
              <a href="#ofertas" className="inline-flex items-center gap-2 bg-[#FFD200] hover:bg-yellow-400 text-[#1C2978] font-bold py-2 px-4 md:py-3 md:px-7 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(255,210,0,0.4)] text-[11px] md:text-sm">
                Ver ofertas <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <div className="relative z-10 w-28 md:w-56 h-28 md:h-56 flex-shrink-0 flex justify-center items-center">
              {/* Glow behind image */}
              <div className="absolute inset-2 md:inset-4 bg-[#FFD200]/20 rounded-full blur-xl md:blur-2xl" style={{ animation: 'glow-pulse 4s ease-in-out infinite' }}></div>
              <img 
                src="/images/products/24.webp" 
                alt="Tomada com cabo" 
                className="w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(255,210,0,0.3)] group-hover:scale-110 transition-transform duration-700 relative z-10" 
                style={{ animation: 'float 5s ease-in-out infinite' }}
              />
            </div>
          </div>

          {/* Banner 2 - Iluminação com Economia */}
          <div className="bg-gradient-to-br from-[#1C2978] via-[#0046D1] to-[#001D66] rounded-[24px] p-6 md:p-10 relative overflow-hidden group flex flex-row items-center min-h-[200px] md:min-h-[300px] shadow-[0_20px_40px_-15px_rgba(28, 41, 120,0.5)] border border-blue-400/20 cursor-pointer">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FFD200]/10 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4"></div>
            
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" style={{ animation: 'shimmer 2s ease-in-out infinite' }}></div>
            </div>
            
            <div className="relative z-10 flex-1 pr-2 md:pr-4 text-left">
              <div className="inline-block bg-white/15 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full mb-2 md:mb-4 tracking-wider uppercase">
                💡 Economia
              </div>
              <h3 className="text-lg md:text-[30px] font-display font-extrabold text-white mb-1 md:mb-3 leading-tight">
                Iluminação com Economia
              </h3>
              <p className="text-blue-100/80 text-[11px] md:text-[14px] mb-3 md:mb-6 max-w-[200px] md:max-w-[280px] leading-relaxed line-clamp-2 md:line-clamp-none">
                Mais eficiência, menos consumo. A iluminação LED perfeita com o melhor custo-benefício.
              </p>
              <a href="#ofertas" className="inline-flex items-center gap-2 bg-[#FFD200] hover:bg-yellow-400 text-[#1C2978] font-bold py-2 px-4 md:py-3 md:px-7 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(255,210,0,0.4)] text-[11px] md:text-sm">
                Ver ofertas <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <div className="relative z-10 w-28 md:w-56 h-28 md:h-56 flex-shrink-0 flex justify-center items-center">
              {/* Glow behind image */}
              <div className="absolute inset-2 md:inset-4 bg-white/25 rounded-full blur-xl md:blur-2xl" style={{ animation: 'glow-pulse 3.5s ease-in-out infinite' }}></div>
              <img 
                src="/images/products/26.webp" 
                alt="Lâmpada LED" 
                className="w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform duration-700 relative z-10" 
                style={{ animation: 'float-reverse 4.5s ease-in-out infinite' }}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
