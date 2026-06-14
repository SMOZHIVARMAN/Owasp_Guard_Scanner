import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { AtSign, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";
import { Logo } from "@/app/components/Logo";
import { useAuth } from "@/app/context/AuthContext";
import { extractApiError } from "@/app/lib/apiClient";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await login(values);
      toast.success("Welcome back");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = extractApiError(err, "Invalid credentials");
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen relative grid place-items-center px-4 bg-[color:var(--color-bg)] overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute inset-0 radial-glow" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="glass-strong rounded-2xl p-7 shadow-2xl shadow-blue-900/20">
          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-[color:var(--color-muted)] mt-1">
              Sign in to your OWASP GUARD console.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              leftIcon={<AtSign className="h-4 w-4" />}
              error={errors.email?.message}
              {...register("email")}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-[34px] text-[color:var(--color-muted)] hover:text-[color:var(--color-text)]"
                tabIndex={-1}
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {serverError ? (
              <div className="rounded-md border border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/10 px-3 py-2 text-xs text-[color:var(--color-danger)]">
                {serverError}
              </div>
            ) : null}

            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              <ShieldCheck className="h-4 w-4" />
              Sign in securely
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[color:var(--color-muted)]">
            New to OWASP GUARD?{" "}
            <Link
              to="/register"
              className="text-[color:var(--color-primary-glow)] hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-[color:var(--color-muted)]">
          Protected by JWT authentication. Use only on authorized targets.
        </p>
      </motion.div>
    </div>
  );
}
