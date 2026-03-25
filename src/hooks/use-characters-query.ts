import {
  type InfiniteData,
  type UseInfiniteQueryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createCharacter,
  deleteCharacter,
  getCharacterById,
  getCharactersPage,
  getCharacters,
  type CharactersFilters,
  updateCharacter,
} from "@/services/characters";
import {
  type Character,
  type CharacterInput,
  type CharactersPage,
} from "@/types/character";

export const CHARACTERS_QUERY_KEY = ["characters"] as const;
export const INFINITE_CHARACTERS_QUERY_KEY = ["characters", "infinite"] as const;
const PAGE_SIZE = 12;

function characterQueryKey(id: number) {
  return [...CHARACTERS_QUERY_KEY, id] as const;
}

function infiniteCharactersQueryKey(filters: CharactersFilters) {
  return [...INFINITE_CHARACTERS_QUERY_KEY, filters] as const;
}

function mergeCharacterList(
  current: Character[] | undefined,
  incoming: Character,
) {
  if (!current) {
    return [incoming];
  }

  const next = current.filter((character) => character.id !== incoming.id);
  next.unshift(incoming);
  return next;
}

function removeCharacterFromList(current: Character[] | undefined, id: number) {
  if (!current) {
    return current;
  }

  return current.filter((character) => character.id !== id);
}

type InfiniteCharactersOptions = Pick<
  UseInfiniteQueryOptions<
    CharactersPage,
    Error,
    InfiniteData<CharactersPage>,
    ReturnType<typeof infiniteCharactersQueryKey>,
    number
  >,
  "enabled"
>;

export function useCharactersQuery() {
  return useQuery<Character[], Error>({
    queryKey: CHARACTERS_QUERY_KEY,
    queryFn: getCharacters,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useCharacterQuery(id: number, enabled = true) {
  return useQuery<Character, Error>({
    queryKey: characterQueryKey(id),
    queryFn: () => getCharacterById(id),
    enabled: enabled && Number.isFinite(id) && id > 0,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useInfiniteCharactersQuery(
  filters: CharactersFilters = {},
  options: InfiniteCharactersOptions = {},
) {
  return useInfiniteQuery<
    CharactersPage,
    Error,
    InfiniteData<CharactersPage>,
    ReturnType<typeof infiniteCharactersQueryKey>,
    number
  >({
    queryKey: infiniteCharactersQueryKey(filters),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getCharactersPage(pageParam, PAGE_SIZE, filters),
    getNextPageParam: (lastPage) => {
      return lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined;
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: options.enabled,
  });
}

export function useCharactersPageQuery(
  page: number,
  limit = PAGE_SIZE,
  filters: CharactersFilters = {},
  enabled = true,
) {
  return useQuery<CharactersPage, Error>({
    queryKey: [...CHARACTERS_QUERY_KEY, "page", page, limit, filters],
    queryFn: () => getCharactersPage(page, limit, filters),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled,
  });
}

export function useCreateCharacterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CharacterInput) => createCharacter(payload),
    onSuccess: (createdCharacter) => {
      queryClient.setQueryData<Character[]>(
        CHARACTERS_QUERY_KEY,
        (current) => mergeCharacterList(current, createdCharacter),
      );
      void queryClient.invalidateQueries({ queryKey: CHARACTERS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: INFINITE_CHARACTERS_QUERY_KEY,
      });
    },
  });
}

export function useUpdateCharacterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: CharacterInput;
    }) => updateCharacter(id, payload),
    onSuccess: (updatedCharacter) => {
      queryClient.setQueryData<Character[]>(
        CHARACTERS_QUERY_KEY,
        (current) => mergeCharacterList(current, updatedCharacter),
      );
      queryClient.setQueryData<Character>(
        characterQueryKey(updatedCharacter.id),
        updatedCharacter,
      );
      void queryClient.invalidateQueries({ queryKey: CHARACTERS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: INFINITE_CHARACTERS_QUERY_KEY,
      });
    },
  });
}

export function useDeleteCharacterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCharacter(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Character[]>(
        CHARACTERS_QUERY_KEY,
        (current) => removeCharacterFromList(current, deletedId),
      );
      queryClient.removeQueries({ queryKey: characterQueryKey(deletedId) });
      void queryClient.invalidateQueries({ queryKey: CHARACTERS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: INFINITE_CHARACTERS_QUERY_KEY,
      });
    },
  });
}
