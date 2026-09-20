const STEPS = [
  {
    title: "1% fee on every trade",
    body: "Half of the fee is paid to a public engine wallet as creator fees.",
  },
  {
    title: "Engine fills up",
    body: "Every 5 hours, or once the wallet holds 5 SOL — whichever comes first.",
  },
  {
    title: "Buys the top 5",
    body: "The engine buys the current top 5 StonkFun tokens with the round's budget.",
  },
  {
    title: "Holders get paid",
    body: (
      <>
        Tokens are deposited to eligible STONK5 holders. Check what you&apos;re
        owed at{" "}
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
    </section>
  );
}
