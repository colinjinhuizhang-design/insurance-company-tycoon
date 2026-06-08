(function () {
  function statusClass(status) {
    return String(status || "working").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  function tileStyle(layout, x, y, w = 1, h = 1) {
    return `left:${(x / layout.cols) * 100}%;top:${(y / layout.rows) * 100}%;width:${(w / layout.cols) * 100}%;height:${(h / layout.rows) * 100}%`;
  }

  function resolveStaffMotion(state, staff, routine, layout, now = Date.now()) {
    state.officeMotion = state.officeMotion || {};
    const target = clampPoint(routine.target || { x: 1, y: 1 }, layout);
    const key = `${routine.stateName}:${Math.round(target.x * 10) / 10},${Math.round(target.y * 10) / 10}`;
    let motion = state.officeMotion[staff.id];
    if (!motion) {
      motion = {
        x: target.x,
        y: target.y,
        targetKey: key,
        lastUpdate: now,
        path: [{ x: target.x, y: target.y }],
        pathIndex: 0,
        facing: routine.facing || "right",
        pauseUntil: 0
      };
      state.officeMotion[staff.id] = motion;
    }

    const elapsed = Math.max(0, Math.min(0.45, (now - (motion.lastUpdate || now)) / 1000));
    if (motion.targetKey !== key) {
      motion.targetKey = key;
      motion.path = buildMotionPath({ x: motion.x, y: motion.y }, target, routine.path, layout);
      motion.pathIndex = Math.min(1, motion.path.length - 1);
      motion.pauseUntil = 0;
    }

    if (now >= (motion.pauseUntil || 0)) {
      const waypoint = motion.path?.[motion.pathIndex] || target;
      const speed = staffSpeed(staff, routine);
      const result = moveToward({ x: motion.x, y: motion.y }, waypoint, speed * elapsed);
      motion.x = result.x;
      motion.y = result.y;
      if (result.arrived) {
        if (motion.pathIndex < motion.path.length - 1) {
          motion.pathIndex += 1;
        } else {
          motion.pauseUntil = now + pauseForState(routine.stateName);
        }
      }
    }

    motion.lastUpdate = now;
    motion.facing = target.x < motion.x - 0.05 ? "left" : target.x > motion.x + 0.05 ? "right" : (routine.facing || motion.facing || "right");
    return {
      point: clampPoint({ x: motion.x, y: motion.y }, layout),
      facing: motion.facing,
      speed: staffSpeed(staff, routine)
    };
  }

  function buildMotionPath(current, target, routinePath, layout) {
    const start = { x: Math.round(current.x), y: Math.round(current.y) };
    const end = { x: Math.round(target.x), y: Math.round(target.y) };
    const base = window.PathfindingSystem?.officePath ? window.PathfindingSystem.officePath(start, end, layout) :
      window.PathfindingSystem?.manhattanPath ? window.PathfindingSystem.manhattanPath(start, end) : [start, end];
    const path = [{ x: current.x, y: current.y }, ...base.slice(1)];
    if (!layout && routinePath?.length && distance(routinePath[routinePath.length - 1], target) < 0.2) {
      return [{ x: current.x, y: current.y }, ...routinePath.slice(1)];
    }
    return path;
  }

  function staffSpeed(staff, routine) {
    if ((staff.onFireMonths || 0) > 0 || routine.stateName === "On Fire") return 4.2;
    if ((staff.stamina || 0) < 20 || routine.stateName === "Tired") return 1.15;
    if ((staff.mood || 0) > 82 || routine.stateName === "Inspired") return 3.1;
    return 2.25;
  }

  function pauseForState(stateName) {
    return {
      Working: 900,
      "Coffee Break": 1300,
      "Bathroom Break": 1000,
      Resting: 1500,
      Meeting: 1100,
      Training: 1200,
      Talking: 1400,
      "Going Home": 500
    }[stateName] || 700;
  }

  function progressTextForStaff(staff, routine, state) {
    if (routine.stateName === "Coffee Break") return "Energy +";
    if (routine.stateName === "Training") return "Skill +";
    if (routine.stateName === "Talking") return staff.role === "Junior Graduate" ? "Learn +1" : "Mood +";
    if (routine.stateName === "Meeting" && state.currentProject) return meetingProgressText(staff.role);
    if (routine.stateName === "Working") return workProgressText(staff.role);
    if (routine.stateName === "On Fire") return "Boost +5";
    return "";
  }

  function meetingProgressText(role) {
    return {
      "Actuary": "Pricing +3",
      "Underwriter": "Risk -2",
      "Marketing Specialist": "Buzz +4",
      "Claims Manager": "Claims -2",
      "Customer Service Officer": "Trust +2",
      "Data Scientist": "Forecast +3",
      "Compliance Officer": "Approval +2",
      "Junior Graduate": "Idea +1"
    }[role] || "Quality +2";
  }

  function workProgressText(role) {
    return {
      "Actuary": "Pricing +2",
      "Underwriter": "Risk +1",
      "Marketing Specialist": "Buzz +2",
      "Claims Manager": "Claims -1",
      "Customer Service Officer": "Trust +1",
      "Data Scientist": "Forecast +2",
      "Compliance Officer": "Check +2",
      "Junior Graduate": "Learn +1"
    }[role] || "Work +1";
  }

  function moveToward(current, target, step) {
    const dx = target.x - current.x;
    const dy = target.y - current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= Math.max(0.02, step)) return { x: target.x, y: target.y, arrived: true };
    return { x: current.x + (dx / dist) * step, y: current.y + (dy / dist) * step, arrived: false };
  }

  function clampPoint(point, layout) {
    return {
      x: Math.max(1, Math.min(layout.cols - 2, Number(point.x) || 1)),
      y: Math.max(1, Math.min(layout.rows - 2, Number(point.y) || 1))
    };
  }

  function distance(a, b) {
    const dx = (a.x || 0) - (b.x || 0);
    const dy = (a.y || 0) - (b.y || 0);
    return Math.sqrt(dx * dx + dy * dy);
  }

  window.OfficeAnimationSystem = { statusClass, tileStyle, resolveStaffMotion, progressTextForStaff };
})();
