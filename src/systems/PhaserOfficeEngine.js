(function () {
  const ENGINE_VERSION = "phaser-office-engine-v1";
  const STAFF_WIDTH = 46;
  const STAFF_HEIGHT = 82;
  const LINE = 0x263044;
  const FLOOR = 0xdfeefa;
  const PATH = 0xf8efe0;
  const WALL = 0x7f95a8;
  const ZONE_COLORS = {
    work: 0xdcecf8,
    kitchen: 0xffe7b8,
    bathroom: 0xdff6ff,
    study: 0xf7e7c8,
    meeting: 0xefe8ff,
    awards: 0xfff4cb
  };
  const KIND_COLORS = {
    desk: 0xaed7f4,
    chair: 0x8aa1b1,
    computer: 0x45566a,
    rest: 0xffd166,
    kitchen: 0xffbf69,
    bathroom: 0xa8e6ff,
    study: 0xd2a66b,
    meeting: 0xb9a4ff,
    compliance: 0xbfc5cd,
    analytics: 0x7ed6df,
    decor: 0x9cd67a,
    trophy: 0xf5b333,
    entrance: 0xb57c4c,
    storage: 0xc7d0dc
  };

  let game = null;
  let scene = null;
  let resizeObserver = null;
  let pendingSnapshot = null;
  let lastStatus = {
    active: false,
    version: ENGINE_VERSION,
    staffCount: 0,
    furnitureCount: 0
  };

  function render(state, layout, options = {}) {
    const container = document.getElementById("officeEngine");
    if (!container || !layout || !window.Phaser) {
      lastStatus = { ...lastStatus, active: false };
      return false;
    }
    if (!game) createGame(container);
    const snapshot = buildSnapshot(state, layout, options);
    if (scene?.setSnapshot) scene.setSnapshot(snapshot);
    else pendingSnapshot = snapshot;
    container.dataset.engine = "phaser";
    lastStatus = {
      active: true,
      version: ENGINE_VERSION,
      staffCount: snapshot.staff.length,
      furnitureCount: snapshot.furniture.length
    };
    return true;
  }

  function createGame(container) {
    class OfficeScene extends Phaser.Scene {
      constructor() {
        super("OfficeScene");
        this.snapshot = null;
        this.staffSprites = new Map();
        this.furnitureZones = [];
        this.floaterTexts = [];
      }

      create() {
        scene = this;
        this.floorLayer = this.add.graphics();
        this.furnitureLayer = this.add.container(0, 0);
        this.staffLayer = this.add.container(0, 0);
        this.fxLayer = this.add.container(0, 0);
        this.tooltip = this.add.container(0, 0).setDepth(9000).setVisible(false);
        this.tooltipBg = this.add.rectangle(0, 0, 190, 76, 0xffffff, 0.96).setStrokeStyle(2, LINE);
        this.tooltipText = this.add.text(-86, -30, "", {
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
          color: "#263044",
          fontStyle: "bold",
          lineSpacing: 2
        });
        this.tooltip.add([this.tooltipBg, this.tooltipText]);
        if (pendingSnapshot) {
          this.setSnapshot(pendingSnapshot);
          pendingSnapshot = null;
        }
      }

      setSnapshot(snapshot) {
        this.snapshot = snapshot;
        this.redrawWorld();
        this.syncStaff();
        this.syncEffects();
      }

      redrawWorld() {
        if (!this.snapshot) return;
        const { layout } = this.snapshot;
        const tile = this.tileSize();
        const w = this.scale.width;
        const h = this.scale.height;
        this.floorLayer.clear();
        this.floorLayer.fillStyle(FLOOR, 1);
        this.floorLayer.fillRect(0, 0, w, h);

        for (let y = 0; y < layout.rows; y++) {
          for (let x = 0; x < layout.cols; x++) {
            const rect = this.tileRect(x, y, 1, 1);
            const wall = y === 0 || y === layout.rows - 1 || x === 0 || x === layout.cols - 1;
            const zone = zoneForTile(x, y, layout);
            const isPath = pathTile(x, y, layout);
            const color = wall ? WALL : zone ? ZONE_COLORS[zone.id] : isPath ? PATH : FLOOR;
            this.floorLayer.fillStyle(color, 1);
            this.floorLayer.fillRect(rect.x, rect.y, rect.w, rect.h);
            this.floorLayer.lineStyle(1, wall ? 0x607586 : 0xb7ccda, wall ? 0.55 : 0.24);
            this.floorLayer.strokeRect(rect.x, rect.y, rect.w, rect.h);
          }
        }

        this.floorLayer.lineStyle(Math.max(5, tile * 0.14), LINE, 0.58);
        this.floorLayer.strokeRect(0, 0, layout.cols * tile, layout.rows * tile);

        this.furnitureLayer.removeAll(true);
        this.furnitureZones.forEach(zone => zone.destroy());
        this.furnitureZones = [];
        this.snapshot.furniture.forEach((item, index) => this.drawFurniture(item, index));
      }

      drawFurniture(item, index) {
        const def = item.def || {};
        const rect = this.tileRect(item.x, item.y, item.w || 1, item.h || 1);
        const kind = def.kind || "decor";
        const color = KIND_COLORS[kind] || 0xc7d0dc;
        const g = this.add.graphics();
        const insetX = Math.min(3, Math.max(1, rect.w * 0.08));
        const insetY = Math.min(4, Math.max(1, rect.h * 0.08));
        const bodyW = Math.max(3, rect.w - insetX * 2);
        const bodyH = Math.max(3, rect.h - insetY * 2);
        const radius = Math.max(1, Math.min(bodyW, bodyH) * 0.16);
        g.fillStyle(color, 1);
        g.fillRoundedRect(rect.x + insetX, rect.y + insetY, bodyW, bodyH, radius);
        g.lineStyle(2, LINE, 0.72);
        g.strokeRoundedRect(rect.x + insetX, rect.y + insetY, bodyW, bodyH, radius);

        if (kind === "desk") {
          g.fillStyle(0xffffff, 0.32);
          g.fillRect(rect.x + rect.w * 0.12, rect.y + rect.h * 0.18, rect.w * 0.76, rect.h * 0.25);
        } else if (kind === "computer" || kind === "analytics") {
          g.fillStyle(0x9de2d2, 1);
          g.fillRect(rect.x + rect.w * 0.2, rect.y + rect.h * 0.22, rect.w * 0.6, rect.h * 0.38);
          g.fillStyle(0x263044, 1);
          g.fillRect(rect.x + rect.w * 0.42, rect.y + rect.h * 0.64, rect.w * 0.16, rect.h * 0.14);
        } else if (kind === "decor") {
          g.fillStyle(0x60a531, 1);
          g.fillCircle(rect.x + rect.w * 0.5, rect.y + rect.h * 0.38, Math.min(rect.w, rect.h) * 0.22);
        } else if (kind === "trophy") {
          g.fillStyle(0xfff4cb, 1);
          g.fillCircle(rect.x + rect.w * 0.5, rect.y + rect.h * 0.38, Math.min(rect.w, rect.h) * 0.18);
          g.fillRect(rect.x + rect.w * 0.42, rect.y + rect.h * 0.52, rect.w * 0.16, rect.h * 0.2);
        }

        const glyph = this.add.text(rect.x + rect.w / 2, rect.y + rect.h / 2, def.glyph || "?", {
          fontFamily: "Arial, sans-serif",
          fontSize: `${Math.max(9, Math.min(15, rect.h * 0.24))}px`,
          color: "#263044",
          fontStyle: "bold"
        }).setOrigin(0.5);
        this.furnitureLayer.add([g, glyph]);

        const zone = this.add.zone(rect.x + rect.w / 2, rect.y + rect.h / 2, Math.max(12, rect.w), Math.max(12, rect.h))
          .setInteractive({ cursor: "pointer" });
        zone.setData("kind", "furniture");
        zone.setData("index", index);
        zone.on("pointerdown", () => this.snapshot?.callbacks?.selectFurniture?.(index));
        zone.on("pointerover", () => this.showFurnitureTooltip(item, rect));
        zone.on("pointerout", () => this.tooltip.setVisible(false));
        this.furnitureZones.push(zone);
      }

      syncStaff() {
        if (!this.snapshot) return;
        const keep = new Set();
        this.snapshot.staff.forEach(actor => {
          keep.add(actor.id);
          let entry = this.staffSprites.get(actor.id);
          if (!entry) {
            entry = this.createStaff(actor);
            this.staffSprites.set(actor.id, entry);
          }
          entry.actor = actor;
          const point = this.staffPoint(actor);
          entry.container.setData("targetX", point.x);
          entry.container.setData("targetY", point.y);
          if (!Number.isFinite(entry.container.x) || entry.snapLevel !== this.snapshot.layout.level) {
            entry.container.setPosition(point.x, point.y);
            entry.snapLevel = this.snapshot.layout.level;
          }
          entry.container.setDepth(1000 + point.y);
          entry.name.setText(actor.name);
          entry.status.setText(actor.shortStatus);
          entry.bubble.setText(actor.signal || actor.bubble || "");
          entry.bubble.setVisible(!!(actor.signal || actor.bubble) && actor.state !== "Working");
          entry.roleIcon.setText(actor.icon);
          entry.selected = actor.selected;
          this.updateStaffBars(entry, actor);
          this.drawStaff(entry, actor, this.time.now);
        });
        this.staffSprites.forEach((entry, id) => {
          if (!keep.has(id)) {
            entry.container.destroy();
            this.staffSprites.delete(id);
          }
        });
      }

      createStaff(actor) {
        const container = this.add.container(0, 0);
        container.setSize(STAFF_WIDTH, STAFF_HEIGHT);
        container.setInteractive(new Phaser.Geom.Rectangle(-STAFF_WIDTH / 2, -STAFF_HEIGHT + 18, STAFF_WIDTH, STAFF_HEIGHT + 18), Phaser.Geom.Rectangle.Contains);
        container.input.cursor = "pointer";
        const graphics = this.add.graphics();
        const name = this.add.text(0, -62, actor.name, {
          fontFamily: "Arial, sans-serif",
          fontSize: "11px",
          color: "#263044",
          backgroundColor: "#ffffff",
          padding: { x: 5, y: 2 },
          fontStyle: "bold"
        }).setOrigin(0.5);
        const status = this.add.text(0, 30, actor.shortStatus, {
          fontFamily: "Arial, sans-serif",
          fontSize: "9px",
          color: "#263044",
          backgroundColor: "#ffffff",
          padding: { x: 4, y: 1 },
          fontStyle: "bold"
        }).setOrigin(0.5);
        const bubble = this.add.text(24, -48, actor.signal || "", {
          fontFamily: "Arial, sans-serif",
          fontSize: "10px",
          color: "#263044",
          backgroundColor: "#ffffff",
          padding: { x: 5, y: 3 },
          fontStyle: "bold"
        }).setOrigin(0.5);
        const roleIcon = this.add.text(18, -20, actor.icon, {
          fontFamily: "Arial, sans-serif",
          fontSize: "10px",
          color: "#ffffff",
          backgroundColor: actor.avatar.accent || "#2f6df6",
          padding: { x: 4, y: 3 },
          fontStyle: "bold"
        }).setOrigin(0.5);
        const moodBar = this.add.graphics();
        const staminaBar = this.add.graphics();
        container.add([graphics, name, status, bubble, roleIcon, moodBar, staminaBar]);
        this.staffLayer.add(container);
        container.on("pointerdown", () => this.snapshot?.callbacks?.selectStaff?.(actor.id));
        container.on("pointerover", () => this.showStaffTooltip(actor, container));
        container.on("pointerout", () => this.tooltip.setVisible(false));
        return { actor, container, graphics, name, status, bubble, roleIcon, moodBar, staminaBar, selected: false, snapLevel: null };
      }

      updateStaffBars(entry, actor) {
        drawBar(entry.moodBar, -26, 38, 52, 5, actor.mood, 0xf47aa5, 0xf5b333);
        drawBar(entry.staminaBar, -26, 45, 52, 5, actor.stamina, 0x22a06b, 0x7ed957);
      }

      syncEffects() {
        this.floaterTexts.forEach(obj => obj.destroy());
        this.floaterTexts = [];
        if (!this.snapshot?.showBurstEffects) return;
        const w = this.scale.width;
        const h = this.scale.height;
        (this.snapshot.floaters || []).forEach(f => {
          const t = this.add.text(w * (Number(f.x) || 50) / 100, h * (Number(f.y) || 50) / 100, f.text || "", {
            fontFamily: "Arial, sans-serif",
            fontSize: "15px",
            color: f.type === "bad" ? "#c43a31" : "#1f7a4b",
            backgroundColor: "#ffffff",
            padding: { x: 6, y: 3 },
            fontStyle: "bold"
          }).setOrigin(0.5).setDepth(8000);
          this.tweens.add({ targets: t, y: t.y - 24, alpha: 0.05, duration: 950, ease: "Sine.easeOut" });
          this.floaterTexts.push(t);
        });
        if ((this.snapshot.confetti || 0) > 0) {
          for (let i = 0; i < 18; i++) {
            const piece = this.add.rectangle(rand(30, w - 30), rand(18, 100), rand(5, 9), rand(6, 12), [0xf47aa5, 0xf5b333, 0x2f6df6, 0x22a06b][i % 4], 1).setDepth(8000);
            this.tweens.add({ targets: piece, y: piece.y + rand(70, 150), angle: rand(-180, 180), alpha: 0.1, duration: rand(700, 1300), ease: "Sine.easeIn" });
            this.floaterTexts.push(piece);
          }
        }
      }

      update(time) {
        if (!this.snapshot) return;
        this.staffSprites.forEach(entry => {
          const c = entry.container;
          const targetX = c.getData("targetX") || c.x;
          const targetY = c.getData("targetY") || c.y;
          const dx = targetX - c.x;
          const dy = targetY - c.y;
          if (Math.abs(dx) + Math.abs(dy) > 160) c.setPosition(targetX, targetY);
          else c.setPosition(c.x + dx * 0.24, c.y + dy * 0.24);
          c.setDepth(1000 + c.y);
          this.drawStaff(entry, entry.actor, time);
        });
      }

      drawStaff(entry, actor, time) {
        const g = entry.graphics;
        const avatar = actor.avatar || {};
        const walking = ["Arriving", "Coffee Break", "Bathroom Break", "Meeting", "Talking", "Going Home"].includes(actor.state);
        const typing = ["Working", "On Fire", "Inspired"].includes(actor.state);
        const training = actor.state === "Training";
        const bob = this.snapshot?.animations ? Math.sin(time / (walking ? 120 : 260)) * (walking ? 3 : 1.5) : 0;
        const arm = this.snapshot?.animations ? Math.sin(time / 120) * (walking ? 8 : typing ? 5 : 1) : 0;
        const tired = actor.stamina < 30 || actor.state === "Tired";
        g.clear();

        g.fillStyle(0x263044, 0.22);
        g.fillEllipse(0, 28, 34, 10);
        if (actor.state === "On Fire" || actor.onFire) {
          g.fillStyle(0xff7a35, 0.25 + 0.14 * Math.abs(Math.sin(time / 90)));
          g.fillEllipse(0, -8 + bob, 58, 84);
          g.fillStyle(0xf5b333, 0.28);
          g.fillTriangle(-22, 8, -8, -52 + bob, 0, 8);
          g.fillTriangle(8, 10, 22, -48 + bob, 28, 10);
        } else if (actor.state === "Inspired") {
          g.fillStyle(0xf47aa5, 0.22);
          g.fillCircle(-24, -42 + bob, 4);
          g.fillCircle(25, -30 + bob, 3);
        }

        const y = bob + (tired ? 4 : 0);
        const step = walking && this.snapshot?.animations ? Math.sin(time / 95) * 5 : 0;
        g.lineStyle(3, LINE, tired ? 0.75 : 1);
        g.fillStyle(color(avatar.pants, 0x263044), 1);
        g.fillRoundedRect(-12, 8 + y + step, 9, 22, 4);
        g.fillRoundedRect(3, 8 + y - step, 9, 22, 4);
        g.fillStyle(color(avatar.shoes, 0x263044), 1);
        g.fillRoundedRect(-15, 27 + y + step, 14, 6, 4);
        g.fillRoundedRect(1, 27 + y - step, 14, 6, 4);

        g.fillStyle(color(avatar.shirt, 0xc8efff), 1);
        g.fillRoundedRect(-16, -20 + y, 32, 34, 8);
        g.strokeRoundedRect(-16, -20 + y, 32, 34, 8);
        g.lineStyle(2, LINE, 0.9);
        g.fillStyle(color(avatar.shirt, 0xc8efff), 1);
        g.fillRoundedRect(-27, -15 + y + arm * 0.12, 9, 28, 5);
        g.fillRoundedRect(18, -15 + y - arm * 0.12, 9, 28, 5);
        g.fillStyle(color(avatar.skin, 0xffe1be), 1);
        g.fillCircle(-22, 12 + y + arm * 0.12, 4);
        g.fillCircle(22, 12 + y - arm * 0.12, 4);

        g.lineStyle(3, LINE, 1);
        g.fillStyle(color(avatar.skin, 0xffe1be), 1);
        g.fillCircle(0, -35 + y, 15);
        drawHair(g, avatar.hairClass, color(avatar.hair, 0x6a3c23), y);
        g.fillStyle(LINE, 1);
        const faceDir = actor.facing === "left" ? -1 : 1;
        g.fillCircle(-5 + faceDir, -37 + y, 1.8);
        g.fillCircle(6 + faceDir, -37 + y, 1.8);
        g.lineStyle(2, LINE, 1);
        g.beginPath();
        g.arc(1, -30 + y, actor.mood > 70 ? 5 : 3, actor.mood > 45 ? 0.05 : 3.25, actor.mood > 45 ? 3.1 : 6.1);
        g.strokePath();
        drawAccessory(g, avatar.accessoryClass, avatar.accent, y, actor.facing);

        if (training || actor.state === "Tired") {
          g.fillStyle(0xffffff, 0.95);
          g.lineStyle(2, LINE, 1);
          g.fillRoundedRect(-34, -63 + y, 22, 17, 7);
          g.strokeRoundedRect(-34, -63 + y, 22, 17, 7);
          g.fillStyle(LINE, 1);
          g.fillCircle(-23, -55 + y, 2);
          g.fillCircle(-18, -55 + y, 2);
        }

        if (entry.selected) {
          g.lineStyle(3, 0x2f6df6, 0.85);
          g.strokeEllipse(0, -2 + y, 58, 94);
        }
      }

      showStaffTooltip(actor, container) {
        const text = `${actor.name}\n${actor.role}\nMood ${Math.round(actor.mood)}/100 | Stamina ${Math.round(actor.stamina)}/100\n${actor.state}`;
        this.tooltipText.setText(text);
        this.tooltip.setPosition(clamp(container.x + 90, 102, this.scale.width - 102), clamp(container.y - 76, 42, this.scale.height - 42));
        this.tooltip.setVisible(true);
      }

      showFurnitureTooltip(item, rect) {
        const def = item.def || {};
        const staffLine = item.staffName ? `\nAssigned: ${item.staffName}` : "";
        this.tooltipText.setText(`${def.name || item.id}\n${def.effect || "Office furniture."}${staffLine}`);
        this.tooltip.setPosition(clamp(rect.x + rect.w / 2 + 90, 102, this.scale.width - 102), clamp(rect.y + rect.h / 2 - 54, 42, this.scale.height - 42));
        this.tooltip.setVisible(true);
      }

      staffPoint(actor) {
        const rect = this.tileRect(actor.point.x, actor.point.y, 1, 1);
        return { x: rect.x + rect.w / 2, y: rect.y + rect.h * 0.86 };
      }

      tileSize() {
        if (!this.snapshot) return 32;
        return Math.min(this.scale.width / this.snapshot.layout.cols, this.scale.height / this.snapshot.layout.rows);
      }

      tileRect(x, y, w = 1, h = 1) {
        const tile = this.tileSize();
        const offsetX = (this.scale.width - this.snapshot.layout.cols * tile) / 2;
        const offsetY = (this.scale.height - this.snapshot.layout.rows * tile) / 2;
        return { x: offsetX + x * tile, y: offsetY + y * tile, w: w * tile, h: h * tile };
      }
    }

    game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent: container,
      width: Math.max(320, container.clientWidth || 780),
      height: Math.max(320, container.clientHeight || 520),
      backgroundColor: "#d8e8f4",
      pixelArt: true,
      antialias: false,
      scene: [OfficeScene],
      scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    });
  }

  function buildSnapshot(state, layout, options) {
    const now = Date.now();
    const selectedStaffId = state.selectedOfficeItem?.type === "staff" ? state.selectedOfficeItem.id : null;
    const staff = (state.staff || []).map((member, index) => {
      const routine = window.StaffRoutineSystem.routineForStaff(member, index, state, layout);
      const motion = window.OfficeAnimationSystem.resolveStaffMotion(state, member, routine, layout, now);
      member.routineState = routine.stateName;
      member.routineTarget = routine.target;
      member.routinePath = routine.path;
      member.assignedDeskId = routine.desk?.id || member.assignedDeskId || `d${index + 1}`;
      const avatar = window.AvatarSystem ? window.AvatarSystem.getAvatar(member, index) : {};
      const bubble = routine.bubble || "";
      return {
        id: member.id,
        name: member.name,
        role: member.role,
        mood: Number(member.mood) || 0,
        stamina: Number(member.stamina) || 0,
        state: routine.stateName || member.status || "Working",
        shortStatus: shortStatus(routine.stateName || member.status || "Working"),
        selected: selectedStaffId === member.id,
        point: motion.point,
        facing: motion.facing,
        icon: roleIcon(member.role),
        bubble,
        signal: signalFor(member, routine),
        avatar,
        onFire: member.onFireMonths > 0 || routine.stateName === "On Fire"
      };
    });
    const liveEvents = staff.map(actor => `${actor.name}: ${actor.state}${state.currentProject && actor.state === "Meeting" ? " (project)" : ""}`);
    state.liveOfficeEvents = liveEvents.slice(0, 6);
    return {
      layout,
      staff,
      furniture: (layout.furniture || []).map((item, index) => {
        const def = window.FurnitureSystem?.getFurniture ? window.FurnitureSystem.getFurniture(item.id) : window.FURNITURE_DATA?.[item.id] || {};
        const staffMember = item.staffId ? state.staff.find(member => member.id === item.staffId) : null;
        return { ...item, index, def, staffName: staffMember?.name || "" };
      }),
      floaters: state.floaters || [],
      confetti: state.confetti || 0,
      showBurstEffects: options.showBurstEffects !== false,
      animations: state.uiSettings?.animations !== false,
      callbacks: {
        selectStaff: options.selectStaff,
        selectFurniture: options.selectFurniture
      }
    };
  }

  function pathTile(x, y, layout) {
    const zones = layout.zones || {};
    return y === layout.rows - 2 || x === 2 || x === Math.floor(layout.cols / 2) || (x > 2 && x < layout.cols - 2 && y === Math.floor(layout.rows / 2)) ||
      Object.values(zones).some(point => Math.abs(point.x - x) + Math.abs(point.y - y) <= 1);
  }

  function zoneForTile(x, y, layout) {
    return (layout.zoneRects || []).find(zone => x >= zone.x && x < zone.x + zone.w && y >= zone.y && y < zone.y + zone.h);
  }

  function roleIcon(role) {
    return (window.STAFF_SPRITES?.[role]?.icon) || {
      "Actuary": "#",
      "Underwriter": "C",
      "Marketing Specialist": "*",
      "Claims Manager": "!",
      "Customer Service Officer": ":)",
      "Data Scientist": "01",
      "Compliance Officer": "OK",
      "Junior Graduate": "B"
    }[role] || String(role || "?").slice(0, 2).toUpperCase();
  }

  function signalFor(member, routine) {
    if (window.MoodSystem?.signalFor) return window.MoodSystem.signalFor(member, routine);
    if (member.onFireMonths > 0 || routine.stateName === "On Fire") return "F";
    if (member.stamina < 30 || routine.stateName === "Tired") return "Z";
    if (routine.stateName === "Training") return "B";
    if (routine.stateName === "Coffee Break" || routine.stateName === "Resting") return "C";
    if (member.mood > 80 || routine.stateName === "Inspired") return ":)";
    return "";
  }

  function shortStatus(status) {
    if (window.MoodSystem?.shortStatus) return window.MoodSystem.shortStatus(status);
    return {
      "Coffee Break": "Coffee",
      "Bathroom Break": "Break",
      "On Fire": "Fire",
      "Going Home": "Home"
    }[status] || String(status || "Work").slice(0, 8);
  }

  function drawBar(g, x, y, width, height, value, colorA, colorB) {
    const pct = clamp(Number(value) || 0, 0, 100) / 100;
    g.clear();
    g.fillStyle(0xffffff, 0.94);
    g.lineStyle(1, LINE, 1);
    g.fillRoundedRect(x, y, width, height, 3);
    g.strokeRoundedRect(x, y, width, height, 3);
    g.fillStyle(pct > 0.45 ? colorB : colorA, 1);
    g.fillRoundedRect(x + 1, y + 1, Math.max(2, (width - 2) * pct), height - 2, 3);
  }

  function drawHair(g, style, hair, y) {
    g.fillStyle(hair, 1);
    g.fillEllipse(0, -46 + y, 26, 13);
    if (style === "hair-tied") {
      g.fillCircle(15, -37 + y, 6);
    } else if (style === "hair-side") {
      g.fillRoundedRect(-15, -47 + y, 19, 19, 8);
    } else if (style === "hair-bob") {
      g.fillRoundedRect(-16, -45 + y, 32, 18, 8);
    } else if (style === "hair-curly") {
      for (let i = -2; i <= 2; i++) g.fillCircle(i * 6, -46 + y + (Math.abs(i) % 2) * 2, 5);
    } else if (style === "hair-spiky") {
      g.fillTriangle(-14, -40 + y, -8, -58 + y, -2, -40 + y);
      g.fillTriangle(-4, -40 + y, 2, -59 + y, 8, -40 + y);
      g.fillTriangle(6, -40 + y, 12, -55 + y, 15, -40 + y);
    }
  }

  function drawAccessory(g, accessory, accent, y, facing) {
    const accentColor = color(accent, 0x2f6df6);
    g.lineStyle(2, accentColor, 1);
    g.fillStyle(accentColor, 1);
    if (accessory === "accessory-glasses") {
      g.strokeCircle(-5, -37 + y, 4);
      g.strokeCircle(6, -37 + y, 4);
      g.lineBetween(-1, -37 + y, 2, -37 + y);
    } else if (accessory === "accessory-headset") {
      g.strokeCircle(0, -36 + y, 15);
      g.fillRoundedRect(facing === "left" ? -17 : 12, -33 + y, 6, 11, 3);
    } else if (accessory === "accessory-clipboard" || accessory === "accessory-checklist") {
      g.fillStyle(0xffffff, 1);
      g.fillRoundedRect(18, -8 + y, 14, 19, 3);
      g.lineStyle(2, accentColor, 1);
      g.strokeRoundedRect(18, -8 + y, 14, 19, 3);
      g.lineBetween(21, -2 + y, 29, -2 + y);
      g.lineBetween(21, 4 + y, 29, 4 + y);
    } else if (accessory === "accessory-megaphone") {
      g.fillTriangle(18, -15 + y, 35, -22 + y, 35, -8 + y);
      g.fillRoundedRect(15, -13 + y, 6, 8, 2);
    } else if (accessory === "accessory-laptop") {
      g.fillRoundedRect(16, -2 + y, 17, 12, 3);
      g.fillStyle(0xffffff, 0.35);
      g.fillRect(20, 1 + y, 9, 4);
    } else if (accessory === "accessory-backpack") {
      g.fillRoundedRect(-27, -16 + y, 10, 25, 5);
    }
  }

  function color(value, fallback) {
    if (typeof value !== "string") return fallback;
    const clean = value.trim().replace("#", "");
    const parsed = Number.parseInt(clean, 16);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function destroy() {
    resizeObserver?.disconnect();
    resizeObserver = null;
    if (game) game.destroy(true);
    game = null;
    scene = null;
    lastStatus = { ...lastStatus, active: false };
  }

  window.PhaserOfficeEngine = { render, destroy, status: () => ({ ...lastStatus }) };
})();
