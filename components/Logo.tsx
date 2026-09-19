export default function Logo({
  className = "",
  imageUrl,
}: {
  className?: string;
  imageUrl?: string | null;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          width={26}
          height={26}
          className="h-[26px] w-[26px] rounded-full border border-white/[0.08] object-cover"
        />
      ) : (
        <div className="h-[26px] w-[26px] shrink-0 rounded-full border border-white/[0.08] bg-navy-800" />
      )}
      <span className="font-sans text-lg font-black tracking-tight text-navy-50">
        stonk5<span className="text-navy-500">.fyi</span>
      </span>
      <span className="font-sans text-xs text-navy-500">Unofficial</span>
    </div>
  );
}
