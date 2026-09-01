const cfg=window.USMC_CONFIG;
let loadingLogs=false;
const sessionKey="usmc_hq_session";
const $=id=>document.getElementById(id);
function esc(value){const node=document.createElement("div");node.textContent=String(value??"");return node.innerHTML}
function toast(message){$("toast").textContent=message;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),3500)}
async function api(action,data={}){const token=localStorage.getItem(sessionKey);const res=await fetch(`${cfg.supabaseUrl}/functions/v1/${cfg.functionName}`,{method:"POST",headers:{"Content-Type":"application/json","apikey":cfg.publishableKey,...(token?{"x-hq-session":token}:{})},body:JSON.stringify({action,...data})});const out=await res.json().catch(()=>({error:"Invalid server response."}));if(!res.ok)throw new Error(out.error||"Request failed.");return out}
function showBlocked(){$("logs-content").classList.add("hidden");$("logs-blocked").classList.remove("hidden");$("access-name").textContent="Guest Access";$("access-rank").textContent="View only";$("role-badge").textContent="HQ access required"}
function formatDate(value){return new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(new Date(value))}
function renderLogs(result){const access=result.access;$("access-name").textContent=access.name;$("access-rank").textContent=`${access.rank_code} · ${access.rank_name}`;$("role-badge").textContent=`${access.role==="owner"?"Owner HQ":"HQ Leadership"} · Protected`;$("logs-list").innerHTML=result.logs.length?result.logs.map(log=>{const detail=log.details||{};const reason=detail.reason||"No reason recorded (legacy entry).";const target=detail.target_name||"Unknown personnel";const change=detail.from_label&&detail.to_label?`${detail.from_label} → ${detail.to_label}`:"Rank changed";return `<article class="log-entry"><div class="log-main"><div class="log-title"><strong>${esc(target)}</strong><span class="log-change">${esc(change)}</span></div><p class="log-meta">Changed by ${esc(log.actor_name)} · ${esc(formatDate(log.created_at))}</p><p class="log-reason">${esc(reason)}</p></div>${access.role==="owner"?`<button class="delete-log" data-delete="${log.id}" type="button">Delete log</button>`:""}</article>`}).join(""):`<div class="empty">No rank changes have been logged yet.</div>`;document.querySelectorAll("[data-delete]").forEach(button=>button.onclick=()=>deleteLog(Number(button.dataset.delete)))}
async function loadLogs(){if(loadingLogs)return;if(!localStorage.getItem(sessionKey)){showBlocked();return}loadingLogs=true;try{renderLogs(await api("logs"))}catch(error){showBlocked();toast(error.message)}finally{loadingLogs=false}}
async function deleteLog(id){if(!confirm("Delete this rank log permanently?"))return;try{await api("delete-log",{id});toast("Log deleted.");await loadLogs()}catch(error){toast(error.message)}}
$("refresh-logs").onclick=loadLogs;
$("exit-logs").onclick=async()=>{try{if(localStorage.getItem(sessionKey))await api("logout")}catch{}localStorage.removeItem(sessionKey);location.href="index.html"};
loadLogs();
setInterval(()=>{if(!document.hidden)loadLogs()},3000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)loadLogs()});window.addEventListener("focus",loadLogs);
