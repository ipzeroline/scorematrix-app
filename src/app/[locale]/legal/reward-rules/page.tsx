export default function RewardRulesPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-2xl font-bold font-display text-white mb-6">
        Reward Rules
      </h1>
      <p className="text-sm text-gray-400 mb-6">
        Understanding how points and rewards work on ScoreMatrix.
      </p>

      <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 mb-8">
        <h3 className="text-green-400 font-semibold text-sm mb-1">
          IMPORTANT DISCLAIMER
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed">
          ScoreMatrix is a <strong>skill-based prediction game</strong>. Free
          Prediction Points and Premium Credits have{" "}
          <strong>no cash value</strong>. They cannot be withdrawn, transferred,
          or exchanged for real money. This is not a gambling platform.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">
          Free Prediction Points (🟢)
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed mb-2">
          Earned through skill-based activities:
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-400 space-y-1">
          <li>Exact score prediction: 10 points</li>
          <li>Correct result + goal difference: 7 points</li>
          <li>Correct result only: 5 points</li>
          <li>Completing daily missions: 50-200 points</li>
          <li>Completing weekly missions: 200-500 points</li>
          <li>Unlocking achievements: 100-1000 points</li>
          <li>Streak bonus: +2 per consecutive correct prediction</li>
          <li>Combo multiplier: x1.5 for 5+ streak</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">
          Premium Credits (🟡)
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Optional purchase for exclusive cosmetic items, profile badges, and
          digital collectibles. Premium Credits are not required for core
          features and do not affect prediction scores.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">
          Reward Redemption
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed mb-2">
          Points can be redeemed for:
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-400 space-y-1">
          <li>Merchandise (jerseys, scarves, mugs)</li>
          <li>Digital goods (wallpapers, badges, themes)</li>
          <li>Cosmetic items (profile frames, animations)</li>
          <li>Vouchers (partner stores, gaming credit)</li>
        </ul>
        <p className="text-sm text-gray-500 mt-2">
          Physical rewards require shipping address. Shipping may take 7-21
          business days depending on region.
        </p>
      </section>
    </div>
  );
}
