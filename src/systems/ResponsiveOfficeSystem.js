(function () {
  function normalizeView(view) {
    return {
      zoom: clampNumber(view?.zoom, 0.75, 1.6, 1),
      panX: Math.max(0, Number(view?.panX) || 0),
      panY: Math.max(0, Number(view?.panY) || 0)
    };
  }

  function applyView(view, viewport, office) {
    if (!viewport || !office) return normalizeView(view);
    const next = normalizeView(view);
    office.style.zoom = String(next.zoom);
    viewport.dataset.zoom = next.zoom.toFixed(2);
    if (Math.abs(viewport.scrollLeft - next.panX) > 1) viewport.scrollLeft = next.panX;
    if (Math.abs(viewport.scrollTop - next.panY) > 1) viewport.scrollTop = next.panY;
    return next;
  }

  function adjustZoom(view, delta) {
    const next = normalizeView(view);
    next.zoom = clampNumber(Math.round((next.zoom + delta) * 20) / 20, 0.75, 1.6, 1);
    return next;
  }

  function resetView() {
    return { zoom: 1, panX: 0, panY: 0 };
  }

  function bindPan(viewport, onPan) {
    if (!viewport || viewport.dataset.panBound === "true") return;
    viewport.dataset.panBound = "true";
    let drag = null;
    viewport.addEventListener("pointerdown", event => {
      if (event.target.closest("button")) return;
      drag = {
        x: event.clientX,
        y: event.clientY,
        left: viewport.scrollLeft,
        top: viewport.scrollTop
      };
      viewport.classList.add("panning");
      viewport.setPointerCapture?.(event.pointerId);
    });
    viewport.addEventListener("pointermove", event => {
      if (!drag) return;
      viewport.scrollLeft = drag.left - (event.clientX - drag.x);
      viewport.scrollTop = drag.top - (event.clientY - drag.y);
      onPan?.(viewport.scrollLeft, viewport.scrollTop);
    });
    const stop = event => {
      if (!drag) return;
      drag = null;
      viewport.classList.remove("panning");
      viewport.releasePointerCapture?.(event.pointerId);
      onPan?.(viewport.scrollLeft, viewport.scrollTop);
    };
    viewport.addEventListener("pointerup", stop);
    viewport.addEventListener("pointercancel", stop);
  }

  function clampNumber(value, min, max, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  window.ResponsiveOfficeSystem = { normalizeView, applyView, adjustZoom, resetView, bindPan };
})();
