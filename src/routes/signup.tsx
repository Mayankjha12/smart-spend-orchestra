import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { Mail, Lock, User, Phone, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/signup")({ component: SignupPage });

const schema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  email: z.string().trim().email("Invalid email"),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile"),
  password: z.string().min(6, "Min 6 characters").max(72),
});

function SignupPage() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = schema.safeParse(form);
    if (!p.success) { setErr(p.error.issues[0].message); return; }
    signup(p.data);
    nav({ to: "/link-upi" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-10 items-center min-h-[70vh]">
      <div className="hidden lg:block fade-up">
        <h1 className="text-5xl font-bold leading-tight">Join <span className="gradient-text">Orchestra</span></h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-md">Three steps to smarter spending: sign up, link UPI, link bank. You're in control the whole time.</p>
        <div className="mt-8 space-y-3">
          {["Bank-grade OAuth 2.0 security", "Never moves your money", "Cancel anytime, export anytime"].map((t) => (
            <div key={t} className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full gradient-brand grid place-items-center text-white text-xs">✓</div>{t}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={submit} className="glass-strong rounded-3xl p-8 shadow-brand max-w-md w-full mx-auto fade-up">
        <h2 className="text-2xl font-bold">Create your account</h2>
        <p className="text-sm text-muted-foreground mt-1">Step 1 of 3</p>

        <div className="mt-6 space-y-4">
          <Field icon={User} placeholder="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field icon={Mail} type="email" placeholder="you@example.com" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field icon={Phone} type="tel" placeholder="10-digit mobile" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field icon={Lock} type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
        </div>

        {err && <div className="mt-4 text-sm text-destructive">{err}</div>}

        <button type="submit" className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full gradient-brand text-white font-semibold shadow-brand hover:scale-[1.01] transition">
          Continue <ArrowRight className="w-4 h-4" />
        </button>

        <p className="mt-4 text-sm text-center text-muted-foreground">
          Already have an account? <Link to="/login" className="text-brand font-semibold hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}

function Field({ icon: Icon, ...props }: { icon: any } & React.InputHTMLAttributes<HTMLInputElement> & { onChange: (v: string) => void; value: string }) {
  const { onChange, value, ...rest } = props;
  return (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
      />
    </div>
  );
}
