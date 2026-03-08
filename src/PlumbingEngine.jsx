
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0a0a", sidebar: "#0f0f0f", card: "#141414", cardAlt: "#1a1a1a",
  border: "#242424", borderLight: "#2e2e2e",
  gold: "#c9a84c", goldLight: "#e8c96a", goldDim: "#8a6f2e", goldFaint: "#c9a84c18",
  text: "#e4dcc8", textMuted: "#6e6456", textDim: "#3a3328",
  green: "#4caf7d", greenFaint: "#4caf7d18",
  red: "#e05c5c", redFaint: "#e05c5c18",
  blue: "#5c9ae0", blueFaint: "#5c9ae018",
  amber: "#e0a85c", amberFaint: "#e0a85c18",
  purple: "#9b7fe0",
};

const FIRM = { name: "i3D Studio", address: "Coimbatore, Tamil Nadu", architect: "Shakhith", phone: "+91-XXXXXXXXXX", email: "studio@i3d.in" };

const FIXTURE_RATES = {
  "Standard Toilet": 27000, "Premium Toilet": 35000,
  "Jacuzzi Toilet": 45000, "Bathtub Suite": 55000,
  "Kitchen Plumbing": 10000, "Service Kitchen": 8000,
  "Utility / Laundry": 10000, "Outdoor Tap": 3000,
};

const FIXTURE_TYPES = Object.keys(FIXTURE_RATES);
const FLOOR_NAMES = ["Basement", "Ground Floor", "Mezzanine", "First Floor", "Second Floor", "Third Floor", "Terrace"];

const DEFAULT_FIXTURES = [
  { id: 1, floor: "Ground Floor",  room: "Service Toilet",       type: "Standard Toilet",   qty: 1, rate: 27000 },
  { id: 2, floor: "Mezzanine",     room: "Guest Bedroom Toilet",  type: "Standard Toilet",   qty: 1, rate: 27000 },
  { id: 3, floor: "First Floor",   room: "Bedroom 2 Toilet",      type: "Standard Toilet",   qty: 1, rate: 27000 },
  { id: 4, floor: "First Floor",   room: "Bedroom 3 Toilet",      type: "Standard Toilet",   qty: 1, rate: 27000 },
  { id: 5, floor: "First Floor",   room: "Jacuzzi Toilet",        type: "Jacuzzi Toilet",    qty: 1, rate: 45000 },
  { id: 6, floor: "Second Floor",  room: "Bedroom 4 Toilet",      type: "Standard Toilet",   qty: 1, rate: 27000 },
  { id: 7, floor: "Second Floor",  room: "Optional Toilet",       type: "Standard Toilet",   qty: 1, rate: 27000 },
  { id: 8, floor: "Second Floor",  room: "Jacuzzi Toilet",        type: "Jacuzzi Toilet",    qty: 1, rate: 45000 },
  { id: 9, floor: "Ground Floor",  room: "Main Kitchen",          type: "Kitchen Plumbing",  qty: 1, rate: 10000 },
  { id: 10, floor: "Ground Floor", room: "Service Kitchen",       type: "Service Kitchen",   qty: 1, rate:  8000 },
  { id: 11, floor: "Ground Floor", room: "Laundry / Utility",     type: "Utility / Laundry", qty: 1, rate: 10000 },
];

const SAMPLE_PROJECT = {
  id: "I3D-2026-001", name: "Residence for Mr. Antony", client: "Mr. Antony",
  address: "Coimbatore, Tamil Nadu", city: "Coimbatore",
  plotArea: "3500", builtupArea: "6134", floors: "4",
  bedrooms: "4", bathrooms: "8", occupants: "6",
  roofArea: "2500", gardenArea: "800", date: new Date().toISOString().slice(0, 10),
};

const BLANK_PROJECT = {
  id: "", name: "", client: "", address: "", city: "Coimbatore",
  plotArea: "", builtupArea: "", floors: "1",
  bedrooms: "", bathrooms: "", occupants: "",
  roofArea: "", gardenArea: "", date: new Date().toISOString().slice(0, 10),
};

const TABS = [
  { id: "project",       icon: "🏛",  label: "Project Setup"     },
  { id: "fixtures",      icon: "🚿",  label: "Fixture Planner"   },
  { id: "water",         icon: "💧",  label: "Water Systems"     },
  { id: "drainage",      icon: "🔩",  label: "Drainage"          },
  { id: "sustainability",icon: "🌿",  label: "Sustainability"    },
  { id: "efficiency",    icon: "📊",  label: "Efficiency Index"  },
  { id: "summary",       icon: "₹",   label: "Cost Summary"      },
];

// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────
function genId() {
  const y = new Date().getFullYear();
  const existing = JSON.parse(localStorage.getItem("i3d_projects") || "[]");
  const num = String(existing.length + 1).padStart(3, "0");
  return `I3D-${y}-${num}`;
}
function loadProjects() { return JSON.parse(localStorage.getItem("i3d_projects") || "[]"); }
function saveProjects(list) { localStorage.setItem("i3d_projects", JSON.stringify(list)); }

// ─── UTILITY ─────────────────────────────────────────────────────────────────
const fmt = (n) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
const fmtN = (n) => Math.round(n || 0).toLocaleString("en-IN");

// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────
function MetricCard({ value, label, color = C.gold, sub }) {
  return (
    <div style={{ flex: 1, background: `${color}12`, border: `1px solid ${color}28`, borderRadius: 6, padding: "14px 12px", textAlign: "center", minWidth: 0 }}>
      <div style={{ color, fontSize: 18, fontWeight: "bold", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
      <div style={{ color: C.textMuted, fontSize: 9, letterSpacing: "1.2px", textTransform: "uppercase" }}>{label}</div>
      {sub && <div style={{ color, fontSize: 10, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function SectionCard({ title, children, action }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "18px 20px", marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ color: C.gold, fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", fontWeight: "bold" }}>{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange, cost }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 13px",
      cursor: "pointer", borderRadius: 5, userSelect: "none", fontSize: 11,
      border: `1px solid ${value ? C.gold : C.border}`,
      background: value ? C.goldFaint : "transparent",
      color: value ? C.gold : C.textMuted, transition: "all 0.15s",
    }}>
      <span style={{ fontSize: 12 }}>{value ? "✓" : "○"}</span>
      {label}{cost && <span style={{ color: value ? C.goldDim : C.textDim, fontSize: 10 }}> — {fmt(cost)}</span>}
    </div>
  );
}

// Smart number input — no cursor reset, arrow key support, Enter/Tab navigation
function NumInput({ value, onChange, onNext, min = 0, max, step = 1, width = "100%", compact }) {
  const ref = useRef(null);
  const [local, setLocal] = useState(String(value ?? ""));

  useEffect(() => {
    if (document.activeElement !== ref.current) setLocal(String(value ?? ""));
  }, [value]);

  function commit(v) {
    let n = parseFloat(v);
    if (isNaN(n)) n = min;
    if (max !== undefined) n = Math.min(n, max);
    n = Math.max(n, min);
    onChange(n);
    setLocal(String(n));
  }

  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      value={local}
      style={{
        width, background: "#0d0d0d", border: `1px solid ${C.border}`,
        borderRadius: 4, color: C.text, padding: compact ? "5px 8px" : "8px 10px",
        fontSize: compact ? 12 : 13, boxSizing: "border-box", outline: "none", fontFamily: "inherit",
        textAlign: "right",
      }}
      onChange={e => setLocal(e.target.value)}
      onBlur={e => commit(e.target.value)}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); commit(local); onNext?.(); }
        if (e.key === "ArrowUp") { e.preventDefault(); const n = (parseFloat(local) || 0) + step; setLocal(String(n)); onChange(n); }
        if (e.key === "ArrowDown") { e.preventDefault(); const n = Math.max(min, (parseFloat(local) || 0) - step); setLocal(String(n)); onChange(n); }
      }}
    />
  );
}

// Text input with Enter→next navigation
function TxtInput({ value, onChange, onNext, placeholder, width = "100%", compact }) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      style={{
        width, background: "#0d0d0d", border: `1px solid ${C.border}`, borderRadius: 4,
        color: C.text, padding: compact ? "5px 8px" : "8px 10px",
        fontSize: compact ? 12 : 13, boxSizing: "border-box", outline: "none", fontFamily: "inherit",
      }}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); onNext?.(); } }}
    />
  );
}

function FieldBox({ label, children }) {
  return (
    <div>
      <div style={{ color: C.textMuted, fontSize: 10, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

function Btn({ children, onClick, ghost, danger, small }) {
  return (
    <button onClick={onClick} style={{
      background: danger ? C.red : ghost ? "transparent" : C.gold,
      color: danger ? "#fff" : ghost ? C.gold : "#000",
      border: `1px solid ${danger ? C.red : C.gold}`,
      padding: small ? "5px 11px" : "8px 16px", borderRadius: 4, cursor: "pointer",
      fontSize: small ? 10 : 11, fontWeight: "bold", letterSpacing: "0.8px",
      fontFamily: "inherit", transition: "opacity 0.15s",
    }}>
      {children}
    </button>
  );
}

function ProgressBar({ value, max = 100, color = C.gold }) {
  return (
    <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(100, (value / max) * 100)}%`, background: color, borderRadius: 3, transition: "width 0.4s ease" }} />
    </div>
  );
}

// ─── PROJECT LIST / DASHBOARD ─────────────────────────────────────────────────
function ProjectDashboard({ onOpen, onNew }) {
  const [projects, setProjects] = useState(loadProjects);
  const deleteProject = (id) => {
    if (!window.confirm("Delete this project?")) return;
    const updated = projects.filter(p => p.id !== id);
    saveProjects(updated); setProjects(updated);
  };
  return (
    <div style={{ padding: "32px 40px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <div style={{ color: C.gold, fontSize: 22, fontWeight: "bold", letterSpacing: "2px" }}>i3D PLUMBING ENGINE</div>
          <div style={{ color: C.textMuted, fontSize: 11, letterSpacing: "2px", marginTop: 4 }}>i3D STUDIO · COIMBATORE · PROFESSIONAL ESTIMATOR</div>
        </div>
        <Btn onClick={onNew}>+ NEW PROJECT</Btn>
      </div>
      {projects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: C.textMuted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏛</div>
          <div style={{ fontSize: 14, marginBottom: 8 }}>No projects yet</div>
          <div style={{ fontSize: 11 }}>Create your first plumbing estimate</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          {projects.map(p => {
            const total = p._summary?.total || 0;
            return (
              <div key={p.project.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 18, cursor: "pointer", transition: "border-color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.goldDim}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ color: C.gold, fontSize: 10, letterSpacing: "1px", marginBottom: 4 }}>{p.project.id}</div>
                    <div style={{ color: C.text, fontSize: 13, fontWeight: "bold" }}>{p.project.name || "Unnamed Project"}</div>
                    <div style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>{p.project.client}</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteProject(p.project.id); }}
                    style={{ background: "transparent", border: "none", color: C.textDim, cursor: "pointer", fontSize: 14 }}>✕</button>
                </div>
                <div style={{ color: C.goldLight, fontSize: 16, fontWeight: "bold", marginBottom: 6 }}>{fmt(total)}</div>
                <div style={{ color: C.textMuted, fontSize: 10 }}>{p.project.builtupArea} sq.ft · {p.project.floors} floors · {p.project.date}</div>
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <Btn small onClick={() => onOpen(p)}>OPEN</Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── TAB: PROJECT SETUP ───────────────────────────────────────────────────────
function TabProject({ project, setProject }) {
  const refs = useRef([]);
  const focus = (i) => refs.current[i]?.focus?.() ?? refs.current[i]?.querySelector?.("input")?.focus();
  const set = (k) => (v) => setProject(p => ({ ...p, [k]: v }));

  const occ = parseInt(project.occupants) || 0;
  const bua = parseFloat(project.builtupArea) || 0;
  const ga = parseFloat(project.gardenArea) || 0;
  const ra = parseFloat(project.roofArea) || 0;
  const dailyDemand = Math.round(occ * 135 + ga * 0.5);
  const rawTank = Math.ceil((dailyDemand * 2) / 500) * 500;
  const ohTank = Math.ceil((dailyDemand * 1.2) / 500) * 500;
  const grey = Math.round(dailyDemand * 0.6);
  const rain = Math.round((600 / 1000) * (ra / 10.764) * 0.8 * 1000);

  const fields = [
    [0, "Project Name",        <TxtInput value={project.name}       onChange={set("name")}       onNext={() => focus(1)} />],
    [1, "Client Name",         <TxtInput value={project.client}     onChange={set("client")}     onNext={() => focus(2)} />],
    [2, "Site Address",        <TxtInput value={project.address}    onChange={set("address")}    onNext={() => focus(3)} />],
    [3, "City",                <TxtInput value={project.city}       onChange={set("city")}       onNext={() => focus(4)} />],
    [4, "Date",                <input type="date" value={project.date} onChange={e => set("date")(e.target.value)}
      style={{ background: "#0d0d0d", border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, padding: "8px 10px", fontSize: 13, width: "100%", boxSizing: "border-box", fontFamily: "inherit", outline: "none" }} />],
    [5, "Built-up Area (sq.ft)",<NumInput value={project.builtupArea} onChange={set("builtupArea")} onNext={() => focus(6)} step={50} />],
    [6, "Plot Area (sq.ft)",    <NumInput value={project.plotArea}   onChange={set("plotArea")}   onNext={() => focus(7)} step={50} />],
    [7, "Floors",               <NumInput value={project.floors}     onChange={set("floors")}     onNext={() => focus(8)} min={1} max={20} />],
    [8, "Bedrooms",             <NumInput value={project.bedrooms}   onChange={set("bedrooms")}   onNext={() => focus(9)} min={1} max={50} />],
    [9, "Bathrooms",            <NumInput value={project.bathrooms}  onChange={set("bathrooms")}  onNext={() => focus(10)} min={1} max={50} />],
    [10,"Occupants",            <NumInput value={project.occupants}  onChange={set("occupants")}  onNext={() => focus(11)} min={1} max={50} />],
    [11,"Roof Area (sq.ft)",    <NumInput value={project.roofArea}   onChange={set("roofArea")}   onNext={() => focus(12)} step={50} />],
    [12,"Garden Area (sq.ft)",  <NumInput value={project.gardenArea} onChange={set("gardenArea")} step={50} />],
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <MetricCard value={`${fmtN(dailyDemand)} L`} label="Daily Demand" color={C.gold} />
        <MetricCard value={`${fmtN(rawTank)} L`} label="Raw Tank" color={C.blue} />
        <MetricCard value={`${fmtN(ohTank)} L`} label="Overhead Tank" color={C.green} />
        <MetricCard value={`${fmtN(grey)} L`} label="Greywater/Day" color={C.amber} />
        <MetricCard value={`${fmtN(rain / 1000)} kL`} label="Rain Harvest/Yr" color={C.purple} />
      </div>
      <SectionCard title="Project Identity">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FieldBox label="Project ID">
            <div style={{ padding: "8px 10px", background: "#0d0d0d", border: `1px solid ${C.border}`, borderRadius: 4, color: C.gold, fontSize: 13 }}>{project.id}</div>
          </FieldBox>
          {fields.slice(0, 5).map(([i, label, el]) => (
            <FieldBox key={i} label={label}><div ref={r => refs.current[i] = r}>{el}</div></FieldBox>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Building Parameters">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {fields.slice(5).map(([i, label, el]) => (
            <FieldBox key={i} label={label}><div ref={r => refs.current[i] = r}>{el}</div></FieldBox>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Auto-Calculated Water Demand">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[
            ["Daily Demand", `${fmtN(dailyDemand)} L/day`, C.gold, `${occ} occupants × 135 L + landscape`],
            ["Greywater", `${fmtN(grey)} L/day`, C.green, "60% of daily demand — reusable"],
            ["Rain Harvest", `${fmtN(rain)} L/yr`, C.blue, "Coimbatore 600mm avg rainfall"],
            ["Raw Water Tank", `${fmtN(rawTank)} L`, C.amber, "2× daily demand"],
            ["Overhead Tank", `${fmtN(ohTank)} L`, C.gold, "1.2× daily demand"],
            ["Pump Flow Rate", `${fmtN(Math.round(dailyDemand / 4))} L/hr`, C.purple, "Fills tank in ~4 hours"],
          ].map(([l, v, color, hint]) => (
            <div key={l} style={{ padding: "12px 14px", background: C.cardAlt, borderRadius: 6, border: `1px solid ${C.border}` }}>
              <div style={{ color, fontSize: 15, fontWeight: "bold", marginBottom: 3 }}>{v}</div>
              <div style={{ color: C.textMuted, fontSize: 10, letterSpacing: "0.8px", textTransform: "uppercase" }}>{l}</div>
              <div style={{ color: C.textDim, fontSize: 10, marginTop: 3 }}>{hint}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── TAB: FIXTURE PLANNER ─────────────────────────────────────────────────────
function TabFixtures({ fixtures, setFixtures }) {
  const nextRef = useRef({});
  const update = (id, field, value) => setFixtures(prev =>
    prev.map(f => {
      if (f.id !== id) return f;
      const updated = { ...f, [field]: value };
      if (field === "type") updated.rate = FIXTURE_RATES[value] ?? f.rate;
      return updated;
    })
  );
  const add = () => setFixtures(prev => [...prev, { id: Date.now(), floor: "Ground Floor", room: "", type: "Standard Toilet", qty: 1, rate: 27000 }]);
  const remove = (id) => setFixtures(prev => prev.filter(f => f.id !== id));

  const totals = useMemo(() => ({
    stdToilets: fixtures.filter(f => f.type === "Standard Toilet" || f.type === "Premium Toilet").reduce((s, f) => s + f.qty, 0),
    luxToilets: fixtures.filter(f => f.type === "Jacuzzi Toilet" || f.type === "Bathtub Suite").reduce((s, f) => s + f.qty, 0),
    kitchens: fixtures.filter(f => f.type.includes("Kitchen")).reduce((s, f) => s + f.qty, 0),
    total: fixtures.reduce((s, f) => s + f.qty * f.rate, 0),
  }), [fixtures]);

  const thStyle = { background: "#0d0d0d", color: C.textMuted, padding: "8px 10px", textAlign: "left", fontSize: 9, letterSpacing: "1.2px", textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" };
  const tdStyle = { padding: "6px 8px", borderBottom: `1px solid ${C.border}18`, verticalAlign: "middle" };
  const selStyle = { background: "#0d0d0d", border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, padding: "5px 8px", fontSize: 11, fontFamily: "inherit", outline: "none", width: "100%" };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <MetricCard value={totals.stdToilets} label="Standard Toilets" color={C.gold} />
        <MetricCard value={totals.luxToilets} label="Luxury Toilets" color={C.blue} />
        <MetricCard value={totals.kitchens} label="Kitchen Points" color={C.green} />
        <MetricCard value={fmt(totals.total)} label="Fixture Cost" color={C.amber} />
      </div>
      <SectionCard title="Fixture Schedule"
        action={<Btn small onClick={add}>+ ADD ROW</Btn>}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["Floor", "Room / Zone", "Fixture Type", "Qty", "Rate (₹)", "Amount", ""].map(h =>
                  <th key={h} style={thStyle}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {fixtures.map((f, idx) => (
                <tr key={f.id} style={{ background: idx % 2 === 0 ? "transparent" : "#0f0f0f" }}>
                  <td style={tdStyle}>
                    <select style={{ ...selStyle, width: 120 }} value={f.floor} onChange={e => update(f.id, "floor", e.target.value)}>
                      {FLOOR_NAMES.map(fl => <option key={fl}>{fl}</option>)}
                    </select>
                  </td>
                  <td style={tdStyle}>
                    <TxtInput compact value={f.room} onChange={v => update(f.id, "room", v)} width="130px"
                      onNext={() => nextRef.current[`type-${f.id}`]?.focus()} />
                  </td>
                  <td style={tdStyle}>
                    <select ref={el => nextRef.current[`type-${f.id}`] = el}
                      style={{ ...selStyle, width: 140 }} value={f.type}
                      onChange={e => update(f.id, "type", e.target.value)}>
                      {FIXTURE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </td>
                  <td style={tdStyle}>
                    <NumInput compact value={f.qty} min={1} max={99} step={1} width="55px"
                      onChange={v => update(f.id, "qty", v)}
                      onNext={() => nextRef.current[`rate-${f.id}`]?.querySelector("input")?.focus()} />
                  </td>
                  <td style={tdStyle}>
                    <div ref={el => nextRef.current[`rate-${f.id}`] = el}>
                      <NumInput compact value={f.rate} min={0} step={1000} width="90px"
                        onChange={v => update(f.id, "rate", v)}
                        onNext={() => { const nf = fixtures[idx + 1]; if (nf) nextRef.current[`type-${nf.id}`]?.focus(); }} />
                    </div>
                  </td>
                  <td style={{ ...tdStyle, color: C.gold, fontWeight: "bold", textAlign: "right" }}>
                    {fmt(f.qty * f.rate)}
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => remove(f.id)} style={{ background: "transparent", border: "none", color: C.textDim, cursor: "pointer", fontSize: 13, padding: "2px 6px" }}>✕</button>
                  </td>
                </tr>
              ))}
              <tr style={{ background: C.goldFaint }}>
                <td colSpan={5} style={{ ...tdStyle, color: C.gold, fontWeight: "bold", fontSize: 12, paddingTop: 10 }}>TOTAL</td>
                <td style={{ ...tdStyle, color: C.gold, fontWeight: "bold", fontSize: 14, textAlign: "right" }}>{fmt(totals.total)}</td>
                <td style={tdStyle} />
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, color: C.textMuted, fontSize: 10 }}>
          💡 Tip: Use <span style={{ color: C.gold }}>Enter</span> to jump fields · <span style={{ color: C.gold }}>↑↓ arrow keys</span> to adjust quantities and rates
        </div>
      </SectionCard>
    </div>
  );
}

// ─── TAB: WATER SYSTEMS ───────────────────────────────────────────────────────
function TabWater({ water, setWater }) {
  const set = (k) => (v) => setWater(w => ({ ...w, [k]: v }));
  const cost = (water.softener ? 45000 : 0) + (water.booster ? 50000 : 0) + (water.solar ? 60000 : 0) + (water.hotCirc ? 25000 : 0);
  const flow = ["Borewell / Municipal Supply", water.softener ? "Water Softener (1500 LPH)" : null, "Raw Water Tank", "Overhead Tank", water.booster ? "Pressure Booster Pump" : "Gravity Feed (0.5–1 bar)", "House Distribution"].filter(Boolean);
  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <MetricCard value={fmt(cost)} label="Treatment Cost" color={C.gold} />
        <MetricCard value={water.softener ? "1500 LPH" : "—"} label="Softener Capacity" color={C.blue} />
        <MetricCard value={water.booster ? "3 bar" : "~1 bar"} label="Supply Pressure" color={water.booster ? C.green : C.amber} />
      </div>
      <SectionCard title="System Configuration">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Toggle label="Dual Pipeline (Sweet + Bore)" value={water.dualPipeline} onChange={set("dualPipeline")} />
          <Toggle label="Water Softener" value={water.softener} onChange={set("softener")} cost={45000} />
          <Toggle label="Pressure Booster Pump" value={water.booster} onChange={set("booster")} cost={50000} />
          <Toggle label="Solar Water Heater" value={water.solar} onChange={set("solar")} cost={60000} />
          <Toggle label="Hot Water Circulation Line" value={water.hotCirc} onChange={set("hotCirc")} cost={25000} />
        </div>
      </SectionCard>
      <SectionCard title="Recommended System Flow">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "8px 24px", gap: 0 }}>
          {flow.map((step, i) => (
            <div key={i}>
              <div style={{ padding: "8px 16px", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 5, color: C.gold, fontSize: 12, minWidth: 260, textAlign: "center" }}>{step}</div>
              {i < flow.length - 1 && <div style={{ color: C.textDim, fontSize: 20, paddingLeft: 110, lineHeight: "24px" }}>↓</div>}
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Coimbatore Water Quality Advisory">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            ["Hard Bore Water", "TDS 400–900 ppm typical in Coimbatore. Damages concealed diverters, rain shower heads, and mixer cartridges within 2–3 years without softening.", C.red],
            ["Rain Shower Pressure", "Gravity tanks deliver only 0.5–1 bar. Rain showers require 2.5–3 bar minimum. Booster pump is essential for consistent performance.", C.amber],
            ["Dual Pipeline Trend", "Traditionally sweet water for basins + bore for WC flush. Now largely abandoned as fittings corrode quickly. Single treated line preferred.", C.blue],
            ["Softener ROI", "A ₹45,000 softener investment can save ₹60,000–₹1.2L in premature fixture replacement for a luxury villa over 10 years.", C.green],
          ].map(([title, text, color]) => (
            <div key={title} style={{ padding: 14, background: `${color}0a`, border: `1px solid ${color}20`, borderRadius: 6 }}>
              <div style={{ color, fontSize: 11, fontWeight: "bold", marginBottom: 6 }}>{title}</div>
              <div style={{ color: C.textMuted, fontSize: 11, lineHeight: 1.6 }}>{text}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── STACK COLOR PALETTE ──────────────────────────────────────────────────────
const STACK_COLORS = [C.gold, C.blue, C.green, C.amber, C.purple, C.red, "#5ce0d8", "#e05ca8"];

const DEFAULT_STACKS = [
  { id: 1, title: "Stack A — Bedroom Toilets",  color: C.gold,  floors: ["2F: Bedroom 4 Toilet", "1F: Bedroom 2 & 3", "Mezz: Guest Toilet", "GF: Service Toilet"] },
  { id: 2, title: "Stack B — Jacuzzi Toilets",  color: C.blue,  floors: ["2F: Jacuzzi Toilet", "1F: Jacuzzi Toilet"] },
  { id: 3, title: "Stack C — Service Block",    color: C.green, floors: ["GF: Kitchen × 2", "GF: Laundry / Utility"] },
];

// ─── TAB: DRAINAGE ────────────────────────────────────────────────────────────
function TabDrainage({ drainage, setDrainage, stacks, setStacks }) {
  const set = (k) => (v) => setDrainage(d => ({ ...d, [k]: v }));
  const cost = drainage.chambers * 8000 + drainage.gullyTraps * 3500
    + (drainage.ugd ? 25000 : 0) + (drainage.extPiping ? 40000 : 0)
    + (drainage.cutting ? 50000 : 0) + (drainage.septic ? 50000 : 0);

  // ── Stack helpers ──────────────────────────────────────────────────────────
  const addStack = () => {
    const colorIdx = stacks.length % STACK_COLORS.length;
    const letter = String.fromCharCode(65 + stacks.length);
    setStacks(s => [...s, {
      id: Date.now(),
      title: `Stack ${letter} — New Stack`,
      color: STACK_COLORS[colorIdx],
      floors: ["GF: New Zone"],
    }]);
  };
  const removeStack = (id) => setStacks(s => s.filter(st => st.id !== id));
  const updateStack = (id, field, value) =>
    setStacks(s => s.map(st => st.id === id ? { ...st, [field]: value } : st));
  const addFloor = (id) =>
    setStacks(s => s.map(st => st.id === id ? { ...st, floors: [...st.floors, "New Zone"] } : st));
  const updateFloor = (id, idx, value) =>
    setStacks(s => s.map(st => st.id === id
      ? { ...st, floors: st.floors.map((f, i) => i === idx ? value : f) }
      : st
    ));
  const removeFloor = (id, idx) =>
    setStacks(s => s.map(st => st.id === id
      ? { ...st, floors: st.floors.filter((_, i) => i !== idx) }
      : st
    ));

  const inStyle = {
    background: "#0d0d0d", border: `1px solid ${C.border}`, borderRadius: 3,
    color: C.text, padding: "4px 7px", fontSize: 11, outline: "none", fontFamily: "inherit",
    width: "100%", boxSizing: "border-box",
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <MetricCard value={drainage.chambers} label="Inspection Chambers" color={C.gold} />
        <MetricCard value={drainage.gullyTraps} label="Gully Traps" color={C.blue} />
        <MetricCard value={stacks.length} label="Plumbing Stacks" color={C.green} />
        <MetricCard value={fmt(cost)} label="Drainage Cost" color={C.amber} />
      </div>

      <SectionCard title="Underground Drainage Components">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
          <FieldBox label="Inspection Chambers (@ ₹8,000)">
            <NumInput value={drainage.chambers} onChange={set("chambers")} min={0} max={20} step={1} />
            <div style={{ color: C.textDim, fontSize: 10, marginTop: 4 }}>Subtotal: {fmt(drainage.chambers * 8000)}</div>
          </FieldBox>
          <FieldBox label="Gully Traps (@ ₹3,500)">
            <NumInput value={drainage.gullyTraps} onChange={set("gullyTraps")} min={0} max={20} step={1} />
            <div style={{ color: C.textDim, fontSize: 10, marginTop: 4 }}>Subtotal: {fmt(drainage.gullyTraps * 3500)}</div>
          </FieldBox>
          <FieldBox label="Septic Tank">
            <Toggle label={drainage.septic ? "Included" : "Excluded"} value={drainage.septic} onChange={set("septic")} cost={50000} />
          </FieldBox>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Toggle label="UGD Connection" value={drainage.ugd} onChange={set("ugd")} cost={25000} />
          <Toggle label="External Piping" value={drainage.extPiping} onChange={set("extPiping")} cost={40000} />
          <Toggle label="Wall & Core Cutting" value={drainage.cutting} onChange={set("cutting")} cost={50000} />
        </div>
      </SectionCard>

      <SectionCard
        title="Plumbing Stack Layout — This Project"
        action={<Btn small onClick={addStack}>+ ADD STACK</Btn>}
      >
        <div style={{ color: C.textMuted, fontSize: 10, marginBottom: 12 }}>
          Click any title, zone, or colour to edit. Each stack represents one vertical soil pipe group. Add or remove zones as needed for this project.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(stacks.length, 4)}, 1fr)`, gap: 12 }}>
          {stacks.map((stack) => (
            <div key={stack.id} style={{
              padding: 14, background: C.cardAlt,
              border: `1px solid ${stack.color}30`, borderRadius: 6,
              position: "relative",
            }}>
              {/* Remove stack button */}
              <button onClick={() => removeStack(stack.id)} style={{
                position: "absolute", top: 8, right: 8,
                background: "transparent", border: "none",
                color: C.textDim, cursor: "pointer", fontSize: 13, lineHeight: 1,
              }}>✕</button>

              {/* Colour picker row */}
              <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
                {STACK_COLORS.map(c => (
                  <div key={c} onClick={() => updateStack(stack.id, "color", c)} style={{
                    width: 14, height: 14, borderRadius: "50%", background: c, cursor: "pointer",
                    border: stack.color === c ? `2px solid ${C.text}` : "2px solid transparent",
                    flexShrink: 0,
                  }} />
                ))}
              </div>

              {/* Stack title — inline editable */}
              <input
                value={stack.title}
                onChange={e => updateStack(stack.id, "title", e.target.value)}
                style={{
                  ...inStyle,
                  color: stack.color, fontWeight: "bold", fontSize: 11,
                  letterSpacing: "0.5px", marginBottom: 10,
                  background: "transparent", border: `1px solid ${stack.color}25`,
                }}
              />

              {/* Floor zones */}
              {stack.floors.map((fl, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                  <div style={{ width: 2, alignSelf: "stretch", background: `${stack.color}50`, flexShrink: 0, borderRadius: 1 }} />
                  <input
                    value={fl}
                    onChange={e => updateFloor(stack.id, i, e.target.value)}
                    style={{ ...inStyle, flex: 1, paddingLeft: 7 }}
                  />
                  <button onClick={() => removeFloor(stack.id, i)} style={{
                    background: "transparent", border: "none",
                    color: C.textDim, cursor: "pointer", fontSize: 12, flexShrink: 0, padding: "2px 4px",
                  }}>✕</button>
                </div>
              ))}

              {/* Add zone */}
              <button onClick={() => addFloor(stack.id)} style={{
                background: "transparent", border: `1px dashed ${stack.color}40`,
                color: stack.color, cursor: "pointer", fontSize: 10, borderRadius: 3,
                padding: "4px 0", width: "100%", marginTop: 4, fontFamily: "inherit",
              }}>+ add zone</button>

              {/* Drain arrow */}
              <div style={{ color: stack.color, fontSize: 18, marginTop: 10, paddingLeft: 8 }}>↓</div>
              <div style={{ color: C.textMuted, fontSize: 10, paddingLeft: 8 }}>Inspection Chamber → UGD</div>
            </div>
          ))}
        </div>

        {stacks.length === 0 && (
          <div style={{ textAlign: "center", padding: "24px 0", color: C.textMuted, fontSize: 11 }}>
            No stacks defined. Click <span style={{ color: C.gold }}>+ ADD STACK</span> to begin.
          </div>
        )}

        <div style={{ marginTop: 12, padding: "10px 14px", background: C.amberFaint, border: `1px solid ${C.amber}30`, borderRadius: 5, color: C.amber, fontSize: 11 }}>
          💡 Rule of thumb: Every 3 toilets on the same vertical line can share one stack. Stacks also appear in the PDF export.
        </div>
      </SectionCard>
    </div>
  );
}

// ─── TAB: SUSTAINABILITY ──────────────────────────────────────────────────────
function TabSustainability({ sus, setSus, project }) {
  const set = (k) => (v) => setSus(s => ({ ...s, [k]: v }));
  const ra = parseFloat(project.roofArea) || 0;
  const occ = parseInt(project.occupants) || 0;
  const ga = parseFloat(project.gardenArea) || 0;
  const daily = occ * 135 + ga * 0.5;
  const grey = Math.round(daily * 0.6);
  const rain = Math.round((600 / 1000) * (ra / 10.764) * 0.8 * 1000);
  const saved = Math.round((sus.greywater ? grey * 365 : 0) + (sus.rwh ? rain : 0));
  const cost = (sus.rwh ? 35000 : 0) + (sus.greywater ? 80000 : 0) + (sus.drip ? 15000 : 0) + (sus.solenoid ? 5000 : 0) + (sus.controller ? 6000 : 0);
  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <MetricCard value={`${fmtN(sus.greywater ? grey : 0)} L`} label="Greywater/Day" color={C.green} />
        <MetricCard value={`${fmtN(rain / 1000)} kL`} label="Rain Harvest/Yr" color={C.blue} />
        <MetricCard value={`${fmtN(saved / 1000)} kL`} label="Total Saved/Yr" color={C.gold} />
        <MetricCard value={fmt(cost)} label="Sustainability Cost" color={C.purple} />
      </div>
      <SectionCard title="Rainwater Harvesting">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <Toggle label="RWH System" value={sus.rwh} onChange={set("rwh")} cost={35000} />
        </div>
        {sus.rwh && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[["Roof Area", `${fmtN(ra)} sq.ft`], ["Annual Harvest", `${fmtN(rain)} L`], ["Recharge Pit", "4' × 4' × 6'"]].map(([l, v]) => (
            <div key={l} style={{ padding: "10px 14px", background: C.cardAlt, borderRadius: 5 }}>
              <div style={{ color: C.blue, fontWeight: "bold", marginBottom: 3 }}>{v}</div>
              <div style={{ color: C.textMuted, fontSize: 10 }}>{l.toUpperCase()}</div>
            </div>
          ))}
        </div>}
      </SectionCard>
      <SectionCard title="Greywater Recycling">
        <Toggle label="Greywater Recycling System" value={sus.greywater} onChange={set("greywater")} cost={80000} />
        {sus.greywater && (
          <div style={{ marginTop: 14, fontSize: 11, color: C.textMuted, lineHeight: 1.8 }}>
            <span style={{ color: C.green }}>Sources:</span> ✓ Showers &nbsp; ✓ Wash Basins &nbsp; ✓ Ablution Taps &nbsp; ✗ Kitchen (excluded — grease contamination)<br />
            <span style={{ color: C.gold }}>Flow: </span>Grey Sources → Filter Chamber → Sand Filter → Storage Tank → Irrigation Pump → Drip System → Overflow to UGD
          </div>
        )}
      </SectionCard>
      <SectionCard title="Irrigation Automation">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Toggle label="Drip Irrigation" value={sus.drip} onChange={set("drip")} cost={15000} />
          <Toggle label="Solenoid Valves" value={sus.solenoid} onChange={set("solenoid")} cost={5000} />
          <Toggle label="Zone Controller" value={sus.controller} onChange={set("controller")} cost={6000} />
          <Toggle label="Terrace Garden Drain" value={sus.terrace} onChange={set("terrace")} cost={20000} />
        </div>
        {(sus.drip || sus.solenoid) && (
          <div style={{ marginTop: 12, color: C.textMuted, fontSize: 11 }}>Zones: Front Lawn · Side Landscape · Terrace Garden · Planters — Auto-scheduled</div>
        )}
      </SectionCard>
    </div>
  );
}

// ─── TAB: EFFICIENCY INDEX ────────────────────────────────────────────────────
function TabEfficiency({ eff, setEff }) {
  const set = (k) => (v) => setEff(e => ({ ...e, [k]: v }));
  const total = Object.values(eff).reduce((a, b) => a + b, 0);
  const [color, status] = total >= 90 ? [C.green, "Excellent"] : total >= 70 ? [C.gold, "Good"] : total >= 50 ? [C.amber, "Average"] : [C.red, "Needs Review"];
  const params = [
    ["verticalAlign", "Vertical Toilet Alignment", 30, "Toilets stacked across floors share single soil stack"],
    ["wetWall", "Shared Wet Walls", 20, "Adjacent bathrooms using common plumbing wall"],
    ["stackOpt", "Stack Optimisation", 20, "Minimum number of vertical stacks for the layout"],
    ["drainageSlope", "Drainage Slope Efficiency", 15, "Consistent fall toward external chambers"],
    ["externalLayout", "External Chamber Layout", 15, "Chambers accessible, linear drainage path to UGD"],
  ];
  return (
    <div>
      <SectionCard title="Plumbing Efficiency Index">
        <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 24 }}>
          <div style={{ textAlign: "center", minWidth: 100 }}>
            <div style={{ color, fontSize: 56, fontWeight: "bold", lineHeight: 1 }}>{total}</div>
            <div style={{ color, fontSize: 11, letterSpacing: "1.5px", marginTop: 6 }}>{status.toUpperCase()}</div>
            <div style={{ color: C.textMuted, fontSize: 10, marginTop: 3 }}>out of 100</div>
          </div>
          <div style={{ flex: 1 }}>
            <ProgressBar value={total} color={color} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 9, color: C.textDim }}>
              <span>0</span><span style={{ color: C.red }}>50 Poor</span><span style={{ color: C.amber }}>70 Good</span><span style={{ color: C.green }}>90 Excellent</span><span>100</span>
            </div>
          </div>
        </div>
        {params.map(([key, label, max, hint]) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <div>
                <span style={{ color: C.text, fontSize: 12 }}>{label}</span>
                <span style={{ color: C.textDim, fontSize: 10, marginLeft: 8 }}>{hint}</span>
              </div>
              <span style={{ color: C.gold, fontSize: 12, fontWeight: "bold" }}>{eff[key]} / {max}</span>
            </div>
            <input type="range" min={0} max={max} value={eff[key]}
              onChange={e => set(key)(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: C.gold, cursor: "pointer", marginBottom: 4 }} />
            <ProgressBar value={eff[key]} max={max} color={C.gold} />
          </div>
        ))}
      </SectionCard>
      <SectionCard title="Cost Impact by Score">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
          {[["90–100", "Excellent", "−10% cost", C.green], ["70–89", "Good", "Normal cost", C.gold], ["50–69", "Average", "+10% impact", C.amber], ["< 50", "Review", "+20% impact", C.red]].map(([range, lbl, desc, c]) => (
            <div key={range} style={{ padding: "12px 14px", background: `${c}0a`, border: `1px solid ${c}${total >= 90 && c === C.green ? "60" : "20"}`, borderRadius: 6, textAlign: "center" }}>
              <div style={{ color: c, fontSize: 14, fontWeight: "bold" }}>{range}</div>
              <div style={{ color: c, fontSize: 10, marginTop: 3 }}>{lbl}</div>
              <div style={{ color: C.textMuted, fontSize: 10, marginTop: 5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── TAB: COST SUMMARY ────────────────────────────────────────────────────────
function TabSummary({ project, fixtures, water, drainage, sus, eff, onExportPDF }) {
  const bua = parseFloat(project.builtupArea) || 0;
  const ra = parseFloat(project.roofArea) || 0;
  const occ = parseInt(project.occupants) || 0;
  const ga = parseFloat(project.gardenArea) || 0;
  const daily = occ * 135 + ga * 0.5;
  const grey = Math.round(daily * 0.6);
  const rain = Math.round((600 / 1000) * (ra / 10.764) * 0.8 * 1000);
  const saved = Math.round((sus.greywater ? grey * 365 : 0) + (sus.rwh ? rain : 0));

  const fixtureCost = fixtures.reduce((s, f) => s + f.qty * f.rate, 0);
  const infraCost = Math.round(bua * 45);
  const drainCost = drainage.chambers * 8000 + drainage.gullyTraps * 3500
    + (drainage.ugd ? 25000 : 0) + (drainage.extPiping ? 40000 : 0) + (drainage.cutting ? 50000 : 0)
    + (drainage.septic ? 50000 : 0);
  const waterCost = (water.softener ? 45000 : 0) + (water.booster ? 50000 : 0) + (water.solar ? 60000 : 0) + (water.hotCirc ? 25000 : 0);
  const susCost = (sus.rwh ? 35000 : 0) + (sus.greywater ? 80000 : 0) + (sus.drip ? 15000 : 0) + (sus.solenoid ? 5000 : 0) + (sus.controller ? 6000 : 0) + (sus.terrace ? 20000 : 0);
  const effTotal = Object.values(eff).reduce((a, b) => a + b, 0);
  const effMult = effTotal >= 90 ? 0.9 : effTotal >= 70 ? 1.0 : effTotal >= 50 ? 1.1 : 1.2;
  const sub = (fixtureCost + infraCost + drainCost + waterCost + susCost) * effMult;
  const margin = sub * 0.15;
  const total = sub + margin;
  const mat = Math.round(sub * 0.70);
  const lab = Math.round(sub * 0.30);
  const contractorQ = Math.round(sub * 1.18);
  const [effColor, effStatus] = effTotal >= 90 ? [C.green, "Excellent"] : effTotal >= 70 ? [C.gold, "Good"] : effTotal >= 50 ? [C.amber, "Average"] : [C.red, "Needs Review"];

  const rows = [
    ["Base Infrastructure (BUA × ₹45)", infraCost, C.text],
    ["Plumbing Fixtures", fixtureCost, C.text],
    ["Drainage & External Works", drainCost, C.text],
    ["Water Treatment Systems", waterCost, C.blue],
    ["Sustainability Systems", susCost, C.green],
  ];
  if (effMult !== 1) rows.push([`Efficiency Adjustment (×${effMult})`, Math.round(sub / effMult * (effMult - 1)), effMult < 1 ? C.green : C.red]);

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <MetricCard value={fmt(sub)} label="Base Estimate" color={C.gold} />
        <MetricCard value={fmt(margin)} label="Safety Margin (15%)" color={C.amber} />
        <MetricCard value={fmt(total)} label="Final Allowance" color={C.goldLight} sub="Recommended Client Budget" />
      </div>
      <SectionCard title="Cost Breakdown"
        action={<Btn small onClick={onExportPDF}>⬇ DOWNLOAD PDF</Btn>}>
        {rows.map(([label, cost, color]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.border}18` }}>
            <span style={{ color: C.textMuted, fontSize: 12 }}>{label}</span>
            <span style={{ color, fontWeight: "bold", fontSize: 12 }}>{fmt(cost)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: `1px solid ${C.border}` }}>
          <span style={{ color: C.text, fontWeight: "bold" }}>Sub-total</span>
          <span style={{ color: C.gold, fontWeight: "bold" }}>{fmt(sub)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
          <span style={{ color: C.textMuted }}>Safety Margin (15%)</span>
          <span style={{ color: C.amber }}>{fmt(margin)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 18px", background: C.goldFaint, borderRadius: 6, border: `1px solid ${C.goldDim}`, marginTop: 8 }}>
          <span style={{ color: C.gold, fontWeight: "bold", fontSize: 14 }}>FINAL PLUMBING ALLOWANCE</span>
          <span style={{ color: C.goldLight, fontWeight: "bold", fontSize: 20 }}>{fmt(total)}</span>
        </div>
      </SectionCard>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <SectionCard title="Material vs Labour Split">
          {[["Materials (70%)", fmt(mat), C.gold], ["Labour (30%)", fmt(lab), C.blue], ["Expected Contractor Quote (18% markup)", fmt(contractorQ), C.amber]].map(([l, v, c]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.border}18` }}>
              <span style={{ color: C.textMuted, fontSize: 11 }}>{l}</span>
              <span style={{ color: c, fontWeight: "bold", fontSize: 12 }}>{v}</span>
            </div>
          ))}
        </SectionCard>
        <SectionCard title="Water Savings Summary">
          {[
            ["Greywater Reused/Year", `${fmtN(sus.greywater ? grey * 365 / 1000 : 0)} kL`, C.green],
            ["Rainwater Harvested/Year", `${fmtN(rain / 1000)} kL`, C.blue],
            ["Total Water Saved/Year", `${fmtN(saved / 1000)} kL`, C.gold],
          ].map(([l, v, c]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.border}18` }}>
              <span style={{ color: C.textMuted, fontSize: 11 }}>{l}</span>
              <span style={{ color: c, fontWeight: "bold", fontSize: 12 }}>{v}</span>
            </div>
          ))}
        </SectionCard>
      </div>
      <SectionCard title="Plumbing Efficiency Summary">
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontSize: 42, fontWeight: "bold", color: effColor, minWidth: 70 }}>{effTotal}</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: effColor, fontWeight: "bold", marginBottom: 4 }}>{effStatus}</div>
            <ProgressBar value={effTotal} color={effColor} />
          </div>
          <div style={{ color: C.textMuted, fontSize: 11 }}>Cost multiplier: <span style={{ color: effColor, fontWeight: "bold" }}>×{effMult}</span></div>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── PDF EXPORT ───────────────────────────────────────────────────────────────
function exportToPDF(state) {
  const { project, fixtures, water, drainage, sus, eff, stacks } = state;
  const bua = parseFloat(project.builtupArea) || 0;
  const fixtureCost = fixtures.reduce((s, f) => s + f.qty * f.rate, 0);
  const infraCost = Math.round(bua * 45);
  const drainCost = drainage.chambers * 8000 + drainage.gullyTraps * 3500
    + (drainage.ugd ? 25000 : 0) + (drainage.extPiping ? 40000 : 0)
    + (drainage.cutting ? 50000 : 0) + (drainage.septic ? 50000 : 0);
  const waterCost = (water.softener ? 45000 : 0) + (water.booster ? 50000 : 0)
    + (water.solar ? 60000 : 0) + (water.hotCirc ? 25000 : 0);
  const susCost = (sus.rwh ? 35000 : 0) + (sus.greywater ? 80000 : 0)
    + (sus.drip ? 15000 : 0) + (sus.solenoid ? 5000 : 0)
    + (sus.controller ? 6000 : 0) + (sus.terrace ? 20000 : 0);
  const sub = fixtureCost + infraCost + drainCost + waterCost + susCost;
  const total = Math.round(sub * 1.15);
  const effTotal = Object.values(eff).reduce((a, b) => a + b, 0);
  const effLabel = effTotal >= 90 ? "Excellent" : effTotal >= 70 ? "Good" : effTotal >= 50 ? "Average" : "Needs Review";

  const rp = (n) => "Rs. " + Math.round(n || 0).toLocaleString("en-IN");

  const fixtureRows = fixtures.map(fx =>
    `<tr>
      <td>${fx.floor}</td>
      <td>${fx.room}</td>
      <td>${fx.type}</td>
      <td style="text-align:center">${fx.qty}</td>
      <td style="text-align:right">${rp(fx.rate)}</td>
      <td style="text-align:right"><strong>${rp(fx.qty * fx.rate)}</strong></td>
    </tr>`
  ).join("");

  const stackCols = (stacks || []).map(stack =>
    `<div class="stack-col">
      <div class="stack-title" style="border-color:${stack.color}">${stack.title}</div>
      ${stack.floors.map(fl => `<div class="stack-item">${fl}</div>`).join("")}
      <div class="stack-arrow">&#x2193;</div>
      <div class="stack-footer">Inspection Chamber &rarr; UGD</div>
    </div>`
  ).join("");

  const waterItems = [
    water.softener && "Water Softener (1500 LPH)",
    water.booster && "Pressure Booster Pump",
    water.solar && "Solar Water Heater",
    water.hotCirc && "Hot Water Circulation Line",
    water.dualPipeline && "Dual Pipeline System",
  ].filter(Boolean);

  const susItems = [
    sus.rwh && "Rainwater Harvesting",
    sus.greywater && "Greywater Recycling",
    sus.drip && "Drip Irrigation",
    sus.solenoid && "Solenoid Valves",
    sus.controller && "Zone Controller",
    sus.terrace && "Terrace Garden Drain",
  ].filter(Boolean);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Plumbing Estimate — ${project.name || "Project"}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 14mm 18mm 14mm;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 10pt;
      color: #1c1c1c;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    /* ── HEADER ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 12px;
      border-bottom: 3px solid #c9a84c;
      margin-bottom: 16px;
    }
    .firm-name { font-size: 18pt; font-weight: bold; color: #111; letter-spacing: 3px; }
    .firm-sub  { font-size: 8pt; color: #777; letter-spacing: 1.5px; margin-top: 4px; text-transform: uppercase; }
    .doc-right { text-align: right; }
    .doc-title { font-size: 12pt; font-weight: bold; color: #c9a84c; letter-spacing: 1px; }
    .doc-id    { font-size: 8pt; color: #999; margin-top: 5px; }
    /* ── PROJECT BLOCK ── */
    .project-block {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5px 20px;
      background: #fdf8ef;
      border-left: 4px solid #c9a84c;
      padding: 12px 14px;
      border-radius: 3px;
      margin-bottom: 16px;
    }
    .prow { display: flex; gap: 8px; font-size: 9.5pt; padding: 2px 0; }
    .plbl { color: #888; min-width: 105px; flex-shrink: 0; }
    .pval { color: #111; font-weight: bold; }
    /* ── SECTION HEADING ── */
    h3 {
      font-size: 8.5pt;
      font-weight: bold;
      letter-spacing: 2px;
      color: #c9a84c;
      text-transform: uppercase;
      border-bottom: 1px solid #e8d49a;
      padding-bottom: 5px;
      margin: 16px 0 9px;
    }
    /* ── TABLES ── */
    table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 14px; }
    thead th {
      background: #1c1c1c;
      color: #c9a84c;
      padding: 7px 9px;
      text-align: left;
      font-size: 8pt;
      letter-spacing: 0.8px;
      font-weight: bold;
    }
    td { padding: 6px 9px; border-bottom: 1px solid #ebebeb; vertical-align: top; }
    tbody tr:nth-child(even) td { background: #fafaf7; }
    .subtotal-row td {
      font-weight: bold;
      background: #fdf8ef !important;
      border-top: 2px solid #c9a84c;
      border-bottom: 2px solid #c9a84c;
    }
    /* ── TOTAL BOX ── */
    .total-box {
      background: #1c1c1c;
      color: #c9a84c;
      padding: 13px 16px;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 16px 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .total-label { font-size: 10pt; letter-spacing: 1.5px; font-weight: bold; text-transform: uppercase; }
    .total-value { font-size: 17pt; font-weight: bold; }
    /* ── TWO-COL GRID ── */
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
    .info-card {
      background: #fdf8ef;
      padding: 11px 13px;
      border-radius: 3px;
      border: 1px solid #e8d49a;
    }
    .info-card h4 {
      font-size: 8pt; font-weight: bold; letter-spacing: 1.5px;
      color: #888; text-transform: uppercase; margin-bottom: 8px;
    }
    .info-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 9pt; border-bottom: 1px solid #eee; }
    .info-row:last-child { border-bottom: none; }
    /* ── STACK LAYOUT ── */
    .stack-grid { display: flex; gap: 12px; margin-bottom: 14px; }
    .stack-col {
      flex: 1;
      background: #fdf8ef;
      border: 1px solid #e8d49a;
      border-radius: 4px;
      padding: 11px 12px;
    }
    .stack-title {
      font-size: 8pt; font-weight: bold; letter-spacing: 1px;
      border-bottom: 2px solid;
      padding-bottom: 6px; margin-bottom: 8px;
      text-transform: uppercase; color: #444;
    }
    .stack-item {
      font-size: 9pt; color: #333; padding: 3px 0 3px 10px;
      border-left: 2px solid #e8d49a; margin-bottom: 3px;
    }
    .stack-arrow { font-size: 16pt; color: #c9a84c; padding: 4px 0 2px 10px; }
    .stack-footer { font-size: 8pt; color: #888; padding-left: 10px; }
    /* ── PEI ── */
    .pei-row { display: flex; align-items: center; gap: 14px; padding: 8px 0; }
    .pei-score { font-size: 26pt; font-weight: bold; color: #c9a84c; min-width: 60px; }
    .pei-bar-wrap { flex: 1; height: 8px; background: #eee; border-radius: 4px; overflow: hidden; }
    .pei-bar { height: 100%; background: #c9a84c; border-radius: 4px; }
    /* ── BADGE LIST ── */
    .badge-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
    .badge {
      font-size: 8pt; padding: 3px 8px; border-radius: 3px;
      background: #f0ede4; border: 1px solid #ddd; color: #444;
    }
    /* ── SIGNATURES ── */
    .sig-block { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-top: 28px; }
    .sig-line { border-top: 1px solid #333; padding-top: 6px; font-size: 8.5pt; color: #555; }
    /* ── FOOTER ── */
    .page-footer {
      position: fixed; bottom: 0; left: 0; right: 0;
      padding: 8px 14mm;
      border-top: 1px solid #e8d49a;
      display: flex; justify-content: space-between;
      font-size: 7.5pt; color: #aaa;
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    /* ── PAGE BREAKS ── */
    .page-break { page-break-before: always; }
    @media print {
      body { font-size: 10pt; }
      .total-box { background: #1c1c1c !important; color: #c9a84c !important; }
      thead th { background: #1c1c1c !important; color: #c9a84c !important; }
    }
  </style>
</head>
<body>

<!-- HEADER -->
<div class="header">
  <div>
    <div class="firm-name">i3D STUDIO</div>
    <div class="firm-sub">Inspirational Architect &bull; Coimbatore, Tamil Nadu</div>
  </div>
  <div class="doc-right">
    <div class="doc-title">PLUMBING ESTIMATE</div>
    <div class="doc-id">${project.id || "—"} &nbsp;&bull;&nbsp; ${project.date || ""}</div>
  </div>
</div>

<!-- PROJECT BLOCK -->
<div class="project-block">
  <div class="prow"><span class="plbl">Project Name</span><span class="pval">${project.name || "—"}</span></div>
  <div class="prow"><span class="plbl">Client</span><span class="pval">${project.client || "—"}</span></div>
  <div class="prow"><span class="plbl">Site Address</span><span class="pval">${project.address || "—"}</span></div>
  <div class="prow"><span class="plbl">Built-up Area</span><span class="pval">${project.builtupArea || "—"} sq.ft</span></div>
  <div class="prow"><span class="plbl">Floors</span><span class="pval">${project.floors || "—"}</span></div>
  <div class="prow"><span class="plbl">Bathrooms</span><span class="pval">${project.bathrooms || "—"}</span></div>
  <div class="prow"><span class="plbl">Occupants</span><span class="pval">${project.occupants || "—"}</span></div>
  <div class="prow"><span class="plbl">Roof Area</span><span class="pval">${project.roofArea || "—"} sq.ft</span></div>
</div>

<!-- FIXTURE SCHEDULE -->
<h3>Fixture Schedule</h3>
<table>
  <thead>
    <tr>
      <th>Floor</th>
      <th>Room / Zone</th>
      <th>Fixture Type</th>
      <th style="text-align:center">Qty</th>
      <th style="text-align:right">Rate</th>
      <th style="text-align:right">Amount</th>
    </tr>
  </thead>
  <tbody>
    ${fixtureRows}
    <tr class="subtotal-row">
      <td colspan="5">Fixture Sub-total</td>
      <td style="text-align:right">${rp(fixtureCost)}</td>
    </tr>
  </tbody>
</table>

<!-- COST SUMMARY -->
<h3>Cost Summary</h3>
<table>
  <thead><tr><th>Component</th><th style="text-align:right">Amount</th></tr></thead>
  <tbody>
    <tr><td>Base Infrastructure (BUA &times; Rs.45 / sq.ft)</td><td style="text-align:right">${rp(infraCost)}</td></tr>
    <tr><td>Plumbing Fixtures</td><td style="text-align:right">${rp(fixtureCost)}</td></tr>
    <tr><td>Drainage &amp; External Works</td><td style="text-align:right">${rp(drainCost)}</td></tr>
    <tr><td>Water Treatment Systems</td><td style="text-align:right">${rp(waterCost)}</td></tr>
    <tr><td>Sustainability Systems</td><td style="text-align:right">${rp(susCost)}</td></tr>
    <tr class="subtotal-row"><td>Sub-total</td><td style="text-align:right">${rp(sub)}</td></tr>
    <tr><td>Safety Margin (15%)</td><td style="text-align:right">${rp(sub * 0.15)}</td></tr>
  </tbody>
</table>

<div class="total-box">
  <span class="total-label">Final Plumbing Allowance</span>
  <span class="total-value">${rp(total)}</span>
</div>

<!-- MATERIAL / LABOUR + PEI -->
<div class="two-col">
  <div class="info-card">
    <h4>Material vs Labour Split</h4>
    <div class="info-row"><span>Materials (70%)</span><span><strong>${rp(sub * 0.7)}</strong></span></div>
    <div class="info-row"><span>Labour (30%)</span><span><strong>${rp(sub * 0.3)}</strong></span></div>
    <div class="info-row"><span>Contractor Quote (~18% markup)</span><span><strong>${rp(sub * 1.18)}</strong></span></div>
  </div>
  <div class="info-card">
    <h4>Plumbing Efficiency Index</h4>
    <div class="pei-row">
      <span class="pei-score">${effTotal}</span>
      <div style="flex:1">
        <div style="font-weight:bold;margin-bottom:5px">${effLabel} &nbsp;<span style="font-weight:normal;font-size:8pt;color:#888">/ 100</span></div>
        <div class="pei-bar-wrap"><div class="pei-bar" style="width:${effTotal}%"></div></div>
      </div>
    </div>
  </div>
</div>

${waterItems.length > 0 || susItems.length > 0 ? `
<!-- SYSTEMS INCLUDED -->
<div class="two-col">
  ${waterItems.length > 0 ? `<div class="info-card"><h4>Water Treatment Systems</h4><div class="badge-list">${waterItems.map(i => `<span class="badge">&#10003; ${i}</span>`).join("")}</div></div>` : "<div></div>"}
  ${susItems.length > 0 ? `<div class="info-card"><h4>Sustainability Systems</h4><div class="badge-list">${susItems.map(i => `<span class="badge">&#10003; ${i}</span>`).join("")}</div></div>` : "<div></div>"}
</div>` : ""}

${stacks && stacks.length > 0 ? `
<!-- PLUMBING STACK LAYOUT -->
<h3>Plumbing Stack Layout</h3>
<div class="stack-grid">
  ${stackCols}
</div>` : ""}

<!-- SIGNATURES -->
<div class="sig-block">
  <div class="sig-line">Prepared by<br><br>${FIRM.architect}<br>${FIRM.name}</div>
  <div class="sig-line">Client Acknowledgement<br><br>${project.client || "—"}</div>
  <div class="sig-line">Date<br><br>${project.date || ""}</div>
</div>

<!-- PAGE FOOTER -->
<div class="page-footer">
  <span>${FIRM.name} &bull; ${FIRM.address}</span>
  <span>This is a preliminary estimate. Final costs subject to detailed BOQ and site conditions.</span>
</div>

<script>
  // Reliable print trigger — waits for all layout to settle
  window.addEventListener("load", function() {
    setTimeout(function() { window.print(); }, 400);
  });
</script>

</body>
</html>`;

  // Blob download — works in sandboxed iframes, no popup needed.
  // Open the downloaded .html file in browser → it auto-prints.
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `i3D-Plumbing-${(project.name || "Estimate").replace(/[^a-zA-Z0-9]/g, "-")}-${project.date || "2026"}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("dashboard"); // 'dashboard' | 'editor'
  const [activeTab, setActiveTab] = useState("project");
  const [project, setProject] = useState(BLANK_PROJECT);
  const [fixtures, setFixtures] = useState(DEFAULT_FIXTURES);
  const [water, setWater] = useState({ dualPipeline: false, softener: true, booster: true, solar: false, hotCirc: false });
  const [drainage, setDrainage] = useState({ chambers: 4, gullyTraps: 2, ugd: true, extPiping: true, cutting: true, septic: false });
  const [stacks, setStacks] = useState(DEFAULT_STACKS);
  const [sus, setSus] = useState({ rwh: true, greywater: true, drip: true, solenoid: true, controller: true, terrace: false });
  const [eff, setEff] = useState({ verticalAlign: 22, wetWall: 18, stackOpt: 15, drainageSlope: 12, externalLayout: 12 });
  const [saved, setSaved] = useState(false);

  const calcSummary = useCallback(() => {
    const bua = parseFloat(project.builtupArea) || 0;
    const infraCost = Math.round(bua * 45);
    const fixtureCost = fixtures.reduce((s, f) => s + f.qty * f.rate, 0);
    const drainCost = drainage.chambers * 8000 + drainage.gullyTraps * 3500 + (drainage.ugd ? 25000 : 0) + (drainage.extPiping ? 40000 : 0) + (drainage.cutting ? 50000 : 0);
    const waterCost = (water.softener ? 45000 : 0) + (water.booster ? 50000 : 0) + (water.solar ? 60000 : 0) + (water.hotCirc ? 25000 : 0);
    const susCost = (sus.rwh ? 35000 : 0) + (sus.greywater ? 80000 : 0) + (sus.drip ? 15000 : 0) + (sus.solenoid ? 5000 : 0) + (sus.controller ? 6000 : 0);
    return Math.round((infraCost + fixtureCost + drainCost + waterCost + susCost) * 1.15);
  }, [project, fixtures, water, drainage, sus]);

  function newProject() {
    const id = genId();
    setProject({ ...BLANK_PROJECT, id });
    setFixtures([]);
    setWater({ dualPipeline: false, softener: false, booster: false, solar: false, hotCirc: false });
    setDrainage({ chambers: 2, gullyTraps: 1, ugd: true, extPiping: true, cutting: false, septic: false });
    setStacks([]);
    setSus({ rwh: false, greywater: false, drip: false, solenoid: false, controller: false, terrace: false });
    setEff({ verticalAlign: 20, wetWall: 15, stackOpt: 15, drainageSlope: 12, externalLayout: 12 });
    setActiveTab("project"); setScreen("editor"); setSaved(false);
  }

  function openProject(p) {
    setProject(p.project); setFixtures(p.fixtures); setWater(p.water);
    setDrainage(p.drainage); setStacks(p.stacks || DEFAULT_STACKS);
    setSus(p.sus); setEff(p.eff);
    setActiveTab("project"); setScreen("editor"); setSaved(true);
  }

  function saveProject() {
    const entry = { project, fixtures, water, drainage, stacks, sus, eff, _summary: { total: calcSummary() } };
    const all = loadProjects().filter(p => p.project.id !== project.id);
    saveProjects([...all, entry]);
    setSaved(true);
  }

  function loadSample() {
    setProject(SAMPLE_PROJECT);
    setFixtures(DEFAULT_FIXTURES);
    setWater({ dualPipeline: false, softener: true, booster: true, solar: false, hotCirc: false });
    setDrainage({ chambers: 4, gullyTraps: 2, ugd: true, extPiping: true, cutting: true, septic: false });
    setStacks(DEFAULT_STACKS);
    setSus({ rwh: true, greywater: true, drip: true, solenoid: true, controller: true, terrace: false });
    setEff({ verticalAlign: 22, wetWall: 18, stackOpt: 15, drainageSlope: 12, externalLayout: 12 });
    setActiveTab("project"); setScreen("editor"); setSaved(false);
  }

  const total = calcSummary();
  const effTotal = Object.values(eff).reduce((a, b) => a + b, 0);
  const [effColor] = effTotal >= 90 ? [C.green] : effTotal >= 70 ? [C.gold] : effTotal >= 50 ? [C.amber] : [C.red];

  if (screen === "dashboard") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Mono', 'Courier New', monospace" }}>
        <div style={{ background: C.sidebar, borderBottom: `1px solid ${C.border}`, padding: "14px 40px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 34, height: 34, background: C.gold, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#000", fontSize: 13 }}>i3d</div>
          <div>
            <div style={{ color: C.gold, fontSize: 13, fontWeight: "bold", letterSpacing: "2px" }}>PLUMBING ENGINE</div>
            <div style={{ color: C.textMuted, fontSize: 9, letterSpacing: "2px" }}>i3D STUDIO · COIMBATORE</div>
          </div>
          <div style={{ flex: 1 }} />
          <Btn ghost small onClick={loadSample}>LOAD SAMPLE PROJECT</Btn>
        </div>
        <ProjectDashboard onOpen={openProject} onNew={newProject} />
      </div>
    );
  }

  // Editor screen
  const tabContent = {
    project: <TabProject project={project} setProject={setProject} />,
    fixtures: <TabFixtures fixtures={fixtures} setFixtures={setFixtures} />,
    water: <TabWater water={water} setWater={setWater} />,
    drainage: <TabDrainage drainage={drainage} setDrainage={setDrainage} stacks={stacks} setStacks={setStacks} />,
    sustainability: <TabSustainability sus={sus} setSus={setSus} project={project} />,
    efficiency: <TabEfficiency eff={eff} setEff={setEff} />,
    summary: <TabSummary project={project} fixtures={fixtures} water={water} drainage={drainage} sus={sus} eff={eff}
      onExportPDF={() => exportToPDF({ project, fixtures, water, drainage, stacks, sus, eff })} />,
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Mono', 'Courier New', monospace", fontSize: 13, overflow: "hidden" }}>
      {/* SIDEBAR */}
      <div style={{ width: 192, background: C.sidebar, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "16px 14px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 30, height: 30, background: C.gold, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#000", fontSize: 12 }}>i3d</div>
            <div>
              <div style={{ color: C.gold, fontSize: 12, fontWeight: "bold", letterSpacing: "1.5px" }}>PLUMBING</div>
              <div style={{ color: C.textMuted, fontSize: 8, letterSpacing: "2px" }}>ENGINE</div>
            </div>
          </div>
          <div style={{ color: C.goldDim, fontSize: 9, letterSpacing: "0.8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.id || "—"}</div>
        </div>
        <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
          {TABS.map(t => {
            const active = activeTab === t.id;
            return (
              <div key={t.id} onClick={() => setActiveTab(t.id)} style={{
                display: "flex", alignItems: "center", gap: 9, padding: "9px 14px", cursor: "pointer",
                background: active ? `${C.gold}15` : "transparent",
                borderLeft: `3px solid ${active ? C.gold : "transparent"}`,
                color: active ? C.gold : C.textMuted, fontSize: 11, letterSpacing: "0.4px",
                transition: "all 0.12s",
              }}>
                <span style={{ fontSize: 13 }}>{t.icon}</span>{t.label}
              </div>
            );
          })}
        </nav>
        <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 7 }}>
          <Btn small onClick={saveProject}>{saved ? "✓ SAVED" : "SAVE PROJECT"}</Btn>
          <Btn small ghost onClick={() => setScreen("dashboard")}>← DASHBOARD</Btn>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "12px 22px", borderBottom: `1px solid ${C.border}`, background: C.sidebar, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: C.gold, fontWeight: "bold", fontSize: 13, letterSpacing: "1px" }}>{TABS.find(t => t.id === activeTab)?.label.toUpperCase()}</div>
            <div style={{ color: C.textMuted, fontSize: 10, marginTop: 2 }}>{project.name || "New Project"} · {project.client || "—"}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: C.textMuted, fontSize: 9, letterSpacing: "1px" }}>TOTAL ESTIMATE</div>
              <div style={{ color: C.gold, fontWeight: "bold", fontSize: 16 }}>{fmt(total)}</div>
            </div>
            <div style={{ padding: "4px 10px", background: `${effColor}18`, border: `1px solid ${effColor}35`, borderRadius: 3, color: effColor, fontSize: 10, letterSpacing: "1px" }}>
              PEI {effTotal}/100
            </div>
            <Btn small onClick={() => exportToPDF({ project, fixtures, water, drainage, stacks, sus, eff })}>⬇ DOWNLOAD PDF</Btn>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "22px 24px" }}>
          {tabContent[activeTab]}
        </div>
      </div>
    </div>
  );
}
