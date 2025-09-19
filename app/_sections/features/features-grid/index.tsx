import { Shield, Sparkles, Users, Zap } from "lucide-react";

export function FeaturesGrid() {
  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Describe it once",
      description:
        "Type your ideal form like you'd brief a teammate. Respira turns natural language into polished multi-step flows.",
      meta: "AI-first"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "See it in seconds",
      description:
        "Preview-ready Tally forms appear in moments — complete with logic, validations, and brand-friendly styling.",
      meta: "Fast launch"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Powered by Tally",
      description:
        "You keep the reliability you trust. Every Respira form runs on Tally's secure infrastructure by default.",
      meta: "Secure"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Ready for teamwork",
      description:
        "Share links with collaborators, collect feedback, and iterate together — no more juggling exports or embeds.",
      meta: "Collaboration"
    }
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-[36px] border border-zinc-200/80 bg-[#fdfbf8] px-6 py-16 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.55)] md:px-14">
          <div className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-blue-200/40 blur-3xl" />

          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              Made for calm shipping
            </span>
            <h2 className="mt-6 text-3xl font-semibold text-zinc-900 md:text-4xl">
              The workflow Gumroad creators expect, now for forms
            </h2>
            <p className="mt-4 text-lg text-zinc-600">
              Respira keeps the magic of your hero moment going — a warm, minimal interface that lets you focus on the
              story you're telling, not the plumbing underneath.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/80 p-8 text-left shadow-[0_22px_60px_-50px_rgba(15,23,42,0.65)] transition duration-300 ease-out hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_35px_80px_-45px_rgba(15,23,42,0.55)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    {feature.icon}
                  </div>
                  <span className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-400">
                    {feature.meta}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-zinc-900">{feature.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-zinc-600">{feature.description}</p>
                <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
                <div className="mt-6 text-sm text-zinc-400">
                  {index === 0 && "Draft high-converting forms without touching a field builder."}
                  {index === 1 && "Launch ideas the same day you have them — no hand-off, no backlog."}
                  {index === 2 && "Enterprise-grade privacy, GDPR compliance, and uptime handled for you."}
                  {index === 3 && "Keep everyone in sync with shared workspaces and simple permissions."}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
