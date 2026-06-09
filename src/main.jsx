
import { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";

// ── Supabase 設定 ──
const SUPABASE_URL = "https://tcsegbcefajkvfqfluyy.supabase.co";
const SUPABASE_KEY = "sb_publishable_47tBfn1y8qMzNQIe8W-opg_hl4cUF4X";
const HEADERS = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Prefer": "return=representation",
};

async function sbSelect() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/flight_logs?select=*&order=created_at.desc`, { headers: HEADERS });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
async function sbInsert(row) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/flight_logs`, {
    method: "POST", headers: HEADERS, body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
async function sbUpdate(id, row) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/flight_logs?id=eq.${id}`, {
    method: "PATCH", headers: HEADERS, body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
async function sbDelete(id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/flight_logs?id=eq.${id}`, {
    method: "DELETE", headers: HEADERS,
  });
  if (!res.ok) throw new Error(await res.text());
}

const EMPTY_FORM = {
  date: "", aircraft: "", departure: "", arrival: "",
  duration_min: "", pilot_in_command: "", notes: "",
};

function FlightLogs() {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true); setError("");
    try { setLogs(await sbSelect()); }
    catch (e) { setError("無法載入：" + e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  function flash(msg, isError = false) {
    if (isError) { setError(msg); setSuccess(""); }
    else { setSuccess(msg); setError(""); }
    setTimeout(() => { setError(""); setSuccess(""); }, 3500);
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function startEdit(log) {
    setEditId(log.id);
    setForm({
      date: log.date || "", aircraft: log.aircraft || "",
      departure: log.departure || "", arrival: log.arrival || "",
      duration_min: log.duration_min ?? "", pilot_in_command: log.pilot_in_command || "",
      notes: log.notes || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() { setEditId(null); setForm(EMPTY_FORM); }

  async function handleSubmit() {
    if (!form.date || !form.aircraft || !form.departure || !form.arrival) {
      flash("請填寫日期、機型、出發地及目的地。", true); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, duration_min: form.duration_min !== "" ? Number(form.duration_min) : null };
      if (editId) { await sbUpdate(editId, payload); flash("紀錄已更新。"); }
      else { await sbInsert(payload); flash("新紀錄已新增。"); }
      setEditId(null); setForm(EMPTY_FORM); await fetchLogs();
    } catch (e) { flash("儲存失敗：" + e.message, true); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    try { await sbDelete(id); flash("紀錄已刪除。"); setDeleteConfirm(null); await fetchLogs(); }
    catch (e) { flash("刪除失敗：" + e.message, true); }
  }

  const totalHours = logs.reduce((sum, l) => sum + (Number(l.duration_min) || 0), 0);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.logo}>✈</span>
          <div>
            <div style={styles.title}>飛行日誌</div>
            <div style={styles.subtitle}>Flight Log System</div>
          </div>
        </div>
        <div style={styles.statsBar}>
          <div style={styles.stat}>
            <span style={styles.statNum}>{logs.length}</span>
            <span style={styles.statLabel}>航班</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.stat}>
            <span style={styles.statNum}>{(totalHours / 60).toFixed(1)}</span>
            <span style={styles.statLabel}>小時</span>
          </div>
        </div>
      </div>

      <div style={styles.body}>
        {(error || success) && (
          <div style={error ? styles.toastError : styles.toastSuccess}>{error || success}</div>
        )}

        <div style={styles.card}>
          <div style={styles.cardTitle}>{editId ? "✏️ 編輯紀錄" : "＋ 新增航班"}</div>
          <div style={styles.formGrid}>
            {[
              ["date", "日期", "date", ""],
              ["aircraft", "機型", "text", "e.g. Cessna 172"],
              ["departure", "出發地", "text", "IATA / ICAO"],
              ["arrival", "目的地", "text", "IATA / ICAO"],
              ["duration_min", "飛行時間 (分鐘)", "number", "e.g. 90"],
              ["pilot_in_command", "機長姓名", "text", "Pilot in Command"],
            ].map(([name, label, type, ph]) => (
              <label key={name} style={styles.label}>
                {label}{["date","aircraft","departure","arrival"].includes(name) ? " *" : ""}
                <input
                  style={styles.input} type={type} name={name}
                  value={form[name]} onChange={handleChange}
                  placeholder={ph} min={type === "number" ? "0" : undefined}
                />
              </label>
            ))}
            <label style={{ ...styles.label, gridColumn: "1 / -1" }}>
              備注
              <textarea style={{ ...styles.input, resize: "vertical", minHeight: 64 }}
                name="notes" value={form.notes} onChange={handleChange} placeholder="備注事項…" />
            </label>
          </div>
          <div style={styles.formActions}>
            {editId && <button style={styles.btnSecondary} onClick={cancelEdit}>取消</button>}
            <button style={styles.btnPrimary} onClick={handleSubmit} disabled={saving}>
              {saving ? "儲存中…" : editId ? "更新紀錄" : "新增紀錄"}
            </button>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>飛行紀錄</div>
          {loading ? (
            <div style={styles.center}>載入中…</div>
          ) : logs.length === 0 ? (
            <div style={styles.empty}>尚無飛行紀錄，新增第一筆航班開始吧！</div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["日期","機型","出發地","目的地","時間","機長","備注",""].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} style={styles.tr}>
                      <td style={styles.td}>{log.date || "—"}</td>
                      <td style={styles.td}><span style={styles.badge}>{log.aircraft || "—"}</span></td>
                      <td style={styles.td}>{log.departure || "—"}</td>
                      <td style={styles.td}>{log.arrival || "—"}</td>
                      <td style={styles.tdNum}>
                        {log.duration_min != null
                          ? `${Math.floor(log.duration_min / 60)}h ${log.duration_min % 60}m`
                          : "—"}
                      </td>
                      <td style={styles.td}>{log.pilot_in_command || "—"}</td>
                      <td style={{ ...styles.td, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {log.notes || ""}
                      </td>
                      <td style={styles.tdActions}>
                        <button style={styles.btnEdit} onClick={() => startEdit(log)}>編輯</button>
                        {deleteConfirm === log.id ? (
                          <>
                            <button style={styles.btnDangerSm} onClick={() => handleDelete(log.id)}>確認刪除</button>
                            <button style={styles.btnSecondaryXs} onClick={() => setDeleteConfirm(null)}>取消</button>
                          </>
                        ) : (
                          <button style={styles.btnDeleteSm} onClick={() => setDeleteConfirm(log.id)}>刪除</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const C = {
  sky: "#0e1c2f", skyMid: "#15293f", panel: "#1a3251", panelLight: "#1f3d60",
  accent: "#38b6ff", accentDim: "#1e7ab8", text: "#e8f0fa", muted: "#8ba8c8",
  border: "#2a4a6e", danger: "#e05252", dangerDark: "#a33", success: "#2ecc71", white: "#ffffff",
};

const styles = {
  page: { minHeight: "100vh", background: `linear-gradient(160deg,${C.sky} 0%,${C.skyMid} 100%)`, fontFamily: "'Segoe UI',system-ui,sans-serif", color: C.text },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", borderBottom: `1px solid ${C.border}`, background: "rgba(14,28,47,0.8)", flexWrap: "wrap", gap: 12 },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  logo: { fontSize: 36, lineHeight: 1 },
  title: { fontSize: 22, fontWeight: 700, letterSpacing: 1 },
  subtitle: { fontSize: 12, color: C.muted, letterSpacing: 2, textTransform: "uppercase" },
  statsBar: { display: "flex", alignItems: "center", gap: 20, background: C.panel, borderRadius: 10, padding: "10px 20px" },
  stat: { display: "flex", flexDirection: "column", alignItems: "center" },
  statNum: { fontSize: 22, fontWeight: 700, color: C.accent },
  statLabel: { fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 },
  statDivider: { width: 1, height: 36, background: C.border },
  body: { padding: "28px 24px", maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 },
  toastError: { background: C.dangerDark, color: C.white, padding: "12px 20px", borderRadius: 8, fontSize: 14, borderLeft: `4px solid ${C.danger}` },
  toastSuccess: { background: "#1a4d2e", color: C.success, padding: "12px 20px", borderRadius: 8, fontSize: 14, borderLeft: `4px solid ${C.success}` },
  card: { background: C.panel, borderRadius: 14, padding: 24, border: `1px solid ${C.border}` },
  cardTitle: { fontSize: 16, fontWeight: 700, marginBottom: 18, color: C.accent, letterSpacing: 0.5 },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "14px 20px" },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: C.muted, fontWeight: 500 },
  input: { background: C.skyMid, border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 11px", color: C.text, fontSize: 14, outline: "none" },
  formActions: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 },
  btnPrimary: { background: C.accent, color: C.sky, border: "none", borderRadius: 7, padding: "9px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer" },
  btnSecondary: { background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: "9px 18px", fontSize: 14, cursor: "pointer" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", padding: "10px 12px", color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8 },
  tr: { borderBottom: `1px solid ${C.border}` },
  td: { padding: "11px 12px", color: C.text, verticalAlign: "middle" },
  tdNum: { padding: "11px 12px", color: C.accent, fontVariantNumeric: "tabular-nums", fontWeight: 600, verticalAlign: "middle" },
  tdActions: { padding: "8px 12px", whiteSpace: "nowrap", verticalAlign: "middle" },
  badge: { background: C.panelLight, borderRadius: 5, padding: "2px 8px", fontSize: 12, color: C.accent, fontWeight: 600, letterSpacing: 0.5 },
  btnEdit: { background: C.panelLight, color: C.accent, border: `1px solid ${C.accentDim}`, borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer", marginRight: 6 },
  btnDeleteSm: { background: "transparent", color: C.danger, border: `1px solid ${C.danger}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" },
  btnDangerSm: { background: C.danger, color: C.white, border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", marginRight: 4 },
  btnSecondaryXs: { background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 8px", fontSize: 12, cursor: "pointer" },
  center: { textAlign: "center", padding: 32, color: C.muted },
  empty: { textAlign: "center", padding: 40, color: C.muted, fontSize: 14 },
};

createRoot(document.getElementById("root")).render(<FlightLogs />);
