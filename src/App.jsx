import { useState, useMemo, useRef, useEffect } from "react";
import PlumbingEngine from "./PlumbingEngine";
/* ═══════════════════════════════════════════════════════════════
   i3d CONSTRUCTION MANAGEMENT SYSTEM v2.0 — TIER 1 + TIER 2
   Tier 1: Dashboard, Workspace, Stages, Cost, Agreement, Payment
   Tier 2: Monitoring, Cube Tests, Checklist, Save/Load, Settings
   ═══════════════════════════════════════════════════════════════ */

// ─── MASTER DATA ───
var WORK_ITEMS=[
  {id:"EW01",cat:"Earthwork",desc:"Earthwork Excavation (JCB/Manual)",unit:"CFT",rate:18},
  {id:"EW02",cat:"Earthwork",desc:"Gravel Filling (watered & rammed)",unit:"CFT",rate:2},
  {id:"EW03",cat:"Earthwork",desc:"Anti-Termite Treatment",unit:"SFT",rate:5},
  {id:"PCC01",cat:"PCC",desc:"P.C.C (1:4:8) M.7.5 Grade",unit:"SFT",rate:40},
  {id:"PCC02",cat:"PCC",desc:"P.C.C (1:5:10) M.7.5 Grade",unit:"CFT",rate:200},
  {id:"PCC03",cat:"PCC",desc:"P.C.C M.15 (1:2:4) Flooring",unit:"SFT",rate:35},
  {id:"RCC01",cat:"RCC",desc:"Column Footing (M.20) 1:1.5:3",unit:"SFT",rate:45},
  {id:"RCC02",cat:"RCC",desc:"Columns M.25 : 1:1:2 Mix",unit:"RFT",rate:65},
  {id:"RCC03",cat:"RCC",desc:"Plinth Beam (M.25) 1:1:2",unit:"RFT",rate:70},
  {id:"RCC04",cat:"RCC",desc:"Roof Beam/Lintel M.25:1:1:2",unit:"RFT",rate:75},
  {id:"RCC05",cat:"RCC",desc:"Roof Slab 4.5in TK (M.25)",unit:"SFT",rate:75},
  {id:"RCC06",cat:"RCC",desc:"Staircase Slab M.25:1:1:2",unit:"SFT",rate:75},
  {id:"RCC07",cat:"RCC",desc:"Lintel (Continuous) M.20",unit:"CFT",rate:400},
  {id:"RCC08",cat:"RCC",desc:"Steps Concrete (M.20)",unit:"CFT",rate:75},
  {id:"RMC01",cat:"RMC",desc:"RMC M.15 Grade",unit:"CU.M",rate:4000},
  {id:"RMC02",cat:"RMC",desc:"RMC M.20 Grade",unit:"CU.M",rate:4300},
  {id:"RMC03",cat:"RMC",desc:"RMC M.25 Grade",unit:"CU.M",rate:4600},
  {id:"MSN01",cat:"Masonry",desc:"Brick Work CM 1:6 (Foundation)",unit:"CFT",rate:40},
  {id:"MSN02",cat:"Masonry",desc:"Brick Work CM 1:5 (Super)",unit:"SFT",rate:40},
  {id:"MSN03",cat:"Masonry",desc:"9in Brick Work CM 1:5",unit:"CFT",rate:200},
  {id:"PLT01",cat:"Plastering",desc:"Ceiling Plaster CM 1:3",unit:"SFT",rate:55},
  {id:"PLT02",cat:"Plastering",desc:"Inside Walls CM 1:5",unit:"SFT",rate:50},
  {id:"PLT03",cat:"Plastering",desc:"Outside Walls CM 1:5",unit:"SFT",rate:50},
  {id:"PNT01",cat:"Painting",desc:"Interior Putty+Primer+Emulsion",unit:"SFT",rate:40},
  {id:"PNT02",cat:"Painting",desc:"Exterior WC+Primer+Emulsion",unit:"SFT",rate:35},
  {id:"FLR01",cat:"Flooring",desc:"Vitrified Tile 24x24",unit:"SFT",rate:120},
  {id:"FLR02",cat:"Flooring",desc:"Granite Flooring 18mm",unit:"SFT",rate:275},
  {id:"FLR03",cat:"Flooring",desc:"Weathering Course Terrace",unit:"SFT",rate:60},
  {id:"TIL01",cat:"Tile Work",desc:"Glazed Wall Tiles above 7ft",unit:"SFT",rate:35},
  {id:"TIL02",cat:"Tile Work",desc:"Glazed Tiles Toilet/Kitchen",unit:"SFT",rate:90},
  {id:"FC01",cat:"False Ceiling",desc:"Gypsum Plain False Ceiling",unit:"SFT",rate:65},
  {id:"JNR01",cat:"Joinery",desc:"Main Door Teak Frame+Shutter",unit:"SFT",rate:1300},
  {id:"JNR02",cat:"Joinery",desc:"Internal Door Sal+Flush",unit:"SFT",rate:650},
  {id:"JNR03",cat:"Joinery",desc:"Window UPVC+Glass",unit:"SFT",rate:600},
  {id:"GRL01",cat:"Metalwork",desc:"Window Grill 12mm Sq Rod",unit:"SFT",rate:175},
  {id:"GRL02",cat:"Metalwork",desc:"Staircase Railing SS 304",unit:"RFT",rate:750},
  {id:"MEP01",cat:"Electrical",desc:"Electrical Wiring per point",unit:"NOS",rate:1200},
  {id:"MEP02",cat:"Plumbing",desc:"Plumbing per point",unit:"NOS",rate:1500},
  {id:"TNK01",cat:"Tanks",desc:"Underground Sump RCC",unit:"LTR",rate:8},
  {id:"TNK02",cat:"Tanks",desc:"Septic Tank Brick+RCC",unit:"LTR",rate:6},
];
var UNITS=["SFT","RFT","CFT","CU.M","NOS","KG","MT","RM","LTR","LS"];
var SOIL_TYPES=[{v:"hard",l:"Hard Strata",sbc:"30"},{v:"clay",l:"Clay Soil",sbc:"15"},{v:"filled",l:"Filled Soil",sbc:"10"}];
var FOUND_TYPES=["Isolated Footing","Combined Footing","Raft","Pile Foundation","RR Masonry"];
var RATIOS={
  modest:{l:"Modest Residential",cement:0.4,msand:0.45,psand:0.12,jelly:0.7,steel:3.5,bricks:8},
  premium:{l:"Premium Residential",cement:0.5,msand:0.55,psand:0.15,jelly:0.85,steel:4.5,bricks:10},
  commercial:{l:"Commercial",cement:0.55,msand:0.5,psand:0.14,jelly:0.9,steel:5.0,bricks:12},
};
var DEF_MAT_RATES={cement:400,msand:2.5,psand:3,jelly:3.5,steel:65,bricks:12,gravel:2};
var CLAUSES=[
  "Execute per plans/specs; no subletting without written permission.",
  "Centering, scaffolding, staging, timbering, lighting at contractor cost.",
  "Clear all surplus materials; deliver building clean and water-tight.",
  "Client provides space; contractor builds temp office at own cost.",
  "Water and electricity free at one point. Contractor arranges standby.",
  "Time is essence. Fortnightly progress report required.",
  "Contractor arranges all equipment - mixers, vibrators, hoists.",
  "Service tax by Client. All other taxes by Contractor.",
  "Per SFT rates. Weekly running advance. 1yr defect liability.",
  "ESI, PF, Wages Act compliance. No child labour.",
  "All-inclusive rates. Escalation within limits by contractor.",
  "First aid, drinking water, shelters at site.",
  "Contractor insures against fire, injury, property damage.",
  "Contractor indemnifies Client against all claims.",
  "1.5% per week delay (max 3 weeks), then termination.",
  "Rectify bad work at contractor cost; Client may deduct from bills.",
  "Coimbatore jurisdiction. CREDAI standards. Indian Arbitration Act.",
  "Auto-extension for force majeure. Written agreement required.",
  "Fire safety. Peaceful progress. No child/women night labour.",
];
var CHECKLIST_ITEMS=[
  "Soil report reviewed","Structural drawings checked","Steel consumption verified",
  "DPC included","Pest control included","Lead & lift applied",
  "Contractor margin applied","Payment schedule finalized","Agreement signed",
  "Insurance coverage verified","Material brands confirmed","Timeline approved",
];
var MONITOR_STAGES=[
  {id:"excavation",l:"Excavation"},{id:"foundation",l:"Foundation"},
  {id:"plinth",l:"Plinth Beam"},{id:"gf_structure",l:"GF Structure"},
  {id:"gf_masonry",l:"GF Masonry"},{id:"ff_structure",l:"FF Structure"},
  {id:"ff_masonry",l:"FF Masonry"},{id:"plastering",l:"Plastering"},
  {id:"flooring",l:"Flooring"},{id:"painting",l:"Painting"},
  {id:"electrical",l:"Electrical"},{id:"plumbing",l:"Plumbing"},
  {id:"finishing",l:"Finishing"},{id:"handover",l:"Handover"},
];

// ─── UTILS ───
var fmt=function(n){if(!n||isNaN(n))return"\u20B90";var v=Number(n);if(v>=1e7)return"\u20B9"+(v/1e7).toFixed(2)+"Cr";if(v>=1e5)return"\u20B9"+(v/1e5).toFixed(2)+"L";return"\u20B9"+Math.round(v).toLocaleString("en-IN");};
var fN=function(n){return(!n||isNaN(n))?"0":Number(n).toLocaleString("en-IN");};
var G="#D4A853",BG="#0B0B0E",CD="#131317",BD="#1C1C24",DM="#484858",TX="#DDDDE4";
var BL="#6B9BD2",GN="#5DAF6A",RD="#C86060",PU="#9B7BB8",AM="#C89050",TL="#50AAA0";
var _inp={width:"100%",padding:"9px 11px",background:"#0E0E12",border:"1px solid "+BD,borderRadius:7,color:TX,fontSize:13,outline:"none",boxSizing:"border-box"};
var _gh=Object.assign({},_inp,{border:"none",background:"transparent",padding:"3px 5px"});
var _lb={display:"block",fontSize:10,color:DM,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.7px",fontWeight:600};
var _mn={fontFamily:"'Cascadia Code',Consolas,monospace"};

// ─── STABLE COMPONENTS ───
function Cd(p){return(<div style={Object.assign({background:p.gold?"linear-gradient(135deg,rgba(212,168,83,0.08),rgba(170,130,40,0.02))":CD,borderRadius:11,border:"1px solid "+(p.gold?"rgba(212,168,83,0.25)":BD),padding:20,marginBottom:14},p.sx||{})}>{p.children}</div>);}
function Bt(p){return(<button onClick={p.onClick} style={Object.assign({padding:"8px 16px",background:p.gold?"linear-gradient(135deg,#D4A853,#A67C2E)":p.danger?"rgba(200,55,55,0.1)":"rgba(212,168,83,0.1)",border:p.gold?"none":p.danger?"1px solid rgba(200,55,55,0.3)":"1px solid rgba(212,168,83,0.28)",borderRadius:7,color:p.gold?"#111":p.danger?RD:G,fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"},p.sx||{})}>{p.children}</button>);}
function Fl(p){
  var fid="f_"+p.k;
  return(
    <div style={{flex:p.wide?2:1,minWidth:p.wide?200:120}}>
      <label style={_lb} htmlFor={fid}>{p.label}</label>
      {p.area?(<textarea id={fid} rows={2} style={Object.assign({},_inp,{resize:"vertical"})} value={p.value||""} onChange={function(e){p.onChange(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter"&&!e.shiftKey&&p.next){e.preventDefault();var el=document.getElementById("f_"+p.next);if(el)el.focus();}}}/>
      ):(<input id={fid} type={p.type||"text"} style={_inp} value={p.value||""} onChange={function(e){p.onChange(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter"&&p.next){e.preventDefault();var el=document.getElementById("f_"+p.next);if(el){el.focus();if(el.select)el.select();}}}}/>
      )}
    </div>
  );
}
function Stat(p){return(<div style={Object.assign({padding:"12px 16px",background:CD,borderRadius:9,border:"1px solid "+BD,minWidth:130},p.sx||{})}><div style={{fontSize:9,color:DM,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:4}}>{p.label}</div><div style={Object.assign({},{fontSize:p.big?22:17,fontWeight:700,color:p.color||TX},_mn)}>{p.value}</div>{p.sub&&<div style={{fontSize:10,color:DM,marginTop:2}}>{p.sub}</div>}</div>);}

// ─── NEW PROJECT TEMPLATE ───
function newProject(id){
  var monitorStatus={};
  MONITOR_STAGES.forEach(function(s){monitorStatus[s.id]="Pending";});
  var checks={};
  CHECKLIST_ITEMS.forEach(function(c,i){checks["chk_"+i]=false;});
  return{
    id:id,name:"",location:"Coimbatore",area:"",floors:"1",type:"modest",status:"Active",date:new Date().toISOString().slice(0,10),
    ag:{cn:"",ca:"",cr:"",xn:"",xa:"",xr:"",af:"i3d Studio",aa:"Coimbatore",dt:"",pd:"Residential building",sf:"",ts:"",sm:"",mo:"15",gr:"",tr:"",ma:"",ret:"",esc:"2"},
    soil:{type:"hard",sbc:"30",foundType:"Isolated Footing",colSize:"",ftgSize:"",depth:"",grade:"M.20",steelQty:""},
    foundation:[],structure:[],finishing:[],
    payments:[
      {id:1,st:"Advance Payment",wk:"-",am:0,ss:"Pending"},
      {id:2,st:"Foundation Completion",wk:"4",am:0,ss:"Pending"},
      {id:3,st:"Ground Floor Slab",wk:"4",am:0,ss:"Pending"},
      {id:4,st:"First Floor Slab",wk:"4",am:0,ss:"Pending"},
      {id:5,st:"Finishing Stage",wk:"6",am:0,ss:"Pending"},
      {id:6,st:"Final Handover",wk:"2",am:0,ss:"Pending"},
    ],
    matRates:Object.assign({},DEF_MAT_RATES),
    profitPct:10,leadLiftPct:15,
    // Tier 2
    monitor:monitorStatus,
    monitorNotes:{},
    cubeTests:[],
    checklist:checks,
    photoLog:[],
    // Tier 3
    schedule:[
      {id:1,n:"Excavation",d:5,pred:"",es:"",ef:"",ls:"",lf:"",crit:false},
      {id:2,n:"PCC Foundation",d:3,pred:"1",es:"",ef:"",ls:"",lf:"",crit:false},
      {id:3,n:"Footing RCC",d:4,pred:"2",es:"",ef:"",ls:"",lf:"",crit:false},
      {id:4,n:"Plinth Beam",d:5,pred:"3",es:"",ef:"",ls:"",lf:"",crit:false},
      {id:5,n:"Basement Filling",d:3,pred:"4",es:"",ef:"",ls:"",lf:"",crit:false},
      {id:6,n:"GF Columns",d:6,pred:"4",es:"",ef:"",ls:"",lf:"",crit:false},
      {id:7,n:"GF Slab",d:5,pred:"6",es:"",ef:"",ls:"",lf:"",crit:false},
      {id:8,n:"Masonry",d:10,pred:"7",es:"",ef:"",ls:"",lf:"",crit:false},
      {id:9,n:"Plastering",d:8,pred:"8",es:"",ef:"",ls:"",lf:"",crit:false},
      {id:10,n:"Flooring & Tiling",d:10,pred:"9",es:"",ef:"",ls:"",lf:"",crit:false},
      {id:11,n:"Electrical & Plumbing",d:8,pred:"8",es:"",ef:"",ls:"",lf:"",crit:false},
      {id:12,n:"Painting",d:7,pred:"10",es:"",ef:"",ls:"",lf:"",crit:false},
      {id:13,n:"Finishing & Handover",d:5,pred:"12",es:"",ef:"",ls:"",lf:"",crit:false},
    ],
    procurement:[],
    rateHistory:[],
    photos:[],
  };
}

// ─── EXPORT PDF ───
function exportPDF(content,proj,tabName){
  if(!content)return;
  var date=new Date().toLocaleDateString("en-IN");
  var pid=proj?proj.id:"";
  var pname=proj?proj.name:"";
  var tn=tabName||"Report";
  var html="<!DOCTYPE html><html><head><meta charset='UTF-8'><title>"+pname+" - "+tn+" - i3d Studio</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Segoe UI,sans-serif;color:#222;padding:28px;font-size:12px;background:#fff;max-width:210mm;margin:0 auto}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #ccc;padding:6px 8px;font-size:11px;text-align:left}th{background:#f0f0f0;font-weight:600;font-size:10px;text-transform:uppercase}input,select,textarea{font:inherit;border:none;background:transparent;color:#222;padding:2px}button{display:none}div[style*='dashed']{display:none}@page{size:A4;margin:12mm}</style></head><body>";
  html+="<table style='border:none;margin-bottom:20px'><tr><td style='border:none;width:40px;vertical-align:middle'><div style='width:34px;height:34px;background:#D4A853;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;color:#111'>i3d</div></td><td style='border:none'><strong style='font-size:15px'>i3d Studio, Coimbatore</strong><br><span style='color:#888;font-size:10px'>Inspirational Architect | "+pname+" | "+pid+"</span></td><td style='border:none;text-align:right;color:#888;font-size:10px'>"+tn+"<br>"+date+"</td></tr></table>";
  html+="<hr style='border:none;border-top:2px solid #D4A853;margin-bottom:20px'>";
  html+=content.innerHTML;
  html+="<div style='margin-top:50px;padding-top:12px;border-top:1px solid #ddd'><table style='border:none;width:100%'><tr><td style='border:none;width:33%;font-size:10px;color:#666'>Client</td><td style='border:none;width:33%;text-align:center;font-size:10px;color:#666'>Architect</td><td style='border:none;width:33%;text-align:right;font-size:10px;color:#666'>Contractor</td></tr><tr><td style='border:none;padding-top:30px;border-bottom:1px solid #aaa'></td><td style='border:none;padding-top:30px;border-bottom:1px solid #aaa'></td><td style='border:none;padding-top:30px;border-bottom:1px solid #aaa'></td></tr></table></div>";
  html+="<div style='margin-top:16px;text-align:center;font-size:8px;color:#bbb'>i3d Studio - Construction Management System v2.0</div></body></html>";
  var blob=new Blob([html],{type:"text/html"});
  var url=URL.createObjectURL(blob);
  var a=document.createElement("a");
  a.href=url;
  a.download=(pname||"i3d").replace(/[^a-zA-Z0-9]/g,"_")+"_"+tn+"_"+date.replace(/\//g,"-")+".html";
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ═══ MAIN APP ═══
export default function App(){
  var ctr=useRef(1000);
  var nx=function(){ctr.current++;return ctr.current;};
  var [screen,setScreen]=useState("dashboard");
  var [projects,setProjects]=useState([]);
  var [activeId,setActiveId]=useState(null);
  var [wsTab,setWsTab]=useState("overview");
  var [aiCmd,setAiCmd]=useState("");
  var [aiResult,setAiResult]=useState("");

  var proj=projects.find(function(p){return p.id===activeId;})||null;
  var uProj=function(fn){setProjects(function(ps){return ps.map(function(p){return p.id===activeId?fn(p):p;});});};
  var uPF=function(f,v){uProj(function(p){return Object.assign({},p,{[f]:v});});};
  var uAg=function(k,v){uProj(function(p){return Object.assign({},p,{ag:Object.assign({},p.ag,{[k]:v})});});};
  var uSoil=function(k,v){uProj(function(p){return Object.assign({},p,{soil:Object.assign({},p.soil,{[k]:v})});});};
  var uMR=function(k,v){uProj(function(p){return Object.assign({},p,{matRates:Object.assign({},p.matRates,{[k]:parseFloat(v)||0})});});};
  var uMonitor=function(stageId,status){uProj(function(p){return Object.assign({},p,{monitor:Object.assign({},p.monitor,{[stageId]:status})});});};
  var uMonNote=function(stageId,note){uProj(function(p){return Object.assign({},p,{monitorNotes:Object.assign({},p.monitorNotes,{[stageId]:note})});});};
  var uCheck=function(k,v){uProj(function(p){return Object.assign({},p,{checklist:Object.assign({},p.checklist,{[k]:v})});});};

  // Stage item updaters
  var addStageItem=function(stage){uProj(function(p){return Object.assign({},p,{[stage]:p[stage].concat([{id:nx(),ds:"",qt:"",un:"SFT",rt:"",rf:""}])});});};
  var rmStageItem=function(stage,iid){uProj(function(p){return Object.assign({},p,{[stage]:p[stage].filter(function(i){return i.id!==iid;})});});};
  var uStageItem=function(stage,iid,f,v){uProj(function(p){return Object.assign({},p,{[stage]:p[stage].map(function(i){
    if(i.id!==iid)return i;
    var o=Object.assign({},i,{[f]:v});
    if(f==="ds"){var m=WORK_ITEMS.find(function(x){return x.desc===v;});if(m){o.un=m.unit;o.rt=m.rate;o.rf=m.id;}}
    return o;
  })});});};

  // Payment
  var uPay=function(pid,f,v){uProj(function(p){return Object.assign({},p,{payments:p.payments.map(function(x){return x.id===pid?Object.assign({},x,{[f]:v}):x;})});});};
  var addPay=function(){uProj(function(p){return Object.assign({},p,{payments:p.payments.concat([{id:nx(),st:"New Stage",wk:"3",am:0,ss:"Pending"}])});});};
  var rmPay=function(pid){uProj(function(p){return Object.assign({},p,{payments:p.payments.filter(function(x){return x.id!==pid;})});});};

  // Cube tests
  var addCube=function(){uProj(function(p){return Object.assign({},p,{cubeTests:p.cubeTests.concat([{id:nx(),element:"",castDate:"",d7:"",d14:"",d21:""}])});});};
  var uCube=function(cid,f,v){uProj(function(p){return Object.assign({},p,{cubeTests:p.cubeTests.map(function(c){return c.id===cid?Object.assign({},c,{[f]:v}):c;})});});};
  var rmCube=function(cid){uProj(function(p){return Object.assign({},p,{cubeTests:p.cubeTests.filter(function(c){return c.id!==cid;})});});};

  // Tier 3: Schedule
  var addSchTask=function(){uProj(function(p){var nid=p.schedule.length>0?Math.max.apply(null,p.schedule.map(function(t){return t.id;}))+1:1;return Object.assign({},p,{schedule:p.schedule.concat([{id:nid,n:"New Task",d:5,pred:"",es:"",ef:"",ls:"",lf:"",crit:false}])});});};
  var uSchTask=function(tid,f,v){uProj(function(p){return Object.assign({},p,{schedule:p.schedule.map(function(t){return t.id===tid?Object.assign({},t,{[f]:v}):t;})});});};
  var rmSchTask=function(tid){uProj(function(p){return Object.assign({},p,{schedule:p.schedule.filter(function(t){return t.id!==tid;})});});};
  // CPM forward pass
  var cpmCalc=useMemo(function(){
    if(!proj||!proj.schedule||proj.schedule.length===0)return{tasks:[],totalDur:0,critPath:[]};
    var tasks=proj.schedule.map(function(t){return Object.assign({},t,{es:0,ef:0,ls:9999,lf:9999,float:0,crit:false});});
    // Forward pass
    tasks.forEach(function(t){
      var preds=(t.pred||"").split(",").map(function(x){return parseInt(x);}).filter(function(x){return!isNaN(x);});
      var maxEf=0;
      preds.forEach(function(pid){var pt=tasks.find(function(x){return x.id===pid;});if(pt)maxEf=Math.max(maxEf,pt.ef);});
      t.es=maxEf;
      t.ef=t.es+(parseInt(t.d)||0);
    });
    var totalDur=Math.max.apply(null,[0].concat(tasks.map(function(t){return t.ef;})));
    // Backward pass
    tasks.slice().reverse().forEach(function(t){
      var succs=tasks.filter(function(s){var preds=(s.pred||"").split(",").map(function(x){return parseInt(x);});return preds.indexOf(t.id)>=0;});
      if(succs.length===0){t.lf=totalDur;t.ls=t.lf-(parseInt(t.d)||0);}
      else{var minLs=9999;succs.forEach(function(s){minLs=Math.min(minLs,s.ls);});t.lf=minLs;t.ls=t.lf-(parseInt(t.d)||0);}
      t.float=t.ls-t.es;
      t.crit=t.float===0;
    });
    var critPath=tasks.filter(function(t){return t.crit;}).map(function(t){return t.n;});
    return{tasks:tasks,totalDur:totalDur,critPath:critPath};
  },[proj]);

  // Tier 3: Procurement
  var addProcure=function(){uProj(function(p){return Object.assign({},p,{procurement:p.procurement.concat([{id:nx(),material:"",ordered:0,received:0,consumed:0,unit:"",date:"",supplier:""}])});});};
  var uProcure=function(pid,f,v){uProj(function(p){return Object.assign({},p,{procurement:p.procurement.map(function(x){return x.id===pid?Object.assign({},x,{[f]:v}):x;})});});};
  var rmProcure=function(pid){uProj(function(p){return Object.assign({},p,{procurement:p.procurement.filter(function(x){return x.id!==pid;})});});};

  // Tier 3: Rate History
  var addRateEntry=function(){uProj(function(p){return Object.assign({},p,{rateHistory:p.rateHistory.concat([{id:nx(),material:"Cement",date:new Date().toISOString().slice(0,10),oldRate:"",newRate:"",remark:""}])});});};
  var uRateEntry=function(rid,f,v){uProj(function(p){return Object.assign({},p,{rateHistory:p.rateHistory.map(function(x){return x.id===rid?Object.assign({},x,{[f]:v}):x;})});});};
  var rmRateEntry=function(rid){uProj(function(p){return Object.assign({},p,{rateHistory:p.rateHistory.filter(function(x){return x.id!==rid;})});});};

  // Tier 3: Photos
  var addPhoto=function(){uProj(function(p){return Object.assign({},p,{photos:p.photos.concat([{id:nx(),stage:"Foundation",date:new Date().toISOString().slice(0,10),desc:"",gps:"",approved:false}])});});};
  var uPhoto=function(pid,f,v){uProj(function(p){return Object.assign({},p,{photos:p.photos.map(function(x){return x.id===pid?Object.assign({},x,{[f]:v}):x;})});});};
  var rmPhoto=function(pid){uProj(function(p){return Object.assign({},p,{photos:p.photos.filter(function(x){return x.id!==pid;})});});};

  // Calculations
  var stageTotal=function(items){return(items||[]).reduce(function(s,i){return s+(parseFloat(i.qt)||0)*(parseFloat(i.rt)||0);},0);};
  var costs=useMemo(function(){
    if(!proj)return{found:0,struct:0,finish:0,labour:0,profit:0,leadlift:0,total:0,area:0,perSft:0};
    var f=stageTotal(proj.foundation),s=stageTotal(proj.structure),fi=stageTotal(proj.finishing);
    var labour=f+s+fi;
    var profitAmt=labour*(parseFloat(proj.profitPct)||0)/100;
    var llAmt=labour*(parseFloat(proj.leadLiftPct)||0)/100;
    var total=labour+profitAmt+llAmt;
    var area=parseFloat(proj.area||0)*parseFloat(proj.floors||1);
    return{found:f,struct:s,finish:fi,labour:labour,profit:profitAmt,leadlift:llAmt,total:total,area:area,perSft:area>0?total/area:0};
  },[proj]);

  var mats=useMemo(function(){
    if(!proj||!costs.area)return[];
    var r=RATIOS[proj.type||"modest"],a=costs.area,mr=proj.matRates||DEF_MAT_RATES;
    return[
      {n:"Cement",q:r.cement*a,u:"bags",rate:mr.cement,thumb:r.cement,k:"cement"},
      {n:"M.Sand",q:r.msand*a,u:"CFT",rate:mr.msand,thumb:r.msand,k:"msand"},
      {n:"P.Sand",q:r.psand*a,u:"CFT",rate:mr.psand,thumb:r.psand,k:"psand"},
      {n:"Jelly",q:r.jelly*a,u:"CFT",rate:mr.jelly,thumb:r.jelly,k:"jelly"},
      {n:"Steel",q:r.steel*a,u:"Kg",rate:mr.steel,thumb:r.steel,k:"steel"},
      {n:"Bricks",q:r.bricks*a,u:"Nos",rate:mr.bricks,thumb:r.bricks,k:"bricks"},
    ].map(function(m){m.ok=m.q<=m.thumb*a*1.15;return m;});
  },[proj,costs]);
  var matTotal=mats.reduce(function(s,m){return s+m.q*m.rate;},0);

  var pyT=proj?proj.payments.reduce(function(s,x){return s+(x.am||0);},0):0;
  var pyP=proj?proj.payments.filter(function(x){return x.ss==="Paid";}).reduce(function(s,x){return s+(x.am||0);},0):0;
  var pyO=proj?proj.payments.filter(function(x){return x.ss==="Overdue";}):[];
  var [lockOn,setLockOn]=useState(false);
  var [lockMsg,setLockMsg]=useState("Work paused due to pending payment. Contact i3d Studio.");

  // AI Review
  var runAI=function(){
    if(!proj){setAiResult("No project open.");return;}
    var r=RATIOS[proj.type||"modest"],a=costs.area;
    var findings=[];
    if(!a)findings.push("No built-up area entered.");
    if(costs.labour===0)findings.push("No BOQ items entered in any stage.");
    if(a>0){
      mats.forEach(function(m){if(!m.ok)findings.push(m.n+" consumption higher than thumb rule ("+m.thumb+"/SFT x "+fN(a)+" SFT).");});
      if(costs.perSft>2500)findings.push("Cost/SFT ("+fmt(costs.perSft)+") is on the higher side for "+RATIOS[proj.type||"modest"].l+".");
      if(costs.perSft>0&&costs.perSft<1200)findings.push("Cost/SFT ("+fmt(costs.perSft)+") seems low. Verify all items are included.");
    }
    var checkCount=0,checkTotal=CHECKLIST_ITEMS.length;
    CHECKLIST_ITEMS.forEach(function(c,i){if(proj.checklist["chk_"+i])checkCount++;});
    if(checkCount<checkTotal)findings.push("Architect checklist: "+checkCount+"/"+checkTotal+" completed.");
    var pendingStages=0;
    MONITOR_STAGES.forEach(function(s){if(proj.monitor[s.id]==="Pending")pendingStages++;});
    if(pendingStages>0)findings.push(pendingStages+" construction stages still pending.");
    if(pyO.length>0)findings.push(pyO.length+" payment stage(s) overdue.");
    if(findings.length===0)findings.push("All checks passed. Project looks good.");
    setAiResult(findings.join("\n"));
  };

  // Actions
  var createProject=function(){
    var id="I3D-"+new Date().getFullYear()+"-"+String(projects.length+1).padStart(3,"0");
    var p=newProject(id);
    setProjects(function(ps){return ps.concat([p]);});
    setActiveId(id);setWsTab("overview");setScreen("workspace");
  };
  var openProject=function(id){setActiveId(id);setWsTab("overview");setScreen("workspace");};
  var goHome=function(){setScreen("dashboard");setActiveId(null);};
  var deleteProject=function(id){setProjects(function(ps){return ps.filter(function(p){return p.id!==id;});});if(activeId===id)goHome();};

  // Stage item renderer
  function renderItems(stage,items){
    return(<div>
      <div style={{display:"grid",gridTemplateColumns:"30px 1fr 75px 55px 68px 85px 45px 26px",gap:4,marginBottom:5}}>
        {["#","Description","Qty","Unit","Rate","Amount","Ref",""].map(function(h){return(<span key={h} style={{fontSize:9,color:"#3A3A44",textTransform:"uppercase"}}>{h}</span>);})}
      </div>
      {items.map(function(item,idx){
        var amt=(parseFloat(item.qt)||0)*(parseFloat(item.rt)||0);
        var ml=WORK_ITEMS.find(function(x){return x.desc===item.ds;});
        var rf=item.rf||(ml&&ml.id)||"";
        return(<div key={item.id} style={{display:"grid",gridTemplateColumns:"30px 1fr 75px 55px 68px 85px 45px 26px",gap:4,marginBottom:2,alignItems:"center"}}>
          <span style={Object.assign({},{color:"#3A3A44",fontSize:11},_mn)}>{idx+1}</span>
          <div><input type="text" value={item.ds} onChange={function(e){uStageItem(stage,item.id,"ds",e.target.value);}} list={"dl_"+stage+"_"+item.id} placeholder="Type or pick..." style={_inp} onKeyDown={function(e){if(e.key==="Enter"){e.preventDefault();var el=document.getElementById("q_"+stage+"_"+item.id);if(el){el.focus();el.select();}}}}/><datalist id={"dl_"+stage+"_"+item.id}>{WORK_ITEMS.map(function(x){return(<option key={x.id} value={x.desc}/>);})}</datalist></div>
          <input id={"q_"+stage+"_"+item.id} type="number" value={item.qt} onChange={function(e){uStageItem(stage,item.id,"qt",e.target.value);}} style={Object.assign({},_inp,{textAlign:"right"},_mn)} onKeyDown={function(e){if(e.key==="Enter"){e.preventDefault();var el=document.getElementById("r_"+stage+"_"+item.id);if(el){el.focus();el.select();}}}}/>
          <select value={item.un} onChange={function(e){uStageItem(stage,item.id,"un",e.target.value);}} style={Object.assign({},_inp,{cursor:"pointer",padding:"8px 4px"})}>{UNITS.map(function(u){return(<option key={u}>{u}</option>);})}</select>
          <input id={"r_"+stage+"_"+item.id} type="number" value={item.rt} onChange={function(e){uStageItem(stage,item.id,"rt",e.target.value);}} style={Object.assign({},_inp,{textAlign:"right"},_mn)} onKeyDown={function(e){if(e.key==="Enter"){e.preventDefault();addStageItem(stage);}}}/>
          <span style={Object.assign({},{color:amt>0?G:"#2A2A30",fontSize:12,textAlign:"right"},_mn)}>{amt>0?fmt(amt):"\u2014"}</span>
          <span style={{fontSize:8,color:rf?BL:"#2A2A30"}}>{rf||"\u2014"}</span>
          <button onClick={function(){rmStageItem(stage,item.id);}} style={{background:"transparent",border:"none",color:"#3A3A44",cursor:"pointer",fontSize:11}}>x</button>
        </div>);
      })}
      <button onClick={function(){addStageItem(stage);}} style={{marginTop:8,padding:6,background:"rgba(212,168,83,0.03)",border:"1px dashed #252530",borderRadius:6,color:"#444",fontSize:11,cursor:"pointer",width:"100%"}}>+ Add Work Item</button>
      <div style={Object.assign({},{textAlign:"right",marginTop:8,fontSize:15,fontWeight:700,color:G},_mn)}>{fmt(stageTotal(items))}</div>
    </div>);
  }

  // Keyboard
  useEffect(function(){
    function hk(e){if(e.ctrlKey&&e.key==="h"){e.preventDefault();goHome();}if(e.ctrlKey&&e.key==="n"){e.preventDefault();createProject();}}
    window.addEventListener("keydown",hk);return function(){window.removeEventListener("keydown",hk);};
  },[]);

  var WS_TABS=[
    {id:"overview",l:"Overview",icon:"\u25A3"},
    {id:"soil",l:"Soil & Foundation",icon:"\u25BC"},
    {id:"foundation",l:"Foundation BOQ",icon:"\u2593"},
    {id:"structure",l:"Superstructure",icon:"\u25A0"},
    {id:"finishing",l:"Finishing",icon:"\u2605"},
    {id:"materials",l:"Materials",icon:"\u25C6"},
    {id:"cost",l:"Cost Summary",icon:"\u20B9"},
    {id:"agreement",l:"Agreement",icon:"\u270E"},
    {id:"payment",l:"Payment",icon:"\u2611"},
    {id:"monitor",l:"Monitoring",icon:"\u25CB"},
    {id:"cubetest",l:"Cube Tests",icon:"\u25A1"},
    {id:"checklist",l:"Checklist",icon:"\u2610"},
    {id:"ai",l:"AI Review",icon:"\u2731"},
    {id:"schedule",l:"Schedule/CPM",icon:"\u25B6"},
    {id:"procure",l:"Procurement",icon:"\u25CB"},
    {id:"raterev",l:"Rate Revisions",icon:"\u2195"},
    {id:"photos",l:"Photo Records",icon:"\u25A3"},
  ];

  return(
    <div style={{minHeight:"100vh",background:BG,color:TX,fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      {/* HEADER */}
      <div style={{background:"linear-gradient(135deg,#141418,#0A0A0D)",borderBottom:"1px solid "+BD,padding:"14px 22px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:11,cursor:"pointer"}} onClick={goHome}>
          <div style={{width:36,height:36,background:"linear-gradient(135deg,"+G+",#A67C2E)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#111"}}>i3d</div>
          <div><div style={{fontSize:15,fontWeight:700,color:"#F0F0F0"}}>Construction Management System</div><div style={{fontSize:9,color:DM,letterSpacing:"0.5px",textTransform:"uppercase"}}>i3d Studio - Coimbatore - v3.0</div></div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {proj&&<span style={{fontSize:11,color:G,fontWeight:600}}>{proj.id}</span>}
          <Bt sx={{fontSize:11}} onClick={function(){exportPDF(document.getElementById("ws-content"),proj,wsTab);}}>Export PDF</Bt>
        </div>
      </div>

      {/* DASHBOARD */}
      {screen==="dashboard"&&(
        <div style={{padding:"30px 24px",maxWidth:960,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:30}}>
            <div style={{fontSize:11,color:DM,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>i3d Construction Management System</div>
            <div style={{display:"flex",justifyContent:"center",gap:14,marginTop:16}}>
              <Bt gold onClick={createProject} sx={{padding:"14px 32px",fontSize:14,borderRadius:10}}>New Project</Bt>
               <Bt onClick={function(){setScreen("plumbing");}} sx={{padding:"14px 32px",fontSize:14,borderRadius:10,background:"rgba(201,168,76,0.06)",border:"1px solid rgba(201,168,76,0.25)",color:G}}>⧩ Plumbing Engine</Bt>
            </div>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
            <Stat label="Active" value={projects.filter(function(p){return p.status==="Active";}).length} color={BL}/>
            <Stat label="Completed" value={projects.filter(function(p){return p.status==="Completed";}).length} color={GN}/>
            <Stat label="Total" value={projects.length} color={G}/>
          </div>
          {projects.length>0&&(<Cd>
            <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:12}}>Projects</div>
            {projects.map(function(p){return(
              <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",marginBottom:6,background:"rgba(212,168,83,0.03)",borderRadius:8,border:"1px solid "+BD,cursor:"pointer"}} onClick={function(){openProject(p.id);}}>
                <div><div style={{fontSize:13,fontWeight:600,color:TX}}>{p.name||"Untitled"}</div><div style={{fontSize:11,color:DM}}>{p.id} - {p.location}{p.area?" - "+p.area+" SFT":""}</div></div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:10,color:p.status==="Active"?GN:DM,background:p.status==="Active"?"rgba(93,175,106,0.1)":"rgba(72,72,88,0.1)",padding:"3px 8px",borderRadius:4}}>{p.status}</span>
                  <button onClick={function(e){e.stopPropagation();if(confirm("Delete "+p.id+"?"))deleteProject(p.id);}} style={{background:"transparent",border:"none",color:"#333",cursor:"pointer",fontSize:12}}>x</button>
                </div>
              </div>
            );})}
          </Cd>)}
          {projects.length===0&&(<div style={{textAlign:"center",padding:"50px 0",color:"#2A2A34"}}><div style={{fontSize:40,marginBottom:12}}>&#9634;</div><div style={{fontSize:13}}>No projects yet. Click New Project to begin.</div></div>)}
        </div>
      )}

      {/* WORKSPACE */}
      {screen==="workspace"&&proj&&(
        <div style={{display:"flex",minHeight:"calc(100vh - 56px)"}}>
          {/* SIDEBAR */}
          <div style={{width:190,background:"#0E0E12",borderRight:"1px solid "+BD,padding:"12px 0",flexShrink:0,overflowY:"auto"}}>
            <div style={{padding:"0 12px 12px",borderBottom:"1px solid "+BD,marginBottom:6}}>
              <div style={{fontSize:12,fontWeight:700,color:G,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{proj.name||"New Project"}</div>
              <div style={{fontSize:10,color:DM}}>{proj.location}</div>
            </div>
            {WS_TABS.map(function(t){
              var isActive=wsTab===t.id;
              var isLocked=lockOn&&t.id!=="payment";
              return(<div key={t.id} onClick={function(){if(!isLocked)setWsTab(t.id);}} style={{padding:"8px 12px",cursor:isLocked?"not-allowed":"pointer",background:isActive?"rgba(212,168,83,0.08)":"transparent",borderLeft:isActive?"3px solid "+G:"3px solid transparent",color:isLocked?"#2A2A30":isActive?G:DM,fontSize:11,fontWeight:isActive?600:400,display:"flex",alignItems:"center",gap:7,opacity:isLocked?0.35:1}}><span style={{fontSize:12}}>{t.icon}</span>{t.l}</div>);
            })}
            <div style={{padding:"10px 12px",borderTop:"1px solid "+BD,marginTop:8}}>
              <select style={Object.assign({},_inp,{fontSize:11,padding:"6px 8px"})} value={proj.status} onChange={function(e){uPF("status",e.target.value);}}><option>Active</option><option>Completed</option><option>On Hold</option></select>
            </div>
            <div style={{padding:"6px 12px"}}><Bt sx={{width:"100%",fontSize:10,textAlign:"center"}} onClick={goHome}>Dashboard</Bt></div>
          </div>

          {/* CONTENT */}
          <div id="ws-content" style={{flex:1,padding:"18px 22px",overflowY:"auto",maxWidth:1080,position:"relative"}}>

            {/* LOCK OVERLAY */}
            {lockOn&&wsTab!=="payment"&&(
              <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"rgba(11,11,14,0.92)",zIndex:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:8}}>
                <div style={{fontSize:40,marginBottom:16}}>&#128274;</div>
                <div style={{fontSize:18,fontWeight:700,color:RD,marginBottom:8}}>PROJECT LOCKED</div>
                <div style={{fontSize:13,color:"#888",maxWidth:400,textAlign:"center",lineHeight:1.6,marginBottom:20}}>{lockMsg}</div>
                <div style={{display:"flex",gap:10}}><Bt onClick={function(){setWsTab("payment");}}>Go to Payment</Bt><Bt danger onClick={function(){setLockOn(false);}}>Unlock (Architect)</Bt></div>
              </div>
            )}

            {/* OVERVIEW */}
            {wsTab==="overview"&&(<div>
              <div style={{fontSize:16,fontWeight:700,color:G,marginBottom:14}}>Project Overview</div>
              <Cd>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12}}>
                  <Fl label="Project Name" k="pname" value={proj.name} onChange={function(v){uPF("name",v);}} wide next="ploc"/>
                  <Fl label="Location" k="ploc" value={proj.location} onChange={function(v){uPF("location",v);}} next="parea"/>
                </div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  <Fl label="Built-up Area (SFT)" k="parea" type="number" value={proj.area} onChange={function(v){uPF("area",v);}} next="pfloors"/>
                  <Fl label="Floors" k="pfloors" type="number" value={proj.floors} onChange={function(v){uPF("floors",v);}}/>
                  <div style={{flex:1,minWidth:120}}><label style={_lb}>Type</label><select style={Object.assign({},_inp,{cursor:"pointer"})} value={proj.type} onChange={function(e){uPF("type",e.target.value);}}>{Object.keys(RATIOS).map(function(k){return(<option key={k} value={k}>{RATIOS[k].l}</option>);})}</select></div>
                </div>
              </Cd>
              {costs.area>0&&(<div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}><Stat label="Total Area" value={fN(costs.area)+" SFT"} color={G}/><Stat label="Labour" value={fmt(costs.labour)} color={BL}/><Stat label="Total Cost" value={fmt(costs.total)} color={G} big/><Stat label="Cost/SFT" value={fmt(costs.perSft)} color={GN}/></div>)}
              <Cd><div style={{fontSize:13,fontWeight:600,color:G,marginBottom:10}}>Stage Summary</div>
                {[{l:"Foundation",v:costs.found,c:BL},{l:"Structure",v:costs.struct,c:PU},{l:"Finishing",v:costs.finish,c:AM}].map(function(s){var w=costs.labour>0?(s.v/costs.labour)*100:0;return(<div key={s.l} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,color:"#AAA"}}>{s.l}</span><span style={Object.assign({},{fontSize:12,color:s.c},_mn)}>{fmt(s.v)}</span></div><div style={{height:6,background:"#1A1A22",borderRadius:3,overflow:"hidden"}}><div style={{width:w+"%",height:"100%",background:s.c,borderRadius:3}}/></div></div>);})}
              </Cd>
            </div>)}

            {/* SOIL */}
            {wsTab==="soil"&&(<div>
              <div style={{fontSize:16,fontWeight:700,color:G,marginBottom:14}}>Soil & Foundation</div>
              <Cd>
                <div style={{fontSize:12,fontWeight:600,color:G,marginBottom:10}}>Soil Investigation</div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}>
                  <div style={{flex:1,minWidth:150}}><label style={_lb}>Soil Type</label><select style={Object.assign({},_inp,{cursor:"pointer"})} value={proj.soil.type} onChange={function(e){uSoil("type",e.target.value);var s=SOIL_TYPES.find(function(x){return x.v===e.target.value;});if(s)uSoil("sbc",s.sbc);}}>{SOIL_TYPES.map(function(s){return(<option key={s.v} value={s.v}>{s.l}</option>);})}</select></div>
                  <Fl label="SBC (T/m2)" k="sbc" type="number" value={proj.soil.sbc} onChange={function(v){uSoil("sbc",v);}}/>
                </div>
                <div style={{fontSize:12,fontWeight:600,color:G,marginBottom:10}}>Foundation Design</div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}>
                  <div style={{flex:1,minWidth:150}}><label style={_lb}>Foundation Type</label><select style={Object.assign({},_inp,{cursor:"pointer"})} value={proj.soil.foundType} onChange={function(e){uSoil("foundType",e.target.value);}}>{FOUND_TYPES.map(function(f){return(<option key={f}>{f}</option>);})}</select></div>
                  <Fl label="Column Size" k="colsz" value={proj.soil.colSize} onChange={function(v){uSoil("colSize",v);}} next="ftgsz"/>
                  <Fl label="Footing Size" k="ftgsz" value={proj.soil.ftgSize} onChange={function(v){uSoil("ftgSize",v);}} next="fdepth"/>
                </div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><Fl label="Depth" k="fdepth" value={proj.soil.depth} onChange={function(v){uSoil("depth",v);}} next="fgrade"/><Fl label="Concrete Grade" k="fgrade" value={proj.soil.grade} onChange={function(v){uSoil("grade",v);}} next="fsteel"/><Fl label="Steel (Kg)" k="fsteel" type="number" value={proj.soil.steelQty} onChange={function(v){uSoil("steelQty",v);}}/></div>
              </Cd>
            </div>)}

            {/* STAGE BOQs */}
            {wsTab==="foundation"&&(<div><div style={{fontSize:16,fontWeight:700,color:G,marginBottom:14}}>Foundation BOQ</div><Cd>{renderItems("foundation",proj.foundation)}</Cd></div>)}
            {wsTab==="structure"&&(<div><div style={{fontSize:16,fontWeight:700,color:G,marginBottom:14}}>Superstructure BOQ</div><Cd><div style={{fontSize:11,color:DM,marginBottom:10}}>Columns, Beams, Slabs, Masonry, Lintels, Staircase</div>{renderItems("structure",proj.structure)}</Cd></div>)}
            {wsTab==="finishing"&&(<div><div style={{fontSize:16,fontWeight:700,color:G,marginBottom:14}}>Finishing BOQ</div><Cd><div style={{fontSize:11,color:DM,marginBottom:10}}>Plastering, Flooring, Doors, Painting, Electrical, Plumbing</div>{renderItems("finishing",proj.finishing)}</Cd></div>)}

            {/* MATERIALS */}
            {wsTab==="materials"&&(<div>
              <div style={{fontSize:16,fontWeight:700,color:G,marginBottom:14}}>Material Consumption</div>
              {costs.area>0?(<div>
                <Cd>
                  <div style={{fontSize:12,fontWeight:600,color:G,marginBottom:10}}>Auto-calculated from {fN(costs.area)} SFT ({RATIOS[proj.type||"modest"].l})</div>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <thead><tr>{["Material","Quantity","Unit","Rate","Est. Cost","Thumb","Status"].map(function(h){return(<th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:DM,textTransform:"uppercase",borderBottom:"1px solid "+BD}}>{h}</th>);})}</tr></thead>
                    <tbody>{mats.map(function(m){return(
                      <tr key={m.n}><td style={{padding:"8px 10px",borderBottom:"1px solid #1A1A1E",color:"#CCC"}}>{m.n}</td><td style={Object.assign({},{padding:"8px 10px",borderBottom:"1px solid #1A1A1E",color:BL},_mn)}>{fN(m.q)}</td><td style={{padding:"8px 10px",borderBottom:"1px solid #1A1A1E",color:DM}}>{m.u}</td><td style={{padding:"4px 6px",borderBottom:"1px solid #1A1A1E"}}><input type="number" value={m.rate} onChange={function(e){uMR(m.k,e.target.value);}} style={Object.assign({},_gh,_mn,{width:70,textAlign:"right",color:AM})}/></td><td style={Object.assign({},{padding:"8px 10px",borderBottom:"1px solid #1A1A1E",color:G},_mn)}>{fmt(m.q*m.rate)}</td><td style={Object.assign({},{padding:"8px 10px",borderBottom:"1px solid #1A1A1E",color:"#888"},_mn)}>{m.thumb}/SFT</td><td style={{padding:"8px 10px",borderBottom:"1px solid #1A1A1E"}}><span style={{fontSize:11,color:m.ok?GN:RD,fontWeight:600}}>{m.ok?"\u2713 OK":"\u26A0 High"}</span></td></tr>
                    );})}</tbody>
                  </table>
                </Cd>
                <Cd gold><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,color:"#888",textTransform:"uppercase"}}>Total Material Cost</span><span style={Object.assign({},{fontSize:22,fontWeight:800,color:G},_mn)}>{fmt(matTotal)}</span></div></Cd>
              </div>):(<Cd><div style={{color:DM,fontSize:13,padding:20,textAlign:"center"}}>Enter Built-up Area in Overview first.</div></Cd>)}
            </div>)}

            {/* COST SUMMARY */}
            {wsTab==="cost"&&(<div>
              <div style={{fontSize:16,fontWeight:700,color:G,marginBottom:14}}>Cost Summary</div>
              <Cd><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><tbody>
                {[{l:"Foundation",v:costs.found,c:BL},{l:"Superstructure",v:costs.struct,c:PU},{l:"Finishing",v:costs.finish,c:AM}].map(function(r){return(<tr key={r.l}><td style={{padding:"10px 12px",borderBottom:"1px solid #1A1A1E",color:"#CCC"}}>{r.l}</td><td style={Object.assign({},{padding:"10px 12px",borderBottom:"1px solid #1A1A1E",textAlign:"right",color:r.c},_mn)}>{fmt(r.v)}</td></tr>);})}
                <tr style={{borderTop:"2px solid "+BD}}><td style={{padding:"10px 12px",fontWeight:700,color:"#AAA"}}>LABOUR COST</td><td style={Object.assign({},{padding:"10px 12px",textAlign:"right",fontWeight:700,color:TX,fontSize:16},_mn)}>{fmt(costs.labour)}</td></tr>
              </tbody></table></Cd>
              <Cd><div style={{fontSize:12,fontWeight:600,color:G,marginBottom:10}}>Additions</div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}><div style={{flex:1,minWidth:140}}><label style={_lb}>Contractor Profit %</label><input type="number" style={_inp} value={proj.profitPct} onChange={function(e){uPF("profitPct",parseFloat(e.target.value)||0);}}/></div><div style={{flex:1,minWidth:140}}><label style={_lb}>Lead & Lift %</label><input type="number" style={_inp} value={proj.leadLiftPct} onChange={function(e){uPF("leadLiftPct",parseFloat(e.target.value)||0);}}/></div></div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><Stat label="Profit" value={fmt(costs.profit)} color={GN} sub={proj.profitPct+"%"}/><Stat label="Lead & Lift" value={fmt(costs.leadlift)} color={AM} sub={proj.leadLiftPct+"%"}/></div>
              </Cd>
              <Cd gold><div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:14,alignItems:"center"}}><div><div style={{fontSize:10,color:"#888",textTransform:"uppercase"}}>Total Project Cost</div><div style={Object.assign({},{fontSize:28,fontWeight:800,color:G},_mn)}>{fmt(costs.total)}</div></div><div style={{display:"flex",gap:14}}><Stat label="Area" value={fN(costs.area)+" SFT"} color={BL}/><Stat label="Cost/SFT" value={fmt(costs.perSft)} color={GN}/></div></div></Cd>
            </div>)}

            {/* AGREEMENT */}
            {wsTab==="agreement"&&(<div>
              <div style={{fontSize:16,fontWeight:700,color:G,marginBottom:14}}>Agreement Generator</div>
              <Cd>
                <div style={{fontSize:11,color:G,textTransform:"uppercase",marginBottom:6,fontWeight:700}}>Parties</div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12}}><Fl label="Client Name" k="agcn" value={proj.ag.cn} onChange={function(v){uAg("cn",v);}} wide next="agca"/><Fl label="Client Address" k="agca" value={proj.ag.ca} onChange={function(v){uAg("ca",v);}} wide area next="agcr"/><Fl label="Representative" k="agcr" value={proj.ag.cr} onChange={function(v){uAg("cr",v);}} next="agxn"/></div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12}}><Fl label="Contractor" k="agxn" value={proj.ag.xn} onChange={function(v){uAg("xn",v);}} wide next="agxa"/><Fl label="Contractor Address" k="agxa" value={proj.ag.xa} onChange={function(v){uAg("xa",v);}} wide area next="agxr"/><Fl label="Auth. Signatory" k="agxr" value={proj.ag.xr} onChange={function(v){uAg("xr",v);}} next="agaf"/></div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12}}><Fl label="Architect" k="agaf" value={proj.ag.af} onChange={function(v){uAg("af",v);}} next="agaa"/><Fl label="Address" k="agaa" value={proj.ag.aa} onChange={function(v){uAg("aa",v);}} wide next="agdt"/><Fl label="Date" k="agdt" value={proj.ag.dt} onChange={function(v){uAg("dt",v);}}/></div>
                <div style={{fontSize:11,color:G,textTransform:"uppercase",margin:"14px 0 6px",fontWeight:700}}>Schedule & Rates</div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12}}><Fl label="Commencement" k="agsm" value={proj.ag.sm} onChange={function(v){uAg("sm",v);}} next="agmo"/><Fl label="Months" k="agmo" value={proj.ag.mo} onChange={function(v){uAg("mo",v);}} next="aggr"/><Fl label="GF Rate/SFT" k="aggr" value={proj.ag.gr} onChange={function(v){uAg("gr",v);}} next="agtr"/><Fl label="Typ Floor Rate" k="agtr" value={proj.ag.tr} onChange={function(v){uAg("tr",v);}}/></div>
                <div style={{fontSize:11,color:G,textTransform:"uppercase",margin:"14px 0 6px",fontWeight:700}}>Financial</div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><Fl label="Mob. Advance" k="agma" value={proj.ag.ma} onChange={function(v){uAg("ma",v);}} next="agret"/><Fl label="Retention" k="agret" value={proj.ag.ret} onChange={function(v){uAg("ret",v);}} next="agesc"/><Fl label="Escalation %" k="agesc" value={proj.ag.esc} onChange={function(v){uAg("esc",v);}}/></div>
              </Cd>
              <Cd><div style={{fontSize:13,fontWeight:600,color:G,marginBottom:10}}>Contract Clauses (19)</div>{CLAUSES.map(function(c,i){return(<div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:"1px solid #1A1A1E"}}><span style={Object.assign({},{color:G,fontSize:11,minWidth:22,textAlign:"right"},_mn)}>{i+1}</span><span style={{color:"#AAA",fontSize:12,flex:1}}>{c}</span></div>);})}</Cd>
            </div>)}

            {/* PAYMENT */}
            {wsTab==="payment"&&(<div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:16,fontWeight:700,color:G}}>Payment Schedule</div>
                <div style={{display:"flex",gap:6}}><Bt onClick={addPay}>+ Stage</Bt><Bt danger={!lockOn} gold={lockOn} onClick={function(){setLockOn(!lockOn);}}>{lockOn?"Unlock Project":"Lock Project"}</Bt></div>
              </div>
              {lockOn&&(<div style={{background:"rgba(200,40,40,0.05)",border:"1px solid rgba(200,55,55,0.2)",padding:"12px 16px",borderRadius:8,marginBottom:12}}><div style={{fontSize:12,fontWeight:700,color:RD,marginBottom:4}}>SMART LOCK ACTIVE</div><textarea rows={2} style={Object.assign({},_inp,{fontSize:12})} value={lockMsg} onChange={function(e){setLockMsg(e.target.value);}}/></div>)}
              <Cd><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr>{["#","Stage","Weeks","Amount","%","Cumul.","Status",""].map(function(h){return(<th key={h} style={{textAlign:"left",padding:"7px 10px",fontSize:10,color:DM,textTransform:"uppercase",borderBottom:"1px solid "+BD}}>{h}</th>);})}</tr></thead>
                <tbody>{(function(){var cum=0;return proj.payments.map(function(p,i){var pctV=pyT>0?(p.am/pyT)*100:0;cum+=pctV;return(
                  <tr key={p.id} style={{background:p.ss==="Overdue"?"rgba(200,55,55,0.03)":"transparent"}}>
                    <td style={Object.assign({},{padding:"6px 10px",borderBottom:"1px solid #1A1A1E",color:DM},_mn)}>{i+1}</td>
                    <td style={{padding:"6px 10px",borderBottom:"1px solid #1A1A1E"}}><input value={p.st} onChange={function(e){uPay(p.id,"st",e.target.value);}} style={Object.assign({},_gh,{color:"#CCC"})} onKeyDown={function(e){if(e.key==="Enter"){var el=document.getElementById("pw_"+i);if(el)el.focus();}}}/></td>
                    <td style={{padding:"6px 10px",borderBottom:"1px solid #1A1A1E"}}><input id={"pw_"+i} value={p.wk} onChange={function(e){uPay(p.id,"wk",e.target.value);}} style={Object.assign({},_gh,_mn,{width:38,textAlign:"center",color:"#888"})} onKeyDown={function(e){if(e.key==="Enter"){var el=document.getElementById("pa_"+i);if(el){el.focus();el.select();}}}}/></td>
                    <td style={{padding:"6px 10px",borderBottom:"1px solid #1A1A1E"}}><input id={"pa_"+i} type="number" value={p.am} onChange={function(e){uPay(p.id,"am",parseFloat(e.target.value)||0);}} style={Object.assign({},_gh,_mn,{width:85,textAlign:"right",color:BL})}/></td>
                    <td style={Object.assign({},{padding:"6px 10px",borderBottom:"1px solid #1A1A1E",textAlign:"right",color:"#888"},_mn)}>{pctV.toFixed(1)}%</td>
                    <td style={Object.assign({},{padding:"6px 10px",borderBottom:"1px solid #1A1A1E",textAlign:"right",color:G},_mn)}>{cum.toFixed(1)}%</td>
                    <td style={{padding:"6px 10px",borderBottom:"1px solid #1A1A1E"}}><select value={p.ss} onChange={function(e){uPay(p.id,"ss",e.target.value);}} style={Object.assign({},_inp,{fontSize:11,padding:"3px 5px",width:80,color:p.ss==="Paid"?GN:p.ss==="Overdue"?RD:"#888"})}><option>Pending</option><option>Paid</option><option>Overdue</option></select></td>
                    <td style={{padding:"6px 10px",borderBottom:"1px solid #1A1A1E"}}><button onClick={function(){rmPay(p.id);}} style={{background:"transparent",border:"none",color:"#3A3A44",cursor:"pointer",fontSize:10}}>x</button></td>
                  </tr>);});})()}</tbody>
              </table></Cd>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><Stat label="Total" value={fmt(pyT)} color={G} big/><Stat label="Paid" value={fmt(pyP)} color={GN}/><Stat label="Balance" value={fmt(pyT-pyP)} color={RD}/><Stat label="Overdue" value={String(pyO.length)} color={pyO.length?RD:"#444"}/></div>
            </div>)}

            {/* ═══ TIER 2: MONITORING ═══ */}
            {wsTab==="monitor"&&(<div>
              <div style={{fontSize:16,fontWeight:700,color:G,marginBottom:14}}>Construction Monitoring</div>
              <Cd>
                <div style={{fontSize:12,fontWeight:600,color:G,marginBottom:10}}>Stage Progress</div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr>{["Stage","Status","Notes"].map(function(h){return(<th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:DM,textTransform:"uppercase",borderBottom:"1px solid "+BD}}>{h}</th>);})}</tr></thead>
                  <tbody>{MONITOR_STAGES.map(function(s){
                    var st=proj.monitor[s.id]||"Pending";
                    var clr=st==="Completed"?GN:st==="In Progress"?BL:st==="Locked"?RD:DM;
                    return(
                      <tr key={s.id}>
                        <td style={{padding:"8px 10px",borderBottom:"1px solid #1A1A1E",color:"#CCC",fontWeight:500}}>{s.l}</td>
                        <td style={{padding:"4px 6px",borderBottom:"1px solid #1A1A1E"}}><select value={st} onChange={function(e){uMonitor(s.id,e.target.value);}} style={Object.assign({},_inp,{fontSize:11,padding:"5px 6px",width:110,color:clr,fontWeight:600})}><option>Pending</option><option>In Progress</option><option>Completed</option><option>Locked</option></select></td>
                        <td style={{padding:"4px 6px",borderBottom:"1px solid #1A1A1E"}}><input value={proj.monitorNotes[s.id]||""} onChange={function(e){uMonNote(s.id,e.target.value);}} placeholder="Add notes..." style={Object.assign({},_gh,{color:"#888",fontSize:12})}/></td>
                      </tr>
                    );
                  })}</tbody>
                </table>
              </Cd>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <Stat label="Completed" value={MONITOR_STAGES.filter(function(s){return proj.monitor[s.id]==="Completed";}).length+"/"+MONITOR_STAGES.length} color={GN}/>
                <Stat label="In Progress" value={MONITOR_STAGES.filter(function(s){return proj.monitor[s.id]==="In Progress";}).length} color={BL}/>
                <Stat label="Pending" value={MONITOR_STAGES.filter(function(s){return proj.monitor[s.id]==="Pending";}).length} color={DM}/>
              </div>
            </div>)}

            {/* ═══ TIER 2: CUBE TESTS ═══ */}
            {wsTab==="cubetest"&&(<div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:16,fontWeight:700,color:G}}>Cube Test Register</div>
                <Bt onClick={addCube}>+ Add Test</Bt>
              </div>
              <Cd>
                <div style={{fontSize:11,color:DM,marginBottom:10}}>Concrete quality tracking - 7d, 14d, 21d compressive strength (N/mm2)</div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr>{["Element","Cast Date","7 Day","14 Day","21 Day","Status",""].map(function(h){return(<th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:DM,textTransform:"uppercase",borderBottom:"1px solid "+BD}}>{h}</th>);})}</tr></thead>
                  <tbody>{proj.cubeTests.map(function(c){
                    var d21=parseFloat(c.d21)||0;
                    var pass=d21>=20;
                    var status=d21>0?(pass?"Pass":"Fail"):(c.d7?"Pending":"");
                    return(
                      <tr key={c.id}>
                        <td style={{padding:"4px 6px",borderBottom:"1px solid #1A1A1E"}}><input value={c.element} onChange={function(e){uCube(c.id,"element",e.target.value);}} placeholder="Footing/Column/Slab" style={Object.assign({},_gh,{color:"#CCC"})}/></td>
                        <td style={{padding:"4px 6px",borderBottom:"1px solid #1A1A1E"}}><input value={c.castDate} onChange={function(e){uCube(c.id,"castDate",e.target.value);}} placeholder="DD-MMM" style={Object.assign({},_gh,{color:"#888",width:80})}/></td>
                        <td style={{padding:"4px 6px",borderBottom:"1px solid #1A1A1E"}}><input type="number" value={c.d7} onChange={function(e){uCube(c.id,"d7",e.target.value);}} style={Object.assign({},_gh,_mn,{width:50,textAlign:"right",color:BL})}/></td>
                        <td style={{padding:"4px 6px",borderBottom:"1px solid #1A1A1E"}}><input type="number" value={c.d14} onChange={function(e){uCube(c.id,"d14",e.target.value);}} style={Object.assign({},_gh,_mn,{width:50,textAlign:"right",color:BL})}/></td>
                        <td style={{padding:"4px 6px",borderBottom:"1px solid #1A1A1E"}}><input type="number" value={c.d21} onChange={function(e){uCube(c.id,"d21",e.target.value);}} style={Object.assign({},_gh,_mn,{width:50,textAlign:"right",color:d21>0?pass?GN:RD:BL})}/></td>
                        <td style={{padding:"8px 10px",borderBottom:"1px solid #1A1A1E"}}><span style={{fontSize:11,fontWeight:600,color:status==="Pass"?GN:status==="Fail"?RD:DM}}>{status||"\u2014"}</span></td>
                        <td style={{padding:"4px",borderBottom:"1px solid #1A1A1E"}}><button onClick={function(){rmCube(c.id);}} style={{background:"transparent",border:"none",color:"#3A3A44",cursor:"pointer",fontSize:10}}>x</button></td>
                      </tr>
                    );
                  })}</tbody>
                </table>
                {proj.cubeTests.length===0&&(<div style={{color:DM,fontSize:12,padding:16,textAlign:"center"}}>No tests recorded. Click + Add Test.</div>)}
              </Cd>
            </div>)}

            {/* ═══ TIER 2: CHECKLIST ═══ */}
            {wsTab==="checklist"&&(<div>
              <div style={{fontSize:16,fontWeight:700,color:G,marginBottom:14}}>Architect Checklist</div>
              <Cd>
                <div style={{fontSize:12,fontWeight:600,color:G,marginBottom:10}}>Before finalizing estimate</div>
                {CHECKLIST_ITEMS.map(function(item,i){
                  var k="chk_"+i;
                  var checked=proj.checklist[k];
                  return(
                    <div key={i} onClick={function(){uCheck(k,!checked);}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",marginBottom:4,background:checked?"rgba(93,175,106,0.04)":"transparent",borderRadius:6,cursor:"pointer",border:"1px solid "+(checked?"rgba(93,175,106,0.15)":BD)}}>
                      <div style={{width:20,height:20,borderRadius:4,border:"2px solid "+(checked?GN:BD),background:checked?GN:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#111",fontWeight:700,flexShrink:0}}>{checked?"\u2713":""}</div>
                      <span style={{fontSize:13,color:checked?"#AAA":"#777",textDecoration:checked?"line-through":"none"}}>{item}</span>
                    </div>
                  );
                })}
                <div style={Object.assign({},{marginTop:14,fontSize:14,fontWeight:700,color:G},_mn)}>
                  {CHECKLIST_ITEMS.filter(function(c,i){return proj.checklist["chk_"+i];}).length} / {CHECKLIST_ITEMS.length} completed
                </div>
              </Cd>
              <Cd gold>
                <div style={{fontSize:12,color:"#888"}}>Only after all items are checked:</div>
                <Bt gold sx={{marginTop:10,opacity:CHECKLIST_ITEMS.every(function(c,i){return proj.checklist["chk_"+i];})?1:0.4}} onClick={function(){if(CHECKLIST_ITEMS.every(function(c,i){return proj.checklist["chk_"+i];})){alert("Checklist complete. Ready to generate final report.");}else{alert("Complete all checklist items first.");}}}>Generate Final Report</Bt>
              </Cd>
            </div>)}

            {/* ═══ TIER 2: AI REVIEW ═══ */}
            {wsTab==="ai"&&(<div>
              <div style={{fontSize:16,fontWeight:700,color:G,marginBottom:14}}>AI Review</div>
              <Cd>
                <div style={{fontSize:12,color:DM,marginBottom:12}}>Type a command or click Review to analyze your project.</div>
                <div style={{display:"flex",gap:8,marginBottom:14}}>
                  <input value={aiCmd} onChange={function(e){setAiCmd(e.target.value);}} placeholder="e.g. Review estimate, Check materials, Project status..." style={Object.assign({},_inp,{flex:1})} onKeyDown={function(e){if(e.key==="Enter")runAI();}}/>
                  <Bt gold onClick={runAI}>Review</Bt>
                </div>
                {aiResult&&(
                  <div style={{padding:"14px 16px",background:"#0E0E12",borderRadius:8,border:"1px solid "+BD}}>
                    <div style={{fontSize:11,color:G,fontWeight:600,marginBottom:8}}>Analysis</div>
                    {aiResult.split("\n").map(function(line,i){
                      var isWarn=line.indexOf("Warning")>=0||line.indexOf("overdue")>=0||line.indexOf("high")>=0||line.indexOf("low")>=0;
                      var isOk=line.indexOf("passed")>=0||line.indexOf("OK")>=0||line.indexOf("looks good")>=0;
                      return(<div key={i} style={{fontSize:12,color:isWarn?RD:isOk?GN:"#AAA",padding:"4px 0",display:"flex",gap:6}}><span style={{color:isWarn?RD:isOk?GN:BL}}>{isWarn?"\u26A0":isOk?"\u2713":"\u2022"}</span>{line}</div>);
                    })}
                  </div>
                )}
              </Cd>
              <Cd sx={{padding:"14px 16px"}}>
                <div style={{fontSize:11,color:DM}}>Quick commands: "review estimate" | "check materials" | "project status" | "payment status"</div>
              </Cd>
            </div>)}

            {/* ═══ TIER 3: SCHEDULE / CPM ═══ */}
            {wsTab==="schedule"&&(<div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:16,fontWeight:700,color:G}}>Project Schedule - CPM / Gantt</div>
                <Bt onClick={addSchTask}>+ Add Task</Bt>
              </div>
              {cpmCalc.critPath.length>0&&(
                <div style={{padding:"8px 12px",background:"rgba(200,55,55,0.04)",border:"1px solid rgba(200,55,55,0.15)",borderRadius:7,marginBottom:12,fontSize:11,color:RD}}>
                  <strong>Critical Path:</strong> {cpmCalc.critPath.join(" \u2192 ")} = <strong>{cpmCalc.totalDur} days</strong>
                </div>
              )}
              <Cd>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:800}}>
                    <thead><tr>{["ID","Task","Dur(d)","Pred","ES","EF","LS","LF","Float","Gantt",""].map(function(h){return(<th key={h} style={{textAlign:"left",padding:"7px 8px",fontSize:9,color:DM,textTransform:"uppercase",borderBottom:"1px solid "+BD,width:h==="Task"?"18%":h==="Gantt"?"22%":"auto"}}>{h}</th>);})}</tr></thead>
                    <tbody>{cpmCalc.tasks.map(function(t,idx){
                      var barL=cpmCalc.totalDur>0?(t.es/cpmCalc.totalDur)*100:0;
                      var barW=cpmCalc.totalDur>0?((parseInt(t.d)||0)/cpmCalc.totalDur)*100:0;
                      return(
                        <tr key={t.id} style={{background:t.crit?"rgba(200,55,55,0.03)":"transparent"}}>
                          <td style={Object.assign({},{padding:"5px 8px",borderBottom:"1px solid #1A1A1E",color:DM,fontSize:10},_mn)}>{t.id}</td>
                          <td style={{padding:"3px 4px",borderBottom:"1px solid #1A1A1E"}}><input value={t.n} onChange={function(e){uSchTask(t.id,"n",e.target.value);}} style={Object.assign({},_gh,{color:t.crit?RD:"#CCC",fontWeight:t.crit?600:400,fontSize:12})} onKeyDown={function(e){if(e.key==="Enter"){var el=document.getElementById("sd_"+idx);if(el){el.focus();el.select();}}}}/></td>
                          <td style={{padding:"3px 4px",borderBottom:"1px solid #1A1A1E"}}><input id={"sd_"+idx} type="number" value={t.d} onChange={function(e){uSchTask(t.id,"d",e.target.value);}} style={Object.assign({},_gh,_mn,{width:35,textAlign:"right",color:BL})} onKeyDown={function(e){if(e.key==="Enter"){var el=document.getElementById("sp_"+idx);if(el)el.focus();}}}/></td>
                          <td style={{padding:"3px 4px",borderBottom:"1px solid #1A1A1E"}}><input id={"sp_"+idx} value={t.pred} onChange={function(e){uSchTask(t.id,"pred",e.target.value);}} style={Object.assign({},_gh,_mn,{width:40,textAlign:"center",color:AM})}/></td>
                          <td style={Object.assign({},{padding:"5px 8px",borderBottom:"1px solid #1A1A1E",color:"#888",fontSize:11},_mn)}>{t.es}</td>
                          <td style={Object.assign({},{padding:"5px 8px",borderBottom:"1px solid #1A1A1E",color:"#888",fontSize:11},_mn)}>{t.ef}</td>
                          <td style={Object.assign({},{padding:"5px 8px",borderBottom:"1px solid #1A1A1E",color:"#888",fontSize:11},_mn)}>{t.ls}</td>
                          <td style={Object.assign({},{padding:"5px 8px",borderBottom:"1px solid #1A1A1E",color:"#888",fontSize:11},_mn)}>{t.lf}</td>
                          <td style={Object.assign({},{padding:"5px 8px",borderBottom:"1px solid #1A1A1E",color:t.float===0?RD:GN,fontSize:11,fontWeight:600},_mn)}>{t.float}</td>
                          <td style={{padding:"5px 8px",borderBottom:"1px solid #1A1A1E",position:"relative",height:20}}>
                            {barW>0&&<div style={{position:"absolute",left:barL+"%",width:Math.max(barW,2)+"%",height:14,background:t.crit?RD:BL,borderRadius:2,top:4,opacity:0.8}}/>}
                          </td>
                          <td style={{padding:"3px",borderBottom:"1px solid #1A1A1E"}}><button onClick={function(){rmSchTask(t.id);}} style={{background:"transparent",border:"none",color:"#3A3A44",cursor:"pointer",fontSize:10}}>x</button></td>
                        </tr>
                      );
                    })}</tbody>
                  </table>
                </div>
              </Cd>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <Stat label="Total Duration" value={cpmCalc.totalDur+" days"} color={G} big/>
                <Stat label="Total Tasks" value={String(cpmCalc.tasks.length)} color={BL}/>
                <Stat label="Critical Tasks" value={String(cpmCalc.critPath.length)} color={RD}/>
              </div>
            </div>)}

            {/* ═══ TIER 3: PROCUREMENT ═══ */}
            {wsTab==="procure"&&(<div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:16,fontWeight:700,color:G}}>Material Procurement Tracker</div>
                <Bt onClick={addProcure}>+ Add Entry</Bt>
              </div>
              <Cd>
                <div style={{fontSize:11,color:DM,marginBottom:10}}>Track ordered vs received vs consumed. Flags over-purchase automatically.</div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <thead><tr>{["Material","Ordered","Received","Consumed","Unit","Supplier","Date","Status",""].map(function(h){return(<th key={h} style={{textAlign:"left",padding:"7px 8px",fontSize:9,color:DM,textTransform:"uppercase",borderBottom:"1px solid "+BD}}>{h}</th>);})}</tr></thead>
                    <tbody>{proj.procurement.map(function(p){
                      var ord=parseFloat(p.ordered)||0,rec=parseFloat(p.received)||0,con=parseFloat(p.consumed)||0;
                      var excess=rec>0&&con>0&&(rec-con)/con>0.2;
                      var status=con===0?"":excess?"Over-purchase":"OK";
                      return(
                        <tr key={p.id} style={{background:excess?"rgba(200,55,55,0.03)":"transparent"}}>
                          <td style={{padding:"3px 4px",borderBottom:"1px solid #1A1A1E"}}><input value={p.material} onChange={function(e){uProcure(p.id,"material",e.target.value);}} placeholder="Cement, Steel..." style={Object.assign({},_gh,{color:"#CCC"})}/></td>
                          <td style={{padding:"3px 4px",borderBottom:"1px solid #1A1A1E"}}><input type="number" value={p.ordered} onChange={function(e){uProcure(p.id,"ordered",e.target.value);}} style={Object.assign({},_gh,_mn,{width:60,textAlign:"right",color:BL})}/></td>
                          <td style={{padding:"3px 4px",borderBottom:"1px solid #1A1A1E"}}><input type="number" value={p.received} onChange={function(e){uProcure(p.id,"received",e.target.value);}} style={Object.assign({},_gh,_mn,{width:60,textAlign:"right",color:GN})}/></td>
                          <td style={{padding:"3px 4px",borderBottom:"1px solid #1A1A1E"}}><input type="number" value={p.consumed} onChange={function(e){uProcure(p.id,"consumed",e.target.value);}} style={Object.assign({},_gh,_mn,{width:60,textAlign:"right",color:AM})}/></td>
                          <td style={{padding:"3px 4px",borderBottom:"1px solid #1A1A1E"}}><input value={p.unit} onChange={function(e){uProcure(p.id,"unit",e.target.value);}} placeholder="bags" style={Object.assign({},_gh,{color:"#888",width:45})}/></td>
                          <td style={{padding:"3px 4px",borderBottom:"1px solid #1A1A1E"}}><input value={p.supplier} onChange={function(e){uProcure(p.id,"supplier",e.target.value);}} placeholder="Supplier" style={Object.assign({},_gh,{color:"#888"})}/></td>
                          <td style={{padding:"3px 4px",borderBottom:"1px solid #1A1A1E"}}><input value={p.date} onChange={function(e){uProcure(p.id,"date",e.target.value);}} placeholder="DD-MMM" style={Object.assign({},_gh,{color:"#666",width:65})}/></td>
                          <td style={{padding:"6px 8px",borderBottom:"1px solid #1A1A1E"}}><span style={{fontSize:11,fontWeight:600,color:status==="Over-purchase"?RD:status==="OK"?GN:DM}}>{status||"\u2014"}</span></td>
                          <td style={{padding:"3px",borderBottom:"1px solid #1A1A1E"}}><button onClick={function(){rmProcure(p.id);}} style={{background:"transparent",border:"none",color:"#3A3A44",cursor:"pointer",fontSize:10}}>x</button></td>
                        </tr>
                      );
                    })}</tbody>
                  </table>
                </div>
                {proj.procurement.length===0&&(<div style={{color:DM,fontSize:12,padding:16,textAlign:"center"}}>No entries. Click + Add Entry to track procurement.</div>)}
              </Cd>
              {proj.procurement.length>0&&(
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  <Stat label="Total Entries" value={String(proj.procurement.length)} color={BL}/>
                  <Stat label="Over-purchases" value={String(proj.procurement.filter(function(p){var r=parseFloat(p.received)||0,c=parseFloat(p.consumed)||0;return c>0&&(r-c)/c>0.2;}).length)} color={RD}/>
                </div>
              )}
            </div>)}

            {/* ═══ TIER 3: RATE REVISIONS ═══ */}
            {wsTab==="raterev"&&(<div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:16,fontWeight:700,color:G}}>Rate Revision Database</div>
                <Bt onClick={addRateEntry}>+ Add Revision</Bt>
              </div>
              <Cd>
                <div style={{fontSize:11,color:DM,marginBottom:10}}>Track material rate changes over time. Helps detect cost deviations and supports escalation claims.</div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr>{["Material","Date","Old Rate","New Rate","Change","Remark",""].map(function(h){return(<th key={h} style={{textAlign:"left",padding:"7px 8px",fontSize:9,color:DM,textTransform:"uppercase",borderBottom:"1px solid "+BD}}>{h}</th>);})}</tr></thead>
                  <tbody>{proj.rateHistory.map(function(r){
                    var oldR=parseFloat(r.oldRate)||0,newR=parseFloat(r.newRate)||0;
                    var change=oldR>0?((newR-oldR)/oldR*100).toFixed(1):0;
                    var up=newR>oldR;
                    return(
                      <tr key={r.id}>
                        <td style={{padding:"3px 4px",borderBottom:"1px solid #1A1A1E"}}><select value={r.material} onChange={function(e){uRateEntry(r.id,"material",e.target.value);}} style={Object.assign({},_inp,{fontSize:11,padding:"4px 6px",width:100})}>{["Cement","M.Sand","P.Sand","Jelly","Steel","Bricks","Gravel","RMC M.20","RMC M.25"].map(function(m){return(<option key={m}>{m}</option>);})}</select></td>
                        <td style={{padding:"3px 4px",borderBottom:"1px solid #1A1A1E"}}><input value={r.date} onChange={function(e){uRateEntry(r.id,"date",e.target.value);}} style={Object.assign({},_gh,{color:"#888",width:80})}/></td>
                        <td style={{padding:"3px 4px",borderBottom:"1px solid #1A1A1E"}}><input type="number" value={r.oldRate} onChange={function(e){uRateEntry(r.id,"oldRate",e.target.value);}} style={Object.assign({},_gh,_mn,{width:60,textAlign:"right",color:"#888"})}/></td>
                        <td style={{padding:"3px 4px",borderBottom:"1px solid #1A1A1E"}}><input type="number" value={r.newRate} onChange={function(e){uRateEntry(r.id,"newRate",e.target.value);}} style={Object.assign({},_gh,_mn,{width:60,textAlign:"right",color:up?RD:GN})}/></td>
                        <td style={Object.assign({},{padding:"6px 8px",borderBottom:"1px solid #1A1A1E",fontSize:11,fontWeight:600,color:up?RD:GN},_mn)}>{change>0?"+":""}{change}%</td>
                        <td style={{padding:"3px 4px",borderBottom:"1px solid #1A1A1E"}}><input value={r.remark} onChange={function(e){uRateEntry(r.id,"remark",e.target.value);}} placeholder="Market trend..." style={Object.assign({},_gh,{color:"#888"})}/></td>
                        <td style={{padding:"3px",borderBottom:"1px solid #1A1A1E"}}><button onClick={function(){rmRateEntry(r.id);}} style={{background:"transparent",border:"none",color:"#3A3A44",cursor:"pointer",fontSize:10}}>x</button></td>
                      </tr>
                    );
                  })}</tbody>
                </table>
                {proj.rateHistory.length===0&&(<div style={{color:DM,fontSize:12,padding:16,textAlign:"center"}}>No revisions recorded. Click + Add Revision when rates change.</div>)}
              </Cd>
            </div>)}

            {/* ═══ TIER 3: PHOTO RECORDS ═══ */}
            {wsTab==="photos"&&(<div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:16,fontWeight:700,color:G}}>Photo Records</div>
                <Bt onClick={addPhoto}>+ Add Photo Entry</Bt>
              </div>
              <Cd>
                <div style={{fontSize:11,color:DM,marginBottom:10}}>Stage-wise photo log with dates, descriptions, and GPS location. Architect approves before upload.</div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr>{["Stage","Date","Description","GPS Location","Approved",""].map(function(h){return(<th key={h} style={{textAlign:"left",padding:"7px 8px",fontSize:9,color:DM,textTransform:"uppercase",borderBottom:"1px solid "+BD}}>{h}</th>);})}</tr></thead>
                  <tbody>{proj.photos.map(function(p){
                    return(
                      <tr key={p.id} style={{background:p.approved?"rgba(93,175,106,0.03)":"transparent"}}>
                        <td style={{padding:"3px 4px",borderBottom:"1px solid #1A1A1E"}}><select value={p.stage} onChange={function(e){uPhoto(p.id,"stage",e.target.value);}} style={Object.assign({},_inp,{fontSize:11,padding:"4px 6px",width:110})}>{MONITOR_STAGES.map(function(s){return(<option key={s.id} value={s.l}>{s.l}</option>);})}</select></td>
                        <td style={{padding:"3px 4px",borderBottom:"1px solid #1A1A1E"}}><input value={p.date} onChange={function(e){uPhoto(p.id,"date",e.target.value);}} style={Object.assign({},_gh,{color:"#888",width:80})}/></td>
                        <td style={{padding:"3px 4px",borderBottom:"1px solid #1A1A1E"}}><input value={p.desc} onChange={function(e){uPhoto(p.id,"desc",e.target.value);}} placeholder="e.g. Footing reinforcement" style={Object.assign({},_gh,{color:"#CCC"})}/></td>
                        <td style={{padding:"3px 4px",borderBottom:"1px solid #1A1A1E"}}><input value={p.gps} onChange={function(e){uPhoto(p.id,"gps",e.target.value);}} placeholder="Lat, Lng (optional)" style={Object.assign({},_gh,{color:"#666",width:120})}/></td>
                        <td style={{padding:"6px 8px",borderBottom:"1px solid #1A1A1E"}}>
                          <div onClick={function(){uPhoto(p.id,"approved",!p.approved);}} style={{width:20,height:20,borderRadius:4,border:"2px solid "+(p.approved?GN:BD),background:p.approved?GN:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12,color:"#111",fontWeight:700}}>{p.approved?"\u2713":""}</div>
                        </td>
                        <td style={{padding:"3px",borderBottom:"1px solid #1A1A1E"}}><button onClick={function(){rmPhoto(p.id);}} style={{background:"transparent",border:"none",color:"#3A3A44",cursor:"pointer",fontSize:10}}>x</button></td>
                      </tr>
                    );
                  })}</tbody>
                </table>
                {proj.photos.length===0&&(<div style={{color:DM,fontSize:12,padding:16,textAlign:"center"}}>No photos recorded. Click + Add Photo Entry.</div>)}
              </Cd>
              {proj.photos.length>0&&(
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  <Stat label="Total Photos" value={String(proj.photos.length)} color={BL}/>
                  <Stat label="Approved" value={String(proj.photos.filter(function(p){return p.approved;}).length)} color={GN}/>
                  <Stat label="Pending Approval" value={String(proj.photos.filter(function(p){return!p.approved;}).length)} color={AM}/>
                </div>
         )}
     {screen==="plumbing"&&(
          <div style={{padding:"8px 22px",borderBottom:"1px solid "+BD,display:"flex",alignItems:"center",gap:10}}>
            <Bt sx={{fontSize:11}} onClick={()=>setScreen("dashboard")}
            <span style={{fontSize:11,color:"#444"}}>Plumbing Engine – i3d Studio</span>
          </div>
          <PlumbingEngine/>
        </div>
      )} 
         <div style={{textAlign:"center",padding:"14px 0 6px",color:"#1A1A24",fontSize:9}}>i3d Studio - Construction Management System v3.0 - Coimbatore</div>
    </div>
  );
}
