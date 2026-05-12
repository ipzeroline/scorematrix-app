"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Is ScoreMatrix a gambling platform?",
    a: "No. ScoreMatrix is a skill-based football prediction game for entertainment. No real money is wagered. Points have no cash value and cannot be withdrawn.",
  },
  {
    q: "How do I earn Free Prediction Points?",
    a: "You earn points by predicting match outcomes correctly, completing daily and weekly missions, unlocking achievements, and maintaining prediction streaks.",
  },
  {
    q: "What are Premium Credits?",
    a: "Premium Credits are an optional purchase for exclusive cosmetic items, profile badges, and digital collectibles. They are not required for core platform features.",
  },
  {
    q: "Can I withdraw Free Points as real money?",
    a: "No. Free Prediction Points have no cash value. They cannot be withdrawn, transferred, or exchanged for real money. They can only be redeemed for merchandise and digital goods in our Rewards catalog.",
  },
  {
    q: "How are prediction points calculated?",
    a: "Exact score = 10pts, correct result + goal difference = 7pts, correct result only = 5pts. Streak bonuses add +2pts per consecutive correct prediction, and a x1.5 combo multiplier applies at 5+ streak.",
  },
  {
    q: "When do predictions lock?",
    a: "Predictions lock at the scheduled kickoff time of each match. You must submit your prediction before kickoff.",
  },
  {
    q: "How do I redeem rewards?",
    a: "Go to the Rewards page, browse the catalog, and click 'Redeem' on any item you have enough points for. Physical rewards require shipping information.",
  },
  {
    q: "How long does shipping take?",
    a: "Physical rewards typically ship within 3-5 business days and arrive within 7-21 business days depending on your region.",
  },
  {
    q: "Can I create a private league?",
    a: "Yes! Anyone can create a private league and invite friends using the invite code. Leagues can have up to 50 members.",
  },
  {
    q: "What languages are supported?",
    a: "ScoreMatrix supports 6 languages: English, Thai, Chinese, Japanese, Korean, and Vietnamese.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      <h1 className="text-2xl font-bold font-display text-white mb-6">FAQ</h1>
      <div className="space-y-2">
        {FAQS.map((faq, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-800 bg-[#12121a] overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-sm font-medium text-white pr-4">
                {faq.q}
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-500 shrink-0 transition-transform ${
                  openIndex === i ? "rotate-180" : ""
                }`}
              />
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4 animate-slide-up">
                <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
