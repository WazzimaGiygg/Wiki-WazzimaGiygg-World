export interface PreparedImageResult {
  dataUrl: string;
  sizeBytes: number;
  mimeType: string;
  width?: number;
  height?: number;
  wasCompressed: boolean;
}

const MAX_FIRESTORE_DATAURL_LENGTH = 720_000;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo de imagem selecionado.'));
    reader.readAsDataURL(file);
  });
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Não foi possível decodificar a imagem selecionada.'));
    img.src = src;
  });
}

/**
 * Prepares an image file for storage in Firestore (/wiki_files),
 * preserving dimensions and automatically optimizing large raster images
 * so the encoded payload stays safely below Firestore's 1 MB document limit.
 */
export async function prepareImageForWikiUpload(file: File): Promise<PreparedImageResult> {
  const rawDataUrl = await readFileAsDataUrl(file);
  const mime = file.type || 'image/png';
  const isSvgOrGif = mime === 'image/svg+xml' || mime === 'image/gif';

  let width: number | undefined;
  let height: number | undefined;
  try {
    const img = await loadHtmlImage(rawDataUrl);
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      width = img.naturalWidth;
      height = img.naturalHeight;
    }
  } catch {
    // Non-raster or vector previews may not report naturalWidth synchronously
  }

  if (rawDataUrl.length <= MAX_FIRESTORE_DATAURL_LENGTH) {
    return {
      dataUrl: rawDataUrl,
      sizeBytes: file.size,
      mimeType: mime,
      width,
      height,
      wasCompressed: false,
    };
  }

  if (isSvgOrGif) {
    throw new Error(
      'Arquivos SVG ou GIF muito grandes excedem o limite de 1 MB por documento no Firestore. Reduza o arquivo para menos de 500 KB e tente novamente.'
    );
  }

  const img = await loadHtmlImage(rawDataUrl);
  const maxDimension = 1600;
  let targetW = img.naturalWidth || 1200;
  let targetH = img.naturalHeight || 900;

  if (targetW > maxDimension || targetH > maxDimension) {
    const ratio = Math.min(maxDimension / targetW, maxDimension / targetH);
    targetW = Math.max(1, Math.round(targetW * ratio));
    targetH = Math.max(1, Math.round(targetH * ratio));
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Navegador sem suporte a otimização de imagem para gravação no Firestore.');
  }

  const outputMime = mime === 'image/png' ? 'image/webp' : 'image/jpeg';
  let currentDataUrl = rawDataUrl;

  for (const scale of [1, 0.75, 0.55]) {
    const w = Math.max(1, Math.round(targetW * scale));
    const h = Math.max(1, Math.round(targetH * scale));
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    for (const quality of [0.84, 0.7, 0.54]) {
      const candidate = canvas.toDataURL(outputMime, quality);
      if (candidate.length <= MAX_FIRESTORE_DATAURL_LENGTH) {
        const approxBytes = Math.round((candidate.length * 3) / 4);
        return {
          dataUrl: candidate,
          sizeBytes: approxBytes,
          mimeType: outputMime,
          width: w,
          height: h,
          wasCompressed: true,
        };
      }
      currentDataUrl = candidate;
    }
  }

  if (currentDataUrl.length <= 920_000) {
    return {
      dataUrl: currentDataUrl,
      sizeBytes: Math.round((currentDataUrl.length * 3) / 4),
      mimeType: outputMime,
      width: canvas.width,
      height: canvas.height,
      wasCompressed: true,
    };
  }

  throw new Error(
    'Mesmo após otimização, a imagem excede o limite de 1 MB do Firestore. Utilize uma imagem com menor resolução.'
  );
}
