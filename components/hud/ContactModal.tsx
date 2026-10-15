"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Check, Copy, Lock, Mail, Phone, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { formatPhone } from "@/lib/format";
import { useHud } from "../hud-context";
import { GithubIcon, LinkedinIcon } from "../ui/BrandIcons";
import { HudButton } from "../ui/HudButton";
import { Modal } from "../ui/Modal";
import { StatusDot } from "../ui/StatusDot";

const STAGES = [
  "Encrypting payload · AES-256-GCM",
  "Negotiating uplink",
  "Handshake verified",
  "Transmitting packets",
];

type Phase = "compose" | "sending" | "sent";

function CopyField({ label, value, href, icon }: { label: string; value: string; href: string; icon: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-3 border border-line bg-obsidian-800 p-3">
      <span className="text-cyan-neon">{icon}</span>
      <a href={href} className="min-w-0 flex-1">
        <span className="label block">{label}</span>
        <span className="block truncate font-mono text-sm text-white hover:text-cyan-neon">{value}</span>
      </a>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            /* clipboard blocked — link still works */
          }
        }}
        className="p-1.5 text-fog transition-colors hover:text-cyan-neon"
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check size={14} className="text-phosphor" /> : <Copy size={14} />}
      </button>
    </div>
  );
}

export function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data } = useHud();
  const { settings } = data;
  const [phase, setPhase] = useState<Phase>("compose");
  const [stage, setStage] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [touched, setTouched] = useState(false);

  const errors = {
    name: form.name.trim().length < 2 ? "Callsign required" : "",
    email: /^\S+@\S+\.\S+$/.test(form.email) ? "" : "Valid return address required",
    message: form.message.trim().length < 10 ? "Payload must be at least 10 characters" : "",
  };
  const valid = !errors.name && !errors.email && !errors.message;

  // Reset after the close animation finishes.
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      setPhase("compose");
      setStage(0);
      setTouched(false);
    }, 400);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (phase !== "sending") return;
    if (stage >= STAGES.length) {
      setPhase("sent");
      return;
    }
    const t = setTimeout(() => setStage((s) => s + 1), 650);
    return () => clearTimeout(t);
  }, [phase, stage]);

  const mailto = `mailto:${settings.email}?subject=${encodeURIComponent(`Portfolio transmission from ${form.name}`)}&body=${encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`)}`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setStage(0);
    setPhase("sending");
  };

  const field = "w-full border bg-obsidian-800 px-3 py-2.5 font-mono text-sm text-white placeholder:text-fog/50 outline-none transition-colors focus:border-cyan-neon focus:shadow-[0_0_0_1px_#00f0ff33]";

  return (
    <Modal open={open} onClose={onClose} title="Secure transmission" code="UPLINK-06">
      <div className="grid md:grid-cols-5">
        <aside className="space-y-3 border-b border-line p-5 md:col-span-2 md:border-b-0 md:border-r sm:p-6">
          <div className="label mb-4 flex items-center gap-2 text-phosphor">
            <Lock size={12} /> direct channels
          </div>
          {settings.email && (
            <CopyField label="email" value={settings.email} href={`mailto:${settings.email}`} icon={<Mail size={16} />} />
          )}
          {settings.phone && (
            <CopyField
              label="voice"
              value={formatPhone(settings.phone)}
              href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
              icon={<Phone size={16} />}
            />
          )}
          {(
            [
              ["github", settings.githubUrl, <GithubIcon key="g" size={16} className="text-cyan-neon" />],
              ["linkedin", settings.linkedinUrl, <LinkedinIcon key="l" size={16} className="text-cyan-neon" />],
              ["blog", settings.blogUrl, <BookOpen key="b" size={16} className="text-cyan-neon" />],
            ] as const
          ).map(
            ([label, url, icon]) =>
              url && (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-3 border border-line bg-obsidian-800 p-3 hover:border-cyan-neon/50"
                >
                  {icon}
                  <span className="min-w-0">
                    <span className="label block">{label}</span>
                    <span className="block truncate font-mono text-sm text-white">{url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</span>
                  </span>
                </a>
              ),
          )}
          {settings.workStatus && (
            <div className="flex items-center gap-3 border border-phosphor/30 bg-phosphor/5 p-3">
              <StatusDot />
              <span>
                <span className="label block">work authorization</span>
                <span className="block font-mono text-sm text-phosphor">{settings.workStatus}</span>
              </span>
            </div>
          )}
        </aside>

        <div className="p-5 md:col-span-3 sm:p-6">
          <AnimatePresence mode="wait">
            {phase === "compose" && (
              <motion.form key="compose" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {(
                  [
                    ["name", "Callsign", "Your name", "text", "name"],
                    ["email", "Return frequency", "you@company.com", "email", "email"],
                  ] as const
                ).map(([key, label, ph, type, auto]) => (
                  <label key={key} className="block">
                    <span className="label mb-1.5 block">{label}</span>
                    <input
                      type={type}
                      autoComplete={auto}
                      value={form[key]}
                      placeholder={ph}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className={cn(field, touched && errors[key] ? "border-alert/70" : "border-line")}
                      aria-invalid={touched && !!errors[key]}
                    />
                    {touched && errors[key] && <span className="mt-1 block font-mono text-[11px] text-alert">! {errors[key]}</span>}
                  </label>
                ))}
                <label className="block">
                  <span className="label mb-1.5 block">Payload</span>
                  <textarea
                    rows={5}
                    value={form.message}
                    placeholder="Role, team, timeline…"
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className={cn(field, "resize-y", touched && errors.message ? "border-alert/70" : "border-line")}
                    aria-invalid={touched && !!errors.message}
                  />
                  {touched && errors.message && <span className="mt-1 block font-mono text-[11px] text-alert">! {errors.message}</span>}
                </label>
                <div className="flex items-center justify-between gap-4 pt-2">
                  <span className="label hidden sm:block">{form.message.length} bytes</span>
                  <button
                    type="submit"
                    className="chamfer-sm inline-flex items-center gap-2 border border-cyan-neon/60 bg-cyan-neon/10 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-cyan-neon transition-all hover:bg-cyan-neon hover:text-obsidian hover:shadow-glow-cyan"
                  >
                    <Send size={14} /> Transmit
                  </button>
                </div>
              </motion.form>
            )}

            {phase === "sending" && (
              <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-6 font-mono text-sm" role="status" aria-live="polite">
                {STAGES.map((s, i) => (
                  <div key={s} className={cn("flex items-center gap-3 py-1.5 transition-opacity", i <= stage ? "opacity-100" : "opacity-25")}>
                    <span className={i < stage ? "text-phosphor" : "text-cyan-neon"}>{i < stage ? "[ok]" : i === stage ? "[..]" : "[  ]"}</span>
                    <span className={i < stage ? "text-fog-light" : "text-white"}>{s}</span>
                  </div>
                ))}
                <div className="mt-6 h-1 bg-white/5">
                  <motion.div className="h-full bg-cyan-neon shadow-[0_0_10px_#00f0ff]" animate={{ width: `${(stage / STAGES.length) * 100}%` }} />
                </div>
              </motion.div>
            )}

            {phase === "sent" && (
              <motion.div key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-4" role="status">
                <div className="mb-4 flex h-12 w-12 items-center justify-center border border-phosphor bg-phosphor/10 text-phosphor shadow-glow-green">
                  <Check size={22} />
                </div>
                <h3 className="font-display text-2xl font-semibold uppercase text-white">Packet staged</h3>
                <p className="mt-2 text-sm leading-relaxed text-fog-light">
                  Encryption theatrics complete. This channel is simulated — finish the handoff through your mail client and your message
                  lands directly in my inbox, pre-filled.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <HudButton variant="green" href={mailto} icon={<Mail size={14} />}>
                    Deliver via mail client
                  </HudButton>
                  <HudButton onClick={() => setPhase("compose")}>Edit payload</HudButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
}
