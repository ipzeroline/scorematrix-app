"use client";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold font-display text-white mb-2">
        Contact Us
      </h1>
      <p className="text-sm text-gray-400 mb-6">
        Have questions or feedback? We&apos;d love to hear from you.
      </p>

      {sent ? (
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6 text-center animate-slide-up">
          <p className="text-green-400 font-semibold mb-1">Message Sent!</p>
          <p className="text-sm text-gray-400">
            Thank you for contacting us. We&apos;ll get back to you within 24
            hours.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-800 bg-[#12121a] p-6 space-y-4"
        >
          <Input label="Name" placeholder="Your name" />
          <Input label="Email" type="email" placeholder="your@email.com" />
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Message
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-700 bg-[#0a0a0f] px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors min-h-[120px] resize-y"
              placeholder="Your message..."
              rows={4}
            />
          </div>
          <Button type="submit" size="lg" className="w-full">
            Send Message
          </Button>
        </form>
      )}
    </div>
  );
}
