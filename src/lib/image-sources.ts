function normalizeAssetPath(source: string) {
  if (!source) {
    return source;
  }

  if (/^(https?:)?\/\//i.test(source) || source.startsWith("/")) {
    return source;
  }

  const normalizedSource = source.replace(/^\.?\//, "");

  if (normalizedSource.startsWith("assets/")) {
    return `/library-assets/${normalizedSource.slice("assets/".length)}`;
  }

  return `/${normalizedSource}`;
}

export function getWebpImagePath(source: string) {
  return normalizeAssetPath(source).replace(/\.(png|jpg|jpeg)$/i, ".webp");
}

export function getOptimizedImageSources(src: string) {
  const normalizedSrc = normalizeAssetPath(src);
  const webpSrc = getWebpImagePath(normalizedSrc);
  const extension = normalizedSrc.split(".").pop()?.toLowerCase();

  return {
    webpSrc,
    fallbackSrc: normalizedSrc,
    fallbackType:
      extension === "jpg" || extension === "jpeg" ? "image/jpeg" : "image/png",
  };
}

export function getPreferredImagePath(source: string) {
  return getWebpImagePath(source);
}

export function getPreferredAssetPath(source?: string) {
  return source ? normalizeAssetPath(source) : source;
}
