import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { AtSign, Eye, EyeOff, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";
import { Logo } from "@/app/components/Logo";
import { useAuth } from "@/app/context/AuthContext";
import { extractApiError } from "@/app/lib/apiClient";

const schema = z.object({
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(50, "Max 50 characters"),
  email: z.string().email("Enter a valid email").max(100),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/[0-9]/, "Must include a number"),
});

type FormValues = z.infer<typeof schema>;

function strengthOf(pwd: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (pwd.length >= 14) score++;
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong", "Excellent", "Excellent"];
  const colors = [
    "bg-red-500",
    "bg-red-500",
    "bg-amber-500",
    "bg-amber-400",
    "bg-emerald-500",
    "bg-emerald-400",
    "bg-emerald-400",
  ];
  return { score, label: labels[score], color: colors[score] };
}

export function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onChange" });

  const pwd = watch("password") ?? "";
  const strength = strengthOf(pwd);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await registerUser(values);
      toast.success("Account created. Please sign in.");
      navigate("/login", { replace: true });
    } catch (err) {
      const msg = extractApiError(err, "Registration failed");
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
            <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
            <p className="text-sm text-[color:var(--color-muted)] mt-1">
              Start scanning in under a minute.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Username"
              autoComplete="username"
              leftIcon={<User className="h-4 w-4" />}
              error={errors.username?.message}
              {...register("username")}
            />
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
                autoComplete="new-password"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-[34px] text-[color:var(--color-muted)] hover:text-[color:var(--color-text)]"
                tabIndex={-1}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {pwd ? (
              <div>
                <div className="flex gap-1 mb-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded ${
                        i < Math.min(strength.score, 5)
                          ? strength.color
                          : "bg-[color:var(--color-card)]"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-[color:var(--color-muted)]">
                  Password strength:{" "}
                  <span className="text-[color:var(--color-text)] font-medium">
                    {strength.label}
                  </span>
                </p>
              </div>
            ) : null}

            {serverError ? (
              <div className="rounded-md border border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/10 px-3 py-2 text-xs text-[color:var(--color-danger)]">
                {serverError}
              </div>
            ) : null}

            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[color:var(--color-muted)]">
            Already have an account?{" "}
            <Link to="/login" className="text-[color:var(--color-primary-glow)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
