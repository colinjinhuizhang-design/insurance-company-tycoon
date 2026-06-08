(function () {
  function buildOfficeLayout(state) {
    const layout = window.OFFICE_LAYOUTS.get(state.office || 1);
    const ownedDesks = ownedDeskIds(state);
    const assignedDeskTypes = assignDeskTypes(state.staff || [], ownedDesks);
    const deskSlots = layout.deskSlots.slice(0, Math.max(ownedDesks.length, state.staff?.length || 0)).map((slot, index) => {
      const staff = state.staff?.[index];
      const deskType = assignedDeskTypes[index] || ownedDesks[index] || "basicDesk";
      return { ...slot, index, staffId: staff?.id || null, deskType, interaction: { x: slot.x, y: slot.y + 1 } };
    });
    const deskFurniture = deskSlots.flatMap(slot => [
      { id: slot.deskType, x: slot.x, y: slot.y, w: 2, h: 1, staffId: slot.staffId, deskSlotId: slot.id },
      { id: "chair", x: slot.x, y: slot.y + 1, w: 1, h: 1, staffId: slot.staffId, deskSlotId: slot.id },
      { id: "computer", x: slot.x + 1, y: slot.y, w: 1, h: 1, staffId: slot.staffId, deskSlotId: slot.id }
    ]);
    const extraFurniture = ownedFurnitureItems(state, layout);
    return { ...layout, deskSlots, furniture: [...layout.fixedFurniture, ...deskFurniture, ...extraFurniture] };
  }
  function ownedDeskIds(state) {
    const deskIds = new Set(["basicDesk", ...Object.values(window.ROLE_DESK_BY_ROLE || {})]);
    return (state.equipment || []).filter(id => deskIds.has(id));
  }
  function assignDeskTypes(staffList, ownedDesks) {
    const used = new Set();
    const assigned = [];
    staffList.forEach(staff => {
      const preferred = window.ROLE_DESK_BY_ROLE?.[staff.role];
      let index = ownedDesks.findIndex((id, i) => !used.has(i) && id === preferred);
      if (index < 0) index = ownedDesks.findIndex((id, i) => !used.has(i) && id === "basicDesk");
      if (index < 0) index = ownedDesks.findIndex((_, i) => !used.has(i));
      if (index >= 0) {
        used.add(index);
        assigned.push(ownedDesks[index]);
      }
    });
    ownedDesks.forEach((id, index) => {
      if (!used.has(index)) assigned.push(id);
    });
    return assigned;
  }
  function ownedFurnitureItems(state, layout) {
    const deskIds = new Set(["basicDesk", ...Object.values(window.ROLE_DESK_BY_ROLE || {})]);
    const fixedCounts = layout.fixedFurniture.reduce((counts, item) => {
      counts[item.id] = (counts[item.id] || 0) + 1;
      return counts;
    }, {});
    const seenCounts = {};
    const extras = [];
    const slots = placementSlots(layout);
    (state.equipment || []).forEach(id => {
      if (deskIds.has(id) || !window.FURNITURE_DATA[id]) return;
      seenCounts[id] = (seenCounts[id] || 0) + 1;
      if (seenCounts[id] <= (fixedCounts[id] || 0)) return;
      const slot = slots[extras.length % slots.length];
      const def = window.FURNITURE_DATA[id];
      extras.push({ id, x: slot.x, y: slot.y, w: def.width || slot.w || 1, h: def.height || slot.h || 1, ownedExtra: true });
    });
    return extras;
  }
  function placementSlots(layout) {
    const c = layout.cols;
    const r = layout.rows;
    return [
      { x: 2, y: 3 }, { x: c - 4, y: 6 }, { x: c - 11, y: 2 }, { x: 2, y: r - 6 },
      { x: c - 14, y: r - 3 }, { x: 6, y: 2 }, { x: c - 3, y: r - 6 }, { x: 10, y: r - 2 },
      { x: c - 16, y: 2 }, { x: 2, y: 6 }, { x: c - 6, y: 8 }, { x: 14, y: 2 }
    ];
  }
  window.OfficeLayoutSystem = { buildOfficeLayout, ownedDeskIds, ownedFurnitureItems, assignDeskTypes };
})();
