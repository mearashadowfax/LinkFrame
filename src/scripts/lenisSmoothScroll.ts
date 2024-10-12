// import "@styles/lenis.css";
import Lenis from "lenis";

const lenis = new Lenis({
  lerp: 0.13,
});

function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);