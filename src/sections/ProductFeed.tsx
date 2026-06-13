import { PRODUCTS } from '../data/products';
import ProductCard from '../components/ProductCard';

export default function ProductFeed() {
  return (
    <section className="bg-[#f3f4f6] px-2 md:px-0 py-3 md:py-6 pb-24 md:pb-12">
      {/* Container for feed header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <h2 className="text-[16px] md:text-2xl font-bold text-[#EE4D2D] md:text-[#1C2978] border-b-2 border-[#EE4D2D] pb-1">
            DESCOBERTAS DO DIA
          </h2>
        </div>
      </div>

      {/* Grid Responsivo: 2 colunas no mobile, até 6 no PC */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
        {PRODUCTS.map(product => (
          <div key={product.id} className="transition-transform hover:-translate-y-1 duration-300">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      
      {/* Loading Indicator for Infinite Scroll illusion */}
      <div className="flex justify-center py-8">
        <button className="bg-white border border-slate-300 text-slate-600 px-8 py-2 rounded shadow-sm hover:bg-slate-50 transition-colors font-medium text-sm">
          Ver Mais
        </button>
      </div>
    </section>
  );
}
