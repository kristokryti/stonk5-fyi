// Plain-Node assertions for lib/format.ts's priceParts() — no test runner is
// configured in this repo, so this script is the price-formatter unit test
// required by the Aurora brief (§7/§16). Run with: node scripts/test-price-parts.mjs
//
// This inlines the same logic as lib/format.ts's priceParts() rather than
// importing it, to avoid pulling in the TS toolchain for a one-off script —
// keep the two in sync if the formatter changes.
function priceParts(p) {
  if (!Number.isFinite(p) || p <= 0) return { text: "—" };
  if (p >= 1) return { text: "$" + p.toLocaleString("en-US", { maximumFractionDigits: 2 }) };
  if (p >= 0.01) return { text: "$" + p.toFixed(4) };
  const [m, e] = p.toExponential(3).split("e");
  const digits = m.replace(".", "").replace(/0+$/, "") || "0";
  const zeros = -Number(e) - 1;
  if (zeros < 3) return { text: "$0." + "0".repeat(zeros) + digits };
  return { pre: "$0.0", zeros, digits };
}

const cases = [
  { input: 0.00007171, expect: { pre: "$0.0", zeros: 4, digits: "7171" } },
  { input: 0.00004535, expect: { pre: "$0.0", zeros: 4, digits: "4535" } },
  { input: 0.0000004188, expect: { pre: "$0.0", zeros: 6, digits: "4188" } },
  { input: 0.0042, expect: { text: "$0.0042" } },
  { input: 0.5, expect: { text: "$0.5000" } },
  { input: 12.3456, expect: { text: "$12.35" } },
  { input: 0, expect: { text: "—" } },
  { input: NaN, expect: { text: "—" } },
];

let failures = 0;
for (const { input, expect } of cases) {
  const actual = priceParts(input);
  const ok = JSON.stringify(actual) === JSON.stringify(expect);
  if (!ok) {
    failures++;
    console.error(`FAIL priceParts(${input}) = ${JSON.stringify(actual)}, expected ${JSON.stringify(expect)}`);
  } else {
    console.log(`ok   priceParts(${input}) = ${JSON.stringify(actual)}`);
  }
}

if (failures > 0) {
  console.error(`${failures} of ${cases.length} price formatter cases failed.`);
  process.exit(1);
}
console.log(`All ${cases.length} price formatter cases passed.`);
