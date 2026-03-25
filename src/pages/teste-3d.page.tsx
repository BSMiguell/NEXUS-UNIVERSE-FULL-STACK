import dynamic from "next/dynamic";
import { NextPageShell } from "@/next-app/next-page-shell";

const Cena3DBasica = dynamic(
  () =>
    import("@/components/testes/Cena3DBasica").then((module) => module.Cena3DBasica),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 w-full items-center justify-center bg-black/40 text-xs uppercase tracking-[0.22em] text-cyan-200/80">
        Carregando modulo 3D...
      </div>
    ),
  },
);

export default function Teste3DPage() {
  return (
    <NextPageShell>
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-8 text-center text-4xl font-bold">Teste 3D - Nexus Universe</h1>
          <div className="overflow-hidden rounded-lg bg-black shadow-2xl">
            <Cena3DBasica />
          </div>
          <div className="mt-8 text-center">
            <p className="text-gray-300">Use o mouse para rotacionar, zoom e explorar!</p>
          </div>
        </div>
      </div>
    </NextPageShell>
  );
}
