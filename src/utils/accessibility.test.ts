import { describe, expect, it } from "vitest";
import {
  expectNoAccessibilityViolations,
  testAccessibility,
  testAriaAttributes,
  testColorContrast,
  testKeyboardNavigation,
  testSemanticStructure,
} from "./accessibility";

describe("Accessibility Utils", () => {
  it("returns accessibility results", async () => {
    const button = document.createElement("button");
    button.textContent = "Click me";
    document.body.appendChild(button);

    const results = await testAccessibility(button);

    expect(results).toBeDefined();
    expect(Array.isArray(results.violations)).toBe(true);

    document.body.removeChild(button);
  });

  it("resolves expectNoAccessibilityViolations for valid element", async () => {
    const button = document.createElement("button");
    button.textContent = "Click me";
    document.body.appendChild(button);

    await expect(expectNoAccessibilityViolations(button)).resolves.toBe(true);

    document.body.removeChild(button);
  });

  it("counts tabbable elements", () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <button>Button 1</button>
      <a href="#">Link</a>
      <input type="text" aria-label="Input" />
    `;
    document.body.appendChild(container);

    const count = testKeyboardNavigation(container);
    expect(count).toBe(3);

    document.body.removeChild(container);
  });

  it("throws for hidden tabbable elements", () => {
    const container = document.createElement("div");
    container.innerHTML = `<button style="display: none">Hidden Button</button>`;
    document.body.appendChild(container);

    expect(() => testKeyboardNavigation(container)).toThrow();

    document.body.removeChild(container);
  });

  it("validates expected tab order", () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <button>First</button>
      <button>Second</button>
      <button>Third</button>
    `;
    document.body.appendChild(container);

    const count = testKeyboardNavigation(container, ["First", "Second", "Third"]);
    expect(count).toBe(3);

    document.body.removeChild(container);
  });

  it("validates high contrast as accessible", () => {
    const isAccessible = testColorContrast("rgb(0,0,0)", "rgb(255,255,255)");
    expect(isAccessible).toBe(true);
  });

  it("validates low contrast as not accessible", () => {
    const isAccessible = testColorContrast("rgb(120,120,120)", "rgb(130,130,130)");
    expect(isAccessible).toBe(false);
  });

  it("passes aria validation for labeled elements", () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <button aria-label="Close dialog">X</button>
      <input aria-label="Search" />
    `;
    document.body.appendChild(container);

    expect(testAriaAttributes(container)).toBe(true);

    document.body.removeChild(container);
  });

  it("returns false semantic structure when key landmarks are missing", () => {
    document.body.innerHTML = `<div>no landmarks</div>`;
    expect(testSemanticStructure()).toBe(false);
    document.body.innerHTML = "";
  });

  it("returns true semantic structure when landmarks exist", () => {
    document.body.innerHTML = `
      <nav>Navigation</nav>
      <main><h1>Title</h1></main>
      <footer>Footer</footer>
    `;
    expect(testSemanticStructure()).toBe(true);
    document.body.innerHTML = "";
  });
});
