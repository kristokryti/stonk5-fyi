"use client";

function scrollToSection(id: string) {
  return (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
}

export default function Hero() {

  return (
    <section className="wrap pt-16 text-center sm:pt-24">
      <div className="pill-live mx-auto w-fit">
        <span className="dot-live" aria-hidden="true" />
        Live · Community tracker for the $STONK5 Index on StonkFun
      </div>

      <h1 className="mt-6">
        Your STONK5 payout,
        <br />
        <span className="grad-text">tracked live.</span>
      </h1>

      <p className="lead mx-auto mt-6 max-w-[700px]">
        Every 5 hours — or as soon as the engine wallet reaches 5 SOL — the
        engine buys StonkFun&apos;s top 5 tokens and sends them to wallets
        holding $STONK5.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a href="#your-rounds" onClick={scrollToSection("your-rounds")} className="btn btn-primary">
          Check my rewards
        </a>
        <a href="#how-it-works" onClick={scrollToSection("how-it-works")} className="btn btn-ghost">
          How it works
        </a>
      </div>
    </section>
  );
}
