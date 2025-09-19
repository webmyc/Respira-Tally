export function Testimonials() {
  const testimonials = [
    {
      quote:
        "Respira mirrors the Gumroad vibe we love — calm interface, focused tooling, and a superpower that delivers finished forms in minutes instead of the usual all-nighter.",
      author: "Sarah Chen",
      role: "Marketing Director",
      company: "TechStart Inc.",
      initials: "SC"
    },
    {
      quote:
        "I spin up intake flows between sessions, send the link, and clients rave about how smooth everything feels. I finally stopped copying fields from old templates.",
      author: "Dr. Michael Rodriguez",
      role: "Licensed Therapist",
      company: "Wellness Center",
      initials: "MR"
    },
    {
      quote:
        "Event registrations, sponsor forms, VIP check-in — the prompts feel conversational and the Tally hand-off is instant. My team collaborates without a learning curve.",
      author: "Emily Johnson",
      role: "Event Coordinator",
      company: "Creative Events Co.",
      initials: "EJ"
    }
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="max-w-xl">
            <span className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              Testimonials
            </span>
            <h2 className="mt-6 text-3xl font-semibold text-zinc-900 md:text-4xl">
              Makers who traded busywork for breathing room
            </h2>
            <p className="mt-4 text-lg text-zinc-600">
              Respira keeps the surface polished so your brand shines through. Behind the scenes, it's a dependable
              system that keeps teams aligned and launches on schedule.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_22px_60px_-55px_rgba(15,23,42,0.65)]">
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">74%</p>
                <p className="mt-3 text-sm text-zinc-600">of teams we onboarded launched their first Respira form within the first afternoon.</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_22px_60px_-55px_rgba(15,23,42,0.65)]">
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">3× faster</p>
                <p className="mt-3 text-sm text-zinc-600">Average speed-up compared to manually building the same flows directly in Tally.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.author}
                className={`relative overflow-hidden rounded-[28px] border border-zinc-200/80 bg-white/90 p-8 shadow-[0_20px_70px_-60px_rgba(15,23,42,0.65)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_45px_110px_-70px_rgba(15,23,42,0.65)] ${
                  index === 0 ? "sm:col-span-2" : ""
                }`}
              >
                <div className="pointer-events-none absolute -top-20 -right-10 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                      {testimonial.initials}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-zinc-900">{testimonial.author}</p>
                      <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">{testimonial.role}</p>
                      <p className="text-xs text-zinc-400">{testimonial.company}</p>
                    </div>
                  </div>
                  <blockquote className="mt-6 text-base leading-relaxed text-zinc-600">
                    “{testimonial.quote}”
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
