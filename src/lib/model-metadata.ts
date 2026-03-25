export function getModelFileName(modelPath?: string) {
  if (!modelPath) {
    return "indisponivel";
  }

  return modelPath.split("/").pop() ?? modelPath;
}

export function getModelExtension(modelPath?: string) {
  const fileName = getModelFileName(modelPath);
  const extension = fileName.split(".").pop();
  return extension ? extension.toUpperCase() : "N/A";
}

export function getModelLibrary(modelPath?: string) {
  if (!modelPath) {
    return "Sem biblioteca";
  }

  if (modelPath.includes("Modelo3D")) {
    return "Biblioteca Nexus";
  }

  return "Colecao externa";
}

export function getModelReadinessLabel(modelPath?: string) {
  if (!modelPath) {
    return "offline";
  }

  if (modelPath.toLowerCase().endsWith(".glb")) {
    return "glb online";
  }

  return "asset detectado";
}
