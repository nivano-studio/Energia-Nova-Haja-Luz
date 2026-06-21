import React, { useState, useEffect, useRef } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { 
  Settings, Plus, Edit2, Trash2, LogOut, X, 
  Upload, FolderPlus, Save, Lock, Key, Eye, EyeOff, Check,
  ChevronDown, ChevronUp
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminControls() {
  const { 
    products, categories, isAdmin, login, logout,
    addCategory, deleteCategory, addSubcategory, deleteSubcategory, 
    addProduct, updateProduct, deleteProduct,
    seedDatabase, isDbEmpty,
    updateCategory, updateSubcategory
  } = useDatabase();

  const [seedLoading, setSeedLoading] = useState(false);

  // Estados de Controle do Painel e Autenticação
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Campos de Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Controle de Abas no Painel
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

  // Estados de Criação/Edição de Produtos
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null); // null se for "Adicionar"
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productSubcategory, setProductSubcategory] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productOldPrice, setProductOldPrice] = useState('');
  const [productIsBestSeller, setProductIsBestSeller] = useState(false);
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState('');
  const [productFormError, setProductFormError] = useState('');
  const [productFormLoading, setProductFormLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Estado para armazenar quais categorias estão expandidas no painel
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Inicializar todas as categorias como expandidas por padrão
  useEffect(() => {
    if (categories.length > 0) {
      const initial: Record<string, boolean> = {};
      categories.forEach(c => {
        initial[c.slug] = true;
      });
      setExpandedCategories(prev => {
        const next = { ...initial, ...prev };
        return next;
      });
    }
  }, [categories]);

  // Se o usuário buscar algo, força a expansão de todas as categorias para facilitar a busca
  useEffect(() => {
    if (productSearch.trim() !== '') {
      const updated: Record<string, boolean> = {};
      categories.forEach(c => {
        updated[c.slug] = true;
      });
      setExpandedCategories(updated);
    }
  }, [productSearch, categories]);

  const toggleCategoryExpand = (slug: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [slug]: !prev[slug]
    }));
  };

  const openAddProductFormForCategory = (catSlug: string, subSlug: string) => {
    setEditingProduct(null);
    setProductName('');
    setProductDescription('');
    setProductCategory(catSlug);
    setProductSubcategory(subSlug);
    setProductPrice('');
    setProductOldPrice('');
    setProductIsBestSeller(false);
    setProductImageFile(null);
    setProductImagePreview('');
    setProductFormError('');
    setIsProductFormOpen(true);
  };

  // Estados de Criação de Categorias/Subcategorias
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('Package');
  const [subcategoryName, setSubcategoryName] = useState('');
  const [activeCategoryForSub, setActiveCategoryForSub] = useState(''); // ID da categoria selecionada para receber sub
  const [categoryFormError, setCategoryFormError] = useState('');
  const [categoryFormLoading, setCategoryFormLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Escutar eventos globais de administração
  useEffect(() => {
    const handleOpenLogin = () => {
      setIsLoginOpen(true);
      setAuthError('');
      setEmail('');
      setPassword('');
    };

    const handleEditProduct = (e: Event) => {
      const { product } = (e as CustomEvent).detail;
      openEditProductForm(product);
      setIsPanelOpen(true);
      setActiveTab('products');
    };

    window.addEventListener('open-admin-login', handleOpenLogin);
    window.addEventListener('edit-product', handleEditProduct);
    
    return () => {
      window.removeEventListener('open-admin-login', handleOpenLogin);
      window.removeEventListener('edit-product', handleEditProduct);
    };
  }, [categories]);

  // Preencher subcategorias ao mudar categoria no formulário de produto
  useEffect(() => {
    if (productCategory) {
      const selectedCat = categories.find(c => c.slug === productCategory);
      if (selectedCat && selectedCat.subcategories.length > 0) {
        // Se a subcategoria atual não fizer parte da nova categoria selecionada, reseta ela
        const subExists = selectedCat.subcategories.some(s => s.slug === productSubcategory);
        if (!subExists) {
          setProductSubcategory(selectedCat.subcategories[0].slug);
        }
      } else {
        setProductSubcategory('');
      }
    }
  }, [productCategory, categories]);

  // Abrir login se clicar no botão flutuante e não estiver logado
  const handleFloatingButtonClick = () => {
    if (isAdmin) {
      setIsPanelOpen(true);
    } else {
      setIsLoginOpen(true);
    }
  };

  // Submeter Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const result = await login(email, password);
    setAuthLoading(false);

    if (result.success) {
      setIsLoginOpen(false);
      setIsPanelOpen(true);
    } else {
      setAuthError(result.error || 'Credenciais inválidas.');
    }
  };

  // Logout
  const handleLogout = async () => {
    await logout();
    setIsPanelOpen(false);
  };

  // Preparar formulário para Adicionar Produto
  const openAddProductForm = () => {
    setEditingProduct(null);
    setProductName('');
    setProductDescription('');
    setProductCategory(categories[0]?.slug || '');
    setProductSubcategory(categories[0]?.subcategories[0]?.slug || '');
    setProductPrice('');
    setProductOldPrice('');
    setProductIsBestSeller(false);
    setProductImageFile(null);
    setProductImagePreview('');
    setProductFormError('');
    setIsProductFormOpen(true);
  };

  // Preparar formulário para Editar Produto
  const openEditProductForm = (product: any) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductDescription(product.description || '');
    setProductCategory(product.category);
    setProductSubcategory(product.subcategory);
    setProductPrice(product.price ? product.price.toString() : '');
    setProductOldPrice(product.oldPrice ? product.oldPrice.toString() : '');
    setProductIsBestSeller(!!product.isBestSeller);
    setProductImageFile(null);
    setProductImagePreview(product.image);
    setProductFormError('');
    setIsProductFormOpen(true);
  };

  // Gerenciar mudança de arquivo de imagem com preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submeter Formulário de Produto (Adicionar ou Editar)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductFormError('');

    if (!productName.trim()) {
      setProductFormError('O nome do produto é obrigatório.');
      return;
    }

    if (!editingProduct && !productImageFile) {
      setProductFormError('A foto do produto é obrigatória para novos cadastros.');
      return;
    }

    setProductFormLoading(true);

    const productData = {
      name: productName,
      description: productDescription,
      category: productCategory,
      subcategory: productSubcategory,
      image: editingProduct ? editingProduct.image : '', // Mantém a imagem antiga se não enviar nova
      price: productPrice ? parseFloat(productPrice) : undefined,
      oldPrice: productOldPrice ? parseFloat(productOldPrice) : undefined,
      isBestSeller: productIsBestSeller,
      salesCount: editingProduct ? editingProduct.salesCount : 0
    };

    let result;
    if (editingProduct) {
      result = await updateProduct(editingProduct.id, productData, productImageFile || undefined);
    } else {
      result = await addProduct(productData, productImageFile || undefined);
    }

    setProductFormLoading(false);

    if (result.success) {
      setIsProductFormOpen(false);
      setEditingProduct(null);
    } else {
      setProductFormError(result.error || 'Erro ao salvar o produto.');
    }
  };

  // Deletar Produto
  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Deseja realmente excluir o produto "${name}"?`)) {
      const result = await deleteProduct(id);
      if (!result.success) {
        alert(result.error || 'Erro ao deletar produto.');
      }
    }
  };

  // Deletar Categoria com Senha Protegida
  const handleDeleteCategory = async (id: string, slug: string, name: string) => {
    const passwordConfirm = prompt(
      `ATENÇÃO: A exclusão da categoria "${name}" apagará TODAS as suas subcategorias e produtos associados!\n\nPara confirmar esta exclusão, digite a senha "DELETLUZ":`
    );
    
    if (passwordConfirm === null) return; // cancelou
    
    if (passwordConfirm !== 'DELETLUZ') {
      alert('Senha incorreta! Operação de exclusão cancelada.');
      return;
    }
    
    setCategoryFormLoading(true);
    const result = await deleteCategory(id, slug);
    setCategoryFormLoading(false);
    
    if (!result.success) {
      alert(result.error || 'Erro ao deletar categoria.');
    } else {
      alert(`Categoria "${name}" excluída com sucesso.`);
    }
  };

  // Deletar Subcategoria com Senha Protegida
  const handleDeleteSubcategory = async (id: string, catSlug: string, subSlug: string, name: string) => {
    const passwordConfirm = prompt(
      `ATENÇÃO: A exclusão da subcategoria "${name}" apagará TODOS os produtos associados a ela!\n\nPara confirmar esta exclusão, digite a senha "DELETLUZ":`
    );
    
    if (passwordConfirm === null) return; // cancelou
    
    if (passwordConfirm !== 'DELETLUZ') {
      alert('Senha incorreta! Operação de exclusão cancelada.');
      return;
    }
    
    setCategoryFormLoading(true);
    const result = await deleteSubcategory(id, catSlug, subSlug);
    setCategoryFormLoading(false);
    
    if (!result.success) {
      alert(result.error || 'Erro ao deletar subcategoria.');
    } else {
      alert(`Subcategoria "${name}" excluída com sucesso.`);
    }
  };

  // Renomear Categoria
  const handleRenameCategory = async (id: string, oldName: string, oldIcon: string) => {
    const newName = prompt(`Digite o novo nome para a categoria "${oldName}":`, oldName);
    if (newName === null) return;
    if (!newName.trim()) {
      alert('O nome da categoria não pode ser vazio.');
      return;
    }
    
    setCategoryFormLoading(true);
    const result = await updateCategory(id, newName.trim(), oldIcon);
    setCategoryFormLoading(false);
    
    if (!result.success) {
      alert(result.error || 'Erro ao renomear categoria.');
    } else {
      alert(`Categoria renomeada para "${newName.trim()}" com sucesso!`);
    }
  };

  // Renomear Subcategoria
  const handleRenameSubcategory = async (id: string, oldName: string, catSlug: string) => {
    const newName = prompt(`Digite o novo nome para a subcategoria "${oldName}":`, oldName);
    if (newName === null) return;
    if (!newName.trim()) {
      alert('O nome da subcategoria não pode ser vazio.');
      return;
    }

    setCategoryFormLoading(true);
    const result = await updateSubcategory(id, newName.trim(), catSlug);
    setCategoryFormLoading(false);

    if (!result.success) {
      alert(result.error || 'Erro ao renomear subcategoria.');
    } else {
      alert(`Subcategoria renomeada para "${newName.trim()}" com sucesso!`);
    }
  };

  // Adicionar Categoria
  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryFormError('');

    if (!categoryName.trim()) {
      setCategoryFormError('O nome da categoria é obrigatório.');
      return;
    }

    setCategoryFormLoading(true);
    const result = await addCategory(categoryName, categoryIcon);
    setCategoryFormLoading(false);

    if (result.success) {
      setCategoryName('');
      setCategoryIcon('Package');
    } else {
      setCategoryFormError(result.error || 'Erro ao criar categoria.');
    }
  };

  // Adicionar Subcategoria
  const handleAddSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryFormError('');

    if (!subcategoryName.trim()) {
      setCategoryFormError('O nome da subcategoria é obrigatório.');
      return;
    }

    if (!activeCategoryForSub) {
      setCategoryFormError('Selecione uma categoria pai.');
      return;
    }

    setCategoryFormLoading(true);
    const result = await addSubcategory(activeCategoryForSub, subcategoryName);
    setCategoryFormLoading(false);

    if (result.success) {
      setSubcategoryName('');
      setActiveCategoryForSub('');
    } else {
      setCategoryFormError(result.error || 'Erro ao criar subcategoria.');
    }
  };

  // Lista de Ícones Comuns do Lucide para Escolha de Categoria
  const commonIcons = [
    { name: 'Lightbulb', label: 'Lâmpada' },
    { name: 'Cable', label: 'Cabo/Fio' },
    { name: 'Power', label: 'Tomada/Interruptor' },
    { name: 'Shield', label: 'Disjuntor/Segurança' },
    { name: 'Wrench', label: 'Ferramenta Manual' },
    { name: 'Hammer', label: 'Martelo/Fixação' },
    { name: 'Plug', label: 'Instalação/Plugue' },
    { name: 'Fan', label: 'Ventilador' },
    { name: 'Droplet', label: 'Hidráulica' },
    { name: 'Zap', label: 'Elétrica/Raio' },
    { name: 'HardHat', label: 'Equipamento/EPI' },
    { name: 'Paintbrush', label: 'Pintura' },
    { name: 'Ruler', label: 'Medição/Régua' },
    { name: 'Flame', label: 'Aquecedores' },
    { name: 'Truck', label: 'Distribuição' },
    { name: 'Cpu', label: 'Eletrônicos' },
    { name: 'Scissors', label: 'Cortes' },
    { name: 'Box', label: 'Caixas/Quadros' },
    { name: 'Settings', label: 'Engrenagem' },
    { name: 'Package', label: 'Pacote/Geral' }
  ];

  // Normalizar texto removendo acentos para busca
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  // Filtrar produtos na busca da tabela (insensível a acentos)
  const filteredProducts = products.filter(p => {
    const searchNormalized = normalizeText(productSearch);
    return normalizeText(p.name).includes(searchNormalized) ||
           normalizeText(p.category).includes(searchNormalized) ||
           normalizeText(p.subcategory).includes(searchNormalized);
  });

  return (
    <>
      {/* Botão Flutuante Discreto do Admin (Canto Inferior Esquerdo) */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={handleFloatingButtonClick}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 active:scale-95 cursor-pointer border ${
            isAdmin 
              ? 'bg-[#1C2978] hover:bg-[#141F59] text-white border-[#1C2978]/30 animate-pulse' 
              : 'bg-white/80 hover:bg-white text-slate-400 hover:text-slate-600 border-slate-200 backdrop-blur-md opacity-30 hover:opacity-100'
          }`}
          title={isAdmin ? "Abrir Painel do Administrador" : "Acessar Área do Administrador"}
        >
          {isAdmin ? <Settings className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
        </button>
      </div>

      {/* MODAL DE LOGIN */}
      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsLoginOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100"
            >
              <div className="bg-[#1C2978] p-6 text-white text-center relative">
                <button 
                  onClick={() => setIsLoginOpen(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold font-display">Login do Administrador</h3>
                <p className="text-xs text-blue-100/70 mt-1">Acesso exclusivo para edição do catálogo</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
                {authError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                    {authError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">E-mail</label>
                  <input 
                    type="email"
                    required
                    placeholder="exemplo@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:bg-white focus:border-[#1C2978] focus:ring-2 focus:ring-[#1C2978]/10 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Senha</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-slate-800 text-sm focus:bg-white focus:border-[#1C2978] focus:ring-2 focus:ring-[#1C2978]/10 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-[#1C2978] hover:bg-[#141F59] text-white py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-6"
                >
                  {authLoading ? 'Verificando...' : 'Entrar no Painel'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PAINEL DE CONTROLE ADMINISTRATIVO (DRAWERS/FULL SCREEN) */}
      <AnimatePresence>
        {isPanelOpen && (
          <div className="fixed inset-0 z-[99990] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setIsPanelOpen(false)}
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-4xl h-full bg-slate-50 shadow-2xl flex flex-col z-10"
            >
              {/* Header do Painel */}
              <div className="bg-[#1C2978] text-white p-5 flex items-center justify-between shadow-md shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-lg leading-tight">Painel de Controle Haja Luz</h2>
                      {isDbEmpty && (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                          Modo Offline / Dados Locais
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-blue-200/80">Gerencie produtos e categorias do site</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      if (confirm('ATENÇÃO: Isso apagará TODOS os dados atuais no Supabase (incluindo todas as categorias, subcategorias e produtos) e recarregará a lista padrão completa (categorias, subcategorias e os 460+ produtos). Deseja continuar?')) {
                        setSeedLoading(true);
                        const res = await seedDatabase();
                        setSeedLoading(false);
                        if (res.success) {
                          alert('Banco de dados (categorias, subcategorias e produtos) resetado e semeado com sucesso!');
                        } else {
                          alert(res.error || 'Erro ao semear banco de dados.');
                        }
                      }
                    }}
                    disabled={seedLoading}
                    className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {seedLoading ? 'Processando...' : 'Recarregar Padrão'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer shadow-sm"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sair
                  </button>
                  <button 
                    onClick={() => setIsPanelOpen(false)}
                    className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Navegação de Abas */}
              <div className="bg-white border-b border-slate-200 px-6 py-2 flex gap-4 shrink-0 shadow-sm">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-3 py-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'products' 
                      ? 'border-[#1C2978] text-[#1C2978]' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Produtos ({products.length})
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`px-3 py-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'categories' 
                      ? 'border-[#1C2978] text-[#1C2978]' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Categorias e Subcategorias ({categories.length})
                </button>
              </div>

              {/* Área de Conteúdo Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                {/* Banner de Semeador se o banco estiver vazio */}
                {isDbEmpty && (
                  <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
                    <div className="space-y-1 text-center md:text-left">
                      <h4 className="font-extrabold text-[#1C2978] text-base">Banco de dados Supabase vazio</h4>
                      <p className="text-xs text-[#1C2978]/80 max-w-xl">
                        Foi detectado que o seu banco de dados no Supabase não possui categorias ou produtos. Deseja semear o banco com a carga padrão inicial de 260+ produtos e categorias do site?
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        if (confirm('Deseja realmente carregar todas as categorias, subcategorias e produtos locais padrão no Supabase? Isso apagará quaisquer dados existentes nessas tabelas.')) {
                          setSeedLoading(true);
                          const res = await seedDatabase();
                          setSeedLoading(false);
                          if (res.success) {
                            alert('Banco de dados (categorias, subcategorias e produtos) semeado com sucesso!');
                          } else {
                            alert(res.error || 'Erro ao semear banco de dados.');
                          }
                        }
                      }}
                      disabled={seedLoading}
                      className="w-full md:w-auto bg-[#1C2978] hover:bg-[#141F59] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {seedLoading ? 'Processando...' : 'Carregar Catálogo Padrão'}
                    </button>
                  </div>
                )}

                {/* ABA DE PRODUTOS */}
                {activeTab === 'products' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      {/* Busca de Produtos */}
                      <input 
                        type="text"
                        placeholder="Buscar por nome, categoria ou subcategoria..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full sm:max-w-md bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-sm focus:border-[#1C2978] outline-none transition-all shadow-sm"
                      />
                      {/* Botão Novo Produto */}
                      <button
                        onClick={openAddProductForm}
                        className="w-full sm:w-auto bg-[#1C2978] hover:bg-[#141F59] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Plus className="w-4 h-4" /> Adicionar Produto
                      </button>
                    </div>

                    {/* Formulário de Produto (Abrindo em Card superior quando ativo) */}
                    <AnimatePresence>
                      {isProductFormOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md space-y-4 relative"
                        >
                          <button 
                            onClick={() => setIsProductFormOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          
                          <h3 className="font-extrabold text-[#1C2978] text-base border-b border-slate-100 pb-2">
                            {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                          </h3>

                          {productFormError && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                              {productFormError}
                            </div>
                          )}

                          <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome do Produto *</label>
                                <input 
                                  type="text"
                                  required
                                  placeholder="Ex: Refletor LED 50W"
                                  value={productName}
                                  onChange={(e) => setProductName(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:bg-white focus:border-[#1C2978] outline-none transition-all"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Descrição</label>
                                <textarea 
                                  placeholder="Detalhes técnicos, medidas, aplicações..."
                                  value={productDescription}
                                  onChange={(e) => setProductDescription(e.target.value)}
                                  rows={3}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:bg-white focus:border-[#1C2978] outline-none transition-all resize-none"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Preço Atual</label>
                                  <input 
                                    type="number"
                                    step="0.01"
                                    placeholder="Ex: 49.90"
                                    value={productPrice}
                                    onChange={(e) => setProductPrice(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:bg-white focus:border-[#1C2978] outline-none transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Preço Antigo</label>
                                  <input 
                                    type="number"
                                    step="0.01"
                                    placeholder="Ex: 69.90"
                                    value={productOldPrice}
                                    onChange={(e) => setProductOldPrice(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:bg-white focus:border-[#1C2978] outline-none transition-all"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-2 pt-2">
                                <input 
                                  type="checkbox"
                                  id="isBestSeller"
                                  checked={productIsBestSeller}
                                  onChange={(e) => setProductIsBestSeller(e.target.checked)}
                                  className="w-4 h-4 text-[#1C2978] border-slate-300 rounded focus:ring-[#1C2978]"
                                />
                                <label htmlFor="isBestSeller" className="text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer">Marcar como "Mais Vendido"</label>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Categoria *</label>
                                  <select
                                    value={productCategory}
                                    onChange={(e) => setProductCategory(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:bg-white focus:border-[#1C2978] outline-none transition-all"
                                  >
                                    {categories.map(c => (
                                      <option key={c.slug} value={c.slug}>{c.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Subcategoria</label>
                                  <select
                                    value={productSubcategory}
                                    onChange={(e) => setProductSubcategory(e.target.value)}
                                    disabled={!productCategory}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:bg-white focus:border-[#1C2978] outline-none transition-all disabled:opacity-50"
                                  >
                                    {categories.find(c => c.slug === productCategory)?.subcategories.map(s => (
                                      <option key={s.slug} value={s.slug}>{s.name}</option>
                                    ))}
                                    {(!categories.find(c => c.slug === productCategory)?.subcategories.length) && (
                                      <option value="">Sem subcategorias</option>
                                    )}
                                  </select>
                                </div>
                              </div>

                              {/* Upload de Imagem */}
                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Foto do Produto *</label>
                                <input 
                                  type="file"
                                  accept="image/*"
                                  ref={fileInputRef}
                                  onChange={handleImageChange}
                                  className="hidden"
                                />
                                
                                <div className="border-2 border-dashed border-slate-200 hover:border-[#1C2978]/50 rounded-xl p-4 text-center cursor-pointer transition-all bg-slate-50 hover:bg-slate-100/50 flex flex-col items-center justify-center gap-2"
                                     onClick={() => fileInputRef.current?.click()}
                                >
                                  {productImagePreview ? (
                                    <div className="relative w-32 h-32 bg-white rounded-lg p-1 border border-slate-100 shadow-sm shrink-0">
                                      <img src={productImagePreview} alt="Preview" className="w-full h-full object-contain rounded-md" />
                                      <div className="absolute -top-1 -right-1 bg-green-500 text-white p-0.5 rounded-full shadow-sm"><Check className="w-3 h-3" /></div>
                                    </div>
                                  ) : (
                                    <Upload className="w-8 h-8 text-slate-400" />
                                  )}
                                  <span className="text-xs font-bold text-slate-500 mt-1">
                                    {productImageFile ? productImageFile.name : 'Selecionar ou arrastar foto'}
                                  </span>
                                  <span className="text-[10px] text-slate-400">PNG, JPG ou WEBP recomendados</span>
                                </div>
                              </div>

                              <div className="flex gap-3 pt-3">
                                <button
                                  type="button"
                                  onClick={() => setIsProductFormOpen(false)}
                                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-lg text-xs tracking-wider uppercase transition-colors"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="submit"
                                  disabled={productFormLoading}
                                  className="flex-1 bg-[#1C2978] hover:bg-[#141F59] text-white font-bold py-2.5 rounded-lg text-xs tracking-wider uppercase transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                  {productFormLoading ? 'Salvando...' : 'Salvar Produto'}
                                </button>
                              </div>
                            </div>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Listagem de Produtos Agrupados por Categoria e Subcategoria */}
                    <div className="space-y-4">
                      {categories.map(cat => {
                        const catProducts = filteredProducts.filter(p => p.category === cat.slug);
                        const isExpanded = !!expandedCategories[cat.slug];
                        
                        // Ignoramos categorias vazias se houver uma busca ativa e elas não possuírem produtos correspondentes
                        if (productSearch.trim() !== '' && catProducts.length === 0) {
                          return null;
                        }

                        return (
                          <div key={cat.slug} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                            {/* Cabeçalho da Categoria */}
                            <div className="w-full flex items-center justify-between p-4 bg-slate-50/50 border-b border-slate-200">
                              <button
                                type="button"
                                onClick={() => toggleCategoryExpand(cat.slug)}
                                className="flex-1 flex items-center gap-2.5 transition-colors cursor-pointer text-left font-bold text-slate-800"
                              >
                                <span className="p-1.5 bg-[#1C2978]/10 text-[#1C2978] rounded-lg">
                                  <cat.icon className="w-5 h-5" />
                                </span>
                                <div>
                                  <span className="text-base font-extrabold">{cat.name}</span>
                                  <span className="ml-2 text-xs font-semibold text-slate-400">({catProducts.length} {catProducts.length === 1 ? 'produto' : 'produtos'})</span>
                                </div>
                              </button>
                              <div className="flex items-center gap-1.5">
                                {cat.id && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleRenameCategory(cat.id!, cat.name, cat.iconName)}
                                      className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                                      title="Renomear Categoria"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCategory(cat.id!, cat.slug, cat.name)}
                                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center mr-2"
                                      title="Excluir Categoria"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                <button
                                  type="button"
                                  onClick={() => toggleCategoryExpand(cat.slug)}
                                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                                >
                                  {isExpanded ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
                                </button>
                              </div>
                            </div>

                            {/* Conteúdo da Categoria (Subcategorias e Produtos) */}
                            {isExpanded && (
                              <div className="p-4 space-y-6">
                                {cat.subcategories && cat.subcategories.length > 0 ? (
                                  cat.subcategories.map(sub => {
                                    const subProducts = catProducts.filter(p => p.subcategory === sub.slug);
                                    
                                    // Ignoramos subcategorias vazias na busca
                                    if (productSearch.trim() !== '' && subProducts.length === 0) {
                                      return null;
                                    }

                                    return (
                                      <div key={sub.slug} className="space-y-2.5">
                                        {/* Cabeçalho da Subcategoria */}
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                          <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                            <h4 className="font-extrabold text-slate-700 text-sm">{sub.name}</h4>
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold mr-1">
                                              {subProducts.length}
                                            </span>
                                            {sub.id && (
                                              <>
                                                <button
                                                  type="button"
                                                  onClick={() => handleRenameSubcategory(sub.id!, sub.name, cat.slug)}
                                                  className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                                                  title="Renomear Subcategoria"
                                                >
                                                  <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => handleDeleteSubcategory(sub.id!, cat.slug, sub.slug, sub.name)}
                                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                                                  title="Excluir Subcategoria"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </>
                                            )}
                                          </div>
                                          
                                          {/* Botão de Adicionar Produto nesta Subcategoria */}
                                          <button
                                            type="button"
                                            onClick={() => openAddProductFormForCategory(cat.slug, sub.slug)}
                                            className="flex items-center gap-1 text-[11px] font-bold text-[#1C2978] hover:text-[#141F59] hover:underline cursor-pointer"
                                            title={`Adicionar novo produto em ${cat.name} > ${sub.name}`}
                                          >
                                            <Plus className="w-3.5 h-3.5" /> Adicionar Produto
                                          </button>
                                        </div>

                                        {/* Tabela de Produtos da Subcategoria */}
                                        <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-3xs">
                                          {subProducts.length > 0 ? (
                                            <div className="overflow-x-auto">
                                              <table className="w-full text-left border-collapse">
                                                <thead>
                                                  <tr className="bg-slate-50/55 text-slate-400 text-[9px] font-black uppercase tracking-wider border-b border-slate-100">
                                                    <th className="px-4 py-2 w-16">Foto</th>
                                                    <th className="px-4 py-2">Produto</th>
                                                    <th className="px-4 py-2 w-28">Preço</th>
                                                    <th className="px-4 py-2 w-20 text-center">Ações</th>
                                                  </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 text-slate-600 text-xs">
                                                  {subProducts.map(p => (
                                                    <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                                                      <td className="px-4 py-2">
                                                        <div className="w-10 h-10 bg-slate-50 rounded-lg p-1 border border-slate-100 flex items-center justify-center">
                                                          <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain rounded-md" />
                                                        </div>
                                                      </td>
                                                      <td className="px-4 py-2">
                                                        <div className="font-bold text-slate-800 leading-tight line-clamp-1">{p.name}</div>
                                                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">ID: {p.id} {p.isBestSeller && <span className="ml-1 bg-orange-100 text-orange-700 font-bold px-1 rounded text-[8px]">BestSeller</span>}</div>
                                                        {p.description && <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 italic">{p.description}</div>}
                                                      </td>
                                                      <td className="px-4 py-2 font-mono font-bold text-slate-700">
                                                        {p.price ? `R$ ${p.price.toFixed(2)}` : <span className="text-slate-400 text-[10px] font-sans font-bold uppercase tracking-wider">Sob Consulta</span>}
                                                        {p.oldPrice && <div className="text-[10px] text-slate-400 line-through font-normal">R$ {p.oldPrice.toFixed(2)}</div>}
                                                      </td>
                                                      <td className="px-4 py-2">
                                                        <div className="flex items-center justify-center gap-1">
                                                          <button
                                                            type="button"
                                                            onClick={() => openEditProductForm(p)}
                                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                                            title="Editar Produto"
                                                          >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                          </button>
                                                          <button
                                                            type="button"
                                                            onClick={() => handleDeleteProduct(p.id, p.name)}
                                                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                                            title="Excluir Produto"
                                                          >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                          </button>
                                                        </div>
                                                      </td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </div>
                                          ) : (
                                            <div className="p-4 text-center text-slate-400 text-xs italic">Nenhum produto cadastrado nesta subcategoria.</div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="text-center text-slate-400 text-xs py-4">Sem subcategorias nesta categoria.</div>
                                )}

                                {/* Produtos sem subcategoria definida na categoria */}
                                {(() => {
                                  const unassignedProducts = catProducts.filter(p => !cat.subcategories.some(s => s.slug === p.subcategory));
                                  if (unassignedProducts.length === 0) return null;

                                  return (
                                    <div className="space-y-2.5">
                                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                        <div className="flex items-center gap-2">
                                          <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                                          <h4 className="font-extrabold text-slate-500 text-sm">Sem Subcategoria</h4>
                                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                                            {unassignedProducts.length}
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => openAddProductFormForCategory(cat.slug, '')}
                                          className="flex items-center gap-1 text-[11px] font-bold text-[#1C2978] hover:text-[#141F59] hover:underline cursor-pointer"
                                          title={`Adicionar novo produto em ${cat.name}`}
                                        >
                                          <Plus className="w-3.5 h-3.5" /> Adicionar Produto
                                        </button>
                                      </div>
                                      
                                      <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-3xs">
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-left border-collapse">
                                            <thead>
                                              <tr className="bg-slate-50/55 text-slate-400 text-[9px] font-black uppercase tracking-wider border-b border-slate-100">
                                                <th className="px-4 py-2 w-16">Foto</th>
                                                <th className="px-4 py-2">Produto</th>
                                                <th className="px-4 py-2 w-28">Preço</th>
                                                <th className="px-4 py-2 w-20 text-center">Ações</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-slate-600 text-xs">
                                              {unassignedProducts.map(p => (
                                                <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                                                  <td className="px-4 py-2">
                                                    <div className="w-10 h-10 bg-slate-50 rounded-lg p-1 border border-slate-100 flex items-center justify-center">
                                                      <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain rounded-md" />
                                                    </div>
                                                  </td>
                                                  <td className="px-4 py-2">
                                                    <div className="font-bold text-slate-800 leading-tight line-clamp-1">{p.name}</div>
                                                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">ID: {p.id} {p.isBestSeller && <span className="ml-1 bg-orange-100 text-orange-700 font-bold px-1 rounded text-[8px]">BestSeller</span>}</div>
                                                  </td>
                                                  <td className="px-4 py-2 font-mono font-bold text-slate-700">
                                                    {p.price ? `R$ ${p.price.toFixed(2)}` : <span className="text-slate-400 text-[10px] font-sans font-bold uppercase tracking-wider">Sob Consulta</span>}
                                                  </td>
                                                  <td className="px-4 py-2">
                                                    <div className="flex items-center justify-center gap-1">
                                                      <button
                                                        type="button"
                                                        onClick={() => openEditProductForm(p)}
                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                                        title="Editar Produto"
                                                      >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                      </button>
                                                      <button
                                                        type="button"
                                                        onClick={() => handleDeleteProduct(p.id, p.name)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                                        title="Excluir Produto"
                                                      >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                      </button>
                                                    </div>
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Produtos totalmente órfãos (sem categoria correspondente) */}
                      {(() => {
                        const orphanProducts = filteredProducts.filter(p => !categories.some(c => c.slug === p.category));
                        if (orphanProducts.length === 0) return null;

                        return (
                          <div className="bg-white border border-red-100 rounded-2xl overflow-hidden shadow-2xs">
                            <div className="p-4 bg-red-50/50 border-b border-red-100 font-extrabold text-red-800 text-sm">
                              Produtos sem Categoria Cadastrada ({orphanProducts.length})
                            </div>
                            <div className="p-4">
                              <div className="border border-red-50 rounded-xl overflow-hidden bg-white shadow-3xs">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="bg-slate-50/55 text-slate-400 text-[9px] font-black uppercase tracking-wider border-b border-slate-100">
                                        <th className="px-4 py-2 w-16">Foto</th>
                                        <th className="px-4 py-2">Produto</th>
                                        <th className="px-4 py-2 w-28">Preço</th>
                                        <th className="px-4 py-2 w-20 text-center">Ações</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-600 text-xs">
                                      {orphanProducts.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                                          <td className="px-4 py-2">
                                            <div className="w-10 h-10 bg-slate-50 rounded-lg p-1 border border-slate-100 flex items-center justify-center">
                                              <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain rounded-md" />
                                            </div>
                                          </td>
                                          <td className="px-4 py-2">
                                            <div className="font-bold text-slate-800 leading-tight line-clamp-1">{p.name}</div>
                                            <div className="text-[9px] text-slate-400 font-mono mt-0.5">ID: {p.id}</div>
                                          </td>
                                          <td className="px-4 py-2 font-mono font-bold text-slate-700">
                                            {p.price ? `R$ ${p.price.toFixed(2)}` : <span className="text-slate-400 text-[10px] font-sans font-bold uppercase tracking-wider">Sob Consulta</span>}
                                          </td>
                                          <td className="px-4 py-2">
                                            <div className="flex items-center justify-center gap-1">
                                              <button
                                                type="button"
                                                onClick={() => openEditProductForm(p)}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                                title="Editar Produto"
                                              >
                                                <Edit2 className="w-3.5 h-3.5" />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                                title="Excluir Produto"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* ABA DE CATEGORIAS */}
                {activeTab === 'categories' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nova Categoria */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 h-fit">
                      <h3 className="font-extrabold text-[#1C2978] text-base border-b border-slate-100 pb-2 flex items-center gap-2">
                        <FolderPlus className="w-5 h-5" /> Nova Categoria
                      </h3>
                      
                      {categoryFormError && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                          {categoryFormError}
                        </div>
                      )}

                      <form onSubmit={handleAddCategorySubmit} className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome da Categoria *</label>
                          <input 
                            type="text"
                            required
                            placeholder="Ex: Fios e Cabos"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:bg-white focus:border-[#1C2978] outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Selecione o Ícone da Categoria</label>
                          <div className="grid grid-cols-5 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            {commonIcons.map(icon => {
                              const IconComp = (Icons as any)[icon.name] || Icons.Package;
                              const isSelected = categoryIcon === icon.name;
                              return (
                                <button
                                  key={icon.name}
                                  type="button"
                                  onClick={() => setCategoryIcon(icon.name)}
                                  className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all cursor-pointer ${
                                    isSelected 
                                      ? 'border-[#1C2978] bg-blue-50 text-[#1C2978] font-bold shadow-2xs' 
                                      : 'border-transparent bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-100/50 shadow-3xs'
                                  }`}
                                  title={icon.label}
                                >
                                  <IconComp className="w-5 h-5 mb-1" />
                                  <span className="text-[9px] truncate max-w-full leading-none font-medium">{icon.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={categoryFormLoading}
                          className="w-full bg-[#1C2978] hover:bg-[#141F59] text-white font-bold py-2.5 rounded-lg text-xs tracking-wider uppercase transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                          {categoryFormLoading ? 'Criando...' : 'Criar Categoria'}
                        </button>
                      </form>
                    </div>

                    {/* Nova Subcategoria */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 h-fit">
                      <h3 className="font-extrabold text-[#1C2978] text-base border-b border-slate-100 pb-2 flex items-center gap-2">
                        <FolderPlus className="w-5 h-5" /> Nova Subcategoria
                      </h3>

                      <form onSubmit={handleAddSubcategorySubmit} className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Categoria Pai *</label>
                          <select
                            value={activeCategoryForSub}
                            onChange={(e) => setActiveCategoryForSub(e.target.value)}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:bg-white focus:border-[#1C2978] outline-none transition-all"
                          >
                            <option value="">Selecione uma Categoria...</option>
                            {categories.map(c => (
                              <option key={c.id || c.slug} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome da Subcategoria *</label>
                          <input 
                            type="text"
                            required
                            placeholder="Ex: Plafons de LED"
                            value={subcategoryName}
                            onChange={(e) => setSubcategoryName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:bg-white focus:border-[#1C2978] outline-none transition-all"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={categoryFormLoading}
                          className="w-full bg-[#1C2978] hover:bg-[#141F59] text-white font-bold py-2.5 rounded-lg text-xs tracking-wider uppercase transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                          {categoryFormLoading ? 'Criando...' : 'Criar Subcategoria'}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Gerenciamento de Categorias e Subcategorias Existentes */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-[#1C2978] text-base border-b border-slate-100 pb-2 flex items-center gap-2">
                      <Settings className="w-5 h-5" /> Gerenciar Categorias e Subcategorias Existentes
                    </h3>
                    
                    <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-2">
                      {categories.map(cat => {
                        return (
                          <div key={cat.slug} className="py-4 space-y-3">
                            {/* Categoria Pai */}
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <span className="p-1.5 bg-[#1C2978]/10 text-[#1C2978] rounded-lg">
                                  <cat.icon className="w-4.5 h-4.5" />
                                </span>
                                <span className="font-extrabold text-slate-800 text-sm">{cat.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {cat.id && (
                                  <>
                                    <button
                                      onClick={() => handleRenameCategory(cat.id!, cat.name, cat.iconName)}
                                      className="px-2 py-1 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                                    >
                                      Renomear
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCategory(cat.id!, cat.slug, cat.name)}
                                      className="px-2 py-1 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
                                    >
                                      Excluir
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Subcategorias vinculadas */}
                            {cat.subcategories && cat.subcategories.length > 0 ? (
                              <div className="pl-9 space-y-2">
                                {cat.subcategories.map(sub => (
                                  <div key={sub.slug} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50">
                                    <div className="flex items-center gap-2 text-slate-600">
                                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                      <span>{sub.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      {sub.id && (
                                        <>
                                          <button
                                            onClick={() => handleRenameSubcategory(sub.id!, sub.name, cat.slug)}
                                            className="px-1.5 py-0.5 text-[9px] font-bold text-blue-500 hover:text-blue-700 hover:underline cursor-pointer"
                                          >
                                            Renomear
                                          </button>
                                          <button
                                            onClick={() => handleDeleteSubcategory(sub.id!, cat.slug, sub.slug, sub.name)}
                                            className="px-1.5 py-0.5 text-[9px] font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                                          >
                                            Excluir
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-400 pl-9 italic">Nenhuma subcategoria vinculada.</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}
