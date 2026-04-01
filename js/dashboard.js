const API = 'http://localhost:5167/api/v1';

const UNITS = {
  LengthUnit:      ['FEET','INCH','YARD','METER','CM'],
  WeightUnit:      ['KILOGRAM','GRAM','POUND','OUNCE'],
  VolumeUnit:      ['LITRE','MILLILITRE','GALLON'],
  TemperatureUnit: ['CELSIUS','FAHRENHEIT','KELVIN']
};

const QUICK_REF = {
  LengthUnit:      [{ from:'1 FEET', to:'30.48 CM' },{ from:'1 INCH', to:'2.54 CM' },{ from:'1 METER', to:'3.281 FEET' },{ from:'1 YARD', to:'3 FEET' }],
  WeightUnit:      [{ from:'1 KILOGRAM', to:'1000 GRAM' },{ from:'1 POUND', to:'453.59 GRAM' },{ from:'1 OUNCE', to:'28.35 GRAM' },{ from:'1 KG', to:'2.205 POUND' }],
  TemperatureUnit: [{ from:'0°C', to:'32°F' },{ from:'100°C', to:'212°F' },{ from:'0°C', to:'273.15 K' },{ from:'37°C', to:'98.6°F (Body)' }],
  VolumeUnit:      [{ from:'1 LITRE', to:'1000 MILLILITRE' },{ from:'1 GALLON', to:'3.785 LITRE' },{ from:'1 LITRE', to:'0.264 GALLON' },{ from:'1 MILLILITRE', to:'0.001 LITRE' }]
};

const TYPE_LABELS = { LengthUnit:'Length', WeightUnit:'Weight', TemperatureUnit:'Temperature', VolumeUnit:'Volume' };

// Global state — use var so onclick= attributes always find them
var currentType       = 'LengthUnit';
var currentAction     = 'add';
var currentArith      = 'add';
var selectedUnit1     = 'FEET';
var selectedUnit2     = 'INCH';
var historyFilter     = '';
var allHistoryRecords = [];

function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('accessToken') };
}

// ── On Load ────────────────────────────────────────────────
window.onload = function() {
  if (!localStorage.getItem('accessToken')) { window.location.href = 'index.html'; return; }
  var uname = document.getElementById('usernameDisplay');
  if (uname) uname.textContent = '👤 ' + (localStorage.getItem('username') || '');
  buildUnitPills();
  renderQuickRef();
  loadHistory();
};

function toggleTheme() {
  document.body.classList.toggle('light-theme');
  var btn = document.querySelector('.theme-toggle');
  if (btn) btn.textContent = document.body.classList.contains('light-theme') ? '☀️' : '🌙';
}

function handleLogout() {
  fetch(API + '/auth/logout', { method:'POST', headers:authHeaders(), body:JSON.stringify({ accessToken:localStorage.getItem('accessToken'), refreshToken:localStorage.getItem('refreshToken') }) }).catch(function(){});
  localStorage.clear();
  window.location.href = 'index.html';
}

// ── Unit pills ─────────────────────────────────────────────
function buildUnitPills() {
  var units = UNITS[currentType];
  if (!units) return;
  selectedUnit1 = units[0];
  selectedUnit2 = units[1] || units[0];
  renderPills('unitPills1', units, selectedUnit1, 1);
  renderPills('unitPills2', units, selectedUnit2, 2);
}

function renderPills(id, units, selected, slot) {
  var c = document.getElementById(id);
  if (!c) return;
  c.innerHTML = units.map(function(u) {
    return '<button class="unit-pill' + (u===selected?' active':'') + '" onclick="selectUnit(' + slot + ',\'' + u + '\',this)">' + u + '</button>';
  }).join('');
}

function selectUnit(slot, unit, el) {
  if (slot===1) selectedUnit1=unit; else selectedUnit2=unit;
  el.parentElement.querySelectorAll('.unit-pill').forEach(function(p){p.classList.remove('active');});
  el.classList.add('active');
  livePreview();
}

// ── Select type ─────────────────────────────────────────────
function selectType(type, el) {
  currentType = type;
  document.querySelectorAll('.type-pill').forEach(function(p){p.classList.remove('active');});
  el.classList.add('active');
  buildUnitPills();
  renderQuickRef();
  clearResult();
  livePreview();
}

// ── Select action ───────────────────────────────────────────
function selectAction(action, el) {
  document.querySelectorAll('.action-pill').forEach(function(p){p.classList.remove('active');});
  el.classList.add('active');
  var sub = document.getElementById('subPills');
  var op  = document.getElementById('operatorSymbol');
  if (action==='compare') {
    currentAction='compare'; if(op) op.textContent='=?'; if(sub) sub.classList.remove('show');
  } else if (action==='convert') {
    currentAction='convert'; if(op) op.textContent='→'; if(sub) sub.classList.remove('show');
  } else {
    currentAction=currentArith; if(op) op.textContent=getSymbol(currentArith); if(sub) sub.classList.add('show');
  }
  clearResult(); livePreview();
}

function selectArith(op, el) {
  currentArith=op; currentAction=op;
  document.querySelectorAll('.sub-pill').forEach(function(p){p.classList.remove('active');});
  el.classList.add('active');
  var badge=document.getElementById('operatorSymbol'); if(badge) badge.textContent=getSymbol(op);
  clearResult(); livePreview();
}

function getSymbol(op) { return {add:'+',subtract:'−',divide:'÷'}[op]||'+'; }

// ── Live preview ────────────────────────────────────────────
function livePreview() {
  var v1=(document.getElementById('value1')||{}).value||'?';
  var v2=(document.getElementById('value2')||{}).value||'?';
  var el=document.getElementById('livePreview');
  var sym=(document.getElementById('operatorSymbol')||{}).textContent||'+';
  if (!el) return;
  if (currentAction==='convert')       el.textContent=v1+' '+selectedUnit1+' → ? '+selectedUnit2;
  else if (currentAction==='compare')  el.textContent='Is '+v1+' '+selectedUnit1+' = '+v2+' '+selectedUnit2+'?';
  else                                 el.textContent=v1+' '+selectedUnit1+' '+sym+' '+v2+' '+selectedUnit2+' = ?';
}

// ── Calculate ───────────────────────────────────────────────
async function calculate() {
  var v1=parseFloat(document.getElementById('value1').value);
  var v2=parseFloat(document.getElementById('value2').value);
  if (isNaN(v1)||isNaN(v2)) { showError('Please enter valid numbers!'); return; }

  var bt=document.getElementById('calcBtnText'), sp=document.getElementById('btnSpinner');
  if(bt) bt.textContent='Calculating…'; if(sp) sp.style.display='block';

  try {
    var res=await fetch(API+'/quantities/'+currentAction, {
      method:'POST', headers:authHeaders(),
      body:JSON.stringify({
        thisQuantityDTO:{value:v1,unit:selectedUnit1,measurementType:currentType},
        thatQuantityDTO:{value:v2,unit:selectedUnit2,measurementType:currentType}
      })
    });
    if(bt) bt.textContent='Calculate ▶'; if(sp) sp.style.display='none';
    if (res.status===401) { alert('Session expired.'); localStorage.clear(); window.location.href='index.html'; return; }
    var data=await res.json();
    if (!res.ok||data.isError) { showError(data.errorMessage||data.title||'Calculation failed'); return; }
    showResult(data);
    showToast('✅ Calculated!');
    setTimeout(loadHistory, 600);
  } catch(e) {
    if(bt) bt.textContent='Calculate ▶'; if(sp) sp.style.display='none';
    showError('Cannot connect to server. Is backend running on port 5167?');
  }
}

function showResult(data) {
  document.getElementById('errorBox').style.display='none';
  var box=document.getElementById('resultBox'); box.style.display='block';
  var val='';
  if (currentAction==='compare') val=(data.resultValue===1||data.resultValue===1.0)?'✅ Equal':'❌ Not Equal';
  else val=data.resultValue!==undefined ? Number(data.resultValue.toFixed(6)).toString() : '—';
  document.getElementById('resultValue').textContent=val;
  document.getElementById('resultString').textContent=data.resultString||((data.resultUnit||'')+' '+(data.resultMeasurementType||''));
}

function showError(msg) {
  document.getElementById('resultBox').style.display='none';
  var b=document.getElementById('errorBox'); b.style.display='block'; b.textContent='⚠️ '+msg;
}

function clearResult() {
  document.getElementById('resultBox').style.display='none';
  document.getElementById('errorBox').style.display='none';
}

function copyResult() {
  var val=document.getElementById('resultValue').textContent;
  var str=document.getElementById('resultString').textContent;
  navigator.clipboard.writeText(val+' '+str).then(function(){showToast('📋 Copied!');});
}

function renderQuickRef() {
  var qrt=document.getElementById('quickRefType'), rg=document.getElementById('refGrid');
  if(qrt) qrt.textContent=TYPE_LABELS[currentType]||currentType;
  if(!rg) return;
  rg.innerHTML=(QUICK_REF[currentType]||[]).map(function(r){
    return '<div class="ref-item"><div class="ref-from">'+r.from+'</div><div class="ref-to">= '+r.to+'</div></div>';
  }).join('');
}

function showToast(msg) {
  var t=document.getElementById('toast'); if(!t) return;
  t.textContent=msg; t.classList.add('show');
  setTimeout(function(){t.classList.remove('show');},2200);
}

function clearHistoryView() {
  var l=document.getElementById('historyList'), b=document.getElementById('historyCountBadge');
  if(l) l.innerHTML='<div class="no-history"><div class="no-history-icon">🕐</div>View cleared.</div>';
  if(b) b.textContent='0 records';
}

// ── Load History ────────────────────────────────────────────
async function loadHistory() {
  try {
    var types=['LengthUnit','WeightUnit','VolumeUnit','TemperatureUnit'];
    var results=await Promise.all(types.map(function(t){
      return fetch(API+'/quantities/history/type/'+t,{headers:authHeaders()})
        .then(function(r){return r.ok?r.json():[];}).catch(function(){return [];});
    }));
    allHistoryRecords=[];
    results.forEach(function(r){if(Array.isArray(r)) allHistoryRecords.push.apply(allHistoryRecords,r);});
    updateStats(allHistoryRecords);
    applyHistoryFilter();
  } catch(e) {
    var l=document.getElementById('historyList');
    if(l) l.innerHTML='<div class="no-history">Failed to load history</div>';
  }
}

function filterHistory(type, el) {
  historyFilter=type;
  document.querySelectorAll('.filter-pill').forEach(function(p){p.classList.remove('active');});
  el.classList.add('active');
  applyHistoryFilter();
}

function applyHistoryFilter() {
  var records=allHistoryRecords.slice();
  if (historyFilter) records=records.filter(function(r){return (r.thisMeasurementType||r.measurementType||'')===historyFilter;});
  records.reverse();
  var badge=document.getElementById('historyCountBadge');
  if(badge) badge.textContent=records.length+' record'+(records.length!==1?'s':'');
  renderSidebarHistory(records);
}

function renderSidebarHistory(records) {
  var list=document.getElementById('historyList'); if(!list) return;
  if (!records.length) {
    list.innerHTML='<div class="no-history"><div class="no-history-icon">🔍</div>No records'+(historyFilter?' for '+TYPE_LABELS[historyFilter]:'')+' yet.</div>';
    return;
  }
  list.innerHTML=records.map(function(r){
    var badge=TYPE_LABELS[r.thisMeasurementType]||r.thisMeasurementType||'';
    var res=r.isError?'⚠ Error':(r.resultString||r.resultValue||'—');
    return '<div class="history-item">'+
      '<div class="hi-header"><span class="hi-op">'+(r.operation||'—')+'</span><span class="hi-type-badge">'+badge+'</span></div>'+
      '<div class="hi-vals">'+r.thisValue+' '+r.thisUnit+' · '+r.thatValue+' '+r.thatUnit+'</div>'+
      '<div class="hi-result '+(r.isError?'hi-err':'')+'">'+res+'</div>'+
    '</div>';
  }).join('');
}

// ── Stats ───────────────────────────────────────────────────
function updateStats(records) {
  var te=document.getElementById('statTotal'), se=document.getElementById('statSuccess');
  var tye=document.getElementById('statFavType'), oe=document.getElementById('statFavOp');
  if(te) te.textContent=records.length;
  if(se) se.textContent=records.filter(function(r){return !r.isError;}).length;

  var tc={};
  records.forEach(function(r){var t=TYPE_LABELS[r.thisMeasurementType]||r.thisMeasurementType; if(t) tc[t]=(tc[t]||0)+1;});
  var topT=Object.entries(tc).sort(function(a,b){return b[1]-a[1];})[0];
  if(tye) tye.textContent=topT?topT[0]:'—';

  var oc={};
  records.forEach(function(r){if(r.operation) oc[r.operation]=(oc[r.operation]||0)+1;});
  var topO=Object.entries(oc).sort(function(a,b){return b[1]-a[1];})[0];
  if(oe) oe.textContent=topO?topO[0]:'—';

  updateSidebarFooter(records);
}

function updateSidebarFooter(records) {
  var total  =records.length;
  var success=records.filter(function(r){return !r.isError;}).length;
  var lenCnt =records.filter(function(r){return (r.thisMeasurementType||'')==='LengthUnit';}).length;
  var wgtCnt =records.filter(function(r){return (r.thisMeasurementType||'')==='WeightUnit';}).length;

  var e=function(id){return document.getElementById(id);};
  if(e('sfTotal'))   e('sfTotal').textContent=total;
  if(e('sfSuccess')) e('sfSuccess').textContent=success;
  if(e('sfLength'))  e('sfLength').textContent=lenCnt;
  if(e('sfWeight'))  e('sfWeight').textContent=wgtCnt;

  var name=localStorage.getItem('username')||'U';
  if(e('sidebarAvatar')) e('sidebarAvatar').textContent=name.charAt(0).toUpperCase();
  if(e('sidebarName'))   e('sidebarName').textContent=name;
}