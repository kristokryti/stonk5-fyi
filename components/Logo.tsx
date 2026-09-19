export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="#6CD2F8" strokeWidth="1.6" opacity="0.55" />
        <circle cx="12" cy="12" r="6" stroke="#6CD2F8" strokeWidth="1.6" opacity="0.8" />
        <circle cx="12" cy="12" r="2.4" fill="#2563EB" />
      </svg>
      <span className="font-mono text-sm tracking-tight text-navy-300">
        <span className="text-navy-50">stonk5</span>.fyi
      </span>
      <span className="rounded-full border border-navy-600 bg-navy-800 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-navy-400">
        Unofficial
      </span>
    </div>
  );
}
