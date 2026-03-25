import { useState, useEffect } from "react";

/**
 * Hook customizado para "atrasar" a atualização de um valor.
 * Isso é útil para evitar chamadas excessivas de funções em eventos
 * como digitação em um campo de busca.
 *
 * @param value O valor que você quer "atrasar".
 * @param delay O tempo de atraso em milissegundos.
 * @returns O valor "atrasado".
 */
export function useDebounce<T>(value: T, delay: number): T {
  // Estado para armazenar o valor "atrasado"
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configura um temporizador para atualizar o valor "atrasado"
    // após o tempo de `delay` especificado.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Função de limpeza: cancela o temporizador se o valor ou o delay mudarem
    // antes que o tempo de `delay` tenha passado. Isso evita que o valor
    // antigo seja definido se um novo valor for fornecido.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Re-executa o efeito se o valor ou o delay mudarem

  return debouncedValue;
}
