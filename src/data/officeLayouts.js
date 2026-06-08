(function () {
  function layout(level) {
    const dims = [
      null,
      { cols: 24, rows: 14, desks: 3, className: "office-level-1" },
      { cols: 24, rows: 14, desks: 5, className: "office-level-2" },
      { cols: 26, rows: 15, desks: 8, className: "office-level-3" },
      { cols: 28, rows: 16, desks: 12, className: "office-level-4" },
      { cols: 30, rows: 17, desks: 18, className: "office-level-5" }
    ][level] || { cols: 24, rows: 14, desks: 3, className: "office-level-1" };

    return {
      ...dims,
      deskSlots: deskSlotsFor(dims.desks, dims.cols),
      zoneRects: zoneRectsFor(dims),
      zones: {
        entrance: { x: 2, y: dims.rows - 2 },
        kitchen: { x: dims.cols - 5, y: 3 },
        bathroom: { x: dims.cols - 5, y: dims.rows - 3 },
        study: { x: 4, y: dims.rows - 3 },
        meeting: { x: Math.floor(dims.cols / 2), y: dims.rows - 3 },
        trophy: { x: dims.cols - 9, y: dims.rows - 3 },
        home: { x: 1, y: dims.rows - 1 }
      },
      fixedFurniture: [
        { id: "companySign", x: 2, y: 0, w: 3, h: 1 },
        { id: "window", x: 7, y: 0, w: 2, h: 1 },
        { id: "window", x: 12, y: 0, w: 2, h: 1 },
        { id: "wallClock", x: dims.cols - 5, y: 0, w: 1, h: 1 },
        { id: "calendar", x: dims.cols - 3, y: 0, w: 1, h: 1 },
        { id: "chartPoster", x: Math.floor(dims.cols / 2) + 2, y: 0, w: 2, h: 1 },
        { id: "entranceDoor", x: 1, y: dims.rows - 1, w: 2, h: 1 },
        { id: "rug", x: Math.floor(dims.cols / 2) - 2, y: Math.floor(dims.rows / 2), w: 3, h: 2 },
        { id: "meetingTable", x: Math.floor(dims.cols / 2) - 1, y: Math.floor(dims.rows / 2) + 1, w: 3, h: 1 },
        { id: "planningBoard", x: Math.floor(dims.cols / 2) + 2, y: Math.floor(dims.rows / 2) + 1, w: 2, h: 1 },
        { id: "documentStack", x: Math.floor(dims.cols / 2) - 2, y: Math.floor(dims.rows / 2) + 1, w: 1, h: 1 },
        { id: "coffee", x: dims.cols - 5, y: 2, w: 1, h: 1 },
        { id: "kitchen", x: dims.cols - 4, y: 2, w: 3, h: 1 },
        { id: "fridge", x: dims.cols - 2, y: 3, w: 1, h: 1 },
        { id: "kitchenSink", x: dims.cols - 4, y: 3, w: 1, h: 1 },
        { id: "snackShelf", x: dims.cols - 6, y: 4, w: 1, h: 1 },
        { id: "diningTable", x: dims.cols - 4, y: 5, w: 2, h: 1 },
        { id: "stool", x: dims.cols - 5, y: 5, w: 1, h: 1 },
        { id: "bathroomDoor", x: dims.cols - 5, y: dims.rows - 3, w: 1, h: 1 },
        { id: "bathroomWall", x: dims.cols - 6, y: dims.rows - 4, w: 4, h: 1 },
        { id: "toiletSink", x: dims.cols - 4, y: dims.rows - 3, w: 2, h: 1 },
        { id: "mirror", x: dims.cols - 2, y: dims.rows - 4, w: 1, h: 1 },
        { id: "bookshelf", x: 1, y: dims.rows - 4, w: 2, h: 1 },
        { id: "studyTable", x: 3, y: dims.rows - 4, w: 2, h: 1 },
        { id: "studyLamp", x: 5, y: dims.rows - 4, w: 1, h: 1 },
        { id: "whiteboard", x: Math.floor(dims.cols / 2) - 2, y: dims.rows - 4, w: 3, h: 1 },
        { id: "projector", x: Math.floor(dims.cols / 2) + 2, y: dims.rows - 4, w: 1, h: 1 },
        { id: "filing", x: dims.cols - 7, y: dims.rows - 4, w: 1, h: 1 },
        { id: "awardShelf", x: dims.cols - 10, y: dims.rows - 4, w: 2, h: 1 },
        { id: "printer", x: 1, y: 4, w: 1, h: 1 },
        { id: "plant", x: 1, y: 2, w: 1, h: 1 },
        { id: level >= 2 ? "largePlant" : "plant", x: dims.cols - 2, y: 5, w: 1, h: level >= 2 ? 2 : 1 },
        ...(level >= 3 ? [{ id: "claimsServer", x: dims.cols - 8, y: 2, w: 2, h: 1 }] : []),
        ...(level >= 4 ? [{ id: "sofa", x: dims.cols - 8, y: dims.rows - 2, w: 2, h: 1 }] : []),
        ...(level >= 5 ? [{ id: "awardCabinet", x: dims.cols - 13, y: dims.rows - 4, w: 2, h: 1 }] : [])
      ]
    };
  }

  function deskSlotsFor(limit, cols) {
    const xs = cols >= 30 ? [3, 7, 11, 15, 19, 23] : cols >= 28 ? [3, 7, 11, 15, 19] : [3, 7, 11, 15];
    const ys = [3, 6, 9];
    const slots = [];
    ys.forEach(y => xs.forEach(x => slots.push({ id: `d${slots.length + 1}`, x, y })));
    return slots.slice(0, limit);
  }

  function zoneRectsFor(dims) {
    return [
      { id: "kitchen", x: dims.cols - 7, y: 1, w: 6, h: 6 },
      { id: "bathroom", x: dims.cols - 7, y: dims.rows - 5, w: 6, h: 4 },
      { id: "study", x: 1, y: dims.rows - 5, w: 7, h: 4 },
      { id: "awards", x: dims.cols - 13, y: dims.rows - 5, w: 6, h: 4 },
      { id: "meeting", x: Math.floor(dims.cols / 2) - 3, y: Math.floor(dims.rows / 2), w: 7, h: 4 },
      { id: "work", x: 2, y: 2, w: Math.min(dims.cols - 10, dims.cols >= 30 ? 24 : 17), h: Math.min(9, dims.rows - 6) }
    ];
  }

  window.OFFICE_LAYOUTS = { get: layout };
})();
