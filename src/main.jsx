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
  const r = await fetch(`${SUPABASE_URL}/rest/v1/drone_logs`, { method: "POST", headers: H, body: JSON.stringify(row) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function sbSelect() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/drone_logs?select=*&order=created_at.desc`, { headers: H });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

const EMPTY = {
  // 基本資料
  model: "亞拓 Align M3 任務無人機", serial: "C263001106", reg_no: "B-AAB14292",
  valid_until: "2028/05/13", insurer: "○○產物保險公司", insurer_tel: "0800-000000",
  policy_no: "F0-115-10056458-00001-G10", insurance_until: "2026/05/23",
  // 任務資料
  mission_date: "", drm_arrive: "", drm_leave: "", uav_takeoff: "", uav_land: "",
  prev_total: "", mission_hours: "", total_hours: "",
  accident_report_time: "", accident_lat: "24.182629", accident_lng: "120.663627",
  accident_causes: [], accident_results: [], accident_other: "",
  prev_abnormal: "無", prev_abnormal_desc: "",
  // 空間位置
  lng: "120.663627", lat: "24.182629",
  twd97_e: "215817.078", twd97_n: "2675245.488",
  admin_area: "臺中市西屯區", land_section: "鑫大鵬段", land_no: "3地號內",
  // 空域
  airspace_color: "", caa_approval: "", gov_approval: "",
  // 任務屬性
  mission_types: [], mission_other: "", mission_dispatcher_rank: "", mission_dispatcher_name: "",
  // 人員
  pilot_name: "龍奕均", pilot_cert_type: "專業基本級(Ⅰ)", pilot_cert_period: "2025/12/18～2028/12/17",
  pilot_cert_no: "F22757168",
  obs_name: "李 康", obs_cert_type: "", obs_cert_period: "", obs_cert_no: "",
  // 氣象
  weather_cwa: [], weather_status_cwa: "", sunrise: "05:09", sunset: "18:42",
  wind_dir: [], avg_wind: "3.6", wind_level: "1", visibility: "9.66",
  temp: "35℃ / 28℃", site_weather: [], site_wind: "", site_temp: "",
  weather_ok: "", weather_observer: "",
  // 飛安檢查
  checks: {
    prop_before:"", prop_after:"", motor_before:"", motor_after:"",
    dir_before:"", dir_after:"", bat_before:"", bat_after:"",
    arm_before:"", arm_after:"", body_before:"", body_after:"",
    fc_before:"", fc_after:"", gps_before:"", gps_after:"",
    elec_before:"", elec_after:"", sys_before:"", sys_after:"",
  },
  aircraft_ok: "", pilot_sign: "",
  // 空拍回饋
  aerial_normal: false, aerial_abnormal: false, aerial_desc: "",
};

function toggle(arr, val) {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

function Chk({ checked, onChange, label }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 4, marginRight: 12, cursor: "pointer", fontSize: 13 }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ width: 14, height: 14 }} />
      {label}
    </label>
  );
}
function Radio({ checked, onChange, label }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 4, marginRight: 12, cursor: "pointer", fontSize: 13 }}>
      <input type="radio" checked={checked} onChange={onChange} style={{ width: 14, height: 14 }} />
      {label}
    </label>
  );
}
function Field({ label, value, onChange, type = "text", placeholder = "", style = {} }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, ...style }}>
      {label && <span style={{ fontSize: 13, whiteSpace: "nowrap", color: "#333", minWidth: 80 }}>{label}</span>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ border: "none", borderBottom: "1px solid #999", outline: "none", fontSize: 13, padding: "2px 4px", flex: 1, background: "transparent" }} />
    </div>
  );
}
function SField({ label, value, onChange, rows = 2 }) {
  return (
    <div style={{ marginBottom: 4 }}>
      {label && <div style={{ fontSize: 13, color: "#333", marginBottom: 2 }}>{label}</div>}
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows}
        style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, fontSize: 13, padding: 4, resize: "vertical" }} />
    </div>
  );
}

// 飛安檢查行
function CheckRow({ label, beforeVal, afterVal, onChange }) {
  return (
    <tr>
      <td style={td}>{label}</td>
      <td style={{ ...td, textAlign: "center" }}>
        <Radio checked={beforeVal === "是"} onChange={() => onChange("before", "是")} label="是" />
        <Radio checked={beforeVal === "否"} onChange={() => onChange("before", "否")} label="否" />
      </td>
      <td style={{ ...td, textAlign: "center" }}>
        <Radio checked={afterVal === "是"} onChange={() => onChange("after", "是")} label="是" />
        <Radio checked={afterVal === "否"} onChange={() => onChange("after", "否")} label="否" />
      </td>
      <td style={td}></td>
    </tr>
  );
}

const th = { background: "#ddd", border: "1px solid #999", padding: "4px 8px", fontSize: 13, fontWeight: "bold", textAlign: "center" };
const td = { border: "1px solid #999", padding: "4px 8px", fontSize: 13 };
const sectionTitle = { background: "#c00", color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 14, padding: "4px 0", marginTop: 12, marginBottom: 4 };
const sectionTitleGreen = { ...sectionTitle, background: "#6a994e" };
const boxTitle = { background: "#eee", textAlign: "center", fontWeight: "bold", fontSize: 13, padding: "4px 0", border: "1px solid #999", marginBottom: 4 };

export default function App() {
  const [f, setF] = useState(EMPTY);
  const [view, setView] = useState("form"); // form | preview | list
  const [logs, setLogs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function upd(key, val) { setF(prev => ({ ...prev, [key]: val })); }
  function updCheck(field, side, val) {
    setF(prev => ({ ...prev, checks: { ...prev.checks, [`${field}_${side}`]: val } }));
  }

  function flash(m, ok = true) {
    setMsg({ text: m, ok });
    setTimeout(() => setMsg(""), 3000);
  }

  async function save() {
    setSaving(true);
    try {
      await sbInsert({ data: JSON.stringify(f), mission_date: f.mission_date, pilot_name: f.pilot_name });
      flash("✅ 儲存成功！");
    } catch (e) { flash("❌ 儲存失敗：" + e.message, false); }
    finally { setSaving(false); }
  }

  async function loadList() {
    try { setLogs(await sbSelect()); } catch (e) { flash("載入失敗", false); }
  }

  useEffect(() => { if (view === "list") loadList(); }, [view]);

  // ── 列印預覽 ──────────────────────────────────────────────
  if (view === "preview") return (
    <div>
      <div className="no-print" style={{ position: "fixed", top: 0, left: 0, right: 0, background: "#1a3251", padding: "10px 20px", display: "flex", gap: 12, zIndex: 999 }}>
        <button onClick={() => window.print()} style={btnW}>🖨 列印 / 存PDF</button>
        <button onClick={() => setView("form")} style={btnG}>← 返回編輯</button>
      </div>
      <div style={{ marginTop: 56, padding: "20px", maxWidth: 800, margin: "56px auto 0", fontFamily: "標楷體, serif" }}>
        <PrintForm f={f} />
      </div>
    </div>
  );

  // ── 紀錄清單 ─────────────────────────────────────────────
  if (view === "list") return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button onClick={() => setView("form")} style={btnG}>← 返回填寫</button>
      </div>
      <h2 style={{ marginBottom: 12 }}>歷史飛航日誌</h2>
      {logs.length === 0 ? <p>尚無紀錄</p> : logs.map((l, i) => (
        <div key={i} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12, marginBottom: 10, cursor: "pointer", background: "#f9f9f9" }}
          onClick={() => { setF(JSON.parse(l.data)); setView("preview"); }}>
          <b>{l.mission_date || "（未填日期）"}</b>　操作員：{l.pilot_name || "—"}
          <span style={{ float: "right", color: "#888", fontSize: 12 }}>{new Date(l.created_at).toLocaleString("zh-TW")}</span>
        </div>
      ))}
    </div>
  );

  // ── 填寫表單 ──────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "sans-serif", background: "#f0f4f8", minHeight: "100vh" }}>
      {/* 頂部工具列 */}
      <div style={{ background: "#1a3251", color: "#fff", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>✈ 遙控無人多旋翼機飛航日誌</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setView("list")} style={btnW}>📋 歷史紀錄</button>
          <button onClick={save} disabled={saving} style={btnB}>{saving ? "儲存中…" : "💾 儲存"}</button>
          <button onClick={() => setView("preview")} style={btnG}>👁 預覽 / 列印</button>
        </div>
      </div>
      {msg && <div style={{ background: msg.ok ? "#d4edda" : "#f8d7da", color: msg.ok ? "#155724" : "#721c24", padding: "10px 20px", fontSize: 14 }}>{msg.text}</div>}

      <div style={{ maxWidth: 860, margin: "0 auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* 基本資料 */}
        <Section title="遙控無人多旋翼機基本資料">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
            <Field label="型式" value={f.model} onChange={v => upd("model", v)} />
            <Field label="序號" value={f.serial} onChange={v => upd("serial", v)} />
            <Field label="註冊號碼" value={f.reg_no} onChange={v => upd("reg_no", v)} />
            <Field label="有效期限" value={f.valid_until} onChange={v => upd("valid_until", v)} />
            <Field label="保險承攬公司" value={f.insurer} onChange={v => upd("insurer", v)} />
            <Field label="電話" value={f.insurer_tel} onChange={v => upd("insurer_tel", v)} />
            <Field label="保單編號" value={f.policy_no} onChange={v => upd("policy_no", v)} />
            <Field label="保險期限" value={f.insurance_until} onChange={v => upd("insurance_until", v)} />
          </div>
        </Section>

        {/* 飛航時間與飛安事故 */}
        <Section title="飛航時間與飛安事故相關紀錄">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
            <Field label="任務日期" value={f.mission_date} onChange={v => upd("mission_date", v)} type="date" />
            <Field label="Drone Map 報到時間" value={f.drm_arrive} onChange={v => upd("drm_arrive", v)} placeholder="HH:MM" />
            <Field label="Drone Map 離場時間" value={f.drm_leave} onChange={v => upd("drm_leave", v)} placeholder="HH:MM" />
            <Field label="無人機起飛時間" value={f.uav_takeoff} onChange={v => upd("uav_takeoff", v)} placeholder="HH:MM" />
            <Field label="無人機降落時間" value={f.uav_land} onChange={v => upd("uav_land", v)} placeholder="HH:MM" />
            <Field label="前次累計飛行時數" value={f.prev_total} onChange={v => upd("prev_total", v)} placeholder="HH:MM" />
            <Field label="本次任務飛行時數" value={f.mission_hours} onChange={v => upd("mission_hours", v)} placeholder="HH:MM" />
            <Field label="目前累計飛行時數" value={f.total_hours} onChange={v => upd("total_hours", v)} placeholder="HH:MM" />
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 4 }}>本機前次日誌有無異常紀錄</div>
            <Radio checked={f.prev_abnormal === "無"} onChange={() => upd("prev_abnormal", "無")} label="無" />
            <Radio checked={f.prev_abnormal === "有"} onChange={() => upd("prev_abnormal", "有")} label="有" />
            {f.prev_abnormal === "有" && <Field label="問題描述" value={f.prev_abnormal_desc} onChange={v => upd("prev_abnormal_desc", v)} />}
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 4 }}>事故發生原因</div>
            {["機械問題墜落","電池問題墜落","天候問題墜落","操作問題墜落","其它問題墜落"].map(c => (
              <Chk key={c} checked={f.accident_causes.includes(c)} onChange={() => upd("accident_causes", toggle(f.accident_causes, c))} label={c} />
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 4 }}>墜落後造成</div>
            {["機體損毀(未遺失)","機體遺落失蹤","第三人財損","第三人死、傷","其它情形"].map(c => (
              <Chk key={c} checked={f.accident_results.includes(c)} onChange={() => upd("accident_results", toggle(f.accident_results, c))} label={c} />
            ))}
          </div>
        </Section>

        {/* 空間位置 */}
        <Section title="空間位置及座標相關紀錄">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
            <Field label="經度" value={f.lng} onChange={v => upd("lng", v)} />
            <Field label="緯度" value={f.lat} onChange={v => upd("lat", v)} />
            <Field label="TWD97 E" value={f.twd97_e} onChange={v => upd("twd97_e", v)} />
            <Field label="TWD97 N" value={f.twd97_n} onChange={v => upd("twd97_n", v)} />
            <Field label="行政區" value={f.admin_area} onChange={v => upd("admin_area", v)} />
            <Field label="地段" value={f.land_section} onChange={v => upd("land_section", v)} />
            <Field label="地號" value={f.land_no} onChange={v => upd("land_no", v)} />
          </div>
        </Section>

        {/* 空域 */}
        <Section title="任務執行範圍空域情況 / 空域申請核准文件">
          <div style={{ marginBottom: 8 }}>
            {["綠色（請遵守120M以下飛行限制）","黃色（請遵守60M以下飛行限制或申請解禁）","紅色（法人通過能力審查與申請核准後解禁）"].map(c => (
              <div key={c}><Chk checked={f.airspace_color === c} onChange={() => upd("airspace_color", c)} label={c} /></div>
            ))}
          </div>
          <Field label="民航局（核准文號）" value={f.caa_approval} onChange={v => upd("caa_approval", v)} />
          <Field label="地方政府（核准文號）" value={f.gov_approval} onChange={v => upd("gov_approval", v)} />
        </Section>

        {/* 任務屬性 */}
        <Section title="本次任務屬性">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
            {["定期空置營區巡查","專案任務飛航","天然災害後飛航巡檢","臨時交辦任務","訓練飛行"].map(c => (
              <Chk key={c} checked={f.mission_types.includes(c)} onChange={() => upd("mission_types", toggle(f.mission_types, c))} label={c} />
            ))}
          </div>
          <Field label="其它" value={f.mission_other} onChange={v => upd("mission_other", v)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px", marginTop: 8 }}>
            <Field label="任務指派人級職" value={f.mission_dispatcher_rank} onChange={v => upd("mission_dispatcher_rank", v)} />
            <Field label="任務指派人姓名" value={f.mission_dispatcher_name} onChange={v => upd("mission_dispatcher_name", v)} />
          </div>
        </Section>

        {/* 人員資料 */}
        <Section title="任務執行人員資料">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
            <div>
              <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 6 }}>操作員</div>
              <Field label="姓名" value={f.pilot_name} onChange={v => upd("pilot_name", v)} />
              <Field label="操作證類別" value={f.pilot_cert_type} onChange={v => upd("pilot_cert_type", v)} />
              <Field label="操作證效期" value={f.pilot_cert_period} onChange={v => upd("pilot_cert_period", v)} />
              <Field label="操作證編號" value={f.pilot_cert_no} onChange={v => upd("pilot_cert_no", v)} />
            </div>
            <div>
              <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 6 }}>觀察員</div>
              <Field label="姓名" value={f.obs_name} onChange={v => upd("obs_name", v)} />
              <Field label="操作證類別" value={f.obs_cert_type} onChange={v => upd("obs_cert_type", v)} />
              <Field label="操作證效期" value={f.obs_cert_period} onChange={v => upd("obs_cert_period", v)} />
              <Field label="操作證編號" value={f.obs_cert_no} onChange={v => upd("obs_cert_no", v)} />
            </div>
          </div>
        </Section>

        {/* 氣象 */}
        <Section title="氣象相關資料紀錄">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
            <div>
              <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 4 }}>中央氣象署發布資訊</div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>天候：</span>
                {["晴天","多雲","陰天","雨天","其它"].map(w => (
                  <Chk key={w} checked={f.weather_cwa.includes(w)} onChange={() => upd("weather_cwa", toggle(f.weather_cwa, w))} label={w} />
                ))}
              </div>
              <Field label="日出時間" value={f.sunrise} onChange={v => upd("sunrise", v)} />
              <Field label="日落時間" value={f.sunset} onChange={v => upd("sunset", v)} />
              <div style={{ marginTop: 4 }}>
                <span style={{ fontSize: 13 }}>風向：</span>
                {["北風","東北風","東風","東南風","南風","西南風","西風","西北風"].map(w => (
                  <Chk key={w} checked={f.wind_dir.includes(w)} onChange={() => upd("wind_dir", toggle(f.wind_dir, w))} label={w} />
                ))}
              </div>
              <Field label="平均風速(公尺/每秒)" value={f.avg_wind} onChange={v => upd("avg_wind", v)} />
              <Field label="風速等級" value={f.wind_level} onChange={v => upd("wind_level", v)} />
              <Field label="能見度(公里)" value={f.visibility} onChange={v => upd("visibility", v)} />
              <Field label="氣溫" value={f.temp} onChange={v => upd("temp", v)} />
            </div>
            <div>
              <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 4 }}>任務地點氣象資訊</div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>天候：</span>
                {["晴天","多雲","陰天","雨天(禁飛)"].map(w => (
                  <Chk key={w} checked={f.site_weather.includes(w)} onChange={() => upd("site_weather", toggle(f.site_weather, w))} label={w} />
                ))}
              </div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>狀況：</span>
                <Chk checked={f.site_weather.includes("日出前")} onChange={() => upd("site_weather", toggle(f.site_weather, "日出前"))} label="日出前、日落後(禁飛)" />
              </div>
              <Field label="現場平均風速" value={f.site_wind} onChange={v => upd("site_wind", v)} />
              <Field label="現場氣溫" value={f.site_temp} onChange={v => upd("site_temp", v)} />
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 4 }}>氣象條件綜合評估</div>
                <Radio checked={f.weather_ok === "同意飛行"} onChange={() => upd("weather_ok", "同意飛行")} label="同意飛行" />
                <Radio checked={f.weather_ok === "禁止飛行"} onChange={() => upd("weather_ok", "禁止飛行")} label="禁止飛行" />
              </div>
              <Field label="觀察員" value={f.weather_observer} onChange={v => upd("weather_observer", v)} />
            </div>
          </div>
        </Section>

        {/* 飛安檢查 */}
        <Section title="機體飛安檢查紀錄">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>動力系統</th>
                <th style={th}>飛行前</th>
                <th style={th}>飛行後</th>
                <th style={th}>異常註記</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["prop","(1)螺旋槳：目視外觀無裂損"],
                ["motor","(2)馬達：確認已固裝妥當及目視外觀無裂損"],
                ["dir","(3)方向性檢查：確認馬達及螺旋槳正/反槳安裝正確"],
              ].map(([k, label]) => (
                <CheckRow key={k} label={label}
                  beforeVal={f.checks[`${k}_before`]} afterVal={f.checks[`${k}_after`]}
                  onChange={(side, val) => updCheck(k, side, val)} />
              ))}
              <tr><td colSpan={4} style={{ ...td, background: "#eee", fontWeight: "bold" }}>載具</td></tr>
              {[
                ["bat","(1)電池：檢查外觀、工作電壓及確認已固裝妥當"],
                ["arm","(2)機臂：外觀確認已固裝妥當"],
                ["body","(3)機身及酬載：外觀確認已固裝妥當"],
                ["fc","(4)飛行控制器：外觀確認已固裝妥當"],
                ["gps","(5)GPS模組：外觀確認已固裝妥當"],
                ["elec","(6)電系接頭：外觀確認已固裝妥當"],
                ["sys","(7)全系統動態檢查(包含手持操控器)"],
              ].map(([k, label]) => (
                <CheckRow key={k} label={label}
                  beforeVal={f.checks[`${k}_before`]} afterVal={f.checks[`${k}_after`]}
                  onChange={(side, val) => updCheck(k, side, val)} />
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: 13, fontWeight: "bold" }}>機體條件綜合評估：</span>
            <Radio checked={f.aircraft_ok === "同意飛行"} onChange={() => upd("aircraft_ok", "同意飛行")} label="同意飛行" />
            <Radio checked={f.aircraft_ok === "禁止飛行"} onChange={() => upd("aircraft_ok", "禁止飛行")} label="禁止飛行" />
          </div>
        </Section>

        {/* 空拍回饋 */}
        <Section title="空拍資訊回饋">
          <Chk checked={f.aerial_normal} onChange={() => upd("aerial_normal", !f.aerial_normal)} label="無異狀" />
          <Chk checked={f.aerial_abnormal} onChange={() => upd("aerial_abnormal", !f.aerial_abnormal)} label="有異狀" />
          <SField label="異狀描述" value={f.aerial_desc} onChange={v => upd("aerial_desc", v)} rows={4} />
        </Section>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", paddingBottom: 40 }}>
          <button onClick={save} disabled={saving} style={{ ...btnB, padding: "12px 28px", fontSize: 15 }}>{saving ? "儲存中…" : "💾 儲存紀錄"}</button>
          <button onClick={() => setView("preview")} style={{ ...btnG, padding: "12px 28px", fontSize: 15 }}>👁 預覽 / 列印</button>
        </div>
      </div>
    </div>
  );
}

// ── 列印版表單 ─────────────────────────────────────────────
function PrintForm({ f }) {
  const cell = { border: "1px solid #333", padding: "3px 6px", fontSize: 12 };
  const hcell = { ...cell, background: "#eee", fontWeight: "bold", textAlign: "center" };
  return (
    <div style={{ fontFamily: "標楷體, serif", color: "#000" }}>
      <style>{`@media print { .no-print { display:none!important; } body { margin:0; } }`}</style>
      <h2 style={{ textAlign: "center", letterSpacing: 8, fontSize: 20, marginBottom: 4 }}>遙控無人多旋翼機飛航日誌</h2>
      <div style={{ textAlign: "right", fontSize: 12, marginBottom: 8 }}>編號：115-M3SE-0001　附表7</div>

      {/* 基本資料 */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
        <tbody>
          <tr><td colSpan={8} style={hcell}>遙控無人多旋翼機基本資料</td></tr>
          <tr>
            <td style={hcell}>型式</td><td style={cell} colSpan={2}>{f.model}</td>
            <td style={hcell}>序號</td><td style={cell}>{f.serial}</td>
            <td style={hcell}>註冊號碼</td><td style={cell}>{f.reg_no}</td>
            <td style={cell}>有效期限：{f.valid_until}</td>
          </tr>
          <tr>
            <td style={hcell}>保險承攬公司</td><td style={cell} colSpan={2}>{f.insurer}　電話：{f.insurer_tel}</td>
            <td style={hcell}>保單編號</td><td style={cell} colSpan={2}>{f.policy_no}</td>
            <td style={hcell}>保險期限</td><td style={cell}>{f.insurance_until}</td>
          </tr>
        </tbody>
      </table>

      {/* 飛航時間 */}
      <div style={sectionTitle}>飛航時間與飛安事故相關紀錄</div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
        <tbody>
          <tr>
            <td style={hcell}>任務日期</td><td style={cell}>{f.mission_date}</td>
            <td style={hcell}>Drone Map 報到時間</td><td style={cell}>{f.drm_arrive}</td>
            <td style={hcell}>Drone Map 離場時間</td><td style={cell}>{f.drm_leave}</td>
          </tr>
          <tr>
            <td style={hcell}>無人機起飛時間</td><td style={cell}>{f.uav_takeoff}</td>
            <td style={hcell}>無人機降落時間</td><td style={cell}>{f.uav_land}</td>
            <td style={hcell}>前次累計飛行時數</td><td style={cell}>{f.prev_total}</td>
          </tr>
          <tr>
            <td style={hcell}>本次任務飛行時數</td><td style={cell}>{f.mission_hours}</td>
            <td style={hcell}>目前累計飛行時數</td><td style={cell}>{f.total_hours}</td>
            <td style={cell} colSpan={2}>前次日誌異常：{f.prev_abnormal} {f.prev_abnormal_desc}</td>
          </tr>
          <tr>
            <td style={hcell}>事故發生原因</td>
            <td style={cell} colSpan={2}>{f.accident_causes.join("、") || "—"}</td>
            <td style={hcell}>墜落後造成</td>
            <td style={cell} colSpan={2}>{f.accident_results.join("、") || "—"}</td>
          </tr>
        </tbody>
      </table>

      {/* 空間位置 */}
      <div style={sectionTitle}>空間位置及座標相關紀錄</div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
        <tbody>
          <tr>
            <td style={hcell}>經度</td><td style={cell}>{f.lng}</td>
            <td style={hcell}>緯度</td><td style={cell}>{f.lat}</td>
            <td style={hcell}>TWD97 E</td><td style={cell}>{f.twd97_e}</td>
            <td style={hcell}>TWD97 N</td><td style={cell}>{f.twd97_n}</td>
          </tr>
          <tr>
            <td style={hcell}>行政區</td><td style={cell}>{f.admin_area}</td>
            <td style={hcell}>地段</td><td style={cell}>{f.land_section}</td>
            <td style={hcell}>地號</td><td style={cell} colSpan={2}>{f.land_no}</td>
          </tr>
        </tbody>
      </table>

      {/* 空域 */}
      <div style={sectionTitle}>任務執行範圍空域 / 申請核准文件</div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
        <tbody>
          <tr>
            <td style={cell} colSpan={2}>空域顏色：{f.airspace_color || "—"}</td>
            <td style={hcell}>民航局核准文號</td><td style={cell}>{f.caa_approval || "—"}</td>
            <td style={hcell}>地方政府核准文號</td><td style={cell}>{f.gov_approval || "—"}</td>
          </tr>
        </tbody>
      </table>

      {/* 任務屬性 */}
      <div style={sectionTitle}>本次任務屬性</div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
        <tbody>
          <tr>
            <td style={cell}>任務類型：{f.mission_types.join("、") || "—"} {f.mission_other}</td>
            <td style={hcell}>任務指派人級職</td><td style={cell}>{f.mission_dispatcher_rank}</td>
            <td style={hcell}>姓名</td><td style={cell}>{f.mission_dispatcher_name}（簽章）</td>
          </tr>
        </tbody>
      </table>

      {/* 人員 */}
      <div style={sectionTitle}>任務執行人員資料</div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
        <thead><tr><td style={hcell} colSpan={2}>操作員</td><td style={hcell} colSpan={2}>觀察員</td></tr></thead>
        <tbody>
          <tr><td style={hcell}>姓名</td><td style={cell}>{f.pilot_name}</td><td style={hcell}>姓名</td><td style={cell}>{f.obs_name}</td></tr>
          <tr><td style={hcell}>操作證類別</td><td style={cell}>{f.pilot_cert_type}</td><td style={hcell}>操作證類別</td><td style={cell}>{f.obs_cert_type}</td></tr>
          <tr><td style={hcell}>操作證效期</td><td style={cell}>{f.pilot_cert_period}</td><td style={hcell}>操作證效期</td><td style={cell}>{f.obs_cert_period}</td></tr>
          <tr><td style={hcell}>操作證編號</td><td style={cell}>{f.pilot_cert_no}</td><td style={hcell}>操作證編號</td><td style={cell}>{f.obs_cert_no}</td></tr>
        </tbody>
      </table>

      {/* 氣象 */}
      <div style={sectionTitleGreen}>氣象相關資料紀錄</div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
        <tbody>
          <tr>
            <td style={hcell} colSpan={2}>中央氣象署資訊</td>
            <td style={hcell} colSpan={2}>任務地點氣象</td>
          </tr>
          <tr>
            <td style={hcell}>天候</td><td style={cell}>{f.weather_cwa.join("、") || "—"}</td>
            <td style={hcell}>天候</td><td style={cell}>{f.site_weather.join("、") || "—"}</td>
          </tr>
          <tr>
            <td style={hcell}>日出/日落</td><td style={cell}>{f.sunrise} / {f.sunset}</td>
            <td style={hcell}>現場風速</td><td style={cell}>{f.site_wind}</td>
          </tr>
          <tr>
            <td style={hcell}>平均風速/等級</td><td style={cell}>{f.avg_wind} 公尺/秒　{f.wind_level} 級</td>
            <td style={hcell}>現場氣溫</td><td style={cell}>{f.site_temp}</td>
          </tr>
          <tr>
            <td style={hcell}>能見度/氣溫</td><td style={cell}>{f.visibility} 公里　{f.temp}</td>
            <td style={hcell}>氣象綜合評估</td><td style={cell}>{f.weather_ok || "—"}　觀察員：{f.weather_observer}</td>
          </tr>
          <tr>
            <td style={hcell}>風向</td><td style={cell} colSpan={3}>{f.wind_dir.join("、") || "—"}</td>
          </tr>
        </tbody>
      </table>

      {/* 飛安檢查 */}
      <div style={sectionTitleGreen}>機體飛安檢查紀錄</div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
        <thead>
          <tr>
            <th style={hcell}>檢查項目</th><th style={hcell}>飛行前</th><th style={hcell}>飛行後</th><th style={hcell}>異常註記</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["prop","(1)螺旋槳：目視外觀無裂損"],
            ["motor","(2)馬達：確認已固裝妥當及目視外觀無裂損"],
            ["dir","(3)方向性檢查：確認馬達及螺旋槳正/反槳安裝正確"],
            ["bat","(4)電池：檢查外觀、工作電壓及確認已固裝妥當"],
            ["arm","(5)機臂：外觀確認已固裝妥當"],
            ["body","(6)機身及酬載：外觀確認已固裝妥當"],
            ["fc","(7)飛行控制器：外觀確認已固裝妥當"],
            ["gps","(8)GPS模組：外觀確認已固裝妥當"],
            ["elec","(9)電系接頭：外觀確認已固裝妥當"],
            ["sys","(10)全系統動態檢查(包含手持操控器)"],
          ].map(([k, label]) => (
            <tr key={k}>
              <td style={cell}>{label}</td>
              <td style={{ ...cell, textAlign: "center" }}>{f.checks[`${k}_before`] || "　"}</td>
              <td style={{ ...cell, textAlign: "center" }}>{f.checks[`${k}_after`] || "　"}</td>
              <td style={cell}></td>
            </tr>
          ))}
          <tr>
            <td colSpan={4} style={cell}>機體條件綜合評估：{f.aircraft_ok || "—"}　操作員簽名：＿＿＿＿＿</td>
          </tr>
        </tbody>
      </table>

      {/* 空拍回饋 */}
      <div style={sectionTitleGreen}>空拍資訊回饋</div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
        <tbody>
          <tr>
            <td style={hcell}>狀況</td>
            <td style={cell}>{f.aerial_normal ? "■" : "□"} 無異狀　{f.aerial_abnormal ? "■" : "□"} 有異狀</td>
          </tr>
          <tr>
            <td style={hcell}>異狀描述</td>
            <td style={{ ...cell, minHeight: 60, whiteSpace: "pre-wrap" }}>{f.aerial_desc || "　"}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ textAlign: "right", fontSize: 12, marginTop: 8 }}>列印時間：{new Date().toLocaleString("zh-TW")}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#1a3251", borderBottom: "2px solid #38b6ff", paddingBottom: 6, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

const btnW = { background: "#fff", color: "#1a3251", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontWeight: 600 };
const btnB = { background: "#38b6ff", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontWeight: 600 };
const btnG = { background: "#2ecc71", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontWeight: 600 };

createRoot(document.getElementById("root")).render(<App />);
