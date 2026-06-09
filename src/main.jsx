import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

const SUPABASE_URL = "https://tcsegbcefajkvfqfluyy.supabase.co";
const SUPABASE_KEY = "sb_publishable_47tBfn1y8qMzNQIe8W-opg_hl4cUF4X";
const H = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Prefer": "return=representation",
};

async function sbInsert(row) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/drone_logs`, {
    method: "POST", headers: H, body: JSON.stringify({ ...row, mission_date: row.mission_date || null })
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function sbSelect() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/drone_logs?select=*&order=mission_date.desc`, { headers: H });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

const EMPTY = {
  model:"亞拓 Align M3 任務無人機", serial:"C263001106", reg_no:"B-AAB14292",
  valid_until:"2028/05/13", insurer:"○○產物保險公司", insurer_tel:"0800-000000",
  policy_no:"F0-115-10056458-00001-G10", insurance_until:"2026/05/23",
  mission_date:"", drm_arrive:"", drm_leave:"", uav_takeoff:"", uav_land:"",
  prev_total:"", mission_hours:"", total_hours:"",
  prev_abnormal:"無", prev_abnormal_desc:"",
  accident_causes:[], accident_results:[], accident_other:"",
  lng:"120.663627", lat:"24.182629", twd97_e:"215817.078", twd97_n:"2675245.488",
  admin_area:"臺中市西屯區", land_section:"鑫大鵬段", land_no:"3地號內",
  airspace_color:"", caa_approval:"", gov_approval:"",
  mission_types:[], mission_other:"", mission_dispatcher_rank:"", mission_dispatcher_name:"",
  pilot_name:"龍奕均", pilot_cert_type:"專業基本級(Ⅰ)", pilot_cert_period:"2025/12/18～2028/12/17", pilot_cert_no:"F22757168",
  obs_name:"李 康", obs_cert_type:"", obs_cert_period:"", obs_cert_no:"",
  weather_cwa:[], sunrise:"05:09", sunset:"18:42",
  wind_dir:[], avg_wind:"3.6", wind_level:"1", visibility:"9.66", temp:"35℃/28℃",
  site_weather:[], site_wind:"", site_temp:"", weather_ok:"", weather_observer:"",
  checks:{ prop_before:"",prop_after:"",motor_before:"",motor_after:"",dir_before:"",dir_after:"",
    bat_before:"",bat_after:"",arm_before:"",arm_after:"",body_before:"",body_after:"",
    fc_before:"",fc_after:"",gps_before:"",gps_after:"",elec_before:"",elec_after:"",sys_before:"",sys_after:"" },
  aircraft_ok:"", aerial_normal:false, aerial_abnormal:false, aerial_desc:"",
};

function toggle(arr, val) { return arr.includes(val) ? arr.filter(x=>x!==val) : [...arr, val]; }

// 分鐘換算
function toMin(str) {
  if (!str) return 0;
  const s = str.replace("：",":").trim();
  if (s.includes(":")) {
    const [h,m] = s.split(":").map(Number);
    return (isNaN(h)?0:h)*60 + (isNaN(m)?0:m);
  }
  return parseInt(s)||0;
}
function toHHMM(min) {
  if (!min) return "0時00分";
  const h = Math.floor(min/60), m = min%60;
  return `${h}時${String(m).padStart(2,"0")}分`;
}

// UI 元件
function Chk({ checked, onChange, label, red }) {
  return (
    <label style={{ display:"inline-flex", alignItems:"center", gap:4, marginRight:8, marginBottom:4, cursor:"pointer", fontSize:13, color: red?"#c00":"inherit" }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ width:16, height:16, flexShrink:0 }} />
      {label}
    </label>
  );
}
function Radio({ checked, onChange, label }) {
  return (
    <label style={{ display:"inline-flex", alignItems:"center", gap:4, marginRight:12, cursor:"pointer", fontSize:13 }}>
      <input type="radio" checked={checked} onChange={onChange} style={{ width:16, height:16 }} />
      {label}
    </label>
  );
}
function Field({ label, value, onChange, type="text", placeholder="" }) {
  return (
    <div style={{ marginBottom:10 }}>
      {label && <div style={{ fontSize:12, color:"#666", marginBottom:3 }}>{label}</div>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%", border:"1px solid #ddd", borderRadius:6, padding:"8px 10px", fontSize:14, boxSizing:"border-box", background:"#fafafa" }} />
    </div>
  );
}
function SField({ label, value, onChange, rows=3 }) {
  return (
    <div style={{ marginBottom:10 }}>
      {label && <div style={{ fontSize:12, color:"#666", marginBottom:3 }}>{label}</div>}
      <textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows}
        style={{ width:"100%", border:"1px solid #ddd", borderRadius:6, padding:"8px 10px", fontSize:14, boxSizing:"border-box", resize:"vertical", background:"#fafafa" }} />
    </div>
  );
}
function Section({ title, children, color="#1a3251" }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ background:"#fff", borderRadius:10, marginBottom:12, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.1)" }}>
      <div onClick={()=>setOpen(o=>!o)} style={{ background:color, color:"#fff", padding:"10px 14px", fontWeight:700, fontSize:14, display:"flex", justifyContent:"space-between", cursor:"pointer" }}>
        <span>{title}</span><span>{open?"▲":"▼"}</span>
      </div>
      {open && <div style={{ padding:14 }}>{children}</div>}
    </div>
  );
}
function CheckRow({ label, bv, av, onChange }) {
  return (
    <tr>
      <td style={tdc}>{label}</td>
      <td style={{ ...tdc, textAlign:"center" }}>
        <Radio checked={bv==="是"} onChange={()=>onChange("before","是")} label="是" />
        <Radio checked={bv==="否"} onChange={()=>onChange("before","否")} label="否" />
      </td>
      <td style={{ ...tdc, textAlign:"center" }}>
        <Radio checked={av==="是"} onChange={()=>onChange("after","是")} label="是" />
        <Radio checked={av==="否"} onChange={()=>onChange("after","否")} label="否" />
      </td>
    </tr>
  );
}
const tdc = { border:"1px solid #ddd", padding:"6px 4px", fontSize:12 };
const thc = { border:"1px solid #ddd", padding:"6px 4px", fontSize:12, background:"#f0f4f8", fontWeight:"bold", textAlign:"center" };

// ─── 主元件 ─────────────────────────────────────────────────
export default function App() {
  const [f, setF] = useState(EMPTY);
  const [view, setView] = useState("form");
  const [logs, setLogs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [search, setSearch] = useState({ pilot:"", dateFrom:"", dateTo:"" });
  const [tab, setTab] = useState("form"); // form | stats | history | preview

  function upd(k,v){ setF(p=>({...p,[k]:v})); }
  function updC(k,side,v){ setF(p=>({...p,checks:{...p.checks,[`${k}_${side}`]:v}})); }
  function flash(text,ok=true){ setMsg({text,ok}); setTimeout(()=>setMsg(null),3500); }

  async function save() {
    setSaving(true);
    try {
      await sbInsert({ data:JSON.stringify(f), mission_date:f.mission_date||null, pilot_name:f.pilot_name });
      flash("✅ 儲存成功！");
      if(tab==="history") await loadList();
    } catch(e){ flash("❌ 儲存失敗："+e.message,false); }
    finally { setSaving(false); }
  }

  async function loadList() {
    try { setLogs(await sbSelect()); } catch(e){ flash("載入失敗："+e.message,false); }
  }

  useEffect(()=>{ loadList(); },[]);

  // 統計
  const filtered = logs.filter(l=>{
    const d = l.mission_date||"";
    const p = (l.pilot_name||"").includes(search.pilot);
    const from = !search.dateFrom || d >= search.dateFrom;
    const to = !search.dateTo || d <= search.dateTo;
    return p && from && to;
  });
  const totalMin = filtered.reduce((s,l)=>{
    try { const d=JSON.parse(l.data||"{}"); return s+toMin(d.mission_hours); } catch{ return s; }
  },0);
  const pilots = {};
  filtered.forEach(l=>{
    const name = l.pilot_name||"未知";
    try { const d=JSON.parse(l.data||"{}"); pilots[name]=(pilots[name]||0)+toMin(d.mission_hours); } catch{}
  });

  // ── 列印預覽 ─────────────────────────────────────────────
  if(tab==="preview") return (
    <div>
      <div className="no-print" style={{ position:"fixed",top:0,left:0,right:0,background:"#1a3251",padding:"10px 16px",display:"flex",gap:10,zIndex:999,flexWrap:"wrap" }}>
        <button onClick={()=>window.print()} style={btnB}>🖨 列印/存PDF</button>
        <button onClick={()=>setTab("form")} style={btnG}>← 返回</button>
      </div>
      <div style={{ marginTop:60, padding:16, fontFamily:"標楷體,serif", maxWidth:800, margin:"60px auto 0" }}>
        <PrintForm f={f}/>
      </div>
    </div>
  );

  const navBtn = (t,icon,label) => (
    <button onClick={()=>{ setTab(t); if(t==="history") loadList(); }}
      style={{ flex:1, padding:"10px 4px", border:"none", background: tab===t?"#38b6ff":"#1a3251",
        color:"#fff", fontSize:12, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
      <span style={{ fontSize:18 }}>{icon}</span>{label}
    </button>
  );

  return (
    <div style={{ fontFamily:"sans-serif", background:"#f0f4f8", minHeight:"100vh", paddingBottom:80 }}>
      {/* 頂部 */}
      <div style={{ background:"#1a3251", color:"#fff", padding:"12px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontSize:15, fontWeight:700 }}>✈ 無人機飛航日誌</div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={save} disabled={saving} style={btnB}>{saving?"儲存中…":"💾 儲存"}</button>
          <button onClick={()=>setTab("preview")} style={btnG}>👁 列印</button>
        </div>
      </div>

      {/* 訊息 */}
      {msg && <div style={{ background:msg.ok?"#d4edda":"#f8d7da", color:msg.ok?"#155724":"#721c24", padding:"10px 14px", fontSize:13 }}>{msg.text}</div>}

      {/* 底部導覽 */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, display:"flex", background:"#1a3251", zIndex:999, borderTop:"2px solid #38b6ff" }}>
        {navBtn("form","📝","填寫")}
        {navBtn("stats","📊","統計")}
        {navBtn("history","📋","紀錄")}
      </div>

      {/* ── 填寫表單 ── */}
      {tab==="form" && (
        <div style={{ padding:12, maxWidth:640, margin:"0 auto" }}>

          <Section title="📋 基本資料">
            <Field label="型式" value={f.model} onChange={v=>upd("model",v)}/>
            <Field label="序號" value={f.serial} onChange={v=>upd("serial",v)}/>
            <Field label="註冊號碼" value={f.reg_no} onChange={v=>upd("reg_no",v)}/>
            <Field label="有效期限" value={f.valid_until} onChange={v=>upd("valid_until",v)}/>
            <Field label="保險承攬公司" value={f.insurer} onChange={v=>upd("insurer",v)}/>
            <Field label="公司電話" value={f.insurer_tel} onChange={v=>upd("insurer_tel",v)}/>
            <Field label="保單編號" value={f.policy_no} onChange={v=>upd("policy_no",v)}/>
            <Field label="保險期限" value={f.insurance_until} onChange={v=>upd("insurance_until",v)}/>
          </Section>

          <Section title="🕐 飛航時間與飛安事故" color="#c0392b">
            <Field label="任務日期 *" value={f.mission_date} onChange={v=>upd("mission_date",v)} type="date"/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <Field label="Drone Map 報到" value={f.drm_arrive} onChange={v=>upd("drm_arrive",v)} placeholder="HH:MM"/>
              <Field label="Drone Map 離場" value={f.drm_leave} onChange={v=>upd("drm_leave",v)} placeholder="HH:MM"/>
              <Field label="無人機起飛時間" value={f.uav_takeoff} onChange={v=>upd("uav_takeoff",v)} placeholder="HH:MM"/>
              <Field label="無人機降落時間" value={f.uav_land} onChange={v=>upd("uav_land",v)} placeholder="HH:MM"/>
              <Field label="前次累計飛行時數" value={f.prev_total} onChange={v=>upd("prev_total",v)} placeholder="HH:MM"/>
              <Field label="本次任務飛行時數" value={f.mission_hours} onChange={v=>upd("mission_hours",v)} placeholder="HH:MM"/>
            </div>
            <Field label="目前累計飛行時數" value={f.total_hours} onChange={v=>upd("total_hours",v)} placeholder="HH:MM"/>
            <div style={{ marginBottom:8 }}>
              <div style={{ fontSize:12,color:"#666",marginBottom:4 }}>本機前次日誌有無異常紀錄</div>
              <Radio checked={f.prev_abnormal==="無"} onChange={()=>upd("prev_abnormal","無")} label="無"/>
              <Radio checked={f.prev_abnormal==="有"} onChange={()=>upd("prev_abnormal","有")} label="有"/>
              {f.prev_abnormal==="有" && <Field label="問題描述" value={f.prev_abnormal_desc} onChange={v=>upd("prev_abnormal_desc",v)}/>}
            </div>
            <div style={{ marginBottom:8 }}>
              <div style={{ fontSize:12,color:"#666",marginBottom:4 }}>事故發生原因</div>
              {["機械問題墜落","電池問題墜落","天候問題墜落","操作問題墜落","其它問題墜落"].map(c=>(
                <Chk key={c} checked={f.accident_causes.includes(c)} onChange={()=>upd("accident_causes",toggle(f.accident_causes,c))} label={c}/>
              ))}
            </div>
            <div>
              <div style={{ fontSize:12,color:"#666",marginBottom:4 }}>墜落後造成</div>
              {["機體損毀(未遺失)","機體遺落失蹤","第三人財損","第三人死、傷","其它情形"].map(c=>(
                <Chk key={c} checked={f.accident_results.includes(c)} onChange={()=>upd("accident_results",toggle(f.accident_results,c))} label={c}/>
              ))}
            </div>
          </Section>

          <Section title="📍 空間位置及座標" color="#6a994e">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <Field label="經度" value={f.lng} onChange={v=>upd("lng",v)}/>
              <Field label="緯度" value={f.lat} onChange={v=>upd("lat",v)}/>
              <Field label="TWD97 E" value={f.twd97_e} onChange={v=>upd("twd97_e",v)}/>
              <Field label="TWD97 N" value={f.twd97_n} onChange={v=>upd("twd97_n",v)}/>
            </div>
            <Field label="行政區" value={f.admin_area} onChange={v=>upd("admin_area",v)}/>
            <Field label="地段" value={f.land_section} onChange={v=>upd("land_section",v)}/>
            <Field label="地號" value={f.land_no} onChange={v=>upd("land_no",v)}/>
          </Section>

          <Section title="🛡 空域 / 核准文件" color="#8e44ad">
            {["綠色（120M以下）","黃色（60M以下或申請解禁）","紅色（法人通過審查解禁）"].map(c=>(
              <div key={c}><Chk checked={f.airspace_color===c} onChange={()=>upd("airspace_color",c)} label={c}/></div>
            ))}
            <Field label="民航局核准文號" value={f.caa_approval} onChange={v=>upd("caa_approval",v)}/>
            <Field label="地方政府核准文號" value={f.gov_approval} onChange={v=>upd("gov_approval",v)}/>
          </Section>

          <Section title="🎯 本次任務屬性" color="#e67e22">
            <div style={{ display:"flex", flexWrap:"wrap" }}>
              {["定期空置營區巡查","專案任務飛航","天然災害後飛航巡檢","臨時交辦任務","訓練飛行"].map(c=>(
                <Chk key={c} checked={f.mission_types.includes(c)} onChange={()=>upd("mission_types",toggle(f.mission_types,c))} label={c}/>
              ))}
            </div>
            <Field label="其它" value={f.mission_other} onChange={v=>upd("mission_other",v)}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <Field label="指派人級職" value={f.mission_dispatcher_rank} onChange={v=>upd("mission_dispatcher_rank",v)}/>
              <Field label="指派人姓名" value={f.mission_dispatcher_name} onChange={v=>upd("mission_dispatcher_name",v)}/>
            </div>
          </Section>

          <Section title="👤 任務執行人員">
            <div style={{ fontWeight:"bold", fontSize:13, color:"#1a3251", marginBottom:6 }}>操作員</div>
            <Field label="姓名" value={f.pilot_name} onChange={v=>upd("pilot_name",v)}/>
            <Field label="操作證類別" value={f.pilot_cert_type} onChange={v=>upd("pilot_cert_type",v)}/>
            <Field label="操作證效期" value={f.pilot_cert_period} onChange={v=>upd("pilot_cert_period",v)}/>
            <Field label="操作證編號" value={f.pilot_cert_no} onChange={v=>upd("pilot_cert_no",v)}/>
            <div style={{ fontWeight:"bold", fontSize:13, color:"#1a3251", margin:"10px 0 6px" }}>觀察員</div>
            <Field label="姓名" value={f.obs_name} onChange={v=>upd("obs_name",v)}/>
            <Field label="操作證類別" value={f.obs_cert_type} onChange={v=>upd("obs_cert_type",v)}/>
            <Field label="操作證效期" value={f.obs_cert_period} onChange={v=>upd("obs_cert_period",v)}/>
            <Field label="操作證編號" value={f.obs_cert_no} onChange={v=>upd("obs_cert_no",v)}/>
          </Section>

          <Section title="🌤 氣象資料" color="#2980b9">
            <div style={{ fontWeight:"bold", fontSize:13, marginBottom:6 }}>中央氣象署</div>
            <div style={{ marginBottom:8 }}>
              <div style={{ fontSize:12,color:"#666",marginBottom:4 }}>天候</div>
              {["晴天","多雲","陰天","雨天","其它"].map(w=>(
                <Chk key={w} checked={f.weather_cwa.includes(w)} onChange={()=>upd("weather_cwa",toggle(f.weather_cwa,w))} label={w}/>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <Field label="日出時間" value={f.sunrise} onChange={v=>upd("sunrise",v)}/>
              <Field label="日落時間" value={f.sunset} onChange={v=>upd("sunset",v)}/>
              <Field label="平均風速(m/s)" value={f.avg_wind} onChange={v=>upd("avg_wind",v)}/>
              <Field label="風速等級" value={f.wind_level} onChange={v=>upd("wind_level",v)}/>
              <Field label="能見度(km)" value={f.visibility} onChange={v=>upd("visibility",v)}/>
              <Field label="氣溫" value={f.temp} onChange={v=>upd("temp",v)}/>
            </div>
            <div style={{ marginBottom:8 }}>
              <div style={{ fontSize:12,color:"#666",marginBottom:4 }}>風向</div>
              <div style={{ display:"flex", flexWrap:"wrap" }}>
                {["北風","東北風","東風","東南風","南風","西南風","西風","西北風"].map(w=>(
                  <Chk key={w} checked={f.wind_dir.includes(w)} onChange={()=>upd("wind_dir",toggle(f.wind_dir,w))} label={w}/>
                ))}
              </div>
            </div>
            <div style={{ fontWeight:"bold", fontSize:13, margin:"10px 0 6px" }}>任務地點氣象</div>
            <div style={{ marginBottom:8 }}>
              <div style={{ fontSize:12,color:"#666",marginBottom:4 }}>天候</div>
              {["晴天","多雲","陰天","雨天(禁飛)","日出前日落後(禁飛)"].map(w=>(
                <Chk key={w} checked={f.site_weather.includes(w)} onChange={()=>upd("site_weather",toggle(f.site_weather,w))} label={w} red={w.includes("禁飛")}/>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <Field label="現場平均風速" value={f.site_wind} onChange={v=>upd("site_wind",v)}/>
              <Field label="現場氣溫" value={f.site_temp} onChange={v=>upd("site_temp",v)}/>
            </div>
            <div style={{ marginBottom:8 }}>
              <div style={{ fontSize:12,color:"#666",marginBottom:4 }}>氣象條件綜合評估</div>
              <Radio checked={f.weather_ok==="同意飛行"} onChange={()=>upd("weather_ok","同意飛行")} label="同意飛行"/>
              <Radio checked={f.weather_ok==="禁止飛行"} onChange={()=>upd("weather_ok","禁止飛行")} label="禁止飛行"/>
            </div>
            <Field label="觀察員簽名" value={f.weather_observer} onChange={v=>upd("weather_observer",v)}/>
          </Section>

          <Section title="✅ 機體飛安檢查" color="#16a085">
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:280 }}>
                <thead>
                  <tr>
                    <th style={{ ...thc, textAlign:"left" }}>檢查項目</th>
                    <th style={thc}>飛行前</th>
                    <th style={thc}>飛行後</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td colSpan={3} style={{ ...tdc, background:"#e8f4fd", fontWeight:"bold" }}>動力系統</td></tr>
                  {[["prop","螺旋槳：目視外觀無裂損"],["motor","馬達：確認固裝妥當及無裂損"],["dir","方向性：馬達及螺旋槳正/反槳正確"]].map(([k,l])=>(
                    <CheckRow key={k} label={l} bv={f.checks[`${k}_before`]} av={f.checks[`${k}_after`]} onChange={(s,v)=>updC(k,s,v)}/>
                  ))}
                  <tr><td colSpan={3} style={{ ...tdc, background:"#e8f4fd", fontWeight:"bold" }}>載具</td></tr>
                  {[["bat","電池：檢查外觀、電壓及固裝"],["arm","機臂：外觀確認固裝妥當"],["body","機身及酬載：外觀確認固裝"],["fc","飛行控制器：外觀確認固裝"],["gps","GPS模組：外觀確認固裝"],["elec","電系接頭：外觀確認固裝"],["sys","全系統動態檢查(含操控器)"]].map(([k,l])=>(
                    <CheckRow key={k} label={l} bv={f.checks[`${k}_before`]} av={f.checks[`${k}_after`]} onChange={(s,v)=>updC(k,s,v)}/>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop:10 }}>
              <div style={{ fontSize:12,color:"#666",marginBottom:4 }}>機體條件綜合評估</div>
              <Radio checked={f.aircraft_ok==="同意飛行"} onChange={()=>upd("aircraft_ok","同意飛行")} label="同意飛行"/>
              <Radio checked={f.aircraft_ok==="禁止飛行"} onChange={()=>upd("aircraft_ok","禁止飛行")} label="禁止飛行"/>
            </div>
          </Section>

          <Section title="📸 空拍資訊回饋" color="#7f8c8d">
            <Chk checked={f.aerial_normal} onChange={()=>upd("aerial_normal",!f.aerial_normal)} label="無異狀"/>
            <Chk checked={f.aerial_abnormal} onChange={()=>upd("aerial_abnormal",!f.aerial_abnormal)} label="有異狀"/>
            <SField label="異狀描述" value={f.aerial_desc} onChange={v=>upd("aerial_desc",v)} rows={4}/>
          </Section>

          <div style={{ display:"flex", gap:10, paddingBottom:20 }}>
            <button onClick={save} disabled={saving} style={{ ...btnB, flex:1, padding:14, fontSize:15 }}>{saving?"儲存中…":"💾 儲存紀錄"}</button>
            <button onClick={()=>setTab("preview")} style={{ ...btnG, flex:1, padding:14, fontSize:15 }}>👁 預覽列印</button>
          </div>
        </div>
      )}

      {/* ── 統計 ── */}
      {tab==="stats" && (
        <div style={{ padding:12, maxWidth:640, margin:"0 auto" }}>
          <div style={{ background:"#fff", borderRadius:10, padding:14, marginBottom:12, boxShadow:"0 1px 4px rgba(0,0,0,.1)" }}>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:10, color:"#1a3251" }}>🔍 篩選條件</div>
            <Field label="操作員姓名" value={search.pilot} onChange={v=>setSearch(s=>({...s,pilot:v}))} placeholder="留空顯示全部"/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <Field label="開始日期" value={search.dateFrom} onChange={v=>setSearch(s=>({...s,dateFrom:v}))} type="date"/>
              <Field label="結束日期" value={search.dateTo} onChange={v=>setSearch(s=>({...s,dateTo:v}))} type="date"/>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            <StatCard icon="✈" label="總航班數" value={filtered.length+"　班"} color="#1a3251"/>
            <StatCard icon="⏱" label="總飛行時數" value={toHHMM(totalMin)} color="#c0392b"/>
            <StatCard icon="👥" label="操作員人數" value={Object.keys(pilots).length+"　人"} color="#6a994e"/>
            <StatCard icon="📅" label="平均每班時數" value={filtered.length?toHHMM(Math.round(totalMin/filtered.length)):"—"} color="#8e44ad"/>
          </div>

          {Object.keys(pilots).length>0 && (
            <div style={{ background:"#fff", borderRadius:10, padding:14, boxShadow:"0 1px 4px rgba(0,0,0,.1)" }}>
              <div style={{ fontWeight:700, fontSize:15, marginBottom:10, color:"#1a3251" }}>👤 各操作員飛行時數</div>
              {Object.entries(pilots).sort((a,b)=>b[1]-a[1]).map(([name,min])=>(
                <div key={name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #f0f0f0" }}>
                  <span style={{ fontSize:14 }}>{name}</span>
                  <span style={{ fontWeight:700, color:"#c0392b", fontSize:14 }}>{toHHMM(min)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 歷史紀錄 ── */}
      {tab==="history" && (
        <div style={{ padding:12, maxWidth:640, margin:"0 auto" }}>
          <div style={{ background:"#fff", borderRadius:10, padding:14, marginBottom:12, boxShadow:"0 1px 4px rgba(0,0,0,.1)" }}>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:10, color:"#1a3251" }}>🔍 查詢</div>
            <Field label="操作員姓名" value={search.pilot} onChange={v=>setSearch(s=>({...s,pilot:v}))} placeholder="留空顯示全部"/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <Field label="開始日期" value={search.dateFrom} onChange={v=>setSearch(s=>({...s,dateFrom:v}))} type="date"/>
              <Field label="結束日期" value={search.dateTo} onChange={v=>setSearch(s=>({...s,dateTo:v}))} type="date"/>
            </div>
          </div>

          <div style={{ fontSize:13, color:"#666", marginBottom:8 }}>共 {filtered.length} 筆紀錄</div>

          {filtered.length===0 ? (
            <div style={{ textAlign:"center", padding:40, color:"#aaa" }}>查無紀錄</div>
          ) : filtered.map((l,i)=>{
            let d={};
            try{ d=JSON.parse(l.data||"{}"); }catch{}
            return (
              <div key={i} style={{ background:"#fff", borderRadius:10, padding:14, marginBottom:10, boxShadow:"0 1px 4px rgba(0,0,0,.1)", cursor:"pointer" }}
                onClick={()=>{ setF({...EMPTY,...d,checks:{...EMPTY.checks,...(d.checks||{})}}); setTab("preview"); }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, color:"#1a3251" }}>{l.mission_date||"（未填日期）"}</div>
                    <div style={{ fontSize:13, color:"#555", marginTop:3 }}>操作員：{l.pilot_name||"—"}</div>
                    <div style={{ fontSize:13, color:"#555" }}>本次時數：{d.mission_hours||"—"}</div>
                    <div style={{ fontSize:12, color:"#aaa", marginTop:2 }}>{d.mission_types?.join("、")||""}</div>
                  </div>
                  <div style={{ background:"#38b6ff", color:"#fff", borderRadius:6, padding:"4px 10px", fontSize:12, flexShrink:0 }}>查看 →</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background:color, borderRadius:10, padding:"14px 12px", color:"#fff", textAlign:"center" }}>
      <div style={{ fontSize:24 }}>{icon}</div>
      <div style={{ fontSize:11, opacity:.8, marginTop:4 }}>{label}</div>
      <div style={{ fontSize:18, fontWeight:700, marginTop:4 }}>{value}</div>
    </div>
  );
}

// ── 列印版 ──────────────────────────────────────────────────
function PrintForm({ f }) {
  const c = { border:"1px solid #333", padding:"3px 6px", fontSize:11 };
  const h = { ...c, background:"#eee", fontWeight:"bold", textAlign:"center" };
  const sec = { background:"#c00", color:"#fff", textAlign:"center", fontWeight:"bold", fontSize:13, padding:"3px 0", margin:"8px 0 4px" };
  const secG = { ...sec, background:"#6a994e" };
  return (
    <div style={{ fontFamily:"標楷體,serif", color:"#000" }}>
      <style>{`@media print{.no-print{display:none!important}}`}</style>
      <h2 style={{ textAlign:"center", letterSpacing:6, fontSize:18, margin:"0 0 4px" }}>遙控無人多旋翼機飛航日誌</h2>
      <div style={{ textAlign:"right", fontSize:11, marginBottom:6 }}>編號：115-M3SE-0001　附表7</div>
      <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:6 }}>
        <tbody>
          <tr><td colSpan={6} style={h}>遙控無人多旋翼機基本資料</td></tr>
          <tr>
            <td style={h}>型式</td><td style={c} colSpan={2}>{f.model}</td>
            <td style={h}>序號</td><td style={c}>{f.serial}</td>
            <td style={c}>註冊：{f.reg_no}　有效：{f.valid_until}</td>
          </tr>
          <tr>
            <td style={h}>保險公司</td><td style={c}>{f.insurer} {f.insurer_tel}</td>
            <td style={h}>保單</td><td style={c} colSpan={2}>{f.policy_no}</td>
            <td style={c}>保險期限：{f.insurance_until}</td>
          </tr>
        </tbody>
      </table>
      <div style={sec}>飛航時間與飛安事故相關紀錄</div>
      <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:6 }}>
        <tbody>
          <tr><td style={h}>任務日期</td><td style={c}>{f.mission_date}</td><td style={h}>報到時間</td><td style={c}>{f.drm_arrive}</td><td style={h}>離場時間</td><td style={c}>{f.drm_leave}</td></tr>
          <tr><td style={h}>起飛時間</td><td style={c}>{f.uav_takeoff}</td><td style={h}>降落時間</td><td style={c}>{f.uav_land}</td><td style={h}>本次時數</td><td style={c}>{f.mission_hours}</td></tr>
          <tr><td style={h}>前次累計</td><td style={c}>{f.prev_total}</td><td style={h}>目前累計</td><td style={c}>{f.total_hours}</td><td style={h}>前次異常</td><td style={c}>{f.prev_abnormal} {f.prev_abnormal_desc}</td></tr>
          <tr><td style={h}>事故原因</td><td style={c} colSpan={2}>{f.accident_causes.join("、")||"無"}</td><td style={h}>墜落結果</td><td style={c} colSpan={2}>{f.accident_results.join("、")||"無"}</td></tr>
        </tbody>
      </table>
      <div style={sec}>空間位置及座標相關紀錄</div>
      <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:6 }}>
        <tbody>
          <tr><td style={h}>經度</td><td style={c}>{f.lng}</td><td style={h}>緯度</td><td style={c}>{f.lat}</td><td style={h}>TWD97 E/N</td><td style={c}>{f.twd97_e} / {f.twd97_n}</td></tr>
          <tr><td style={h}>行政區</td><td style={c}>{f.admin_area}</td><td style={h}>地段</td><td style={c}>{f.land_section}</td><td style={h}>地號</td><td style={c}>{f.land_no}</td></tr>
        </tbody>
      </table>
      <div style={sec}>本次任務屬性 / 空域</div>
      <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:6 }}>
        <tbody>
          <tr><td style={h}>任務類型</td><td style={c} colSpan={3}>{f.mission_types.join("、")||"—"} {f.mission_other}</td><td style={h}>指派人</td><td style={c}>{f.mission_dispatcher_rank} {f.mission_dispatcher_name}</td></tr>
          <tr><td style={h}>空域</td><td style={c}>{f.airspace_color||"—"}</td><td style={h}>民航局</td><td style={c}>{f.caa_approval||"—"}</td><td style={h}>地方政府</td><td style={c}>{f.gov_approval||"—"}</td></tr>
        </tbody>
      </table>
      <div style={sec}>任務執行人員資料</div>
      <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:6 }}>
        <tbody>
          <tr><td style={h} colSpan={2}>操作員</td><td style={h} colSpan={2}>觀察員</td></tr>
          <tr><td style={h}>姓名</td><td style={c}>{f.pilot_name}</td><td style={h}>姓名</td><td style={c}>{f.obs_name}</td></tr>
          <tr><td style={h}>證別</td><td style={c}>{f.pilot_cert_type}</td><td style={h}>證別</td><td style={c}>{f.obs_cert_type}</td></tr>
          <tr><td style={h}>效期</td><td style={c}>{f.pilot_cert_period}</td><td style={h}>效期</td><td style={c}>{f.obs_cert_period}</td></tr>
          <tr><td style={h}>編號</td><td style={c}>{f.pilot_cert_no}</td><td style={h}>編號</td><td style={c}>{f.obs_cert_no}</td></tr>
        </tbody>
      </table>
      <div style={secG}>氣象相關資料紀錄</div>
      <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:6 }}>
        <tbody>
          <tr><td style={h}>天候(署)</td><td style={c}>{f.weather_cwa.join("、")||"—"}</td><td style={h}>天候(現場)</td><td style={c}>{f.site_weather.join("、")||"—"}</td></tr>
          <tr><td style={h}>日出/落</td><td style={c}>{f.sunrise}/{f.sunset}</td><td style={h}>現場風速</td><td style={c}>{f.site_wind}</td></tr>
          <tr><td style={h}>風速/等級</td><td style={c}>{f.avg_wind}m/s　{f.wind_level}級</td><td style={h}>現場氣溫</td><td style={c}>{f.site_temp}</td></tr>
          <tr><td style={h}>能見度/氣溫</td><td style={c}>{f.visibility}km　{f.temp}</td><td style={h}>氣象評估</td><td style={c}>{f.weather_ok||"—"}　觀察員：{f.weather_observer}</td></tr>
          <tr><td style={h}>風向</td><td style={c} colSpan={3}>{f.wind_dir.join("、")||"—"}</td></tr>
        </tbody>
      </table>
      <div style={secG}>機體飛安檢查紀錄</div>
      <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:6 }}>
        <thead><tr><th style={h}>項目</th><th style={h}>飛行前</th><th style={h}>飛行後</th><th style={h}>異常</th></tr></thead>
        <tbody>
          {[["prop","螺旋槳：目視外觀無裂損"],["motor","馬達：固裝妥當及無裂損"],["dir","方向性：正/反槳安裝正確"],["bat","電池：外觀電壓確認固裝"],["arm","機臂：外觀確認固裝"],["body","機身及酬載：確認固裝"],["fc","飛行控制器：確認固裝"],["gps","GPS模組：確認固裝"],["elec","電系接頭：確認固裝"],["sys","全系統動態檢查"]].map(([k,l])=>(
            <tr key={k}><td style={c}>{l}</td><td style={{ ...c,textAlign:"center" }}>{f.checks[`${k}_before`]||""}</td><td style={{ ...c,textAlign:"center" }}>{f.checks[`${k}_after`]||""}</td><td style={c}></td></tr>
          ))}
          <tr><td colSpan={4} style={c}>機體評估：{f.aircraft_ok||"—"}　操作員：＿＿＿＿（簽章）</td></tr>
        </tbody>
      </table>
      <div style={secG}>空拍資訊回饋</div>
      <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:12 }}>
        <tbody>
          <tr><td style={h}>狀況</td><td style={c}>{f.aerial_normal?"■":"□"}無異狀　{f.aerial_abnormal?"■":"□"}有異狀</td></tr>
          <tr><td style={h}>描述</td><td style={{ ...c, minHeight:50, whiteSpace:"pre-wrap" }}>{f.aerial_desc||"　"}</td></tr>
        </tbody>
      </table>
      <div style={{ textAlign:"right", fontSize:11 }}>列印時間：{new Date().toLocaleString("zh-TW")}</div>
    </div>
  );
}

const btnB = { background:"#38b6ff", color:"#fff", border:"none", borderRadius:6, padding:"8px 14px", fontSize:13, cursor:"pointer", fontWeight:600 };
const btnG = { background:"#2ecc71", color:"#fff", border:"none", borderRadius:6, padding:"8px 14px", fontSize:13, cursor:"pointer", fontWeight:600 };

createRoot(document.getElementById("root")).render(<App/>);
