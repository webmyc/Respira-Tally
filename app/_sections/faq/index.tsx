"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does Respira actually build my form?",
      answer:
        "Write a prompt like you'd message a teammate. Respira parses the intent, selects the right field types, adds logic, and hands you a polished Tally draft ready to review."
    },
    {
      question: "Do I need anything besides Respira?",
      answer:
        "You'll connect a free Tally.so account so we can publish straight to your workspace. Everything else — AI prompts, structure, copy — lives inside Respira."
    },
    {
      question: "Is it genuinely free?",
      answer:
        "Yes. The GitHub version is open source and always free to run. The hosted version follows Gumroad's spirit: start for free, tip what feels fair if it becomes part of your stack."
    },
    {
      question: "What kind of forms can I create?",
      answer:
        "Onboarding flows, client intake, product feedback, waitlists, internal ops, one-off experiments — if you can describe it, Respira can scaffold it in Tally."
    },
    {
      question: "Can I tweak the result in Tally afterwards?",
      answer:
        "Absolutely. You'll get a draft that already matches your structure, then you can adjust styling, add integrations, or layer in advanced logic directly inside Tally."
    },
    {
      question: "How is my data kept safe?",
      answer:
        "Respira never stores form responses. Everything is collected and processed within Tally's GDPR-compliant, enterprise-grade environment."
    }
  ];

  return (
    <section className="py-24 bg-[#fbf9f6]">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1fr] lg:items-start">
          <div className="max-w-xl">
            <span className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              FAQ
            </span>
            <h2 className="mt-6 text-3xl font-semibold text-zinc-900 md:text-4xl">
              Questions, meet answers
            </h2>
            <p className="mt-4 text-lg text-zinc-600">
              We built Respira after spending too many late nights wiring forms by hand. If you're wondering how it all
              comes together, start here.
            </p>
            <div className="mt-10 rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_22px_60px_-55px_rgba(15,23,42,0.6)]">
              <p className="text-sm font-semibold text-zinc-900">Need a deeper dive?</p>
              <p className="mt-2 text-sm text-zinc-600">
                Drop us a line at <a className="underline" href="mailto:hello@respira.cafe">hello@respira.cafe</a> and we'll
                help you build your first flow.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -top-28 -left-20 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
            <div className="relative overflow-hidden rounded-[32px] border border-zinc-200/80 bg-white/90 p-2 shadow-[0_28px_80px_-60px_rgba(15,23,42,0.65)] backdrop-blur">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;

                return (
                  <div key={faq.question} className="rounded-[28px] transition">
                    <button
                      className="flex w-full items-center justify-between rounded-[28px] px-6 py-5 text-left transition hover:bg-white/70"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      type="button"
                    >
                      <span className="text-base font-medium text-zinc-900">{faq.question}</span>
                      <ChevronDown
                        className={`h-5 w-5 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    <div
                      className={`grid overflow-hidden px-6 transition-all duration-300 ease-out ${
                        isOpen ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]"
                      }`}
                    >
                      <p className="text-sm leading-relaxed text-zinc-600">{faq.answer}</p>
                    </div>
                    {index !== faqs.length - 1 && (
                      <div className="mx-6 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
