"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { loginSchema, type LoginInput } from "@/lib/auth-schemas";
import { getZodMessage } from "@/lib/zod";
import { useAuthStore } from "@/store/use-auth-store";
import { useUIStore } from "@/store/use-ui-store";

export function NextLoginPage() {
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const pushToast = useUIStore((state) => state.pushToast);
  const [submitError, setSubmitError] = useState("");
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginInput>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const redirectTo = searchParams.get("redirectTo") || "/";

  const onSubmit = async (payload: LoginInput) => {
    try {
      setSubmitError("");
      await login(payload);
      pushToast({
        title: "Acesso autorizado",
        description: "Sessao iniciada com sucesso no Nexus Universe.",
        tone: "success",
      });
      window.location.assign(redirectTo);
    } catch (error) {
      const message = getZodMessage(
        error,
        "Nao foi possivel entrar. Verifique suas credenciais.",
      );
      setSubmitError(message);
      pushToast({
        title: "Falha na autenticacao",
        description: getZodMessage(
          error,
          "Verifique email e senha antes de tentar novamente.",
        ),
        tone: "error",
      });
    }
  };

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-xl"
      initial={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
    >
      <form className="quantum-panel rounded-[2.5rem] p-8" onSubmit={handleSubmit(onSubmit)}>
        <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
          Sessao segura
        </div>
        <h1 className="mt-3 font-display text-4xl uppercase tracking-[0.1em] text-white">
          Login
        </h1>
        <p className="mt-3 text-base text-slate-300/84">
          Entre para salvar favoritos no servidor e liberar as rotas de edicao.
        </p>

        <div className="mt-8 space-y-5">
          <AuthField error={errors.email?.message} label="Email">
            <input className="form-input" type="email" {...register("email")} />
          </AuthField>

          <AuthField error={errors.password?.message} label="Senha">
            <input className="form-input" type="password" {...register("password")} />
          </AuthField>
        </div>

        {submitError ? <p className="mt-4 text-sm text-red-300">{submitError}</p> : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button className="rounded-[1.1rem] px-6" disabled={isSubmitting} type="submit">
            <LogIn className="h-4 w-4" />
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
          <Link className="text-sm text-cyan-200 hover:text-cyan-100" href="/register">
            Criar nova conta
          </Link>
        </div>
      </form>
    </motion.section>
  );
}

function AuthField({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </div>
      {children}
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
    </label>
  );
}
