// Nothing is lying on the index by default — and on a hard load of a note's
// own URL there is no index underneath to lie on, so the note renders as its
// own page (src/app/rndm/<slug>) and this slot stays empty.
export default function NoSheet() {
  return null;
}
