import { LINKS } from "@/lib/constants";

export default function PairedWithSol() {
  return (
    <div className="glass p-6">
      <div className="label">Paired with SOL</div>
      <h3 className="mt-2">Trade with what you already hold.</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink2">
        STONK5 is paired with SOL, which makes trading it fast, convenient
        and affordable.
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
  );
}
