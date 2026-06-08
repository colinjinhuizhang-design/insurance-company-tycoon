(function () {
  function getFurniture(id) {
    return window.FURNITURE_DATA[id] || { name: id, kind: "decor", glyph: "??", className: "unknown", effect: "" };
  }
  function furnitureTooltip(item, staffName) {
    const def = getFurniture(item.id);
    const assigned = staffName ? ` Assigned: ${staffName}.` : "";
    return `${def.name}. ${def.effect || ""}${assigned}`;
  }
  window.FurnitureSystem = { getFurniture, furnitureTooltip };
})();
