import { Truck, MessageCircleMore, ClipboardCheck, Store } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const BENEFITS = [
  { icon: Truck, title: 'Entrega na Região', desc: 'Consulte taxas para sua cidade' },
  { icon: MessageCircleMore, title: 'Orçamento via WhatsApp', desc: 'Rápido e sem complicação' },
  { icon: ClipboardCheck, title: 'Lista de Materiais', desc: 'Preços especiais para obras' },
  { icon: Store, title: 'Retire na Loja', desc: 'Av. José Ribamar Castro, Mata Roma' },
];

export default function BenefitsBar() {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'center', skipSnaps: false }, [
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })
  ]);

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 relative z-20 mt-6 md:mt-8 mb-16">
      
      {/* Container para Desktop (Grid) */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
        {BENEFITS.map((benefit, index) => (
          <div 
            key={index} 
            className="group flex flex-col xl:flex-row items-center text-center xl:text-left gap-4 bg-white p-5 lg:p-6 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E8EDF5] hover:shadow-[0_12px_30px_rgba(28, 41, 120,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-default"
          >
            <div className="relative w-14 h-14 shrink-0">
              <div className="absolute inset-0 bg-[#FFD200] rounded-xl transform rotate-6 scale-95 opacity-90 group-hover:rotate-12 transition-transform duration-300"></div>
              <div className="absolute inset-0 bg-[#1C2978] rounded-xl flex items-center justify-center text-white transform -rotate-3 group-hover:rotate-0 transition-transform duration-300 shadow-md">
                <benefit.icon className="w-6 h-6" strokeWidth={2.5} />
              </div>
            </div>
            
            <div className="flex flex-col justify-center">
              <h4 className="text-[15px] font-extrabold text-[#1C2978] mb-1 group-hover:text-[#1C2978] transition-colors">{benefit.title}</h4>
              <p className="text-[13px] text-[#6B7890] leading-tight">{benefit.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Container para Mobile (Carrossel com Embla) */}
      <div className="md:hidden overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {BENEFITS.map((benefit, index) => (
            <div key={index} className="flex-[0_0_80%] min-w-0 pl-4">
              <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-[#E8EDF5] shadow-sm">
                <div className="relative w-10 h-10 shrink-0">
                  <div className="absolute inset-0 bg-[#1C2978] rounded-lg flex items-center justify-center text-white shadow-sm">
                    <benefit.icon className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className="text-[11px] font-black text-[#1C2978] uppercase tracking-tighter leading-tight truncate">{benefit.title}</h4>
                  <p className="text-[10px] text-[#6B7890] font-medium leading-tight line-clamp-1">{benefit.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
