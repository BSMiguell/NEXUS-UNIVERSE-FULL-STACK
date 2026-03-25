import { Button } from "@/components/ui/button";
import { loginSchema, type LoginInput } from "@/lib/auth-schemas";
import { getZodMessage } from "@/lib/zod";
import { useAuthStore } from "@/store/use-auth-store";
import { useUIStore } from "@/store/use-ui-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import { KeyRound, LogIn, Radar, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";

export function LoginPageView() {
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const login = useAuthStore(state => state.login);
  const pushToast = useUIStore(state => state.pushToast);
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

  const onSubmit = async (payload: LoginInput) => {
    try {
      setSubmitError("");
      await login(payload);
      pushToast({
        title: "Acesso autorizado",
        description: "Sessao iniciada com sucesso no Nexus Universe.",
        tone: "success",
      });
      const redirectTo = (router.query.redirectTo as string) || "/";
      await router.push(redirectTo);
    } catch (error) {
      const message = getZodMessage(error, "Nao foi possivel entrar. Verifique suas credenciais.");
      setSubmitError(message);
      pushToast({
        title: "Falha na autenticacao",
        description: getZodMessage(error, "Verifique email e senha antes de tentar novamente."),
        tone: "error",
      });
    }
  };

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-4xl"
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="cosmos-model-hero quantum-panel grid gap-6 overflow-hidden rounded-[2.5rem] p-5 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(56,189,248,0.18),transparent_20%),radial-gradient(circle_at_78%_22%,rgba(251,191,36,0.1),transparent_16%),radial-gradient(circle_at_62%_84%,rgba(45,212,191,0.12),transparent_18%)]" />

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-cyan-100/80 backdrop-blur-xl">
            <ShieldCheck className="h-4 w-4" />
            Capitulo V . Sessao segura
          </div>
          <h1 className="font-display text-[2.6rem] font-black uppercase leading-[0.92] tracking-[0.03em] text-white sm:text-6xl">
            Entrar no <span className="cosmos-title">nexus</span>
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-300/84">
            Acesse sua sessao para salvar favoritos, acompanhar sua colecao e manter o seu universo
            sincronizado entre todas as rotas.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <Signal
              icon={<Radar className="h-5 w-5" />}
              label="Sistema"
              value="Autenticacao online"
            />
            <Signal
              icon={<UserRound className="h-5 w-5" />}
              label="Colecao"
              value="Favoritos em nuvem"
            />
          </div>
        </div>

        <form
          className="cosmos-story-panel relative z-10 rounded-[2rem] p-6 sm:p-7"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
            Login
          </div>
          <h2 className="mt-2 font-display text-3xl uppercase tracking-[0.1em] text-white">
            Acesso
          </h2>
          <p className="mt-2 text-sm text-slate-300/82">
            Use seu email e senha para liberar o comando da sua base.
          </p>

          <div className="mt-6 space-y-4">
            <AuthField error={errors.email?.message} label="Email">
              <input
                className="cosmos-model-input w-full rounded-[1.1rem] px-4 py-3 text-white outline-none"
                type="email"
                {...register("email")}
              />
            </AuthField>

            <AuthField error={errors.password?.message} label="Senha">
              <input
                className="cosmos-model-input w-full rounded-[1.1rem] px-4 py-3 text-white outline-none"
                type="password"
                {...register("password")}
              />
            </AuthField>
          </div>

          {submitError ? <p className="mt-4 text-sm text-red-300">{submitError}</p> : null}

          <div className="mt-7 flex flex-col gap-3">
            <Button
              className="cosmos-primary-cta w-full rounded-[1.1rem] px-6"
              disabled={isSubmitting}
              type="submit"
            >
              <LogIn className="h-4 w-4" />
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
            <Link
              className="text-center text-sm text-cyan-200 transition hover:text-cyan-100"
              href="/register"
            >
              Criar nova conta
            </Link>
          </div>
        </form>
      </div>
    </motion.section>
  );
}

function AuthField({
  label,
  children,
  error,
}: {
  label: string;
  children: ReactNode;
  error?: string;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
        <KeyRound className="h-3.5 w-3.5 text-cyan-300/70" />
        {label}
      </div>
      {children}
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
    </label>
  );
}

function Signal({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="cosmos-signal-card">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-300/10 text-cyan-100">
        {icon}
      </div>
      <div className="mt-3 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/60">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold uppercase tracking-[0.1em] text-white">
        {value}
      </div>
    </div>
  );
}
