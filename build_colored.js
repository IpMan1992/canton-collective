const fs=require('fs'), zlib=require('zlib');

/* ---------- content ---------- */
// theme keys: summary, may, june, yoy
const sections=[
 {theme:"summary", title:"CANTON COLLECTIVE — WEEKLY PERFORMANCE  (May 11 – Jun 28, 2026 · GMV = total_sales)", blocks:[
   {subtitle:"SUMMARY — all 7 weeks", headers:["Week","GMV","Orders","AOV","Sessions","Conv Rate","WoW GMV","vs 4-wk Avg","YoY GMV","Verdict"],
    deltaCols:[6,7,8], verdictCol:9, rows:[
     ["May 11–17",12555.04,139,94.58,20391,"0.55%","-4.9%","-36.6%","+221%","WORSE"],
     ["May 18–24",16016.78,166,97.34,24221,"0.61%","+27.6%","-5.8%","+360%","WORSE (marginal)"],
     ["May 25–31",13905.39,140,99.80,25212,"0.48%","-13.2%","-4.9%","+78%","FLAT"],
     ["Jun 1–7",17663.96,163,105.71,26887,"0.56%","+27.0%","+26.9%","-4.8%","BETTER"],
     ["Jun 8–14",15074.88,133,108.00,25874,"0.44%","-14.7%","+0.3%","-17.2%","FLAT"],
     ["Jun 15–21",13916.50,128,106.56,25933,"0.42%","-7.7%","-11.2%","-37.2%","WORSE"],
     ["Jun 22–28",19353.59,184,101.75,31496,"0.51%","+39.1%","+27.8%","-12.3%","BETTER"],
   ]},
   {subtitle:"Key findings", headers:["#","Finding"], deltaCols:[], verdictCol:-1, rows:[
     [1,"HEADLINE (Jun 22–28): Breakout week — GMV $19,353.59, +39.1% WoW and +27.8% vs 4-wk avg (BETTER), best in trailing-8."],
     [2,"MAMC pulls away to 44.1% share (+5.1pp) — runaway #1, supplies all top-3 heroes incl. NEW #1 Dreamy Underwater Garden Slip Maxi ($1,528)."],
     [3,"2th Desire collapses −6.4pp to 6.0% (only Retro Camisole Layer Top holding); Outtheblue recovers 0.8%→3.7% (+2.9pp)."],
     [4,"Driver: traffic surge (+21%, ~31.5K sessions) AND conversion recovery (+20%, CVR 0.42→0.51%) — 3-week browse→cart leak eased."],
     [5,"Full-funnel recovery: cart-add 3.57→3.76%, reach-checkout 1.06→1.17%, completion 0.42→0.51%."],
     [6,"AOV a mild drag: $106.56 → $101.75 as orders jumped +44% (184 orders)."],
     [7,"Email underutilized: 1 send this week (0623 Delete-Ex) $133 / 1 conv at 60.2% open; 8 campaigns ~$952 total (≈0.7% of GMV) — pushing a small vendor, not MAMC."],
     [8,"Blind spot: Meta CC ad account (SGD) UNSETTLED / not queryable — cannot confirm if the traffic surge was paid-driven."],
     [9,"YoY −12.3% vs Jun 2025 (195 orders @ ~$111 vs 184 @ $102 now) — gap narrowed sharply from −37% last week."],
   ]},
 ]},
 {theme:"may", title:"MAY 2026", blocks:[
   {subtitle:"KPIs by week", headers:["Week","GMV","Orders","AOV","Sessions","Conv Rate","WoW GMV","vs 4-wk Avg","YoY","Verdict"],
    deltaCols:[6,7,8], verdictCol:9, rows:[
     ["May 11–17",12555.04,139,94.58,20391,"0.55%","-4.9%","-36.6%","+221%","WORSE"],
     ["May 18–24",16016.78,166,97.34,24221,"0.61%","+27.6%","-5.8%","+360%","WORSE (marginal)"],
     ["May 25–31",13905.39,140,99.80,25212,"0.48%","-13.2%","-4.9%","+78%","FLAT"],
   ]},
   {subtitle:"Why — decomposition (GMV = Sessions × Conv Rate × AOV)", headers:["Transition","Sessions","Conv Rate","AOV","Orders","GMV","Primary driver"],
    deltaCols:[1,2,3,4,5], verdictCol:-1, rows:[
     ["May 04 → May 11","-18.8%","-4.8%","+12.3%","-12.0%","-4.9%","Traffic collapse, cushioned by AOV"],
     ["May 11 → May 18","+18.8%","+9.6%","+2.9%","+19.4%","+27.6%","Traffic rebound + conversion lift"],
     ["May 18 → May 25","+4.1%","-21.6%","+2.5%","-15.7%","-13.2%","CONVERSION collapse (browse→cart)"],
   ]},
   {subtitle:"Funnel + discounts/returns", headers:["Week","Sessions","Cart Adds","Reached CO","Completed","Conv Rate","Discounts","Returns"],
    deltaCols:[], verdictCol:-1, rows:[
     ["May 11–17",20391,854,285,113,"0.55%",-2427.49,-1771.11],
     ["May 18–24",24221,1070,402,147,"0.61%",-1856.85,-1658.25],
     ["May 25–31",25212,957,319,120,"0.48%",-2166.15,-1159.09],
   ]},
   {subtitle:"Traffic by referrer source", headers:["Week","Direct/Unknown $","Ord","Social $","Ord","Search $","Ord"],
    deltaCols:[], verdictCol:-1, rows:[
     ["May 11–17",7998.46,89,3369.02,39,1187.56,11],
     ["May 18–24",10709.87,104,3544.61,39,1762.30,23],
     ["May 25–31",8783.94,86,3043.26,31,2078.19,23],
   ]},
   {subtitle:"Vendor GMV share (% of store)", headers:["Vendor","May 11–17","May 18–24","May 25–31"],
    deltaCols:[], verdictCol:-1, rows:[
     ["1Jinn Studio","46.3%","36.6%","36.0%"],["MAMC","—","9.8%","24.7%"],["2th Desire","18.1%","16.2%","10.8%"],
     ["Deleteex","18.1%","18.3%","13.9%"],["First Floor","4.7%","5.0%","7.9%"],["1Jinn M2M","1.7%","3.7%","0.7%"],["(blank=shipping)","10.4%","10.2%","6.1%"],
   ]},
   {subtitle:"Top products — GMV by week", headers:["Product","May 11–17","May 18–24","May 25–31","Trend"],
    deltaCols:[], verdictCol:-1, rows:[
     ["Lavender Floral Chiffon Slip Mini Dress (MAMC)",0,512.05,1201.20,"CLIMBER / hero"],
     ["Green Fold Over Asymmetric Hem Midi Skirt (MAMC)",0,0,391.00,"CLIMBER"],
     ["Retro Camisole Layer Top (2th Desire)",803.61,344.34,276.58,"Volatile core"],
     ["Y2K Beaded Multi Strap Top",522.69,616.46,321.20,"Core"],
     ["Midnight Meow Zip Up Cat Ear Hoodie",422.96,569.26,580.26,"Fading"],
     ["Metal Flower Pleated Strapless Mini Dress",0,549.09,540.65,"Peaked"],
     ["Polka Dot Stripe Henley Tank 3pc Set",761.92,507.99,464.84,"Declining"],
   ]},
   {subtitle:"Email campaigns (Klaviyo)", headers:["Send Date","Campaign","Theme","Recipients","Open Rate","Attributed Rev","Conv"],
    deltaCols:[], verdictCol:-1, rows:[
     ["May 13","0513 CC new drop","New drop",91,"39.6%",71.00,1],
     ["May 20","0520 MAMC","MAMC",457,"32.9%",0.00,0],
     ["May 27","0527 MAMC","MAMC",774,"34.4%",41.00,1],
   ]},
 ]},
 {theme:"june", title:"JUNE 2026", blocks:[
   {subtitle:"KPIs by week", headers:["Week","GMV","Orders","AOV","Sessions","Conv Rate","WoW GMV","vs 4-wk Avg","YoY","Verdict"],
    deltaCols:[6,7,8], verdictCol:9, rows:[
     ["Jun 1–7",17663.96,163,105.71,26887,"0.56%","+27.0%","+26.9%","-4.8%","BETTER"],
     ["Jun 8–14",15074.88,133,108.00,25874,"0.44%","-14.7%","+0.3%","-17.2%","FLAT"],
     ["Jun 15–21",13916.50,128,106.56,25933,"0.42%","-7.7%","-11.2%","-37.2%","WORSE"],
     ["Jun 22–28",19353.59,184,101.75,31496,"0.51%","+39.1%","+27.8%","-12.3%","BETTER"],
   ]},
   {subtitle:"Why — decomposition (GMV = Sessions × Conv Rate × AOV)", headers:["Transition","Sessions","Conv Rate","AOV","Orders","GMV","Primary driver"],
    deltaCols:[1,2,3,4,5], verdictCol:-1, rows:[
     ["May 25 → Jun 01","+6.6%","+17.2%","+5.9%","+16.4%","+27.0%","Broad-based: all three positive"],
     ["Jun 01 → Jun 08","-3.8%","-21.7%","+2.2%","-18.4%","-14.7%","CONVERSION collapse (browse→cart)"],
     ["Jun 08 → Jun 15","+0.2%","-2.9%","-1.3%","-3.8%","-7.7%","Conversion stays soft + AOV off peak (traffic flat)"],
     ["Jun 15 → Jun 22","+21.5%","+19.8%","-4.5%","+43.8%","+39.1%","Traffic surge + CONVERSION recovery (browse→cart leak eases)"],
   ]},
   {subtitle:"Funnel + discounts/returns", headers:["Week","Sessions","Cart Adds","Reached CO","Completed","Conv Rate","Discounts","Returns"],
    deltaCols:[], verdictCol:-1, rows:[
     ["Jun 1–7",26887,1042,327,150,"0.56%",-1822.65,-1016.10],
     ["Jun 8–14",25874,869,289,113,"0.44%",-2177.46,-428.99],
     ["Jun 15–21",25933,925,275,110,"0.42%",-1498.37,-561.62],
     ["Jun 22–28",31496,1184,367,160,"0.51%",-2645.97,-625.34],
   ]},
   {subtitle:"Traffic by referrer source", headers:["Week","Direct/Unknown $","Ord","Social $","Ord","Search $","Ord"],
    deltaCols:[], verdictCol:-1, rows:[
     ["Jun 1–7",11588.80,104,3483.83,33,2591.33,26],
     ["Jun 8–14",9522.26,82,3767.02,35,1785.60,16],
     ["Jun 15–21",9299.36,78,2901.45,33,1715.69,17],
     ["Jun 22–28",11873.51,109,4334.89,45,3145.19,30],
   ]},
   {subtitle:"Vendor GMV share (% of store)", headers:["Vendor","Jun 1–7","Jun 8–14","Jun 15–21","Jun 22–28"],
    deltaCols:[], verdictCol:-1, rows:[
     ["1Jinn Studio","31.4%","35.5%","25.7%","24.7%"],["MAMC","21.5%","22.3%","39.0%","44.1%"],["2th Desire","20.6%","13.2%","12.4%","6.0%"],["Deleteex","12.5%","13.8%","11.4%","11.5%"],
     ["Outtheblue","0.4%","6.6%","0.8%","3.7%"],["First Floor","4.6%","3.1%","4.0%","3.7%"],["1Jinn M2M","1.4%","0.4%","1.4%","1.0%"],["(blank=shipping)","7.1%","4.9%","5.2%","5.3%"],
   ]},
   {subtitle:"Top products — GMV by week", headers:["Product","Jun 1–7","Jun 8–14","Jun 15–21","Jun 22–28","Trend"],
    deltaCols:[], verdictCol:-1, rows:[
     ["Dreamy Underwater Garden Slip Maxi Dress (MAMC)",0,0,0,1527.75,"NEW #1 hero"],
     ["Dusty Rose Layered Gauze Bandeau Top (MAMC)",0,0,737.11,1471.06,"CLIMBER → hero"],
     ["Lavender Floral Chiffon Slip Mini Dress (MAMC)",1197.35,771.16,847.43,987.30,"Hero (holding)"],
     ["Green Fold Over Asymmetric Hem Midi Skirt (MAMC)",326.40,397.63,607.41,291.22,"Cooling"],
     ["Retro Camisole Layer Top (2th Desire)",693.66,547.90,397.29,366.30,"2TH lone holdout"],
     ["Y2K Beaded Multi Strap Top (1Jinn)",331.17,594.51,460.85,498.76,"Core"],
     ["Polka Dot Stripe Henley Tank 3pc Set (1Jinn)",464.84,339.01,0,511.33,"Rebounded"],
     ["Outtheblue line (vendor total)",79.00,989.58,109.97,712.64,"Recovered (+2.9pp)"],
     ["Midnight Meow Zip Up Cat Ear Hoodie (1Jinn)",530.75,431.75,156.74,225.50,"Fading"],
   ]},
   {subtitle:"Email campaigns (Klaviyo)", headers:["Send Date","Campaign","Theme","Recipients","Open Rate","Attributed Rev","Conv"],
    deltaCols:[], verdictCol:-1, rows:[
     ["Jun 03","0603 Outthe Blue","Outtheblue",428,"66.0%",56.91,1],
     ["Jun 10","0610 Outthe Blue vol.2","Outtheblue",536,"62.1%",258.22,1],
     ["Jun 13","0613 MAMC","MAMC",536,"59.6%",316.70,1],
     ["Jun 17","0617 2th Desire","2th Desire",552,"61.5%",75.00,1],
     ["Jun 23","0623 Delete-Ex","Delete-Ex",626,"60.2%",133.00,1],
   ]},
 ]},
 {theme:"yoy", title:"YEAR-OVER-YEAR (2026 vs 2025)", blocks:[
   {subtitle:"GMV vs same week last year", headers:["2026 Week","2026 GMV","2025 Matched Week","2025 GMV","2025 Orders","YoY"],
    deltaCols:[5], verdictCol:-1, rows:[
     ["May 11–17",12555.04,"wk of May 12 2025",3909.81,23,"+221%"],
     ["May 18–24",16016.78,"wk of May 19 2025",3478.49,25,"+360%"],
     ["May 25–31",13905.39,"wk of May 26 2025",7821.55,47,"+78%"],
     ["Jun 1–7",17663.96,"wk of Jun 02 2025",18559.83,195,"-4.8%"],
     ["Jun 8–14",15074.88,"wk of Jun 09 2025",18199.18,171,"-17.2%"],
     ["Jun 15–21",13916.50,"wk of Jun 16 2025",22144.84,214,"-37.2%"],
     ["Jun 22–28",19353.59,"wk of Jun 23 2025",22070.41,195,"-12.3%"],
   ]},
 ]},
];

/* ---------- styling registry ---------- */
// fills: index -> rgb (or null for none)
const fills=[null,null, // 0 none, 1 gray125
 "2F5597","DDEBF7","E2EFDA","E6E0EC","F2F2F2","C6EFCE","FFC7CE","D9D9D9","9DC3E6","A9D08E","B4A7D6","BFBFBF"];
const F_NONE=0, F_MAYL=3, F_JUNL=4, F_YOYL=5, F_SUML=6, F_POS=7, F_NEG=8, F_FLAT=9, F_MAYM=10, F_JUNM=11, F_YOYM=12, F_SUMM=13;
const theme={summary:{light:F_SUML,med:F_SUMM},may:{light:F_MAYL,med:F_MAYM},june:{light:F_JUNL,med:F_JUNM},yoy:{light:F_YOYL,med:F_YOYM}};
// fonts: 0 normal, 1 bold, 2 bold white, 3 title bold navy
const xfReg={}; const xfList=[];
function xf(font,fill){const k=font+"_"+fill; if(k in xfReg)return xfReg[k]; const i=xfList.length; xfList.push({font,fill}); xfReg[k]=i; return i;}
xf(0,F_NONE); // ensure style 0

function signFill(v){const s=String(v).trim(); if(/^\+/.test(s))return F_POS; if(/^-/.test(s))return F_NEG; return F_FLAT;}
function verdictFill(v){const s=String(v).toUpperCase(); if(s.includes("BETTER"))return F_POS; if(s.includes("WORSE"))return F_NEG; return F_FLAT;}

/* ---------- worksheet build ---------- */
function colLetter(n){let s="";n++;while(n>0){let m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=(n-m-1)/26;}return s;}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function isNum(v){return typeof v==='number';}
let rowsXml=[]; let R=0; const MAXC=10;
function row(cells){ // cells:[{v,font,fill}]
 R++;
 const cs=cells.map((c,ci)=>{const ref=colLetter(ci)+R; const s=xf(c.font||0, c.fill==null?F_NONE:c.fill);
   if(c.v===""||c.v==null) return `<c r="${ref}" s="${s}"/>`;
   if(isNum(c.v)) return `<c r="${ref}" s="${s}"><v>${c.v}</v></c>`;
   return `<c r="${ref}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${esc(c.v)}</t></is></c>`;}).join("");
 rowsXml.push(`<row r="${R}">${cs}</row>`);
}
function bandRow(text,fill,font){const cells=[]; for(let i=0;i<MAXC;i++)cells.push({v:i===0?text:"",font:font,fill:fill}); row(cells);}

sections.forEach((sec,si)=>{
 if(si>0) row([{v:""}]);
 const th=theme[sec.theme];
 bandRow(sec.title, th.med, 1); // section divider band
 sec.blocks.forEach((b,bi)=>{
   row([{v:""}]);
   bandRow(b.subtitle, th.light, 1);
   row(b.headers.map(h=>({v:h,font:1,fill:th.med})));
   b.rows.forEach(r=>{
     row(r.map((v,ci)=>{
       let fill=th.light, font=0;
       if(b.deltaCols.includes(ci)){fill=signFill(v);}
       if(ci===b.verdictCol){fill=verdictFill(v); font=1;}
       return {v, font, fill};
     }));
   });
 });
});

const cols=`<cols><col min="1" max="1" width="44" customWidth="1"/><col min="2" max="10" width="13" customWidth="1"/></cols>`;
const sheetXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/>${cols}<sheetData>${rowsXml.join("")}</sheetData></worksheet>`;

/* ---------- styles.xml ---------- */
const fontXml=[
 `<font><sz val="11"/><name val="Calibri"/></font>`,
 `<font><b/><sz val="11"/><name val="Calibri"/></font>`,
 `<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>`,
 `<font><b/><sz val="12"/><color rgb="FF1F3864"/><name val="Calibri"/></font>`,
].join("");
const fillXml=fills.map(c=> c==null ? (fills.indexOf(c)===1?`<fill><patternFill patternType="gray125"/></fill>`:`<fill><patternFill patternType="none"/></fill>`) : `<fill><patternFill patternType="solid"><fgColor rgb="FF${c}"/><bgColor indexed="64"/></patternFill></fill>`).join("");
const cellXfsXml=xfList.map(x=>`<xf numFmtId="0" fontId="${x.font}" fillId="${x.fill}" borderId="0" xfId="0" applyFont="1" applyFill="1"/>`).join("");
const stylesXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="4">${fontXml}</fonts><fills count="${fills.length}">${fillXml}</fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${xfList.length}">${cellXfsXml}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;

/* ---------- package ---------- */
const workbookXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Weekly Performance" sheetId="1" r:id="rId1"/></sheets></workbook>`;
const wbRels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
const ct=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`;
const rootRels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`;
const core=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:creator>Canton Collective</dc:creator><cp:lastModifiedBy>Canton Collective</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">2026-06-16T00:00:00Z</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">2026-06-16T00:00:00Z</dcterms:modified></cp:coreProperties>`;
const app=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Canton Collective Report</Application></Properties>`;

const files=[
 {name:"[Content_Types].xml",data:ct},{name:"_rels/.rels",data:rootRels},
 {name:"docProps/core.xml",data:core},{name:"docProps/app.xml",data:app},
 {name:"xl/workbook.xml",data:workbookXml},{name:"xl/_rels/workbook.xml.rels",data:wbRels},
 {name:"xl/styles.xml",data:stylesXml},{name:"xl/worksheets/sheet1.xml",data:sheetXml},
];

/* zip */
const crcT=(()=>{let t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc32(b){let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=crcT[(c^b[i])&0xFF]^(c>>>8);return(c^0xFFFFFFFF)>>>0;}
let loc=[],cen=[],off=0;
files.forEach(f=>{const d=Buffer.from(f.data,'utf8');const comp=zlib.deflateRawSync(d);const crc=crc32(d);const nb=Buffer.from(f.name,'utf8');
 const lh=Buffer.alloc(30);lh.writeUInt32LE(0x04034b50,0);lh.writeUInt16LE(20,4);lh.writeUInt16LE(0,6);lh.writeUInt16LE(8,8);lh.writeUInt16LE(0,10);lh.writeUInt16LE(0x21,12);lh.writeUInt32LE(crc,14);lh.writeUInt32LE(comp.length,18);lh.writeUInt32LE(d.length,22);lh.writeUInt16LE(nb.length,26);lh.writeUInt16LE(0,28);
 loc.push(lh,nb,comp);
 const ch=Buffer.alloc(46);ch.writeUInt32LE(0x02014b50,0);ch.writeUInt16LE(20,4);ch.writeUInt16LE(20,6);ch.writeUInt16LE(0,8);ch.writeUInt16LE(8,10);ch.writeUInt16LE(0,12);ch.writeUInt16LE(0x21,14);ch.writeUInt32LE(crc,16);ch.writeUInt32LE(comp.length,20);ch.writeUInt32LE(d.length,24);ch.writeUInt16LE(nb.length,28);ch.writeUInt16LE(0,30);ch.writeUInt16LE(0,32);ch.writeUInt16LE(0,34);ch.writeUInt16LE(0,36);ch.writeUInt32LE(0,38);ch.writeUInt32LE(off,42);
 cen.push(ch,nb); off+=lh.length+nb.length+comp.length;});
const lb=Buffer.concat(loc),cb=Buffer.concat(cen);const eo=Buffer.alloc(22);eo.writeUInt32LE(0x06054b50,0);eo.writeUInt16LE(files.length,8);eo.writeUInt16LE(files.length,10);eo.writeUInt32LE(cb.length,12);eo.writeUInt32LE(lb.length,16);
const zip=Buffer.concat([lb,cb,eo]);
fs.writeFileSync("Canton_Collective_Weekly_Performance_COLOR.xlsx",zip);
fs.writeFileSync("color_b64.txt",zip.toString('base64'));
console.log("bytes",zip.length,"b64",zip.toString('base64').length,"styles",xfList.length);
