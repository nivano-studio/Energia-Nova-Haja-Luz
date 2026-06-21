/**
 * Otimiza e comprime uma imagem para um tamanho adequado (geralmente < 300 KB).
 * Reduz a resolução máxima para 1024px de largura ou altura (mantendo a proporção)
 * e exporta em formato JPEG ou WebP com qualidade controlada.
 */
export async function optimizeImage(
  file: File,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.8
): Promise<File> {
  // Se o arquivo já for menor que 200 KB e for de tipo de imagem suportado, não precisa de compressão
  if (file.size < 200 * 1024 && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Calcular novas dimensões mantendo a proporção de aspecto (aspect ratio)
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Criar canvas para desenhar a imagem redimensionada
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível obter o contexto 2D do Canvas.'));
          return;
        }

        // Desenhar a imagem original no canvas redimensionado
        ctx.drawImage(img, 0, 0, width, height);

        // Converter para Blob (preferindo JPEG para compactação consistente, a menos que seja WEBP)
        const outputType = file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Erro na compressão da imagem pelo Canvas.'));
              return;
            }
            
            // Criar um novo arquivo a partir do Blob
            const extension = outputType === 'image/webp' ? 'webp' : 'jpg';
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const newFile = new File([blob], `${baseName}_optimized.${extension}`, {
              type: outputType,
              lastModified: Date.now(),
            });
            resolve(newFile);
          },
          outputType,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Erro ao carregar a imagem para processamento.'));
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo original.'));
    };
    
    reader.readAsDataURL(file);
  });
}
