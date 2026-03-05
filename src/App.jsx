import { useState, useMemo, useRef } from "react";

// ─── DATA ───
const WI=[
  {id:"EW01",cat:"Earthwork",desc:"Earthwork Excavation (JCB/Manual)",unit:"CFT",rate:18,src:"Sivadas"},
  {id:"EW02",cat:"Earthwork",desc:"Gravel Filling (watered & rammed)",unit:"CFT",rate:2,src:"SNGC"},
  {id:"EW03",cat:"Earthwork",desc:"Basement Gravel Filling",unit:"CFT",rate:25,src:"Sivadas"},
  {id:"EW04",cat:"Earthwork",desc:"Anti-Termite Treatment",unit:"SFT",rate:5,src:"Gen.Spec"},
  {id:"PCC01",cat:"PCC",desc:"P.C.C (1:4:8) M.7.5 Grade",unit:"SFT",rate:40,src:"SNGC"},
  {id:"PCC02",cat:"PCC",desc:"P.C.C (1:5:10) M.7.5 Grade",unit:"CFT",rate:200,src:"Sivadas"},
  {id:"PCC03",cat:"PCC",desc:"P.C.C M.15 (1:2:4) Flooring",unit:"SFT",rate:35,src:"SNGC"},
  {id:"PCC04",cat:"PCC",desc:"Sill Concrete 3in TK (M.15)",unit:"CFT",rate:375,src:"Sivadas"},
  {id:"RCC01",cat:"RCC",desc:"Column Footing (M.20) 1:1.5:3",unit:"SFT",rate:45,src:"SNGC"},
  {id:"RCC02",cat:"RCC",desc:"Column Footing RCC (M.15)",unit:"CFT",rate:220,src:"Sivadas"},
  {id:"RCC03",cat:"RCC",desc:"Columns M.25 : 1:1:2 Mix",unit:"RFT",rate:65,src:"SNGC"},
  {id:"RCC04",cat:"RCC",desc:"Column (M.20 Grade)",unit:"CFT",rate:400,src:"Sivadas"},
  {id:"RCC05",cat:"RCC",desc:"Plinth Beam (M.25) 1:1:2",unit:"RFT",rate:70,src:"SNGC"},
  {id:"RCC06",cat:"RCC",desc:"Plinth Beam (M.25 Grade)",unit:"CFT",rate:450,src:"Sivadas"},
  {id:"RCC07",cat:"RCC",desc:"Roof Beam/Lintel M.25:1:1:2",unit:"RFT",rate:75,src:"SNGC"},
  {id:"RCC08",cat:"RCC",desc:"Roof Slab 4.5in TK (M.25)",unit:"SFT",rate:75,src:"SNGC"},
  {id:"RCC09",cat:"RCC",desc:"RCC Slab 5in TK (M.20)",unit:"CFT",rate:475,src:"Sivadas"},
  {id:"RCC10",cat:"RCC",desc:"Staircase Slab M.25:1:1:2",unit:"SFT",rate:75,src:"SNGC"},
  {id:"RCC11",cat:"RCC",desc:"Lintel (Continuous) M.20",unit:"CFT",rate:400,src:"Sivadas"},
  {id:"RCC12",cat:"RCC",desc:"Steps Concrete (M.20)",unit:"CFT",rate:75,src:"SNGC"},
  {id:"RMC01",cat:"RMC",desc:"RMC M.15 Grade",unit:"CU.M",rate:4000,src:"KVPDR"},
  {id:"RMC02",cat:"RMC",desc:"RMC M.20 Grade",unit:"CU.M",rate:4300,src:"KVPDR"},
  {id:"RMC03",cat:"RMC",desc:"RMC M.25 Grade",unit:"CU.M",rate:4600,src:"KVPDR"},
  {id:"MSN01",cat:"Masonry",desc:"Brick Work CM 1:6 (Foundation)",unit:"CFT",rate:40,src:"SNGC"},
  {id:"MSN02",cat:"Masonry",desc:"Brick Work CM 1:5 (Super)",unit:"SFT",rate:40,src:"SNGC"},
  {id:"MSN03",cat:"Masonry",desc:"9in Brick Work CM 1:5",unit:"CFT",rate:200,src:"Sivadas"},
  {id:"MSN04",cat:"Masonry",desc:"R.R. Masonry (Rubble)",unit:"CFT",rate:60,src:"Compound"},
  {id:"PLT01",cat:"Plastering",desc:"Ceiling Plaster CM 1:3",unit:"SFT",rate:55,src:"Sivadas"},
  {id:"PLT02",cat:"Plastering",desc:"Inside Walls CM 1:5",unit:"SFT",rate:50,src:"Sivadas"},
  {id:"PLT03",cat:"Plastering",desc:"Outside Walls CM 1:5",unit:"SFT",rate:50,src:"Sivadas"},
  {id:"PLT04",cat:"Plastering",desc:"Plastering (Combined)",unit:"SFT",rate:25,src:"SNGC"},
  {id:"PNT01",cat:"Painting",desc:"Interior Putty+Primer+Emulsion",unit:"SFT",rate:40,src:"Sivadas"},
  {id:"PNT02",cat:"Painting",desc:"Exterior WC+Primer+Emulsion",unit:"SFT",rate:35,src:"Sivadas"},
  {id:"PNT03",cat:"Painting",desc:"Enamel Paint Doors/Windows",unit:"SFT",rate:40,src:"Sivadas"},
  {id:"FLR01",cat:"Flooring",desc:"Vitrified Tile 24x24",unit:"SFT",rate:120,src:"Sivadas"},
  {id:"FLR02",cat:"Flooring",desc:"Vitrified Tile Labour+Mat",unit:"SFT",rate:55,src:"Shamseer"},
  {id:"FLR03",cat:"Flooring",desc:"Granite Flooring 18mm",unit:"SFT",rate:275,src:"Sivadas"},
  {id:"FLR04",cat:"Flooring",desc:"Weathering Course Terrace",unit:"SFT",rate:60,src:"Sivadas"},
  {id:"TIL01",cat:"Tile Work",desc:"Glazed Wall Tiles above 7ft",unit:"SFT",rate:35,src:"Shamseer"},
  {id:"TIL02",cat:"Tile Work",desc:"Glazed Wall Tiles upto 7ft",unit:"SFT",rate:25,src:"Shamseer"},
  {id:"TIL03",cat:"Tile Work",desc:"Glazed Tiles Toilet/Kitchen",unit:"SFT",rate:90,src:"Sivadas"},
  {id:"FC01",cat:"False Ceiling",desc:"Gypsum Plain False Ceiling",unit:"SFT",rate:65,src:"Shamseer"},
  {id:"JNR01",cat:"Joinery",desc:"Main Door Teak Frame+Shutter",unit:"SFT",rate:1300,src:"Sivadas"},
  {id:"JNR02",cat:"Joinery",desc:"Internal Door Sal+Flush",unit:"SFT",rate:650,src:"Sivadas"},
  {id:"JNR03",cat:"Joinery",desc:"Window UPVC+Glass",unit:"SFT",rate:600,src:"Gen.Spec"},
  {id:"GRL01",cat:"Metalwork",desc:"Window Grill 12mm Sq Rod",unit:"SFT",rate:175,src:"Sivadas"},
  {id:"GRL02",cat:"Metalwork",desc:"Staircase Railing SS 304",unit:"RFT",rate:750,src:"Sivadas"},
  {id:"GRL03",cat:"Metalwork",desc:"Balcony Handrail PC MS",unit:"RFT",rate:400,src:"Gen.Spec"},
  {id:"MEP01",cat:"Electrical",desc:"Electrical Wiring per point",unit:"NOS",rate:1200,src:"Gen.Spec"},
  {id:"MEP02",cat:"Plumbing",desc:"Plumbing per point",unit:"NOS",rate:1500,src:"Gen.Spec"},
  {id:"TNK01",cat:"Tanks",desc:"Underground Sump RCC",unit:"LTR",rate:8,src:"Sivadas"},
  {id:"TNK02",cat:"Tanks",desc:"Septic Tank Brick+RCC",unit:"LTR",rate:6,src:"Sivadas"},
  {id:"ELV01",cat:"Elevation",desc:"ACP Cladding Works",unit:"SFT",rate:250,src:"MPP"},
];
const UN=["SFT","RFT","CFT","CU.M","NOS","KG","MT","RM","LTR","LS","BAG"];
const RT={
  modest:{label:"Modest Residential (G+1)",cement:0.4,msand:0.45,psand:0.12,jelly:0.7,steel:3.5,bricks:8,gravel:1.0},
  premium:{label:"Premium Residential (G+2)",cement:0.5,msand:0.55,psand:0.15,jelly:0.85,steel:4.5,bricks:10,gravel:1.2},
  commercial:{label:"Commercial/Institutional",cement:0.55,msand:0.5,psand:0.14,jelly:0.9,steel:5.0,bricks:12,gravel:1.1},
  industrial:{label:"Industrial/Warehouse",cement:0.35,msand:0.4,psand:0.1,jelly:0.6,steel:6.0,bricks:6,gravel:0.8},
};
const SNGC_L=[
  {s:1,d:"PCC Columns (1:4:8) M.7.5",q:128,u:"SFT",r:40,a:5120},{s:2,d:"Column Footing M.20",q:128,u:"SFT",r:45,a:5760},
  {s:3,d:"Columns M.25 (Bsmnt)",q:28,u:"RFT",r:65,a:1820},{s:4,d:"Brick Work Plinth Base",q:145,u:"RFT",r:40,a:5800},
  {s:5,d:"Plinth Beam M.25",q:215,u:"RFT",r:70,a:15050},{s:6,d:"Brick Work Basement",q:181.25,u:"CFT",r:40,a:7250},
  {s:7,d:"Gravel Filling",q:1185.75,u:"CFT",r:2,a:2371.5},{s:8,d:"PCC M.15 (1:2:4)",q:527,u:"SFT",r:35,a:18445},
  {s:9,d:"Columns M.25 (GF)",q:142,u:"RFT",r:65,a:9230},{s:10,d:"Brick Work Super 1:5",q:1210,u:"SFT",r:40,a:48400},
  {s:11,d:"Roof Lintel M.25",q:55,u:"RFT",r:75,a:4125},{s:12,d:"Staircase Slab M.25",q:128,u:"SFT",r:75,a:9600},
  {s:13,d:"Plastering All",q:2455.5,u:"SFT",r:25,a:61387.5},{s:14,d:"Steps Concrete M.20",q:128,u:"CFT",r:75,a:9600},
];
const SCH_INIT=[
  {id:1,n:"SIVADAS RESIDENCE",d:40,l:0,s:"22-Feb",f:"14-Apr",p:""},
  {id:2,n:"Plumbing",d:38,l:1,s:"22-Feb",f:"12-Apr",p:""},{id:3,n:"Outer Pipe Laying",d:1,l:2,s:"22-Feb",f:"22-Feb",p:""},{id:4,n:"Overhead Tank",d:3,l:2,s:"30-Mar",f:"01-Apr",p:""},{id:5,n:"Sanitary Fitting",d:6,l:2,s:"06-Apr",f:"12-Apr",p:""},
  {id:6,n:"Masonry Works",d:8,l:1,s:"23-Feb",f:"04-Mar",p:"3>FS"},{id:7,n:"Chambers",d:2,l:2,s:"23-Feb",f:"24-Feb",p:""},{id:8,n:"Sump Cover",d:3,l:2,s:"25-Feb",f:"01-Mar",p:""},{id:9,n:"Flooring Concrete",d:1,l:2,s:"01-Mar",f:"01-Mar",p:""},{id:10,n:"North Comp Wall",d:3,l:2,s:"02-Mar",f:"04-Mar",p:""},
  {id:11,n:"Carpentry Works",d:29,l:1,s:"01-Mar",f:"07-Apr",p:""},{id:12,n:"Window Shutters",d:10,l:2,s:"01-Mar",f:"12-Mar",p:""},{id:13,n:"Main Door Works",d:10,l:2,s:"11-Mar",f:"24-Mar",p:""},{id:14,n:"Inner Door Works",d:9,l:2,s:"29-Mar",f:"07-Apr",p:""},{id:15,n:"Kitchen Slab/Loft",d:4,l:2,s:"15-Mar",f:"18-Mar",p:""},
  {id:16,n:"Painting Works",d:21,l:1,s:"09-Mar",f:"05-Apr",p:"11>FS"},{id:17,n:"Doors/Joineries",d:5,l:2,s:"09-Mar",f:"15-Mar",p:""},{id:18,n:"Grills",d:3,l:2,s:"15-Mar",f:"17-Mar",p:""},{id:19,n:"Outside Painting",d:5,l:2,s:"23-Mar",f:"29-Mar",p:""},{id:20,n:"Inside Painting",d:7,l:2,s:"29-Mar",f:"05-Apr",p:""},
  {id:21,n:"Grill Works",d:16,l:1,s:"24-Feb",f:"17-Mar",p:""},{id:22,n:"Outside Ladder",d:5,l:2,s:"24-Feb",f:"02-Mar",p:""},{id:23,n:"Safety Doors",d:5,l:2,s:"25-Feb",f:"03-Mar",p:""},{id:24,n:"Elevation Rails",d:5,l:2,s:"11-Mar",f:"17-Mar",p:""},
  {id:25,n:"Tiling Works",d:38,l:1,s:"22-Feb",f:"12-Apr",p:"21>FS"},{id:26,n:"Terrace Flooring",d:4,l:2,s:"22-Feb",f:"25-Feb",p:""},{id:27,n:"Toilet Walls",d:5,l:2,s:"25-Feb",f:"03-Mar",p:""},{id:28,n:"Toilet Flooring",d:5,l:2,s:"03-Mar",f:"09-Mar",p:""},{id:29,n:"Flooring Tiles",d:30,l:2,s:"04-Mar",f:"12-Apr",p:""},
  {id:30,n:"Electrical",d:22,l:1,s:"08-Mar",f:"05-Apr",p:""},{id:31,n:"Wiring",d:10,l:2,s:"08-Mar",f:"19-Mar",p:""},{id:32,n:"Switches",d:5,l:2,s:"24-Mar",f:"31-Mar",p:""},{id:33,n:"Service Conn.",d:5,l:2,s:"31-Mar",f:"05-Apr",p:""},
  {id:34,n:"Elevation",d:4,l:1,s:"22-Feb",f:"25-Feb",p:""},{id:35,n:"ACP Works",d:3,l:2,s:"22-Feb",f:"24-Feb",p:""},{id:36,n:"Pergola",d:4,l:2,s:"22-Feb",f:"25-Feb",p:""},
  {id:37,n:"Cleaning",d:2,l:1,s:"13-Apr",f:"14-Apr",p:"29>FS"},{id:38,n:"Cleaning/Washing",d:2,l:2,s:"13-Apr",f:"14-Apr",p:""},
  {id:39,n:"Closing",d:0,l:1,s:"14-Apr",f:"14-Apr",p:"37>FS"},
];
const CLS=[
  {n:1,t:"Scope",s:"Execute per plans/specs; no subletting without written permission."},
  {n:2,t:"Contractor Duty",s:"Centering, scaffolding, staging, timbering, lighting at own cost."},
  {n:3,t:"Debris",s:"Clear all surplus; deliver building clean and water-tight."},
  {n:4,t:"Site Office",s:"Client provides space; contractor builds temp office at own cost."},
  {n:5,t:"Water/Power",s:"Free at one point. Contractor arranges pumps/tankers."},
  {n:6,t:"Time",s:"Time is essence. Fortnightly progress report with stock figures."},
  {n:7,t:"Equipment",s:"Contractor arranges mixers, vibrators, hoists, scaffolding."},
  {n:8,t:"Taxes",s:"Service tax by Client. All other taxes by Contractor."},
  {n:9,t:"Payment",s:"Per SFT rates. Weekly running advance. 1yr defect liability."},
  {n:10,t:"Labour",s:"ESI, PF, Wages Act compliance. No child labour."},
  {n:11,t:"Materials",s:"All-inclusive rates. Escalation within limits by contractor."},
  {n:12,t:"Safety",s:"First aid, drinking water, shelters at site."},
  {n:13,t:"Insurance",s:"Contractor insures against fire, injury, property damage."},
  {n:14,t:"Indemnity",s:"Contractor indemnifies Client against all claims."},
  {n:15,t:"LD",s:"1.5% per week delay (max 3 weeks), then termination."},
  {n:16,t:"Bad Work",s:"Rectify at contractor cost; Client may deduct from bills."},
  {n:17,t:"Arbitration",s:"Coimbatore jurisdiction. CREDAI. Indian Arbitration Act."},
  {n:18,t:"Force Majeure",s:"Extension for strikes, riots, war, flood. Written agreement."},
  {n:19,t:"Misc",s:"Fire safety. Peaceful progress. No child/women night labour."},
];
const SPC=[
  {t:"Earthwork",s:"Excavation max 8ft GL. Vertical only. Gravel watered and rammed."},
  {t:"Anti-Termite",s:"Pre-construction in four stages per standard specs."},
  {t:"PCC",s:"1:5:10 foundation 40mm metal. 1:4:8 flooring. 4in TK machine mixed."},
  {t:"Shuttering",s:"Steel/country wood. Plywood centering. Props 600mm c/c. Bracing both ways."},
  {t:"Barbending",s:"Min 50d lap. Hooks per IS:5525. 18 gauge binding wire."},
  {t:"RCC",s:"M20/M25 or RMC. 20mm blue granite. Dr.Fixit LW+. Needle vibrator."},
  {t:"Brick Masonry",s:"CM 1:6. Wire-cut soaked 24hrs. Max 750mm/day. Above lintel from outside."},
  {t:"Plastering",s:"Ceiling CM 1:3 12mm. Inside CM 1:5 15mm. Outside CM 1:5 18mm."},
  {t:"Painting",s:"Interior: 3 putty+primer+2 emulsion. Exterior: WC+primer+2 Apex Ultima."},
  {t:"Woodwork",s:"Main: Kerala Teak 3000/cft 6x3. Room: Sal 1600/cft. Windows: UPVC."},
  {t:"Tile Work",s:"Rooms vitrified 65/sft. Toilet antiskid 35. Kitchen granite 120."},
  {t:"Electrical",s:"Concealed. Finolex/Kundan. Legrand switches 35/no. Panels provided."},
  {t:"Plumbing",s:"Concealed inside, open outside. Astral CPVC. Jaquar CP. Hindware."},
  {t:"Handrails",s:"Staircase SS 304. Balcony powder coated MS."},
  {t:"Terrace",s:"Baby jelly concrete 1:3:6. 9in parapet 3ft6in. Terracotta tiles."},
  {t:"Tanks",s:"UG Sump 2x20000L. Septic 15000L. RCC+brick composite. Waterproofing."},
];

// ─── UTILS ───
const fmt=n=>{if(!n||isNaN(n))return "0";if(n>=1e7)return (n/1e7).toFixed(2)+" Cr";if(n>=1e5)return (n/1e5).toFixed(2)+" L";return Math.round(n).toLocaleString("en-IN");};
const fN=(n,d)=>(!n||isNaN(n))?"0":Number(n).toLocaleString("en-IN",{maximumFractionDigits:d||0});
const G="#D4A853";
const CL={bg:"#0C0C0F",cd:"#141418",bd:"#1F1F26",dm:"#4A4A55",tx:"#DDDDE0",bl:"#6B9BD2",gn:"#6BAF7B",rd:"#C86868",pu:"#A87BB0",am:"#C89560"};

// ═══ APP ═══
export default function App(){
  const [tab,setTab]=useState("agreement");
  const ctr=useRef(500);
  const nx=()=>++ctr.current;

  // Agreement
  const [ag,sAg]=useState({date:"",cn:"",ca:"",cr:"",xn:"",xa:"",xr:"",af:"i3d Studio",aa:"Coimbatore",pd:"Residential building",sf:"",ts:"",sm:"",mo:"15",gr:"700",tr:"1325",ga:"",ta:"",tf:"4",ma:"",rt:"",bl:"",cl:"",rl:"",sl:""});
  const uA=(k,v)=>sAg(p=>({...p,[k]:v}));

  // Library (early - used by estimate)
  const [lib,sLib]=useState(()=>WI.map(x=>({...x})));
  const uLib=(id,f,v)=>sLib(p=>p.map(x=>x.id===id?{...x,[f]:f==="rate"?parseFloat(v)||0:v}:x));
  const [lc,sLc]=useState("All");
  const [lq,sLq]=useState("");
  const lCats=useMemo(()=>[...new Set(lib.map(x=>x.cat))],[lib]);
  const lFilt=useMemo(()=>lib.filter(x=>(lc==="All"||x.cat===lc)&&(!lq||x.desc.toLowerCase().includes(lq.toLowerCase()))),[lc,lq,lib]);
  const [lSub,sLSub]=useState("items");

  // Estimate
  const [pn,sPn]=useState("");
  const [stg,sStg]=useState([{id:1,nm:"Stage 1",it:[{id:2,ds:"",qt:"",un:"SFT",rt:"",rf:""}]}]);
  const [esc,sEsc]=useState(2);
  const aStg=()=>sStg(p=>[...p,{id:nx(),nm:"Stage "+(p.length+1),it:[{id:nx(),ds:"",qt:"",un:"SFT",rt:"",rf:""}]}]);
  const rStg=sid=>sStg(p=>p.length>1?p.filter(s=>s.id!==sid):p);
  const aIt=sid=>sStg(p=>p.map(s=>s.id===sid?{...s,it:[...s.it,{id:nx(),ds:"",qt:"",un:"SFT",rt:"",rf:""}]}:s));
  const rIt=(sid,iid)=>sStg(p=>p.map(s=>s.id===sid?{...s,it:s.it.filter(i=>i.id!==iid)}:s));
  const uIt=(sid,iid,f,v)=>sStg(p=>p.map(s=>s.id===sid?{...s,it:s.it.map(i=>{
    if(i.id!==iid) return i;
    const o={...i,[f]:v};
    if(f==="ds"){const m=lib.find(x=>x.desc===v);if(m){o.un=m.unit;o.rt=m.rate;o.rf=m.id;}}
    return o;
  })}:s));
  const uSN=(sid,n)=>sStg(p=>p.map(s=>s.id===sid?{...s,nm:n}:s));
  const ldSNGC=()=>{sPn("Gateway - SNGC, Chavadi");sStg([{id:1,nm:"Foundation & GF",it:SNGC_L.map((x,i)=>({id:300+i,ds:x.d,qt:x.q,un:x.u,rt:x.r,rf:""}))}]);};
  const tots=useMemo(()=>{let g=0;const s=stg.map(s=>{let t=0;s.it.forEach(i=>{t+=(parseFloat(i.qt)||0)*(parseFloat(i.rt)||0);});g+=t;return{id:s.id,t};});return{s,g};},[stg]);

  // Abstract
  const [abT,sAbT]=useState("modest");
  const [abA,sAbA]=useState(1000);
  const [abF,sAbF]=useState(1);
  const [mr,sMr]=useState({cement:400,msand:2.5,psand:3,jelly:3.5,steel:65,bricks:12,gravel:2,rmc15:4000,rmc20:4300,rmc25:4600});
  const abE=useMemo(()=>{
    const r=RT[abT]; const a=abA*abF;
    const m=[
      {l:"Cement",q:r.cement*a,u:"bags",c:r.cement*a*mr.cement,cl:CL.bl},
      {l:"M.Sand",q:r.msand*a,u:"CFT",c:r.msand*a*mr.msand,cl:G},
      {l:"P.Sand",q:r.psand*a,u:"CFT",c:r.psand*a*mr.psand,cl:CL.am},
      {l:"Jelly",q:r.jelly*a,u:"CFT",c:r.jelly*a*mr.jelly,cl:CL.gn},
      {l:"Steel",q:r.steel*a,u:"Kg",c:r.steel*a*mr.steel,cl:CL.pu},
      {l:"Bricks",q:r.bricks*a,u:"Nos",c:r.bricks*a*mr.bricks,cl:CL.rd},
      {l:"Gravel",q:r.gravel*a,u:"CFT",c:r.gravel*a*mr.gravel,cl:"#8A8A6A"},
    ];
    return{a,m,t:m.reduce((s,x)=>s+x.c,0)};
  },[abT,abA,abF,mr]);

  // Payment
  const [pay,sPay]=useState([
    {id:1,st:"Advance",wk:"-",am:700000,ss:"Pending"},{id:2,st:"Basement Works",wk:"3",am:400000,ss:"Pending"},
    {id:3,st:"Column GF Brickworks",wk:"3",am:400000,ss:"Pending"},{id:4,st:"RCC Ground Floor",wk:"3",am:450000,ss:"Pending"},
    {id:5,st:"Column FF Brickworks",wk:"3",am:400000,ss:"Pending"},{id:6,st:"RCC First Floor",wk:"3",am:450000,ss:"Pending"},
    {id:7,st:"Wood/Grill Work",wk:"3",am:450000,ss:"Pending"},{id:8,st:"Plastering Works",wk:"3",am:400000,ss:"Pending"},
    {id:9,st:"Elevation/Finishing",wk:"3",am:250000,ss:"Pending"},
  ]);
  const uPy=(id,f,v)=>sPay(p=>p.map(x=>x.id===id?{...x,[f]:v}:x));
  const aPy=()=>sPay(p=>[...p,{id:nx(),st:"New Stage",wk:"3",am:0,ss:"Pending"}]);
  const rPy=id=>sPay(p=>p.filter(x=>x.id!==id));
  const pyT=pay.reduce((s,x)=>s+x.am,0);
  const pyP=pay.filter(x=>x.ss==="Paid").reduce((s,x)=>s+x.am,0);
  const pyO=pay.filter(x=>x.ss==="Overdue");
  const [lk,sLk]=useState(false);
  const [lkM,sLkM]=useState("Work paused due to pending payment. Contact i3d Studio.");

  // Schedule
  const [sch,sSch]=useState(()=>SCH_INIT.map(x=>({...x})));
  const [schT,sSchT]=useState("Sivadas Residence - Finishing Phase (Sample)");
  const uTk=(id,f,v)=>sSch(p=>p.map(x=>x.id===id?{...x,[f]:v}:x));
  const aTk=()=>{const nid=Math.max(0,...sch.map(x=>x.id))+1;sSch(p=>[...p,{id:nid,n:"New Task",d:5,l:2,s:"",f:"",p:""}]);};
  const aGr=()=>{const nid=Math.max(0,...sch.map(x=>x.id))+1;sSch(p=>[...p,{id:nid,n:"New Group",d:0,l:1,s:"",f:"",p:""}]);};
  const rTk=id=>sSch(p=>p.filter(x=>x.id!==id));
  const schMx=useMemo(()=>Math.max(1,...sch.map(x=>x.d)),[sch]);

  // Styles
  const inp={width:"100%",padding:"8px 10px",background:"#0F0F13",border:"1px solid "+CL.bd,borderRadius:6,color:CL.tx,fontSize:13,outline:"none",boxSizing:"border-box"};
  const gh={...inp,border:"none",background:"transparent",padding:"2px 4px"};
  const sel={padding:"8px 10px",background:"#0F0F13",border:"1px solid "+CL.bd,borderRadius:6,color:CL.tx,fontSize:13,outline:"none",cursor:"pointer"};
  const lb={display:"block",fontSize:10,color:CL.dm,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.6px"};
  const mn={fontFamily:"Consolas,monospace"};
  const th={textAlign:"left",padding:"7px 10px",fontSize:10,color:CL.dm,textTransform:"uppercase",letterSpacing:"0.5px",fontWeight:600,borderBottom:"1px solid "+CL.bd};
  const td={padding:"6px 10px",fontSize:13,borderBottom:"1px solid #1A1A1E"};

  const Cd=({children,gold,s:sx})=><div style={{background:gold?"linear-gradient(135deg,rgba(212,168,83,0.07),rgba(170,130,40,0.02))":CL.cd,borderRadius:10,border:"1px solid "+(gold?"rgba(212,168,83,0.22)":CL.bd),padding:18,marginBottom:12,...sx}}>{children}</div>;
  const Bt=({children,gold,danger,onClick,s:sx})=><button onClick={onClick} style={{padding:"7px 14px",background:gold?"linear-gradient(135deg,#D4A853,#A67C2E)":danger?"rgba(200,60,60,0.1)":"rgba(212,168,83,0.1)",border:gold?"none":danger?"1px solid rgba(200,60,60,0.25)":"1px solid rgba(212,168,83,0.25)",borderRadius:6,color:gold?"#111":danger?CL.rd:G,fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",...sx}}>{children}</button>;
  const Fl=({label,k,wide,area})=><div style={{flex:wide?2:1,minWidth:wide?220:130}}><label style={lb}>{label}</label>{area?<textarea rows={2} style={{...inp,resize:"vertical"}} value={ag[k]} onChange={e=>uA(k,e.target.value)}/>:<input style={inp} value={ag[k]} onChange={e=>uA(k,e.target.value)}/>}</div>;

  const TBS=[{id:"agreement",l:"Agreement & Specs"},{id:"estimate",l:"Detailed Estimate"},{id:"abstract",l:"Abstract Estimate"},{id:"payment",l:"Payment Schedule"},{id:"schedule",l:"Project Schedule"},{id:"library",l:"Library & Reference"}];

  // ── RENDER HELPERS (no inline returns) ──
  function renderStageItem(stage, item, idx){
    const amt=(parseFloat(item.qt)||0)*(parseFloat(item.rt)||0);
    const ml=lib.find(x=>x.desc===item.ds);
    const rf=item.rf||(ml&&ml.id)||"";
    return (
      <div key={item.id} style={{display:"grid",gridTemplateColumns:"28px 1fr 72px 54px 66px 80px 50px 24px",gap:4,marginBottom:2,alignItems:"center"}}>
        <span style={{...mn,color:"#3A3A44",fontSize:11}}>{idx+1}</span>
        <div>
          <input type="text" value={item.ds} onChange={e=>uIt(stage.id,item.id,"ds",e.target.value)} list={"dl"+stage.id+"_"+item.id} placeholder="Type or pick..." style={inp}/>
          <datalist id={"dl"+stage.id+"_"+item.id}>{lib.map(x=><option key={x.id} value={x.desc}/>)}</datalist>
        </div>
        <input type="number" value={item.qt} onChange={e=>uIt(stage.id,item.id,"qt",e.target.value)} style={{...inp,textAlign:"right",...mn}}/>
        <select value={item.un} onChange={e=>uIt(stage.id,item.id,"un",e.target.value)} style={sel}>{UN.map(u=><option key={u}>{u}</option>)}</select>
        <input type="number" value={item.rt} onChange={e=>uIt(stage.id,item.id,"rt",e.target.value)} style={{...inp,textAlign:"right",...mn}}/>
        <span style={{...mn,color:amt>0?G:"#2A2A30",fontSize:12,textAlign:"right"}}>{amt>0?fmt(amt):"\u2014"}</span>
        <span style={{fontSize:9,color:rf?CL.bl:"#2A2A30",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={rf?rf+" ("+(ml&&ml.src||"")+")":""}>{rf||"\u2014"}</span>
        <button onClick={()=>rIt(stage.id,item.id)} style={{background:"transparent",border:"none",color:"#3A3A44",cursor:"pointer",fontSize:11}}>x</button>
      </div>
    );
  }

  function renderStage(stage){
    const st=tots.s.find(x=>x.id===stage.id);
    return (
      <Cd key={stage.id}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <input type="text" value={stage.nm} onChange={e=>uSN(stage.id,e.target.value)} style={{background:"transparent",border:"none",color:G,fontSize:14,fontWeight:700,outline:"none",width:"50%"}}/>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <span style={{...mn,color:"#888",fontSize:13}}>{fmt(st&&st.t||0)}</span>
            {stg.length>1 && <Bt danger onClick={()=>rStg(stage.id)} s={{padding:"4px 8px",fontSize:10}}>x</Bt>}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"28px 1fr 72px 54px 66px 80px 50px 24px",gap:4,marginBottom:4}}>
          {["#","Description","Qty","Unit","Rate","Amount","Ref",""].map(h=><span key={h} style={{fontSize:9,color:"#3A3A44",textTransform:"uppercase"}}>{h}</span>)}
        </div>
        {stage.it.map((item,idx)=>renderStageItem(stage,item,idx))}
        <button onClick={()=>aIt(stage.id)} style={{marginTop:6,padding:5,background:"rgba(212,168,83,0.03)",border:"1px dashed #252530",borderRadius:5,color:"#444",fontSize:11,cursor:"pointer",width:"100%"}}>+ Add Work Item</button>
      </Cd>
    );
  }

  function renderPayRow(p,i,cum){
    const pct=pyT>0?(p.am/pyT)*100:0;
    return (
      <tr key={p.id} style={{background:p.ss==="Overdue"?"rgba(200,60,60,0.03)":"transparent"}}>
        <td style={{...td,...mn,color:CL.dm}}>{i+1}</td>
        <td style={td}><input value={p.st} onChange={e=>uPy(p.id,"st",e.target.value)} style={{...gh,color:"#CCC"}}/></td>
        <td style={td}><input value={p.wk} onChange={e=>uPy(p.id,"wk",e.target.value)} style={{...gh,...mn,width:40,textAlign:"center",color:"#888"}}/></td>
        <td style={td}><input type="number" value={p.am} onChange={e=>uPy(p.id,"am",parseFloat(e.target.value)||0)} style={{...gh,...mn,width:90,textAlign:"right",color:CL.bl}}/></td>
        <td style={{...td,...mn,textAlign:"right",color:"#888"}}>{pct.toFixed(1)}%</td>
        <td style={{...td,...mn,textAlign:"right",color:G}}>{cum.toFixed(1)}%</td>
        <td style={td}><select value={p.ss} onChange={e=>uPy(p.id,"ss",e.target.value)} style={{...sel,fontSize:11,padding:"3px 5px",color:p.ss==="Paid"?CL.gn:p.ss==="Overdue"?CL.rd:"#888"}}><option>Pending</option><option>Paid</option><option>Overdue</option></select></td>
        <td style={td}><button onClick={()=>rPy(p.id)} style={{background:"transparent",border:"none",color:"#3A3A44",cursor:"pointer",fontSize:10}}>x</button></td>
      </tr>
    );
  }

  // Payment rows with cumulative
  function renderPayBody(){
    let cum=0;
    return pay.map((p,i)=>{
      const pct=pyT>0?(p.am/pyT)*100:0;
      cum+=pct;
      return renderPayRow(p,i,cum);
    });
  }

  return (
    <div style={{minHeight:"100vh",background:CL.bg,color:CL.tx,fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#141418,#0C0C0F)",borderBottom:"1px solid "+CL.bd,padding:"16px 22px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:11}}>
          <div style={{width:36,height:36,background:"linear-gradient(135deg,"+G+",#A67C2E)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#111"}}>i3d</div>
          <div><div style={{fontSize:16,fontWeight:700,color:"#F0F0F0"}}>Construction Estimator</div><div style={{fontSize:10,color:CL.dm,letterSpacing:"0.5px",textTransform:"uppercase"}}>i3d Studio - Coimbatore</div></div>
        </div>
        <Bt s={{fontSize:11}} onClick={()=>window.print()}>Print / PDF</Bt>
      </div>

      <div style={{display:"flex",borderBottom:"1px solid "+CL.bd,background:"#111115",overflowX:"auto"}}>
        {TBS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"10px 16px",border:"none",borderBottom:tab===t.id?"2.5px solid "+G:"2.5px solid transparent",background:tab===t.id?"rgba(212,168,83,0.06)":"transparent",color:tab===t.id?G:"#555",fontSize:11.5,fontWeight:tab===t.id?700:500,cursor:"pointer",letterSpacing:"0.3px",textTransform:"uppercase",whiteSpace:"nowrap"}}>{t.l}</button>)}
      </div>

      {lk && (
        <div style={{background:"rgba(200,40,40,0.05)",border:"1px solid rgba(200,60,60,0.18)",margin:"16px 20px 0",padding:"14px 18px",borderRadius:9,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:13,fontWeight:700,color:CL.rd}}>PROJECT LOCKED</div><div style={{fontSize:12,color:"#888",marginTop:3}}>{lkM}</div></div>
          <Bt danger onClick={()=>sLk(false)} s={{fontSize:10}}>Unlock</Bt>
        </div>
      )}

      <div style={{padding:"18px 22px",maxWidth:1280,margin:"0 auto",opacity:lk?0.35:1,pointerEvents:lk?"none":"auto"}}>

        {/* AGREEMENT */}
        {tab==="agreement" && (
          <div>
            <Cd>
              <h3 style={{margin:"0 0 3px",fontSize:16,fontWeight:700,color:G}}>Contract Agreement</h3>
              <p style={{margin:"0 0 14px",fontSize:12,color:CL.dm}}>Standard i3d Studio template. Fill project-specific fields.</p>
              <div style={{fontSize:11,color:G,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6,fontWeight:700}}>Parties</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}><Fl label="Client Name" k="cn" wide/><Fl label="Client Address" k="ca" wide area/><Fl label="Representative" k="cr"/></div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}><Fl label="Contractor Name" k="xn" wide/><Fl label="Contractor Address" k="xa" wide area/><Fl label="Auth. Signatory" k="xr"/></div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}><Fl label="Architect Firm" k="af"/><Fl label="Architect Address" k="aa" wide/><Fl label="Agreement Date" k="date"/></div>
              <div style={{fontSize:11,color:G,textTransform:"uppercase",margin:"16px 0 6px",fontWeight:700}}>Project</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}><Fl label="Description" k="pd" wide/><Fl label="S.F. No." k="sf"/><Fl label="T.S. No." k="ts"/></div>
              <div style={{fontSize:11,color:G,textTransform:"uppercase",margin:"16px 0 6px",fontWeight:700}}>Schedule and Rates</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}><Fl label="Commencement" k="sm"/><Fl label="Months" k="mo"/><Fl label="GF Rate/SFT" k="gr"/><Fl label="Typ Floor Rate" k="tr"/></div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:10}}><Fl label="GF Area SFT" k="ga"/><Fl label="Typ Floor Area" k="ta"/><Fl label="Typ Floors" k="tf"/></div>
              {(ag.ga||ag.ta) && <div style={{padding:"8px 12px",background:"rgba(212,168,83,0.04)",borderRadius:6,border:"1px solid rgba(212,168,83,0.12)",marginBottom:14}}><span style={{fontSize:11,color:"#666"}}>Projected: </span><span style={{...mn,fontSize:15,fontWeight:700,color:G}}>{fmt((parseFloat(ag.ga)||0)*(parseFloat(ag.gr)||0)+(parseFloat(ag.ta)||0)*(parseFloat(ag.tf)||0)*(parseFloat(ag.tr)||0))}</span></div>}
              <div style={{fontSize:11,color:G,textTransform:"uppercase",margin:"16px 0 6px",fontWeight:700}}>Financial</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}><Fl label="Mob. Advance" k="ma"/><Fl label="Retention" k="rt"/></div>
              <div style={{fontSize:11,color:G,textTransform:"uppercase",margin:"16px 0 6px",fontWeight:700}}>Material Limits</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><Fl label="Bricks" k="bl"/><Fl label="Cement" k="cl"/><Fl label="RMC/CU.M" k="rl"/><Fl label="Sand" k="sl"/></div>
            </Cd>
            <Cd>
              <h3 style={{margin:"0 0 10px",fontSize:14,fontWeight:700,color:G}}>Clauses (19)</h3>
              {CLS.map(c=><div key={c.n} style={{display:"flex",gap:8,padding:"6px 0",borderBottom:"1px solid #1A1A1E"}}><span style={{...mn,color:G,fontSize:11,minWidth:22,textAlign:"right"}}>{c.n}</span><span style={{color:CL.bl,fontSize:12,fontWeight:600,minWidth:80}}>{c.t}</span><span style={{color:"#AAA",fontSize:12,flex:1}}>{c.s}</span></div>)}
            </Cd>
          </div>
        )}

        {/* ESTIMATE */}
        {tab==="estimate" && (
          <div>
            <div style={{background:"rgba(212,168,83,0.04)",border:"1px solid rgba(212,168,83,0.12)",borderRadius:7,padding:"10px 14px",marginBottom:12,fontSize:12,color:"#AAA"}}>
              <strong style={{color:G}}>Escalation Clause:</strong>{" "}Estimate valid if material costs stay within{" "}
              <input type="number" value={esc} onChange={e=>sEsc(parseFloat(e.target.value)||0)} style={{width:48,padding:"3px 5px",textAlign:"center",background:"#0F0F13",border:"1px solid "+CL.bd,borderRadius:4,color:CL.tx,fontSize:12,outline:"none"}}/>
              {"% "}of quoted rates. Above this, estimate increases proportionally.
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12,alignItems:"flex-end"}}>
              <div style={{flex:3,minWidth:200}}><label style={lb}>Project Name</label><input style={inp} value={pn} onChange={e=>sPn(e.target.value)} placeholder="Enter project name..."/></div>
              <Bt onClick={ldSNGC}>Load SNGC</Bt>
              <Bt gold onClick={aStg}>+ Stage</Bt>
            </div>
            {stg.map(s=>renderStage(s))}
            <Cd gold>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,color:"#888",textTransform:"uppercase"}}>Grand Total (Labour)</span>
                <span style={{fontSize:24,fontWeight:800,color:G,...mn}}>{fmt(tots.g)}</span>
              </div>
            </Cd>
          </div>
        )}

        {/* ABSTRACT */}
        {tab==="abstract" && (
          <div>
            <Cd>
              <h3 style={{margin:"0 0 3px",fontSize:16,fontWeight:700,color:G}}>Abstract Estimate</h3>
              <p style={{margin:"0 0 12px",fontSize:12,color:CL.dm}}>Per-SFT ratios for quick material estimation.</p>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:150}}><label style={lb}>Building Type</label><select style={{...sel,width:"100%"}} value={abT} onChange={e=>sAbT(e.target.value)}>{Object.entries(RT).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
                <div style={{flex:1,minWidth:110}}><label style={lb}>Built-up Area (SFT)</label><input type="number" style={inp} value={abA} onChange={e=>sAbA(parseFloat(e.target.value)||0)}/></div>
                <div style={{flex:1,minWidth:75}}><label style={lb}>Floors</label><input type="number" style={inp} value={abF} onChange={e=>sAbF(parseInt(e.target.value)||1)}/></div>
              </div>
              <div style={{marginTop:8,padding:"7px 10px",background:"rgba(212,168,83,0.04)",borderRadius:5}}><span style={{fontSize:11,color:"#555"}}>Total Area: </span><span style={{...mn,fontSize:14,fontWeight:700,color:G}}>{fN(abE.a)} SFT</span></div>
            </Cd>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:10,marginBottom:12}}>
              {abE.m.map(x=>(
                <Cd key={x.l} s={{padding:"12px 14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <div><div style={{fontSize:10,color:CL.dm,textTransform:"uppercase",marginBottom:2}}>{x.l}</div><div style={{fontSize:20,fontWeight:700,...mn,color:x.cl}}>{fN(x.q)}</div><div style={{fontSize:10,color:"#3A3A44"}}>{x.u}</div></div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:10,color:CL.dm}}>Cost</div><div style={{fontSize:13,fontWeight:600,...mn,color:"#CCC"}}>{fmt(x.c)}</div></div>
                  </div>
                </Cd>
              ))}
            </div>
            <Cd gold><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:12,color:"#888",textTransform:"uppercase"}}>Material Cost</div><div style={{fontSize:11,color:CL.dm,marginTop:1}}>{fmt(abE.a>0?abE.t/abE.a:0)} per SFT</div></div><span style={{fontSize:24,fontWeight:800,color:G,...mn}}>{fmt(abE.t)}</span></div></Cd>
            <Cd>
              <h3 style={{margin:"0 0 10px",fontSize:14,fontWeight:700,color:G}}>Material Rates (Editable)</h3>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))",gap:10}}>
                {[{k:"cement",n:"Cement OPC 53",u:"Bag"},{k:"msand",n:"M.Sand",u:"CFT"},{k:"psand",n:"P.Sand",u:"CFT"},{k:"jelly",n:"Jelly",u:"CFT"},{k:"steel",n:"Steel Fe500D",u:"Kg"},{k:"bricks",n:"Bricks",u:"No."},{k:"gravel",n:"Gravel",u:"CFT"},{k:"rmc15",n:"RMC M.15",u:"CU.M"},{k:"rmc20",n:"RMC M.20",u:"CU.M"},{k:"rmc25",n:"RMC M.25",u:"CU.M"}].map(x=><div key={x.k}><label style={lb}>{x.n} (per {x.u})</label><input type="number" style={inp} value={mr[x.k]} onChange={e=>sMr(p=>({...p,[x.k]:parseFloat(e.target.value)||0}))}/></div>)}
              </div>
            </Cd>
            <Cd>
              <h3 style={{margin:"0 0 8px",fontSize:14,fontWeight:700,color:G}}>Standard Ratios (per SFT)</h3>
              <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr><th style={th}>Material</th>{Object.values(RT).map(r=><th key={r.label} style={{...th,textAlign:"right"}}>{r.label}</th>)}</tr></thead><tbody>{[{k:"cement",l:"Cement (bags)"},{k:"msand",l:"M.Sand (CFT)"},{k:"psand",l:"P.Sand (CFT)"},{k:"jelly",l:"Jelly (CFT)"},{k:"steel",l:"Steel (Kg)"},{k:"bricks",l:"Bricks (Nos)"},{k:"gravel",l:"Gravel (CFT)"}].map(r=><tr key={r.k}><td style={{...td,color:"#CCC"}}>{r.l}</td>{Object.values(RT).map(v=><td key={v.label} style={{...td,...mn,textAlign:"right",color:"#888"}}>{v[r.k]}</td>)}</tr>)}</tbody></table></div>
            </Cd>
          </div>
        )}

        {/* PAYMENT */}
        {tab==="payment" && (
          <div>
            <Cd>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
                <div><h3 style={{margin:"0 0 3px",fontSize:16,fontWeight:700,color:G}}>Payment Schedule</h3><p style={{margin:0,fontSize:12,color:CL.dm}}>Editable amounts, weeks and status. Smart lock for overdue.</p></div>
                <div style={{display:"flex",gap:6}}>
                  <Bt onClick={aPy}>+ Stage</Bt>
                  <Bt danger={!lk} gold={lk} onClick={()=>{if(pyO.length>0||lk)sLk(!lk);else alert("No overdue payments.");}}>
                    {lk?"Unlock":"Lock"}
                  </Bt>
                </div>
              </div>
            </Cd>
            {lk && <div style={{background:"rgba(200,40,40,0.04)",border:"1px solid rgba(200,60,60,0.15)",padding:"12px 16px",borderRadius:7,marginBottom:12}}><div style={{fontSize:12,fontWeight:700,color:CL.rd,marginBottom:4}}>SMART LOCK ACTIVE</div><textarea rows={2} style={{...inp,fontSize:12}} value={lkM} onChange={e=>sLkM(e.target.value)}/></div>}
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr>{["#","Stage","Weeks","Amount","%","Cumul.","Status",""].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>{renderPayBody()}</tbody>
              </table>
            </div>
            <Cd gold s={{marginTop:8}}>
              <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                <div><div style={{fontSize:10,color:"#888",textTransform:"uppercase"}}>Total</div><div style={{fontSize:20,fontWeight:800,color:G,...mn}}>{fmt(pyT)}</div></div>
                <div><div style={{fontSize:10,color:"#888",textTransform:"uppercase"}}>Paid</div><div style={{fontSize:20,fontWeight:800,color:CL.gn,...mn}}>{fmt(pyP)}</div></div>
                <div><div style={{fontSize:10,color:"#888",textTransform:"uppercase"}}>Balance</div><div style={{fontSize:20,fontWeight:800,color:CL.rd,...mn}}>{fmt(pyT-pyP)}</div></div>
                <div><div style={{fontSize:10,color:"#888",textTransform:"uppercase"}}>Overdue</div><div style={{fontSize:20,fontWeight:800,color:pyO.length?CL.rd:"#444",...mn}}>{pyO.length}</div></div>
              </div>
            </Cd>
          </div>
        )}

        {/* SCHEDULE */}
        {tab==="schedule" && (
          <div>
            <Cd>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
                <div style={{flex:1,minWidth:220}}><h3 style={{margin:"0 0 3px",fontSize:16,fontWeight:700,color:G}}>Project Schedule</h3><input value={schT} onChange={e=>sSchT(e.target.value)} style={{...gh,color:"#888",fontSize:12,width:"100%"}}/></div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}><Bt onClick={aGr}>+ Group</Bt><Bt onClick={aTk}>+ Task</Bt><Bt danger onClick={()=>{sSch([{id:1,n:"Project",d:0,l:0,s:"",f:"",p:""}]);sSchT("New Project");}}>Clear</Bt><Bt onClick={()=>sSch(SCH_INIT.map(x=>({...x})))} s={{fontSize:11}}>Sivadas Sample</Bt></div>
              </div>
            </Cd>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:860}}>
                <thead><tr>{["#","Task","Days","Start","Finish","Pred","Gantt",""].map(h=><th key={h} style={{...th,width:h==="Task"?"20%":h==="Gantt"?"28%":"auto"}}>{h}</th>)}</tr></thead>
                <tbody>{sch.map(t=>{
                  const cols=[G,CL.bl,CL.gn,CL.pu,CL.am,CL.rd,"#8A8A6A","#6BC8C8"];
                  const cc=cols[Math.floor(t.id/5)%cols.length];
                  return (
                    <tr key={t.id} style={{background:t.l===0?"rgba(212,168,83,0.03)":"transparent"}}>
                      <td style={{...td,...mn,color:CL.dm,fontSize:10}}>{t.id}</td>
                      <td style={td}><input value={t.n} onChange={e=>uTk(t.id,"n",e.target.value)} style={{...gh,paddingLeft:t.l*12,color:t.l===0?G:t.l===1?"#CCC":"#888",fontWeight:t.l<=1?600:400,fontSize:12}}/></td>
                      <td style={td}><input type="number" value={t.d} onChange={e=>uTk(t.id,"d",parseInt(e.target.value)||0)} style={{...gh,...mn,width:38,textAlign:"right",color:t.d===0?CL.rd:"#888",fontSize:12}}/></td>
                      <td style={td}><input value={t.s} onChange={e=>uTk(t.id,"s",e.target.value)} style={{...gh,width:62,color:"#666",fontSize:11}}/></td>
                      <td style={td}><input value={t.f} onChange={e=>uTk(t.id,"f",e.target.value)} style={{...gh,width:62,color:"#666",fontSize:11}}/></td>
                      <td style={td}><input value={t.p} onChange={e=>uTk(t.id,"p",e.target.value)} style={{...gh,width:55,color:CL.bl,fontSize:10}}/></td>
                      <td style={{...td,position:"relative",height:20}}>
                        {t.d>0 && <div style={{position:"absolute",left:Math.min((t.id/Math.max(sch.length,1))*88,90)+"%",width:Math.max((t.d/schMx)*100,2)+"%",height:13,background:t.l<=1?cc:cc+"77",borderRadius:2,top:4}}/>}
                        {t.d===0 && t.l>0 && <div style={{position:"absolute",left:(t.id/Math.max(sch.length,1))*88+"%",top:1,width:0,height:0,borderLeft:"5px solid transparent",borderRight:"5px solid transparent",borderTop:"9px solid "+CL.rd}}/>}
                      </td>
                      <td style={td}><button onClick={()=>rTk(t.id)} style={{background:"transparent",border:"none",color:"#3A3A44",cursor:"pointer",fontSize:10}}>x</button></td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* LIBRARY */}
        {tab==="library" && (
          <div>
            <div style={{display:"flex",gap:0,marginBottom:12}}>
              {[{id:"items",l:"Work Items"},{id:"sngc",l:"SNGC Reference"},{id:"specs",l:"Specifications"}].map(t=><button key={t.id} onClick={()=>sLSub(t.id)} style={{padding:"7px 14px",border:"none",borderBottom:lSub===t.id?"2px solid "+G:"2px solid transparent",background:lSub===t.id?"rgba(212,168,83,0.05)":"transparent",color:lSub===t.id?G:"#555",fontSize:12,cursor:"pointer"}}>{t.l}</button>)}
            </div>
            {lSub==="items" && (
              <div>
                <Cd>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-end"}}>
                    <div><label style={lb}>Category</label><select style={{...sel,minWidth:140}} value={lc} onChange={e=>sLc(e.target.value)}><option value="All">All</option>{lCats.map(c=><option key={c}>{c}</option>)}</select></div>
                    <div><label style={lb}>Search</label><input style={{...inp,width:200}} value={lq} onChange={e=>sLq(e.target.value)} placeholder="Search..."/></div>
                    <span style={{fontSize:12,color:"#555"}}>{lFilt.length} items</span>
                    <div style={{marginLeft:"auto"}}><Bt gold onClick={()=>sLib(p=>[...p,{id:"C"+Date.now(),cat:"Custom",desc:"New Item",unit:"SFT",rate:0,src:"User"}])}>+ Add</Bt></div>
                  </div>
                </Cd>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <thead><tr>{["ID","Category","Description","Unit","Rate","Src",""].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
                    <tbody>{lFilt.map(i=>(
                      <tr key={i.id}>
                        <td style={{...td,...mn,color:CL.dm,fontSize:10}}>{i.id}</td>
                        <td style={td}><input value={i.cat} onChange={e=>uLib(i.id,"cat",e.target.value)} style={{...gh,color:G,fontSize:11,width:80}}/></td>
                        <td style={td}><input value={i.desc} onChange={e=>uLib(i.id,"desc",e.target.value)} style={{...gh,color:"#CCC",fontSize:12}}/></td>
                        <td style={td}><select value={i.unit} onChange={e=>uLib(i.id,"unit",e.target.value)} style={{...sel,border:"none",background:"transparent",padding:2,color:"#888",fontSize:11}}>{UN.map(u=><option key={u}>{u}</option>)}</select></td>
                        <td style={td}><input type="number" value={i.rate} onChange={e=>uLib(i.id,"rate",e.target.value)} style={{...gh,...mn,width:70,textAlign:"right",color:CL.bl,fontSize:12}}/></td>
                        <td style={{...td,color:"#444",fontSize:10}}>{i.src}</td>
                        <td style={td}><button onClick={()=>sLib(p=>p.filter(x=>x.id!==i.id))} style={{background:"transparent",border:"none",color:"#3A3A44",cursor:"pointer",fontSize:10}}>x</button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            )}
            {lSub==="sngc" && (
              <Cd>
                <h3 style={{margin:"0 0 10px",fontSize:14,fontWeight:700,color:G}}>SNGC Gateway - Labour BOQ</h3>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr>{["#","Description","Qty","Unit","Rate","Amount"].map(h=><th key={h} style={{...th,textAlign:h==="Description"?"left":"right"}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {SNGC_L.map(x=>(
                      <tr key={x.s}><td style={{...td,...mn,textAlign:"right",color:CL.dm}}>{x.s}</td><td style={{...td,color:"#CCC"}}>{x.d}</td><td style={{...td,...mn,textAlign:"right",color:"#888"}}>{fN(x.q)}</td><td style={{...td,textAlign:"right",color:CL.dm}}>{x.u}</td><td style={{...td,...mn,textAlign:"right",color:"#888"}}>{x.r}</td><td style={{...td,...mn,textAlign:"right",color:G}}>{fmt(x.a)}</td></tr>
                    ))}
                    <tr style={{borderTop:"2px solid "+G}}><td colSpan={5} style={{...td,textAlign:"right",fontWeight:700,color:"#888",fontSize:10,textTransform:"uppercase"}}>Total</td><td style={{...td,...mn,textAlign:"right",fontWeight:800,color:G,fontSize:15}}>{fmt(203959)}</td></tr>
                  </tbody>
                </table>
                <h4 style={{fontSize:11,color:"#888",textTransform:"uppercase",margin:"18px 0 6px"}}>Steel Schedule</h4>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {[["8mm",312],["10mm",5],["12mm",60],["16mm",33],["20mm",77],["25mm",110]].map(([d,c])=>(
                    <div key={d} style={{padding:"6px 12px",background:"#0F0F13",borderRadius:6,border:"1px solid "+CL.bd,textAlign:"center",minWidth:52}}>
                      <div style={{fontSize:9,color:"#444"}}>{d}</div>
                      <div style={{fontSize:16,fontWeight:700,...mn,color:CL.pu}}>{c}</div>
                    </div>
                  ))}
                </div>
              </Cd>
            )}
            {lSub==="specs" && (
              <div>{SPC.map((s,i)=>(
                <Cd key={i} s={{padding:"10px 14px"}}>
                  <span style={{fontSize:11,color:G,fontWeight:700,textTransform:"uppercase"}}>{i+1}. {s.t}</span>
                  <p style={{margin:"4px 0 0",color:"#AAA",fontSize:12,lineHeight:1.5}}>{s.s}</p>
                </Cd>
              ))}</div>
            )}
          </div>
        )}

      </div>
      <div style={{textAlign:"center",padding:"20px 0 10px",color:"#2A2A30",fontSize:10}}>i3d Studio - Construction Estimator v4.0 - Coimbatore</div>
    </div>
  );
}
