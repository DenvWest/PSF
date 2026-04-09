import { useState, useEffect, useRef } from "react";

// ─── Data ────────────────────────────────────────────────────────
const SYMPTOMS = [
  { id: "stress", icon: "🧠", label: "Stress", desc: "Meer prikkelbaarheid, minder rust" },
  { id: "slaap", icon: "🌙", label: "Slaap", desc: "Moeite met inslapen of doorslapen" },
  { id: "energie", icon: "⚡", label: "Energie", desc: "Lege batterij, minder drive" },
];

const CATEGORIES = [
  { id: "slaap", label: "Slaap", icon: "🌙", color: "#5B6EAE" },
  { id: "energie", label: "Energie", icon: "⚡", color: "#C4873B" },
  { id: "stress", label: "Stress", icon: "🧠", color: "#8B6E99" },
  { id: "voeding", label: "Voeding", icon: "🥗", color: "#5A8F6A" },
  { id: "beweging", label: "Beweging", icon: "🏃", color: "#C26E4B" },
  { id: "herstel", label: "Herstel", icon: "🔄", color: "#4A8A99" },
];

const QUESTIONS = [
  {
    id: "SLP_QUAL", category: "slaap", questionIndex: 1,
    question: "Hoe voel je je gemiddeld als je wakker wordt?",
    options: [
      { label: "Uitgerust en helder", value: 4 },
      { label: "Redelijk, maar niet optimaal", value: 3 },
      { label: "Wisselend, verschilt per dag", value: 2 },
      { label: "Moe, alsof ik niet geslapen heb", value: 1 },
    ],
  },
  {
    id: "SLP_CONS", category: "slaap", questionIndex: 2,
    question: "Lukt het je om op een vast tijdstip te slapen en wakker te worden?",
    options: [
      { label: "Ja, vrij consistent", value: 3 },
      { label: "Meestal wel, soms niet", value: 2 },
      { label: "Nee, mijn ritme is onregelmatig", value: 1 },
    ],
  },
  {
    id: "NRG_PATN", category: "energie", questionIndex: 1,
    question: "Hoe zou je je energieniveau overdag omschrijven?",
    options: [
      { label: "Stabiel de hele dag", value: 4 },
      { label: "Goed in de ochtend, dip in de middag", value: 2 },
      { label: "Wisselend en onvoorspelbaar", value: 2 },
      { label: "Laag vanaf het begin", value: 1 },
    ],
  },
  {
    id: "NRG_DEP", category: "energie", questionIndex: 2,
    question: "Waar leun je op voor energie?",
    options: [
      { label: "Ik heb weinig stimulanten nodig", value: 4 },
      { label: "Koffie of energiedrank (1–2 per dag)", value: 3 },
      { label: "Koffie of energiedrank (3+ per dag)", value: 1 },
      { label: "Regelmatig suiker of snacks als opkikker", value: 1 },
    ],
  },
  {
    id: "STR_FREQ", category: "stress", questionIndex: 1,
    question: "Hoe vaak voel je je gestrest of overprikkeld?",
    options: [
      { label: "Zelden", value: 4 },
      { label: "Soms, maar beheersbaar", value: 3 },
      { label: "Regelmatig", value: 2 },
      { label: "Dagelijks of bijna dagelijks", value: 1 },
    ],
  },
  {
    id: "STR_RECV", category: "stress", questionIndex: 2,
    question: "Na een drukke dag, hoe snel kom je tot rust?",
    options: [
      { label: "Vrij snel, ik kan goed loslaten", value: 4 },
      { label: "Het kost me wat tijd, maar lukt wel", value: 3 },
      { label: "Ik neem stress mee naar bed", value: 1 },
      { label: "Stress stapelt zich op over dagen", value: 1 },
    ],
  },
  {
    id: "NUT_QUAL", category: "voeding", questionIndex: 1,
    question: "Hoe zou je je dagelijkse eetpatroon omschrijven?",
    options: [
      { label: "Gevarieerd met groente, eiwitten en vetten", value: 4 },
      { label: "Redelijk, maar niet altijd bewust", value: 3 },
      { label: "Onregelmatig of eenzijdig", value: 2 },
      { label: "Veel bewerkt voedsel, weinig groente", value: 1 },
    ],
  },
  {
    id: "NUT_O3", category: "voeding", questionIndex: 2,
    question: "Eet je regelmatig vette vis (zalm, makreel, sardines)?",
    options: [
      { label: "2× per week of vaker", value: 3 },
      { label: "Ongeveer 1× per week", value: 2 },
      { label: "Zelden of nooit", value: 1 },
    ],
  },
  {
    id: "MOV_FREQ", category: "beweging", questionIndex: 1,
    question: "Hoe vaak beweeg je intensief (sport, kracht, hardlopen)?",
    options: [
      { label: "3× per week of meer", value: 4 },
      { label: "1–2× per week", value: 3 },
      { label: "Minder dan 1× per week", value: 2 },
      { label: "Zelden of nooit", value: 1 },
    ],
  },
  {
    id: "MOV_DAILY", category: "beweging", questionIndex: 2,
    question: "Hoeveel beweeg je buiten sport om?",
    options: [
      { label: "Veel — ik sta en loop de hele dag", value: 3 },
      { label: "Gemiddeld — ik wissel zitten en bewegen af", value: 2 },
      { label: "Weinig — ik zit het grootste deel van de dag", value: 1 },
    ],
  },
  {
    id: "RCV_PHYS", category: "herstel", questionIndex: 1,
    question: "Hoe snel herstel je na inspanning?",
    options: [
      { label: "Binnen een dag", value: 3 },
      { label: "Duurt 2–3 dagen", value: 2 },
      { label: "Ik voel me langer moe of stijf", value: 1 },
    ],
  },
  {
    id: "RCV_MENT", category: "herstel", questionIndex: 2,
    question: "Neem je bewust momenten van rust of ontspanning?",
    options: [
      { label: "Ja, dagelijks (meditatie, wandeling, ademhaling)", value: 3 },
      { label: "Soms, maar niet structureel", value: 2 },
      { label: "Nee, daar kom ik niet aan toe", value: 1 },
    ],
  },
];

// ─── Score calculations ──────────────────────────────────────────
function calcDomainScores(answers) {
  const get = (id) => answers[id] || 0;
  return {
    slaap:    Math.round(((get("SLP_QUAL") + get("SLP_CONS")) / 7) * 100),
    energie:  Math.round(((get("NRG_PATN") + get("NRG_DEP")) / 8) * 100),
    stress:   Math.round(((get("STR_FREQ") + get("STR_RECV")) / 8) * 100),
    voeding:  Math.round(((get("NUT_QUAL") + get("NUT_O3")) / 7) * 100),
    beweging: Math.round(((get("MOV_FREQ") + get("MOV_DAILY")) / 7) * 100),
    herstel:  Math.round(((get("RCV_PHYS") + get("RCV_MENT")) / 6) * 100),
  };
}

function getUrgency(scores) {
  const vals = Object.values(scores);
  const under30 = vals.filter(v => v < 30).length;
  const under50 = vals.filter(v => v < 50).length;
  const under60 = vals.filter(v => v < 60).length;
  if (under30 >= 2) return { level: "critical", label: "Urgente aandacht nodig", color: "#C0392B" };
  if (under30 >= 1 || under50 >= 3) return { level: "moderate", label: "Ruimte voor verbetering", color: "#C4873B" };
  if (under60 >= 2) return { level: "mild", label: "Fijn te optimaliseren", color: "#5A8F6A" };
  return { level: "healthy", label: "Sterke basis", color: "#3A7D5C" };
}

function getProfileLabel(scores) {
  const sorted = Object.entries(scores).sort((a, b) => a[1] - b[1]);
  const lowest = sorted[0];
  const map = {
    slaap: "Onrustige Slaper",
    energie: "Lage Batterij",
    stress: "Stressdrager",
    voeding: "Basis Mist",
    beweging: "Stilzitter",
    herstel: "Stille Slijter",
  };
  return { name: map[lowest[0]], domain: lowest[0], score: lowest[1] };
}

function getAdvice(scores, answers, symptoms) {
  const quickWins = [];
  const supplements = [];
  const longTerm = [];

  // Sleep rules
  if (scores.slaap < 50) {
    quickWins.push("Zet je telefoon om 21:00 op vliegtuigmodus en dim het licht in huis.");
    if (scores.stress < 50) {
      supplements.push({ name: "Magnesium glycinaat", reason: "Ondersteunt spierontspanning en een rustigere nachtrust.", link: "/magnesium-vergelijken" });
    }
    longTerm.push("Bouw een vast slaap-waak-ritme op — ook in het weekend.");
  }

  // Stress rules
  if (scores.stress < 50) {
    quickWins.push("Begin met 5 minuten ademhalingsoefening voor het slapen (4-7-8 methode).");
    supplements.push({ name: "Ashwagandha", reason: "Helpt het lichaam omgaan met chronische stress en ondersteunt cortisolbalans.", link: "/blog/ashwagandha-werking-mannen" });
    longTerm.push("Structureer je dag met vaste blokken voor focus en bewuste pauzes.");
  }

  // Energy rules
  if (scores.energie < 50) {
    if (scores.voeding < 50) {
      quickWins.push("Start de dag met een eiwitrijk ontbijt (eieren, kwark, noten).");
    } else {
      quickWins.push("Wandel 10 minuten na de lunch — dit stabiliseert je bloedsuiker.");
    }
    longTerm.push("Verminder geleidelijk je afhankelijkheid van cafeïne na 14:00.");
  }

  // Nutrition rules
  if (answers["NUT_O3"] <= 1) {
    supplements.push({ name: "Omega-3 (EPA/DHA)", reason: "Je eet zelden vette vis. Omega-3 ondersteunt hart, hersenen en ontstekingsbalans.", link: "/omega-3-vergelijken" });
  }
  if (scores.voeding < 40) {
    quickWins.push("Voeg bij elke maaltijd een handvol groente of een stuk fruit toe.");
    longTerm.push("Werk toe naar een gevarieerd eetpatroon met meer onbewerkt voedsel.");
  }

  // Movement rules
  if (scores.beweging < 40) {
    quickWins.push("Begin met 10 minuten wandelen na het avondeten — elke dag.");
    longTerm.push("Bouw op naar 2–3 krachtsessies per week. Start licht.");
  }

  // Recovery rules
  if (scores.herstel < 40) {
    longTerm.push("Plan wekelijks minimaal één volledige rustdag zonder training.");
    if (scores.beweging > 60) {
      quickWins.push("Je beweegt veel maar herstelt slecht — neem vandaag een rustdag.");
    }
  }

  // Ensure minimums
  if (quickWins.length === 0) quickWins.push("Je staat er goed voor. Houd je huidige ritme vast.");
  if (supplements.length === 0) supplements.push({ name: "Geen acute noodzaak", reason: "Je profiel laat geen duidelijke tekorten zien. Focus op leefstijl.", link: null });
  if (longTerm.length === 0) longTerm.push("Blijf consistent. Kleine verbeteringen stapelen op over weken.");

  return { quickWins: quickWins.slice(0, 3), supplements: supplements.slice(0, 3), longTerm: longTerm.slice(0, 3) };
}

// ─── Components ──────────────────────────────────────────────────
function ScoreRing({ score, size = 72, stroke = 5, color }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const bg = color + "22";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{ transform: "rotate(90deg)", transformOrigin: "center", fontSize: size * 0.28, fontWeight: 700, fill: color, fontFamily: "'DM Sans', sans-serif" }}>
        {score}
      </text>
    </svg>
  );
}

function ProgressDots({ categories, currentCatIndex, phase }) {
  if (phase !== "questions") return null;
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", padding: "16px 0" }}>
      {categories.map((cat, i) => (
        <div key={cat.id} style={{
          width: i === currentCatIndex ? 28 : 8, height: 8, borderRadius: 4,
          background: i < currentCatIndex ? cat.color : i === currentCatIndex ? cat.color : "#ddd",
          transition: "all 0.3s ease", opacity: i <= currentCatIndex ? 1 : 0.4,
        }} />
      ))}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────
export default function PerfectSupplementIntake() {
  const [phase, setPhase] = useState("intro"); // intro | symptoms | questions | calculating | results
  const [symptoms, setSymptoms] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [scores, setScores] = useState(null);
  const [fadeIn, setFadeIn] = useState(true);
  const containerRef = useRef(null);

  const currentQuestion = QUESTIONS[currentQ];
  const currentCategory = currentQuestion ? CATEGORIES.find(c => c.id === currentQuestion.category) : null;
  const currentCatIndex = currentCategory ? CATEGORIES.findIndex(c => c.id === currentCategory.id) : 0;

  // Check if we just entered a new category
  const prevQuestion = currentQ > 0 ? QUESTIONS[currentQ - 1] : null;
  const isNewCategory = !prevQuestion || (currentQuestion && prevQuestion.category !== currentQuestion.category);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    setFadeIn(false);
    const t = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(t);
  }, [phase, currentQ]);

  function toggleSymptom(id) {
    setSymptoms(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }

  function selectAnswer(questionId, value) {
    if (animating) return;
    setSelectedOption(value);
    setAnimating(true);

    setTimeout(() => {
      setAnswers(prev => ({ ...prev, [questionId]: value }));
      setSelectedOption(null);
      setAnimating(false);

      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        setPhase("calculating");
        setTimeout(() => {
          const s = calcDomainScores({ ...answers, [questionId]: value });
          setScores(s);
          setPhase("results");
        }, 2200);
      }
    }, 400);
  }

  const wrapStyle = {
    maxWidth: 480, margin: "0 auto", minHeight: "100vh",
    fontFamily: "'DM Sans', sans-serif", color: "#1a1a1a",
    background: "linear-gradient(180deg, #FAFAF7 0%, #F4F1EB 100%)",
    position: "relative", overflow: "hidden",
  };

  const contentStyle = {
    padding: "24px 24px 40px",
    opacity: fadeIn ? 1 : 0, transform: fadeIn ? "translateY(0)" : "translateY(12px)",
    transition: "opacity 0.4s ease, transform 0.4s ease",
  };

  // ── INTRO ──
  if (phase === "intro") {
    return (
      <div style={wrapStyle}>
        <div style={contentStyle}>
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#999", marginBottom: 16 }}>
              PerfectSupplement
            </div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, fontWeight: 400, lineHeight: 1.25, margin: "0 0 16px", color: "#1a1a1a" }}>
              Ontdek waar je staat
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: "#666", maxWidth: 340, margin: "0 auto 40px" }}>
              Beantwoord 12 korte vragen over je leefstijl. Na 3 minuten weet je precies waar je kunt verbeteren — en hoe.
            </p>
            <div style={{
              display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48,
            }}>
              {CATEGORIES.map(c => (
                <div key={c.id} style={{
                  background: "white", border: "1px solid #eee", borderRadius: 10,
                  padding: "10px 14px", fontSize: 13, fontWeight: 500, color: "#555",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span>{c.icon}</span> {c.label}
                </div>
              ))}
            </div>
            <button onClick={() => setPhase("symptoms")} style={{
              background: "#1a1a1a", color: "white", border: "none", borderRadius: 14,
              padding: "18px 48px", fontSize: 16, fontWeight: 600, cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 6px 28px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)"; }}
            >
              Start de intake →
            </button>
            <p style={{ fontSize: 12, color: "#aaa", marginTop: 16 }}>Duurt ± 3 minuten · geen account nodig</p>
          </div>
        </div>
      </div>
    );
  }

  // ── SYMPTOMS ──
  if (phase === "symptoms") {
    return (
      <div style={wrapStyle}>
        <div style={contentStyle}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "#999", marginBottom: 8 }}>
            Stap 1 van 2
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, margin: "0 0 8px" }}>
            Wat herken je?
          </h2>
          <p style={{ fontSize: 15, color: "#777", margin: "0 0 32px", lineHeight: 1.5 }}>
            Selecteer de symptomen die op jou van toepassing zijn.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
            {SYMPTOMS.map(s => {
              const active = symptoms.includes(s.id);
              return (
                <button key={s.id} onClick={() => toggleSymptom(s.id)} style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "20px",
                  background: active ? "#1a1a1a" : "white",
                  color: active ? "white" : "#1a1a1a",
                  border: active ? "2px solid #1a1a1a" : "2px solid #e8e6e1",
                  borderRadius: 14, cursor: "pointer", textAlign: "left",
                  transition: "all 0.25s ease",
                  boxShadow: active ? "0 4px 20px rgba(0,0,0,0.12)" : "none",
                }}>
                  <span style={{ fontSize: 28, filter: active ? "brightness(1.3)" : "none" }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 600 }}>{s.label}</div>
                    <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>{s.desc}</div>
                  </div>
                  {active && (
                    <div style={{ marginLeft: "auto", width: 24, height: 24, borderRadius: 12, background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#1a1a1a", fontWeight: 700, fontSize: 14 }}>✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button onClick={() => symptoms.length > 0 && setPhase("questions")} style={{
            width: "100%", padding: "18px", background: symptoms.length > 0 ? "#1a1a1a" : "#ddd",
            color: symptoms.length > 0 ? "white" : "#999", border: "none", borderRadius: 14,
            fontSize: 16, fontWeight: 600, cursor: symptoms.length > 0 ? "pointer" : "default",
            transition: "all 0.3s ease",
          }}>
            {symptoms.length > 0 ? "Verder naar leefstijlcheck →" : "Selecteer minimaal 1 symptoom"}
          </button>
        </div>
      </div>
    );
  }

  // ── QUESTIONS ──
  if (phase === "questions") {
    const catColor = currentCategory?.color || "#1a1a1a";
    return (
      <div style={wrapStyle}>
        <div style={{ padding: "16px 24px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "#999" }}>
              Stap 2 van 2
            </div>
            <div style={{ fontSize: 13, color: "#bbb" }}>
              {currentQ + 1} / {QUESTIONS.length}
            </div>
          </div>
          <ProgressDots categories={CATEGORIES} currentCatIndex={currentCatIndex} phase={phase} />
        </div>

        <div style={contentStyle} key={currentQ}>
          {/* Category badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: catColor + "15", border: `1px solid ${catColor}30`,
            borderRadius: 8, padding: "6px 14px", marginBottom: 20,
          }}>
            <span style={{ fontSize: 16 }}>{currentCategory?.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: catColor }}>{currentCategory?.label}</span>
            <span style={{ fontSize: 11, color: catColor + "99" }}>— vraag {currentQuestion.questionIndex} van 2</span>
          </div>

          <h2 style={{
            fontFamily: "'DM Serif Display', serif", fontSize: 24, fontWeight: 400,
            lineHeight: 1.3, margin: "0 0 32px", color: "#1a1a1a",
          }}>
            {currentQuestion.question}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {currentQuestion.options.map((opt, i) => {
              const isSelected = selectedOption === opt.value && animating;
              return (
                <button key={i} onClick={() => selectAnswer(currentQuestion.id, opt.value)} style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "18px 20px", background: isSelected ? catColor : "white",
                  color: isSelected ? "white" : "#1a1a1a",
                  border: isSelected ? `2px solid ${catColor}` : "2px solid #e8e6e1",
                  borderRadius: 14, cursor: "pointer", fontSize: 15, fontWeight: 500,
                  transition: "all 0.25s ease", lineHeight: 1.4,
                  boxShadow: isSelected ? `0 4px 16px ${catColor}33` : "none",
                }}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── CALCULATING ──
  if (phase === "calculating") {
    return (
      <div style={{ ...wrapStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{
            width: 56, height: 56, border: "3px solid #eee", borderTopColor: "#1a1a1a",
            borderRadius: "50%", margin: "0 auto 28px",
            animation: "spin 0.8s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 400, margin: "0 0 8px" }}>
            Je profiel wordt berekend...
          </h2>
          <p style={{ fontSize: 14, color: "#999" }}>Scores, signalen en advies op maat</p>
        </div>
      </div>
    );
  }

  // ── RESULTS ──
  if (phase === "results" && scores) {
    const urgency = getUrgency(scores);
    const profile = getProfileLabel(scores);
    const advice = getAdvice(scores, answers, symptoms);
    const sortedDomains = Object.entries(scores).sort((a, b) => a[1] - b[1]);
    const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 6);

    return (
      <div style={wrapStyle}>
        <div style={{ ...contentStyle, paddingTop: 32 }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: "#999", marginBottom: 12 }}>
              Jouw Herstelplan
            </div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, fontWeight: 400, margin: "0 0 6px" }}>
              {profile.name}
            </h1>
            <p style={{ fontSize: 15, color: "#777", margin: "0 0 20px" }}>
              Je primaire aandachtsgebied is <strong style={{ color: CATEGORIES.find(c => c.id === profile.domain)?.color }}>
                {profile.domain}
              </strong> met een score van {profile.score}/100.
            </p>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: urgency.color + "15", border: `1px solid ${urgency.color}30`,
              borderRadius: 8, padding: "8px 16px",
            }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: urgency.color }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: urgency.color }}>{urgency.label}</span>
            </div>
          </div>

          {/* Overall score */}
          <div style={{
            background: "white", borderRadius: 16, padding: "28px 24px", marginBottom: 16,
            border: "1px solid #e8e6e1", textAlign: "center",
          }}>
            <ScoreRing score={overall} size={96} stroke={6} color="#1a1a1a" />
            <div style={{ fontSize: 13, fontWeight: 600, color: "#999", marginTop: 12, letterSpacing: 0.5 }}>
              TOTAALSCORE
            </div>
          </div>

          {/* Domain scores grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 28,
          }}>
            {sortedDomains.map(([domain, score]) => {
              const cat = CATEGORIES.find(c => c.id === domain);
              return (
                <div key={domain} style={{
                  background: "white", borderRadius: 14, padding: "20px 12px",
                  border: "1px solid #e8e6e1", textAlign: "center",
                  borderLeft: `3px solid ${cat.color}`,
                }}>
                  <ScoreRing score={score} size={52} stroke={4} color={cat.color} />
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#888", marginTop: 8, letterSpacing: 0.3 }}>
                    {cat.icon} {cat.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Wins */}
          <div style={{
            background: "white", borderRadius: 16, padding: "24px", marginBottom: 16,
            border: "1px solid #e8e6e1",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#5A8F6A18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Quick Wins</div>
                <div style={{ fontSize: 12, color: "#999" }}>Start hier — deze week nog</div>
              </div>
            </div>
            {advice.quickWins.map((tip, i) => (
              <div key={i} style={{
                display: "flex", gap: 12, padding: "12px 0",
                borderTop: i > 0 ? "1px solid #f0ede8" : "none",
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 12, background: "#5A8F6A",
                  color: "white", fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{i + 1}</div>
                <p style={{ fontSize: 14, lineHeight: 1.5, color: "#444", margin: 0 }}>{tip}</p>
              </div>
            ))}
          </div>

          {/* Supplements */}
          <div style={{
            background: "white", borderRadius: 16, padding: "24px", marginBottom: 16,
            border: "1px solid #e8e6e1",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#C4873B18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💊</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Supplementroute</div>
                <div style={{ fontSize: 12, color: "#999" }}>Gericht op jouw profiel</div>
              </div>
            </div>
            {advice.supplements.map((sup, i) => (
              <div key={i} style={{
                padding: "14px 16px", background: "#FAFAF7", borderRadius: 10,
                marginBottom: i < advice.supplements.length - 1 ? 8 : 0,
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: "#1a1a1a" }}>{sup.name}</div>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: "#777" }}>{sup.reason}</div>
                {sup.link && (
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#C4873B", marginTop: 6, cursor: "pointer" }}>
                    Bekijk vergelijking →
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Long term */}
          <div style={{
            background: "white", borderRadius: 16, padding: "24px", marginBottom: 28,
            border: "1px solid #e8e6e1",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#5B6EAE18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📈</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Langetermijnstrategie</div>
                <div style={{ fontSize: 12, color: "#999" }}>Maand 2 en verder</div>
              </div>
            </div>
            {advice.longTerm.map((tip, i) => (
              <div key={i} style={{
                display: "flex", gap: 12, padding: "12px 0",
                borderTop: i > 0 ? "1px solid #f0ede8" : "none",
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: 3, background: "#5B6EAE", flexShrink: 0, marginTop: 7,
                }} />
                <p style={{ fontSize: 14, lineHeight: 1.5, color: "#444", margin: 0 }}>{tip}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{
            background: "#1a1a1a", borderRadius: 16, padding: "28px 24px", textAlign: "center",
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "white", marginBottom: 4 }}>
              Over 30 dagen opnieuw meten?
            </div>
            <div style={{ fontSize: 13, color: "#999", marginBottom: 20 }}>
              Vergelijk je scores en zie wat er verbeterd is.
            </div>
            <button style={{
              background: "white", color: "#1a1a1a", border: "none", borderRadius: 10,
              padding: "14px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>
              Herinnering instellen
            </button>
          </div>

          {/* Restart */}
          <button onClick={() => { setPhase("intro"); setSymptoms([]); setCurrentQ(0); setAnswers({}); setScores(null); }} style={{
            width: "100%", padding: "14px", background: "none", color: "#999",
            border: "1px solid #e0ddd7", borderRadius: 12, fontSize: 13, fontWeight: 500,
            cursor: "pointer",
          }}>
            Opnieuw beginnen
          </button>

          <p style={{ fontSize: 11, color: "#bbb", textAlign: "center", marginTop: 20, lineHeight: 1.5 }}>
            Dit is geen medisch advies. Raadpleeg een arts bij klachten.
            <br />© 2026 PerfectSupplement
          </p>
        </div>
      </div>
    );
  }

  return null;
}
