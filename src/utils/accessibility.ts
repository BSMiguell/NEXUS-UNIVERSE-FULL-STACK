import { axe, toHaveNoViolations } from "jest-axe";

// Estender expect do Jest com matchers do jest-axe
expect.extend(toHaveNoViolations);

/**
 * Executa testes de acessibilidade usando axe-core
 * @param container - Elemento HTML para testar
 * @returns Promise com resultados dos testes
 */
export async function testAccessibility(container: HTMLElement) {
  const results = await axe(container);
  return results;
}

/**
 * Verifica se um componente tem violações de acessibilidade
 * @param container - Elemento HTML para testar
 * @throws Error se houver violações
 */
export async function expectNoAccessibilityViolations(container: HTMLElement) {
  const results = await testAccessibility(container);

  if (results.violations.length > 0) {
    const violationsText = results.violations
      .map(
        violation => `
        ${violation.description}
        Impacto: ${violation.impact}
        Elementos afetados: ${violation.nodes.length}
        Ajuda: ${violation.help}
        ${violation.helpUrl}
      `
      )
      .join("\n---\n");

    throw new Error(`
      🚨 Violações de acessibilidade encontradas:
      ${violationsText}
    `);
  }

  return true;
}

/**
 * Testa navegação por teclado em um elemento
 * @param element - Elemento para testar
 * @param expectedTabOrder - Ordem esperada dos elementos tabuláveis
 */
export function testKeyboardNavigation(element: HTMLElement, expectedTabOrder?: string[]) {
  const tabbableElements = element.querySelectorAll(
    'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  // Verificar se elementos são acessíveis por teclado
  tabbableElements.forEach((el, index) => {
    const htmlEl = el as HTMLElement;

    // Verificar tabindex
    const tabIndex = htmlEl.getAttribute("tabindex");
    if (tabIndex && parseInt(tabIndex) < 0) {
      throw new Error(`Elemento ${el.tagName} tem tabindex negativo`);
    }

    // Verificar se é visível
    const style = window.getComputedStyle(htmlEl);
    if (style.display === "none" || style.visibility === "hidden") {
      throw new Error(`Elemento ${el.tagName} não está visível`);
    }

    // Verificar ordem de tabulação
    if (expectedTabOrder) {
      const expected = expectedTabOrder[index];
      if (htmlEl.textContent !== expected && htmlEl.getAttribute("aria-label") !== expected) {
        console.warn(`Ordem de tabulação inesperada no índice ${index}`);
      }
    }
  });

  return tabbableElements.length;
}

/**
 * Testa contraste de cores entre foreground e background
 * @param foreground - Cor do texto (hex, rgb, etc)
 * @param background - Cor do fundo (hex, rgb, etc)
 * @param fontSize - Tamanho da fonte em px
 * @param fontWeight - Peso da fonte
 * @returns true se o contraste é suficiente
 */
export function testColorContrast(
  foreground: string,
  background: string,
  fontSize: number = 16,
  fontWeight: number = 400
): boolean {
  // Função simplificada para calcular contraste
  // Em produção, use uma biblioteca como 'color-contrast' ou 'wcag-contrast'

  function getLuminance(color: string): number {
    // Conversão simplificada - em produção use uma biblioteca adequada
    const rgb = color.match(/\d+/g)?.map(Number) || [255, 255, 255];
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  const lum1 = getLuminance(foreground);
  const lum2 = getLuminance(background);
  const contrast = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);

  // Critérios WCAG 2.1
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
  const requiredContrast = isLargeText ? 3 : 4.5;

  return contrast >= requiredContrast;
}

/**
 * Testa atributos ARIA obrigatórios para elementos interativos
 * @param element - Elemento para testar
 */
export function testAriaAttributes(element: HTMLElement) {
  const errors: string[] = [];

  // Verificar elementos com role
  const role = element.getAttribute("role");
  if (role) {
    switch (role) {
      case "button":
        if (!element.hasAttribute("aria-label") && !element.hasAttribute("aria-labelledby")) {
          errors.push('Elemento com role="button" precisa de aria-label ou aria-labelledby');
        }
        break;
      case "img":
        if (!element.hasAttribute("alt") && !element.hasAttribute("aria-label")) {
          errors.push('Elemento com role="img" precisa de alt ou aria-label');
        }
        break;
      case "navigation":
        if (!element.hasAttribute("aria-label")) {
          errors.push('Elemento com role="navigation" deve ter aria-label');
        }
        break;
    }
  }

  // Verificar formulários
  const inputs = element.querySelectorAll("input, select, textarea");
  inputs.forEach(input => {
    const htmlInput = input as HTMLElement;
    if (!htmlInput.hasAttribute("aria-label") && !htmlInput.hasAttribute("aria-labelledby")) {
      if (!htmlInput.querySelector("label")) {
        errors.push(`Input ${input.id || "sem-id"} precisa de label ou aria-label`);
      }
    }
  });

  if (errors.length > 0) {
    throw new Error(`Problemas de ARIA encontrados:\n${errors.join("\n")}`);
  }

  return true;
}

/**
 * Testa se a página tem estrutura semântica adequada
 */
export function testSemanticStructure() {
  const errors: string[] = [];

  // Verificar se existe main
  const main = document.querySelector("main");
  if (!main) {
    errors.push("Página deve ter um elemento <main>");
  }

  // Verificar se existe nav
  const nav = document.querySelector("nav");
  if (!nav) {
    errors.push("Página deve ter um elemento <nav> para navegação");
  }

  // Verificar se existe footer
  const footer = document.querySelector("footer");
  if (!footer) {
    errors.push("Página deve ter um elemento <footer>");
  }

  // Verificar heading hierarchy
  const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  let previousLevel = 0;
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1));
    if (level > previousLevel + 1) {
      errors.push(`Hierarquia de headings incorreta: ${heading.tagName} após H${previousLevel}`);
    }
    previousLevel = level;
  });

  if (errors.length > 0) {
    console.warn("⚠️ Problemas de estrutura semântica:", errors);
  }

  return errors.length === 0;
}
