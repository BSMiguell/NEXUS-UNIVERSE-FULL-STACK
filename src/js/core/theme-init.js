(() => {
  try {
    const savedThemeRaw = localStorage.getItem("nexus_theme_13");
    if (!savedThemeRaw) return;

    const themeData = JSON.parse(savedThemeRaw);
    const colors = themeData?.colors;
    if (!colors || typeof colors !== "object") return;

    const root = document.documentElement;
    const cssVarMap = {
      primary: "--quantum-primary",
      secondary: "--quantum-secondary",
      accent: "--quantum-accent",
      danger: "--quantum-danger",
      success: "--quantum-success",
      warning: "--quantum-warning",
      textPrimary: "--text-primary",
      textSecondary: "--text-secondary",
      textAccent: "--text-accent",
      backgroundPrimary: "--background-primary",
      backgroundSecondary: "--background-secondary",
      borderPrimary: "--border-primary",
      borderSecondary: "--border-secondary",
      overlayBackground: "--overlay-background",
      glassBackground: "--glass-background",
      buttonBackground: "--button-background",
      skeletonBackground: "--skeleton-background",
    };

    Object.entries(cssVarMap).forEach(([key, cssVar]) => {
      const value = colors[key];
      if (typeof value === "string" && value.trim()) {
        root.style.setProperty(cssVar, value.trim());
      }
    });

    const hexToRgb = (hex) => {
      const normalized = String(hex || "").trim();
      const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
      if (!match) return { r: 0, g: 0, b: 0 };
      return {
        r: Number.parseInt(match[1], 16),
        g: Number.parseInt(match[2], 16),
        b: Number.parseInt(match[3], 16),
      };
    };

    const rgbToHex = (r, g, b) => {
      return `#${[r, g, b]
        .map((channel) =>
          Math.max(0, Math.min(255, channel)).toString(16).padStart(2, "0"),
        )
        .join("")}`;
    };

    const mixColors = (colorA, colorB, percentage) => {
      const rgbA = hexToRgb(colorA);
      const rgbB = hexToRgb(colorB);
      const ratio = percentage / 100;
      return rgbToHex(
        Math.round(rgbA.r + (rgbB.r - rgbA.r) * ratio),
        Math.round(rgbA.g + (rgbB.g - rgbA.g) * ratio),
        Math.round(rgbA.b + (rgbB.b - rgbA.b) * ratio),
      );
    };

    // Generate overlay background fallback and RGB helper, mirroring
    // applyTheme behaviour so all components using the variable stay
    // consistent when a saved theme lacks an explicit overlayBackground.
    if (!colors.overlayBackground && colors.backgroundSecondary) {
      const rgb = hexToRgb(colors.backgroundSecondary);
      root.style.setProperty(
        "--overlay-background",
        `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85)`,
      );
      root.style.setProperty(
        "--overlay-background-rgb",
        `${rgb.r}, ${rgb.g}, ${rgb.b}`,
      );
    } else if (colors.overlayBackground) {
      const match = String(colors.overlayBackground).match(
        /rgba?\((\d+),\s*(\d+),\s*(\d+)/,
      );
      if (match) {
        root.style.setProperty(
          "--overlay-background-rgb",
          `${match[1]}, ${match[2]}, ${match[3]}`,
        );
      }
    }

    if (colors.primary && colors.secondary && colors.accent && colors.danger) {
      root.style.setProperty(
        "--quantum-gradient",
        `linear-gradient(135deg, ${colors.primary} 0%, ${mixColors(colors.primary, colors.secondary, 25)} 25%, ${colors.secondary} 50%, ${colors.danger} 75%, ${colors.accent} 100%)`,
      );
    }

    if (colors.backgroundPrimary && colors.backgroundSecondary) {
      root.style.setProperty(
        "--dark-gradient",
        `linear-gradient(135deg, ${colors.backgroundPrimary} 0%, ${mixColors(colors.backgroundPrimary, colors.backgroundSecondary, 25)} 25%, ${colors.backgroundSecondary} 50%, ${mixColors(colors.backgroundSecondary, colors.backgroundPrimary, 75)} 75%, ${mixColors(colors.backgroundPrimary, colors.backgroundSecondary, 100)} 100%)`,
      );
    }

    // compute a simple slug from the stored name (spaces -> hyphens,
    // lowercase) so CSS can target any theme by name.
    const slug = String(themeData.name || "")
      .toLowerCase()
      .replace(/\s+/g, "-");
    if (slug) {
      // preserve legacy behaviour for the "light" theme
      if (slug === "modo-claro") {
        root.setAttribute("data-theme", "light");
      } else {
        root.setAttribute("data-theme", slug);
      }
    }

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (
      themeColorMeta &&
      typeof colors.backgroundPrimary === "string" &&
      colors.backgroundPrimary.trim()
    ) {
      themeColorMeta.setAttribute("content", colors.backgroundPrimary);
    }
  } catch (error) {
    // Nao bloqueia o carregamento se houver erro no localStorage.
  }
})();
