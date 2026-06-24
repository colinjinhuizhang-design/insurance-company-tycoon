/*
  Insurance Company Tycoon
  Original browser-based insurance company management sim.
  Uses no copied commercial game source code, UI, names, assets or formulas.
*/

const START_CASH = 650_000;
const MAX_YEARS = 30;
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const SAVE_KEY = "insuranceKaihatsuSave";
const BOARD_KEY = "insuranceKaihatsuLeaderboard";
const SAVE_VERSION = 1;

const OFFICE_LEVELS = [
  {level:1, name:"Small Room", cost:0, maxStaff:3, equipmentSpace:4, unlock:"Basic candidates and compact office."},
  {level:2, name:"Kitchen Studio", cost:100_000, maxStaff:5, equipmentSpace:8, unlock:"Kitchen equipment and better stamina recovery."},
  {level:3, name:"Training Room", cost:300_000, maxStaff:8, equipmentSpace:14, unlock:"Training room and stronger candidate pool."},
  {level:4, name:"Executive Office", cost:800_000, maxStaff:12, equipmentSpace:22, unlock:"Executive office, higher prestige and senior specialists."},
  {level:5, name:"Research Lab", cost:2_000_000, maxStaff:18, equipmentSpace:35, unlock:"Research lab, trophy hall and elite candidates."}
];

const PRODUCT_NAMES = {
  Term10: "10-Year Term Life",
  WL_Insurance: "Whole Life Insurance",
  Endow10: "10-Year Endowment",
  WL_Annuity: "Whole Life Annuity",
  RetirementIncome: "Retirement Income Plan",
  FamilyProtection: "Family Protection Plan",
  EducationSavings: "Education Savings Cover",
  SeniorCare: "Senior Care Income Plan"
};

const PRODUCT_SPECS = {
  Term10: {type:"term", marker:"TL", baseDemand:{35:58,45:48,55:32,65:12}, factor:1.00, protection:true},
  WL_Insurance: {type:"whole", marker:"WL", baseDemand:{35:38,45:34,55:25,65:14}, factor:1.00, protection:true},
  Endow10: {type:"endowment", marker:"EN", baseDemand:{35:25,45:24,55:18,65:9}, factor:1.00, protection:true},
  WL_Annuity: {type:"annuity", marker:"AN", baseDemand:{35:4,45:8,55:22,65:45}, factor:1.00, annuity:true},
  RetirementIncome: {type:"annuity", marker:"RI", baseDemand:{35:3,45:9,55:28,65:50}, factor:1.12, annuity:true},
  FamilyProtection: {type:"term", marker:"FP", baseDemand:{35:72,45:55,55:26,65:8}, factor:1.18, protection:true},
  EducationSavings: {type:"endowment", marker:"ED", baseDemand:{35:44,45:35,55:14,65:4}, factor:0.82, protection:true},
  SeniorCare: {type:"annuity", marker:"SC", baseDemand:{35:2,45:6,55:26,65:42}, factor:0.85, annuity:true}
};

const CHANNEL_FIT = {
  Online: {Term10:1.25, WL_Insurance:.90, Endow10:.86, WL_Annuity:.62, RetirementIncome:.72, FamilyProtection:1.20, EducationSavings:1.05, SeniorCare:.70},
  Adviser: {Term10:.95, WL_Insurance:1.20, Endow10:1.12, WL_Annuity:1.28, RetirementIncome:1.32, FamilyProtection:1.06, EducationSavings:1.10, SeniorCare:1.18},
  Employer: {Term10:1.15, WL_Insurance:.92, Endow10:.85, WL_Annuity:.75, RetirementIncome:.82, FamilyProtection:1.18, EducationSavings:.92, SeniorCare:.70},
  Bank: {Term10:.88, WL_Insurance:1.05, Endow10:1.20, WL_Annuity:.95, RetirementIncome:1.05, FamilyProtection:.86, EducationSavings:1.18, SeniorCare:1.02}
};

const SEGMENT_FIT = {
  Term10: {35:1.25,45:1.08,55:.82,65:.55},
  WL_Insurance: {35:.98,45:1.18,55:1.02,65:.70},
  Endow10: {35:.92,45:1.12,55:1.05,65:.62},
  WL_Annuity: {35:.25,45:.55,55:1.05,65:1.32},
  RetirementIncome: {35:.22,45:.62,55:1.15,65:1.28},
  FamilyProtection: {35:1.34,45:1.05,55:.70,65:.38},
  EducationSavings: {35:1.35,45:1.18,55:.56,65:.20},
  SeniorCare: {35:.18,45:.45,55:1.05,65:1.35}
};

const PIPELINE_STAGES = [
  {name:"Market Research", skills:["marketing","analytics","creativity"], attr:"buzz"},
  {name:"Actuarial Pricing", skills:["pricing","analytics","risk"], attr:"quality"},
  {name:"Risk Review", skills:["risk","compliance","pricing"], attr:"riskControl"},
  {name:"Marketing Campaign", skills:["marketing","creativity","service"], attr:"buzz"},
  {name:"Compliance Approval", skills:["compliance","risk","service"], attr:"trust"},
  {name:"Product Launch", skills:["service","marketing","speed"], attr:"quality"}
];

const ROLE_DEFS = {
  "Actuary": {
    avatar:"AC",
    description:"A careful modeller who loves clean assumptions and hates risky pricing.",
    impact:"Improves pricing accuracy, reduces claim mispricing risk and helps regulatory approval, but adds validation time.",
    strengths:["Pricing accuracy", "Regulatory confidence"],
    weaknesses:["Slower modelling"],
    salary:9000,
    hiringCost:15000,
    moodTrait:"Focused",
    staminaTrait:"Average",
    skills:{pricing:85,risk:70,marketing:20,service:35,speed:45,creativity:50,compliance:62,analytics:58},
    growth:1.0
  },
  "Underwriter": {
    avatar:"UW",
    description:"A disciplined risk selector who reads applications like detective notes.",
    impact:"Improves risk selection and product quality, reduces future claim shocks, but stricter acceptance reduces sales.",
    strengths:["Risk selection", "Claim shock control"],
    weaknesses:["Lower accepted sales"],
    salary:8200,
    hiringCost:13000,
    moodTrait:"Cautious",
    staminaTrait:"Steady",
    skills:{pricing:52,risk:86,marketing:18,service:52,speed:48,creativity:35,compliance:58,analytics:46},
    growth:1.0
  },
  "Marketing Specialist": {
    avatar:"MK",
    description:"A high-energy storyteller who turns boring policy wording into market buzz.",
    impact:"Improves buzz, fans, reputation and sales, but can increase campaign spending.",
    strengths:["Buzz", "Fans", "Sales"],
    weaknesses:["Campaign cost"],
    salary:7800,
    hiringCost:12000,
    moodTrait:"Outgoing",
    staminaTrait:"Bursty",
    skills:{pricing:22,risk:28,marketing:88,service:55,speed:62,creativity:82,compliance:28,analytics:45},
    growth:1.0
  },
  "Claims Manager": {
    avatar:"CL",
    description:"A calm operator who keeps bad claim years from becoming reputation disasters.",
    impact:"Reduces claim handling cost, improves customer trust and softens reputation loss after claim spikes.",
    strengths:["Trust", "Claim cost control"],
    weaknesses:["Limited launch buzz"],
    salary:7600,
    hiringCost:11000,
    moodTrait:"Calm",
    staminaTrait:"Durable",
    skills:{pricing:36,risk:62,marketing:30,service:86,speed:52,creativity:36,compliance:48,analytics:40},
    growth:1.0
  },
  "Customer Service Officer": {
    avatar:"CS",
    description:"A friendly listener who remembers policyholders by name.",
    impact:"Improves satisfaction, retention and reputation over time.",
    strengths:["Service", "Reputation growth"],
    weaknesses:["Low technical pricing skill"],
    salary:5600,
    hiringCost:8000,
    moodTrait:"Warm",
    staminaTrait:"Average",
    skills:{pricing:18,risk:30,marketing:45,service:90,speed:58,creativity:48,compliance:34,analytics:26},
    growth:1.1
  },
  "Data Scientist": {
    avatar:"DS",
    description:"A modeller who spots demand patterns before the market notices them.",
    impact:"Improves product success prediction, pricing forecast and unlocks sharper analytics.",
    strengths:["Forecasting", "Analytics"],
    weaknesses:["Needs training for customer service"],
    salary:9500,
    hiringCost:17000,
    moodTrait:"Curious",
    staminaTrait:"Average",
    skills:{pricing:70,risk:64,marketing:42,service:25,speed:56,creativity:68,compliance:35,analytics:92},
    growth:1.0
  },
  "Compliance Officer": {
    avatar:"CO",
    description:"A documentation expert who keeps regulators comfortable.",
    impact:"Improves approval chance and reduces penalties, but deeper reviews can slow product design.",
    strengths:["Approval", "Penalty control"],
    weaknesses:["Slower reviews"],
    salary:8400,
    hiringCost:14000,
    moodTrait:"Orderly",
    staminaTrait:"Steady",
    skills:{pricing:42,risk:62,marketing:18,service:48,speed:38,creativity:28,compliance:92,analytics:46},
    growth:1.0
  },
  "Junior Graduate": {
    avatar:"JG",
    description:"A low-cost trainee with rough skills and unusually high growth potential.",
    impact:"Starts weak but grows quickly through training.",
    strengths:["Low salary", "Fast growth"],
    weaknesses:["Low initial skill"],
    salary:3600,
    hiringCost:5000,
    moodTrait:"Eager",
    staminaTrait:"Fresh",
    skills:{pricing:30,risk:28,marketing:32,service:42,speed:55,creativity:50,compliance:28,analytics:35},
    growth:1.45
  }
};

const CANDIDATE_NAMES = [
  "Mira Chen","Nora Patel","Ari Stone","Bao Lin","Lina Park","Tobi Green","Vik Rao","Jo Harper",
  "Sana Brooks","Emi Fox","Rae Morgan","Noah West","Kira Dunn","Leo Tan","Ivy Cole","Max Rivers"
];

const EQUIPMENT = [
  {id:"basicDesk", name:"Basic Desk", category:"Work Equipment", cost:5000, space:1, minLevel:1, effect:"Allows one staff member to work comfortably.", effects:{workSpeed:.02}},
  {id:"actuarialStation", name:"Actuarial Workstation", category:"Work Equipment", cost:30000, space:1, minLevel:1, effect:"+15% pricing work speed. Best for Actuaries.", effects:{pricingSpeed:.15, workSpeed:.04}},
  {id:"underwritingDesk", name:"Underwriting Desk", category:"Work Equipment", cost:22000, space:1, minLevel:1, effect:"Improves risk selection. Best for Underwriters.", effects:{claimShock:.06, workSpeed:.03}},
  {id:"marketingDesk", name:"Marketing Desk", category:"Work Equipment", cost:20000, space:1, minLevel:1, effect:"Improves buzz and launch success. Best for Marketing Specialists.", effects:{workSpeed:.03, mood:1}},
  {id:"claimsDesk", name:"Claims Desk", category:"Work Equipment", cost:24000, space:1, minLevel:1, effect:"Reduces claim handling strain. Best for Claims Managers.", effects:{claimShock:.07}},
  {id:"serviceDesk", name:"Service Desk", category:"Work Equipment", cost:18000, space:1, minLevel:1, effect:"Improves customer trust. Best for Customer Service Officers.", effects:{mood:1, workSpeed:.02}},
  {id:"dataScienceStation", name:"Data Science Workstation", category:"Work Equipment", cost:42000, space:1, minLevel:2, effect:"Improves forecasting and analytics. Best for Data Scientists.", effects:{analytics:.12, workSpeed:.04}},
  {id:"complianceDesk", name:"Compliance Desk", category:"Work Equipment", cost:26000, space:1, minLevel:1, effect:"Reduces regulatory risk. Best for Compliance Officers.", effects:{regulatoryRisk:.08, workSpeed:.02}},
  {id:"whiteboard", name:"Whiteboard", category:"Work Equipment", cost:10000, space:1, minLevel:1, effect:"+10% product design speed.", effects:{workSpeed:.10}},
  {id:"coffee", name:"Coffee Machine", category:"Rest Equipment", cost:12000, space:1, minLevel:1, effect:"Small mood boost and faster stamina recovery.", effects:{mood:3, staminaRecovery:5}},
  {id:"kitchen", name:"Kitchen", category:"Rest Equipment", cost:50000, space:3, minLevel:2, effect:"Strong stamina recovery and fewer tired months.", effects:{mood:5, staminaRecovery:13}},
  {id:"sofa", name:"Sofa", category:"Rest Equipment", cost:18000, space:2, minLevel:1, effect:"Resting recovers stamina faster.", effects:{mood:3, staminaRecovery:8}},
  {id:"trainingLibrary", name:"Training Library", category:"Training Equipment", cost:40000, space:2, minLevel:3, effect:"Training gives extra skill points.", effects:{trainingBonus:3}},
  {id:"filing", name:"Compliance Filing Cabinet", category:"Prestige Equipment", cost:25000, space:1, minLevel:1, effect:"Reduces regulatory risk.", effects:{regulatoryRisk:.15}},
  {id:"claimsServer", name:"Claims Analytics Server", category:"Work Equipment", cost:60000, space:2, minLevel:3, effect:"Reduces claim shock impact.", effects:{claimShock:.18, analytics:.08}},
  {id:"plant", name:"Decor Plant", category:"Mood Equipment", cost:3000, space:1, minLevel:1, effect:"Small mood boost.", effects:{mood:2}},
  {id:"largePlant", name:"Large Office Plant", category:"Mood Equipment", cost:12000, space:2, minLevel:2, effect:"Bigger mood boost.", effects:{mood:5}},
  {id:"awardShelf", name:"Award Shelf", category:"Prestige Equipment", cost:8000, space:1, minLevel:1, effect:"Shows trophies and improves prestige.", effects:{prestige:.08}}
];

const TRAINING_COURSES = {
  pricing:{name:"Actuarial Pricing", cost:12000, stamina:18, skills:{pricing:8,risk:3,analytics:2}},
  risk:{name:"Risk Management", cost:11000, stamina:16, skills:{risk:8,compliance:3,pricing:2}},
  marketing:{name:"Marketing Strategy", cost:9500, stamina:14, skills:{marketing:8,creativity:4,service:2}},
  claims:{name:"Claims Management", cost:9000, stamina:14, skills:{service:6,risk:5,compliance:2}},
  service:{name:"Customer Service", cost:7000, stamina:12, skills:{service:8,marketing:2,creativity:2}},
  compliance:{name:"Regulation and Compliance", cost:10500, stamina:16, skills:{compliance:8,risk:3,pricing:2}},
  innovation:{name:"Product Innovation", cost:13000, stamina:18, skills:{creativity:8,marketing:3,analytics:3}},
  analytics:{name:"Data Analytics", cost:14000, stamina:18, skills:{analytics:8,pricing:3,risk:3}}
};

const TRAINING_QUESTIONS = [
  {course:"pricing", q:"What happens if profit loading is too high?", opts:["Sales may fall","Claims always disappear","Interest rate becomes zero","Staff salary decreases"], a:0, e:"Higher prices can improve margin per sale, but demand usually falls."},
  {course:"compliance", q:"Which staff member helps reduce regulatory penalty risk?", opts:["Compliance Officer","Marketing Specialist","Junior Graduate","Office Cleaner"], a:0, e:"Compliance Officers improve documentation and reduce penalty risk."},
  {course:"pricing", q:"Higher mortality assumptions usually increase the price of which product?", opts:["Life insurance","Coffee machine","Office rent","Staff salary"], a:0, e:"Protection products become more expensive when expected death claims rise."},
  {course:"risk", q:"What does stricter underwriting usually reduce?", opts:["Claim risk","All expenses forever","Staff training cost","Office space"], a:0, e:"Stricter underwriting accepts fewer high-risk customers."},
  {course:"marketing", q:"A strong marketing budget mainly increases...", opts:["Buzz and sales chance","Mortality rates","Regulatory penalties","Annuity payments"], a:0, e:"Marketing improves awareness, sales and fan growth."},
  {course:"claims", q:"Good claims handling most directly improves...", opts:["Trust after bad claim years","Product complexity","Interest rate","Office capacity"], a:0, e:"Fair, fast claims service protects reputation."},
  {course:"service", q:"High service quality usually improves...", opts:["Policyholder satisfaction","Claim frequency to zero","Salary-free staffing","Automatic trophies"], a:0, e:"Service quality improves trust, retention and reputation."},
  {course:"innovation", q:"High product complexity can help by...", opts:["Making the product more unique","Removing all regulatory review","Making claims impossible","Lowering every salary"], a:0, e:"Complexity can improve uniqueness, but it adds risk and development time."},
  {course:"analytics", q:"Data analytics helps the studio estimate...", opts:["Sales and pricing risk","The CEO's lunch","Office wall colour only","Guaranteed award wins"], a:0, e:"Analytics improves forecasts and product design choices."},
  {course:"compliance", q:"Deep compliance review is usually...", opts:["Slower but safer","Faster and riskier","Free money","A marketing slogan"], a:0, e:"More review takes time, but reduces approval and penalty risk."}
];

const CEO_QUESTIONS = [
  {difficulty:1, topic:"Pricing", q:"Your term life product has very high profit loading. What is the likely market effect?", opts:["Higher profit per sale but lower sales volume","Zero claims forever","Staff stamina increases automatically","Regulation becomes unnecessary"], a:0, e:"Higher loading increases price, which may reduce demand."},
  {difficulty:1, topic:"Insurance basics", q:"Term life insurance mainly pays when...", opts:["The insured dies during the term","The office renovates","Marketing budget is high","The CEO wins a trophy"], a:0, e:"Term cover pays a death benefit if death happens during the covered term."},
  {difficulty:1, topic:"Staff", q:"Which role is best for reducing regulatory penalties?", opts:["Compliance Officer","Marketing Specialist","Customer Service Officer","Junior Graduate"], a:0, e:"Compliance specialists reduce approval and penalty risk."},
  {difficulty:2, topic:"Risk", q:"Low underwriting strictness can increase...", opts:["Sales and future claim risk","Office capacity only","Staff salary discounts","Interest income forever"], a:0, e:"Loose underwriting accepts more customers, including riskier lives."},
  {difficulty:2, topic:"Actuarial pricing", q:"Aggressive interest assumptions can make prices look...", opts:["Cheaper but riskier","More expensive and risk-free","Unrelated to pricing","Impossible to calculate"], a:0, e:"Higher assumed investment return can reduce EPV price but increases model risk."},
  {difficulty:2, topic:"Claims", q:"A Claims Manager helps most when...", opts:["Claims spike and reputation is at risk","Marketing budget is zero","No policies exist","The office is empty"], a:0, e:"Claims expertise lowers handling costs and reputation damage."},
  {difficulty:3, topic:"Product design", q:"Deep compliance review usually trades...", opts:["Speed for safety","Safety for no cost","Sales for salaries","Claims for furniture"], a:0, e:"Thorough review is slower but improves approval and reduces penalties."},
  {difficulty:3, topic:"Annuities", q:"Longer lifetimes are most dangerous for...", opts:["Annuity products","Expired term policies","Office plants","Recruitment ads"], a:0, e:"Annuities pay for life, so longer lives increase payments."},
  {difficulty:3, topic:"Strategy", q:"Why should the studio diversify products?", opts:["Different products react differently to shocks","It removes all risk","It guarantees 10 stars","It makes training free"], a:0, e:"Diversification reduces dependence on one product risk."},
  {difficulty:4, topic:"Solvency", q:"A strong solvency position is helped by...", opts:["Cash, risk control and reasonable claims","Low mood and high penalties","Only marketing buzz","Ignoring qx"], a:0, e:"Solvency improves with capital, controlled claims and risk discipline."},
  {difficulty:4, topic:"Business", q:"Heavy marketing on a weak product usually...", opts:["Wastes money and may disappoint customers","Removes claim risk","Improves qx","Forces regulators to approve"], a:0, e:"Marketing cannot fully compensate for poor product quality or trust."},
  {difficulty:5, topic:"Management", q:"On Fire staff are productive, but the CEO must watch...", opts:["Stamina drain","Policy benefit amounts only","Leaderboard rank only","Office colour"], a:0, e:"On Fire boosts work speed but drains stamina faster."}
];

const ACHIEVEMENTS = [
  {id:"firstHire", name:"First Hire", desc:"Hire your first candidate.", test:s => s.staff.length >= 3},
  {id:"firstLaunch", name:"First Product Launch", desc:"Launch one product.", test:s => s.products.length >= 1},
  {id:"firstMillion", name:"First Million", desc:"Reach $1,000,000 cash.", test:s => s.cash >= 1_000_000},
  {id:"perfectQuiz", name:"Perfect CEO Quiz", desc:"Score 5/5 in the championship.", test:s => s.ceoHistory.some(h => h.correct === 5)},
  {id:"happyOffice", name:"Happy Office", desc:"Average staff mood reaches 80.", test:s => avgStaff(s, "mood") >= 80},
  {id:"onFireTeam", name:"On Fire Team", desc:"A staff member enters On Fire mode.", test:s => s.staff.some(m => m.onFireMonths > 0)},
  {id:"riskMaster", name:"Risk Master", desc:"Average risk skill reaches 75.", test:s => avgSkill(s, "risk") >= 75},
  {id:"claimsSurvivor", name:"Claims Survivor", desc:"Survive a claim shock event.", test:s => s.flags.claimShockSurvived},
  {id:"fiveStar", name:"Five-Star Product", desc:"Launch a product scoring 9.0 or higher.", test:s => s.products.some(p => p.stars >= 9)},
  {id:"regChampion", name:"Regulation Champion", desc:"Win with strong compliance.", test:s => avgSkill(s, "compliance") >= 75}
];

const NEWSPAPERS = [
  "Tiny insurer surprises market with clever new product!",
  "Customers love simple protection plan!",
  "Claims shock tests insurer capital strength!",
  "CEO wins national insurance knowledge contest!",
  "New office kitchen boosts staff morale!",
  "Analysts praise a careful insurance launch!",
  "Policyholders cheer fast claims handling!"
];

const CEO_TIPS = [
  "High loading improves margin, but customers may leave if prices feel unfair.",
  "Underwriting strictness lowers future claims but can reduce accepted sales.",
  "Deep compliance review is slower, but it prevents expensive surprises.",
  "Training weak staff is often cheaper than hiring experts, but it takes time.",
  "On Fire staff are useful for a deadline. Rest them before burnout.",
  "Equipment is not cosmetic. Coffee, desks and systems change productivity."
];

const qx = [
  0.003020,0.000230,0.000147,0.000092,0.000083,0.000075,0.000070,0.000067,0.000065,0.000064,
  0.000064,0.000066,0.000075,0.000093,0.000122,0.000161,0.000191,0.000210,0.000219,0.000223,
  0.000222,0.000220,0.000220,0.000222,0.000229,0.000238,0.000252,0.000268,0.000288,0.000311,
  0.000338,0.000367,0.000400,0.000436,0.000474,0.000515,0.000560,0.000606,0.000656,0.000707,
  0.000765,0.000838,0.000917,0.001000,0.001089,0.001179,0.001289,0.001389,0.001509,0.001629,
  0.001768,0.001908,0.002058,0.002228,0.002397,0.002587,0.002796,0.003006,0.003235,0.003484,
  0.003743,0.004032,0.004361,0.004729,0.005167,0.005664,0.006241,0.006906,0.007681,0.008554,
  0.009555,0.010644,0.011930,0.013411,0.014989,0.016761,0.018922,0.021373,0.024306,0.027620,
  0.031601,0.036146,0.041437,0.047560,0.054686,0.062792,0.072134,0.082580,0.094456,0.107885,
  0.122077,0.138665,0.154903,0.171680,0.187272,0.204221,0.221573,0.242152,0.263514,0.285616,
  0.308316,0.331444,0.354809,0.378192,0.401359,0.424064,0.446056,0.467092,0.486945,0.505382
];

let state = normalizeState(loadFromStorage() || freshState());

function freshState() {
  return {
    saveVersion: SAVE_VERSION,
    month: 1,
    cash: START_CASH,
    fans: 1000,
    reputation: 5,
    research: 20,
    solvency: 150,
    interestRate: 0.04,
    mortalityShock: 1,
    expenseRate: 0.12,
    office: 1,
    staff: starterStaff(),
    designSettings: null,
    candidates: generateCandidateRound(1),
    equipment: ["basicDesk", "basicDesk", "basicDesk", "plant"],
    officeLayout: null,
    officeView: {zoom: 1, panX: 0, panY: 0},
    officeMotion: {},
    currentTab: "studio",
    saveDirty: false,
    lastSavedAt: null,
    equipmentFilter: "All",
    uiSettings: {animations: true, compactMobile: false},
    selectedOfficeItem: null,
    officeEventLog: ["Staff arrive through the front door and settle into their desks."],
    liveOfficeEvents: [],
    currentProject: null,
    projectChoice: null,
    trainingSession: null,
    policies: [],
    products: [],
    awards: [],
    trophies: [],
    achievements: [],
    flags: {},
    ceoHistory: [],
    ceoStreak: 0,
    quiz: null,
    cashFlow: [],
    cashHist: [{month:1, cash:START_CASH}],
    leaderboard: getLeaderboard(),
    lastLaunchReport: null,
    yearSummary: null,
    newspaper: "Tiny insurer opens with careful pricing and a small team.",
    ticker: "Open the Lab or recruit a specialist.",
    tip: choice(CEO_TIPS),
    floaters: [],
    confetti: 0
  };
}

function starterStaff() {
  return [
    staffFromTemplate({...ROLE_DEFS.Actuary, name:"Mika Sato", role:"Actuary"}, true),
    staffFromTemplate({...ROLE_DEFS.Underwriter, name:"Bao Lin", role:"Underwriter"}, true)
  ];
}

function normalizeState(s) {
  const fresh = freshStateSkeleton();
  const merged = {...fresh, ...s};
  merged.saveVersion = Number.isFinite(Number(merged.saveVersion)) ? Number(merged.saveVersion) : SAVE_VERSION;
  merged.staff = (merged.staff || []).map(normalizeStaff);
  merged.staff.forEach((m, i) => {
    if (!m.assignedDeskId) m.assignedDeskId = `d${i + 1}`;
  });
  merged.candidates = Array.isArray(merged.candidates) && merged.candidates.length === 3 ? merged.candidates : generateCandidateRound(merged.office || 1);
  merged.equipment = Array.isArray(merged.equipment) ? merged.equipment : ["basicDesk", "basicDesk", "basicDesk", "plant"];
  while (countOwnedDesks(merged) < Math.min(merged.staff.length, staffCapacityForOffice(merged.office || 1))) merged.equipment.unshift("basicDesk");
  merged.officeEventLog = Array.isArray(merged.officeEventLog) ? merged.officeEventLog : ["Office routines restored."];
  merged.liveOfficeEvents = Array.isArray(merged.liveOfficeEvents) ? merged.liveOfficeEvents : [];
  merged.officeMotion = merged.officeMotion && typeof merged.officeMotion === "object" ? merged.officeMotion : {};
  merged.officeView = window.ResponsiveOfficeSystem?.normalizeView ? window.ResponsiveOfficeSystem.normalizeView(merged.officeView) : (merged.officeView || {zoom:1, panX:0, panY:0});
  merged.currentTab = ["studio","staff","project","officePanel","finance","events","quiz","awards","settings"].includes(merged.currentTab) ? merged.currentTab : "studio";
  merged.saveDirty = Boolean(merged.saveDirty);
  merged.lastSavedAt = merged.lastSavedAt || null;
  merged.equipmentFilter = typeof merged.equipmentFilter === "string" ? merged.equipmentFilter : "All";
  merged.uiSettings = {...fresh.uiSettings, ...(merged.uiSettings || {})};
  merged.selectedOfficeItem = merged.selectedOfficeItem || null;
  merged.achievements = Array.isArray(merged.achievements) ? merged.achievements : [];
  merged.trophies = Array.isArray(merged.trophies) ? merged.trophies : [];
  merged.ceoHistory = Array.isArray(merged.ceoHistory) ? merged.ceoHistory : [];
  merged.flags = merged.flags || {};
  merged.floaters = Array.isArray(merged.floaters) ? merged.floaters : [];
  if (merged.currentProject && !merged.currentProject.design) merged.currentProject = null;
  return merged;
}

function freshStateSkeleton() {
  return {
    saveVersion:SAVE_VERSION,
    month:1, cash:START_CASH, fans:1000, reputation:5, research:20, solvency:150,
    interestRate:.04, mortalityShock:1, expenseRate:.12, office:1, staff:[], candidates:[],
    designSettings:null, equipment:[], officeLayout:null, officeView:{zoom:1, panX:0, panY:0}, officeMotion:{}, currentTab:"studio", saveDirty:false, lastSavedAt:null, equipmentFilter:"All", uiSettings:{animations:true, compactMobile:false}, selectedOfficeItem:null, officeEventLog:[], liveOfficeEvents:[], currentProject:null, projectChoice:null, trainingSession:null, policies:[],
    products:[], awards:[], trophies:[], achievements:[], flags:{}, ceoHistory:[],
    ceoStreak:0, quiz:null, cashFlow:[], cashHist:[], leaderboard:getLeaderboard(),
    lastLaunchReport:null, yearSummary:null, newspaper:"", ticker:"", tip:choice(CEO_TIPS),
    lastTrainingResult:null, floaters:[], confetti:0
  };
}

function normalizeStaff(m) {
  const skills = m.skills || {
    pricing: scaleOldSkill(m.pricing),
    risk: scaleOldSkill(m.risk),
    marketing: scaleOldSkill(m.marketing),
    service: scaleOldSkill(m.service),
    speed: scaleOldSkill(m.speed),
    creativity: 45,
    compliance: 40,
    analytics: 40
  };
  const role = m.role === "Chief Actuary" ? "Actuary" : m.role === "Marketing Lead" ? "Marketing Specialist" : m.role || "Junior Graduate";
  return {
    id: m.id || cryptoId(),
    name: m.name || "Staff",
    role,
    avatar: m.avatar || roleInitial(role),
    description: m.description || ROLE_DEFS[role]?.description || "A capable insurance studio teammate.",
    salary: Number(m.salary) || ROLE_DEFS[role]?.salary || 6000,
    hiringCost: Number(m.hiringCost) || ROLE_DEFS[role]?.hiringCost || 8000,
    skills: normalizeSkills(skills),
    strengths: m.strengths || ROLE_DEFS[role]?.strengths || [],
    weaknesses: m.weaknesses || ROLE_DEFS[role]?.weaknesses || [],
    impact: m.impact || ROLE_DEFS[role]?.impact || "",
    moodTrait: m.moodTrait || ROLE_DEFS[role]?.moodTrait || "Steady",
    staminaTrait: m.staminaTrait || ROLE_DEFS[role]?.staminaTrait || "Average",
    mood: clamp(Number(m.mood ?? 70), 0, 100),
    stamina: clamp(Number(m.stamina ?? 100), 0, 100),
    loyalty: clamp(Number(m.loyalty ?? 75), 0, 100),
    level: Number(m.level) || 1,
    xp: Number(m.xp) || 0,
    growthRate: Number(m.growthRate) || ROLE_DEFS[role]?.growth || 1,
    task: m.task || "Idle",
    status: m.status || "Working",
    routineState: m.routineState || "Arriving",
    routineTarget: m.routineTarget || null,
    routinePath: Array.isArray(m.routinePath) ? m.routinePath : [],
    assignedDeskId: m.assignedDeskId || null,
    onFireMonths: Number(m.onFireMonths) || 0,
    sickMonths: Number(m.sickMonths) || 0
  };
}

function normalizeSkills(skills) {
  const keys = ["pricing","risk","marketing","service","speed","creativity","compliance","analytics"];
  const out = {};
  keys.forEach(k => out[k] = clamp(Number(skills[k] ?? 40), 0, 100));
  return out;
}

function scaleOldSkill(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 45;
  return n <= 10 ? n * 10 : n;
}

function staffFromTemplate(candidate, starter=false) {
  return normalizeStaff({
    id: cryptoId(),
    name: candidate.name,
    role: candidate.role,
    avatar: candidate.avatar || ROLE_DEFS[candidate.role]?.avatar || roleInitial(candidate.role),
    description: candidate.description,
    salary: candidate.salary,
    hiringCost: candidate.hiringCost,
    skills: candidate.skills,
    strengths: candidate.strengths,
    weaknesses: candidate.weaknesses,
    impact: candidate.impact,
    moodTrait: candidate.moodTrait,
    staminaTrait: candidate.staminaTrait,
    mood: starter ? 76 : 70,
    stamina: starter ? 94 : 100,
    loyalty: starter ? 82 : 72,
    level: 1,
    xp: 0,
    growthRate: candidate.growthRate || ROLE_DEFS[candidate.role]?.growth || 1,
    task: "Idle",
    status: "Working"
  });
}

function generateCandidateRound(officeLevel=1) {
  const roles = Object.keys(ROLE_DEFS);
  const unlocked = roles.filter(role => {
    if (officeLevel < 2 && ["Data Scientist","Compliance Officer"].includes(role)) return false;
    if (officeLevel < 3 && role === "Claims Manager") return false;
    return true;
  });
  return shuffle(unlocked).slice(0, 3).map((role, i) => makeCandidate(role, i));
}

function makeCandidate(role, offset=0) {
  const base = ROLE_DEFS[role];
  const variance = rand(.92, 1.12);
  const name = CANDIDATE_NAMES[(Math.floor(Math.random() * CANDIDATE_NAMES.length) + offset) % CANDIDATE_NAMES.length];
  const skills = {};
  Object.entries(base.skills).forEach(([k, v]) => skills[k] = clamp(Math.round(v * variance + rand(-4, 5)), 5, 100));
  return {
    id: cryptoId(),
    name,
    role,
    avatar: base.avatar,
    description: base.description,
    salary: Math.round(base.salary * rand(.9, 1.15) / 100) * 100,
    hiringCost: Math.round(base.hiringCost * rand(.9, 1.2) / 100) * 100,
    skills,
    strengths: base.strengths,
    weaknesses: base.weaknesses,
    impact: base.impact,
    moodTrait: base.moodTrait,
    staminaTrait: base.staminaTrait,
    growthRate: base.growth
  };
}

function $(id) { return document.getElementById(id); }
function cryptoId() { return Math.random().toString(36).slice(2, 10); }
function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
function rand(min, max) { return min + Math.random() * (max - min); }
function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function money(x) { return "$" + Math.round(x || 0).toLocaleString(); }
function pct(x) { return Math.round(x) + "%"; }
function year() { return Math.floor((state.month - 1) / 12) + 1; }
function monthOfYear() { return ((state.month - 1) % 12) + 1; }
function dateText() { return `Y${year()} ${MONTHS[monthOfYear()-1]}`; }
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function roleInitial(role) { return String(role || "S").split(/\s+/).map(w => w[0]).join("").slice(0,2).toUpperCase(); }

function toast(msg) {
  state.ticker = msg;
  const t = $("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 2800);
}

function pushOfficeEvent(msg) {
  state.officeEventLog = [msg, ...(state.officeEventLog || [])].slice(0, 8);
}

function achievementToast(msg) {
  const t = $("achievementPop");
  if (!t) return;
  t.textContent = msg;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 3600);
}

function poisson(lambda) {
  lambda = Math.max(0, lambda || 0);
  if (lambda > 60) return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * gaussian()));
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= Math.random(); } while (p > L);
  return k - 1;
}

function gaussian() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function qxAt(age) {
  const a = Math.floor(age);
  if (a < 0) return 0;
  if (a >= qx.length) return 1;
  return qx[a];
}

function adjustedQx(age, mortalityMargin, product) {
  const spec = PRODUCT_SPECS[product] || PRODUCT_SPECS.Term10;
  const base = qxAt(age);
  const factor = spec.annuity ? 1 - mortalityMargin * .85 : 1 + mortalityMargin;
  return clamp(base * factor, 0.00001, .95);
}

function npxScaled(age, n, margin, product) {
  let p = 1;
  for (let k = 0; k < n; k++) p *= Math.max(1 - adjustedQx(age + k, margin, product), 0);
  return p;
}

function epvWholeLifeInsurance(age, i, benefit, margin, product) {
  const v = 1 / (1 + i);
  let total = 0;
  for (let t = 1; t <= Math.max(0, 109 - age); t++) {
    total += Math.pow(v, t) * npxScaled(age, t - 1, margin, product) * adjustedQx(age + t - 1, margin, product);
  }
  return benefit * total;
}

function epvTermInsurance(age, i, n, benefit, margin, product) {
  const v = 1 / (1 + i);
  let total = 0;
  for (let t = 1; t <= n; t++) {
    total += Math.pow(v, t) * npxScaled(age, t - 1, margin, product) * adjustedQx(age + t - 1, margin, product);
  }
  return benefit * total;
}

function epvEndowment(age, i, n, benefit, margin, product) {
  return epvTermInsurance(age, i, n, benefit, margin, product) + benefit * Math.pow(1/(1+i), n) * npxScaled(age, n, margin, product);
}

function epvAnnuity(age, i, payment, margin, product) {
  const v = 1 / (1 + i);
  let total = 0;
  for (let t = 1; t <= Math.max(0, 109 - age); t++) total += Math.pow(v, t) * npxScaled(age, t, margin, product);
  return payment * total;
}

function getInputs() {
  return {
    player: $("playerName")?.value.trim() || "CEO",
    company: $("companyName")?.value.trim() || "Company",
    benefit: Number($("benefit")?.value) || 100000,
    annPayment: Number($("annPayment")?.value) || 10000,
    loading: Number($("loading")?.value) || 0.15,
    product: $("productType")?.value || "Term10",
    productName: $("productName")?.value.trim() || "",
    age: Number($("segment")?.value) || 35,
    channel: $("channel")?.value || "Online",
    assumedInterest: Number($("assumedInterest")?.value) || 0.04,
    mortalityMargin: Number($("mortalityMargin")?.value) || 0.10,
    marketingBudget: Number($("marketingBudget")?.value) || 0,
    underwritingStrictness: Number($("underwritingStrictness")?.value) || 50,
    serviceQuality: Number($("serviceQuality")?.value) || 55,
    complianceDepth: Number($("complianceDepth")?.value) || 55,
    productComplexity: Number($("productComplexity")?.value) || 45
  };
}

function fairPrice(product, age, benefit, annPayment, interest, mortalityMargin) {
  const inp = getInputs();
  const spec = PRODUCT_SPECS[product] || PRODUCT_SPECS.Term10;
  const i = interest ?? inp.assumedInterest ?? state.interestRate;
  const margin = mortalityMargin ?? inp.mortalityMargin ?? 0;
  const sumAssured = (benefit ?? inp.benefit) * spec.factor;
  const payment = (annPayment ?? inp.annPayment) * spec.factor;
  if (spec.type === "term") return epvTermInsurance(age, i, 10, sumAssured, margin, product);
  if (spec.type === "whole") return epvWholeLifeInsurance(age, i, sumAssured, margin, product);
  if (spec.type === "endowment") return epvEndowment(age, i, 10, sumAssured, margin, product);
  if (spec.type === "annuity") return epvAnnuity(age, i, payment, margin, product);
  return 0;
}

function marketFit(product, age, channel) {
  return (SEGMENT_FIT[product]?.[age] || 1) * (CHANNEL_FIT[channel]?.[product] || 1);
}

function staffCapacity() { return officeConfig().maxStaff; }
function equipmentCapacity() { return officeConfig().equipmentSpace; }
function officeConfig(level=state.office) { return OFFICE_LEVELS.find(o => o.level === level) || OFFICE_LEVELS[0]; }
function staffCapacityForOffice(level) { return officeConfig(level).maxStaff; }
function nextOfficeConfig() { return OFFICE_LEVELS.find(o => o.level === state.office + 1); }
function installedSpace() { return state.equipment.reduce((sum, id) => sum + (equipmentById(id)?.space || 0), 0); }
function equipmentById(id) { return EQUIPMENT.find(e => e.id === id); }
function countOwnedDesks(s=state) {
  if (window.OfficeLayoutSystem?.ownedDeskIds) return window.OfficeLayoutSystem.ownedDeskIds(s).length;
  const deskIds = new Set(["basicDesk", "actuarialStation", "underwritingDesk", "marketingDesk", "claimsDesk", "serviceDesk", "dataScienceStation", "complianceDesk"]);
  return (s.equipment || []).filter(id => deskIds.has(id)).length;
}

function equipmentEffects() {
  const totals = {workSpeed:0, pricingSpeed:0, trainingBonus:0, staminaRecovery:0, mood:0, regulatoryRisk:0, claimShock:0, prestige:0, analytics:0};
  state.equipment.forEach(id => {
    const item = equipmentById(id);
    if (!item) return;
    Object.entries(item.effects).forEach(([k, v]) => totals[k] = (totals[k] || 0) + v);
  });
  return totals;
}

function roleCounts() {
  return state.staff.reduce((acc, m) => {
    acc[m.role] = (acc[m.role] || 0) + 1;
    return acc;
  }, {});
}

function staffSkill(skill) {
  if (!state.staff.length) return 0;
  const total = state.staff.reduce((sum, m) => sum + (m.skills?.[skill] || 0) * moodFactor(m) * statusFactor(m), 0);
  return total / state.staff.length;
}

function avgSkill(s, skill) {
  if (!s.staff?.length) return 0;
  return s.staff.reduce((sum, m) => sum + (m.skills?.[skill] || 0), 0) / s.staff.length;
}

function avgStaff(s, prop) {
  if (!s.staff?.length) return 0;
  return s.staff.reduce((sum, m) => sum + Number(m[prop] || 0), 0) / s.staff.length;
}

function moodFactor(m) { return clamp(.65 + (m.mood || 50) / 120, .55, 1.45); }
function staminaFactor(m) { return clamp((m.stamina || 0) / 100, .20, 1); }
function statusFactor(m) {
  if (m.sickMonths > 0) return .45;
  if (m.onFireMonths > 0) return 1.45;
  if (m.stamina < 15) return .35;
  return staminaFactor(m);
}

function calcForecast(inp=getInputs()) {
  const effects = equipmentEffects();
  const roles = roleCounts();
  const pricingSkill = staffSkill("pricing") + effects.pricingSpeed * 40;
  const riskSkill = staffSkill("risk");
  const marketingSkill = staffSkill("marketing");
  const serviceSkill = staffSkill("service");
  const complianceSkill = staffSkill("compliance");
  const analyticsSkill = staffSkill("analytics") + effects.analytics * 100;
  const creativitySkill = staffSkill("creativity");
  const speedSkill = staffSkill("speed");
  const fit = marketFit(inp.product, inp.age, inp.channel);
  const fair = fairPrice(inp.product, inp.age, inp.benefit, inp.annPayment, inp.assumedInterest, inp.mortalityMargin);
  const loaded = fair * (1 + inp.loading);
  const aggressiveInterest = Math.max(0, inp.assumedInterest - .045) * 100;
  const highLoading = Math.max(0, inp.loading - .22);
  const lowLoading = Math.max(0, .08 - inp.loading);
  const priceAttract = clamp(1.34 - inp.loading * 2.15 + lowLoading * 1.4, .18, 1.45);
  const baseDemand = PRODUCT_SPECS[inp.product].baseDemand[inp.age] * fit;
  const acceptedSales = clamp(1 - inp.underwritingStrictness * .004, .48, 1.05);
  const designMonths = clamp(Math.round(
    2.2 + inp.productComplexity / 24 + inp.complianceDepth / 42 + aggressiveInterest / 3.5 +
    (roles.Actuary || 0) * .25 + (roles["Compliance Officer"] || 0) * .15 -
    speedSkill / 55 - effects.workSpeed * 2
  ), 2, 14);
  const quality = clamp(32 + pricingSkill * .2 + riskSkill * .14 + creativitySkill * .15 + inp.productComplexity * .18 + analyticsSkill * .08 - aggressiveInterest * 2.2, 5, 98);
  const salesChance = clamp(18 + baseDemand * priceAttract * .75 + inp.marketingBudget / 2800 + marketingSkill * .22 - inp.underwritingStrictness * .18 - highLoading * 95, 3, 97);
  const profitMargin = clamp(inp.loading * 100 - inp.marketingBudget / 16000 - inp.serviceQuality * .025 + inp.underwritingStrictness * .035, -10, 48);
  const regulatoryApproval = clamp(40 + inp.complianceDepth * .38 + complianceSkill * .24 + pricingSkill * .10 - aggressiveInterest * 5 - inp.productComplexity * .11 + effects.regulatoryRisk * 40, 5, 98);
  const claimRisk = clamp(62 - inp.underwritingStrictness * .34 - inp.mortalityMargin * 42 - riskSkill * .20 - (roles.Underwriter || 0) * 5 - effects.claimShock * 45 + aggressiveInterest * 1.7, 4, 96);
  const customerTrust = clamp(35 + inp.serviceQuality * .32 + serviceSkill * .18 + inp.complianceDepth * .10 + state.reputation * 2.5 - highLoading * 120 - claimRisk * .08, 5, 98);
  const requiredEffort = clamp(Math.round(designMonths * (8 + inp.productComplexity / 12 + inp.complianceDepth / 18)), 20, 220);
  const lowReview = clamp(1.5 + quality * .028 + customerTrust * .018 + salesChance * .006 - claimRisk * .012 - aggressiveInterest * .18, 1, 10);
  const highReview = clamp(lowReview + 1.8 + inp.productComplexity / 75 + marketingSkill / 150, 1, 10);
  const warnings = [];
  if (inp.loading > .28) warnings.push({type:"bad", text:"High loading: more profit per sale but fewer customers and lower trust."});
  if (inp.loading < .07) warnings.push({type:"good", text:"Low loading: easier sales but thinner profit margin."});
  if (inp.assumedInterest > .055) warnings.push({type:"bad", text:"Aggressive interest rate: cheaper price but higher model and regulatory risk."});
  if (inp.complianceDepth > 70) warnings.push({type:"good", text:"Deep compliance review: slower but safer."});
  if (inp.productComplexity > 75) warnings.push({type:"bad", text:"Complex product: more uniqueness, but needs stronger staff and more time."});
  if (inp.underwritingStrictness > 75) warnings.push({type:"good", text:"Strict underwriting: fewer accepted customers, lower future claims."});
  if (inp.marketingBudget > 100000) warnings.push({type:"bad", text:"Large marketing budget: strong buzz, but weak products waste money."});
  return {
    fair, loaded, fit, baseDemand, priceAttract, designMonths, quality, salesChance, profitMargin,
    regulatoryApproval, claimRisk, customerTrust, requiredEffort, reviewLow: lowReview, reviewHigh: highReview, warnings
  };
}

function startProject() {
  if (state.currentProject) return toast("Finish the current product first.");
  const inp = getInputs();
  const forecast = calcForecast(inp);
  const kickoffCost = Math.round(28_000 + inp.marketingBudget * .35 + inp.complianceDepth * 260 + inp.productComplexity * 330);
  if (state.cash < kickoffCost) return toast(`Need ${money(kickoffCost)} to start this product.`);
  state.cash -= kickoffCost;
  const target = Math.round(42 + inp.productComplexity * .16 + inp.complianceDepth * .08 + forecast.designMonths * 1.2);
  state.currentProject = {
    id: cryptoId(),
    name: inp.productName || makeProductName(inp.product, inp.age, inp.channel),
    product: inp.product,
    age: inp.age,
    channel: inp.channel,
    benefit: inp.benefit,
    annPayment: inp.annPayment,
    design: {...inp},
    forecast,
    stageIndex: 0,
    stageProgress: 0,
    stageTarget: target,
    months: 0,
    spent: kickoffCost,
    attrs: {
      quality: forecast.quality * .22,
      trust: forecast.customerTrust * .18,
      buzz: inp.marketingBudget / 2600,
      riskControl: Math.max(8, 100 - forecast.claimRisk),
      innovation: inp.productComplexity * .25
    },
    riskDebt: Math.max(0, 45 - forecast.regulatoryApproval) + Math.max(0, forecast.claimRisk - 60) * .25,
    notes: [`Kickoff cost ${money(kickoffCost)}.`]
  };
  addCashFlow("Project kickoff", -kickoffCost, 0, kickoffCost, `${state.currentProject.name} started.`);
  state.newspaper = "A new insurance product enters the design studio.";
  toast("New product development started.");
  saveToStorage();
  render();
}

function makeProductName(product, age) {
  const prefixes = ["Bright", "Future", "Safe", "Sunny", "Kind", "Clever", "Bridge", "Nest"];
  const segment = age === 35 ? "Family" : age === 45 ? "Growth" : age === 55 ? "Bridge" : "Retiree";
  return `${choice(prefixes)} ${segment} ${PRODUCT_NAMES[product]}`;
}

function advanceMonth() {
  if (year() > MAX_YEARS || state.cash < 0) return;
  const periodDate = dateText();
  const opening = state.cash;
  let income = 0, salaries = 0, claims = 0, expenses = 0;
  const notes = [];

  const staffMonth = runStaffMonth();
  salaries += staffMonth.salaries;
  expenses += staffMonth.officeCost;
  if (staffMonth.note) notes.push(staffMonth.note);

  const interest = Math.max(0, opening) * (state.interestRate / 12);
  state.cash += interest;
  income += interest;

  const policy = runPolicyExperience();
  claims += policy.claims;
  expenses += policy.serviceCost;
  state.cash += policy.premiums - policy.claims - policy.serviceCost;
  income += policy.premiums;
  if (policy.claims > 0) notes.push(`Claims and annuity payments: ${money(policy.claims)}.`);
  if (policy.claimSpike) {
    notes.push("Claim warning: a spike tested capital strength.");
    addFloater("Claims surge!", "bad");
  }

  if (state.currentProject) {
    const dev = developProjectOneMonth();
    expenses += dev.extraCost;
    if (dev.note) notes.push(dev.note);
  }

  const event = monthlyRandomEvent();
  income += event.income;
  expenses += event.expense;
  if (event.note) notes.push(event.note);

  updateSolvencyAndReputation(policy.claimSpike);
  if (monthOfYear() === 12) annualCeremony(year());

  const closing = state.cash;
  state.cashFlow.push({
    date: periodDate,
    opening,
    income,
    salaries,
    claims,
    expenses,
    closing,
    note: notes.join(" ") || "Quiet month."
  });
  state.cashHist.push({month: state.month, cash: state.cash});
  state.flags.monthlySummaryDismissed = false;
  state.month += 1;
  state.floaters = state.floaters.map(f => ({...f, ttl: f.ttl - 1})).filter(f => f.ttl > 0);
  state.confetti = Math.max(0, state.confetti - 1);
  state.tip = choice(CEO_TIPS);
  if (state.cash < 0) {
    publishRun(true);
    state.newspaper = "Regulator steps in after insurer runs out of cash.";
    toast("Insolvent. Run published to leaderboard.");
  }
  checkAchievements();
  saveToStorage();
  render();
}

function runStaffMonth() {
  const effects = equipmentEffects();
  const salaries = state.staff.reduce((sum, m) => sum + m.salary, 0);
  state.cash -= salaries;
  const officeCost = state.equipment.length * 120 + state.staff.length * 90;
  state.cash -= officeCost;
  let note = "";
  state.staff.forEach(m => {
    if (m.sickMonths > 0) {
      m.sickMonths -= 1;
      m.status = "Sick";
      m.stamina = clamp(m.stamina + 4, 0, 100);
      m.mood = clamp(m.mood - 1, 0, 100);
      return;
    }
    if (!state.currentProject || m.task === "Resting") {
      m.stamina = clamp(m.stamina + 10 + effects.staminaRecovery, 0, 100);
      m.mood = clamp(m.mood + 1 + effects.mood * .12, 0, 100);
      m.status = "Resting";
    } else {
      m.mood = clamp(m.mood - (m.stamina < 25 ? 3 : .6) + effects.mood * .08, 0, 100);
    }
    if (m.onFireMonths > 0) {
      m.onFireMonths -= 1;
      m.status = "On Fire";
    } else if (m.mood > 85 && m.stamina > 50 && Math.random() < .08) {
      m.onFireMonths = 2;
      m.status = "On Fire";
      note = `${m.name} entered On Fire mode.`;
      pushOfficeEvent(`${m.name} is On Fire at their workstation.`);
    } else if (m.stamina < 18) {
      m.status = "Tired";
      pushOfficeEvent(`${m.name} looks tired and should visit the sofa or kitchen.`);
    } else if (m.mood > 78) {
      m.status = "Inspired";
    }
  });
  return {salaries, officeCost, note};
}

function runPolicyExperience() {
  let claims = 0;
  let premiums = 0;
  let serviceCost = 0;
  let claimSpike = false;
  const effects = equipmentEffects();
  const claimsManagerHelp = state.staff.filter(m => m.role === "Claims Manager").length * .08;
  const underwriterHelp = state.staff.filter(m => m.role === "Underwriter").length * .05;
  for (const p of state.policies) {
    if (p.active <= 0) continue;
    const activeAtStart = p.active;
    p.monthsInforce += 1;
    premiums += activeAtStart * monthlyPremiumForPolicy(p);
    const ageNow = p.age + Math.floor(p.monthsInforce / 12);
    const claimRiskFactor = 1 + (p.claimRisk || 40) / 100 - effects.claimShock - underwriterHelp;
    const monthlyDeathProb = clamp((qxAt(ageNow) * state.mortalityShock * claimRiskFactor) / 12, 0, 1);
    const deaths = Math.min(p.active, poisson(p.active * monthlyDeathProb));
    const handlingDiscount = clamp(1 - claimsManagerHelp - effects.claimShock * .35, .58, 1);
    if (p.annuity) {
      claims += p.active * p.payment / 12;
      p.active -= deaths;
    } else if (p.type === "whole") {
      claims += deaths * p.benefit * handlingDiscount;
      p.active -= deaths;
    } else if (p.type === "term") {
      claims += deaths * p.benefit * handlingDiscount;
      p.active -= deaths;
      if (p.monthsInforce >= 120) p.active = 0;
    } else if (p.type === "endowment") {
      claims += deaths * p.benefit * handlingDiscount;
      p.active -= deaths;
      if (p.monthsInforce >= 120 && p.active > 0) {
        claims += p.active * p.benefit;
        p.active = 0;
      }
    }
    serviceCost += p.active * (p.serviceQuality || 50) * .08;
  }
  state.policies = state.policies.filter(p => p.active > 0);
  if (claims > Math.max(25_000, state.cash * .12)) {
    claimSpike = true;
    state.flags.claimShockSurvived = true;
    state.reputation = clamp(state.reputation - Math.max(.05, .45 - claimsManagerHelp), 0, 10);
    addFloater("CLAIMS", "bad");
  }
  return {claims, premiums, serviceCost, claimSpike};
}

function developProjectOneMonth() {
  const p = state.currentProject;
  if (state.projectChoice) return {extraCost:0, note:"Project is waiting for a CEO decision."};
  p.months += 1;
  const stage = PIPELINE_STAGES[p.stageIndex];
  const team = state.staff.filter(m => m.stamina > 8 && m.sickMonths <= 0);
  if (!team.length) {
    state.staff.forEach(m => { m.stamina = clamp(m.stamina + 12, 0, 100); m.task = "Resting"; });
    pushOfficeEvent("Product work paused while the exhausted team recovered in the break area.");
    return {extraCost:0, note:"The team was exhausted, so development paused for recovery."};
  }
  const effects = equipmentEffects();
  const stageSkill = stage.skills.reduce((sum, key) => sum + team.reduce((s, m) => s + (m.skills[key] || 0) * moodFactor(m) * statusFactor(m), 0) / team.length, 0) / stage.skills.length;
  const speed = team.reduce((sum, m) => sum + (m.skills.speed || 0) * statusFactor(m), 0) / team.length;
  const design = p.design;
  const roleSlowdown = (roleCounts().Actuary || 0) * .3 + (roleCounts()["Compliance Officer"] || 0) * .2;
  const progressGain = clamp(38 + stageSkill / 4 + speed / 8 + effects.workSpeed * 24 + (stage.name === "Actuarial Pricing" ? effects.pricingSpeed * 18 : 0) - roleSlowdown, 18, 86);
  p.stageProgress += progressGain;
  p.attrs[stage.attr] += progressGain * .22 + stageSkill * .04;
  p.attrs.quality += stage.name === "Actuarial Pricing" ? progressGain * .12 : progressGain * .04;
  p.attrs.trust += stage.name === "Compliance Approval" ? progressGain * .11 : progressGain * .035;
  p.attrs.buzz += stage.name === "Marketing Campaign" ? progressGain * .18 : design.marketingBudget / 90000;
  p.attrs.riskControl += stage.name === "Risk Review" ? progressGain * .16 : progressGain * .025;
  p.attrs.innovation += design.productComplexity / 35 + staffSkill("creativity") / 65;
  team.forEach(m => {
    const onFire = m.onFireMonths > 0;
    const drain = 7 + design.productComplexity / 22 + (onFire ? 7 : 0);
    m.stamina = clamp(m.stamina - drain, 0, 100);
    m.xp += onFire ? 12 : 8;
    m.task = stage.name;
    m.status = onFire ? "On Fire" : stage.name === "Market Research" ? "Working" : "Training";
    if (m.xp >= 100) levelUp(m);
  });
  const extraCost = Math.round(2500 + design.productComplexity * 35 + design.complianceDepth * 25 + Math.random() * 3000);
  state.cash -= extraCost;
  p.spent += extraCost;
  let note = `${stage.name} gained ${Math.round(progressGain)} progress.`;
  const stageLabel = {
    buzz: "Buzz",
    quality: "Quality",
    riskControl: "Risk Review",
    trust: "Compliance"
  }[stage.attr] || "Progress";
  const visibleGain = Math.max(1, Math.round(progressGain / 18));
  addFloater(`${stageLabel} +${visibleGain}`, "good");
  pushOfficeEvent(`${stage.name}: office team added ${visibleGain} ${stageLabel.toLowerCase()} points.`);
  if (Math.random() < .16) {
    makeProjectChoice(stage.name);
    note += " A project issue needs a CEO decision.";
    pushOfficeEvent(`${stage.name}: CEO decision needed at the whiteboard.`);
  } else if (Math.random() < .10) {
    p.attrs.innovation += 8;
    p.attrs.quality += 5;
    state.research += 2;
    note += " Staff had a breakthrough idea.";
    pushOfficeEvent(`${stage.name}: a breakthrough idea sparked in the product lab.`);
  }
  if (p.stageProgress >= p.stageTarget) {
    p.stageProgress = 0;
    p.stageIndex += 1;
    if (p.stageIndex >= PIPELINE_STAGES.length) return launchProject();
    note += ` Stage complete. Next: ${PIPELINE_STAGES[p.stageIndex].name}.`;
    pushOfficeEvent(`${stage.name} finished. Team moved to ${PIPELINE_STAGES[p.stageIndex].name}.`);
  }
  return {extraCost, note};
}

function makeProjectChoice(stageName) {
  state.projectChoice = {
    stageName,
    title: `${stageName} decision`,
    text: choice([
      "The team found a weakness. Choose how to handle it.",
      "A competitor moved first. Decide whether to slow down or push ahead.",
      "A staff member flagged model risk before sign-off."
    ]),
    options: [
      {id:"fix", label:"Spend money to fix issue", desc:"Costs cash, reduces risk and protects trust."},
      {id:"delay", label:"Delay for better quality", desc:"Loses progress but improves quality."},
      {id:"quick", label:"Launch quickly with higher risk", desc:"Adds progress but increases claim and regulatory risk."},
      {id:"overtime", label:"Ask staff to work overtime", desc:"Adds progress but drains stamina and mood."}
    ]
  };
}

function resolveProjectChoice(id) {
  const p = state.currentProject;
  if (!p || !state.projectChoice) return;
  if (id === "fix") {
    const cost = 18000 + p.design.productComplexity * 180;
    if (state.cash < cost) return toast(`Need ${money(cost)} to fix this issue.`);
    state.cash -= cost;
    p.spent += cost;
    p.riskDebt = Math.max(0, p.riskDebt - 12);
    p.attrs.trust += 5;
    p.attrs.riskControl += 8;
    toast("Issue fixed. Risk reduced.");
  } else if (id === "delay") {
    p.stageProgress = Math.max(0, p.stageProgress - 40);
    p.attrs.quality += 10;
    p.attrs.trust += 4;
    toast("Launch delayed for better product quality.");
  } else if (id === "quick") {
    p.stageProgress += 38;
    p.riskDebt += 15;
    p.attrs.buzz += 5;
    p.attrs.trust = Math.max(0, p.attrs.trust - 4);
    toast("Fast track chosen. Risk increased.");
  } else if (id === "overtime") {
    p.stageProgress += 28;
    state.staff.forEach(m => {
      m.stamina = clamp(m.stamina - 12, 0, 100);
      m.mood = clamp(m.mood - 5, 0, 100);
    });
    toast("Overtime pushed the project forward.");
  }
  state.projectChoice = null;
  saveToStorage();
  render();
}

function phaseName(i) { return PIPELINE_STAGES[i]?.name || "Product Launch"; }

function levelUp(m) {
  m.level += 1;
  m.xp = 0;
  const keys = Object.keys(m.skills);
  const stat = choice(keys);
  m.skills[stat] = clamp(m.skills[stat] + 3, 0, 100);
  m.mood = clamp(m.mood + 4, 0, 100);
  state.ticker = `${m.name} reached level ${m.level}. ${stat} improved.`;
}

function launchProject() {
  const p = state.currentProject;
  const d = p.design;
  const spec = PRODUCT_SPECS[p.product];
  const fair = fairPrice(p.product, p.age, p.benefit, p.annPayment, d.assumedInterest, d.mortalityMargin);
  const loaded = fair * (1 + d.loading);
  const currentForecast = calcForecast(d);
  const quality = clamp(currentForecast.quality * .45 + p.attrs.quality * .62 + p.attrs.innovation * .18 - p.riskDebt * .32, 1, 100);
  const trust = clamp(currentForecast.customerTrust * .55 + p.attrs.trust * .52 + p.attrs.riskControl * .12 - p.riskDebt * .25, 1, 100);
  const buzz = clamp(currentForecast.salesChance * .32 + p.attrs.buzz * .75 + d.marketingBudget / 2600, 0, 100);
  const riskRating = clamp(currentForecast.claimRisk + p.riskDebt - p.attrs.riskControl * .12, 1, 100);
  const regulatoryRisk = clamp(100 - currentForecast.regulatoryApproval + p.riskDebt * .7, 0, 100);
  const uniqueness = clamp(d.productComplexity * .35 + p.attrs.innovation * .35, 0, 100);
  const review = clamp((quality * .035 + trust * .026 + buzz * .018 + uniqueness * .014 - riskRating * .012 + rand(-.55, .75)), 1, 10);
  const acceptance = clamp(1 - d.underwritingStrictness * .004, .45, 1.05);
  const priceAttract = clamp(1.34 - d.loading * 2.15, .18, 1.45);
  const demand = spec.baseDemand[p.age] * marketFit(p.product, p.age, p.channel) * priceAttract * acceptance;
  const policiesSold = Math.max(0, poisson(demand * (.45 + review / 7) * (.75 + state.reputation / 12) * (1 + buzz / 180)));
  const premiumIncome = loaded * policiesSold;
  const launchExpense = d.marketingBudget + premiumIncome * state.expenseRate + p.spent * .16;
  const profit = premiumIncome - launchExpense;
  state.cash += profit;
  const fanGain = Math.round(policiesSold * (review / 3.2) + buzz * 5);
  state.fans += fanGain;
  state.reputation = clamp(state.reputation + (review - 5.4) / 4.2 + trust / 180, 0, 10);
  state.research += Math.round(2 + uniqueness / 20);
  if (policiesSold > 0) {
    state.policies.push({
      id: p.id,
      product: p.product,
      type: spec.type,
      annuity: !!spec.annuity,
      age: p.age,
      active: policiesSold,
      monthsInforce: 0,
      benefit: p.benefit * spec.factor,
      payment: p.annPayment * spec.factor,
      fair,
      loaded,
      monthlyPremium: Math.max(8, loaded * (spec.annuity ? .014 : .018)),
      claimRisk: riskRating,
      regulatoryRisk,
      serviceQuality: d.serviceQuality,
      issued: dateText()
    });
  }
  const release = {
    date: dateText(),
    name: p.name,
    product: PRODUCT_NAMES[p.product],
    channel: p.channel,
    age: p.age,
    loading: d.loading,
    fair,
    loaded,
    stars: review,
    policies: policiesSold,
    premium: premiumIncome,
    expense: launchExpense,
    profit,
    fans: fanGain,
    quality,
    trust,
    buzz,
    risk: riskRating,
    regulatoryRisk,
    projectedYearlyProfit: profit + policiesSold * Math.max(0, loaded * .05 - riskRating * 10)
  };
  state.products.unshift(release);
  state.lastLaunchReport = launchReportText(release);
  addCashFlow("Product launch", profit, premiumIncome, launchExpense, `Launched ${p.name}: ${review.toFixed(1)}/10, ${policiesSold} policies.`);
  addFloater(`+${money(premiumIncome)}`, "good");
  if (review >= 9) {
    state.confetti = 3;
    state.staff.forEach(m => { m.status = "Celebrating"; m.mood = clamp(m.mood + 8, 0, 100); });
  }
  state.newspaper = review >= 8.5 ? "Tiny insurer surprises market with clever new product!" : choice(NEWSPAPERS);
  state.ticker = `${p.name} launched with ${review.toFixed(1)}/10 and ${policiesSold} first-month sales.`;
  state.currentProject = null;
  state.projectChoice = null;
  checkAchievements();
  return {extraCost: 0, note: state.ticker};
}

function launchReportText(r) {
  const riskLabel = r.risk < 35 ? "Low" : r.risk < 65 ? "Medium" : "High";
  const comment = r.stars >= 9 ? "CEO comment: This is a flagship product." :
    r.stars >= 7 ? "CEO comment: Strong launch. Monitor claims experience." :
    "CEO comment: Useful product, but the next design needs sharper tradeoffs.";
  return [
    `Product: ${r.name}`,
    `Type: ${r.product}`,
    `Review score: ${r.stars.toFixed(1)}/10`,
    `First month sales: ${r.policies} policies`,
    `Projected yearly profit: ${money(r.projectedYearlyProfit)}`,
    `Risk rating: ${riskLabel} (${Math.round(r.risk)}/100)`,
    comment
  ].join("\n");
}

function monthlyRandomEvent() {
  let income = 0, expense = 0, note = "";
  const effects = equipmentEffects();
  state.interestRate = clamp(state.interestRate + rand(-0.0025, 0.0025), -0.005, 0.07);
  state.mortalityShock = clamp(state.mortalityShock * rand(.985, 1.018), .75, 2.2);
  const r = Math.random();
  if (r < .035) {
    state.mortalityShock *= rand(1.15, 1.42 - effects.claimShock * .25);
    expense = Math.max(0, state.cash) * rand(.008, .022);
    state.cash -= expense;
    state.flags.claimShockSurvived = true;
    state.newspaper = "Claims shock tests insurer capital strength!";
    note = `Mortality spike added stress and investment losses of ${money(expense)}.`;
  } else if (r < .07) {
    expense = rand(8000, 45000) * clamp(1 - effects.regulatoryRisk, .55, 1);
    state.cash -= expense;
    note = `Regulatory review cost ${money(expense)}.`;
  } else if (r < .11) {
    income = rand(9000, 55000) * (1 + state.reputation / 10);
    state.cash += income;
    state.reputation = clamp(state.reputation + .08, 0, 10);
    state.newspaper = "Local paper praises a simple insurance explanation campaign.";
    note = `Positive press brought partnership income ${money(income)}.`;
  } else if (r < .15) {
    const boost = Math.round(rand(100, 380));
    state.fans += boost;
    state.staff.forEach(m => m.mood = clamp(m.mood + 2, 0, 100));
    note = `Customer praise added ${boost} fans.`;
  }
  return {income, expense, note};
}

function annualCeremony(finishedYear) {
  const recent = state.products.filter(p => p.date.startsWith(`Y${finishedYear} `));
  let summary = `Year ${finishedYear} summary\nProducts launched: ${recent.length}\nCash: ${money(state.cash)}\nFans: ${Math.round(state.fans).toLocaleString()}\nReputation: ${state.reputation.toFixed(1)}/10`;
  if (recent.length) {
    const best = recent.reduce((a,b) => a.stars > b.stars ? a : b);
    summary += `\nBest product: ${best.name} (${best.stars.toFixed(1)}/10)`;
    if (best.stars >= 8.4) {
      const award = `${finishedYear} Customer Trust Award - ${best.name}`;
      state.awards.unshift(award);
      state.trophies.unshift(award);
      state.cash += 35_000;
      state.fans += 450;
      state.reputation = clamp(state.reputation + .28, 0, 10);
      state.newspaper = "Award ceremony celebrates a standout insurance product!";
      summary += `\nAward won: ${award}`;
    }
  }
  state.yearSummary = summary;
}

function updateSolvencyAndReputation(claimSpike=false) {
  const active = state.policies.reduce((sum,p) => sum + p.active, 0);
  const riskLoad = active * 9000 / Math.max(1, state.cash + 250_000);
  const riskSkill = staffSkill("risk");
  const complianceSkill = staffSkill("compliance");
  state.solvency = clamp(150 + state.cash / 6000 - riskLoad * 16 + riskSkill * .45 + complianceSkill * .22 + state.reputation * 3, 0, 320);
  if (state.solvency < 85) state.reputation = clamp(state.reputation - .05, 0, 10);
  if (claimSpike) {
    const claimsHelp = state.staff.filter(m => m.role === "Claims Manager").length * .08;
    state.reputation = clamp(state.reputation - Math.max(.05, .28 - claimsHelp), 0, 10);
  }
}

function refreshCandidates() {
  const cost = recruitmentCost();
  if (state.cash < cost) return toast(`Need ${money(cost)} for a recruitment agency refresh.`);
  state.cash -= cost;
  state.candidates = generateCandidateRound(state.office);
  toast(`Candidates refreshed for ${money(cost)}.`);
  saveToStorage();
  render();
}

function recruitmentCost() {
  return 2500 + state.office * 900;
}

function hireCandidate(id) {
  const candidate = state.candidates.find(c => c.id === id);
  if (!candidate) return;
  if (state.staff.length >= staffCapacity()) return toast("Office is full. Renovate before hiring more staff.");
  if (state.staff.length >= countOwnedDesks()) return toast("You need to buy another desk before hiring more staff.");
  if (state.cash < candidate.hiringCost) return toast(`Need ${money(candidate.hiringCost)} to hire ${candidate.name}.`);
  state.cash -= candidate.hiringCost;
  const newStaff = staffFromTemplate(candidate);
  newStaff.assignedDeskId = `d${state.staff.length + 1}`;
  state.staff.push(newStaff);
  state.candidates = generateCandidateRound(state.office);
  state.newspaper = `${candidate.name} joins the insurance studio as ${candidate.role}.`;
  pushOfficeEvent(`${candidate.name} claimed a desk and started learning the office routine.`);
  toast(`${candidate.name} hired.`);
  checkAchievements();
  saveToStorage();
  render();
}

function beginTraining() {
  const staffId = $("trainingStaff").value;
  const courseId = $("trainingCourse").value;
  const staff = state.staff.find(m => m.id === staffId);
  const course = TRAINING_COURSES[courseId];
  if (!staff || !course) return;
  if (state.cash < course.cost) return toast(`Need ${money(course.cost)} for this course.`);
  if (staff.stamina < course.stamina) return toast(`${staff.name} is too tired for this course.`);
  const questions = shuffle(TRAINING_QUESTIONS.filter(q => q.course === courseId || Math.random() < .25)).slice(0, 3);
  const sessionQuestions = questions.length ? questions : shuffle(TRAINING_QUESTIONS).slice(0, 2);
  state.trainingSession = {
    staffId,
    courseId,
    questions: sessionQuestions,
    answers: Array(sessionQuestions.length).fill(null),
    currentIndex: 0,
    phase: "questions",
    result: null,
    applied: false
  };
  renderTrainingModal();
  $("trainingModal").classList.remove("hidden");
}

function finishTraining() {
  const session = state.trainingSession;
  if (!session) return;
  if (session.phase === "result") {
    const result = session.result;
    state.trainingSession = null;
    $("trainingModal").classList.add("hidden");
    if (result) {
      toast(`${result.staffName} completed ${result.courseName}: ${result.correct}/${result.total}.`);
      pushOfficeEvent(`${result.staffName} finished ${result.courseName} in the study corner.`);
    }
    saveToStorage();
    render();
    return;
  }
  const index = session.currentIndex || 0;
  if (session.answers[index] === null || session.answers[index] === undefined) {
    toast("Pick an answer before moving on.");
    return;
  }
  if (index < session.questions.length - 1) {
    session.currentIndex = index + 1;
    renderTrainingModal();
    return;
  }
  submitTrainingAnswers(session);
  renderTrainingModal();
}

function submitTrainingAnswers(session) {
  if (session.applied) return;
  const staff = state.staff.find(m => m.id === session.staffId);
  const course = TRAINING_COURSES[session.courseId];
  if (!staff || !course) return;
  let correct = 0;
  const explanations = [];
  session.questions.forEach((q, i) => {
    const selected = Number(session.answers[i]);
    const ok = selected === q.a;
    if (ok) correct += 1;
    explanations.push({
      index: i,
      question: q.q,
      selected,
      correct: q.a,
      selectedText: q.opts[selected] || "No answer",
      correctText: q.opts[q.a],
      ok,
      explanation: q.e
    });
  });
  const effects = equipmentEffects();
  state.cash -= course.cost;
  staff.stamina = clamp(staff.stamina - course.stamina, 0, 100);
  const bonus = correct * 2 + (correct === session.questions.length ? 3 : 0) + effects.trainingBonus;
  const skillGains = [];
  Object.entries(course.skills).forEach(([skill, gain]) => {
    const amount = Math.round((gain + bonus) * staff.growthRate);
    staff.skills[skill] = clamp(staff.skills[skill] + amount, 0, 100);
    skillGains.push({skill, amount});
  });
  staff.xp += 18 + correct * 8;
  const moodGain = correct === session.questions.length ? 10 : 3;
  staff.mood = clamp(staff.mood + moodGain, 0, 100);
  staff.status = "Training";
  state.reputation = clamp(state.reputation + .05 + correct * .025, 0, 10);
  if (staff.xp >= 100) levelUp(staff);
  session.phase = "result";
  session.applied = true;
  session.result = {
    staffName: staff.name,
    staffRole: staff.role,
    courseName: course.name,
    correct,
    total: session.questions.length,
    skillGains,
    moodGain,
    staminaUsed: course.stamina,
    cost: course.cost,
    explanations
  };
  state.lastTrainingResult = `${staff.name} completed ${course.name}: ${correct}/${session.questions.length}.\n${explanations.map(item => `Q${item.index + 1}: ${item.ok ? "Correct" : "Missed"} - ${item.explanation}`).join("\n")}`;
  saveToStorage();
}

function cancelTraining() {
  const hadResult = state.trainingSession?.phase === "result";
  state.trainingSession = null;
  $("trainingModal").classList.add("hidden");
  if (hadResult) {
    saveToStorage();
    render();
  }
}

function trainingBack() {
  const session = state.trainingSession;
  if (!session || session.phase === "result") return;
  session.currentIndex = Math.max(0, (session.currentIndex || 0) - 1);
  renderTrainingModal();
}

function updateTrainingAnswer(questionIndex, value) {
  const session = state.trainingSession;
  if (!session || session.phase !== "questions") return;
  session.answers[questionIndex] = Number(value);
  renderTrainingModal();
}

function restStaff(id) {
  const m = state.staff.find(s => s.id === id);
  if (!m) return;
  m.stamina = 100;
  m.mood = clamp(m.mood + 6, 0, 100);
  m.task = "Resting";
  m.status = "Resting";
  toast(`${m.name} rested.`);
  pushOfficeEvent(`${m.name} recovered at the sofa/kitchen area.`);
  saveToStorage();
  render();
}

function restAll() {
  state.staff.forEach(m => {
    m.stamina = 100;
    m.mood = clamp(m.mood + 4, 0, 100);
    m.task = "Resting";
    m.status = "Resting";
  });
  toast("All staff rested.");
  pushOfficeEvent("The whole team took a recovery break.");
  saveToStorage();
  render();
}

function trainAll() {
  const cost = state.staff.length * 1800;
  if (state.cash < cost) return toast(`Need ${money(cost)} for a quick drill.`);
  state.cash -= cost;
  state.staff.forEach(m => {
    const skill = choice(Object.keys(m.skills));
    m.skills[skill] = clamp(m.skills[skill] + Math.round(1 + m.growthRate), 0, 100);
    m.stamina = clamp(m.stamina - 6, 0, 100);
    m.xp += 6;
    m.status = "Training";
  });
  toast(`Quick drill completed for ${money(cost)}.`);
  pushOfficeEvent("Quick drill sent staff through the study corner.");
  saveToStorage();
  render();
}

function buyEquipment(id) {
  const item = equipmentById(id);
  if (!item) return;
  if (state.office < item.minLevel) return toast(`Requires office level ${item.minLevel}.`);
  if (state.cash < item.cost) return toast(`Need ${money(item.cost)} for ${item.name}.`);
  if (installedSpace() + item.space > equipmentCapacity()) return toast("Not enough equipment space. Renovate the office.");
  state.cash -= item.cost;
  state.equipment.push(id);
  state.newspaper = `${item.name} installed in the office.`;
  toast(`${item.name} purchased.`);
  pushOfficeEvent(`${item.name} was placed on the office map.`);
  saveToStorage();
  render();
}

function upgradeOffice() {
  const next = nextOfficeConfig();
  if (!next) return toast("Office already at maximum level.");
  if (state.cash < next.cost) return toast(`Need ${money(next.cost)} to renovate.`);
  state.cash -= next.cost;
  state.office = next.level;
  state.staff.forEach(m => m.mood = clamp(m.mood + 8, 0, 100));
  state.reputation = clamp(state.reputation + .2, 0, 10);
  state.newspaper = `Office renovated to ${next.name}. ${next.unlock}`;
  state.confetti = 2;
  toast(`Office renovated to level ${next.level}.`);
  pushOfficeEvent(`Renovation complete: office level ${next.level} opened new floor space.`);
  saveToStorage();
  render();
}

function consultingContract() {
  const available = state.staff.filter(s => s.stamina >= 25 && s.sickMonths <= 0);
  if (available.length < 2) return toast("Need at least two rested staff for a contract.");
  available.slice(0, 2).forEach(s => {
    s.stamina = clamp(s.stamina - 18, 0, 100);
    s.xp += 8;
    s.task = "Consulting";
    s.status = "Working";
  });
  const income = Math.round(rand(9000, 32000) * state.office * (1 + state.reputation / 12));
  state.cash += income;
  state.research += 1;
  addCashFlow("Consulting", income, income, 0, "Consulting contract.");
  addFloater(`+${money(income)}`, "good");
  toast(`Consulting contract earned ${money(income)}.`);
  saveToStorage();
  render();
}

function enterCompetition() {
  const y = year();
  if (state.quiz) return;
  if (state.ceoHistory.some(h => h.year === y)) return toast("This year's championship is already completed.");
  const maxDifficulty = clamp(1 + Math.floor((y - 1) / 4), 1, 5);
  const pool = CEO_QUESTIONS.filter(q => q.difficulty <= maxDifficulty);
  const source = pool.length >= 5 ? pool : CEO_QUESTIONS;
  state.quiz = {
    type: "ceo",
    year: y,
    questions: shuffle(source).slice(0, 5).map(q => ({...q, optsShuffled: shuffle(q.opts.map((text, original) => ({text, original})))}))
  };
  toast("CEO Championship started. Sound placeholder: bell.");
  render();
}

function skipCompetition() {
  const y = year();
  if (state.ceoHistory.some(h => h.year === y)) return toast("This year's championship is already completed.");
  state.ceoHistory.push({year:y, skipped:true, correct:0});
  state.ceoStreak = 0;
  toast(`Year ${y} championship skipped.`);
  saveToStorage();
  render();
}

function submitQuiz() {
  if (!state.quiz) return;
  let correct = 0;
  const blocks = [];
  state.quiz.questions.forEach((q, i) => {
    const val = document.querySelector(`input[name="quiz${i}"]:checked`)?.value;
    const ok = Number(val) === q.a;
    if (ok) correct += 1;
    blocks.push(`Q${i+1}: ${ok ? "Correct" : "Missed"} - ${q.e}`);
  });
  let reward = 0;
  let result = `CEO Championship result: ${correct}/5.`;
  if (correct >= 3) {
    state.reputation = clamp(state.reputation + .25, 0, 10);
    result += " Reputation improved.";
  }
  if (correct >= 4) {
    reward = 35_000 + state.quiz.year * 5_000;
    state.cash += reward;
    state.reputation = clamp(state.reputation + .35, 0, 10);
    result += ` Prize ${money(reward)}.`;
  }
  if (correct === 5) {
    const trophy = `Y${state.quiz.year} CEO Knowledge Champion`;
    if (!state.trophies.includes(trophy)) state.trophies.unshift(trophy);
    state.ceoStreak += 1;
    state.staff.forEach(m => { m.mood = clamp(m.mood + 12, 0, 100); m.status = "Celebrating"; });
    state.confetti = 3;
    state.newspaper = "CEO wins national insurance knowledge contest!";
    result += " Perfect score. Trophy earned. Sound placeholder: applause.";
  } else {
    state.ceoStreak = 0;
  }
  if (state.ceoStreak >= 3 && !state.trophies.includes("CEO Genius Badge")) {
    state.trophies.unshift("CEO Genius Badge");
    result += " Three-year perfect streak unlocked CEO Genius Badge.";
  }
  state.ceoHistory.push({year:state.quiz.year, correct, reward});
  state.quiz = null;
  $("quizResult").textContent = `${result}\n\n${blocks.join("\n")}`;
  checkAchievements();
  saveToStorage();
  render();
}

function addCashFlow(kind, net, income, expenses, note) {
  state.cashFlow.push({
    date: dateText(),
    opening: state.cash - net,
    income: Math.max(0, income),
    salaries: 0,
    claims: 0,
    expenses: Math.max(0, expenses),
    closing: state.cash,
    note: `${kind}: ${note}`
  });
  state.cashHist.push({month: state.month, cash: state.cash});
}

function addFloater(text, type="good") {
  state.floaters.push({id:cryptoId(), text, type, ttl:3, x:rand(20,80), y:rand(30,78)});
}

function monthlyPremiumForPolicy(policy) {
  const rate = policy.annuity ? .014 : .018;
  return Math.max(8, Number(policy.monthlyPremium) || Number(policy.loaded || 0) * rate);
}

function checkAchievements() {
  ACHIEVEMENTS.forEach(a => {
    if (!state.achievements.includes(a.id) && a.test(state)) {
      state.achievements.unshift(a.id);
      achievementToast(`Achievement unlocked: ${a.name}`);
      state.reputation = clamp(state.reputation + .08, 0, 10);
    }
  });
}

function score() {
  return Math.round(
    Math.max(0, state.cash) +
    state.fans * 800 +
    state.reputation * 120_000 +
    state.solvency * 2800 +
    state.trophies.length * 80_000 +
    state.awards.length * 55_000 +
    state.products.length * 18_000 +
    state.achievements.length * 25_000
  );
}

function publishRun(auto=false) {
  const inp = getInputs();
  const item = {
    time: new Date().toLocaleString(),
    player: inp.player,
    company: inp.company,
    year: Math.min(year(), MAX_YEARS),
    cash: state.cash,
    fans: state.fans,
    reputation: state.reputation,
    trophies: state.trophies.length,
    achievements: state.achievements.length,
    score: score()
  };
  const board = getLeaderboard();
  board.push(item);
  board.sort((a,b) => b.score - a.score);
  localStorage.setItem(BOARD_KEY, JSON.stringify(board.slice(0, 30)));
  state.leaderboard = board.slice(0, 30);
  if (!auto) toast("Published to local leaderboard.");
  renderLeaderboard();
}

function getLeaderboard() {
  try { return JSON.parse(localStorage.getItem(BOARD_KEY)) || []; }
  catch { return []; }
}

function saveToStorage() {
  state.designSettings = getInputs();
  syncUISettingsFromControls();
  state.saveVersion = SAVE_VERSION;
  state.saveDirty = false;
  state.lastSavedAt = new Date().toISOString();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  setText("globalSaveStatus", saveStatusText());
}

function loadFromStorage() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)); }
  catch { return null; }
}

function resetGame() {
  if (!confirm("Reset the current run?")) return;
  localStorage.removeItem(SAVE_KEY);
  state = freshState();
  saveToStorage();
  render();
}

function markUnsaved() {
  state.saveDirty = true;
  setText("globalSaveStatus", saveStatusText());
}

function applySavedInputs() {
  const saved = state.designSettings;
  if (!saved) return;
  const values = {
    playerName: saved.player,
    companyName: saved.company,
    productType: saved.product,
    productName: saved.productName,
    segment: saved.age,
    channel: saved.channel,
    benefit: saved.benefit,
    annPayment: saved.annPayment,
    loading: saved.loading,
    assumedInterest: saved.assumedInterest,
    mortalityMargin: saved.mortalityMargin,
    marketingBudget: saved.marketingBudget,
    underwritingStrictness: saved.underwritingStrictness,
    serviceQuality: saved.serviceQuality,
    complianceDepth: saved.complianceDepth,
    productComplexity: saved.productComplexity
  };
  Object.entries(values).forEach(([id, value]) => {
    const el = $(id);
    if (el && value !== undefined && value !== null) el.value = value;
  });
}

function syncUISettingsFromControls() {
  const animation = $("animationToggle");
  const compact = $("compactMobileToggle");
  state.uiSettings = {
    animations: animation ? animation.checked : state.uiSettings?.animations !== false,
    compactMobile: compact ? compact.checked : state.uiSettings?.compactMobile === true
  };
}

function switchTab(tabId, persist = true) {
  const tab = document.querySelector(`.tab[data-tab="${tabId}"]`);
  const panel = $(tabId);
  if (!tab || !panel) return false;
  document.querySelectorAll(".tab").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  tab.classList.add("active");
  panel.classList.add("active");
  state.currentTab = tabId;
  if (tabId === "finance") drawCashChart();
  if (persist) saveToStorage();
  return true;
}

function restoreCurrentTab() {
  if (!switchTab(state.currentTab || "studio", false)) switchTab("studio", false);
}

function render() {
  syncDesignLabels();
  renderKpis();
  renderStudioDashboard();
  renderOffice();
  renderProject();
  renderHiring();
  renderTrainingPanel();
  renderRenovation();
  renderEquipment();
  renderStaff();
  renderProducts();
  renderFinance();
  renderEvents();
  renderQuiz();
  renderSettings();
  renderLeaderboard();
}

function syncDesignLabels() {
  const inp = getInputs();
  setText("loadingVal", `${Math.round(inp.loading * 100)}%`);
  setText("assumedInterestVal", `${(inp.assumedInterest * 100).toFixed(1)}%`);
  setText("mortalityMarginVal", `${Math.round(inp.mortalityMargin * 100)}%`);
  setText("marketingBudgetVal", money(inp.marketingBudget));
  setText("underwritingStrictnessVal", Math.round(inp.underwritingStrictness));
  setText("serviceQualityVal", Math.round(inp.serviceQuality));
  setText("complianceDepthVal", Math.round(inp.complianceDepth));
  setText("productComplexityVal", Math.round(inp.productComplexity));
  renderPricingPreview();
}

function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

function renderKpis() {
  setText("dateKpi", dateText());
  setText("cashKpi", money(state.cash));
  setText("fansKpi", Math.round(state.fans).toLocaleString());
  setText("repKpi", `${state.reputation.toFixed(1)}/10`);
  setText("solvencyKpi", pct(state.solvency));
  setText("officeKpi", `Lv ${state.office}`);
  setText("globalDate", dateText());
  setText("globalCash", money(state.cash));
  setText("globalRep", `${state.reputation.toFixed(1)}/10`);
  setText("globalSolvency", pct(state.solvency));
  setText("globalRisk", riskLabel());
  setText("globalSaveStatus", saveStatusText());
  setText("toastLog", state.ticker);
  setText("newspaperText", state.newspaper || choice(NEWSPAPERS));
  setText("ceoTip", state.tip || choice(CEO_TIPS));
  document.body.classList.toggle("animations-off", state.uiSettings?.animations === false);
  document.body.classList.toggle("compact-mobile", state.uiSettings?.compactMobile === true);
}

function renderStudioDashboard() {
  const box = $("studioDashboard");
  if (!box) return;
  const activeProject = state.currentProject ? `${state.currentProject.name} - ${phaseName(state.currentProject.stageIndex)}` : "No active product";
  const mood = teamAverage("mood");
  const stamina = teamAverage("stamina");
  const alerts = activeAlerts();
  box.innerHTML = `
    <div class="studio-stat-grid">
      ${studioStat("Cash", money(state.cash), state.cash >= START_CASH ? "up" : "down", "$")}
      ${studioStat("Month", dateText(), "", "CAL")}
      ${studioStat("Reputation", `${state.reputation.toFixed(1)}/10`, state.reputation >= 6 ? "up" : "", "STAR")}
      ${studioStat("Fans", Math.round(state.fans).toLocaleString(), "", "FAN")}
      ${studioStat("Staff", `${state.staff.length}/${staffCapacity()}`, state.staff.length >= staffCapacity() ? "warn" : "", "TEAM")}
      ${studioStat("Office", `Lv ${state.office}`, "", "HQ")}
      ${studioStat("Mood", `${Math.round(mood)}`, mood > 75 ? "up" : mood < 35 ? "down" : "", "MOOD")}
      ${studioStat("Stamina", `${Math.round(stamina)}`, stamina < 35 ? "down" : "", "ENER")}
    </div>
    <div class="studio-now">
      <strong>Now:</strong> ${escapeHtml(activeProject)}
      <br><strong>Headline:</strong> ${escapeHtml(state.newspaper || "No headline yet.")}
      <div class="alert-chip-row">${alerts.length ? alerts.map(a => `<span class="alert-chip">${escapeHtml(a)}</span>`).join("") : `<span class="alert-chip calm">No urgent alerts</span>`}</div>
    </div>`;
  renderRecommendedAction();
}

function studioStat(label, value, trend, icon) {
  const marker = trend === "up" ? "UP" : trend === "down" ? "DOWN" : trend === "warn" ? "!" : "";
  return `<span class="studio-stat ${trend || ""}"><i>${escapeHtml(icon)}</i><b>${escapeHtml(value)}</b><small>${escapeHtml(label)} ${marker}</small></span>`;
}

function teamAverage(key) {
  const staff = state.staff || [];
  if (!staff.length) return 0;
  return staff.reduce((sum, m) => sum + (Number(m[key]) || 0), 0) / staff.length;
}

function riskLabel() {
  if (state.cash < 0 || state.solvency < 65) return "Critical";
  if (state.solvency < 90 || state.mortalityShock > 1.35) return "High";
  if (state.solvency < 125 || state.mortalityShock > 1.15) return "Moderate";
  return "Low";
}

function saveStatusText() {
  return state.saveDirty ? "Unsaved" : "Saved";
}

function recommendedAction() {
  const tired = (state.staff || []).filter(m => m.stamina < 30);
  if (!state.staff.length) return {title:"Hire your first staff member", detail:"Open Staff and choose a candidate so the company can start building products.", tab:"staff"};
  if (countOwnedDesks(state) < state.staff.length) return {title:"Buy enough desks", detail:"Open Office and add a desk so every staff member has a workstation.", tab:"officePanel"};
  if (state.staff.length >= staffCapacity()) return {title:"Renovate for more capacity", detail:"Your office is full. Renovation unlocks more staff slots and equipment space.", tab:"officePanel"};
  if (tired.length) return {title:"Rest tired staff", detail:`${tired[0].name} is low on stamina. Use rest or coffee before the team slows down.`, tab:"staff"};
  if (state.projectChoice) return {title:"Resolve project choice", detail:"A product development event is waiting. Choose a response before pushing too far ahead.", tab:"project"};
  if (state.currentProject) return {title:"Advance the product pipeline", detail:`${state.currentProject.name} is in ${phaseName(state.currentProject.stageIndex)}. Advance a month to keep it moving.`, tab:"project"};
  if (!state.products.length && !state.policies.length) return {title:"Design your first product", detail:"Open Lab, set simple assumptions, and start a product so premiums can begin.", tab:"project"};
  if (state.cash < 100000) return {title:"Take a consulting contract", detail:"Cash is tight. A consulting contract can stabilize the company before the next month.", tab:null};
  if (state.reputation < 6) return {title:"Train or improve service", detail:"Training and service equipment raise trust, which helps sales and product launches.", tab:"staff"};
  return {title:"Advance the month", detail:"The company is stable. Advance one month to collect premiums, progress projects and reveal events.", tab:null};
}

function renderRecommendedAction() {
  const box = $("recommendedAction");
  if (!box) return;
  const rec = recommendedAction();
  const button = rec.tab ? `<button class="mini-btn" data-recommend-tab="${escapeHtml(rec.tab)}">Go</button>` : `<button class="mini-btn" id="recommendedAdvanceBtn">Advance</button>`;
  box.innerHTML = `
    <div class="recommended-action">
      <span class="rec-kicker">Recommended next action</span>
      <strong>${escapeHtml(rec.title)}</strong>
      <p>${escapeHtml(rec.detail)}</p>
      ${button}
    </div>`;
}

function activeAlerts() {
  const alerts = [];
  if (state.currentProject) alerts.push(`Project: ${phaseName(state.currentProject.stageIndex)}`);
  if (state.projectChoice) alerts.push("Project choice");
  if ((state.staff || []).some(m => m.stamina < 25)) alerts.push("Tired staff");
  if (state.cash < 100000) alerts.push("Low cash");
  if (riskLabel() === "High" || riskLabel() === "Critical") alerts.push(`${riskLabel()} risk`);
  if (state.quiz) alerts.push("Quiz active");
  return alerts.slice(0, 4);
}

function renderOffice(showBurstEffects = true) {
  const office = $("office");
  if (!office) return;
  const layout = window.OfficeLayoutSystem.buildOfficeLayout(state);
  state.officeLayout = {
    level: state.office,
    cols: layout.cols,
    rows: layout.rows,
    deskSlots: layout.deskSlots.map(({id, staffId, deskType, x, y}) => ({id, staffId, deskType, x, y})),
    furniturePositions: layout.furniture.map(({id, x, y, w, h, staffId}) => ({id, x, y, w, h, staffId}))
  };
  office.style.setProperty("--cols", layout.cols);
  office.style.setProperty("--rows", layout.rows);
  office.className = `office-map ${layout.className}`;
  let html = "";
  for (let y = 0; y < layout.rows; y++) {
    for (let x = 0; x < layout.cols; x++) {
      const wall = y === 0 || y === layout.rows - 1 || x === 0 || x === layout.cols - 1;
      const path = isPathTile(x, y, layout);
      const zone = !wall ? zoneClassForTile(x, y, layout) : "";
      html += `<div class="office-tile ${wall ? "wall" : path ? "path" : "floor"} ${zone}" style="${window.OfficeAnimationSystem.tileStyle(layout, x, y)}"></div>`;
    }
  }
  layout.furniture.forEach((item, index) => {
    const def = window.FurnitureSystem.getFurniture(item.id);
    const staff = item.staffId ? state.staff.find(m => m.id === item.staffId) : null;
    const title = window.FurnitureSystem.furnitureTooltip(item, staff?.name);
    const trophies = item.id === "awardShelf" || item.id === "awardCabinet" ? renderMiniTrophies() : "";
    html += `
      <button class="office-furniture ${def.kind} ${def.className}" style="${window.OfficeAnimationSystem.tileStyle(layout, item.x, item.y, item.w, item.h)}" title="${escapeHtml(title)}" data-office-kind="furniture" data-office-index="${index}">
        <span class="furniture-glyph">${escapeHtml(def.glyph)}</span>${trophies}
      </button>`;
  });
  const liveEvents = [];
  const now = Date.now();
  const selectedStaffId = state.selectedOfficeItem?.type === "staff" ? state.selectedOfficeItem.id : null;
  state.staff.forEach((m, index) => {
    const routine = window.StaffRoutineSystem.routineForStaff(m, index, state, layout);
    const motion = window.OfficeAnimationSystem.resolveStaffMotion(state, m, routine, layout, now);
    m.routineState = routine.stateName;
    m.routineTarget = routine.target;
    m.routinePath = routine.path;
    m.assignedDeskId = routine.desk?.id || m.assignedDeskId || `d${index + 1}`;
    const liveLine = `${m.name}: ${routine.stateName}${state.currentProject && routine.stateName === "Meeting" ? ` (${phaseName(state.currentProject.stageIndex)})` : ""}`;
    liveEvents.push(liveLine);
    const sprite = window.STAFF_SPRITES[m.role] || {};
    const status = window.OfficeAnimationSystem.statusClass(routine.stateName);
    const roleClassName = sprite.className || roleCssClass(m.role);
    const icon = sprite.icon || roleIcon(m.role);
    const avatar = window.AvatarSystem ? window.AvatarSystem.getAvatar(m, index) : avatarForStaff(m, index);
    const avatarClasses = window.AvatarSystem ? window.AvatarSystem.classNamesFor(m, index) : `${avatar.hairClass} ${avatar.accessoryClass}`;
    const avatarStyle = window.AvatarSystem ? window.AvatarSystem.avatarStyle(avatar) : `--shirt:${avatar.shirt};--pants:${avatar.pants};--hair:${avatar.hair};--skin:${avatar.skin};--accent:${avatar.accent}`;
    const avatarMarkup = window.AvatarSystem ? window.AvatarSystem.renderStaffAvatar(m, index, icon) : `<span class="sprite-body"><span class="role-icon">${escapeHtml(icon)}</span></span>`;
    const selectedClass = selectedStaffId === m.id ? "selected" : "";
    const stateClasses = staffStateClasses(m, routine);
    const facingClass = motion.facing === "left" ? "motion-left" : "motion-right";
    const progressText = window.OfficeAnimationSystem.progressTextForStaff(m, routine, state);
    const title = `${m.name} - ${m.role}. ${routine.stateName}. Mood ${Math.round(m.mood)}/100. Stamina ${Math.round(m.stamina)}/100. Desk ${m.assignedDeskId}.`;
    html += `
      <button class="sprite ${status} ${roleClassName} ${avatarClasses} ${facingClass} ${selectedClass} ${stateClasses}" style="${window.OfficeAnimationSystem.tileStyle(layout, motion.point.x, motion.point.y, 1, 1)};--dx:${motion.facing === "left" ? -12 : 12}px;--walk-speed:${Math.max(.55, 2.4 / motion.speed).toFixed(2)}s;${avatarStyle}" title="${escapeHtml(title)}" data-office-kind="staff" data-staff-id="${m.id}">
        <span class="speech">${escapeHtml(routine.bubble || speechFor(m))}</span>
        <span class="thought-bubble">${escapeHtml(staffSignalFor(m, routine))}</span>
        ${progressText ? `<span class="work-float">${escapeHtml(progressText)}</span>` : ""}
        <span class="sprite-name">${escapeHtml(m.name)}</span>
        <span class="sprite-vitals">
          ${renderTinyVital("mood", m.mood, staffMoodIcon(m))}
          ${renderTinyVital("stamina", m.stamina, staffStaminaIcon(m))}
        </span>
        <span class="sprite-status-label">${escapeHtml(shortStatus(routine.stateName))}</span>
        ${renderStaffHoverCard(m, routine)}
        ${avatarMarkup}
      </button>`;
  });
  state.liveOfficeEvents = liveEvents.slice(0, 6);
  if (showBurstEffects) {
    state.floaters.forEach(f => {
      html += `<div class="floating-number ${f.type}" style="left:${f.x}%;top:${f.y}%">${escapeHtml(f.text)}</div>`;
    });
  }
  if (showBurstEffects && state.confetti > 0) {
    for (let i = 0; i < 28; i++) {
      html += `<div class="confetti-piece" style="left:${rand(5,95)}%;top:${rand(0,28)}%;background:${choice(["#f47aa5","#f5b333","#2f6df6","#22a06b"])}"></div>`;
    }
  }
  office.innerHTML = html;
  office.querySelectorAll("[data-office-kind='staff']").forEach(btn => btn.addEventListener("click", () => selectOfficeStaff(btn.dataset.staffId)));
  office.querySelectorAll("[data-office-kind='furniture']").forEach(btn => btn.addEventListener("click", () => selectOfficeFurniture(Number(btn.dataset.officeIndex))));
  const officeViewport = $("officeViewport");
  const engineReady = !!(window.PhaserOfficeEngine && window.Phaser);
  officeViewport?.classList.toggle("engine-active", engineReady);
  const engineActive = engineReady && !!window.PhaserOfficeEngine.render(state, layout, {
    showBurstEffects,
    selectStaff: selectOfficeStaff,
    selectFurniture: selectOfficeFurniture
  });
  officeViewport?.classList.toggle("engine-active", engineActive);
  renderOfficeDetail();
  renderOfficeLog();
  renderOfficeTeamStatus();
  applyOfficeView();
}

function isPathTile(x, y, layout) {
  const z = layout.zones;
  return y === layout.rows - 2 || x === 2 || x === Math.floor(layout.cols / 2) || (x > 2 && x < layout.cols - 2 && y === Math.floor(layout.rows / 2)) ||
    Object.values(z).some(point => Math.abs(point.x - x) + Math.abs(point.y - y) <= 1);
}

function zoneClassForTile(x, y, layout) {
  const rect = (layout.zoneRects || []).find(zone => x >= zone.x && x < zone.x + zone.w && y >= zone.y && y < zone.y + zone.h);
  return rect ? `zone-${rect.id}` : "";
}

function renderMiniTrophies() {
  const slots = Math.max(3, Math.min(8, state.trophies.length || 3));
  return `<span class="mini-trophies">${Array.from({length: slots}, (_, i) => `<i class="${state.trophies[i] ? "earned" : ""}"></i>`).join("")}</span>`;
}

function renderTinyVital(type, value, icon) {
  const v = clamp(Number(value) || 0, 0, 100);
  return `<span class="tiny-vital ${type}"><i>${escapeHtml(icon)}</i><span><b style="width:${v}%"></b></span></span>`;
}

function renderOfficeBar(label, value, type) {
  const v = clamp(Number(value) || 0, 0, 100);
  return `
    <span class="office-bar ${type}">
      <span>${escapeHtml(label)}</span>
      <i><b style="width:${v}%"></b></i>
      <strong>${Math.round(v)}</strong>
    </span>`;
}

function renderStaffHoverCard(m, routine) {
  return `
    <span class="staff-hover-card">
      <strong>${escapeHtml(m.name)}</strong>
      <em>${escapeHtml(m.role)}</em>
      ${renderOfficeBar("Mood", m.mood, "mood")}
      ${renderOfficeBar("Stamina", m.stamina, "stamina")}
      <small>Task: ${escapeHtml(m.task || "Idle")}</small>
      <small>Status: ${escapeHtml(routine.stateName || m.status || "Working")}</small>
    </span>`;
}

function staffMoodIcon(m) {
  if (window.MoodSystem) return window.MoodSystem.moodIcon(m);
  if (m.mood > 80) return ":)";
  if (m.mood < 30) return ":(";
  return "M";
}

function staffStaminaIcon(m) {
  if (window.MoodSystem) return window.MoodSystem.staminaIcon(m);
  if (m.stamina < 30) return "Z";
  if (m.stamina > 70) return "E";
  return "S";
}

function shortStatus(status) {
  if (window.MoodSystem) return window.MoodSystem.shortStatus(status);
  return {
    "Coffee Break": "Coffee",
    "Bathroom Break": "Break",
    "On Fire": "Fire",
    "Going Home": "Home"
  }[status] || String(status || "Work").slice(0, 8);
}

function staffStateClasses(m, routine) {
  if (window.MoodSystem) return window.MoodSystem.stateClasses(m, routine);
  const classes = [];
  if (m.mood > 80) classes.push("mood-high");
  if (m.mood < 30) classes.push("mood-low");
  if (m.stamina < 30) classes.push("stamina-low");
  if (m.stamina > 70) classes.push("stamina-high");
  if (routine.stateName === "Resting") classes.push("resting-signal");
  return classes.join(" ");
}

function staffSignalFor(m, routine) {
  if (window.MoodSystem) return window.MoodSystem.signalFor(m, routine);
  if (m.onFireMonths > 0 || routine.stateName === "On Fire") return "F";
  if (m.stamina < 30 || routine.stateName === "Tired") return "Z";
  if (routine.stateName === "Training") return "B";
  if (routine.stateName === "Coffee Break" || routine.stateName === "Resting") return "C";
  if (m.mood > 80 || routine.stateName === "Inspired") return ":)";
  if (m.mood < 30) return ":(";
  return thoughtForState(routine.stateName);
}

function thoughtForState(stateName) {
  if (window.MoodSystem) return window.MoodSystem.thoughtForState(stateName);
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
    "Going Home": "->"
  }[stateName] || "";
}

function avatarForStaff(m, index = 0) {
  const roleLooks = {
    "Actuary": {
      shirts:["#bfe1ff","#8fc5f4","#4f8bd8"],
      pants:["#263044","#1c3557","#2f4057"],
      hairs:["#2f4057","#5a3b2e","#1f2533"],
      styles:["hair-neat","hair-tied","hair-side"],
      accessory:"accessory-glasses",
      accent:"#2f6df6"
    },
    "Underwriter": {
      shirts:["#d7d2ff","#9892c9","#596172"],
      pants:["#2d3142","#3f4654","#1f2533"],
      hairs:["#3d2b5f","#4b3625","#202635"],
      styles:["hair-side","hair-neat","hair-bob"],
      accessory:"accessory-clipboard",
      accent:"#6750c9"
    },
    "Marketing Specialist": {
      shirts:["#ffc7dc","#ff91bd","#ffd166"],
      pants:["#523c7a","#b9497b","#236c82"],
      hairs:["#9c3c6a","#e06b9a","#6b3b90"],
      styles:["hair-bob","hair-spiky","hair-curly"],
      accessory:"accessory-megaphone",
      accent:"#f47aa5"
    },
    "Claims Manager": {
      shirts:["#c7f2dc","#87d8a8","#6fbf9f"],
      pants:["#315c42","#244c39","#46515e"],
      hairs:["#315c42","#5b4530","#28313f"],
      styles:["hair-neat","hair-side","hair-curly"],
      accessory:"accessory-headset",
      accent:"#22a06b"
    },
    "Customer Service Officer": {
      shirts:["#ffe1a8","#ffd166","#ffb86c"],
      pants:["#5c4b32","#6d4c7d","#2f6f77"],
      hairs:["#735125","#9b6235","#3f2c22"],
      styles:["hair-bob","hair-tied","hair-curly"],
      accessory:"accessory-headset",
      accent:"#f5b333"
    },
    "Data Scientist": {
      shirts:["#c8efff","#8fd7ef","#9de2d2"],
      pants:["#1d5364","#263044","#31516a"],
      hairs:["#1d5364","#2e2d35","#523a28"],
      styles:["hair-spiky","hair-curly","hair-side"],
      accessory:"accessory-laptop",
      accent:"#168aad"
    },
    "Compliance Officer": {
      shirts:["#e6e1d8","#c8c0b4","#f0f2f5"],
      pants:["#343434","#4b5563","#70675d"],
      hairs:["#343434","#4e3528","#6b5a46"],
      styles:["hair-neat","hair-side","hair-tied"],
      accessory:"accessory-checklist",
      accent:"#6b7280"
    },
    "Junior Graduate": {
      shirts:["#daf7bd","#b8ec7a","#a8e6ff"],
      pants:["#466d36","#4062a8","#6c4a78"],
      hairs:["#68452d","#7b4a2f","#2c354a"],
      styles:["hair-spiky","hair-bob","hair-curly"],
      accessory:"accessory-backpack",
      accent:"#60a531"
    }
  };
  const fallback = {
    shirts:["#c8efff","#ffd6e4","#daf7bd"],
    pants:["#263044","#4b5563","#315c42"],
    hairs:["#6a3c23","#2f4057","#343434"],
    styles:["hair-neat","hair-side","hair-curly"],
    accessory:"accessory-clipboard",
    accent:"#2f6df6"
  };
  const look = roleLooks[m.role] || fallback;
  const seed = staffAvatarSeed(m, index);
  return {
    shirt: pickAvatar(look.shirts, seed),
    pants: pickAvatar(look.pants, seed + 3),
    hair: pickAvatar(look.hairs, seed + 7),
    skin: pickAvatar(["#ffe1be","#f3c89f","#f7d5b7","#e7b98f"], seed + 11),
    hairClass: pickAvatar(look.styles, seed + 13),
    accessoryClass: look.accessory,
    accent: look.accent
  };
}

function staffAvatarSeed(m, index) {
  const text = `${m.id || ""}${m.name || ""}${m.role || ""}`;
  let hash = index * 97 + 17;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) % 10007;
  return hash;
}

function pickAvatar(list, seed) {
  return list[Math.abs(seed) % list.length];
}

function selectOfficeStaff(staffId) {
  state.selectedOfficeItem = {type: "staff", id: staffId};
  renderOffice(false);
}

function selectOfficeFurniture(index) {
  const layout = window.OfficeLayoutSystem.buildOfficeLayout(state);
  const item = layout.furniture[index];
  if (!item) return;
  state.selectedOfficeItem = {type: "furniture", index, id: item.id, staffId: item.staffId || null};
  renderOffice(false);
}

function renderOfficeDetail() {
  const box = $("officeDetail");
  if (!box) return;
  const selected = state.selectedOfficeItem;
  if (!selected) {
    box.textContent = "Click a staff member or furniture item to inspect it.";
    return;
  }
  if (selected.type === "staff") {
    const m = state.staff.find(staff => staff.id === selected.id);
    if (!m) return;
    box.innerHTML = `
      <div class="office-staff-card">
        <strong>${escapeHtml(m.name)}</strong> - ${escapeHtml(m.role)}
        <p class="muted">Salary ${money(m.salary)}/month | Loyalty ${Math.round(m.loyalty)}/100</p>
        ${renderOfficeBar("Mood", m.mood, "mood")}
        ${renderOfficeBar("Stamina", m.stamina, "stamina")}
        ${renderOfficeBar("Loyalty", m.loyalty, "loyalty")}
        <p>Status: <b>${escapeHtml(m.routineState || m.status)}</b> | Task: ${escapeHtml(m.task || "Idle")}</p>
        <p>Assigned desk: ${escapeHtml(m.assignedDeskId || "None")}</p>
        <div class="compact-skill-grid">
          ${Object.entries(m.skills || {}).map(([k, v]) => renderOfficeBar(k, v, "skill")).join("")}
        </div>
      </div>
      <div class="actions-row detail-actions">
        <button data-office-action="train" data-staff-id="${m.id}">Train</button>
        <button data-office-action="rest" data-staff-id="${m.id}">Rest</button>
        <button data-office-action="coffee" data-staff-id="${m.id}">Send to Coffee Break</button>
        <button data-office-action="product" data-staff-id="${m.id}">Assign to Product</button>
        <button data-office-action="details" data-staff-id="${m.id}">View Details</button>
      </div>`;
    box.querySelectorAll("[data-office-action]").forEach(btn => btn.addEventListener("click", () => handleOfficeStaffAction(btn.dataset.officeAction, btn.dataset.staffId)));
    return;
  }
  const layout = window.OfficeLayoutSystem.buildOfficeLayout(state);
  const item = layout.furniture[selected.index];
  const def = item ? window.FurnitureSystem.getFurniture(item.id) : window.FurnitureSystem.getFurniture(selected.id);
  const staff = item?.staffId ? state.staff.find(m => m.id === item.staffId) : null;
  box.innerHTML = `
    <strong>${escapeHtml(def.name)}</strong>
    <br>Category: ${escapeHtml(def.kind)}
    <br>Effect: ${escapeHtml(def.effect || "Decorative office furniture.")}
    <br>${staff ? `Assigned staff: ${escapeHtml(staff.name)}` : "Assigned staff: none"}
    <div class="actions-row detail-actions">
      <button data-furniture-upgrade="${escapeHtml(item?.id || selected.id)}">Upgrade / Buy Similar</button>
    </div>`;
  box.querySelectorAll("[data-furniture-upgrade]").forEach(btn => btn.addEventListener("click", () => {
    const shopTab = document.querySelector('.tab[data-tab="officePanel"]');
    if (shopTab) shopTab.click();
    toast(`Open the equipment shop to buy or upgrade ${def.name}.`);
  }));
}

function renderOfficeLog() {
  const log = $("officeEventLog");
  if (!log) return;
  const lines = [...(state.liveOfficeEvents || []), ...(state.officeEventLog || [])].slice(0, 8);
  log.textContent = lines.join("\n") || "Office routines will appear here.";
}

function renderOfficeTeamStatus() {
  const box = $("officeTeamStatus");
  if (!box) return;
  const staff = state.staff || [];
  if (!staff.length) {
    box.textContent = "Team status: no staff hired yet.";
    return;
  }
  const avgMood = staff.reduce((sum, m) => sum + (Number(m.mood) || 0), 0) / staff.length;
  const avgStamina = staff.reduce((sum, m) => sum + (Number(m.stamina) || 0), 0) / staff.length;
  const countBy = predicate => staff.filter(predicate).length;
  const tired = countBy(m => (m.routineState || m.status) === "Tired" || m.stamina < 30);
  const onFire = countBy(m => m.onFireMonths > 0 || (m.routineState || m.status) === "On Fire");
  const resting = countBy(m => ["Resting", "Coffee Break"].includes(m.routineState || m.status));
  const working = countBy(m => ["Working", "Meeting", "Inspired", "Training"].includes(m.routineState || m.status));
  box.innerHTML = `
    <strong>Team status</strong>
    ${renderOfficeBar("Avg mood", avgMood, "mood")}
    ${renderOfficeBar("Avg stamina", avgStamina, "stamina")}
    <div class="team-status-grid">
      <span>Tired <b>${tired}</b></span>
      <span>On Fire <b>${onFire}</b></span>
      <span>Resting <b>${resting}</b></span>
      <span>Working <b>${working}</b></span>
    </div>`;
}

function applyOfficeView() {
  const viewport = $("officeViewport");
  const office = $("office");
  if (!viewport || !office || !window.ResponsiveOfficeSystem) return;
  state.officeView = window.ResponsiveOfficeSystem.applyView(state.officeView, viewport, office);
  const engine = $("officeEngine");
  if (engine) engine.style.zoom = String(state.officeView.zoom || 1);
}

function changeOfficeZoom(delta) {
  if (!window.ResponsiveOfficeSystem) return;
  state.officeView = window.ResponsiveOfficeSystem.adjustZoom(state.officeView, delta);
  applyOfficeView();
  saveToStorage();
}

function resetOfficeView() {
  if (!window.ResponsiveOfficeSystem) return;
  state.officeView = window.ResponsiveOfficeSystem.resetView();
  applyOfficeView();
  saveToStorage();
}

function bindOfficeViewportPan() {
  const viewport = $("officeViewport");
  if (!viewport || !window.ResponsiveOfficeSystem) return;
  window.ResponsiveOfficeSystem.bindPan(viewport, (panX, panY) => {
    state.officeView = {...(state.officeView || {}), panX, panY};
  });
}

function topSkills(m) {
  return Object.entries(m.skills || {}).sort((a, b) => b[1] - a[1]).slice(0, 3);
}

function handleOfficeStaffAction(action, staffId) {
  const m = state.staff.find(staff => staff.id === staffId);
  if (!m) return;
  if (action === "train") {
    const tab = document.querySelector('.tab[data-tab="staff"]');
    if (tab) tab.click();
    const select = $("trainingStaff");
    if (select) select.value = m.id;
    renderTrainingPanel();
    pushOfficeEvent(`${m.name} walked to the study corner for training.`);
  } else if (action === "rest") {
    restStaff(m.id);
    pushOfficeEvent(`${m.name} went to the sofa to rest.`);
  } else if (action === "product") {
    m.task = state.currentProject ? phaseName(state.currentProject.stageIndex) : "Product planning";
    m.status = "Meeting";
    pushOfficeEvent(`${m.name} joined the product lab whiteboard.`);
  } else if (action === "coffee") {
    m.task = "Coffee Break";
    m.status = "Coffee Break";
    m.stamina = clamp(m.stamina + 12, 0, 100);
    m.mood = clamp(m.mood + 4, 0, 100);
    pushOfficeEvent(`${m.name} went for coffee and recovered stamina.`);
  } else if (action === "details") {
    const tab = document.querySelector('.tab[data-tab="staff"]');
    if (tab) tab.click();
    pushOfficeEvent(`${m.name}'s staff profile was opened from the office.`);
  }
  saveToStorage();
  render();
}

function roleCssClass(role) {
  return String(role || "staff").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function roleIcon(role) {
  return {
    "Actuary":"#",
    "Underwriter":"C",
    "Marketing Specialist":"*",
    "Claims Manager":"!",
    "Customer Service Officer":":)",
    "Data Scientist":"01",
    "Compliance Officer":"OK",
    "Junior Graduate":"B"
  }[role] || roleInitial(role);
}

function statusClass(m) {
  if (m.sickMonths > 0 || m.status === "Sick") return "sick";
  if (m.onFireMonths > 0 || m.status === "On Fire") return "on-fire";
  if (m.status === "Celebrating") return "celebrating";
  if (m.status === "Training") return "training";
  if (m.status === "Resting") return "resting";
  if (m.stamina < 18 || m.status === "Tired") return "tired";
  if (m.mood > 78 || m.status === "Inspired") return "inspired";
  return "working";
}

function speechFor(m) {
  if (m.onFireMonths > 0) return "On fire!";
  if (m.stamina < 18) return "Need rest";
  if (m.status === "Training") return "Studying";
  if (m.status === "Celebrating") return "We won!";
  if (m.task && m.task !== "Idle") return m.task.split(" ")[0];
  return m.mood > 80 ? "Good idea" : "Working";
}

function renderPricingPreview() {
  const box = $("pricingPreview");
  const forecastBox = $("forecastPanel");
  if (!box || !forecastBox) return;
  const inp = getInputs();
  const forecast = calcForecast(inp);
  const readiness = launchReadiness(forecast);
  const assumptionLabel = PRODUCT_SPECS[inp.product].annuity ? "Annual annuity payment" : "Sum assured";
  const assumptionValue = PRODUCT_SPECS[inp.product].annuity ? inp.annPayment : inp.benefit;
  box.innerHTML = `
    <strong>Actuarial pricing preview</strong>
    <div class="metric-grid">
      <div class="metric"><span>Fair EPV price</span><strong>${money(forecast.fair)}</strong></div>
      <div class="metric"><span>Loaded price</span><strong>${money(forecast.loaded)}</strong></div>
      <div class="metric"><span>${assumptionLabel}</span><strong>${money(assumptionValue)}</strong></div>
      <div class="metric"><span>Market fit</span><strong>${forecast.fit.toFixed(2)}x</strong></div>
      <div class="metric"><span>q_x at age ${inp.age}</span><strong>${(adjustedQx(inp.age, inp.mortalityMargin, inp.product) * 100).toFixed(3)}%</strong></div>
      <div class="metric"><span>10-year survival</span><strong>${(npxScaled(inp.age, 10, inp.mortalityMargin, inp.product) * 100).toFixed(1)}%</strong></div>
    </div>
  `;
  forecastBox.innerHTML = `
    <div class="launch-readiness ${readiness.className}">
      <span>Launch readiness</span>
      <strong>${readiness.label}</strong>
      <div class="readiness-meter"><i style="width:${readiness.score}%"></i></div>
      <p>${escapeHtml(readiness.advice)}</p>
    </div>
    ${forecastCard("Design months", `${forecast.designMonths}`)}
    ${forecastCard("Product quality", `${Math.round(forecast.quality)}/100`)}
    ${forecastCard("Review range", `${forecast.reviewLow.toFixed(1)}-${forecast.reviewHigh.toFixed(1)}/10`)}
    ${forecastCard("Sales chance", `${Math.round(forecast.salesChance)}/100`)}
    ${forecastCard("Profit margin", `${Math.round(forecast.profitMargin)}%`)}
    ${forecastCard("Approval chance", `${Math.round(forecast.regulatoryApproval)}/100`)}
    ${forecastCard("Claim risk", `${Math.round(forecast.claimRisk)}/100`)}
    ${forecastCard("Customer trust", `${Math.round(forecast.customerTrust)}/100`)}
    ${forecastCard("Staff effort", `${forecast.requiredEffort}`)}
    <div class="warning-list">
      ${forecast.warnings.length ? forecast.warnings.map(w => `<div class="warning ${w.type === "bad" ? "bad-warning" : "good-warning"}">${escapeHtml(w.text)}</div>`).join("") : `<div class="warning good-warning">Balanced design: no major warnings.</div>`}
    </div>
  `;
}

function launchReadiness(forecast) {
  const score = clamp(Math.round(
    forecast.salesChance * .24 +
    forecast.customerTrust * .19 +
    forecast.regulatoryApproval * .19 +
    forecast.quality * .18 +
    Math.max(0, forecast.profitMargin + 10) * .45 -
    forecast.claimRisk * .16 -
    forecast.designMonths * 1.8
  ), 0, 100);
  if (score >= 72) return {score, className:"ready", label:"Ready to grow", advice:"This product has a healthy mix of sales, trust, margin and risk control."};
  if (score >= 50) return {score, className:"watch", label:"Needs watching", advice:"Playable, but check warnings before launch. Reduce complexity or risk if cash is tight."};
  return {score, className:"risky", label:"Too risky now", advice:"Simplify the product, lower marketing spend, reduce loading, or improve underwriting/compliance before starting."};
}

function forecastCard(label, value) {
  return `<div class="forecast-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function renderProject() {
  const p = state.currentProject;
  const mini = $("projectMini");
  const detail = $("projectDetail");
  if (!p) {
    if (mini) mini.textContent = state.yearSummary || "No active project.";
    if (detail) detail.textContent = "No active project. Use the sliders, check the forecast, then start development.";
    renderProjectChoice();
    return;
  }
  const stage = PIPELINE_STAGES[p.stageIndex];
  const progress = clamp(p.stageProgress / p.stageTarget * 100, 0, 100);
  const text = [
    `${p.name}`,
    `Stage: ${stage.name}`,
    `Progress: ${Math.round(progress)}%`,
    `Quality ${Math.round(p.attrs.quality)} | Trust ${Math.round(p.attrs.trust)} | Buzz ${Math.round(p.attrs.buzz)} | Risk Control ${Math.round(p.attrs.riskControl)}`,
    `Target: age ${p.age}, ${p.channel}, loading ${Math.round(p.design.loading * 100)}%`,
    `Months in development: ${p.months}`
  ].join("\n");
  if (mini) mini.textContent = text;
  if (detail) {
    detail.innerHTML = `
      <strong>${escapeHtml(p.name)}</strong><br>
      ${PIPELINE_STAGES.map((s, i) => {
        const done = i < p.stageIndex;
        const active = i === p.stageIndex;
        const width = done ? 100 : active ? progress : 0;
        return `<div class="skill-row"><span>${escapeHtml(s.name)}</span><div class="bar"><span style="width:${width}%"></span></div><b>${done ? "Done" : active ? Math.round(progress) + "%" : "-"}</b></div>`;
      }).join("")}
      <p class="muted">Risk debt ${Math.round(p.riskDebt)}. Spend ${money(p.spent)} so far.</p>
    `;
  }
  renderProjectChoice();
}

function renderProjectChoice() {
  const box = $("projectChoice");
  if (!box) return;
  if (!state.projectChoice) {
    box.classList.add("hidden");
    box.innerHTML = "";
    return;
  }
  const c = state.projectChoice;
  box.classList.remove("hidden");
  box.innerHTML = `
    <strong>${escapeHtml(c.title)}</strong>
    <p>${escapeHtml(c.text)}</p>
    <div class="choice-options">
      ${c.options.map(o => `<button data-choice="${o.id}">${escapeHtml(o.label)}<br><span class="card-meta">${escapeHtml(o.desc)}</span></button>`).join("")}
    </div>`;
  box.querySelectorAll("[data-choice]").forEach(btn => btn.addEventListener("click", () => resolveProjectChoice(btn.dataset.choice)));
}

function renderHiring() {
  const cap = $("capacitySummary");
  if (cap) {
    cap.textContent = `Current staff: ${state.staff.length}/${staffCapacity()}\nEquipment space: ${installedSpace()}/${equipmentCapacity()}\nHiring is blocked when the office is full. Renovation increases staff and equipment capacity.`;
  }
  const grid = $("candidateGrid");
  const refresh = $("refreshCandidatesBtn");
  if (refresh) refresh.textContent = `Refresh candidates (${money(recruitmentCost())})`;
  if (!grid) return;
  grid.innerHTML = state.candidates.map(c => `
    <div class="candidate-card">
      <h3>${escapeHtml(c.name)}</h3>
      <div class="card-meta">${escapeHtml(c.role)} | Salary ${money(c.salary)}/m | Hire ${money(c.hiringCost)}</div>
      <p>${escapeHtml(c.description)}</p>
      <div class="stats">
        <span>Pricing ${c.skills.pricing}</span><span>Risk ${c.skills.risk}</span>
        <span>Marketing ${c.skills.marketing}</span><span>Service ${c.skills.service}</span>
        <span>Speed ${c.skills.speed}</span><span>Creativity ${c.skills.creativity}</span>
      </div>
      <ul class="mini-list">
        <li><strong>Strengths:</strong> ${escapeHtml(c.strengths.join(", "))}</li>
        <li><strong>Weaknesses:</strong> ${escapeHtml(c.weaknesses.join(", "))}</li>
        <li><strong>Impact:</strong> ${escapeHtml(c.impact)}</li>
        <li><strong>Traits:</strong> ${escapeHtml(c.moodTrait)} mood, ${escapeHtml(c.staminaTrait)} stamina</li>
      </ul>
      <button class="success" data-hire="${c.id}" ${state.staff.length >= staffCapacity() ? "disabled" : ""}>Hire Candidate</button>
    </div>
  `).join("");
  grid.querySelectorAll("[data-hire]").forEach(btn => btn.addEventListener("click", () => hireCandidate(btn.dataset.hire)));
}

function renderTrainingPanel() {
  const staffSelect = $("trainingStaff");
  const courseSelect = $("trainingCourse");
  if (!staffSelect || !courseSelect) return;
  const selectedStaff = staffSelect.value;
  const selectedCourse = courseSelect.value;
  staffSelect.innerHTML = state.staff.map(m => `<option value="${m.id}">${escapeHtml(m.name)} (${escapeHtml(m.role)})</option>`).join("");
  courseSelect.innerHTML = Object.entries(TRAINING_COURSES).map(([id, c]) => `<option value="${id}">${escapeHtml(c.name)}</option>`).join("");
  if (selectedStaff && state.staff.some(m => m.id === selectedStaff)) staffSelect.value = selectedStaff;
  if (selectedCourse && TRAINING_COURSES[selectedCourse]) courseSelect.value = selectedCourse;
  const staff = state.staff.find(m => m.id === staffSelect.value);
  const course = TRAINING_COURSES[courseSelect.value];
  const preview = $("trainingPreview");
  if (preview && staff && course) {
    preview.textContent = [
      `Course cost: ${money(course.cost)}`,
      `Stamina use: ${course.stamina}`,
      `Expected skill gains: ${Object.entries(course.skills).map(([k,v]) => `${k} +${v}`).join(", ")}`,
      `${staff.name} current stamina: ${Math.round(staff.stamina)}. Perfect quiz gives bonus skill and mood.`,
      state.lastTrainingResult ? `\nLast result:\n${state.lastTrainingResult}` : ""
    ].join("\n");
  }
}

function renderTrainingModal() {
  const session = state.trainingSession;
  const meta = $("trainingQuizMeta");
  const form = $("trainingQuizForm");
  const back = $("trainingBackBtn");
  const primary = $("finishTrainingBtn");
  if (!session || !meta || !form || !back || !primary) return;
  const staff = state.staff.find(m => m.id === session.staffId);
  const course = TRAINING_COURSES[session.courseId];
  if (!staff || !course) return;

  if (session.phase === "result" && session.result) {
    meta.innerHTML = renderTrainingHero(staff, course, "Results ready", "Review the answers, then finish training.");
    form.innerHTML = renderTrainingResult(session.result);
    back.classList.add("hidden");
    primary.disabled = false;
    primary.textContent = "Finish Training";
    primary.classList.add("success");
    return;
  }

  const total = session.questions.length;
  const index = clamp(Number(session.currentIndex) || 0, 0, total - 1);
  session.currentIndex = index;
  const question = session.questions[index];
  const selected = session.answers[index];
  const progress = Math.round(((index + 1) / total) * 100);
  meta.innerHTML = renderTrainingHero(staff, course, `Question ${index + 1} / ${total}`, "Answer the questions to earn bonus skill points.");
  form.innerHTML = `
    <div class="training-progress-wrap" aria-label="Training quiz progress">
      <div class="training-progress-top">
        <strong>Question ${index + 1} of ${total}</strong>
        <span>Perfect score: +3 bonus skill, +mood</span>
      </div>
      <div class="training-progress-bar"><span style="width:${progress}%"></span></div>
    </div>
    <section class="training-question-card" aria-live="polite">
      <div class="training-question-kicker">Q${index + 1}</div>
      <h3>${escapeHtml(question.q)}</h3>
      <div class="training-answer-list">
        ${question.opts.map((option, optionIndex) => renderTrainingOption(question, index, option, optionIndex, selected)).join("")}
      </div>
    </section>`;
  form.querySelectorAll(`input[name="train${index}"]`).forEach(input => {
    input.addEventListener("change", () => updateTrainingAnswer(index, input.value));
  });
  back.classList.toggle("hidden", index === 0);
  back.disabled = index === 0;
  primary.classList.remove("success");
  primary.textContent = index === total - 1 ? "Submit" : "Next";
  primary.disabled = selected === null || selected === undefined;
}

function renderTrainingHero(staff, course, progressText, instruction) {
  return `
    <div class="training-quiz-hero">
      <div class="training-avatar-chip" aria-hidden="true">
        <span>${escapeHtml(roleIcon(staff.role))}</span>
      </div>
      <div class="training-hero-copy">
        <strong>${escapeHtml(staff.name)} - ${escapeHtml(course.name)}</strong>
        <span>${escapeHtml(instruction)}</span>
      </div>
      <div class="training-reward-badge">
        <b>${escapeHtml(trainingCourseIcon(course.name))}</b>
        <span>${escapeHtml(progressText)}</span>
      </div>
    </div>`;
}

function renderTrainingOption(question, questionIndex, option, optionIndex, selected) {
  const id = `train-${questionIndex}-${optionIndex}`;
  const letter = String.fromCharCode(65 + optionIndex);
  const isSelected = Number(selected) === optionIndex;
  return `
    <label class="quiz-option training-answer-option ${isSelected ? "selected" : ""}" for="${id}">
      <input id="${id}" type="radio" name="train${questionIndex}" value="${optionIndex}" ${isSelected ? "checked" : ""} aria-label="Answer ${letter}: ${escapeHtml(option)}">
      <span class="answer-badge" aria-hidden="true">${letter}</span>
      <span class="answer-copy">${escapeHtml(option)}</span>
    </label>`;
}

function renderTrainingResult(result) {
  const perfect = result.correct === result.total;
  const summary = perfect ? "Perfect training run!" : result.correct > 0 ? "Training complete!" : "Training complete - review the notes.";
  return `
    <section class="training-result-card ${perfect ? "perfect" : ""}">
      <div class="training-result-score">
        <span>${escapeHtml(summary)}</span>
        <strong>${result.correct} / ${result.total} correct</strong>
      </div>
      <div class="training-reward-grid">
        ${result.skillGains.map(gain => `<span><b>+${Math.round(gain.amount)}</b> ${escapeHtml(skillLabel(gain.skill))}</span>`).join("")}
        <span><b>+${Math.round(result.moodGain)}</b> Mood</span>
        <span><b>-${Math.round(result.staminaUsed)}</b> Stamina</span>
        <span><b>${money(result.cost)}</b> Cost</span>
      </div>
    </section>
    <div class="training-explanation-list">
      ${result.explanations.map(item => `
        <article class="training-explanation ${item.ok ? "correct" : "incorrect"}">
          <div class="explanation-head">
            <b>${item.ok ? "OK" : "Miss"} Q${item.index + 1}</b>
            <span>${escapeHtml(item.ok ? "Correct answer" : "Review answer")}</span>
          </div>
          <strong>${escapeHtml(item.question)}</strong>
          <p>Your answer: ${escapeHtml(item.selectedText)}</p>
          ${item.ok ? "" : `<p>Correct answer: ${escapeHtml(item.correctText)}</p>`}
          <small><b>Why?</b> ${escapeHtml(item.explanation)}</small>
        </article>`).join("")}
    </div>`;
}

function trainingCourseIcon(courseName) {
  if (/pricing/i.test(courseName)) return "CALC";
  if (/risk/i.test(courseName)) return "RISK";
  if (/marketing/i.test(courseName)) return "BUZZ";
  if (/claims/i.test(courseName)) return "DOC";
  if (/service/i.test(courseName)) return "HELP";
  if (/compliance|regulation/i.test(courseName)) return "OK";
  if (/innovation/i.test(courseName)) return "IDEA";
  if (/analytics/i.test(courseName)) return "DATA";
  return "SKILL";
}

function skillLabel(skill) {
  return String(skill || "skill").replace(/([A-Z])/g, " $1").replace(/^./, ch => ch.toUpperCase());
}

function renderRenovation() {
  const panel = $("renovationPanel");
  const next = nextOfficeConfig();
  if (!panel) return;
  const current = officeConfig();
  panel.innerHTML = `
    <div class="renovation-compare">
      <div>
        <span class="card-meta">Current Office</span>
        <strong>Level ${current.level} - ${escapeHtml(current.name)}</strong>
        <p>Staff: ${current.maxStaff}<br>Equipment Space: ${current.equipmentSpace}</p>
      </div>
      <div class="${next ? "" : "locked-card"}">
        <span class="card-meta">Next Office</span>
        <strong>${next ? `Level ${next.level} - ${escapeHtml(next.name)}` : "Maximum level"}</strong>
        <p>${next ? `Staff: ${next.maxStaff}<br>Equipment Space: ${next.equipmentSpace}<br>Unlocks: ${escapeHtml(next.unlock)}` : "Your headquarters is fully upgraded."}</p>
      </div>
    </div>
    <div class="renovation-callout">${next ? `Renovate for ${money(next.cost)} to expand desks, rooms and office prestige.` : "All renovation levels complete."}</div>`;
  const btn = $("upgradeBtn");
  if (btn) {
    btn.disabled = !next || state.cash < next.cost;
    btn.textContent = next ? `Renovate for ${money(next.cost)}` : "Max Office Level";
  }
}

function renderEquipment() {
  const summary = $("equipmentSummary");
  if (summary) {
    const effects = equipmentEffects();
    summary.textContent = [
      `Installed equipment: ${state.equipment.length}`,
      `Space used: ${installedSpace()}/${equipmentCapacity()}`,
      `Work speed bonus: ${Math.round(effects.workSpeed * 100)}%`,
      `Stamina recovery bonus: ${Math.round(effects.staminaRecovery)}`,
      `Regulatory risk reduction: ${Math.round(effects.regulatoryRisk * 100)}%`
    ].join("\n");
  }
  renderEquipmentFilters();
  const shop = $("equipmentShop");
  if (!shop) return;
  const filter = state.equipmentFilter || "All";
  const visible = filter === "All" ? EQUIPMENT : EQUIPMENT.filter(item => equipmentCategory(item) === filter);
  shop.innerHTML = visible.map(item => {
    const blocked = state.cash < item.cost || installedSpace() + item.space > equipmentCapacity() || state.office < item.minLevel;
    const owned = state.equipment.filter(id => id === item.id).length;
    const reason = state.office < item.minLevel ? `Locked: office Lv ${item.minLevel}` : installedSpace() + item.space > equipmentCapacity() ? "No space" : state.cash < item.cost ? "Need cash" : "";
    return `
      <div class="equipment-card compact-equipment-card">
        <div class="equipment-card-top">
          <span class="equipment-icon">${escapeHtml(equipmentIcon(item))}</span>
          <div>
            <h3>${escapeHtml(item.name)}</h3>
            <div class="card-meta">${escapeHtml(equipmentCategory(item))} | Owned ${owned}</div>
          </div>
        </div>
        <div class="equipment-facts">
          <span>${money(item.cost)}</span>
          <span>Space ${item.space}</span>
          <span>Lv ${item.minLevel}+</span>
        </div>
        <div class="effect-chip-row">${equipmentEffectChips(item).map(chip => `<span>${escapeHtml(chip)}</span>`).join("")}</div>
        <details>
          <summary>Details</summary>
          <p>${escapeHtml(item.effect)}</p>
        </details>
        <button data-buy-equipment="${item.id}" ${blocked ? "disabled" : ""}>${blocked ? reason : "Buy"}</button>
      </div>`;
  }).join("");
  shop.querySelectorAll("[data-buy-equipment]").forEach(btn => btn.addEventListener("click", () => buyEquipment(btn.dataset.buyEquipment)));
}

function renderEquipmentFilters() {
  const filters = $("equipmentFilters");
  if (!filters) return;
  const cats = ["All", ...Array.from(new Set(EQUIPMENT.map(equipmentCategory)))];
  if (!cats.includes(state.equipmentFilter)) state.equipmentFilter = "All";
  filters.innerHTML = cats.map(cat => `<button type="button" class="${state.equipmentFilter === cat ? "active" : ""}" data-equipment-filter="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`).join("");
  filters.querySelectorAll("[data-equipment-filter]").forEach(btn => btn.addEventListener("click", () => {
    state.equipmentFilter = btn.dataset.equipmentFilter;
    saveToStorage();
    renderEquipment();
  }));
}

function equipmentCategory(item) {
  if (/Rest/.test(item.category)) return "Rest";
  if (/Training/.test(item.category)) return "Training";
  if (/Mood/.test(item.category)) return "Mood";
  if (/Prestige/.test(item.category)) return "Prestige";
  if (/Decoration/.test(item.category)) return "Decoration";
  if (item.effects?.claimShock || item.effects?.regulatoryRisk) return "Risk";
  return "Work";
}

function equipmentIcon(item) {
  if (/coffee/i.test(item.name)) return "COF";
  if (/kitchen|sofa/i.test(item.name)) return "REST";
  if (/training|library/i.test(item.name)) return "BOOK";
  if (/plant/i.test(item.name)) return "PLNT";
  if (/award|shelf/i.test(item.name)) return "CUP";
  if (/claims|filing|compliance/i.test(item.name)) return "RISK";
  if (/whiteboard/i.test(item.name)) return "PLAN";
  if (/data/i.test(item.name)) return "DATA";
  return "DESK";
}

function equipmentEffectChips(item) {
  const e = item.effects || {};
  const chips = [];
  if (e.workSpeed) chips.push(`+${Math.round(e.workSpeed * 100)}% Work`);
  if (e.pricingSpeed) chips.push(`+${Math.round(e.pricingSpeed * 100)}% Pricing`);
  if (e.staminaRecovery) chips.push(`+${Math.round(e.staminaRecovery)} Stamina`);
  if (e.mood) chips.push(`+${Math.round(e.mood)} Mood`);
  if (e.trainingBonus) chips.push("+Training XP");
  if (e.claimShock) chips.push(`-${Math.round(e.claimShock * 100)}% Claims`);
  if (e.regulatoryRisk) chips.push(`-${Math.round(e.regulatoryRisk * 100)}% Regulation`);
  if (e.analytics) chips.push("+Forecast");
  if (e.prestige) chips.push("+Prestige");
  return chips.length ? chips : ["Office Item"];
}

function renderStaff() {
  const grid = $("staffGrid");
  if (!grid) return;
  grid.innerHTML = state.staff.map(m => `
    <div class="staff-card">
      <div class="staff-top">
        <div class="avatar">${escapeHtml(m.avatar || roleInitial(m.role))}</div>
        <div><h3>${escapeHtml(m.name)}</h3><div class="card-meta">${escapeHtml(m.role)} | Lv ${m.level} | ${escapeHtml(m.status)}</div></div>
      </div>
      <p>${escapeHtml(m.description)}</p>
      <span class="status-pill">Task: ${escapeHtml(m.task || "Idle")}</span>
      <div class="skill-bars">
        ${["mood","stamina"].map(k => `<div class="skill-row"><span>${k}</span><div class="bar ${k}"><span style="width:${clamp(m[k],0,100)}%"></span></div><b>${Math.round(m[k])}</b></div>`).join("")}
        ${["pricing","risk","marketing","service","speed","compliance","analytics","creativity"].map(k => `<div class="skill-row"><span>${k}</span><div class="bar"><span style="width:${m.skills[k]}%"></span></div><b>${Math.round(m.skills[k])}</b></div>`).join("")}
      </div>
      <p class="muted">Salary ${money(m.salary)}/m | Loyalty ${Math.round(m.loyalty)} | XP ${Math.round(m.xp)}/100</p>
      <div class="actions-row"><button data-rest="${m.id}">Rest</button></div>
    </div>
  `).join("");
  grid.querySelectorAll("[data-rest]").forEach(btn => btn.addEventListener("click", () => restStaff(btn.dataset.rest)));
}

function renderProducts() {
  const report = $("launchReport");
  if (report) report.textContent = state.lastLaunchReport || "No product launched yet.";
  renderTable("productTable", ["Date","Name","Product","Stars","Policies","Fair","Loaded","Profit","Risk"], state.products.map(p => [
    p.date, p.name, p.product, p.stars.toFixed(1), p.policies, money(p.fair), money(p.loaded), money(p.profit), Math.round(p.risk)
  ]));
  const awards = $("awardsCabinet");
  if (awards) awards.innerHTML = state.awards.length ? state.awards.map(a => `<span class="badge">${escapeHtml(a)}</span>`).join("") : `<span class="muted">No awards yet.</span>`;
  ["trophyShelf", "awardsTrophyShelf"].forEach(id => {
    const trophies = $(id);
    if (trophies) trophies.innerHTML = state.trophies.length ? state.trophies.map(t => `<span class="badge">${escapeHtml(t)}</span>`).join("") : `<span class="muted">No trophies yet.</span>`;
  });
  ["achievementList", "awardsAchievementList"].forEach(id => {
    const achievements = $(id);
    if (!achievements) return;
    achievements.innerHTML = state.achievements.length ? state.achievements.map(id => {
      const a = ACHIEVEMENTS.find(x => x.id === id);
      return `<span class="badge">${escapeHtml(a?.name || id)}</span>`;
    }).join("") : `<span class="muted">No achievements yet.</span>`;
  });
}

function renderFinance() {
  const activePolicies = state.policies.reduce((sum,p) => sum + p.active, 0);
  const summary = $("financeSummary");
  if (summary) {
    summary.textContent = [
      `Office level: ${state.office}`,
      `Staff: ${state.staff.length}/${staffCapacity()}`,
      `Equipment: ${installedSpace()}/${equipmentCapacity()} space`,
      `Active policies: ${activePolicies}`,
      `Products launched: ${state.products.length}`,
      `Trophies: ${state.trophies.length}`,
      `Achievements: ${state.achievements.length}`,
      `Interest rate: ${(state.interestRate*100).toFixed(2)}%`,
      `Mortality shock multiplier: ${state.mortalityShock.toFixed(2)}`,
      `Score: ${score().toLocaleString()}`
    ].join("\n");
  }
  renderTable("cashTable", ["Date","Opening","Income","Salaries","Claims","Expenses","Closing","Note"], state.cashFlow.slice(-80).reverse().map(r => [
    r.date, money(r.opening), money(r.income), money(r.salaries), money(r.claims), money(r.expenses), money(r.closing), r.note
  ]));
  drawCashChart();
}

function renderEvents() {
  setText("eventsNewspaper", state.newspaper || "No headline yet.");
  const eventLog = $("eventsLog");
  if (eventLog) {
    const lines = [...(state.officeEventLog || []), ...(state.liveOfficeEvents || [])].slice(0, 12);
    eventLog.textContent = lines.join("\n") || "No events yet.";
  }
  const summary = $("monthlySummaryPanel");
  if (summary) {
    const last = state.cashFlow[state.cashFlow.length - 1];
    if (!last) {
      summary.textContent = "Advance a month to see premium income, claims, expenses and team changes.";
    } else if (state.flags.monthlySummaryDismissed) {
      summary.innerHTML = `<div class="monthly-summary-card"><strong>Monthly summary dismissed</strong><p>Advance another month to see the next cash-flow report.</p></div>`;
    } else {
      const profit = last.closing - last.opening;
      summary.innerHTML = `
        <div class="monthly-summary-card ${profit >= 0 ? "profit" : "loss"}">
          <strong>${escapeHtml(last.date)} monthly summary</strong>
          <div class="metric-grid">
            <div class="metric"><span>Premium income</span><strong>${money(last.income)}</strong></div>
            <div class="metric"><span>Claims</span><strong>${money(last.claims)}</strong></div>
            <div class="metric"><span>Expenses</span><strong>${money(last.expenses + last.salaries)}</strong></div>
            <div class="metric"><span>Profit/loss</span><strong>${money(profit)}</strong></div>
          </div>
          <p>${escapeHtml(last.note || state.ticker || "Office month completed.")}</p>
          <button class="mini-btn" data-dismiss-monthly>Dismiss summary</button>
        </div>`;
    }
  }
}

function renderSettings() {
  const animation = $("animationToggle");
  const compact = $("compactMobileToggle");
  if (animation) animation.checked = state.uiSettings?.animations !== false;
  if (compact) compact.checked = state.uiSettings?.compactMobile === true;
}

function renderQuiz() {
  const status = $("quizStatus");
  const actions = $("quizActions");
  const progress = $("quizProgress");
  const form = $("quizForm");
  const submit = $("submitQuizBtn");
  if (!status || !actions || !progress || !form || !submit) return;
  if (!state.quiz) {
    const done = state.ceoHistory.find(h => h.year === year());
    status.textContent = done ? `Year ${year()} championship completed. Result: ${done.skipped ? "Skipped" : done.correct + "/5"}.` : `Year ${year()} Championship is open. Entry is free. Rewards start at 3 correct.`;
    actions.classList.toggle("hidden", !!done);
    progress.classList.add("hidden");
    form.innerHTML = "";
    submit.classList.add("hidden");
    return;
  }
  status.textContent = `Year ${state.quiz.year} TV game show. Five questions. Sound placeholder: countdown tick.`;
  actions.classList.add("hidden");
  progress.classList.remove("hidden");
  submit.classList.remove("hidden");
  form.innerHTML = state.quiz.questions.map((q, i) => `
    <div class="quiz-question">
      <strong>Question ${i+1}/5 (${escapeHtml(q.topic)}): ${escapeHtml(q.q)}</strong>
      ${q.optsShuffled.map(o => `<label class="quiz-option"><input type="radio" name="quiz${i}" value="${o.original}"> ${escapeHtml(o.text)}</label>`).join("")}
    </div>`).join("");
  form.querySelectorAll("input[type='radio']").forEach(input => input.addEventListener("change", updateQuizProgress));
  updateQuizProgress();
}

function updateQuizProgress() {
  const progress = $("quizProgress");
  if (!progress || !state.quiz) return;
  const answered = state.quiz.questions.reduce((count, _, i) => count + (document.querySelector(`input[name="quiz${i}"]:checked`) ? 1 : 0), 0);
  const width = clamp(answered / state.quiz.questions.length * 100, 4, 100);
  progress.innerHTML = `<span style="width:${width}%"></span><strong>Question progress: ${answered}/${state.quiz.questions.length}</strong>`;
}

function renderLeaderboard() {
  const board = getLeaderboard();
  renderTable("leaderboardTable", ["Rank","Player","Company","Year","Cash","Fans","Rep","Trophies","Achv","Score","Time"], board.map((b,i) => [
    i+1, b.player, b.company, b.year, money(b.cash), Math.round(b.fans).toLocaleString(), Number(b.reputation).toFixed(1), b.trophies || b.awards || 0, b.achievements || 0, b.score.toLocaleString(), b.time
  ]));
}

function renderTable(id, headers, rows) {
  const table = $(id);
  if (!table) return;
  const body = rows.length ? rows.map(r => `<tr>${r.map(c => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${headers.length}" class="muted">No data yet.</td></tr>`;
  table.innerHTML = `<thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${body}</tbody>`;
}

function drawCashChart() {
  const c = $("cashChart");
  if (!c) return;
  const ctx = c.getContext("2d");
  ctx.clearRect(0,0,c.width,c.height);
  const hist = state.cashHist.slice(-120);
  if (hist.length < 2) return;
  const pad = 45;
  const min = Math.min(0, ...hist.map(h => h.cash));
  const max = Math.max(START_CASH, ...hist.map(h => h.cash));
  ctx.strokeStyle = "#263044";
  ctx.lineWidth = 3;
  ctx.strokeRect(pad, 20, c.width-pad-20, c.height-pad-25);
  ctx.beginPath();
  hist.forEach((h, i) => {
    const x = pad + i/(hist.length-1)*(c.width-pad-25);
    const y = 20 + (max - h.cash)/(max-min || 1)*(c.height-pad-30);
    if (i === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.strokeStyle = "#2f6df6";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#263044";
  ctx.font = "16px system-ui";
  ctx.fillText(`Cash: ${money(state.cash)}`, pad, c.height-12);
}

function initEvents() {
  document.querySelectorAll(".tab").forEach(btn => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));
  $("advanceBtn").addEventListener("click", () => advanceMonth());
  $("autoBtn").addEventListener("click", autoAdvanceYear);
  $("contractBtn").addEventListener("click", consultingContract);
  $("officeZoomOut").addEventListener("click", () => changeOfficeZoom(-.1));
  $("officeZoomReset").addEventListener("click", resetOfficeView);
  $("officeZoomIn").addEventListener("click", () => changeOfficeZoom(.1));
  $("startProjectBtn").addEventListener("click", startProject);
  $("refreshCandidatesBtn").addEventListener("click", refreshCandidates);
  $("upgradeBtn").addEventListener("click", upgradeOffice);
  $("restAllBtn").addEventListener("click", restAll);
  $("trainAllBtn").addEventListener("click", trainAll);
  $("beginTrainingBtn").addEventListener("click", beginTraining);
  $("trainingBackBtn").addEventListener("click", trainingBack);
  $("finishTrainingBtn").addEventListener("click", finishTraining);
  $("cancelTrainingBtn").addEventListener("click", cancelTraining);
  $("enterCompetitionBtn").addEventListener("click", enterCompetition);
  $("skipCompetitionBtn").addEventListener("click", skipCompetition);
  $("submitQuizBtn").addEventListener("click", submitQuiz);
  $("publishBtn").addEventListener("click", () => publishRun(false));
  $("saveBtn").addEventListener("click", () => { saveToStorage(); toast("Saved."); });
  $("loadBtn").addEventListener("click", loadSavedRun);
  $("settingsSaveBtn").addEventListener("click", () => { saveToStorage(); toast("Saved."); });
  $("settingsLoadBtn").addEventListener("click", loadSavedRun);
  $("resetBtn").addEventListener("click", resetGame);
  $("animationToggle").addEventListener("change", () => { syncUISettingsFromControls(); saveToStorage(); renderKpis(); });
  $("compactMobileToggle").addEventListener("change", () => { syncUISettingsFromControls(); saveToStorage(); renderKpis(); });
  ["productType","productName","segment","channel","benefit","annPayment","loading","assumedInterest","mortalityMargin","marketingBudget","underwritingStrictness","serviceQuality","complianceDepth","productComplexity"].forEach(id => {
    $(id).addEventListener("input", () => {
      state.designSettings = getInputs();
      markUnsaved();
      syncDesignLabels();
      renderProject();
    });
  });
  ["playerName","companyName"].forEach(id => {
    const input = $(id);
    if (input) input.addEventListener("input", markUnsaved);
  });
  document.querySelectorAll("[data-product-preset]").forEach(btn => {
    btn.addEventListener("click", () => applyProductPreset(btn.dataset.productPreset));
  });
  document.querySelectorAll("[data-quick-tab]").forEach(btn => btn.addEventListener("click", () => {
    switchTab(btn.dataset.quickTab);
  }));
  $("trainingStaff").addEventListener("change", renderTrainingPanel);
  $("trainingCourse").addEventListener("change", renderTrainingPanel);
  document.addEventListener("click", event => {
    const recTab = event.target.closest("[data-recommend-tab]");
    if (recTab) switchTab(recTab.dataset.recommendTab);
    if (event.target.id === "recommendedAdvanceBtn") advanceMonth();
    if (event.target.matches("[data-dismiss-monthly]")) {
      state.flags.monthlySummaryDismissed = true;
      saveToStorage();
      renderEvents();
    }
  });
  document.addEventListener("keydown", handleGlobalShortcut);
  bindOfficeViewportPan();
}

function applyProductPreset(preset) {
  const presets = {
    safe: {
      productType:"FamilyProtection", productName:"Family Shield Starter", segment:"35", channel:"Online",
      benefit:"100000", annPayment:"10000", loading:"0.15", assumedInterest:"0.04", mortalityMargin:"0.12",
      marketingBudget:"30000", underwritingStrictness:"60", serviceQuality:"58", complianceDepth:"58", productComplexity:"35"
    },
    growth: {
      productType:"Term10", productName:"Quick Growth Term", segment:"35", channel:"Online",
      benefit:"85000", annPayment:"10000", loading:"0.12", assumedInterest:"0.04", mortalityMargin:"0.08",
      marketingBudget:"52000", underwritingStrictness:"48", serviceQuality:"50", complianceDepth:"45", productComplexity:"40"
    },
    premium: {
      productType:"WL_Insurance", productName:"Trusted Whole Life", segment:"45", channel:"Adviser",
      benefit:"120000", annPayment:"10000", loading:"0.20", assumedInterest:"0.04", mortalityMargin:"0.14",
      marketingBudget:"42000", underwritingStrictness:"66", serviceQuality:"72", complianceDepth:"70", productComplexity:"52"
    }
  };
  const selected = presets[preset] || presets.safe;
  Object.entries(selected).forEach(([id, value]) => {
    const el = $(id);
    if (el) el.value = value;
  });
  state.designSettings = getInputs();
  markUnsaved();
  syncDesignLabels();
  renderProject();
  toast(`${preset === "growth" ? "Growth" : preset === "premium" ? "Premium trust" : "Safe starter"} preset applied.`);
}

function loadSavedRun() {
  state = normalizeState(loadFromStorage() || freshState());
  applySavedInputs();
  toast("Loaded.");
  render();
  restoreCurrentTab();
}

function autoAdvanceYear() {
  for (let i = 0; i < 12 && state.cash >= 0 && year() <= MAX_YEARS; i++) advanceMonth();
}

function handleGlobalShortcut(event) {
  if (shortcutBlocked(event)) return;
  if ((event.code === "Space" || event.key === "Enter") && !event.shiftKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    advanceMonth();
  } else if (event.shiftKey && event.key.toLowerCase() === "a") {
    event.preventDefault();
    autoAdvanceYear();
  } else if (!event.shiftKey && !event.ctrlKey && !event.altKey && event.key.toLowerCase() === "s") {
    event.preventDefault();
    saveToStorage();
    toast("Saved.");
  }
}

function shortcutBlocked(event) {
  const target = event.target;
  const tag = target?.tagName?.toLowerCase();
  const typing = tag === "input" || tag === "select" || tag === "textarea" || target?.isContentEditable;
  const modalOpen = !$("trainingModal")?.classList.contains("hidden") || !!state.quiz;
  return typing || modalOpen;
}

function startOfficeAnimationLoop() {
  if (window.officeAnimationTimer) clearInterval(window.officeAnimationTimer);
  if (window.officeAnimationFrame && window.cancelAnimationFrame) cancelAnimationFrame(window.officeAnimationFrame);
  const raf = window.requestAnimationFrame || (cb => setTimeout(() => cb(Date.now()), 140));
  let last = 0;
  const tick = now => {
    const frameDelay = state.uiSettings?.animations === false ? 1200 : 140;
    if (document.visibilityState !== "hidden" && now - last > frameDelay) {
      renderOffice(false);
      last = now;
    }
    window.officeAnimationFrame = raf(tick);
  };
  window.officeAnimationFrame = raf(tick);
}

applySavedInputs();
initEvents();
checkAchievements();
render();
restoreCurrentTab();
startOfficeAnimationLoop();
