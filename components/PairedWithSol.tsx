import Image from "next/image";
import { LINKS } from "@/lib/constants";

export default function PairedWithSol() {
  return (
    <div className="glass flex flex-col items-center gap-6 p-6 sm:flex-row sm:justify-between">
      <div className="min-w-0">
        <div className="label">Paired with SOL</div>
        <h3 className="mt-2">Trade with what you already hold.</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink2">
          STONK5 is paired with SOL, which makes trading fast, convenient and
          affordable.
        </p>
        <a
          href={LINKS.stonkfun}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost btn-sm mt-5"
        >
          Trade $STONK5 ↗
        </a>
      </div>
      <Image
        src="/stonk5-logo-badge.png"
        alt="STONK5"
        width={72}
        height={72}
        className="shrink-0 rounded-full"
      />
    </div>
  );
}
