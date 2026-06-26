const fs = require('fs');
const zlib = require('zlib');

/* ===================== DATA ===================== */
const wkTot = {0:12555.04,1:16016.78,2:13905.39,3:17663.96,4:15074.88,5:13916.50};
const weekName = ["May 11–17","May 18–24","May 25–31","Jun 1–7","Jun 8–14","Jun 15–21"];

const kpi = [ // week, GMV, Orders, AOV, Sessions, CVR, WoW, vs4wk, YoY, Verdict
 ["May 11–17",12555.04,139,94.58,20391,"0.55%","-4.9%","-36.6%","+221%","WORSE"],
 ["May 18–24",16016.78,166,97.34,24221,"0.61%","+27.6%","-5.8%","+360%","WORSE (marginal)"],
 ["May 25–31",13905.39,140,99.80,25212,"0.48%","-13.2%","-4.9%","+78%","FLAT"],
 ["Jun 1–7",17663.96,163,105.71,26887,"0.56%","+27.0%","+26.9%","-4.8%","BETTER"],
 ["Jun 8–14",15074.88,133,108.00,25874,"0.44%","-14.7%","+0.3%","-17.2%","FLAT"],
 ["Jun 15–21",13916.50,128,106.56,25933,"0.42%","-7.7%","-11.2%","-37.2%","WORSE"],
];
const decomp = [ // transition, sess, cvr, aov, orders, gmv, driver
 ["May 04 → May 11","-18.8%","-4.8%","+12.3%","-12.0%","-4.9%","Traffic collapse, cushioned by AOV"],
 ["May 11 → May 18","+18.8%","+9.6%","+2.9%","+19.4%","+27.6%","Traffic rebound + conversion lift"],
 ["May 18 → May 25","+4.1%","-21.6%","+2.5%","-15.7%","-13.2%","CONVERSION collapse (browse→cart)"],
 ["May 25 → Jun 01","+6.6%","+17.2%","+5.9%","+16.4%","+27.0%","Broad-based: all three positive"],
 ["Jun 01 → Jun 08","-3.8%","-21.7%","+2.2%","-18.4%","-14.7%","CONVERSION collapse (browse→cart)"],
 ["Jun 08 → Jun 15","+0.2%","-2.9%","-1.3%","-3.8%","-7.7%","Conversion stays soft + AOV slips off peak (traffic flat)"],
];
const funnel = [ // week, sess, cart, reached, completed, cvr, disc, ret
 ["May 11–17",20391,854,285,113,"0.55%",-2427.49,-1771.11],
 ["May 18–24",24221,1070,402,147,"0.61%",-1856.85,-1658.25],
 ["May 25–31",25212,957,319,120,"0.48%",-2166.15,-1159.09],
 ["Jun 1–7",26887,1042,327,150,"0.56%",-1822.65,-1016.10],
 ["Jun 8–14",25874,869,289,113,"0.44%",-2177.46,-428.99],
 ["Jun 15–21",25933,925,275,110,"0.42%",-1498.37,-561.62],
];
const traffic = [ // week, direct$, directOrd, social$, socialOrd, search$, searchOrd
 ["May 11–17",7998.46,89,3369.02,39,1187.56,11],
 ["May 18–24",10709.87,104,3544.61,39,1762.30,23],
 ["May 25–31",8783.94,86,3043.26,31,2078.19,23],
 ["Jun 1–7",11588.80,104,3483.83,33,2591.33,26],
 ["Jun 8–14",9522.26,82,3767.02,35,1785.60,16],
 ["Jun 15–21",9299.36,78,2901.45,33,1715.69,17],
];
const vendors = [ // name + $ by week index 0..5
 ["1Jinn Studio",5818.08,5860.65,5007.61,5554.53,5355.42,3572.62],
 ["MAMC",0,1569.91,3438.04,3805.37,3354.41,5424.71],
 ["2th Desire",2270.44,2595.74,1504.74,3642.84,1985.62,1725.62],
 ["Deleteex",2277.37,2930.20,1937.97,2211.05,2078.62,1590.93],
 ["First Floor",589.39,804.79,1095.43,804.64,459.99,555.49],
 ["Outtheblue",0,0,0,79.00,989.58,109.97],
 ["1Jinn M2M",212.84,595.88,94.90,241.03,55.16,198.03],
 ["(blank = shipping)",1310.42,1640.01,846.30,1254.60,740.08,725.20],
];
const products = [ // name + GMV by week (idx 0..5) + trend at [7]
 ["Lavender Floral Chiffon Slip Mini Dress (MAMC)",0,512.05,1201.20,1197.35,771.16,847.43,"CLIMBER / hero"],
 ["Dusty Rose Layered Gauze Bandeau Top (MAMC)",0,0,0,0,0,737.11,"NEW CLIMBER"],
 ["Green Fold Over Asymmetric Hem Midi Skirt (MAMC)",0,0,391.00,326.40,397.63,607.41,"CLIMBER"],
 ["Ruffle Trim Gingham Babydoll Mini Dress (MAMC)",0,0,295.63,0,432.67,159.80,"Emerging"],
 ["Retro Camisole Layer Top (2th Desire)",803.61,344.34,276.58,693.66,547.90,397.29,"Volatile core"],
 ["Y2K Beaded Multi Strap Top",522.69,616.46,321.20,331.17,594.51,460.85,"Core, oscillating"],
 ["Shell Buttons Front Puff Sleeve Shirt",705.29,567.11,361.65,0,458.22,281.07,"Soft core"],
 ["Midnight Meow Zip Up Cat Ear Hoodie",422.96,569.26,580.26,530.75,431.75,156.74,"Fading"],
 ["Metal Flower Pleated Strapless Mini Dress",0,549.09,540.65,0,0,0,"DECLINING (gone)"],
 ["Polka Dot Stripe Henley Tank 3pc Set",761.92,507.99,464.84,464.84,339.01,0,"DECLINING (gone)"],
];
const email = [ // wkIdx, date, campaign, theme, recip, open, rev, conv
 [0,"May 13","0513 CC new drop","New drop",91,"39.6%",71.00,1],
 [1,"May 20","0520 MAMC","MAMC",457,"32.9%",0.00,0],
 [2,"May 27","0527 MAMC","MAMC",774,"34.4%",41.00,1],
 [3,"Jun 03","0603 Outthe Blue","Outtheblue",428,"66.0%",56.91,1],
 [4,"Jun 10","0610 Outthe Blue vol.2","Outtheblue",536,"62.1%",258.22,1],
 [4,"Jun 13","0613 MAMC","MAMC",536,"59.6%",316.70,1],
 [5,"Jun 17","0617 2th Desire","2th Desire",552,"61.5%",75.00,1],
];
const yoy = [
 ["May 11–17",12555.04,"wk of May 12 2025",3909.81,23,"+221%"],
 ["May 18–24",16016.78,"wk of May 19 2025",3478.49,25,"+360%"],
 ["May 25–31",13905.39,"wk of May 26 2025",7821.55,47,"+78%"],
 ["Jun 1–7",17663.96,"wk of Jun 02 2025",18559.83,195,"-4.8%"],
 ["Jun 8–14",15074.88,"wk of Jun 09 2025",18199.18,171,"-17.2%"],
 ["Jun 15–21",13916.50,"wk of Jun 16 2025",22144.84,214,"-37.2%"],
];

function sharePct(v,i){ return v>0 ? (100*v/wkTot[i]).toFixed(1)+"%" : "—"; }

/* Build month tab blocks for given week indices */
function monthBlocks(idxs){
  const blocks=[];
  blocks.push({title:"KPIs by week (GMV = total_sales)", headers:["Week","GMV","Orders","AOV","Sessions","Conv Rate","WoW GMV","vs 4-wk Avg","YoY GMV","Verdict"],
    rows: idxs.map(i=>kpi[i])});
  // decomposition transitions ending within the month
  const decIdx = idxs.map(i=> i); // decomp[i] is transition ending at week i
  blocks.push({title:"WHY — decomposition (GMV = Sessions × Conv Rate × AOV)", headers:["Transition","Sessions Δ","Conv Rate Δ","AOV Δ","Orders Δ","GMV Δ","Primary driver"],
    rows: decIdx.map(i=>decomp[i])});
  blocks.push({title:"Funnel + discounts & returns", headers:["Week","Sessions","Cart Adds","Reached Checkout","Completed","Conv Rate","Discounts","Returns"],
    rows: idxs.map(i=>funnel[i])});
  blocks.push({title:"Traffic by referrer source", headers:["Week","Direct/Unknown $","Ord","Social $","Ord","Search $","Ord"],
    rows: idxs.map(i=>traffic[i])});
  // vendor share matrix for the month weeks
  blocks.push({title:"Vendor GMV share (% of store)", headers:["Vendor",...idxs.map(i=>weekName[i])],
    rows: vendors.map(v=>[v[0],...idxs.map(i=>sharePct(v[i+1],i))])});
  blocks.push({title:"Vendor GMV ($)", headers:["Vendor",...idxs.map(i=>weekName[i])],
    rows: vendors.map(v=>[v[0],...idxs.map(i=> v[i+1])])});
  blocks.push({title:"Top products — GMV by week", headers:["Product",...idxs.map(i=>weekName[i]),"Trend"],
    rows: products.map(p=>[p[0],...idxs.map(i=>p[i+1]),p[7]])});
  blocks.push({title:"Email campaigns (Klaviyo)", headers:["Send Date","Campaign","Theme","Recipients","Open Rate","Attributed Rev","Conv"],
    rows: email.filter(e=>idxs.includes(e[0])).map(e=>e.slice(1))});
  return blocks;
}

const summaryBlocks=[
 {title:"Canton Collective — Weekly Performance · May 11 – Jun 21, 2026 (GMV = total_sales)", headers:null, rows:[]},
 {title:"KPIs — all 6 weeks", headers:["Week","GMV","Orders","AOV","Sessions","Conv Rate","WoW GMV","vs 4-wk Avg","YoY GMV","Verdict"], rows:kpi},
 {title:"Key findings", headers:["#","Finding"], rows:[
   [1,"HEADLINE (Jun 15–21): MAMC overtakes 1Jinn Studio as #1 vendor for the first time — 39.0% vs 25.7% (MAMC +16.7pp WoW, 1Jinn −9.8pp)."],
   [2,"Verdict WORSE: GMV $13,916.50, −7.7% WoW, −11.2% vs trailing 4-wk avg."],
   [3,"Conversion stays soft: CVR 0.56→0.44→0.42% over 3 weeks; browse→cart leak persists. Traffic flat (~26K sessions)."],
   [4,"AOV slipped off its peak: $108.00 → $106.56 after climbing every week May–early June."],
   [5,"MAMC win is broad (12 SKUs selling): Lavender Floral hero $847, NEW climber Dusty Rose Bandeau $737, Green Fold Over Skirt $607."],
   [6,"1Jinn Studio ceding share 46% → 26% since mid-May; Outtheblue spiked then faded (6.6% → 0.8%)."],
   [7,"Email underutilized: 1 send this week (0617 2th Desire) $75 / 1 conv at 61.5% open; 7 campaigns ~$819 attributed total."],
   [8,"Blind spot: Meta CC ad account (SGD) UNSETTLED / not queryable — paid-social spend unverified."],
   [9,"YoY −37.2% vs Jun 2025 (214 orders @ $97 last year vs 128 @ $107 now) — June 2025 already scaled."],
 ]},
];

const sheets=[
 {name:"Summary", cols:[34,12,9,9,11,11,11,12,11,17], blocks:summaryBlocks},
 {name:"May 2026", cols:[40,13,9,13,9,13,9,13,9,13], blocks:monthBlocks([0,1,2])},
 {name:"June 2026", cols:[40,15,9,15,9,13,9], blocks:monthBlocks([3,4,5])},
 {name:"YoY", cols:[14,13,20,13,13,10], blocks:[{title:"Year-over-year vs 2025", headers:["2026 Week","2026 GMV","2025 Matched Week","2025 GMV","2025 Orders","YoY Δ"], rows:yoy}]},
];

/* ===================== XLSX WRITER ===================== */
function colLetter(n){let s="";n++;while(n>0){let m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=(n-m-1)/26;}return s;}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function isNum(v){return typeof v==='number';}

function sheetXml(sheet){
  let rows=[]; let r=0;
  function pushRow(cells){ // cells: [{v, s}]
    r++;
    let c=cells.map((cell,ci)=>{
      const ref=colLetter(ci)+r;
      if(cell.v===null||cell.v===undefined||cell.v==="") return `<c r="${ref}"${cell.s?` s="${cell.s}"`:""}/>`;
      if(isNum(cell.v)) return `<c r="${ref}"${cell.s?` s="${cell.s}"`:""}><v>${cell.v}</v></c>`;
      return `<c r="${ref}"${cell.s?` s="${cell.s}"`:""} t="inlineStr"><is><t xml:space="preserve">${esc(cell.v)}</t></is></c>`;
    }).join("");
    rows.push(`<row r="${r}">${c}</row>`);
  }
  sheet.blocks.forEach((b,bi)=>{
    if(bi>0) pushRow([{v:""}]); // blank spacer
    pushRow([{v:b.title, s:3}]); // title style
    if(b.headers){ pushRow(b.headers.map(h=>({v:h, s:2}))); }
    b.rows.forEach(row=> pushRow(row.map(v=>({v, s:0}))) );
  });
  let cols="";
  if(sheet.cols){ cols="<cols>"+sheet.cols.map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1"/>`).join("")+"</cols>"; }
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="15"/>${cols}<sheetData>${rows.join("")}</sheetData></worksheet>`;
}

const stylesXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="4">
<font><sz val="11"/><name val="Calibri"/></font>
<font><b/><sz val="11"/><name val="Calibri"/></font>
<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
<font><b/><sz val="13"/><color rgb="FF1F3864"/><name val="Calibri"/></font>
</fonts>
<fills count="3">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF2F5597"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="4">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

const sheetFiles = sheets.map((s,i)=>({name:`xl/worksheets/sheet${i+1}.xml`, data:sheetXml(s)}));
const workbookXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s,i)=>`<sheet name="${esc(s.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join("")}</sheets></workbook>`;
const wbRels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((s,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join("")}<Relationship Id="rId${sheets.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
const coreXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:creator>Canton Collective</dc:creator><cp:lastModifiedBy>Canton Collective</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">2026-06-15T00:00:00Z</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">2026-06-15T00:00:00Z</dcterms:modified></cp:coreProperties>`;
const appXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Canton Collective Report</Application></Properties>`;
const contentTypes=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets.map((s,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`;
const rootRels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`;

const files=[
 {name:"[Content_Types].xml", data:contentTypes},
 {name:"_rels/.rels", data:rootRels},
 {name:"docProps/core.xml", data:coreXml},
 {name:"docProps/app.xml", data:appXml},
 {name:"xl/workbook.xml", data:workbookXml},
 {name:"xl/_rels/workbook.xml.rels", data:wbRels},
 {name:"xl/styles.xml", data:stylesXml},
 ...sheetFiles,
];

/* ZIP (deflate) with CRC32 */
const crcTable=(()=>{let t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc32(buf){let c=0xFFFFFFFF;for(let i=0;i<buf.length;i++)c=crcTable[(c^buf[i])&0xFF]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
function dosTime(){return 0;} function dosDate(){return 0x21;} // 1980-01-01
let local=[]; let central=[]; let offset=0;
files.forEach(f=>{
  const data=Buffer.from(f.data,'utf8');
  const comp=zlib.deflateRawSync(data);
  const crc=crc32(data);
  const nameBuf=Buffer.from(f.name,'utf8');
  const lh=Buffer.alloc(30);
  lh.writeUInt32LE(0x04034b50,0); lh.writeUInt16LE(20,4); lh.writeUInt16LE(0,6); lh.writeUInt16LE(8,8);
  lh.writeUInt16LE(dosTime(),10); lh.writeUInt16LE(dosDate(),12); lh.writeUInt32LE(crc,14);
  lh.writeUInt32LE(comp.length,18); lh.writeUInt32LE(data.length,22); lh.writeUInt16LE(nameBuf.length,26); lh.writeUInt16LE(0,28);
  local.push(lh,nameBuf,comp);
  const ch=Buffer.alloc(46);
  ch.writeUInt32LE(0x02014b50,0); ch.writeUInt16LE(20,4); ch.writeUInt16LE(20,6); ch.writeUInt16LE(0,8); ch.writeUInt16LE(8,10);
  ch.writeUInt16LE(dosTime(),12); ch.writeUInt16LE(dosDate(),14); ch.writeUInt32LE(crc,16);
  ch.writeUInt32LE(comp.length,20); ch.writeUInt32LE(data.length,24); ch.writeUInt16LE(nameBuf.length,28);
  ch.writeUInt16LE(0,30); ch.writeUInt16LE(0,32); ch.writeUInt16LE(0,34); ch.writeUInt16LE(0,36); ch.writeUInt32LE(0,38); ch.writeUInt32LE(offset,42);
  central.push(ch,nameBuf);
  offset += lh.length+nameBuf.length+comp.length;
});
const localBuf=Buffer.concat(local); const centralBuf=Buffer.concat(central);
const eocd=Buffer.alloc(22);
eocd.writeUInt32LE(0x06054b50,0); eocd.writeUInt16LE(0,4); eocd.writeUInt16LE(0,6);
eocd.writeUInt16LE(files.length,8); eocd.writeUInt16LE(files.length,10);
eocd.writeUInt32LE(centralBuf.length,12); eocd.writeUInt32LE(localBuf.length,16); eocd.writeUInt16LE(0,20);
const zip=Buffer.concat([localBuf,centralBuf,eocd]);
fs.writeFileSync("Canton_Collective_Weekly_Report.xlsx", zip);
fs.writeFileSync("xlsx_base64.txt", zip.toString('base64'));
console.log("XLSX bytes:", zip.length, "base64 len:", zip.toString('base64').length);
