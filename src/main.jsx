import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { SpeedInsights } from "@vercel/speed-insights/react";

const SUPABASE_URL = "https://tcsegbcefajkvfqfluyy.supabase.co";
const SUPABASE_KEY = "sb_publishable_47tBfn1y8qMzNQIe8W-opg_hl4cUF4X";
const H = {
  "Content-Type":"application/json",
  "apikey":SUPABASE_KEY,
  "Authorization":`Bearer ${SUPABASE_KEY}`,
  "Prefer":"return=representation",
};

async function sbInsert(row){
  const r=await fetch(`${SUPABASE_URL}/rest/v1/drone_logs`,{method:"POST",headers:H,body:JSON.stringify(row)});
  if(!r.ok) throw new Error(await r.text());
  return r.json();
}
async function sbUpdate(id,row){
  const r=await fetch(`${SUPABASE_URL}/rest/v1/drone_logs?id=eq.${id}`,{method:"PATCH",headers:H,body:JSON.stringify(row)});
  if(!r.ok) throw new Error(await r.text());
  return r.json();
}
async function sbDelete(id){
  const r=await fetch(`${SUPABASE_URL}/rest/v1/drone_logs?id=eq.${id}`,{method:"DELETE",headers:H});
  if(!r.ok) throw new Error(await r.text());
}
async function sbSelect(){
  const r=await fetch(`${SUPABASE_URL}/rest/v1/drone_logs?select=*&order=mission_date.desc`,{headers:H});
  if(!r.ok) throw new Error(await r.text());
  return r.json();
}

function toMin(str){
  if(!str) return 0;
  const s=str.replace("：",":").trim();
  if(s.includes(":")){const[h,m]=s.split(":").map(Number);return(isNaN(h)?0:h)*60+(isNaN(m)?0:m);}
  return parseInt(s)||0;
}
function toHHMM(min){
  if(!min&&min!==0) return "0時00分";
  return `${Math.floor(min/60)}時${String(min%60).padStart(2,"0")}分`;
}
function toggle(arr,val){return arr.includes(val)?arr.filter(x=>x!==val):[...arr,val];}

const EMPTY={
  model:"亞拓 Align M3 任務無人機",serial:"C263001106",reg_no:"B-AAB14292",
  valid_until:"2028/05/13",insurer:"○○產物保險公司",insurer_tel:"0800-000000",
  policy_no:"F0-115-10056458-00001-G10",insurance_until:"2026/05/23",
  mission_date:"",drm_arrive:"",drm_leave:"",uav_takeoff:"",uav_land:"",
  prev_total:"",mission_hours:"",total_hours:"",
  prev_abnormal:"無",prev_abnormal_desc:"",
  accident_causes:[],accident_results:[],
  lng:"120.663627",lat:"24.182629",twd97_e:"215817.078",twd97_n:"2675245.488",
  admin_area:"臺中市西屯區",land_section:"鑫大鵬段",land_no:"3地號內",
  airspace_color:"",caa_approval:"",gov_approval:"",
  mission_types:[],mission_other:"",mission_dispatcher_rank:"",mission_dispatcher_name:"",
  pilot_name:"",pilot_cert_type:"",pilot_cert_period:"",pilot_cert_no:"",
  obs_name:"",obs_cert_type:"",obs_cert_period:"",obs_cert_no:"",
  weather_cwa:[],sunrise:"05:09",sunset:"18:42",
  wind_dir:[],avg_wind:"",wind_level:"",visibility:"",temp:"",
  site_weather:[],site_wind:"",site_temp:"",weather_ok:"",weather_observer:"",
  checks:{prop_before:"",prop_after:"",motor_before:"",motor_after:"",dir_before:"",dir_after:"",
    bat_before:"",bat_after:"",arm_before:"",arm_after:"",body_before:"",body_after:"",
    fc_before:"",fc_after:"",gps_before:"",gps_after:"",elec_before:"",elec_after:"",sys_before:"",sys_after:""},
  aircraft_ok:"",aerial_normal:false,aerial_abnormal:false,aerial_desc:"",
};

// ── UI 元件 ────────────────────────────────────────────────
function Chk({checked,onChange,label,red}){
  return(
    <label style={{display:"inline-flex",alignItems:"center",gap:4,marginRight:8,marginBottom:6,cursor:"pointer",fontSize:13,color:red?"#c00":"inherit"}}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{width:16,height:16,flexShrink:0}}/>
      {label}
    </label>
  );
}
function Radio({checked,onChange,label}){
  return(
    <label style={{display:"inline-flex",alignItems:"center",gap:4,marginRight:12,cursor:"pointer",fontSize:13}}>
      <input type="radio" checked={checked} onChange={onChange} style={{width:16,height:16}}/>
      {label}
    </label>
  );
}
function Field({label,value,onChange,type="text",placeholder="",readOnly=false,highlight=false}){
  return(
    <div style={{marginBottom:10}}>
      {label&&<div style={{fontSize:12,color:"#666",marginBottom:3}}>{label}</div>}
      <input type={type} value={value} onChange={e=>onChange&&onChange(e.target.value)} placeholder={placeholder} readOnly={readOnly}
        style={{width:"100%",border:`1px solid ${highlight?"#38b6ff":"#ddd"}`,borderRadius:6,padding:"8px 10px",fontSize:14,
          boxSizing:"border-box",background:highlight?"#e8f6ff":readOnly?"#f5f5f5":"#fafafa",color:readOnly?"#555":"#000"}}/>
    </div>
  );
}
function SField({label,value,onChange,rows=3}){
  return(
    <div style={{marginBottom:10}}>
      {label&&<div style={{fontSize:12,color:"#666",marginBottom:3}}>{label}</div>}
      <textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows}
        style={{width:"100%",border:"1px solid #ddd",borderRadius:6,padding:"8px 10px",fontSize:14,boxSizing:"border-box",resize:"vertical",background:"#fafafa"}}/>
    </div>
  );
}
function Section({title,children,color="#1a3251",icon=""}){
  const[open,setOpen]=useState(true);
  return(
    <div style={{background:"#fff",borderRadius:10,marginBottom:12,overflow:"hidden",boxShadow:"0 2px 6px rgba(0,0,0,0.1)"}}>
      <div onClick={()=>setOpen(o=>!o)} style={{background:color,color:"#fff",padding:"11px 14px",fontWeight:700,fontSize:14,display:"flex",justifyContent:"space-between",cursor:"pointer",alignItems:"center"}}>
        <span>{icon} {title}</span><span style={{fontSize:16}}>{open?"▲":"▼"}</span>
      </div>
      {open&&<div style={{padding:14}}>{children}</div>}
    </div>
  );
}
const tdc={border:"1px solid #ddd",padding:"6px 4px",fontSize:12};
const thc={border:"1px solid #ddd",padding:"6px 4px",fontSize:12,background:"#f0f4f8",fontWeight:"bold",textAlign:"center"};
function CheckRow({label,bv,av,onChange}){
  return(
    <tr>
      <td style={tdc}>{label}</td>
      <td style={{...tdc,textAlign:"center"}}>
        <Radio checked={bv==="是"} onChange={()=>onChange("before","是")} label="是"/>
        <Radio checked={bv==="否"} onChange={()=>onChange("before","否")} label="否"/>
      </td>
      <td style={{...tdc,textAlign:"center"}}>
        <Radio checked={av==="是"} onChange={()=>onChange("after","是")} label="是"/>
        <Radio checked={av==="否"} onChange={()=>onChange("after","否")} label="否"/>
      </td>
    </tr>
  );
}

// ── 主元件 ─────────────────────────────────────────────────
export default function App(){
  const[f,setF]=useState(EMPTY);
  const[editId,setEditId]=useState(null); // null=新增, uuid=編輯中
  const[tab,setTab]=useState("form");
  const[logs,setLogs]=useState([]);
  const[saving,setSaving]=useState(false);
  const[deleting,setDeleting]=useState(null); // 確認刪除的id
  const[msg,setMsg]=useState(null);
  const[search,setSearch]=useState({pilot:"",dateFrom:"",dateTo:""});
  const[pilotSugg,setPilotSugg]=useState([]);
  const[obsSugg,setObsSugg]=useState([]);
  const[showPDrop,setShowPDrop]=useState(false);
  const[showODrop,setShowODrop]=useState(false);

  function upd(k,v){setF(p=>({...p,[k]:v}));}
  function updC(k,side,v){setF(p=>({...p,checks:{...p.checks,[`${k}_${side}`]:v}}));}
  function flash(text,ok=true){setMsg({text,ok});setTimeout(()=>setMsg(null),3500);}

  async function loadList(){
    try{setLogs(await sbSelect());}catch(e){flash("載入失敗："+e.message,false);}
  }
  useEffect(()=>{loadList();},[]);

  // 建立操作員/觀察員建議清單
  useEffect(()=>{
    const pm={},om={};
    logs.forEach(l=>{
      try{
        const d=JSON.parse(l.data||"{}");
        if(d.pilot_name&&!pm[d.pilot_name]) pm[d.pilot_name]={cert_type:d.pilot_cert_type,cert_period:d.pilot_cert_period,cert_no:d.pilot_cert_no};
        if(d.obs_name&&!om[d.obs_name]) om[d.obs_name]={cert_type:d.obs_cert_type,cert_period:d.obs_cert_period,cert_no:d.obs_cert_no};
      }catch{}
    });
    setPilotSugg(Object.entries(pm).map(([name,info])=>({name,...info})));
    setObsSugg(Object.entries(om).map(([name,info])=>({name,...info})));
  },[logs]);

  function selectPilot(p){
    const min=logs.reduce((s,l)=>{try{const d=JSON.parse(l.data||"{}");if(d.pilot_name===p.name)return s+toMin(d.mission_hours);}catch{}return s;},0);
    const sameUAV=logs.find(l=>{try{const d=JSON.parse(l.data||"{}");return d.serial===f.serial;}catch{return false;}});
    let pt="";if(sameUAV){try{const d=JSON.parse(sameUAV.data||"{}");pt=d.total_hours||d.prev_total||"";}catch{}}
    setF(prev=>({...prev,pilot_name:p.name,pilot_cert_type:p.cert_type||"",pilot_cert_period:p.cert_period||"",pilot_cert_no:p.cert_no||"",prev_total:pt,_pilot_acc:toHHMM(min)}));
    setShowPDrop(false);
  }
  function selectObs(o){
    setF(prev=>({...prev,obs_name:o.name,obs_cert_type:o.cert_type||"",obs_cert_period:o.cert_period||"",obs_cert_no:o.cert_no||""}));
    setShowODrop(false);
  }
  function changeSerial(v){
    upd("serial",v);
    const hit=logs.find(l=>{try{const d=JSON.parse(l.data||"{}");return d.serial===v;}catch{return false;}});
    if(hit){try{const d=JSON.parse(hit.data||"{}");upd("prev_total",d.total_hours||d.prev_total||"");}catch{}}
  }
  useEffect(()=>{
    if(f.prev_total&&f.mission_hours) setF(p=>({...p,total_hours:toHHMM(toMin(f.prev_total)+toMin(f.mission_hours))}));
  },[f.prev_total,f.mission_hours]);

  // 新增 / 更新
  async function save(){
    setSaving(true);
    try{
      const payload={data:JSON.stringify(f),mission_date:f.mission_date||null,pilot_name:f.pilot_name,serial:f.serial};
      if(editId){
        await sbUpdate(editId,payload);
        flash("✅ 更新成功！");
      }else{
        await sbInsert(payload);
        flash("✅ 儲存成功！");
      }
      await loadList();
    }catch(e){flash("❌ 失敗："+e.message,false);}
    finally{setSaving(false);}
  }

  // 載入紀錄進表單進行編輯
  function startEdit(log){
    let d={};try{d=JSON.parse(log.data||"{}");}catch{}
    setF({...EMPTY,...d,checks:{...EMPTY.checks,...(d.checks||{})}});
    setEditId(log.id);
    setTab("form");
    window.scrollTo({top:0,behavior:"smooth"});
    flash("📝 已載入紀錄，修改後請按「更新」",true);
  }

  function newForm(){
    setF(EMPTY);
    setEditId(null);
    setTab("form");
    window.scrollTo({top:0,behavior:"smooth"});
  }

  // 刪除
  async function confirmDelete(id){
    try{
      await sbDelete(id);
      flash("🗑 紀錄已刪除");
      setDeleting(null);
      await loadList();
    }catch(e){flash("❌ 刪除失敗："+e.message,false);}
  }

  // 篩選
  const filtered=logs.filter(l=>{
    const d=l.mission_date||"";
    return (l.pilot_name||"").includes(search.pilot)&&(!search.dateFrom||d>=search.dateFrom)&&(!search.dateTo||d<=search.dateTo);
  });
  const totalMin=filtered.reduce((s,l)=>{try{const d=JSON.parse(l.data||"{}");return s+toMin(d.mission_hours);}catch{return s;}},0);
  const pilots={},uavs={};
  filtered.forEach(l=>{
    const n=l.pilot_name||"未知",sn=l.serial||"未知";
    try{const d=JSON.parse(l.data||"{}");pilots[n]=(pilots[n]||0)+toMin(d.mission_hours);uavs[sn]=(uavs[sn]||0)+toMin(d.mission_hours);}catch{}
  });

  if(tab==="preview") return(
    <div>
      <div className="no-print" style={{position:"fixed",top:0,left:0,right:0,background:"#1a3251",padding:"10px 16px",display:"flex",gap:10,zIndex:999,flexWrap:"wrap"}}>
        <button onClick={()=>window.print()} style={btnB}>🖨 列印/存PDF</button>
        {editId&&<button onClick={()=>setTab("form")} style={btnY}>✏️ 繼續編輯</button>}
        <button onClick={()=>setTab("form")} style={btnG}>← 返回</button>
      </div>
      <div style={{marginTop:56}}><PrintForm f={f}/></div>
    </div>
  );

  const navBtn=(t,icon,label)=>(
    <button onClick={()=>{setTab(t);if(t==="history")loadList();}}
      style={{flex:1,padding:"10px 4px",border:"none",background:tab===t?"#38b6ff":"#1a3251",color:"#fff",fontSize:12,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
      <span style={{fontSize:18}}>{icon}</span>{label}
    </button>
  );

  return(
    <>
      <SpeedInsights />
      <div style={{fontFamily:"sans-serif",background:"#f0f4f8",minHeight:"100vh",paddingBottom:80}}>

      {/* 頂部 */}
      <div style={{background:"#1a3251",color:"#fff",padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontSize:15,fontWeight:700}}>✈ 無人機飛航日誌</div>
          {editId&&<div style={{fontSize:11,color:"#f39c12",marginTop:2}}>✏️ 編輯模式：{f.mission_date||"（未填日期）"} {f.pilot_name}</div>}
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {editId&&<button onClick={newForm} style={btnW}>＋ 新增</button>}
          <button onClick={save} disabled={saving} style={editId?btnY:btnB}>{saving?"處理中…":editId?"💾 更新":"💾 儲存"}</button>
          <button onClick={()=>setTab("preview")} style={btnG}>👁 列印</button>
        </div>
      </div>

      {/* 訊息 */}
      {msg&&<div style={{background:msg.ok?"#d4edda":"#f8d7da",color:msg.ok?"#155724":"#721c24",padding:"10px 14px",fontSize:13,fontWeight:600}}>{msg.text}</div>}

      {/* 編輯模式提示列 */}
      {editId&&tab==="form"&&(
        <div style={{background:"#fff8e1",borderLeft:"4px solid #f39c12",padding:"8px 14px",fontSize:13,color:"#856404",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>✏️ 編輯模式｜修改完成後按「更新」</span>
          <button onClick={newForm} style={{background:"none",border:"1px solid #856404",color:"#856404",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:12}}>取消編輯</button>
        </div>
      )}

      {/* 底部導覽 */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,display:"flex",background:"#1a3251",zIndex:999,borderTop:"2px solid #38b6ff"}}>
        {navBtn("form","📝","填寫")}
        {navBtn("stats","📊","統計")}
        {navBtn("history","📋","紀錄")}
      </div>

      {/* ══ 填寫表單 ══ */}
      {tab==="form"&&(
        <div style={{padding:12,maxWidth:640,margin:"0 auto"}}>
          <Section title="基本資料" color="#1a3251" icon="📋">
            <Field label="型式" value={f.model} onChange={v=>upd("model",v)}/>
            <Field label="序號" value={f.serial} onChange={changeSerial}/>
            <Field label="註冊號碼" value={f.reg_no} onChange={v=>upd("reg_no",v)}/>
            <Field label="有效期限" value={f.valid_until} onChange={v=>upd("valid_until",v)}/>
            <Field label="保險承攬公司" value={f.insurer} onChange={v=>upd("insurer",v)}/>
            <Field label="公司電話" value={f.insurer_tel} onChange={v=>upd("insurer_tel",v)}/>
            <Field label="保單編號" value={f.policy_no} onChange={v=>upd("policy_no",v)}/>
            <Field label="保險期限" value={f.insurance_until} onChange={v=>upd("insurance_until",v)}/>
          </Section>

          <Section title="飛航時間與飛安事故" color="#c0392b" icon="🕐">
            <Field label="任務日期 *" value={f.mission_date} onChange={v=>upd("mission_date",v)} type="date"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <Field label="Drone Map 報到" value={f.drm_arrive} onChange={v=>upd("drm_arrive",v)} placeholder="HH:MM"/>
              <Field label="Drone Map 離場" value={f.drm_leave} onChange={v=>upd("drm_leave",v)} placeholder="HH:MM"/>
              <Field label="無人機起飛時間" value={f.uav_takeoff} onChange={v=>upd("uav_takeoff",v)} placeholder="HH:MM"/>
              <Field label="無人機降落時間" value={f.uav_land} onChange={v=>upd("uav_land",v)} placeholder="HH:MM"/>
            </div>
            <div style={{background:"#fff8e1",border:"1px solid #ffc107",borderRadius:8,padding:10,marginBottom:10}}>
              <div style={{fontSize:12,color:"#b8860b",fontWeight:700,marginBottom:6}}>⏱ 飛行時數（自動計算）</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <Field label="前次累計時數" value={f.prev_total} onChange={v=>upd("prev_total",v)} placeholder="HH:MM" highlight={!!f.prev_total}/>
                <Field label="本次任務時數" value={f.mission_hours} onChange={v=>upd("mission_hours",v)} placeholder="HH:MM"/>
              </div>
              <Field label="目前累計時數（自動）" value={f.total_hours} onChange={v=>upd("total_hours",v)} readOnly={!!(f.prev_total&&f.mission_hours)} highlight={!!(f.prev_total&&f.mission_hours)}/>
            </div>
            <div style={{marginBottom:8}}>
              <div style={{fontSize:12,color:"#666",marginBottom:4}}>本機前次日誌有無異常紀錄</div>
              <Radio checked={f.prev_abnormal==="無"} onChange={()=>upd("prev_abnormal","無")} label="無"/>
              <Radio checked={f.prev_abnormal==="有"} onChange={()=>upd("prev_abnormal","有")} label="有"/>
              {f.prev_abnormal==="有"&&<Field label="問題描述" value={f.prev_abnormal_desc} onChange={v=>upd("prev_abnormal_desc",v)}/>}
            </div>
            <div style={{marginBottom:8}}>
              <div style={{fontSize:12,color:"#666",marginBottom:4}}>事故發生原因</div>
              {["機械問題墜落","電池問題墜落","天候問題墜落","操作問題墜落","其它問題墜落"].map(c=>(
                <Chk key={c} checked={f.accident_causes.includes(c)} onChange={()=>upd("accident_causes",toggle(f.accident_causes,c))} label={c}/>
              ))}
            </div>
            <div>
              <div style={{fontSize:12,color:"#666",marginBottom:4}}>墜落後造成</div>
              {["機體損毀(未遺失)","機體遺落失蹤","第三人財損","第三人死、傷","其它情形"].map(c=>(
                <Chk key={c} checked={f.accident_results.includes(c)} onChange={()=>upd("accident_results",toggle(f.accident_results,c))} label={c}/>
              ))}
            </div>
          </Section>

          <Section title="空間位置及座標" color="#6a994e" icon="📍">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <Field label="經度" value={f.lng} onChange={v=>upd("lng",v)}/>
              <Field label="緯度" value={f.lat} onChange={v=>upd("lat",v)}/>
              <Field label="TWD97 E" value={f.twd97_e} onChange={v=>upd("twd97_e",v)}/>
              <Field label="TWD97 N" value={f.twd97_n} onChange={v=>upd("twd97_n",v)}/>
            </div>
            <Field label="行政區" value={f.admin_area} onChange={v=>upd("admin_area",v)}/>
            <Field label="地段" value={f.land_section} onChange={v=>upd("land_section",v)}/>
            <Field label="地號" value={f.land_no} onChange={v=>upd("land_no",v)}/>
          </Section>

          <Section title="空域 / 核准文件" color="#8e44ad" icon="🛡">
            {["綠色（120M以下）","黃色（60M以下或申請解禁）","紅色（法人通過審查解禁）"].map(c=>(
              <div key={c}><Chk checked={f.airspace_color===c} onChange={()=>upd("airspace_color",c)} label={c}/></div>
            ))}
            <Field label="民航局核准文號" value={f.caa_approval} onChange={v=>upd("caa_approval",v)}/>
            <Field label="地方政府核准文號" value={f.gov_approval} onChange={v=>upd("gov_approval",v)}/>
          </Section>

          <Section title="本次任務屬性" color="#e67e22" icon="🎯">
            <div style={{display:"flex",flexWrap:"wrap"}}>
              {["定期空置營區巡查","專案任務飛航","天然災害後飛航巡檢","臨時交辦任務","訓練飛行"].map(c=>(
                <Chk key={c} checked={f.mission_types.includes(c)} onChange={()=>upd("mission_types",toggle(f.mission_types,c))} label={c}/>
              ))}
            </div>
            <Field label="其它" value={f.mission_other} onChange={v=>upd("mission_other",v)}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <Field label="指派人級職" value={f.mission_dispatcher_rank} onChange={v=>upd("mission_dispatcher_rank",v)}/>
              <Field label="指派人姓名" value={f.mission_dispatcher_name} onChange={v=>upd("mission_dispatcher_name",v)}/>
            </div>
          </Section>

          <Section title="任務執行人員" color="#2471a3" icon="👤">
            <div style={{background:"#e8f4fd",borderRadius:8,padding:10,marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:13,color:"#1a3251",marginBottom:8}}>操作員</div>
              <div style={{position:"relative",marginBottom:10}}>
                <div style={{fontSize:12,color:"#666",marginBottom:3}}>姓名（點選歷史自動填入）</div>
                <input value={f.pilot_name} onChange={e=>{upd("pilot_name",e.target.value);setShowPDrop(true);}} onFocus={()=>setShowPDrop(true)}
                  style={{width:"100%",border:"1px solid #ddd",borderRadius:6,padding:"8px 10px",fontSize:14,boxSizing:"border-box",background:"#fff"}}/>
                {showPDrop&&pilotSugg.filter(p=>p.name.includes(f.pilot_name)).length>0&&(
                  <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1px solid #ddd",borderRadius:6,zIndex:99,boxShadow:"0 4px 12px rgba(0,0,0,0.15)"}}>
                    {pilotSugg.filter(p=>p.name.includes(f.pilot_name)).map(p=>(
                      <div key={p.name} onClick={()=>selectPilot(p)} style={{padding:"10px 12px",cursor:"pointer",borderBottom:"1px solid #f0f0f0",fontSize:13}}>
                        <div style={{fontWeight:700}}>{p.name}</div>
                        <div style={{fontSize:11,color:"#888"}}>{p.cert_type} | {p.cert_no}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {f._pilot_acc&&<div style={{background:"#1a3251",color:"#38b6ff",borderRadius:6,padding:"6px 10px",fontSize:13,marginBottom:8,fontWeight:700}}>⏱ 歷史累積：{f._pilot_acc}</div>}
              <Field label="操作證類別" value={f.pilot_cert_type} onChange={v=>upd("pilot_cert_type",v)} highlight={!!f.pilot_cert_type}/>
              <Field label="操作證效期" value={f.pilot_cert_period} onChange={v=>upd("pilot_cert_period",v)} highlight={!!f.pilot_cert_period}/>
              <Field label="操作證編號" value={f.pilot_cert_no} onChange={v=>upd("pilot_cert_no",v)} highlight={!!f.pilot_cert_no}/>
            </div>
            <div style={{background:"#f0fff4",borderRadius:8,padding:10}}>
              <div style={{fontWeight:700,fontSize:13,color:"#1a5c2e",marginBottom:8}}>觀察員</div>
              <div style={{position:"relative",marginBottom:10}}>
                <div style={{fontSize:12,color:"#666",marginBottom:3}}>姓名（點選歷史自動填入）</div>
                <input value={f.obs_name} onChange={e=>{upd("obs_name",e.target.value);setShowODrop(true);}} onFocus={()=>setShowODrop(true)}
                  style={{width:"100%",border:"1px solid #ddd",borderRadius:6,padding:"8px 10px",fontSize:14,boxSizing:"border-box",background:"#fff"}}/>
                {showODrop&&obsSugg.filter(o=>o.name.includes(f.obs_name)).length>0&&(
                  <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1px solid #ddd",borderRadius:6,zIndex:99,boxShadow:"0 4px 12px rgba(0,0,0,0.15)"}}>
                    {obsSugg.filter(o=>o.name.includes(f.obs_name)).map(o=>(
                      <div key={o.name} onClick={()=>selectObs(o)} style={{padding:"10px 12px",cursor:"pointer",borderBottom:"1px solid #f0f0f0",fontSize:13}}>
                        <div style={{fontWeight:700}}>{o.name}</div>
                        <div style={{fontSize:11,color:"#888"}}>{o.cert_type} | {o.cert_no}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Field label="操作證類別" value={f.obs_cert_type} onChange={v=>upd("obs_cert_type",v)} highlight={!!f.obs_cert_type}/>
              <Field label="操作證效期" value={f.obs_cert_period} onChange={v=>upd("obs_cert_period",v)} highlight={!!f.obs_cert_period}/>
              <Field label="操作證編號" value={f.obs_cert_no} onChange={v=>upd("obs_cert_no",v)} highlight={!!f.obs_cert_no}/>
            </div>
          </Section>

          <Section title="氣象資料" color="#2980b9" icon="🌤">
            <div style={{marginBottom:8}}>
              <div style={{fontSize:12,color:"#666",marginBottom:4}}>中央氣象��天候</div>
              {["晴天","多雲","陰天","雨天","其它"].map(w=>(
                <Chk key={w} checked={f.weather_cwa.includes(w)} onChange={()=>upd("weather_cwa",toggle(f.weather_cwa,w))} label={w}/>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <Field label="日出時間" value={f.sunrise} onChange={v=>upd("sunrise",v)}/>
              <Field label="日落時間" value={f.sunset} onChange={v=>upd("sunset",v)}/>
              <Field label="平均風速(m/s)" value={f.avg_wind} onChange={v=>upd("avg_wind",v)}/>
              <Field label="風速等級" value={f.wind_level} onChange={v=>upd("wind_level",v)}/>
              <Field label="能見度(km)" value={f.visibility} onChange={v=>upd("visibility",v)}/>
              <Field label="氣溫" value={f.temp} onChange={v=>upd("temp",v)}/>
            </div>
            <div style={{marginBottom:8}}>
              <div style={{fontSize:12,color:"#666",marginBottom:4}}>風向</div>
              <div style={{display:"flex",flexWrap:"wrap"}}>
                {["北風","東北風","東風","東南風","南風","西南風","西風","西北風"].map(w=>(
                  <Chk key={w} checked={f.wind_dir.includes(w)} onChange={()=>upd("wind_dir",toggle(f.wind_dir,w))} label={w}/>
                ))}
              </div>
            </div>
            <div style={{marginBottom:8}}>
              <div style={{fontSize:12,color:"#666",marginBottom:4}}>任務地點天候</div>
              {["晴天","多雲","陰天","雨天(禁飛)","日出前日落後(禁飛)"].map(w=>(
                <Chk key={w} checked={f.site_weather.includes(w)} onChange={()=>upd("site_weather",toggle(f.site_weather,w))} label={w} red={w.includes("禁飛")}/>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <Field label="現場平均風速" value={f.site_wind} onChange={v=>upd("site_wind",v)}/>
              <Field label="現場氣溫" value={f.site_temp} onChange={v=>upd("site_temp",v)}/>
            </div>
            <div style={{marginBottom:8}}>
              <div style={{fontSize:12,color:"#666",marginBottom:4}}>氣象條件綜合評估</div>
              <Radio checked={f.weather_ok==="同意飛行"} onChange={()=>upd("weather_ok","同意飛行")} label="同意飛行"/>
              <Radio checked={f.weather_ok==="禁止飛行"} onChange={()=>upd("weather_ok","禁止飛行")} label="禁止飛行"/>
            </div>
            <Field label="觀察員簽名" value={f.weather_observer} onChange={v=>upd("weather_observer",v)}/>
          </Section>

          <Section title="機體飛安檢查" color="#16a085" icon="✅">
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:280}}>
                <thead>
                  <tr>
                    <th style={{...thc,textAlign:"left"}}>檢查項目</th>
                    <th style={thc}>飛行前</th>
                    <th style={thc}>飛行後</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td colSpan={3} style={{...tdc,background:"#e8f4fd",fontWeight:"bold"}}>動力系統</td></tr>
                  {[["prop","螺旋槳：目視外觀無裂損"],["motor","馬達：確認固裝妥當及無裂損"],["dir","方向性：正/反槳安裝正確"]].map(([k,l])=>(
                    <CheckRow key={k} label={l} bv={f.checks[`${k}_before`]} av={f.checks[`${k}_after`]} onChange={(s,v)=>updC(k,s,v)}/>
                  ))}
                  <tr><td colSpan={3} style={{...tdc,background:"#e8f4fd",fontWeight:"bold"}}>載具</td></tr>
                  {[["bat","電池：檢查外觀、電壓及固裝"],["arm","機臂：外觀確認固裝妥當"],["body","機身及酬載：外觀確認固裝"],["fc","飛行控制器：外觀確認固裝"],["gps","GPS模組：外觀確認固裝"],["elec","電系接頭：外觀確認固裝"],["sys","全系統動態檢查(含操控器)"]].map(([k,l])=>(
                    <CheckRow key={k} label={l} bv={f.checks[`${k}_before`]} av={f.checks[`${k}_after`]} onChange={(s,v)=>updC(k,s,v)}/>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{marginTop:10}}>
              <div style={{fontSize:12,color:"#666",marginBottom:4}}>機體條件綜合評估</div>
              <Radio checked={f.aircraft_ok==="同意飛行"} onChange={()=>upd("aircraft_ok","同意飛行")} label="同意飛行"/>
              <Radio checked={f.aircraft_ok==="禁止飛行"} onChange={()=>upd("aircraft_ok","禁止飛行")} label="禁止飛行"/>
            </div>
          </Section>

          <Section title="空拍資訊回饋" color="#7f8c8d" icon="📸">
            <Chk checked={f.aerial_normal} onChange={()=>upd("aerial_normal",!f.aerial_normal)} label="無異狀"/>
            <Chk checked={f.aerial_abnormal} onChange={()=>upd("aerial_abnormal",!f.aerial_abnormal)} label="有異狀"/>
            <SField label="異狀描述" value={f.aerial_desc} onChange={v=>upd("aerial_desc",v)} rows={4}/>
          </Section>

          <div style={{display:"flex",gap:10,paddingBottom:20}}>
            <button onClick={save} disabled={saving} style={{...( editId?btnY:btnB),flex:1,padding:14,fontSize:15}}>{saving?"處理中…":editId?"💾 更新紀錄":"💾 儲存紀錄"}</button>
            <button onClick={()=>setTab("preview")} style={{...btnG,flex:1,padding:14,fontSize:15}}>👁 預覽列印</button>
          </div>
        </div>
      )}

      {/* ══ 統計 ══ */}
      {tab==="stats"&&(
        <div style={{padding:12,maxWidth:640,margin:"0 auto"}}>
          <div style={{background:"#fff",borderRadius:10,padding:14,marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,.1)"}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:10,color:"#1a3251"}}>🔍 篩選條件</div>
            <Field label="操作員姓名" value={search.pilot} onChange={v=>setSearch(s=>({...s,pilot:v}))} placeholder="留空顯示全部"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <Field label="開始日期" value={search.dateFrom} onChange={v=>setSearch(s=>({...s,dateFrom:v}))} type="date"/>
              <Field label="結束日期" value={search.dateTo} onChange={v=>setSearch(s=>({...s,dateTo:v}))} type="date"/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <StatCard icon="✈" label="總航班數" value={filtered.length+"　班"} color="#1a3251"/>
            <StatCard icon="⏱" label="總飛行時數" value={toHHMM(totalMin)} color="#c0392b"/>
            <StatCard icon="👥" label="操作員人數" value={Object.keys(pilots).length+"　人"} color="#6a994e"/>
            <StatCard icon="🚁" label="無人機數量" value={Object.keys(uavs).length+"　架"} color="#8e44ad"/>
          </div>
          {Object.keys(pilots).length>0&&(
            <div style={{background:"#fff",borderRadius:10,padding:14,marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,.1)"}}>
              <div style={{fontWeight:700,fontSize:15,marginBottom:10,color:"#1a3251"}}>👤 各操作員累積飛行時數</div>
              {Object.entries(pilots).sort((a,b)=>b[1]-a[1]).map(([name,min])=>(
                <div key={name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #f0f0f0"}}>
                  <span style={{fontSize:14,fontWeight:600}}>{name}</span>
                  <span style={{fontWeight:700,color:"#c0392b",fontSize:15,background:"#fff0f0",padding:"3px 10px",borderRadius:6}}>{toHHMM(min)}</span>
                </div>
              ))}
            </div>
          )}
          {Object.keys(uavs).length>0&&(
            <div style={{background:"#fff",borderRadius:10,padding:14,boxShadow:"0 1px 4px rgba(0,0,0,.1)"}}>
              <div style={{fontWeight:700,fontSize:15,marginBottom:10,color:"#1a3251"}}>🚁 各無人機累積飛行時數</div>
              {Object.entries(uavs).sort((a,b)=>b[1]-a[1]).map(([sn,min])=>(
                <div key={sn} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #f0f0f0"}}>
                  <span style={{fontSize:13,color:"#555"}}>{sn}</span>
                  <span style={{fontWeight:700,color:"#8e44ad",fontSize:15,background:"#f5f0ff",padding:"3px 10px",borderRadius:6}}>{toHHMM(min)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ 歷史紀錄 ══ */}
      {tab==="history"&&(
        <div style={{padding:12,maxWidth:640,margin:"0 auto"}}>
          <div style={{background:"#fff",borderRadius:10,padding:14,marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,.1)"}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:10,color:"#1a3251"}}>🔍 查詢</div>
            <Field label="操作員姓名" value={search.pilot} onChange={v=>setSearch(s=>({...s,pilot:v}))} placeholder="留空顯示全部"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <Field label="開始日期" value={search.dateFrom} onChange={v=>setSearch(s=>({...s,dateFrom:v}))} type="date"/>
              <Field label="結束日期" value={search.dateTo} onChange={v=>setSearch(s=>({...s,dateTo:v}))} type="date"/>
            </div>
          </div>
          <div style={{fontSize:13,color:"#666",marginBottom:8}}>共 {filtered.length} 筆紀錄</div>

          {filtered.length===0?(
            <div style={{textAlign:"center",padding:40,color:"#aaa"}}>查無紀錄</div>
          ):filtered.map((l,i)=>{
            let d={};try{d=JSON.parse(l.data||"{}");}catch{}
            const isDeleting=deleting===l.id;
            return(
              <div key={l.id||i} style={{background:"#fff",borderRadius:10,padding:14,marginBottom:10,boxShadow:"0 1px 4px rgba(0,0,0,.1)"}}>
                {/* 內容列 */}
                <div style={{marginBottom:10}}>
                  <div style={{fontWeight:700,fontSize:15,color:"#1a3251"}}>{l.mission_date||"（未填日期）"}</div>
                  <div style={{fontSize:13,color:"#555",marginTop:3}}>👤 {l.pilot_name||"—"}</div>
                  <div style={{fontSize:13,color:"#c0392b",fontWeight:600}}>⏱ 本次：{d.mission_hours||"—"}　累計：{d.total_hours||"—"}</div>
                  <div style={{fontSize:12,color:"#888",marginTop:2}}>{d.mission_types?.join("、")||""}</div>
                </div>
                {/* 操作按鈕 */}
                {!isDeleting?(
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>{setF({...EMPTY,...d,checks:{...EMPTY.checks,...(d.checks||{})}});setTab("preview");}}
                      style={{...btnB,flex:1,fontSize:13,padding:"8px 0"}}>👁 查看</button>
                    <button onClick={()=>startEdit(l)}
                      style={{...btnY,flex:1,fontSize:13,padding:"8px 0"}}>✏️ 編輯</button>
                    <button onClick={()=>setDeleting(l.id)}
                      style={{...btnR,flex:1,fontSize:13,padding:"8px 0"}}>🗑 刪除</button>
                  </div>
                ):(
                  <div style={{background:"#fff3cd",border:"1px solid #ffc107",borderRadius:8,padding:10}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#856404",marginBottom:8}}>⚠️ 確認刪除此筆紀錄？此操作無法復原！</div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>confirmDelete(l.id)} style={{...btnR,flex:1,padding:"8px 0",fontSize:13}}>✅ 確認刪除</button>
                      <button onClick={()=>setDeleting(null)} style={{...btnW,flex:1,padding:"8px 0",fontSize:13,border:"1px solid #ccc"}}>❌ 取消</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>
    </>
  );
}

function StatCard({icon,label,value,color}){
  return(
    <div style={{background:color,borderRadius:10,padding:"14px 12px",color:"#fff",textAlign:"center",boxShadow:"0 2px 6px rgba(0,0,0,0.2)"}}>
      <div style={{fontSize:26}}>{icon}</div>
      <div style={{fontSize:11,opacity:.85,marginTop:4}}>{label}</div>
      <div style={{fontSize:17,fontWeight:700,marginTop:4}}>{value}</div>
    </div>
  );
}

// ── 彩色列印版 ──────────────────────────────────────────────
function PrintForm({f}){
  const C={navy:"#1a3251",red:"#c0392b",green:"#6a994e",purple:"#8e44ad",orange:"#e67e22",blue:"#2980b9",teal:"#16a085",gray:"#7f8c8d"};
  function SH({title,color,icon}){return(<div style={{background:color,color:"#fff",fontWeight:700,fontSize:13,padding:"6px 12px",marginTop:10,marginBottom:0,borderRadius:"6px 6px 0 0",display:"flex",alignItems:"center",gap:6}}>{icon} {title}</div>);}
  function Box({children,color}){return(<div style={{border:`2px solid ${color}`,borderRadius:"0 0 6px 6px",padding:10,marginBottom:10,background:"#fff"}}>{children}</div>);}
  function Row({label,value,lc}){return(<div style={{display:"flex",gap:6,marginBottom:4,alignItems:"flex-start"}}><span style={{fontSize:12,color:lc||"#555",minWidth:90,flexShrink:0,fontWeight:600}}>{label}</span><span style={{fontSize:13,color:"#000",flex:1,borderBottom:"1px solid #eee",paddingBottom:2}}>{value||"—"}</span></div>);}
  function G2({children}){return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>{children}</div>;}
  function CD({checked,label,danger}){return(<span style={{display:"inline-flex",alignItems:"center",gap:3,marginRight:10,marginBottom:3,fontSize:12,color:danger&&checked?"#c00":"#333"}}><span style={{width:14,height:14,border:"1px solid #999",borderRadius:2,background:checked?"#1a3251":"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10,flexShrink:0}}>{checked?"✓":""}</span>{label}</span>);}
  return(
    <div style={{fontFamily:"'Microsoft JhengHei',sans-serif",color:"#000",padding:16,maxWidth:800,margin:"0 auto",background:"#f8f9fa"}}>
      <style>{`@media print{.no-print{display:none!important} body{background:#fff} *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}}`}</style>
      <div style={{background:"linear-gradient(135deg,#1a3251,#2980b9)",color:"#fff",borderRadius:10,padding:"16px 20px",marginBottom:14,textAlign:"center",boxShadow:"0 3px 10px rgba(0,0,0,0.2)"}}>
        <h2 style={{margin:0,fontSize:20,letterSpacing:4}}>遙控無人多旋翼機飛航日誌</h2>
        <div style={{fontSize:12,opacity:.8,marginTop:4}}>編號：115-M3SE-0001　附表7　列印時間：{new Date().toLocaleString("zh-TW")}</div>
      </div>
      <SH title="基本資料" color={C.navy} icon="📋"/><Box color={C.navy}><G2><Row label="型式" value={f.model} lc={C.navy}/><Row label="序號" value={f.serial} lc={C.navy}/><Row label="註冊號碼" value={f.reg_no} lc={C.navy}/><Row label="有效期限" value={f.valid_until} lc={C.navy}/><Row label="保險公司" value={f.insurer} lc={C.navy}/><Row label="電話" value={f.insurer_tel} lc={C.navy}/><Row label="保單編號" value={f.policy_no} lc={C.navy}/><Row label="保險期限" value={f.insurance_until} lc={C.navy}/></G2></Box>
      <SH title="飛航時間與飛安事故" color={C.red} icon="🕐"/><Box color={C.red}><G2><Row label="任務日期" value={f.mission_date} lc={C.red}/><Row label="DM報到" value={f.drm_arrive} lc={C.red}/><Row label="DM離場" value={f.drm_leave} lc={C.red}/><Row label="起飛時間" value={f.uav_takeoff} lc={C.red}/><Row label="降落時間" value={f.uav_land} lc={C.red}/><Row label="前次累計" value={f.prev_total} lc={C.red}/><Row label="本次時數" value={f.mission_hours} lc={C.red}/><Row label="目前累計" value={f.total_hours} lc={C.red}/></G2><Row label="前次異常" value={`${f.prev_abnormal} ${f.prev_abnormal_desc}`} lc={C.red}/><div style={{fontSize:12,color:"#666",marginBottom:3,fontWeight:600}}>事故原因</div><div style={{marginBottom:6}}>{["機械問題墜落","電池問題墜落","天候問題墜落","操作問題墜落","其它問題墜落"].map(c=><CD key={c} checked={f.accident_causes?.includes(c)} label={c}/>)}</div><div style={{fontSize:12,color:"#666",marginBottom:3,fontWeight:600}}>墜落後造成</div><div>{["機體損毀(未遺失)","機體遺落失蹤","第三人財損","第三人死、傷","其它情形"].map(c=><CD key={c} checked={f.accident_results?.includes(c)} label={c} danger/>)}</div></Box>
      <SH title="空間位置及座標" color={C.green} icon="📍"/><Box color={C.green}><G2><Row label="經度" value={f.lng} lc={C.green}/><Row label="緯度" value={f.lat} lc={C.green}/><Row label="TWD97 E" value={f.twd97_e} lc={C.green}/><Row label="TWD97 N" value={f.twd97_n} lc={C.green}/><Row label="行政區" value={f.admin_area} lc={C.green}/><Row label="地段" value={f.land_section} lc={C.green}/></G2><Row label="地號" value={f.land_no} lc={C.green}/></Box>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div><SH title="空域" color={C.purple} icon="🛡"/><Box color={C.purple}><div style={{marginBottom:6}}>{["綠色（120M以下）","黃色（60M或解禁）","紅色（法人解禁）"].map((c,i)=><div key={i}><CD checked={f.airspace_color===c} label={c}/></div>)}</div><Row label="民航局" value={f.caa_approval} lc={C.purple}/><Row label="地方政府" value={f.gov_approval} lc={C.purple}/></Box></div>
        <div><SH title="任務屬性" color={C.orange} icon="🎯"/><Box color={C.orange}><div style={{marginBottom:6}}>{["定期巡查","專案飛航","災害巡檢","臨時交辦","訓練飛行"].map((c,i)=>{const full=["定期空置營區巡查","專案任務飛航","天然災害後飛航巡檢","臨時交辦任務","訓練飛行"][i];return<div key={i}><CD checked={f.mission_types?.includes(full)} label={c}/></div>;})}</div><Row label="指派人" value={`${f.mission_dispatcher_rank} ${f.mission_dispatcher_name}`} lc={C.orange}/></Box></div>
      </div>
      <SH title="任務執行人員" color={C.blue} icon="👤"/><Box color={C.blue}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}><div style={{background:"#e8f4fd",borderRadius:6,padding:8}}><div style={{fontWeight:700,fontSize:12,color:C.blue,marginBottom:6}}>操作員</div><Row label="姓名" value={f.pilot_name} lc={C.blue}/><Row label="證別" value={f.pilot_cert_type} lc={C.blue}/><Row label="效期" value={f.pilot_cert_period} lc={C.blue}/><Row label="編號" value={f.pilot_cert_no} lc={C.blue}/><div style={{fontSize:11,color:"#888",marginTop:6}}>簽名：＿＿＿＿＿</div></div><div style={{background:"#f0fff4",borderRadius:6,padding:8}}><div style={{fontWeight:700,fontSize:12,color:C.green,marginBottom:6}}>觀察員</div><Row label="姓名" value={f.obs_name} lc={C.green}/><Row label="證別" value={f.obs_cert_type} lc={C.green}/><Row label="效期" value={f.obs_cert_period} lc={C.green}/><Row label="編號" value={f.obs_cert_no} lc={C.green}/><div style={{fontSize:11,color:"#888",marginTop:6}}>簽名：＿＿＿＿＿</div></div></div></Box>
      <SH title="氣象相關資料" color={C.blue} icon="🌤"/><Box color={C.blue}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}><div><div style={{fontSize:12,fontWeight:700,color:C.blue,marginBottom:4}}>中央氣象署</div><div style={{marginBottom:4}}>{["晴天","多雲","陰天","雨天","其它"].map(w=><CD key={w} checked={f.weather_cwa?.includes(w)} label={w}/>)}</div><Row label="日出/落" value={`${f.sunrise}/${f.sunset}`} lc={C.blue}/><Row label="風速/等級" value={`${f.avg_wind}m/s ${f.wind_level}級`} lc={C.blue}/><Row label="能見度" value={`${f.visibility}km`} lc={C.blue}/><Row label="氣溫" value={f.temp} lc={C.blue}/><div style={{fontSize:11,color:"#666",marginTop:4}}>{f.wind_dir?.join(" ")}</div></div><div><div style={{fontSize:12,fontWeight:700,color:C.teal,marginBottom:4}}>任務地點</div><div style={{marginBottom:4}}>{["晴天","多雲","陰天","雨天(禁飛)","日出前日落後"].map(w=><CD key={w} checked={f.site_weather?.includes(w)} label={w} danger={w.includes("禁飛")}/>)}</div><Row label="現場風速" value={f.site_wind} lc={C.teal}/><Row label="現場氣溫" value={f.site_temp} lc={C.teal}/><div style={{marginTop:8,background:f.weather_ok==="同意飛行"?"#d4edda":"#f8d7da",borderRadius:6,padding:"6px 10px",fontSize:13,fontWeight:700,color:f.weather_ok==="同意飛行"?"#155724":"#721c24"}}>評估：{f.weather_ok||"—"}　{f.weather_observer}</div></div></div></Box>
      <SH title="機體飛安檢查" color={C.teal} icon="✅"/><Box color={C.teal}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr><th style={{background:C.teal,color:"#fff",padding:"5px 8px",fontSize:12,textAlign:"left",border:"1px solid #ccc"}}>項目</th><th style={{background:C.teal,color:"#fff",padding:"5px 8px",fontSize:12,textAlign:"center",border:"1px solid #ccc"}}>飛行前</th><th style={{background:C.teal,color:"#fff",padding:"5px 8px",fontSize:12,textAlign:"center",border:"1px solid #ccc"}}>飛行後</th><th style={{background:C.teal,color:"#fff",padding:"5px 8px",fontSize:12,border:"1px solid #ccc"}}>異常</th></tr></thead><tbody><tr><td colSpan={4} style={{background:"#e8f4fd",fontWeight:"bold",fontSize:12,padding:"4px 8px",border:"1px solid #ccc"}}>動力系統</td></tr>{[["prop","螺旋槳"],["motor","馬達"],["dir","方向性"]].map(([k,l])=><tr key={k}><td style={{border:"1px solid #ccc",padding:"4px 8px",fontSize:12}}>{l}</td><td style={{border:"1px solid #ccc",padding:"4px 8px",fontSize:12,textAlign:"center",background:f.checks?.[`${k}_before`]==="是"?"#d4edda":f.checks?.[`${k}_before`]==="否"?"#f8d7da":"#fff"}}>{f.checks?.[`${k}_before`]||""}</td><td style={{border:"1px solid #ccc",padding:"4px 8px",fontSize:12,textAlign:"center",background:f.checks?.[`${k}_after`]==="是"?"#d4edda":f.checks?.[`${k}_after`]==="否"?"#f8d7da":"#fff"}}>{f.checks?.[`${k}_after`]||""}</td><td style={{border:"1px solid #ccc",padding:"4px 8px"}}></td></tr>)}<tr><td colSpan={4} style={{background:"#e8f4fd",fontWeight:"bold",fontSize:12,padding:"4px 8px",border:"1px solid #ccc"}}>載具</td></tr>{[["bat","電池"],["arm","機臂"],["body","機身/酬載"],["fc","飛控"],["gps","GPS"],["elec","電系接頭"],["sys","全系統"]].map(([k,l])=><tr key={k}><td style={{border:"1px solid #ccc",padding:"4px 8px",fontSize:12}}>{l}</td><td style={{border:"1px solid #ccc",padding:"4px 8px",fontSize:12,textAlign:"center",background:f.checks?.[`${k}_before`]==="是"?"#d4edda":f.checks?.[`${k}_before`]==="否"?"#f8d7da":"#fff"}}>{f.checks?.[`${k}_before`]||""}</td><td style={{border:"1px solid #ccc",padding:"4px 8px",fontSize:12,textAlign:"center",background:f.checks?.[`${k}_after`]==="是"?"#d4edda":f.checks?.[`${k}_after`]==="否"?"#f8d7da":"#fff"}}>{f.checks?.[`${k}_after`]||""}</td><td style={{border:"1px solid #ccc",padding:"4px 8px"}}></td></tr>)}<tr><td colSpan={4} style={{border:"1px solid #ccc",padding:"6px 8px",fontSize:12,background:f.aircraft_ok==="同意飛行"?"#d4edda":f.aircraft_ok==="禁止飛行"?"#f8d7da":"#fff",fontWeight:700}}>機體評估：{f.aircraft_ok||"—"}　操作員：＿＿＿＿（簽章）</td></tr></tbody></table></Box>
      <SH title="空拍資訊回饋" color={C.gray} icon="📸"/><Box color={C.gray}><div style={{marginBottom:6}}><CD checked={f.aerial_normal} label="無異狀"/><CD checked={f.aerial_abnormal} label="有異狀" danger/></div><div style={{border:"1px solid #ddd",borderRadius:6,padding:10,minHeight:60,fontSize:13,background:"#fafafa",whiteSpace:"pre-wrap"}}>{f.aerial_desc||""}</div></Box>
    </div>
  );
}

const btnB={background:"#38b6ff",color:"#fff",border:"none",borderRadius:6,padding:"8px 14px",fontSize:13,cursor:"pointer",fontWeight:600};
const btnG={background:"#2ecc71",color:"#fff",border:"none",borderRadius:6,padding:"8px 14px",fontSize:13,cursor:"pointer",fontWeight:600};
const btnY={background:"#f39c12",color:"#fff",border:"none",borderRadius:6,padding:"8px 14px",fontSize:13,cursor:"pointer",fontWeight:600};
const btnR={background:"#e74c3c",color:"#fff",border:"none",borderRadius:6,padding:"8px 14px",fontSize:13,cursor:"pointer",fontWeight:600};
const btnW={background:"#fff",color:"#333",border:"1px solid #ddd",borderRadius:6,padding:"8px 14px",fontSize:13,cursor:"pointer",fontWeight:600};

createRoot(document.getElementById("root")).render(<App/>);
