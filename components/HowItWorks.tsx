const STEPS = [
  {
    title: "Every trade earns a fee",
    body: "Every trade of $STONK5 pays a creator fee, collected into a public engine wallet.",
  },
  {
    title: "Engine fills up",
    body: "Every 5 hours, or once the engine wallet holds 5 SOL — whichever comes first.",
  },
  {
    title: "Buys the top 5, burns, and locks",
    body: "90% of the round buys the current top 5 StonkFun tokens, 18% each. The other 10% goes back into $STONK5 — 5% burned, 5% locked away for 5 years.",
  },
  {
    title: "Holders get paid",
    body: (
      <>
        Holders of at least 50,000 $STONK5 (or $20 worth) at settlement get
        paid, weighted by how long they held. Check what you&apos;re owed at{" "}
        <a href="https://stonk5.com" target="_blank" rel="noreferrer" className="underline">
          stonk5.com
        </a>
        .
      </>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="wrap mt-16 sm:mt-22">
      <h2>How the engine works</h2>
      <p className="lead mt-2">Four steps, every round.</p>

      <div className="steps-grid mt-6">
        {STEPS.map((step, i) => (
          <div key={step.title} className="glass p-6">
            <div className="badge-n">{i + 1}</div>
            <h3 className="mt-4">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink2">{step.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 max-w-[70ch] text-[13px] leading-relaxed text-mute">
        A payout is held back until it&apos;s worth more than twice the rent
        of the account it lands in — below that it rolls into the next
        round instead of being sent as dust. Selling before a round settles
        forfeits that round&apos;s payout.
      </p>
    </section>
  );
}
