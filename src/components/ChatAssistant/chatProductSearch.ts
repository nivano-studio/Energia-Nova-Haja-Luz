import type { Product } from '../../data/products';
import { PRODUCTS } from '../../data/products';
import { normalizeText } from './chatPreprocess';
import type { ExtractedEntities } from './types';
import { productTaxonomy } from './knowledge/productTaxonomy';

// Levenshtein distance implementation
function levenshtein(a: string, b: string): number {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function stringSimilarity(a: string, b: string): number {
  if (a.length === 0 && b.length === 0) return 1.0;
  if (a.length === 0 || b.length === 0) return 0.0;
  const distance = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return (maxLen - distance) / maxLen;
}

interface ScoredProduct {
  product: Product;
  score: number;
}

export function searchProducts(cleanInput: string, entities: ExtractedEntities, offset: number = 0, forceCategory: string | null = null, shownProductIds: string[] = []): { products: Product[], total: number } {
  const genericWords = ['luz', 'led', 'cabo', 'fio', 'tomada', 'lampada', 'disjuntor'];
  const scoredProducts: ScoredProduct[] = [];

  // Extract all meaningful tokens
  const queryTokens = cleanInput.split(' ').filter(t => t.length > 2);
  if (entities.products && entities.products.length > 0) {
    entities.products.forEach(p => {
      p.split(' ').forEach(t => {
        if (t.length > 2 && !queryTokens.includes(t)) queryTokens.push(t);
      });
    });
  }

  if (queryTokens.length === 0 && !forceCategory) return { products: [], total: 0 };

  const allowedCategories: string[] = [];
  const rejectCategories: string[] = [];

  if (forceCategory) {
    allowedCategories.push(forceCategory);
  } else {
    // Determine allowed categories based on productTaxonomy
    for (const tax of Object.values(productTaxonomy)) {
      const matchTax = tax.canonicalProducts.some(cp => cleanInput.includes(cp)) || 
                       tax.aliases.some(al => cleanInput.includes(al));
      if (matchTax) {
        if (!allowedCategories.includes(tax.label)) allowedCategories.push(tax.label);
        tax.rejectCategories.forEach(rc => {
          if (!rejectCategories.includes(rc)) rejectCategories.push(rc);
        });
      }
    }
  }

  for (const product of PRODUCTS) {
    let score = 0;
    const productNameNormalized = normalizeText(product.name);
    const productTokens = productNameNormalized.split(' ');
    const categoryNormalized = normalizeText(product.category);
    const subcategoryNormalized = normalizeText(product.subcategory);

    let matchCount = 0;

    for (const token of queryTokens) {
      // Exact match in name
      if (productTokens.includes(token)) {
        score += 120;
        matchCount++;
      } 
      // Partial match in name
      else if (productNameNormalized.includes(token)) {
        score += 70;
        matchCount++;
      } 
      // Exact match in category or subcategory
      else if (categoryNormalized.includes(token) || subcategoryNormalized.includes(token)) {
        score += 50;
        matchCount++;
      }
      // Fuzzy match
      else {
        let maxSim = 0;
        for (const pToken of productTokens) {
          const sim = stringSimilarity(token, pToken);
          if (sim > maxSim) maxSim = sim;
        }
        if (maxSim >= 0.80) { // Increased threshold to 0.80 for stricter fuzzy
          score += 20 * maxSim;
          matchCount++;
        }
      }
    }

    if (matchCount > 0 || forceCategory) {
      if (forceCategory && product.category === forceCategory) {
        score += 100;
      }

      if (allowedCategories.length > 0 && allowedCategories.includes(product.category)) {
        score += 100;
      }

      if (rejectCategories.includes(product.category)) {
        score -= 500; // Strong penalty for rejected categories
      }

      // Strong Attribute Penalties and Bonuses (V16 Rules)
      if (entities.color) {
        const c = entities.color.toLowerCase();
        if (productNameNormalized.includes(c)) {
          score += 350;
        } else if (/(branco|preto|azul|verde|vermelho|amarelo|cinza|marrom)/.test(productNameNormalized)) {
          score -= 300; // Has a different color
        }
      }

      if (entities.voltage) {
        if (productNameNormalized.includes(`${entities.voltage}v`)) {
          score += 350;
        } else if (/(110v|220v|12v|24v|bivolt)/.test(productNameNormalized)) {
          // Ignore bivolt if asking for specific? 
          if (!productNameNormalized.includes("bivolt")) {
            score -= 300;
          }
        }
      }

      if (entities.currentAmps) {
        if (productNameNormalized.includes(`${entities.currentAmps}a`)) {
          score += 350;
        } else if (/\b[0-9]+a\b/.test(productNameNormalized)) {
          score -= 300;
        }
      }

      // Penalize generic terms
      const onlyGeneric = queryTokens.every(t => genericWords.includes(t));
      if (onlyGeneric && !forceCategory) {
        score -= 30;
      }

      // Enhanced ranking using canonical
      const isLampTax = queryTokens.some(t => productTaxonomy.iluminacao.canonicalProducts.includes(t) || productTaxonomy.iluminacao.aliases.includes(t));
      if (isLampTax) {
        if (productNameNormalized.includes("lampada")) score += 200;
        if (productNameNormalized.includes("bulbo")) score += 160;
        if (productNameNormalized.includes("led")) score += 60;
        if (productNameNormalized.includes("plafon") || productNameNormalized.includes("painel")) score -= 80;
      }

      // Penalize items already shown in previous pages
      if (shownProductIds.includes(product.id)) {
        score -= 300;
      }

      if (score > 0) {
        scoredProducts.push({ product, score });
      }
    }
  }

  // Sort by score descending
  scoredProducts.sort((a, b) => b.score - a.score);

  // Return unique
  const uniqueProducts = Array.from(new Set(scoredProducts.map(sp => sp.product)));
  const total = uniqueProducts.length;
  const paginated = uniqueProducts.slice(offset, offset + 3);

  return { products: paginated, total };
}
