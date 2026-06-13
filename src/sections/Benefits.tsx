import { ShieldCheck, Zap, Wrench, MapPin, Smartphone } from 'lucide-react';

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Produtos de Qualidade",
    desc: "Trabalhamos com as melhores marcas do mercado elétrico."
  },
  {
    icon: Zap,
    title: "Atendimento Rápido",
    desc: "Agilidade para você não perder tempo na sua obra."
  },
  {
    icon: Wrench,
    title: "Para Casa e Empresa",
    desc: "Soluções completas para todos os tipos de projetos."
  },
  {
    icon: MapPin,
    title: "Loja em Mata Roma",
    desc: "Fácil acesso e atendimento local especializado."
  },
  {
    icon: Smartphone,
    title: "Pedido Facilitado",
    desc: "Faça orçamentos rapidamente pelo nosso WhatsApp."
  }
];

export default function Benefits() {
  return (
    <section className="py-20 bg-[#f3f4f6] relative overflow-hidden">
      {/* Subtle texture background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("/images/products/5.webp")', backgroundSize: '100px' }}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            Energia que movimenta o seu projeto
          </h2>
          <div className="h-1 w-20 bg-yellow-400 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div 
                key={index} 
                className="bg-slate-50 border border-slate-100 p-6 rounded-2xl hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                  <Icon className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{benefit.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{benefit.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

