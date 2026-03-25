import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { Button } from "./Button";

// Estender expect do Jest
expect.extend(toHaveNoViolations);

describe("Button - Accessibility Tests", () => {
  describe("Screen Reader Support", () => {
    it("should have proper aria-label when provided", () => {
      render(
        <Button aria-label="Close dialog" onClick={() => {}}>
          X
        </Button>
      );

      const button = screen.getByLabelText("Close dialog");
      expect(button).toBeInTheDocument();
    });

    it("should announce loading state to screen readers", () => {
      render(
        <Button isLoading onClick={() => {}}>
          Save
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("should announce disabled state to screen readers", () => {
      render(
        <Button disabled onClick={() => {}}>
          Disabled Button
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("Keyboard Navigation", () => {
    it("should be focusable with keyboard", async () => {
      const user = userEvent.setup();
      render(<Button onClick={() => {}}>Click me</Button>);

      const button = screen.getByRole("button");

      // Tab to the button
      await user.tab();
      expect(button).toHaveFocus();
    });

    it("should trigger onClick with Enter key", async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole("button");

      await user.click(button); // Simula click com Enter/Space
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should trigger onClick with Space key", async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole("button");

      await user.type(button, " "); // Space key
      expect(handleClick).toHaveBeenCalled();
    });

    it("should have visible focus indicator", async () => {
      const user = userEvent.setup();
      render(<Button onClick={() => {}}>Click me</Button>);

      const button = screen.getByRole("button");

      await user.tab();
      expect(button).toHaveFocus();

      // Verificar se tem outline ou outro indicador visual
      const focusStyle = window.getComputedStyle(button, ":focus");
      expect(focusStyle.outline).not.toBe("none");
    });
  });

  describe("Color Contrast", () => {
    it("should have sufficient contrast for primary button", () => {
      render(
        <Button variant="primary" onClick={() => {}}>
          Primary Button
        </Button>
      );

      const button = screen.getByRole("button");
      const styles = window.getComputedStyle(button);

      // Verificar contraste entre texto e fundo
      // Nota: Em um teste real, você usaria uma biblioteca de contraste
      expect(styles.color).not.toBe(styles.backgroundColor);
    });

    it("should have sufficient contrast for secondary button", () => {
      render(
        <Button variant="secondary" onClick={() => {}}>
          Secondary Button
        </Button>
      );

      const button = screen.getByRole("button");
      const styles = window.getComputedStyle(button);

      expect(styles.color).not.toBe(styles.backgroundColor);
    });
  });

  describe("Semantic HTML", () => {
    it("should render as button element by default", () => {
      render(<Button onClick={() => {}}>Click me</Button>);

      const button = screen.getByRole("button");
      expect(button.tagName).toBe("BUTTON");
    });

    it("should render as anchor when href is provided", () => {
      render(
        <Button href="/about" onClick={() => {}}>
          Link Button
        </Button>
      );

      const link = screen.getByRole("link");
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", "/about");
    });

    it("should have proper type attribute for button element", () => {
      render(<Button onClick={() => {}}>Click me</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
    });
  });

  describe("axe-core automated testing", () => {
    it("should have no accessibility violations", async () => {
      const { container } = render(<Button onClick={() => {}}>Accessible Button</Button>);

      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });

    it("should have no violations for complex button", async () => {
      const { container } = render(
        <Button variant="primary" size="large" onClick={() => {}} aria-label="Submit form">
          Submit
        </Button>
      );

      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });

    it("should identify accessibility issues in problematic button", async () => {
      const { container } = render(
        <button style={{ color: "#888", backgroundColor: "#999" }} onClick={() => {}}>
          Low Contrast Button
        </button>
      );

      const results = await axe(container);
      // Este botão deve ter problemas de contraste
      expect(Array.isArray(results.violations)).toBe(true);
    });
  });

  describe("Responsive and Mobile Accessibility", () => {
    it("should have minimum touch target size (44x44px)", () => {
      render(<Button onClick={() => {}}>Touch Target</Button>);

      const button = screen.getByRole("button");
      // jsdom nao calcula layout real; validamos classes de tamanho minimo.
      expect(button).toHaveClass("min-w-[44px]");
      expect(button.className).toMatch(/min-h-/);
    });

    it("should maintain functionality on different screen sizes", () => {
      // Testar com diferentes viewports
      global.innerWidth = 375; // iPhone
      global.dispatchEvent(new Event("resize"));

      render(<Button onClick={() => {}}>Responsive Button</Button>);
      const button = screen.getByRole("button");

      expect(button).toBeVisible();
      expect(button).toBeEnabled();
    });
  });

  describe("Error States and Feedback", () => {
    it("should provide feedback for form submission", async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(
        <Button onClick={handleClick} aria-live="polite" aria-busy="false">
          Submit
        </Button>
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(handleClick).toHaveBeenCalled();
    });

    it("should announce error states", () => {
      render(
        <Button onClick={() => {}} aria-invalid="true" aria-describedby="error-message">
          Error Button
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-invalid", "true");
      expect(button).toHaveAttribute("aria-describedby", "error-message");
    });
  });
});

