# Energia Nova Haja Luz - E-commerce & AI Assistant

Bem-vindo ao repositório oficial da plataforma **Energia Nova Haja Luz**. Este projeto é uma aplicação web moderna que serve tanto como um catálogo avançado de materiais elétricos quanto como uma experiência de atendimento automatizado via Inteligência Artificial Conversacional.

## 🚀 Tecnologias e Arquitetura

O projeto foi desenvolvido utilizando as ferramentas mais modernas do ecossistema Frontend, garantindo altíssima performance, animações fluidas e manutenibilidade.

- **Framework Core:** React 19 + TypeScript
- **Bundler:** Vite
- **Estilização:** Tailwind CSS v4 (com suporte a `tailwind-merge` e `clsx`)
- **Animações:** Framer Motion & GSAP (animações de UI e interações fluidas)
- **Ícones:** Lucide React
- **Componentes Visuais:** Embla Carousel (para vitrines e destaques)
- **Hospedagem / CI-CD:** Vercel

## 🧠 Inteligência Artificial Conversacional (NLU Local)

O grande diferencial deste projeto é o seu **Motor de Inteligência Artificial Conversacional** (`ChatAssistant`). Diferente de chatbots de árvore de decisão comuns, este sistema possui um motor NLP (Natural Language Processing) próprio rodando no cliente.

### Funcionalidades do Motor de IA:
- **Extração de Entidades:** Reconhece categorias, produtos, voltagens (110v/220v), cores, amperagem e ambientes (ex: cozinha, banheiro).
- **Fuzzy Matching:** Algoritmo de tolerância a erros ortográficos (`Levenshtein distance`) que encontra produtos mesmo que o usuário digite com erros.
- **Contexto de Conversação (Memória):** Mantém o estado da conversa (ex: "tem verde?" -> A IA sabe que você estava falando sobre um cabo). O contexto possui expiração dinâmica (Força: `Strong`, `Medium`, `Weak`).
- **Scoring de Intenção:** Múltiplas intenções pontuadas simultaneamente (Saudações, Busca de Produto, Recomendações, Refinamento de Atributos).
- **Segurança Elétrica:** Motor de salvaguarda que detecta dúvidas elétricas perigosas e aciona imediatamente suporte humano via WhatsApp.

## 📂 Estrutura de Diretórios Principal

\`\`\`text
src/
├── components/
│   ├── ChatAssistant/    # Motor de IA completo (NLP, Contexto, Busca, Segurança)
│   ├── ui/               # Componentes visuais base (Botões, Inputs, Cards)
│   └── ...               # Componentes de layout (Header, Footer, Sections)
├── data/
│   ├── products.ts       # Banco de dados do catálogo
│   └── mockData.ts       # Dados auxiliares e configuração
├── lib/
│   └── utils.ts          # Funções utilitárias (Tailwind merge)
└── App.tsx               # Orquestrador de Rotas/Views principal
\`\`\`

## 🛠️ Como Executar o Projeto Localmente

1. Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.
2. Instale as dependências:
   \`\`\`bash
   npm install
   \`\`\`
3. Inicie o servidor de desenvolvimento:
   \`\`\`bash
   npm run dev
   \`\`\`
4. Para gerar a build de produção:
   \`\`\`bash
   npm run build
   \`\`\`

## 📦 Deploy (Vercel)

O projeto está configurado para Continuous Deployment na **Vercel**. Cada _push_ para a branch `main` disparará automaticamente uma nova compilação (Build) usando as configurações do Vite.

- **Comando de Build:** `npm run build`
- **Diretório de Saída:** `dist`

---
*Este repositório foi limpo e higienizado para produção. Scripts de parse, geradores antigos e rascunhos de IA foram arquivados para manter a integridade da aplicação em produção.*
