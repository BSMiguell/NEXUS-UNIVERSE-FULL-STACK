import type { Character } from "@/types/character";

export type BattleSkinOption = {
  id: string;
  image: string;
  isDefault?: boolean;
  label: string;
  tag: string;
};

const aatroxMech = new URL(
  "../../Site-antigos/assets/Skins/Aatrox/Mech-Aatrox.png",
  import.meta.url,
).href;
const aatroxBloodMoon = new URL(
  "../../Site-antigos/assets/Skins/Aatrox/Aatrox-Lua-Sangrenta-de-Prestígio.png",
  import.meta.url,
).href;
const aatroxDrx = new URL(
  "../../Site-antigos/assets/Skins/Aatrox/Aatrox-DRX.png",
  import.meta.url,
).href;
const dariusDunkmaster = new URL(
  "../../Site-antigos/assets/Skins/Darius/Darius-Mestre-da-Enterrada.png",
  import.meta.url,
).href;
const dariusSpiritBlossom = new URL(
  "../../Site-antigos/assets/Skins/Darius/Darius-Florescer-Espiritual.png",
  import.meta.url,
).href;
const dariusGodKing = new URL(
  "../../Site-antigos/assets/Skins/Darius/Deus-Rei-Darius.png",
  import.meta.url,
).href;
const dariusGodKingDivine = new URL(
  "../../Site-antigos/assets/Skins/Darius/Deus-Rei-Darius-Divino.png",
  import.meta.url,
).href;
const goldenSpermPlatinum = new URL(
  "../../Site-antigos/assets/Skins/Golden-Sperm/Platinum-Sperm.png",
  import.meta.url,
).href;

const battleSkinLibrary: Record<string, BattleSkinOption[]> = {
  AATROX: [
    { id: "aatrox-default", image: "", isDefault: true, label: "Padrao", tag: "Base" },
    { id: "aatrox-mech", image: aatroxMech, label: "Mech Aatrox", tag: "Skin" },
    {
      id: "aatrox-blood-moon",
      image: aatroxBloodMoon,
      label: "Lua Sangrenta de Prestigio",
      tag: "Prestigio",
    },
    { id: "aatrox-drx", image: aatroxDrx, label: "Aatrox DRX", tag: "Esports" },
  ],
  DARIUS: [
    { id: "darius-default", image: "", isDefault: true, label: "Padrao", tag: "Base" },
    {
      id: "darius-dunkmaster",
      image: dariusDunkmaster,
      label: "Mestre da Enterrada",
      tag: "Skin",
    },
    {
      id: "darius-spirit-blossom",
      image: dariusSpiritBlossom,
      label: "Florescer Espiritual",
      tag: "Skin",
    },
    { id: "darius-god-king", image: dariusGodKing, label: "Deus Rei", tag: "Lendaria" },
    {
      id: "darius-god-king-divine",
      image: dariusGodKingDivine,
      label: "Deus Rei Divino",
      tag: "Mythic",
    },
  ],
  "GOLDEN SPERM": [
    {
      id: "golden-sperm-default",
      image: "",
      isDefault: true,
      label: "Padrao",
      tag: "Base",
    },
    {
      id: "golden-sperm-platinum",
      image: goldenSpermPlatinum,
      label: "Platinum Sperm",
      tag: "Skin",
    },
  ],
};

export function getBattleSkinOptions(character?: Character | { image: string; name: string } | null) {
  if (!character) {
    return [];
  }

  const options = battleSkinLibrary[character.name.toUpperCase()] ?? [];

  if (options.length === 0) {
    return [
      {
        id: `${normalizeId(character.name)}-default`,
        image: character.image,
        isDefault: true,
        label: "Padrao",
        tag: "Base",
      },
    ];
  }

  return options.map((option) => ({
    ...option,
    image: option.isDefault ? character.image : option.image,
  }));
}

function normalizeId(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
