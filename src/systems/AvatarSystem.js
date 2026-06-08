(function () {
  const fallback = {
    shirts: ["#c8efff", "#ffd6e4", "#daf7bd"],
    pants: ["#263044", "#4b5563", "#315c42"],
    shoes: ["#263044", "#343434"],
    hairs: ["#6a3c23", "#2f4057", "#343434"],
    styles: ["hair-neat", "hair-side", "hair-curly"],
    accessory: "accessory-clipboard",
    expression: "calm",
    workIcon: "doc",
    accent: "#2f6df6"
  };

  const workIconText = {
    chart: "CH",
    file: "FL",
    spark: "*",
    doc: "DO",
    phone: "PH",
    data: "01",
    stamp: "OK",
    book: "?"
  };

  function getAvatar(staff, index = 0) {
    const look = window.ROLE_VISUALS?.[staff.role] || fallback;
    const seed = staffAvatarSeed(staff, index);
    return {
      shirt: pick(look.shirts, seed),
      pants: pick(look.pants, seed + 3),
      shoes: pick(look.shoes, seed + 5),
      hair: pick(look.hairs, seed + 7),
      skin: pick(["#ffe1be", "#f3c89f", "#f7d5b7", "#e7b98f"], seed + 11),
      blush: pick(["#e59f9f", "#d99090", "#f0aaa0"], seed + 17),
      hairClass: pick(look.styles, seed + 13),
      accessoryClass: look.accessory,
      expressionClass: `expression-${look.expression || "calm"}`,
      workIconClass: `work-${look.workIcon || "doc"}`,
      workIcon: workIconText[look.workIcon] || ".",
      accent: look.accent
    };
  }

  function avatarStyle(avatar) {
    return [
      `--shirt:${avatar.shirt}`,
      `--pants:${avatar.pants}`,
      `--shoe:${avatar.shoes}`,
      `--hair:${avatar.hair}`,
      `--skin:${avatar.skin}`,
      `--blush:${avatar.blush}`,
      `--accent:${avatar.accent}`
    ].join(";");
  }

  function renderStaffAvatar(staff, index, roleIcon) {
    const avatar = getAvatar(staff, index);
    return `
      <span class="avatar-root ${avatar.hairClass} ${avatar.accessoryClass} ${avatar.expressionClass} ${avatar.workIconClass}" data-avatar-origin="feet">
        <span class="avatar-shadow"></span>
        <span class="avatar-legs" data-part="legs">
          <span class="avatar-leg avatar-leg-left"><span class="avatar-shoe"></span></span>
          <span class="avatar-leg avatar-leg-right"><span class="avatar-shoe"></span></span>
        </span>
        <span class="avatar-torso" data-part="torso">
          <span class="avatar-neck"></span>
          <span class="avatar-jacket"></span>
          <span class="avatar-arm avatar-arm-left"><span class="avatar-hand"></span></span>
          <span class="avatar-arm avatar-arm-right"><span class="avatar-hand"></span></span>
        </span>
        <span class="avatar-head" data-part="head">
          <span class="avatar-hair"></span>
          <span class="avatar-face">
            <span class="avatar-eye avatar-eye-left"></span>
            <span class="avatar-eye avatar-eye-right"></span>
            <span class="avatar-mouth"></span>
          </span>
        </span>
        <span class="avatar-accessory" data-part="accessory"></span>
        <span class="avatar-work-icon" data-part="work-icon">${escapeHtml(avatar.workIcon)}</span>
        <span class="role-icon">${escapeHtml(roleIcon)}</span>
      </span>`;
  }

  function classNamesFor(staff, index) {
    const avatar = getAvatar(staff, index);
    return `${avatar.hairClass} ${avatar.accessoryClass} ${avatar.expressionClass} ${avatar.workIconClass}`;
  }

  function staffAvatarSeed(staff, index) {
    const text = `${staff.id || ""}${staff.name || ""}${staff.role || ""}`;
    let hash = index * 97 + 17;
    for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) % 10007;
    return hash;
  }

  function pick(list, seed) {
    return list[Math.abs(seed) % list.length];
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));
  }

  window.AvatarSystem = { getAvatar, avatarStyle, renderStaffAvatar, classNamesFor };
})();
