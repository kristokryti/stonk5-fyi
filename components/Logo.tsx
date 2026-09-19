export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-baseline gap-3 ${className}`}>
      <span className="flex items-baseline font-serif text-[28px] leading-none text-navy-50">
        <span className="relative inline-flex h-[30px] w-[30px] items-center justify-center rounded-full border-[1.5px] border-sky-400 text-sky-400">
          5
        </span>
        <span className="ml-0.5 text-navy-400">.fyi</span>
      </span>
      <span className="font-sans text-xs text-navy-500">Unofficial</span>
    </div>
  );
}
