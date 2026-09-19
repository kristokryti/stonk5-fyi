export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="26" height="26" rx="7" fill="#1B2C42" />
        <defs>
          <linearGradient id="logoBars" x1="4" y1="19" x2="22" y2="6" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6DD3BE" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        <rect x="5" y="14" width="3.4" height="7" rx="1.2" fill="url(#logoBars)" />
        <rect x="10.3" y="10" width="3.4" height="11" rx="1.2" fill="url(#logoBars)" />
        <rect x="15.6" y="12.5" width="3.4" height="8.5" rx="1.2" fill="url(#logoBars)" />
        <rect x="20.9" y="5.5" width="3.4" height="15.5" rx="1.2" fill="url(#logoBars)" />
      </svg>
      <span className="text-[15px] font-semibold tracking-tight text-navy-900">
        stonk5<span className="font-normal text-navy-400">.fyi</span>
      </span>
      <span className="rounded-full border border-navy-200 bg-navy-100 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-navy-500">
        Unofficial
      </span>
    </div>
  );
}
