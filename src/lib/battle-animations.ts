const animationFiles = import.meta.glob(
  "../../assets/animations/**/*.{png,webp}",
  {
    eager: true,
    import: "default",
  },
) as Record<string, string>;
const skinAnimationFiles = import.meta.glob(
  "../../assets/animations-Skins/**/*.{png,webp}",
  {
    eager: true,
    import: "default",
  },
) as Record<string, string>;

const animationLibrary = buildAnimationLibrary();
const skinAnimationLibrary = buildAnimationLibrary(skinAnimationFiles);

export function getBattleAttackFrameSources(characterName: string) {
  const direct = animationLibrary.get(normalizeAnimationKey(characterName));
  if (direct) {
    return direct;
  }

  const normalizedCharacter = normalizeAnimationKey(characterName);
  for (const [folderKey, frames] of animationLibrary.entries()) {
    if (
      folderKey.includes(normalizedCharacter) ||
      normalizedCharacter.includes(folderKey)
    ) {
      return frames;
    }
  }

  return [];
}

export function getBattleSkinAttackFrameSources(skinHint?: string | null) {
  if (!skinHint) {
    return [];
  }

  const normalizedHint = normalizeAnimationKey(skinHint);
  const direct = skinAnimationLibrary.get(normalizedHint);
  if (direct) {
    return direct;
  }

  for (const [folderKey, frames] of skinAnimationLibrary.entries()) {
    if (
      folderKey.includes(normalizedHint) ||
      normalizedHint.includes(folderKey)
    ) {
      return frames;
    }
  }

  return [];
}

function buildAnimationLibrary(sourceFiles = animationFiles) {
  const grouped = new Map<string, Array<{ order: number; path: string }>>();

  for (const [modulePath, assetPath] of Object.entries(sourceFiles)) {
    const pathParts = modulePath.replace(/\\/g, "/").split("/");
    const folderName = pathParts[pathParts.length - 2];
    const fileName = pathParts[pathParts.length - 1];
    const key = normalizeAnimationKey(folderName);
    const order = extractFrameOrder(fileName);
    const bucket = grouped.get(key) ?? [];

    bucket.push({ order, path: assetPath });
    grouped.set(key, bucket);
  }

  const result = new Map<string, string[]>();
  for (const [key, frames] of grouped.entries()) {
    frames.sort(
      (left, right) =>
        left.order - right.order || left.path.localeCompare(right.path),
    );

    const finalFrames: string[] = [];
    const frameSet = new Set<string>();

    for (const frame of frames) {
      const frameIdentifier = frame.path.replace(/\.(png|webp)$/i, "");
      if (frame.path.endsWith(".webp")) {
        frameSet.add(frameIdentifier);
        finalFrames.push(frame.path);
      } else if (!frameSet.has(frameIdentifier)) {
        finalFrames.push(frame.path);
      }
    }

    result.set(key, finalFrames);
  }

  return result;
}

function extractFrameOrder(fileName: string) {
  const match = fileName.match(/(\d+)(?=\.(png|webp)$)/i);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function normalizeAnimationKey(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .replace(/jirem/g, "jiren");
}
