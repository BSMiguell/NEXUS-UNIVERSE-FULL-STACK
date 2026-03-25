import path from "node:path";
import fs from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function getNodeModulePackageName(id: string) {
  const normalizedPath = id.replace(/\\/g, "/");
  const [, modulePath = ""] = normalizedPath.split("/node_modules/");

  if (!modulePath) {
    return null;
  }

  const segments = modulePath.split("/");

  if (segments[0]?.startsWith("@") && segments[1]) {
    return `${segments[0]}/${segments[1]}`;
  }

  return segments[0] ?? null;
}

const libraryAssetsRoot = path.resolve(__dirname, "assets");

function getContentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".glb":
      return "model/gltf-binary";
    case ".gltf":
      return "model/gltf+json";
    case ".mp4":
      return "video/mp4";
    default:
      return "application/octet-stream";
  }
}

function resolveLibraryAssetPath(url: string) {
  const [pathname] = url.split("?");
  const decodedPath = decodeURIComponent(pathname);
  const relativePath = decodedPath.replace(/^\/library-assets\/?/, "");
  const absolutePath = path.resolve(libraryAssetsRoot, relativePath);

  if (!absolutePath.startsWith(libraryAssetsRoot)) {
    return null;
  }

  return absolutePath;
}

function serveLibraryAssets() {
  const middleware = (request: any, response: any, next: () => void) => {
    const requestUrl = request.url;

    if (typeof requestUrl !== "string" || !requestUrl.startsWith("/library-assets/")) {
      next();
      return;
    }

    const absolutePath = resolveLibraryAssetPath(requestUrl);

    if (!absolutePath || !fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
      response.statusCode = 404;
      response.end("Asset not found");
      return;
    }

    response.setHeader("Content-Type", getContentType(absolutePath));
    response.setHeader("Cache-Control", "no-store");
    fs.createReadStream(absolutePath).pipe(response);
  };

  return {
    configurePreviewServer(server: any) {
      server.middlewares.use(middleware);
    },
    configureServer(server: any) {
      server.middlewares.use(middleware);
    },
    name: "serve-library-assets",
  };
}

export default defineConfig({
  plugins: [react(), serveLibraryAssets()],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("framer-motion")) {
            return "vendor-framer-motion";
          }

          if (id.includes("@tanstack")) {
            return "vendor-tanstack";
          }

          if (
            id.includes("/react/") ||
            id.includes("\\react\\") ||
            id.includes("/react-dom/") ||
            id.includes("\\react-dom\\") ||
            id.includes("/scheduler/") ||
            id.includes("\\scheduler\\")
          ) {
            return "vendor-react-core";
          }

          if (id.includes("react-router") || id.includes("react-router-dom")) {
            return "vendor-react-router";
          }

          if (id.includes("@google/model-viewer")) {
            return "vendor-model-viewer";
          }

          if (id.includes("axios")) {
            return "vendor-axios";
          }

          if (id.includes("zustand")) {
            return "vendor-zustand";
          }

          if (id.includes("lucide-react")) {
            return "vendor-lucide";
          }

          if (
            id.includes("@radix-ui/react-slot") ||
            id.includes("class-variance-authority") ||
            id.includes("clsx") ||
            id.includes("tailwind-merge")
          ) {
            return "vendor-ui";
          }

          if (id.includes("react-intersection-observer")) {
            return "vendor-observer";
          }

          if (id.includes("fuse.js")) {
            return "vendor-fuse";
          }

          const packageName = getNodeModulePackageName(id);

          if (!packageName) {
            return "vendor";
          }

          if (
            packageName === "cookie" ||
            packageName === "set-cookie-parser"
          ) {
            return undefined;
          }

          return `vendor-${packageName.replace("@", "").replace(/[\\/]/g, "-")}`;
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/library-assets": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
