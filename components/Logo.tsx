export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`text-[28px] leading-none tracking-[-0.02em] ${className}`}>
      <span className="font-semibold text-ink">stonk5</span>
      <span className="font-medium text-mute">.fyi</span>
    </span>
  );
}
