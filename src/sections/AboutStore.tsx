import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  MapPin, Clock, ArrowUpRight, Zap, 
  ShieldCheck, Package, Users, Shield
} from 'lucide-react';
import { MAPS_URL, WHATSAPP_URL, INSTAGRAM_URL } from '../data/constants';
import ScrollReveal from '../components/ScrollReveal';

const WhatsAppIcon = ({ className = "w-5 h-5", style }: { className?: string, style?: React.CSSProperties }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const InstagramIcon = ({ className = "w-5 h-5", style }: { className?: string, style?: React.CSSProperties }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function AboutStore() {
  return (
    <section id="sobre" className="relative bg-[#071B3A] py-16 px-4 flex justify-center overflow-hidden border-y-4 border-[#FFD200]">
      
      {/* Main Card Container */}
      <div className="relative w-full max-w-[1240px] rounded-[2rem] p-6 md:p-10 lg:p-12 z-10"
           style={{
             background: 'linear-gradient(180deg, #0E1D3A 0%, #071B3A 100%)',
             boxShadow: '0 0 0 1px rgba(255,255,255,0.1), inset 0 0 0 1px rgba(255,255,255,0.05)',
           }}>
           
        {/* Glow Effects behind the main card */}
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-[#1C2978]/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-[#1C2978]/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        {/* Absolute top pill */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1C2978] px-5 py-2 border border-white/10 rounded-full flex items-center gap-2 shadow-lg z-20">
          <Zap className="w-3.5 h-3.5 text-[#FFD200] fill-[#FFD200]" />
          <span className="text-[#FFD200] text-[10px] sm:text-xs font-bold tracking-[0.15em] uppercase">DESDE 2014 • MATA ROMA</span>
        </div>

        {/* Top Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-12 relative pt-6">
          
          {/* Left: Image Area */}
          <ScrollReveal yOffset={40} blur="10px" className="relative rounded-[2rem] p-1.5 w-full max-w-[500px] mx-auto lg:max-w-none">
            {/* Gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD200]/40 via-transparent to-[#1C2978]/40 rounded-[2rem]"></div>
            
            <div className="relative rounded-[1.8rem] overflow-hidden bg-[#1C2978] aspect-square lg:aspect-[4/5] xl:aspect-square">
              <img 
                src="/images/products/loja.webp" 
                alt="Fachada da loja Energia Nova Haja Luz em Mata Roma" 
                className="w-full h-full object-cover opacity-90"
              />
              
              {/* Location Pill */}
              <a 
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-auto bg-white rounded-2xl p-3 sm:p-4 flex items-center justify-between sm:justify-start gap-4 shadow-2xl hover:scale-105 transition-transform"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-[#1C2978] w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-[#1C2978] font-bold text-sm sm:text-base leading-tight">Mata Roma – MA</div>
                    <div className="text-slate-500 text-xs mt-0.5">Av. José Ribamar Castro</div>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-[#1C2978] sm:ml-4 flex-shrink-0" />
              </a>
            </div>
          </ScrollReveal>

          {/* Right: Text & Stats */}
          <div className="flex flex-col justify-center relative z-10">
            {/* Background Lightbulb faint svg */}
            <svg className="absolute top-0 right-0 w-64 h-64 text-white/[0.02] -z-10 transform translate-x-1/4 -translate-y-1/4 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5" />
              <path d="M9 18h6" />
              <path d="M10 22h4" />
            </svg>

            <ScrollReveal delay={0.1} yOffset={25} blur="10px">
              <h2 
                className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.1] mb-6" 
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Onde cada<br/>projeto encontra<br/>a <span className="text-[#FFD200] italic">energia certa.</span>
              </h2>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2} yOffset={20} blur="8px">
              <p className="text-blue-100/50 text-base sm:text-lg mb-10 max-w-xl leading-relaxed font-light">
                A Energia Nova Haja Luz nasceu do sonho de levar qualidade e segurança elétrica para todo o Maranhão. Hoje somos referência em materiais elétricos, iluminação e ferramentas profissionais.
              </p>
            </ScrollReveal>

            {/* Stats Row */}
            <ScrollReveal delay={0.3} yOffset={20} blur="8px" className="flex items-center gap-6 sm:gap-10 mb-10">
              <div className="flex flex-col items-center">
                <ShieldCheck className="w-6 h-6 text-[#FFD200] mb-3 opacity-90" />
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}><AnimatedCounter target={10} suffix="+" /></div>
                <div className="text-[10px] text-blue-100/40 tracking-widest uppercase font-medium">Anos</div>
              </div>
              <div className="w-px h-16 bg-white/10"></div>
              <div className="flex flex-col items-center">
                <Package className="w-6 h-6 text-[#FFD200] mb-3 opacity-90" />
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}><AnimatedCounter target={2} suffix="k+" /></div>
                <div className="text-[10px] text-blue-100/40 tracking-widest uppercase font-medium">Produtos</div>
              </div>
              <div className="w-px h-16 bg-white/10"></div>
              <div className="flex flex-col items-center">
                <Users className="w-6 h-6 text-[#FFD200] mb-3 opacity-90" />
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}><AnimatedCounter target={5} suffix="k+" /></div>
                <div className="text-[10px] text-blue-100/40 tracking-widest uppercase font-medium">Clientes</div>
              </div>
            </ScrollReveal>

            {/* Buttons */}
            <ScrollReveal delay={0.4} yOffset={20} blur="8px" className="flex flex-col sm:flex-row gap-4">
              {/* Falar com Especialista - Border Beam */}
              <a 
                href={WHATSAPP_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group relative overflow-hidden text-white px-8 py-3.5 rounded-full text-sm font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_10px_20px_-8px_rgba(18,160,75,0.3)] hover:shadow-[0_15px_30px_-10px_rgba(18,160,75,0.5)] hover:-translate-y-0.5 active:scale-95 cursor-pointer bg-[#12A04B]"
              >
                {/* Border Beam spin layer */}
                <div className="absolute inset-0 rounded-full overflow-hidden z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(255,255,255,0.9)_360deg)] animate-[spin_2s_linear_infinite]"></div>
                </div>
                {/* Inner fill (creates the 1px gap effect) */}
                <div className="absolute inset-[1.5px] bg-gradient-to-r from-[#12A04B] to-[#108940] rounded-full z-10"></div>
                
                <WhatsAppIcon className="w-5 h-5 relative z-20"/>
                <span className="relative z-20 tracking-wider uppercase">FALAR COM ESPECIALISTA</span>
              </a>

              {/* Como Chegar - Border Beam */}
              <a 
                href={MAPS_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group relative overflow-hidden text-white px-8 py-3.5 rounded-full text-sm font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_8px_16px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 active:scale-95 cursor-pointer bg-[#0A1224] border border-white/10 group-hover:border-transparent"
              >
                {/* Border Beam spin layer */}
                <div className="absolute inset-0 rounded-full overflow-hidden z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square bg-[conic-gradient(from_0deg,transparent_0_300deg,#FFD200_360deg)] animate-[spin_2s_linear_infinite]"></div>
                </div>
                {/* Inner fill (creates the 1px gap effect) */}
                <div className="absolute inset-[1.5px] bg-[#0A1224] rounded-full z-10 group-hover:bg-[#0E1B35] transition-colors"></div>
                
                <MapPin className="w-5 h-5 text-blue-100/70 relative z-20"/>
                <span className="relative z-20 tracking-wider uppercase">COMO CHEGAR</span>
              </a>
            </ScrollReveal>
          </div>
        </div>

        {/* Bottom Info Bar - Highly Animated Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { 
              icon: Clock, 
              color: '#FFD200', 
              label: 'Horário de Atendimento', 
              value: 'Seg–Sex: 07h às 18h | Sáb: 07h às 12h' 
            },
            { 
              icon: InstagramIcon, 
              color: '#FFD200', 
              label: 'Siga no Instagram', 
              value: '@hajaluzenergianova',
              href: INSTAGRAM_URL
            },
            { 
              icon: Shield, 
              color: '#FFD200', 
              label: 'Produtos 100% Originais', 
              value: 'Com nota fiscal e garantia',
              hasInner: true
            }
          ].map((item, i) => {
            const CardComponent = item.href ? motion.a : motion.div;
            return (
              <ScrollReveal 
                key={i} 
                delay={0.1 * i} 
                yOffset={30} 
                blur="10px"
              >
                <CardComponent 
                  {...(item.href ? { href: item.href, target: "_blank", rel: "noopener noreferrer" } : {})}
                  whileHover={{ 
                    y: -6, 
                    scale: 1.015,
                    boxShadow: "0 20px 40px -15px rgba(255, 210, 0, 0.08)"
                  }}
                  whileTap={{ scale: 0.985 }}
                  className="about-info-card-premium rounded-2xl p-6 flex items-center gap-5 cursor-pointer group w-full"
                >
                  <div className="relative flex items-center justify-center w-10 h-10 flex-shrink-0 bg-white/5 rounded-xl border border-white/10 group-hover:border-[#FFD200]/30 group-hover:bg-white/10 transition-all duration-300">
                    <item.icon className="w-5 h-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" style={{ color: item.color }} />
                    {item.hasInner && <Zap className="w-2.5 h-2.5 text-[#1C2978] fill-[#FFD200] absolute" />}
                  </div>
                  <div>
                    <div className="text-[9px] text-blue-100/50 tracking-widest uppercase mb-1 font-semibold transition-colors duration-300 group-hover:text-blue-100/80">{item.label}</div>
                    <div className="text-white text-xs sm:text-sm font-medium transition-colors duration-300 group-hover:text-[#FFD200]">{item.value}</div>
                  </div>
                </CardComponent>
              </ScrollReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}
