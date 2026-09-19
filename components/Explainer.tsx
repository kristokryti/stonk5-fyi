export default function Explainer() {
  return (
    <div className="rounded-2xl border border-navy-700/60 bg-navy-800/50 p-6 shadow-card">
      <h2 className="text-[11px] font-medium uppercase tracking-wider text-navy-400">
        What is STONK5?
      </h2>
      <p className="mt-2.5 text-[15px] leading-relaxed text-navy-100">
        STONK5 is an index token tracking the five biggest StonkFun tokens by
        market cap. Every trade generates a creator fee that collects in a
        public on-chain wallet. Once that reaches 5 SOL, or every 5 hours,
        whichever comes first, the engine runs a round: 95% buys the current
        top 5 tokens and pays them out to holders by weight and hold time,
        and 5% buys back and burns $STONK5 itself.
      </p>
    </div>
  );
}
