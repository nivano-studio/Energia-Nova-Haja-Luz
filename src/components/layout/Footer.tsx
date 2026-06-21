import { Clock, MessageCircle, Lock } from 'lucide-react';
import { INSTAGRAM_URL, WHATSAPP_URL } from '../../data/constants';
import { useDatabase } from '../../contexts/DatabaseContext';
import ScrollReveal from '../ui/ScrollReveal';
import SpotlightCard from '../product/SpotlightCard';

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function Footer() {
  const { categories } = useDatabase();
  const currentYear = new Date().getFullYear();

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-admin-login'));
  };

  const scrollToSection = (e: React.MouseEvent) => {
    e.preventDefault();
    const section = document.getElementById('ofertas');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="relative bg-[#0B112D] text-slate-300 overflow-hidden border-t border-white/5">
      {/* Custom Styles for Footer Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(0, -20px); }
        }
        @keyframes float-slow-reverse {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(0, 20px); }
        }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-slow-reverse { animation: float-slow-reverse 10s ease-in-out infinite; }
      `}} />

      {/* Subtle Background Motion & Gradients */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#FFD200]/5 rounded-full blur-[120px] mix-blend-screen animate-float-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#1C2978]/15 rounded-full blur-[120px] mix-blend-screen animate-float-slow-reverse"></div>
      </div>
      
      {/* Noise Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          
          {/* Brand Card */}
          <ScrollReveal delay={0} yOffset={30} blur="10px">
            <SpotlightCard 
              className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-8 hover:bg-white/[0.05] transition-all duration-500 shadow-xl group h-full"
              glowColor="rgba(255, 210, 0, 0.28)"
              contentClassName="relative z-20 flex flex-col justify-between h-full w-full"
            >
              <div>
                <div className="w-20 h-20 bg-white rounded-full overflow-hidden flex items-center justify-center p-2.5 mb-8 group-hover:scale-105 transition-transform duration-500 origin-left">
                  <img src="/images/logos/LOGO.webp" alt="Energia Nova Haja Luz" className="max-w-full max-h-full object-contain" />
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Sua loja especializada em materiais elétricos, ferramentas e iluminação em Mata Roma - MA. Tudo para sua obra ou reforma.
                </p>
              </div>
              <div className="flex gap-4">
                <a 
                  href={INSTAGRAM_URL} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white hover:border-transparent hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </a>
                <a 
                  href={WHATSAPP_URL} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-[#25D366] hover:text-white hover:border-transparent hover:-translate-y-1 hover:shadow-lg hover:shadow-[#25D366]/20 transition-all duration-300"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon />
                </a>
              </div>
            </SpotlightCard>
          </ScrollReveal>

          {/* Departamentos Card */}
          <ScrollReveal delay={0.1} yOffset={30} blur="10px">
            <SpotlightCard 
              className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-8 hover:bg-white/[0.05] transition-all duration-500 shadow-xl h-full"
              glowColor="rgba(255, 210, 0, 0.28)"
              contentClassName="relative z-20 h-full w-full"
            >
              <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-[#FFD200] rounded-full shadow-[0_0_8px_#FFD200]"></span>
                Departamentos
              </h3>
              <ul className="space-y-4">
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <a 
                      href="#ofertas" 
                      onClick={scrollToSection}
                      className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-3 group"
                    >
                      <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-[#FFD200]/30 group-hover:bg-[#FFD200]/10 transition-colors">
                        <cat.icon className="w-4 h-4 text-slate-500 group-hover:text-[#FFD200] transition-colors" />
                      </span>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">{cat.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </ScrollReveal>

          {/* Atendimento Card */}
          <ScrollReveal delay={0.2} yOffset={30} blur="10px">
            <SpotlightCard 
              className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-8 hover:bg-white/[0.05] transition-all duration-500 shadow-xl h-full"
              glowColor="rgba(255, 210, 0, 0.28)"
              contentClassName="relative z-20 flex flex-col h-full w-full justify-between"
            >
              <div>
                <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-[#FFD200] rounded-full shadow-[0_0_8px_#FFD200]"></span>
                  Atendimento
                </h3>
                <ul className="space-y-4 mb-8 flex-grow">
                  <li>
                    <a 
                      href={WHATSAPP_URL} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-3 group"
                    >
                      <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-[#FFD200]/30 group-hover:bg-[#FFD200]/10 transition-colors">
                        <MessageCircle className="w-4 h-4 text-slate-500 group-hover:text-[#FFD200] transition-colors" />
                      </span>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">Pedir Orçamento</span>
                    </a>
                  </li>
                  <li>
                    <a 
                      href={WHATSAPP_URL} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-3 group"
                    >
                      <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-[#FFD200]/30 group-hover:bg-[#FFD200]/10 transition-colors">
                        <MessageCircle className="w-4 h-4 text-slate-500 group-hover:text-[#FFD200] transition-colors" />
                      </span>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">Fale com o Vendedor</span>
                    </a>
                  </li>
                </ul>
              </div>

              <div className="p-5 bg-black/20 rounded-xl border border-white/5 shadow-inner">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-[#FFD200]" />
                  <span className="text-white text-[11px] uppercase tracking-widest font-bold">Horários</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed font-mono">
                  Seg a Sex: 07h às 18h<br />
                  Sáb: 07h às 13h
                </p>
              </div>
            </SpotlightCard>
          </ScrollReveal>

          {/* Nivano Card */}
          <ScrollReveal delay={0.3} yOffset={30} blur="10px">
            <SpotlightCard 
              className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-8 hover:bg-white/[0.05] transition-all duration-500 shadow-xl group h-full"
              glowColor="rgba(56, 189, 248, 0.35)"
              contentClassName="relative z-20 flex flex-col justify-between h-full w-full"
            >
              <div>
                <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center mb-8 group-hover:scale-105 transition-transform duration-500 origin-left">
                  <img src="/images/logos/nivano-logo.webp" alt="Nivano Studio" className="max-w-full max-h-full object-contain" />
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  A Nivano oferece identidade visual, websites modernos e automações inteligentes para empresas que querem se destacar com presença digital forte, profissional e fora do padrão.
                </p>
              </div>
              <div className="flex gap-4">
                <a 
                  href="https://www.instagram.com/nivanostudio/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white hover:border-transparent hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                  aria-label="Instagram da Nivano"
                >
                  <InstagramIcon />
                </a>
              </div>
            </SpotlightCard>
          </ScrollReveal>

        </div>
      </div>

      {/* Bottom Bar */}
      <ScrollReveal delay={0.1} yOffset={20} blur="6px" className="relative z-10 border-t border-white/5 bg-black/20">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] uppercase tracking-widest font-semibold text-slate-500">
          <p className="flex items-center">
            © {currentYear} Energia Nova Haja Luz. Desenvolvido por&nbsp;<span className="font-bold text-white">Nivano Studio</span>
            <button 
              onClick={handleAdminClick}
              className="opacity-10 hover:opacity-100 hover:text-white transition-all ml-2 p-1 cursor-pointer"
              title="Área do Administrador"
            >
              <Lock className="w-3 h-3" />
            </button>
          </p>
          <p className="flex items-center gap-2">
            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
            Imagens ilustrativas
            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
            Preços sob consulta
          </p>
        </div>
      </ScrollReveal>
    </footer>
  );
}
