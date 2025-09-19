"use client";

import { CheckCircle, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pricing() {
  const githubPerks = [
    "Full source code access",
    "CLI and web interface",
    "Self-hosted deployment",
    "Complete customization"
  ];

  const onlinePerks = [
    "No installation required",
    "Guided web-based experience",
    "Instant form creation",
    "Native Tally integration"
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            Pricing
          </span>
          <h2 className="mt-6 text-3xl font-semibold text-zinc-900 md:text-4xl">
            Open source first, approachable for everyone
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            Respira keeps the Gumroad ethos — launch quickly, charge fairly, and invite your audience along for the ride.
            Choose the workflow that matches how you like to ship.
          </p>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div className="space-y-8">
            <div className="relative overflow-hidden rounded-[32px] border border-zinc-200/80 bg-[#fefbf6] p-10 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.65)]">
              <div className="pointer-events-none absolute -right-16 top-12 h-40 w-40 rounded-full bg-orange-200/40 blur-3xl" />
              <div className="pointer-events-none absolute -left-20 -top-12 h-32 w-32 rounded-full bg-rose-200/50 blur-3xl" />

              <div className="relative">
                <h3 className="text-2xl font-semibold text-zinc-900">GitHub (Free)</h3>
                <p className="mt-3 text-sm uppercase tracking-[0.3em] text-zinc-400">For makers & technical teams</p>
                <p className="mt-6 text-base text-zinc-600">
                  Pull the repo, run Respira locally, and fine-tune every detail. Ideal when you want maximum control over
                  workflow, hosting, and integrations.
                </p>
                <ul className="mt-8 space-y-3 text-sm text-zinc-600">
                  {githubPerks.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-10 w-full"
                  onClick={() => window.open("https://github.com/webmyc/Respira-Tally", "_blank")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Get started free
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-[0_20px_70px_-60px_rgba(15,23,42,0.55)]">
              <h3 className="text-lg font-semibold text-zinc-900">Support the roadmap</h3>
              <p className="mt-3 text-sm text-zinc-600">
                Respira is crafted nights and weekends. If it helps you ship faster, you can keep us caffeinated.
              </p>
              <a
                href="https://buymeacoffee.com/respira.buzz"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#ffd43b] px-5 py-2 font-semibold text-zinc-900 transition hover:brightness-105"
              >
                <span className="text-lg">☕</span>
                Buy us a coffee
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-zinc-200/80 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 p-10 text-white shadow-[0_35px_110px_-60px_rgba(15,23,42,0.75)]">
            <div className="pointer-events-none absolute -top-16 right-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-24 left-8 h-52 w-52 rounded-full bg-emerald-300/30 blur-3xl" />

            <div className="relative">
              <h3 className="text-2xl font-semibold">Online workspace</h3>
              <p className="mt-3 text-sm uppercase tracking-[0.3em] text-white/60">Non-technical friendly</p>
              <p className="mt-6 text-base text-white/80">
                Skip the local setup. Craft and publish forms from the browser with the same expressive prompt editor and
                smart defaults.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-white/80">
                {onlinePerks.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-10 w-full border border-white/20 bg-white/10 text-white shadow-none backdrop-blur transition hover:bg-white hover:text-zinc-900"
                onClick={() => document.getElementById("form-creator")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Try it online
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
