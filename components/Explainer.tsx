export default function Explainer() {
  return (
    <div className="rounded-xl border border-navy-700 bg-navy-800/60 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-400">
        What is STONK5?
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-navy-100">
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
