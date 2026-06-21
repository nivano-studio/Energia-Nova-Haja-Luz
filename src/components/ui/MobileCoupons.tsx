import { Gift, Truck, Zap, Tag } from 'lucide-react';

export default function MobileCoupons() {
  return (
    <div className="px-3 md:px-0 py-3 md:py-4 w-full">
      
      <div className="md:grid md:grid-cols-12 gap-3 md:gap-4 flex flex-col">
        
        {/* Container de Cupons */}
        <div className="md:col-span-8 bg-gradient-to-br from-[#EE4D2D] to-[#ff6b52] rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 shadow-sm flex flex-col justify-center relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          
          <div className="flex justify-between items-center mb-3 relative z-10">
            <h3 className="text-white font-extrabold text-[15px] md:text-lg flex items-center gap-2">
              <Gift className="w-4 h-4 md:w-5 md:h-5" />
              Cupons e Vantagens
            </h3>
            <button className="bg-white text-[#EE4D2D] text-[10px] md:text-xs font-bold px-3 py-1.5 md:px-4 md:py-1.5 rounded-full hover:bg-slate-50 transition-colors shadow-sm">
              Resgatar tudo
            </button>
          </div>
          
          <div className="flex gap-2.5 md:gap-3 overflow-x-auto hide-scrollbar relative z-10 after:content-[''] after:w-1 after:h-px after:flex-shrink-0 md:after:hidden">
            {/* Card 1 */}
            <div className="bg-white rounded-lg p-2.5 md:px-3 md:py-2.5 flex-1 text-center shadow-sm border border-transparent hover:border-slate-200 transition-colors cursor-pointer min-w-[110px]">
              <h4 className="text-[#00BFA5] font-extrabold text-[13px] md:text-[15px] leading-tight">Frete grátis</h4>
              <p className="text-slate-500 text-[10px] md:text-[11px] mt-0.5 leading-tight font-medium">Consulte Região</p>
            </div>
            {/* Card 2 */}
            <div className="bg-white rounded-lg p-2.5 md:px-3 md:py-2.5 flex-1 text-center shadow-sm border border-transparent hover:border-slate-200 transition-colors cursor-pointer min-w-[110px]">
              <h4 className="text-[#EE4D2D] font-extrabold text-[13px] md:text-[15px] leading-tight">Desconto</h4>
              <p className="text-slate-500 text-[10px] md:text-[11px] mt-0.5 leading-tight font-medium">No WhatsApp</p>
            </div>
            {/* Card 3 */}
            <div className="bg-white rounded-lg p-2.5 md:px-3 md:py-2.5 flex-1 text-center shadow-sm border border-transparent hover:border-slate-200 transition-colors cursor-pointer min-w-[110px]">
              <h4 className="text-[#EE4D2D] font-extrabold text-[13px] md:text-[15px] leading-tight">Promoções</h4>
              <p className="text-slate-500 text-[10px] md:text-[11px] mt-0.5 leading-tight font-medium">em ferramentas</p>
            </div>
          </div>
        </div>

        {/* Grid de Navegação Rápida */}
        <div className="hidden md:col-span-4 md:grid md:grid-cols-2 gap-2 md:gap-3">
          <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center p-2 md:p-2.5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group border border-slate-100 h-full">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-red-50 flex items-center justify-center text-[#EE4D2D] group-hover:bg-[#EE4D2D] group-hover:text-white transition-colors mb-1.5 md:mb-2">
              <Zap className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" />
            </div>
            <span className="text-[10px] md:text-[12px] text-slate-700 font-bold leading-tight">Relâmpago</span>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center p-2 md:p-2.5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group border border-slate-100 h-full">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-green-50 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-colors mb-1.5 md:mb-2">
              <Truck className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <span className="text-[10px] md:text-[12px] text-slate-700 font-bold leading-tight">Frete Grátis</span>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center p-2 md:p-2.5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group border border-slate-100 h-full">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-yellow-50 flex items-center justify-center text-[#F5B500] group-hover:bg-[#F5B500] group-hover:text-white transition-colors mb-1.5 md:mb-2">
              <Tag className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <span className="text-[10px] md:text-[12px] text-slate-700 font-bold leading-tight">Ofertas</span>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center p-2 md:p-2.5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group border border-slate-100 h-full">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1C2978] group-hover:bg-[#1C2978] group-hover:text-white transition-colors mb-1.5 md:mb-2">
              <Gift className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <span className="text-[10px] md:text-[12px] text-slate-700 font-bold leading-tight">Kits</span>
          </div>
        </div>

      </div>
    </div>
  );
}

