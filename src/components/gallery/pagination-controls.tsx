import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Mostra os controles apenas se houver mais de uma página
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-4 py-8">
      <Button
        variant="outline"
        className="h-12 w-12 rounded-full p-0"
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <div className="font-display text-xl font-bold tracking-wider text-white">
        Página <span className="text-primary">{currentPage}</span> de{" "}
        {totalPages}
      </div>

      <Button
        variant="outline"
        className="h-12 w-12 rounded-full p-0"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
}
