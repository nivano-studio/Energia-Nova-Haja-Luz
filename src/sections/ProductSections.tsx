import { useDatabase } from '../contexts/DatabaseContext';
import type { Product } from '../contexts/DatabaseContext';
import { ChevronRight } from 'lucide-react';

const Section = ({ title, products }: { title: string, products: Product[] }) => (
  <div className="flex-1">
    <div className="flex items-center justify-between border-b-2 border-[#E8EDF5] mb-6 pb-2">
      <h2 className="text-xl md:text-2xl font-display font-extrabold text-[#1C2978] relative">
        {title}
        <div className="absolute -bottom-[2px] left-0 w-1/2 h-[2px] bg-[#1C2978]"></div>
      </h2>
      <a href="#" className="flex items-center text-[#1C2978] text-sm font-bold hover:underline">
        Ver tudo <ChevronRight className="w-4 h-4" />
      </a>
    </div>
    
    <div className="flex flex-col gap-4">
      {products.map(product => (
        <a key={product.id} href="#produto" className="flex items-center gap-4 group p-2 hover:bg-[#F5F7FB] rounded-lg transition-colors border border-transparent hover:border-[#E8EDF5]">
          <div className="w-20 h-20 bg-[#F5F7FB] rounded-md p-2 flex-shrink-0 group-hover:bg-white transition-colors">
            <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
          </div>
          <div className="flex-1">
            <h4 className="text-[#1C2978] font-bold text-sm mb-1 group-hover:text-[#1C2978] transition-colors line-clamp-2">{product.name}</h4>
            <span className="text-[#6B7890] text-xs">Preço sob consulta</span>
          </div>
        </a>
      ))}
    </div>
  </div>
);

export default function ProductSections() {
  const { products } = useDatabase();
  const iluminationProducts = products.filter(p => p.category === 'iluminacao').slice(0, 4);
  const toolsProducts = products.filter(p => p.category === 'ferramentas').slice(0, 3);

  return (
    <section className="py-12 bg-[#f3f4f6]">
      <div className="container mx-auto px-4 max-w-[1240px]">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16">
          <Section title="Iluminação" products={iluminationProducts} />
          <Section title="Ferramentas e Acessórios" products={toolsProducts} />
        </div>
      </div>
    </section>
  );
}
