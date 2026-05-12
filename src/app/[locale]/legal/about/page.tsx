export default function AboutPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-2xl font-bold font-display text-white mb-6">
        About ScoreMatrix
      </h1>

      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5 mb-8">
        <p className="text-lg font-display font-semibold text-cyan-400 mb-2">
          Predict. Compete. Win.
        </p>
        <p className="text-sm text-gray-300 leading-relaxed">
          The ultimate skill-based football prediction platform. No gambling —
          pure skill and knowledge.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">Our Mission</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          ScoreMatrix was built to create a fun, competitive environment for
          football fans to test their prediction skills. We believe that
          knowledge of the beautiful game should be rewarded — not with
          gambling, but with real merchandise, digital goods, and community
          recognition.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
          {[
            {
              step: "1",
              title: "Predict",
              desc: "Analyze matches and submit your score predictions before kickoff.",
            },
            {
              step: "2",
              title: "Compete",
              desc: "Earn points for accurate predictions. Build streaks and climb the leaderboard.",
            },
            {
              step: "3",
              title: "Win",
              desc: "Redeem points for merchandise, digital goods, and exclusive rewards.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-gray-800 bg-[#12121a] p-4 text-center"
            >
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                {item.step}
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">
          Our Commitment
        </h2>
        <ul className="list-disc pl-5 text-sm text-gray-400 space-y-2">
          <li>
            <strong className="text-white">Fair Play:</strong> AI-powered
            insights give everyone equal access to match analysis.
          </li>
          <li>
            <strong className="text-white">No Gambling:</strong> Points have no
            cash value. This is a skill game, not a betting platform.
          </li>
          <li>
            <strong className="text-white">Transparency:</strong> All scoring
            rules are public. No hidden algorithms.
          </li>
          <li>
            <strong className="text-white">Community:</strong> Private leagues,
            leaderboards, and social features bring fans together.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">Team</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          ScoreMatrix is built by a team of football enthusiasts, data
          scientists, and software engineers who believe in the power of
          predictive analytics combined with the passion of football fandom.
        </p>
      </section>
    </div>
  );
}
