// Figma's corner smoothing, as a clip-path.
//
// CSS `border-radius` is a quarter circle. iOS corners are not: the curve
// starts further back along each edge and leans closer to the corner point,
// which is the whole reason a 32px iOS corner reads softer than a 32px CSS
// one at the same radius. Chrome 139+ has `corner-shape: superellipse()` for
// this, but it is a different curve family from Figma's and Safari support
// can't be verified from here — one shape that is identical on every device
// beats a nicer shape that only some of them draw.
//
// The construction (this is Figma's, and the numbers below are derived rather
// than copied, so they can be checked). For radius R and smoothing s, at one
// corner:
//
//   α       = 45s            the angle the arc's tangent makes with the edge
//   β       = 90(1 − s)      how much of the 90° arc survives, centred on the
//                            diagonal — at s = 0 the whole corner is the arc
//   p       = (1 + s)R       how far back along each edge the corner starts
//   arcLen  = R(cos α − sin α)   the arc's own Δx and Δy  [= R√2·sin(β/2)]
//
// Each side of the arc is a cubic that leaves the edge horizontally and
// arrives at the arc already pointing along its tangent, so there is no
// visible kink where they meet:
//
//   d = R(1 − cos α)         the arc endpoint's height above the edge
//   c = R·tan(α/2)·cos α     the run of the tangent segment into the arc
//   b = (p − arcLen − c − d)/3,  a = 2b     the two control points on the edge
//
// The identity that makes the last line work out: arcLen + d = R(1 − sin α),
// so 3b + c is exactly p − R(1 − sin α), which is the distance from the edge
// start to the arc's first point. At s = 0: α = 0, p = R, d = 0, c = 0,
// arcLen = R, b = 0 — the cubics collapse and it is a plain rounded corner.
//
// Only the top corners are smoothed here; the bottom of a sheet is off-screen.

const RAD = Math.PI / 180;

export function sheetSquirclePath({
  width,
  height,
  radius,
  smoothing,
}: {
  width: number;
  height: number;
  radius: number;
  smoothing: number;
}) {
  // Two corners have to fit across the top, and neither may reach the bottom.
  const budget = Math.min(width / 2, height);
  const r = Math.min(radius, budget / (1 + smoothing));

  if (r <= 0) return `M 0 0 H ${width} V ${height} H 0 Z`;

  const alpha = 45 * smoothing * RAD;
  const p = (1 + smoothing) * r;
  const arc = r * (Math.cos(alpha) - Math.sin(alpha));
  const d = r * (1 - Math.cos(alpha));
  const c = r * Math.tan(alpha / 2) * Math.cos(alpha);
  const b = (p - arc - c - d) / 3;
  const a = 2 * b;

  // The arc's two endpoints, in each corner's own frame. `near` is how far
  // that point sits from the edge the curve arrived on, and `d` — the same
  // number the cubic needed above, which is not a coincidence — how far it
  // sits from the other edge. So for the top-right corner the arc runs from
  // (w − near, d) to (w − d, near), and p = near + 3b + c closes the loop.
  const near = r - r * Math.sin(alpha);

  const n = (v: number) => Math.round(v * 100) / 100;

  return [
    // Up the left edge and around the top-left corner, which is the
    // top-right one below mirrored in x and walked backwards.
    `M 0 ${n(p)}`,
    `C 0 ${n(near + b + c)} 0 ${n(near + c)} ${n(d)} ${n(near)}`,
    `A ${n(r)} ${n(r)} 0 0 1 ${n(near)} ${n(d)}`,
    `C ${n(p - a - b)} 0 ${n(p - a)} 0 ${n(p)} 0`,
    // Top edge.
    `L ${n(width - p)} 0`,
    // Top-right corner: out of the edge horizontally, into the arc along its
    // own tangent, then back out to the right edge.
    `C ${n(width - p + a)} 0 ${n(width - p + a + b)} 0 ${n(width - near)} ${n(d)}`,
    `A ${n(r)} ${n(r)} 0 0 1 ${n(width - d)} ${n(near)}`,
    `C ${n(width)} ${n(near + c)} ${n(width)} ${n(near + b + c)} ${n(width)} ${n(p)}`,
    // Square bottom: a sheet's lower corners are past the edge of the screen.
    `L ${n(width)} ${n(height)}`,
    `L 0 ${n(height)}`,
    "Z",
  ].join(" ");
}
