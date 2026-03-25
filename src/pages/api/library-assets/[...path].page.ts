import { createReadStream, existsSync, statSync } from "node:fs";
import { join, normalize, resolve, sep } from "node:path";
import type { NextApiRequest, NextApiResponse } from "next";

const assetsRoot = resolve(process.cwd(), "assets");

const mimeByExt: Record<string, string> = {
  ".bin": "application/octet-stream",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function getMimeType(filePath: string) {
  const extensionIndex = filePath.lastIndexOf(".");
  if (extensionIndex < 0) {
    return mimeByExt[".bin"];
  }

  const extension = filePath.slice(extensionIndex).toLowerCase();
  return mimeByExt[extension] ?? mimeByExt[".bin"];
}

function resolveSafeAssetPath(pathSegments: string[]) {
  const normalizedPath = normalize(pathSegments.join("/"));
  const absolutePath = resolve(join(assetsRoot, normalizedPath));
  const allowedPrefix = `${assetsRoot}${sep}`;

  if (absolutePath === assetsRoot || absolutePath.startsWith(allowedPrefix)) {
    return absolutePath;
  }

  return null;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const rawPath = req.query.path;
  const pathSegments = Array.isArray(rawPath) ? rawPath : [rawPath ?? ""];
  const targetPath = resolveSafeAssetPath(pathSegments);

  if (!targetPath || !existsSync(targetPath)) {
    res.status(404).json({ message: "Asset nao encontrado" });
    return;
  }

  let fileStats: ReturnType<typeof statSync>;

  try {
    fileStats = statSync(targetPath);
  } catch {
    res.status(404).json({ message: "Asset nao encontrado" });
    return;
  }

  if (!fileStats.isFile()) {
    res.status(404).json({ message: "Asset nao encontrado" });
    return;
  }

  res.setHeader("Content-Type", getMimeType(targetPath));
  res.setHeader("Content-Length", String(fileStats.size));
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

  const fileStream = createReadStream(targetPath);
  fileStream.on("error", () => {
    if (!res.headersSent) {
      res.status(500).json({ message: "Falha ao ler asset local" });
    } else {
      res.end();
    }
  });

  fileStream.pipe(res);
}
