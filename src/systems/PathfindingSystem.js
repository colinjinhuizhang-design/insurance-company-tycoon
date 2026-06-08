(function () {
  function manhattanPath(from, to) {
    const path = [];
    let x = Math.round(from.x);
    let y = Math.round(from.y);
    const tx = Math.round(to.x);
    const ty = Math.round(to.y);
    path.push({ x, y });
    while (x !== tx) {
      x += x < tx ? 1 : -1;
      path.push({ x, y });
    }
    while (y !== ty) {
      y += y < ty ? 1 : -1;
      path.push({ x, y });
    }
    return path;
  }

  function officePath(from, to, layout) {
    if (!layout) return manhattanPath(from, to);
    const start = pointKey(roundPoint(from));
    const goalPoint = roundPoint(to);
    const goal = pointKey(goalPoint);
    const blocked = blockedTiles(layout, goal);
    const queue = [roundPoint(from)];
    const cameFrom = new Map([[start, null]]);
    const dirs = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}];

    while (queue.length) {
      const current = queue.shift();
      const currentKey = pointKey(current);
      if (currentKey === goal) return rebuildPath(cameFrom, currentKey);
      for (const dir of dirs) {
        const next = { x: current.x + dir.x, y: current.y + dir.y };
        const nextKey = pointKey(next);
        if (cameFrom.has(nextKey)) continue;
        if (next.x < 1 || next.y < 1 || next.x > layout.cols - 2 || next.y > layout.rows - 2) continue;
        if (blocked.has(nextKey) && nextKey !== goal) continue;
        cameFrom.set(nextKey, currentKey);
        queue.push(next);
      }
    }

    return manhattanPath(from, to);
  }

  function blockedTiles(layout, goalKey) {
    const blocked = new Set();
    (layout.furniture || []).forEach(item => {
      const def = window.FURNITURE_DATA?.[item.id];
      if (def?.walkable) return;
      const w = Math.max(1, Math.round(item.w || def?.width || 1));
      const h = Math.max(1, Math.round(item.h || def?.height || 1));
      for (let y = item.y; y < item.y + h; y++) {
        for (let x = item.x; x < item.x + w; x++) {
          const key = pointKey({ x, y });
          if (key !== goalKey) blocked.add(key);
        }
      }
    });
    return blocked;
  }

  function rebuildPath(cameFrom, endKey) {
    const keys = [];
    let key = endKey;
    while (key) {
      keys.unshift(key);
      key = cameFrom.get(key);
    }
    return keys.map(keyToPoint);
  }

  function roundPoint(point) {
    return { x: Math.round(point.x), y: Math.round(point.y) };
  }

  function pointKey(point) {
    return `${point.x},${point.y}`;
  }

  function keyToPoint(key) {
    const [x, y] = key.split(",").map(Number);
    return { x, y };
  }

  window.PathfindingSystem = { manhattanPath, officePath };
})();
