export const productTaxonomy = {
  iluminacao: {
    label: "Iluminação",
    canonicalProducts: ["lampada", "lampada_led", "bulbo", "plafon", "painel_led", "refletor", "fita_led", "luminaria", "spot", "arandela"],
    aliases: ["luz", "lampadas", "lâmpadas", "iluminacao", "iluminação", "led", "bulbo"],
    rejectCategories: ["Disjuntores", "Ferramentas", "Cabos e Fios", "Tomadas e Interruptores", "Ferragens e Fixação"]
  },
  cabos_fios: {
    label: "Cabos e Fios",
    canonicalProducts: ["fio", "cabo", "cabo_flexivel", "condutor", "rolo de fio"],
    aliases: ["fios", "cabos", "fiu", "cabu", "fio eletrico", "cabo eletrico"],
    rejectCategories: ["Iluminação", "Ferramentas", "Disjuntores"]
  },
  tomadas_interruptores: {
    label: "Tomadas e Interruptores",
    canonicalProducts: ["tomada", "interruptor", "tomada_10a", "tomada_20a", "modulo", "módulo", "placa", "espelho"],
    aliases: ["tomadas", "tomda", "interruptores", "interuptor"],
    rejectCategories: ["Iluminação", "Ferramentas", "Cabos e Fios"]
  },
  disjuntores: {
    label: "Disjuntores",
    canonicalProducts: ["disjuntor", "dr", "dps", "quadro de energia", "centro de distribuição", "chave geral"],
    aliases: ["dijuntor", "disjutor", "desjuntor", "chave disjuntora"],
    rejectCategories: ["Iluminação", "Ferramentas", "Tomadas e Interruptores"]
  },
  ferramentas: {
    label: "Ferramentas",
    canonicalProducts: ["ferramenta", "alicate", "chave de fenda", "chave teste", "multímetro", "trena", "esquadro", "prumo", "lápis de carpinteiro", "martelo", "furadeira"],
    aliases: ["ferramentas", "ferramneta", "ferrameta", "ferramnta", "alicati"],
    rejectCategories: ["Iluminação", "Ferragens e Fixação"]
  },
  ferragens_fixacao: {
    label: "Ferragens e Fixação",
    canonicalProducts: ["parafuso", "rosca soberba", "bucha", "prego", "arruela", "porca", "gancho", "abraçadeira", "suporte", "fixador"],
    aliases: ["parafusos", "parafusus", "parafuza", "parafuzo", "parafuco", "parafuço", "parafus", "buxa", "buchas", "pregos"],
    rejectCategories: ["Ferramentas", "Iluminação"]
  },
  instalacao_acessorios: {
    label: "Instalação e Acessórios",
    canonicalProducts: ["conduíte", "eletroduto", "corrugado", "canaleta", "caixa de passagem", "adaptador", "plug", "conector", "sensor", "fotocélula", "relé", "timer"],
    aliases: ["conduite", "rele"],
    rejectCategories: []
  },
  ventiladores_exaustores: {
    label: "Ventiladores e Exaustores",
    canonicalProducts: ["ventilador", "ventilador de teto", "exaustor", "capacitor de ventilador", "controle de ventilador"],
    aliases: ["ventiladores", "ventilação"],
    rejectCategories: []
  },
  chuveiros_aquecedores: {
    label: "Chuveiros e Aquecedores",
    canonicalProducts: ["chuveiro", "resistencia", "ducha", "aquecedor"],
    aliases: ["chuvero", "shuveiro"],
    rejectCategories: ["Iluminação", "Ferramentas", "Ferragens e Fixação"]
  }
};
