(function () {
  function moodIcon(staff) {
    if ((staff.mood || 0) > 80) return ":)";
    if ((staff.mood || 0) < 30) return ":(";
    return "M";
  }

  function staminaIcon(staff) {
    if ((staff.stamina || 0) < 30) return "Z";
    if ((staff.stamina || 0) > 70) return "E";
    return "S";
  }

  function shortStatus(status) {
    return {
      "Coffee Break": "Coffee",
      "Bathroom Break": "Break",
      "On Fire": "Fire",
      "Going Home": "Home",
      Talking: "Chat"
    }[status] || String(status || "Work").slice(0, 8);
  }

  function stateClasses(staff, routine) {
    const classes = [];
    if ((staff.mood || 0) > 80) classes.push("mood-high");
    if ((staff.mood || 0) < 30) classes.push("mood-low");
    if ((staff.stamina || 0) < 30) classes.push("stamina-low");
    if ((staff.stamina || 0) > 70) classes.push("stamina-high");
    if (routine?.stateName === "Resting") classes.push("resting-signal");
    return classes.join(" ");
  }

  function signalFor(staff, routine) {
    const stateName = routine?.stateName || staff.status || "Working";
    if ((staff.onFireMonths || 0) > 0 || stateName === "On Fire") return "F";
    if ((staff.stamina || 0) < 30 || stateName === "Tired") return "Z";
    if (stateName === "Training") return "B";
    if (stateName === "Coffee Break" || stateName === "Resting") return "C";
    if (stateName === "Talking") return "Hi";
    if ((staff.mood || 0) > 80 || stateName === "Inspired") return ":)";
    if ((staff.mood || 0) < 30) return ":(";
    return thoughtForState(stateName);
  }

  function thoughtForState(stateName) {
    return {
      Thinking: "?",
      Training: "B",
      "Coffee Break": "C",
      "Bathroom Break": "WC",
      Tired: "Z",
      Inspired: "*",
      "On Fire": "F",
      Celebrating: "!",
      Meeting: "M",
      Talking: "Hi",
      "Going Home": "->"
    }[stateName] || "";
  }

  window.MoodSystem = { moodIcon, staminaIcon, shortStatus, stateClasses, signalFor, thoughtForState };
})();
