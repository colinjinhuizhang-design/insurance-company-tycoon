import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(process.cwd());
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const userDataDir = join(tmpdir(), `ict-smoke-${Date.now()}`);
const port = 9237;
const fileUrl = `file:///${resolve(root, "index.html").replaceAll("\\", "/")}`;
const results = { desktop: {}, mobile: {}, interactions: {}, consoleErrors: [] };

await mkdir(userDataDir, { recursive: true });
const browser = spawn(edge, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  fileUrl
], { stdio: "ignore" });

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

async function waitForVersion() {
  for (let i = 0; i < 80; i++) {
    try {
      return await fetchJson(`http://127.0.0.1:${port}/json/version`);
    } catch {
      await sleep(150);
    }
  }
  throw new Error("Edge debugging endpoint did not start.");
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  const events = [];
  ws.addEventListener("message", event => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    } else if (msg.method) {
      events.push(msg);
      if (msg.method === "Runtime.exceptionThrown") {
        results.consoleErrors.push(msg.params?.exceptionDetails?.text || "Runtime exception");
      }
      if (msg.method === "Log.entryAdded" && ["error", "warning"].includes(msg.params?.entry?.level)) {
        results.consoleErrors.push(`${msg.params.entry.level}: ${msg.params.entry.text}`);
      }
    }
  });
  return {
    ready: new Promise(resolve => ws.addEventListener("open", resolve, { once: true })),
    events,
    send(method, params = {}) {
      const callId = ++id;
      ws.send(JSON.stringify({ id: callId, method, params }));
      return new Promise((resolve, reject) => pending.set(callId, { resolve, reject }));
    },
    close() { ws.close(); }
  };
}

function valueOf(result) {
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Evaluation failed");
  return result.result.value;
}

async function evalJs(cdp, expression) {
  return valueOf(await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  }));
}

async function capture(cdp, path) {
  const png = await cdp.send("Page.captureScreenshot", { format: "png", fromSurface: true });
  await writeFile(path, Buffer.from(png.data, "base64"));
}

try {
  await waitForVersion();
  let tabs = await fetchJson(`http://127.0.0.1:${port}/json/list`);
  let page = tabs.find(tab => tab.type === "page");
  if (!page) {
    page = await fetchJson(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(fileUrl)}`, { method: "PUT" });
  }
  const cdp = connect(page.webSocketDebuggerUrl);
  await cdp.ready;
  await cdp.send("Runtime.enable");
  await cdp.send("Log.enable");
  await cdp.send("Page.enable");
  await cdp.send("Page.navigate", { url: fileUrl });
  await sleep(900);

  await evalJs(cdp, `window.__ictSmokeBackup = localStorage.getItem("insuranceKaihatsuSave")`);
  results.desktop.initial = await evalJs(cdp, `(() => {
    const tabs = [...document.querySelectorAll(".tab")].map(tab => tab.textContent.trim());
    return {
      activePanel: document.querySelector(".panel.active")?.id,
      tabs,
      hasBoardTab: !!document.querySelector('[data-tab="board"]'),
      hasFarmTab: !!document.querySelector('[data-tab="farm"]'),
      hasOffice: !!document.querySelector("#office"),
      hasFarmScene: !!document.querySelector("#farmScene"),
      hasRecommended: !!document.querySelector("#recommendedAction"),
      globalSolvency: document.querySelector("#globalSolvency")?.textContent,
      globalRisk: document.querySelector("#globalRisk")?.textContent,
      globalSaveStatus: document.querySelector("#globalSaveStatus")?.textContent,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    };
  })()`);

  results.interactions.save = await evalJs(cdp, `(() => {
    document.querySelector("#saveBtn").click();
    const raw = localStorage.getItem("insuranceKaihatsuSave");
    const parsed = JSON.parse(raw);
    return { exists: !!raw, saveVersion: parsed.saveVersion, currentTab: parsed.currentTab };
  })()`);

  results.interactions.load = await evalJs(cdp, `(() => {
    document.querySelector("#loadBtn").click();
    return {
      activePanel: document.querySelector(".panel.active")?.id,
      toast: document.querySelector("#toastLog")?.textContent
    };
  })()`);

  results.interactions.tabs = await evalJs(cdp, `(() => {
    const visited = [];
    for (const id of ["farm", "staff", "project", "officePanel", "events", "finance", "quiz", "awards", "settings", "studio"]) {
      document.querySelector(\`.tab[data-tab="\${id}"]\`).click();
      visited.push(document.querySelector(".panel.active")?.id);
    }
    return visited;
  })()`);

  results.interactions.oldSaveNormalize = await evalJs(cdp, `(() => {
    localStorage.setItem("insuranceKaihatsuSave", JSON.stringify({
      cash: 123456,
      currentTab: "board",
      staff: [{ name: "Legacy Actuary", role: "Chief Actuary", pricing: 8, risk: 7, marketing: 2, service: 3 }],
      equipment: ["basicDesk"]
    }));
    document.querySelector("#loadBtn").click();
    return {
      activePanel: document.querySelector(".panel.active")?.id,
      cash: document.querySelector("#globalCash")?.textContent,
      staffSummary: document.querySelector("#capacitySummary")?.textContent?.slice(0, 45),
      saveVersionVisible: document.querySelector("#globalSaveStatus")?.textContent
    };
  })()`);

  await evalJs(cdp, `(() => {
    if (window.__ictSmokeBackup === null) localStorage.removeItem("insuranceKaihatsuSave");
    else localStorage.setItem("insuranceKaihatsuSave", window.__ictSmokeBackup);
    document.querySelector("#loadBtn").click();
    return true;
  })()`);

  results.interactions.product = await evalJs(cdp, `(() => {
    document.querySelector('.tab[data-tab="project"]').click();
    const name = document.querySelector("#productName");
    name.value = "Smoke Test Cover";
    name.dispatchEvent(new Event("input", { bubbles: true }));
    document.querySelector("#startProjectBtn").click();
    const started = !!document.querySelector("#projectMini")?.textContent.includes("Smoke Test Cover");
    return { started, text: document.querySelector("#projectMini")?.textContent };
  })()`);

  results.interactions.farmPlan = await evalJs(cdp, `(() => {
    document.querySelector('.tab[data-tab="farm"]').click();
    document.querySelector("#farmPlanSafeBtn").click();
    return {
      activePanel: document.querySelector(".panel.active")?.id,
      productType: document.querySelector("#productType")?.value,
      loading: document.querySelector("#loading")?.value,
      marketingBudget: document.querySelector("#marketingBudget")?.value,
      hasFarmMini: !!document.querySelector("#farmMini")?.textContent
    };
  })()`);

  results.interactions.advance = await evalJs(cdp, `(() => {
    document.querySelector("#advanceBtn").click();
    return {
      date: document.querySelector("#globalDate")?.textContent,
      monthlySummary: document.querySelector("#monthlySummaryPanel")?.textContent?.slice(0, 120),
      hasSave: !!localStorage.getItem("insuranceKaihatsuSave")
    };
  })()`);

  results.interactions.coreFlows = await evalJs(cdp, `(() => {
    state = freshState();
    state.cash = 3000000;
    saveToStorage();
    render();
    restoreCurrentTab();

    const initialStaff = state.staff.length;
    const candidateId = state.candidates[0].id;
    hireCandidate(candidateId);
    const hired = state.staff.length === initialStaff + 1;
    const fullCount = state.staff.length;
    hireCandidate(state.candidates[0].id);
    const capacityBlocked = state.staff.length === fullCount;

    const skillBefore = state.staff[0].skills.pricing;
    document.querySelector("#trainingStaff").value = state.staff[0].id;
    document.querySelector("#trainingCourse").value = "pricing";
    beginTraining();
    while (state.trainingSession && state.trainingSession.phase !== "result") {
      const i = state.trainingSession.currentIndex;
      updateTrainingAnswer(i, state.trainingSession.questions[i].a);
      finishTraining();
    }
    const trainingResultReady = !!state.trainingSession?.result;
    finishTraining();
    const skillAfter = state.staff[0].skills.pricing;

    const officeBefore = state.office;
    upgradeOffice();
    const renovated = state.office === officeBefore + 1;
    const equipmentBefore = state.equipment.length;
    buyEquipment("coffee");
    const equipmentBought = state.equipment.length === equipmentBefore + 1 && state.equipment.includes("coffee");

    document.querySelector("#productName").value = "Core Flow Cover";
    document.querySelector("#productName").dispatchEvent(new Event("input", { bubbles: true }));
    startProject();
    const projectStarted = !!state.currentProject;
    if (state.currentProject) {
      state.currentProject.stageIndex = PIPELINE_STAGES.length - 1;
      state.currentProject.stageProgress = state.currentProject.stageTarget;
      state.currentProject.attrs.quality = 100;
      state.currentProject.attrs.buzz = 90;
      state.currentProject.attrs.trust = 90;
      state.currentProject.attrs.riskControl = 90;
      launchProject();
    }
    const launched = state.products.some(p => p.name === "Core Flow Cover");

    enterCompetition();
    if (state.quiz) {
      state.quiz.questions.forEach((q, i) => {
        const input = document.querySelector(\`input[name="quiz\${i}"][value="\${q.a}"]\`);
        if (input) input.checked = true;
      });
      submitQuiz();
    }
    const championship = state.ceoHistory.some(h => h.year === 1 && h.correct === 5);
    const achievementCount = state.achievements.length;

    return {
      hired,
      capacityBlocked,
      trainingResultReady,
      trainingChangedSkill: skillAfter > skillBefore,
      renovated,
      equipmentBought,
      projectStarted,
      launched,
      championship,
      achievementCount
    };
  })()`);

  results.interactions.animationToggle = await evalJs(cdp, `(() => {
    document.querySelector('.tab[data-tab="settings"]').click();
    const toggle = document.querySelector("#animationToggle");
    toggle.checked = false;
    toggle.dispatchEvent(new Event("change", { bubbles: true }));
    return document.body.classList.contains("animations-off");
  })()`);

  results.interactions.keyboardSave = await evalJs(cdp, `(() => {
    localStorage.removeItem("insuranceKaihatsuSave");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "s", bubbles: true }));
    const raw = localStorage.getItem("insuranceKaihatsuSave");
    return !!raw && JSON.parse(raw).saveVersion === 1;
  })()`);

  results.interactions.reset = await evalJs(cdp, `(() => {
    window.confirm = () => true;
    document.querySelector("#resetBtn").click();
    const raw = localStorage.getItem("insuranceKaihatsuSave");
    const parsed = JSON.parse(raw);
    return {
      exists: !!raw,
      cash: parsed.cash,
      currentTab: parsed.currentTab,
      saveVersion: parsed.saveVersion
    };
  })()`);

  await capture(cdp, join(root, "outputs", "release-desktop.png"));

  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true
  });
  await cdp.send("Page.navigate", { url: fileUrl });
  await sleep(900);
  results.mobile.layout = await evalJs(cdp, `(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    activePanel: document.querySelector(".panel.active")?.id,
    advanceHeight: Math.round(document.querySelector("#advanceBtn")?.getBoundingClientRect().height || 0),
    tabCount: document.querySelectorAll(".tab").length
  }))()`);
  await capture(cdp, join(root, "outputs", "release-mobile.png"));

  await evalJs(cdp, `(() => {
    if (window.__ictSmokeBackup === null) localStorage.removeItem("insuranceKaihatsuSave");
    else localStorage.setItem("insuranceKaihatsuSave", window.__ictSmokeBackup);
    return true;
  })()`);
  await cdp.send("Page.navigate", { url: fileUrl });
  await sleep(250);
  cdp.close();
} finally {
  browser.kill();
  await sleep(600);
  for (let i = 0; i < 5; i++) {
    try {
      await rm(userDataDir, { recursive: true, force: true, maxRetries: 2, retryDelay: 200 });
      break;
    } catch (error) {
      if (i === 4) console.warn(`Temporary profile cleanup skipped: ${error.message}`);
      await sleep(400);
    }
  }
}

console.log(JSON.stringify(results, null, 2));
