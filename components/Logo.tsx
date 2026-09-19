export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-5 ${className}`}>
      <span className="font-sans text-lg font-black tracking-tight text-navy-50">
        stonk5<span className="text-navy-500">.fyi</span>
      </span>
      <span className="font-sans text-xs text-navy-500">Unofficial</span>
    </div>
  );
}
