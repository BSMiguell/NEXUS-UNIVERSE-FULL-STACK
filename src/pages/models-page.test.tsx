import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { ModelsPage } from "./models-page";

describe("ModelsPage", () => {
  it("should render the page title", () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <ModelsPage />
      </QueryClientProvider>,
    );

    expect(
      screen.getByRole("heading", { name: /modelos\s*3d/i }),
    ).toBeInTheDocument();
  });
});
