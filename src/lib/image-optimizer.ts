/**
 * Módulo de optimización y formateo de imágenes para DeusX Inmobiliaria
 * Redimensiona y comprime cualquier imagen (independientemente de su peso y resolución)
 * a un formato estándar WebP optimizado para la Vidriera Online y catálogo.
 */

export interface OptimizedImageResult {
  file: File;
  dataUrl: string;
  sizeKb: number;
  width: number;
  height: number;
  originalSizeKb: number;
  savingsPercent: number;
}

export interface ImageOptimizerOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 a 1.0 (default 0.82)
  outputFormat?: "image/webp" | "image/jpeg";
}

/**
 * Optimiza y ajusta una imagen de propiedad al formato estándar de la Vidriera Online (1280x800 máx, WebP).
 */
export async function optimizePropertyImage(
  file: File,
  options: ImageOptimizerOptions = {}
): Promise<OptimizedImageResult> {
  const {
    maxWidth = 1280,
    maxHeight = 800,
    quality = 0.82,
    outputFormat = "image/webp",
  } = options;

  return new Promise((resolve, reject) => {
    // Si no es un archivo de imagen, rechazar
    if (!file.type.startsWith("image/")) {
      reject(new Error("El archivo seleccionado no es una imagen válida."));
      return;
    }

    const originalSizeKb = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        // 1. Calcular nuevas dimensiones manteniendo aspect ratio
        let targetWidth = img.width;
        let targetHeight = img.height;

        if (targetWidth > maxWidth || targetHeight > maxHeight) {
          const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
          targetWidth = Math.round(targetWidth * ratio);
          targetHeight = Math.round(targetHeight * ratio);
        }

        // 2. Crear canvas y renderizar con suavizado de alta calidad
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo inicializar el contexto de imagen."));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // 3. Exportar a formato WebP optimizado
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Error al procesar y comprimir la imagen."));
              return;
            }

            const cleanFileName = file.name
              .replace(/\.[^/.]+$/, "")
              .toLowerCase()
              .replace(/[^a-z0-9_-]/g, "_")
              .substring(0, 30);
            
            const optimizedFile = new File([blob], `${cleanFileName}.webp`, {
              type: outputFormat,
              lastModified: Date.now(),
            });

            const dataUrl = canvas.toDataURL(outputFormat, quality);
            const sizeKb = Math.round(blob.size / 1024);
            const savingsPercent = originalSizeKb > 0 
              ? Math.max(0, Math.round(((originalSizeKb - sizeKb) / originalSizeKb) * 100))
              : 0;

            resolve({
              file: optimizedFile,
              dataUrl,
              sizeKb,
              width: targetWidth,
              height: targetHeight,
              originalSizeKb,
              savingsPercent,
            });
          },
          outputFormat,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error("No se pudo cargar la imagen para su procesamiento."));
      };

      if (typeof readerEvent.target?.result === "string") {
        img.src = readerEvent.target.result;
      } else {
        reject(new Error("Error de lectura del archivo de imagen."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error al leer el archivo en el navegador."));
    };

    reader.readAsDataURL(file);
  });
}
