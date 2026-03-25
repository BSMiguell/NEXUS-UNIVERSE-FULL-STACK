export function isWebGLSupported() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");

    return Boolean(gl && window.WebGLRenderingContext);
  } catch {
    return false;
  }
}
