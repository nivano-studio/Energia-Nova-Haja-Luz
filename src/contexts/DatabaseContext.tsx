import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CATEGORIES as STATIC_CATEGORIES } from '../data/categories';
import { PRODUCTS as STATIC_PRODUCTS } from '../data/products';
import { updateActiveProducts } from '../components/ChatAssistant/chatProductSearch';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const sanitizeInput = (text: string): string => {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '').trim();
};

export interface SubCategory {
  id?: string;
  name: string;
  slug: string;
  category_id?: string;
}

export interface Category {
  id?: string;
  name: string;
  icon: LucideIcon;
  iconName: string; // Guarda a string do ícone no banco
  slug: string;
  subcategories: SubCategory[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory: string;
  image: string;
  price?: number;
  oldPrice?: number;
  isBestSeller?: boolean;
  salesCount?: number;
}

interface DatabaseContextType {
  products: Product[];
  categories: Category[];
  loading: boolean;
  isAdmin: boolean;
  isDbEmpty: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  
  // Operações de Categoria
  addCategory: (name: string, iconName: string) => Promise<{ success: boolean; error?: string }>;
  deleteCategory: (id: string, slug: string) => Promise<{ success: boolean; error?: string }>;
  addSubcategory: (categoryId: string, name: string) => Promise<{ success: boolean; error?: string }>;
  deleteSubcategory: (id: string, catSlug: string, subSlug: string) => Promise<{ success: boolean; error?: string }>;
  
  // Operações de Produto
  addProduct: (product: Omit<Product, 'id'>, imageFile?: File) => Promise<{ success: boolean; error?: string }>;
  updateProduct: (id: string, product: Partial<Product>, imageFile?: File) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Semeador de dados
  seedDatabase: () => Promise<{ success: boolean; error?: string }>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase deve ser usado dentro de um DatabaseProvider');
  }
  return context;
}

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDbEmpty, setIsDbEmpty] = useState(false);

  // Helper para converter string de ícone para componente Lucide
  const getIconComponent = (iconName: string): LucideIcon => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.Package;
  };

  // Carregar dados iniciais
  const loadData = async () => {
    setLoading(true);
    
    if (!supabase) {
      console.log('Supabase não configurado. Carregando dados locais estáticos.');
      setIsDbEmpty(true);
      useStaticFallback();
      setLoading(false);
      return;
    }

    try {
      // 1. Carregar Categorias e Subcategorias
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          slug,
          icon,
          subcategories (
            id,
            name,
            slug,
            category_id
          )
        `);

      if (catError) throw catError;

      // 2. Carregar Produtos
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (prodError) throw prodError;

      // Se o banco estiver vazio (ex: novo projeto), vamos carregar os dados locais como fallback
      // ou dar a opção de seed. Se tiver dados, usamos eles.
      if ((!catData || catData.length === 0) && (!prodData || prodData.length === 0)) {
        console.log('Banco de dados Supabase vazio. Usando dados estáticos.');
        setIsDbEmpty(true);
        useStaticFallback();
      } else {
        // Mapear categorias vindo do banco
        const mappedCategories: Category[] = (catData || []).map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          iconName: cat.icon,
          icon: getIconComponent(cat.icon),
          subcategories: (cat.subcategories || []).map((sub: any) => ({
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
            category_id: sub.category_id
          }))
        }));

        // Mapear produtos vindo do banco
        const mappedProducts: Product[] = (prodData || []).map(prod => ({
          id: prod.id,
          name: prod.name,
          description: prod.description || '',
          category: prod.category,
          subcategory: prod.subcategory,
          image: prod.image,
          price: prod.price ? Number(prod.price) : undefined,
          oldPrice: prod.old_price ? Number(prod.old_price) : undefined,
          isBestSeller: prod.is_best_seller,
          salesCount: prod.sales_count
        }));

        setCategories(mappedCategories);
        setProducts(mappedProducts);
        updateActiveProducts(mappedProducts);
        setIsDbEmpty(false);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do Supabase. Ativando fallback estático:', error);
      setIsDbEmpty(true);
      useStaticFallback();
    } finally {
      setLoading(false);
    }
  };

  const useStaticFallback = () => {
    // Converter CATEGORIES estáticas para o formato com iconName
    const formattedStaticCategories = STATIC_CATEGORIES.map(cat => {
      // Tentar encontrar o nome da propriedade no objeto Icons
      let iconName = 'Package';
      for (const [key, value] of Object.entries(Icons)) {
        if (value === cat.icon) {
          iconName = key;
          break;
        }
      }
      return {
        ...cat,
        iconName,
        subcategories: cat.subcategories.map(sub => ({ ...sub }))
      };
    });

    setCategories(formattedStaticCategories);
    setProducts(STATIC_PRODUCTS);
    updateActiveProducts(STATIC_PRODUCTS);
  };

  // Monitorar autenticação do administrador
  useEffect(() => {
    loadData();

    if (!supabase) return;

    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session?.user);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    if (!supabase) {
      return { success: false, error: 'Conexão com banco de dados não configurada localmente.' };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setIsAdmin(!!data.session);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao realizar login.' };
    }
  };

  // Logout
  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAdmin(false);
  };

  // Função interna para fazer upload de foto para o bucket 'product-images'
  const uploadImage = async (file: File): Promise<string> => {
    if (!supabase) throw new Error('Supabase não configurado');
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Adicionar Categoria
  const addCategory = async (name: string, iconName: string) => {
    if (!supabase) return { success: false, error: 'Modo offline: Alterações não permitidas.' };
    try {
      const slug = name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
        .replace(/[^a-z0-9 -]/g, '') // remove caracteres especiais
        .replace(/\s+/g, '-') // substitui espaços por hifens
        .replace(/-+/g, '-'); // evita hifens duplicados

      const { error } = await supabase
        .from('categories')
        .insert([{ name, slug, icon: iconName }]);

      if (error) throw error;

      await loadData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao criar categoria.' };
    }
  };

  // Deletar Categoria
  const deleteCategory = async (id: string, slug: string) => {
    if (!supabase) return { success: false, error: 'Modo offline: Alterações não permitidas.' };
    try {
      // 1. Deletar todos os produtos associados a esta categoria
      const { error: prodError } = await supabase
        .from('products')
        .delete()
        .eq('category', slug);
      if (prodError) throw prodError;

      // 2. Deletar a categoria (as subcategorias associadas são removidas automaticamente via CASCADE no Supabase)
      const { error: catError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (catError) throw catError;

      await loadData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao excluir categoria.' };
    }
  };

  // Adicionar Subcategoria
  const addSubcategory = async (categoryId: string, name: string) => {
    if (!supabase) return { success: false, error: 'Modo offline: Alterações não permitidas.' };
    try {
      const slug = name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      const { error } = await supabase
        .from('subcategories')
        .insert([{ category_id: categoryId, name, slug }]);

      if (error) throw error;

      await loadData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao criar subcategoria.' };
    }
  };

  // Deletar Subcategoria
  const deleteSubcategory = async (id: string, catSlug: string, subSlug: string) => {
    if (!supabase) return { success: false, error: 'Modo offline: Alterações não permitidas.' };
    try {
      // 1. Deletar todos os produtos associados a esta subcategoria
      const { error: prodError } = await supabase
        .from('products')
        .delete()
        .eq('category', catSlug)
        .eq('subcategory', subSlug);
      if (prodError) throw prodError;

      // 2. Deletar a subcategoria
      const { error: subError } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', id);
      if (subError) throw subError;

      await loadData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao excluir subcategoria.' };
    }
  };

  // Adicionar Produto
  const addProduct = async (productData: Omit<Product, 'id'>, imageFile?: File) => {
    if (!supabase) return { success: false, error: 'Modo offline: Alterações não permitidas.' };
    try {
      let imageUrl = productData.image;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      if (!imageUrl) {
        throw new Error('Uma imagem é obrigatória para cadastrar um produto.');
      }

      const newId = Date.now().toString(); // ID baseado em timestamp para compatibilidade

      const { error } = await supabase
        .from('products')
        .insert([{
          id: newId,
          name: sanitizeInput(productData.name),
          description: sanitizeInput(productData.description || ''),
          category: sanitizeInput(productData.category),
          subcategory: sanitizeInput(productData.subcategory),
          image: imageUrl,
          price: productData.price || null,
          old_price: productData.oldPrice || null,
          is_best_seller: productData.isBestSeller || false,
          sales_count: productData.salesCount || 0
        }]);

      if (error) throw error;

      await loadData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao adicionar produto.' };
    }
  };

  // Atualizar Produto
  const updateProduct = async (id: string, updatedFields: Partial<Product>, imageFile?: File) => {
    if (!supabase) return { success: false, error: 'Modo offline: Alterações não permitidas.' };
    try {
      let imageUrl = updatedFields.image;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const updates: any = {};
      if (updatedFields.name !== undefined) updates.name = sanitizeInput(updatedFields.name);
      if (updatedFields.description !== undefined) updates.description = sanitizeInput(updatedFields.description || '');
      if (updatedFields.category !== undefined) updates.category = sanitizeInput(updatedFields.category);
      if (updatedFields.subcategory !== undefined) updates.subcategory = sanitizeInput(updatedFields.subcategory);
      if (imageUrl !== undefined) updates.image = imageUrl;
      if (updatedFields.price !== undefined) updates.price = updatedFields.price || null;
      if (updatedFields.oldPrice !== undefined) updates.old_price = updatedFields.oldPrice || null;
      if (updatedFields.isBestSeller !== undefined) updates.is_best_seller = updatedFields.isBestSeller;
      if (updatedFields.salesCount !== undefined) updates.sales_count = updatedFields.salesCount;

      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await loadData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao atualizar produto.' };
    }
  };

  // Deletar Produto
  const deleteProduct = async (id: string) => {
    if (!supabase) return { success: false, error: 'Modo offline: Alterações não permitidas.' };
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao deletar produto.' };
    }
  };

  // Semear Banco de Dados com dados iniciais locais
  const seedDatabase = async () => {
    if (!supabase) return { success: false, error: 'Supabase não configurado.' };
    try {
      // 1. Limpar tabelas para evitar chaves duplicadas
      await supabase.from('products').delete().neq('id', '0');
      await supabase.from('subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // 2. Inserir Categorias e Subcategorias
      for (const cat of STATIC_CATEGORIES) {
        let iconName = 'Package';
        for (const [key, value] of Object.entries(Icons)) {
          if (value === cat.icon) {
            iconName = key;
            break;
          }
        }

        const { data: insertedCat, error: catError } = await supabase
          .from('categories')
          .insert([{ name: cat.name, slug: cat.slug, icon: iconName }])
          .select();

        if (catError) throw catError;
        if (!insertedCat || insertedCat.length === 0) continue;
        const categoryId = insertedCat[0].id;

        for (const sub of cat.subcategories) {
          const { error: subError } = await supabase
            .from('subcategories')
            .insert([{ category_id: categoryId, name: sub.name, slug: sub.slug }]);
          if (subError) throw subError;
        }
      }

      // 3. Inserir Produtos em lotes de 50 para evitar limites
      const batchSize = 50;
      for (let i = 0; i < STATIC_PRODUCTS.length; i += batchSize) {
        const batch = STATIC_PRODUCTS.slice(i, i + batchSize).map(p => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          category: p.category,
          subcategory: p.subcategory,
          image: p.image,
          price: p.price || null,
          old_price: p.oldPrice || null,
          is_best_seller: p.isBestSeller || false,
          sales_count: p.salesCount || 0
        }));

        const { error: prodError } = await supabase
          .from('products')
          .insert(batch);
        
        if (prodError) throw prodError;
      }

      await loadData();
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message || 'Erro ao semear o banco de dados.' };
    }
  };

  return (
    <DatabaseContext.Provider value={{
      products,
      categories,
      loading,
      isAdmin,
      isDbEmpty,
      login,
      logout,
      addCategory,
      deleteCategory,
      addSubcategory,
      deleteSubcategory,
      addProduct,
      updateProduct,
      deleteProduct,
      seedDatabase
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};
