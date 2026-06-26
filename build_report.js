const fs = require('fs');

// ===== DATA (all on total_sales / GMV basis) =====
const weeks = ["May 11–17","May 18–24","May 25–31","Jun 1–7","Jun 8–14","Jun 15–21"];

const kpi = {
  headers:["Week","GMV (Total Sales)","Orders","AOV","Sessions","Conv Rate","WoW GMV","vs 4-wk Avg","YoY GMV","Verdict"],
  rows:[
    ["May 11–17","12555.04","139","94.58","20391","0.55%","-4.9%","-36.6%","+221%","WORSE"],
    ["May 18–24","16016.78","166","97.34","24221","0.61%","+27.6%","-5.8%","+360%","WORSE (marginal)"],
    ["May 25–31","13905.39","140","99.80","25212","0.48%","-13.2%","-4.9%","FLAT","FLAT"],
    ["Jun 1–7","17663.96","163","105.71","26887","0.56%","+27.0%","+26.9%","-4.8%","BETTER"],
    ["Jun 8–14","15074.88","133","108.00","25874","0.44%","-14.7%","+0.3%","-17.2%","FLAT"],
    ["Jun 15–21","13916.50","128","106.56","25933","0.42%","-7.7%","-11.2%","-37.2%","WORSE"],
  ]
};
// fix YoY col for May25 row (was placeholder)
kpi.rows[2][8] = "+78%";

const decomp = {
  headers:["Transition","Sessions Δ","Conv Rate Δ","AOV Δ","Orders Δ","GMV Δ","Primary driver"],
  rows:[
    ["May 04 → May 11","-18.8%","-4.8%","+12.3%","-12.0%","-4.9%","Traffic collapse, cushioned by AOV"],
    ["May 11 → May 18","+18.8%","+9.6%","+2.9%","+19.4%","+27.6%","Traffic rebound + conversion lift"],
    ["May 18 → May 25","+4.1%","-21.6%","+2.5%","-15.7%","-13.2%","CONVERSION collapse (browse→cart)"],
    ["May 25 → Jun 01","+6.6%","+17.2%","+5.9%","+16.4%","+27.0%","Broad-based: all three positive"],
    ["Jun 01 → Jun 08","-3.8%","-21.7%","+2.2%","-18.4%","-14.7%","CONVERSION collapse (browse→cart)"],
    ["Jun 08 → Jun 15","+0.2%","-2.9%","-1.3%","-3.8%","-7.7%","Conversion stays soft + AOV slips off peak (traffic flat)"],
  ]
};

const funnel = {
  headers:["Week","Sessions","Cart Adds","Reached Checkout","Completed Checkout","Conv Rate","Discounts","Returns"],
  rows:[
    ["May 11–17","20391","854","285","113","0.55%","-2427.49","-1771.11"],
    ["May 18–24","24221","1070","402","147","0.61%","-1856.85","-1658.25"],
    ["May 25–31","25212","957","319","120","0.48%","-2166.15","-1159.09"],
    ["Jun 1–7","26887","1042","327","150","0.56%","-1822.65","-1016.10"],
    ["Jun 8–14","25874","869","289","113","0.44%","-2177.46","-428.99"],
    ["Jun 15–21","25933","925","275","110","0.42%","-1498.37","-561.62"],
  ]
};

const traffic = {
  headers:["Week","Direct/Unknown $","Direct Ord","Social $","Social Ord","Search $","Search Ord"],
  rows:[
    ["May 11–17","7998.46","89","3369.02","39","1187.56","11"],
    ["May 18–24","10709.87","104","3544.61","39","1762.30","23"],
    ["May 25–31","8783.94","86","3043.26","31","2078.19","23"],
    ["Jun 1–7","11588.80","104","3483.83","33","2591.33","26"],
    ["Jun 8–14","9522.26","82","3767.02","35","1785.60","16"],
    ["Jun 15–21","9299.36","78","2901.45","33","1715.69","17"],
  ]
};

// Vendor total_sales by week; shares computed in code
const vendorWeekTotals = {"May 11–17":12555.04,"May 18–24":16016.78,"May 25–31":13905.39,"Jun 1–7":17663.96,"Jun 8–14":15074.88,"Jun 15–21":13916.50};
const vendors = [
  ["1Jinn Studio", 5818.08,5860.65,5007.61,5554.53,5355.42,3572.62],
  ["MAMC",          0.00,   1569.91,3438.04,3805.37,3354.41,5424.71],
  ["2th Desire",    2270.44,2595.74,1504.74,3642.84,1985.62,1725.62],
  ["Deleteex",      2277.37,2930.20,1937.97,2211.05,2078.62,1590.93],
  ["First Floor",   589.39, 804.79, 1095.43,804.64, 459.99, 555.49],
  ["Outtheblue",    0.00,   0.00,   0.00,   79.00,  989.58, 109.97],
  ["1Jinn M2M",     212.84, 595.88, 94.90,  241.03, 55.16,  198.03],
  ["(blank=shipping)",1310.42,1640.01,846.30,1254.60,740.08,725.20],
];
const wkTot = [12555.04,16016.78,13905.39,17663.96,15074.88,13916.50];

function pct(v,t){ return (100*v/t).toFixed(1)+"%"; }
const vendorSheet = {
  headers:["Vendor","May11 $","May11 %","May18 $","May18 %","May25 $","May25 %","Jun1 $","Jun1 %","Jun8 $","Jun8 %","Jun15 $","Jun15 %"],
  rows: vendors.map(r=>{
    const out=[r[0]];
    for(let i=1;i<=6;i++){ out.push(r[i].toFixed(2)); out.push(pct(r[i],wkTot[i-1])); }
    return out;
  })
};

const products = {
  headers:["Product (GMV $ by week)","May11","May18","May25","Jun1","Jun8","Jun15","Trend"],
  rows:[
    ["Lavender Floral Chiffon Slip Mini Dress (MAMC)","0","512.05","1201.20","1197.35","771.16","847.43","CLIMBER / hero"],
    ["Dusty Rose Layered Gauze Bandeau Top (MAMC)","0","0","0","0","0","737.11","NEW CLIMBER"],
    ["Green Fold Over Asymmetric Hem Midi Skirt (MAMC)","0","0","391.00","326.40","397.63","607.41","CLIMBER"],
    ["Ruffle Trim Gingham Babydoll Mini Dress (MAMC)","0","0","295.63","0","432.67","159.80","Emerging"],
    ["Retro Camisole Layer Top (2th Desire)","803.61","344.34","276.58","693.66","547.90","397.29","Volatile core"],
    ["Y2K Beaded Multi Strap Top","522.69","616.46","321.20","331.17","594.51","460.85","Core, oscillating"],
    ["Shell Buttons Front Puff Sleeve Shirt","705.29","567.11","361.65","0","458.22","281.07","Soft core"],
    ["Midnight Meow Zip Up Cat Ear Hoodie","422.96","569.26","580.26","530.75","431.75","156.74","Fading"],
    ["Metal Flower Pleated Strapless Mini Dress","0","549.09","540.65","0","0","0","DECLINING (gone)"],
    ["Polka Dot Stripe Henley Tank 3pc Set","761.92","507.99","464.84","464.84","339.01","0","DECLINING (gone)"],
    ["Outtheblue line (vendor total)","0","0","0","79.00","989.58","109.97","Spiked then faded"],
  ]
};

const email = {
  headers:["Send Date","Campaign","Theme/Vendor","Recipients","Open Rate","Klaviyo-Attributed Rev","Conversions"],
  rows:[
    ["May 13","0513 CC new drop","New drop","91","39.6%","71.00","1"],
    ["May 20","0520 MAMC","MAMC","457","32.9%","0.00","0"],
    ["May 27","0527 MAMC","MAMC","774","34.4%","41.00","1"],
    ["Jun 03","0603 Outthe Blue","Outtheblue","428","66.0%","56.91","1"],
    ["Jun 10","0610 Outthe Blue vol.2","Outtheblue","536","62.1%","258.22","1"],
    ["Jun 13","0613 MAMC","MAMC","536","59.6%","316.70","1"],
    ["Jun 17","0617 2th Desire","2th Desire","552","61.5%","75.00","1"],
    ["TOTAL (6 weeks)","7 campaigns","—","3374","~51% avg","818.83","6"],
  ]
};

const yoy = {
  headers:["2026 Week","2026 GMV","2025 Matched Week","2025 GMV","2025 Orders","YoY Δ"],
  rows:[
    ["May 11–17","12555.04","wk of May 12 2025","3909.81","23","+221%"],
    ["May 18–24","16016.78","wk of May 19 2025","3478.49","25","+360%"],
    ["May 25–31","13905.39","wk of May 26 2025","7821.55","47","+78%"],
    ["Jun 1–7","17663.96","wk of Jun 02 2025","18559.83","195","-4.8%"],
    ["Jun 8–14","15074.88","wk of Jun 09 2025","18199.18","171","-17.2%"],
    ["Jun 15–21","13916.50","wk of Jun 16 2025","22144.84","214","-37.2%"],
  ]
};

const sheets = [
  ["Summary", "Canton Collective — Weekly Performance (May 11 – Jun 21, 2026) · GMV = total_sales", kpi],
  ["Decomposition","WHY — GMV = Sessions × Conv Rate × AOV (WoW contributions)", decomp],
  ["Funnel","Funnel stages + discounts/returns (pre-attribution check)", funnel],
  ["Traffic Sources","Revenue & orders by referrer source", traffic],
  ["Vendor Shares","Vendor GMV $ and % share of store, by week", vendorSheet],
  ["Products","Top products GMV by week — climbers & decliners", products],
  ["Email (Klaviyo)","Campaign sends & attributed revenue — channel is underutilized", email],
  ["YoY","Year-over-year vs 2025", yoy],
];

// ===== SpreadsheetML (.xls) =====
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function isNum(v){return typeof v==='string' && /^-?\d+(\.\d+)?$/.test(v);}
function cell(v){return isNum(v)?`<Cell><Data ss:Type="Number">${v}</Data></Cell>`:`<Cell><Data ss:Type="String">${esc(v)}</Data></Cell>`;}
function hcell(v){return `<Cell ss:StyleID="hdr"><Data ss:Type="String">${esc(v)}</Data></Cell>`;}
function tcell(v){return `<Cell ss:StyleID="title"><Data ss:Type="String">${esc(v)}</Data></Cell>`;}
let xml=`<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n<Styles>\n<Style ss:ID="title"><Font ss:Bold="1" ss:Size="13"/></Style>\n<Style ss:ID="hdr"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#2F5597" ss:Pattern="Solid"/></Style>\n</Styles>\n`;
sheets.forEach(([name,title,sh])=>{
  xml+=`<Worksheet ss:Name="${esc(name)}">\n<Table>\n<Row>${tcell(title)}</Row>\n<Row></Row>\n<Row>${sh.headers.map(hcell).join('')}</Row>\n`;
  sh.rows.forEach(r=>{xml+=`<Row>${r.map(cell).join('')}</Row>\n`;});
  xml+=`</Table>\n</Worksheet>\n`;
});
xml+=`</Workbook>\n`;
fs.writeFileSync("Canton_Collective_Weekly_Report_May11-Jun21_2026.xls", xml, 'utf8');

// ===== CSV (for Google Drive native Sheet) =====
function csvCell(v){ v=String(v); return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }
let csv="";
sheets.forEach(([name,title,sh])=>{
  csv+=`### ${name} — ${title}\n`;
  csv+=sh.headers.map(csvCell).join(",")+"\n";
  sh.rows.forEach(r=>{csv+=r.map(csvCell).join(",")+"\n";});
  csv+="\n";
});
fs.writeFileSync("Canton_Collective_Weekly_Report.csv", csv, 'utf8');

// ===== HTML dashboard =====
const verdictColor={"WORSE":"#c0392b","WORSE (marginal)":"#e67e22","FLAT":"#7f8c8d","BETTER":"#27ae60"};
function card(w){
  const r=kpi.rows[kpi.rows.findIndex(x=>x[0]===w)];
  const vc=verdictColor[r[9]]||"#555";
  // vendor shares this week
  const idx=weeks.indexOf(w);
  const vrows=vendors.filter(v=>v[idx+1]>0).sort((a,b)=>b[idx+1]-a[idx+1]).map(v=>{
    const cur=v[idx+1], prev= idx>0? v[idx]: null;
    const curp=100*cur/wkTot[idx], prevp= idx>0? 100*v[idx]/wkTot[idx-1]: null;
    const shift= prevp!=null? (curp-prevp):null;
    const shiftStr= shift==null?"—":(shift>=0?"+":"")+shift.toFixed(1)+"pp";
    const shiftCol= shift==null?"#999":(Math.abs(shift)>=3?(shift>0?"#27ae60":"#c0392b"):"#666");
    return `<tr><td>${v[0]}</td><td style="text-align:right">$${cur.toFixed(0)}</td><td style="text-align:right">${curp.toFixed(1)}%</td><td style="text-align:right;color:${shiftCol}">${shiftStr}</td></tr>`;
  }).join("");
  const t=traffic.rows[idx];
  return `<div class="card">
   <div class="banner" style="background:${vc}">
     <div class="wk">${w} 2026</div><div class="verdict">${r[9]}</div>
     <div class="sub">GMV $${(+r[1]).toLocaleString()} · vs 4-wk avg ${r[7]} · ${decomp.rows[idx][6]}</div>
   </div>
   <div class="scores">
     <div class="s"><div class="lbl">GMV</div><div class="val">$${(+r[1]/1000).toFixed(1)}K</div><div class="d">WoW ${r[6]} · YoY ${r[8]}</div></div>
     <div class="s"><div class="lbl">Orders</div><div class="val">${r[2]}</div><div class="d">AOV $${r[3]}</div></div>
     <div class="s"><div class="lbl">Sessions</div><div class="val">${(+r[4]/1000).toFixed(1)}K</div><div class="d">CVR ${r[5]}</div></div>
   </div>
   <div class="why"><b>Why:</b> Sessions ${decomp.rows[idx][1]} · CVR ${decomp.rows[idx][2]} · AOV ${decomp.rows[idx][3]} &nbsp;→&nbsp; ${decomp.rows[idx][6]}</div>
   <div class="tblwrap"><table><thead><tr><th>Vendor</th><th>GMV</th><th>Share</th><th>Shift</th></tr></thead><tbody>${vrows}</tbody></table></div>
   <div class="traffic">Direct/Unknown $${(+t[1]).toFixed(0)} · Social $${(+t[3]).toFixed(0)} · Search $${(+t[5]).toFixed(0)}</div>
  </div>`;
}
const html=`<!doctype html><html><head><meta charset="utf-8"><title>Canton Collective Weekly Dashboard</title>
<style>
body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#0f1115;color:#e6e6e6;margin:0;padding:24px}
h1{font-size:22px;margin:0 0 4px}h2{font-size:13px;color:#9aa;margin:0 0 20px;font-weight:400}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:16px}
.card{background:#1a1d24;border:1px solid #2a2e38;border-radius:12px;overflow:hidden}
.banner{padding:12px 14px;color:#fff}.banner .wk{font-size:12px;opacity:.85}.banner .verdict{font-size:20px;font-weight:700}
.banner .sub{font-size:11px;opacity:.9;margin-top:2px}
.scores{display:flex;border-bottom:1px solid #2a2e38}.s{flex:1;padding:10px 8px;text-align:center;border-right:1px solid #2a2e38}.s:last-child{border:0}
.s .lbl{font-size:10px;color:#8a90a0;text-transform:uppercase}.s .val{font-size:18px;font-weight:700;margin:2px 0}.s .d{font-size:10px;color:#9aa}
.why{padding:9px 14px;font-size:11px;color:#cdd;background:#15171d}
.tblwrap{padding:6px 14px}table{width:100%;border-collapse:collapse;font-size:11px}th{text-align:left;color:#8a90a0;font-weight:600;border-bottom:1px solid #2a2e38;padding:3px 0}td{padding:3px 0;border-bottom:1px solid #20232b}
.traffic{padding:8px 14px;font-size:10.5px;color:#9aa;background:#15171d}
.foot{margin-top:22px;font-size:11px;color:#8a90a0;line-height:1.6}
</style></head><body>
<h1>Canton Collective — Weekly Performance Dashboard</h1>
<h2>May 11 – Jun 21, 2026 · GMV = total_sales · verdict vs trailing 4-week average</h2>
<div class="grid">${weeks.map(card).join("")}</div>
<div class="foot">
<b>Headline (Jun 15–21):</b> MAMC overtakes 1Jinn Studio as the #1 vendor for the first time — 39.0% vs 25.7% (MAMC +16.7pp WoW, 1Jinn −9.8pp). Verdict WORSE: GMV $13.9K, −7.7% WoW, −11.2% vs 4-wk avg.<br>
<b>Cross-period read:</b> Conversion stays soft (CVR 0.56→0.44→0.42% over 3 wks, browse→cart leak), not traffic (sessions flat ~26K). AOV slipped off its $108 peak to $106.56 after climbing 5 weeks.<br>
<b>Winning vendor:</b> MAMC now broad across 12 SKUs — Lavender Floral hero $847, new climber Dusty Rose Bandeau $737, Green Fold Over Skirt $607. 1Jinn ceding share 46%→26% since mid-May; Outtheblue spiked then faded (6.6%→0.8%).<br>
<b>Email (Klaviyo):</b> 7 campaigns, only ~$819 attributed total; this week 1 send (0617 2th Desire) $75 / 1 conv at 61.5% open — underutilized. <b>Blind spot:</b> Meta CC ad account (SGD) UNSETTLED / not queryable.
</div>
</body></html>`;
fs.writeFileSync("Canton_Collective_Weekly_Dashboard.html", html, 'utf8');

console.log("OK xls", xml.length, "csv", csv.length, "html", html.length);
