export default function WhaleCap() {
  return (
    <div className="glass p-6">
      <div className="label">Whale cap</div>
      <h3 className="mt-2">Hold more than 30,000,000? No rewards.</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink2">
        Wallets above 3% of supply earn zero rewards — their share goes to
        holders below the line, discouraging hoarding.
      </p>
      <div className="whale-bar mt-5" aria-hidden="true">
        <div className="ok" />
        <div className="no" />
      </div>
      <div className="mt-2 flex justify-between text-[13px] text-mute">
        <span>0</span>
        <span>30,000,000 (3%)</span>
        <span>Supply</span>
      </div>
    </div>
  );
}
