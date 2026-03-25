import { useLayoutEffect, useState } from "react";

export function useResizeObserver<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
) {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      // entries[0] e a primeira (e unica) entrada observada
      if (entries[0]) {
        setWidth(entries[0].contentRect.width);
      }
    });

    observer.observe(element);

    // Funcao de limpeza para parar de observar quando o componente for desmontado
    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return width;
}
