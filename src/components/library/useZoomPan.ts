"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

export type ViewBox = { x: number; y: number; w: number; h: number };

const DRAG_THRESHOLD_PX = 5;
const ANIMATION_MS = 380;

function toSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
  return { x: p.x, y: p.y };
}

/**
 * SVG の viewBox を書き換えてズーム・パンする。
 * ホイール／ピンチで拡大縮小、ドラッグで移動、animateTo で指定範囲へ寄る。
 * ドラッグした直後のクリックは wasDragged() で見分けられる。
 */
export function useZoomPan(svgRef: RefObject<SVGSVGElement | null>, home: ViewBox) {
  const [viewBox, setViewBox] = useState(home);
  const current = useRef(home);
  const animation = useRef<number | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ dragging: false, startX: 0, startY: 0, pinchDist: 0 });
  const dragged = useRef(false);

  const apply = useCallback((vb: ViewBox) => {
    current.current = vb;
    setViewBox(vb);
  }, []);

  const stopAnimation = () => {
    if (animation.current != null) cancelAnimationFrame(animation.current);
    animation.current = null;
  };

  const zoomAt = useCallback(
    (factor: number, at?: { x: number; y: number }) => {
      stopAnimation();
      const vb = current.current;
      const p = at ?? { x: vb.x + vb.w / 2, y: vb.y + vb.h / 2 };
      // 倍率に上限・下限は設けない
      const f = factor;
      apply({ x: p.x - (p.x - vb.x) * f, y: p.y - (p.y - vb.y) * f, w: vb.w * f, h: vb.h * f });
    },
    [apply],
  );

  const animateTo = useCallback(
    (target: ViewBox) => {
      stopAnimation();
      const from = current.current;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return apply(target);
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min((now - start) / ANIMATION_MS, 1);
        const e = 1 - (1 - t) ** 3;
        const lerp = (a: number, b: number) => a + (b - a) * e;
        apply({
          x: lerp(from.x, target.x),
          y: lerp(from.y, target.y),
          w: lerp(from.w, target.w),
          h: lerp(from.h, target.h),
        });
        animation.current = t < 1 ? requestAnimationFrame(step) : null;
      };
      animation.current = requestAnimationFrame(step);
    },
    [apply],
  );

  // ホイールはページのスクロールを止める必要があるので passive: false で登録する
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.exp(e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0015));
      zoomAt(factor, toSvgPoint(svg, e.clientX, e.clientY));
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [svgRef, zoomAt]);

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    stopAnimation();
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (pointers.current.size === 1) {
      dragged.current = false;
      g.dragging = false;
      g.startX = e.clientX;
      g.startY = e.clientY;
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      g.pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    const prev = pointers.current.get(e.pointerId);
    if (!svg || !prev) return;
    const g = gesture.current;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (g.pinchDist > 0) {
        const mid = toSvgPoint(svg, (a.x + b.x) / 2, (a.y + b.y) / 2);
        zoomAt(g.pinchDist / dist, mid);
      }
      g.pinchDist = dist;
      dragged.current = true;
      return;
    }

    if (!g.dragging) {
      if (Math.hypot(e.clientX - g.startX, e.clientY - g.startY) < DRAG_THRESHOLD_PX) return;
      // ここまで来て初めてキャプチャする（クリックの宛先を変えないため）
      g.dragging = true;
      dragged.current = true;
      svg.setPointerCapture(e.pointerId);
    }
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const vb = current.current;
    apply({
      ...vb,
      x: vb.x - (e.clientX - prev.x) / ctm.a,
      y: vb.y - (e.clientY - prev.y) / ctm.d,
    });
  };

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current.pinchDist = 0;
    if (pointers.current.size === 0) gesture.current.dragging = false;
  };

  return {
    viewBox,
    zoomAt,
    animateTo,
    wasDragged: () => dragged.current,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}
