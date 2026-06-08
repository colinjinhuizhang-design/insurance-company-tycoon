(function () {
  function routineForStaff(staff, index, state, layout) {
    const cycle = (Date.now() / 1000 + index * 1.7) % 28;
    const desk = layout.deskSlots.find(slot => slot.staffId === staff.id) || layout.deskSlots[index % layout.deskSlots.length];
    const zones = layout.zones;
    let stateName = staff.status || "Working";
    let target = desk?.interaction || zones.entrance;
    const deskTarget = desk?.interaction || zones.entrance;
    let from = deskTarget;
    let bubble = "";

    if (staff.onFireMonths > 0) {
      stateName = "On Fire";
      target = deskTarget;
      bubble = "fire";
    } else if (staff.stamina < 18) {
      stateName = cycle < 14 ? "Resting" : "Tired";
      from = cycle < 14 ? deskTarget : zones.kitchen;
      target = cycle < 14 ? pointAlongPath(deskTarget, zones.kitchen, cycle / 14) : pointAlongPath(zones.kitchen, zones.study, (cycle - 14) / 14);
      bubble = "zzz";
    } else if (staff.status === "Training") {
      stateName = "Training";
      from = deskTarget;
      target = pointAlongPath(deskTarget, zones.study, .85);
      bubble = "book";
    } else if (staff.status === "Celebrating") {
      stateName = "Celebrating";
      from = deskTarget;
      target = pointAlongPath(deskTarget, zones.trophy, .9);
      bubble = "win";
    } else if (cycle < 3) {
      stateName = "Arriving";
      from = zones.entrance;
      target = pointAlongPath(zones.entrance, deskTarget, cycle / 3);
    } else if (cycle < 10) {
      stateName = "Working";
      target = deskTarget;
      bubble = roleBubble(staff.role);
    } else if (cycle < 13) {
      stateName = "Coffee Break";
      from = deskTarget;
      target = pointAlongPath(deskTarget, zones.kitchen, (cycle - 10) / 3);
      bubble = "cup";
    } else if (cycle < 15) {
      stateName = "Bathroom Break";
      from = zones.kitchen;
      target = pointAlongPath(zones.kitchen, zones.bathroom, (cycle - 13) / 2);
      bubble = "wc";
    } else if (cycle < 21 && state.currentProject) {
      stateName = "Meeting";
      from = deskTarget;
      target = pointAlongPath(deskTarget, workTargetForRole(staff.role, layout), Math.min(1, (cycle - 15) / 2.5));
      bubble = roleBubble(staff.role);
    } else if (cycle >= 17 && cycle < 21 && !state.currentProject && staff.mood > 52 && index % 2 === 0) {
      stateName = "Talking";
      from = deskTarget;
      const chatSpot = index % 4 === 0 ? zones.kitchen : zones.meeting;
      target = pointAlongPath(deskTarget, chatSpot, Math.min(1, (cycle - 17) / 2));
      bubble = chatBubble(staff.role, index);
    } else if (cycle < 25) {
      stateName = staff.mood > 78 ? "Inspired" : "Working";
      target = deskTarget;
      bubble = staff.mood > 78 ? "idea" : roleBubble(staff.role);
    } else {
      stateName = "Going Home";
      from = deskTarget;
      target = pointAlongPath(deskTarget, zones.home, (cycle - 25) / 3);
    }

    const path = window.PathfindingSystem.manhattanPath(from, target);
    const facing = target.x < from.x ? "left" : "right";
    return { stateName, target, path, desk, bubble, facing };
  }

  function workTargetForRole(role, layout) {
    const zones = layout.zones;
    if (role === "Actuary") return findDeskByRole("Actuary", layout) || zones.meeting;
    if (role === "Underwriter") return findDeskByRole("Underwriter", layout) || zones.meeting;
    if (role === "Marketing Specialist") return zones.meeting;
    if (role === "Claims Manager") return { x: layout.cols - 7, y: 3 };
    if (role === "Data Scientist") return { x: layout.cols - 8, y: 3 };
    if (role === "Compliance Officer") return { x: layout.cols - 7, y: layout.rows - 3 };
    return zones.meeting;
  }

  function findDeskByRole(role, layout) {
    const slot = layout.deskSlots.find(slot => {
      const deskId = window.ROLE_DESK_BY_ROLE[role];
      return slot.deskType === deskId;
    });
    return slot?.interaction;
  }

  function roleBubble(role) {
    return (window.STAFF_SPRITES[role] && window.STAFF_SPRITES[role].bubble) || "work";
  }

  function chatBubble(role, index) {
    const roleLines = {
      "Actuary": ["Pricing?", "Model OK"],
      "Underwriter": ["Risk review", "Check file"],
      "Marketing Specialist": ["Launch plan", "Buzz?"],
      "Claims Manager": ["Claims note", "Need help?"],
      "Customer Service Officer": ["Good idea!", "Customer care"],
      "Data Scientist": ["Forecast?", "Data check"],
      "Compliance Officer": ["Approval?", "Policy OK"],
      "Junior Graduate": ["Learning!", "Question?"]
    };
    const list = roleLines[role] || ["Coffee?", "Great work!"];
    return list[index % list.length];
  }

  function pointAlongPath(from, to, progress) {
    const path = window.PathfindingSystem.manhattanPath(from, to);
    if (!path.length) return to;
    const clamped = Math.max(0, Math.min(1, progress));
    const index = Math.min(path.length - 1, Math.floor(clamped * (path.length - 1)));
    return path[index];
  }

  window.StaffRoutineSystem = { routineForStaff, workTargetForRole };
})();
