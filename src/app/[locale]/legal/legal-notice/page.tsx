export default function LegalNoticePage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-2xl font-bold font-display text-white mb-6">
        Legal Notice
      </h1>

      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 mb-8">
        <p className="text-sm text-gray-300 leading-relaxed font-medium">
          <strong className="text-red-400">IMPORTANT:</strong> ScoreMatrix is a
          <strong> skill-based prediction platform</strong> for entertainment
          purposes. No real money wagering is permitted. Free Prediction Points
          and Premium Credits have <strong>no cash value</strong> and cannot be
          withdrawn as currency. This platform does not constitute gambling
          under applicable laws.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">
          No Gambling Declaration
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          ScoreMatrix explicitly declares that it is not a gambling or betting
          platform. Users do not wager real money. All predictions are made
          using skill and knowledge. Points earned are for entertainment and
          redemption of merchandise only.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">
          Jurisdiction
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Users are responsible for ensuring their use of ScoreMatrix complies
          with local laws and regulations. If prediction games are restricted in
          your jurisdiction, please do not use this platform.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">
          Intellectual Property
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          ScoreMatrix, its logo, and all original content are protected by
          copyright and trademark laws. Team names used are fictional.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">
          Third-Party Content
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Match data and statistics are provided for informational purposes
          only. ScoreMatrix does not guarantee the accuracy of third-party data.
        </p>
      </section>
    </div>
  );
}
