export default function Explainer() {
  return (
    <div className="rounded-2xl border border-navy-150 bg-white p-6 shadow-card">
      <h2 className="text-[11px] font-medium uppercase tracking-wider text-navy-500">
        What is STONK5?
      </h2>
      <p className="mt-2.5 text-[15px] leading-relaxed text-navy-800">
        STONK5 is the Top 5 index on StonkFun &mdash; it tracks the five
        biggest StonkFun tokens and pays them out to eligible holders.
      </p>
      <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-navy-800">
        <li className="flex gap-2">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-action" />
          <span>
            Every trade carries a 1% fee; half of that funds a public engine
            wallet as creator fees.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-action" />
          <span>
            Every 5 hours, or once that wallet holds 5 SOL, whichever comes
            first, the engine buys the current top 5 tokens and deposits
            them to STONK5 holders &mdash; check what you&apos;re owed
            anytime at stonk5.com.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-action" />
          <span>
            On top of the trade fee, 5% of every round&apos;s budget buys
            back and burns $STONK5 itself, shrinking supply faster than
            most tokens.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-action" />
          <span>
            Paired with SOL rather than a stablecoin, since most traders
            already hold and use it.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-action" />
          <span>
            Wallets holding more than 30,000,000 STONK5 (3% of supply) earn
            zero rewards &mdash; their share goes to holders below that
            line instead, discouraging whales from hoarding.
          </span>
        </li>
      </ul>
    </div>
  );
}
