import { Lightbulb, Cable, Power, Shield, Wrench, Fan, Hammer, Plug, Droplet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SubCategory {
  name: string;
  slug: string;
}

export interface Category {
  name: string;
  icon: LucideIcon;
  slug: string;
  subcategories: SubCategory[];
}

export const CATEGORIES: Category[] = [
  {
    name: 'Iluminação',
    icon: Lightbulb,
    slug: 'iluminacao',
    subcategories: [
      { name: 'Lâmpadas LED', slug: 'lampadas-led' },
      { name: 'Plafons e Painéis', slug: 'plafons-paineis' },
      { name: 'Refletores', slug: 'refletores' },
      { name: 'Luminárias', slug: 'luminarias' },
      { name: 'Fitas LED', slug: 'fitas-led' },
    ]
  },
  {
    name: 'Cabos e Fios',
    icon: Cable,
    slug: 'fios-cabos',
    subcategories: [
      { name: 'Cabo Flexível', slug: 'cabo-flexivel' },
      { name: 'Cabo PP', slug: 'cabo-pp' },
      { name: 'Fio Sólido', slug: 'fio-solido' },
      { name: 'Cabo Coaxial', slug: 'cabo-coaxial' },
      { name: 'Cabo de Rede', slug: 'cabo-rede' },
    ]
  },
  {
    name: 'Tomadas e Interruptores',
    icon: Power,
    slug: 'tomadas',
    subcategories: [
      { name: 'Tomadas 2P+T', slug: 'tomadas-2pt' },
      { name: 'Interruptores', slug: 'interruptores' },
      { name: 'Espelhos e Placas', slug: 'espelhos-placas' },
      { name: 'Tomadas USB', slug: 'tomadas-usb' },
    ]
  },
  {
    name: 'Disjuntores',
    icon: Shield,
    slug: 'disjuntores',
    subcategories: [
      { name: 'Disjuntor Monopolar', slug: 'disjuntor-monopolar' },
      { name: 'Disjuntor Bipolar', slug: 'disjuntor-bipolar' },
      { name: 'Disjuntor Tripolar', slug: 'disjuntor-tripolar' },
      { name: 'IDR/DDR', slug: 'idr-ddr' },
      { name: 'Quadros de Distribuição', slug: 'quadros-distribuicao' },
    ]
  },
  {
    name: 'Ferramentas',
    icon: Wrench,
    slug: 'ferramentas',
    subcategories: [
      { name: 'Alicates', slug: 'alicates' },
      { name: 'Chaves Manuais', slug: 'chaves-manuais' },
      { name: 'Chaves Phillips e de Fenda', slug: 'chaves-fenda-phillips' },
      { name: 'Testadores e Medição Elétrica', slug: 'testadores-medicao' },
      { name: 'Níveis e Medição', slug: 'medicao-construcao' },
      { name: 'Discos, Serras e Acessórios de Corte', slug: 'discos-serras' },
      { name: 'Bits, Ponteiras e Porta Bits', slug: 'bits-ponteiras' },
      { name: 'Estiletes, Lâminas e Formões', slug: 'estiletes-formoes' },
      { name: 'Limas e Acabamento', slug: 'limas-acabamento' },
      { name: 'Misturadores, Desempenadeiras e Colheres', slug: 'ferramentas-pedreiro' },
      { name: 'Lubrificantes e Desengripantes', slug: 'lubrificantes-desengripantes' },
    ]
  },
  {
    name: 'Ferragens e Fixação',
    icon: Hammer,
    slug: 'ferragens-fixacao',
    subcategories: [
      { name: 'Fixadores, Buchas e Parafusos', slug: 'fixadores-parafusos' },
      { name: 'Arames e Ferragens', slug: 'arames-ferragens' },
      { name: 'Dobradiças, Mãos Francesas e Suportes', slug: 'suportes-dobradicas' },
      { name: 'Fechaduras e Cilindros', slug: 'fechaduras-cilindros' },
      { name: 'Rodízios, Pneus e Câmara de Ar', slug: 'rodizios-pneus' },
    ]
  },
  {
    name: 'Instalação e Acessórios',
    icon: Plug,
    slug: 'instalacao-acessorios',
    subcategories: [
      { name: 'Eletrodutos e Acessórios Elétricos', slug: 'eletrodutos-acessorios' },
      { name: 'Grampas, Curvas e Caixas Elétricas', slug: 'grampos-curvas-caixas' },
      { name: 'Fitas Isolantes', slug: 'fitas-isolantes' },
      { name: 'Fitas Adesivas e Dupla Face', slug: 'fitas-acessorios' },
      { name: 'Abraçadeiras Plásticas e de Nylon', slug: 'abracadeiras' },
      { name: 'Isoladores e Acessórios Elétricos', slug: 'isoladores-eletricos' },
      { name: 'Relés e Componentes Elétricos', slug: 'reles-componentes' },
      { name: 'Conectores e Acessórios de Rede', slug: 'conectores-rede' },
      { name: 'Torneiras e Acessórios Plásticos', slug: 'torneiras-plasticas' },
      { name: 'Pulverizadores e Acessórios', slug: 'pulverizadores' },
      { name: 'Aterramento e Hastes', slug: 'aterramento-hastes' },
    ]
  },
  {
    name: 'Ventiladores e Exaustores',
    icon: Fan,
    slug: 'ventiladores',
    subcategories: [
      { name: 'Ventiladores de Teto', slug: 'ventiladores-teto' },
      { name: 'Ventiladores de Mesa', slug: 'ventiladores-mesa' },
      { name: 'Exaustores', slug: 'exaustores' },
      { name: 'Circuladores de Ar', slug: 'circuladores' },
    ]
  },
  {
    name: 'Hidráulicos',
    icon: Droplet,
    slug: 'hidraulicos',
    subcategories: [
      { name: 'Tubos e Conexões Soldáveis', slug: 'tubos-conexoes-soldaveis' },
      { name: 'Tubos e Conexões de Esgoto', slug: 'tubos-conexoes-esgoto' },
      { name: 'Registros e Válvulas', slug: 'registros-valvulas' },
      { name: 'Acessórios Hidráulicos', slug: 'acessorios-hidraulicos' },
      { name: 'Eletrodutos e Caixas', slug: 'eletrodutos-caixas' },
    ]
  },
];
