import { LINKS } from "@/lib/constants";

export default function BuyButton() {
  return (
    <a
      href={LINKS.stonkfun}
      target="_blank"
      rel="noreferrer"
      className="flex w-full items-center justify-center rounded-xl bg-accent px-5 py-3 text-center text-base font-semibold text-navy-950 shadow-lg shadow-accent/20 transition hover:bg-accent-hover hover:text-white sm:w-auto"
    >
      Buy $STONK5 on StonkFun
    </a>
  );
}
