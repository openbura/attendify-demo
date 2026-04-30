#!/usr/bin/env python3
import json

# Translation keys
L = {}
L['en'] = {
    'brd':'Attendify','sub':'Worker Attendance','adm':'Management Panel',
    'pw':'Password','si':'Sign In','wb':'Wrong password','ou':'Exit',
    'ci':'CHECK IN','co':'CHECK OUT','cI':'Checked In','cO':'Checked Out',
    'si_':'Site','lo':'Attendance Log','ts':'Timesheet',
    'wk':'Workers','on':'On Site','as':'Active Sites','al':'All Sites',
    'li':'Live Now','es':'Employee Summary','th':'Total Hours',
    'av':'Avg/Day','lx':'Last Out','ao':'Everyone checked out',
    'nr':'No records yet','nm':'Name','st':'Status',
    'da':'Day','dt':'Date','in':'In','ot':'Out','hr':'Hours',
    'ma':'Mark Absent','mr':'Select reason',
    'sk':'Sick Leave','wc':'Work Accident','ns':'No Show',
    'ed':'Edit','sv':'Save','ca':'Cancel','eh':'Edit Hours',
    'wl':'Worker Login','an':'Admin Login',
    'sn':'Select your name','swk':'Choose your name then enter password',
    'sa':'Enter admin password to continue','wp':'Ac1234'
}
L['he'] = {
    'brd':'Attendify','sub':'נוכחות עובדים','adm':'ניהול',
    'pw':'סיסמה','si':'כניסה','wb':'סיסמה שגויה','ou':'יציאה',
    'ci':'כניסה','co':'יציאה','cI':'נכנס','cO':'יצא',
    'si_':'אתר','lo':'יומן נוכחות','ts':'דוח שעות',
    'wk':'עובדים','on':'באתר','as':'אתרים פעילים','al':'הכל',
    'li':'לייב עכשיו','es':'סיכום עובדים','th':'סהכ שעות',
    'av':'ממוצע/יום','lx':'יציאה אחרונה','ao':'כולם יצאו',
    'nr':'אין רשומות','nm':'שם','st':'סטטוס',
    'da':'יום','dt':'תאריך','in':'כניסה','ot':'יציאה','hr':'שעות',
    'ma':'סמן אי-הגעה','mr':'בחר סיבה',
    'sk':'מחלה','wc':'תאונת עבודה','ns':'לא הגיע',
    'ed':'עריכה','sv':'שמירה','ca':'ביטול','eh':'ערוך שעות',
    'wl':'כניסת עובד','an':'כניסת מנהל',
    'sn':'בחר את שמך','swk':'בחר את שמך ואז הכנס סיסמה',
    'sa':'הזן סיסמת מנהל','wp':'Ac1234'
}
L['zh'] = {
    'brd':'Attendify','sub':'工人出勤','adm':'管理面板',
    'pw':'密码','si':'登录','wb':'密码错误','ou':'退出',
    'ci':'签到','co':'签退','cI':'已签到','cO':'已签退',
    'si_':'工地','lo':'出勤记录','ts':'工时表',
    'wk':'工人','on':'在场','as':'活跃工地','al':'全部',
    'li':'实时','es':'员工汇总','th':'总工时',
    'av':'日均','lx':'最后签退','ao':'全部已签退',
    'nr':'暂无记录','nm':'姓名','st':'状态',
    'da':'星期','dt':'日期','in':'签到','ot':'签退','hr':'工时',
    'ma':'缺勤','mr':'选择原因',
    'sk':'病假','wc':'工伤','ns':'未到岗',
    'ed':'编辑','sv':'保存','ca':'取消','eh':'编辑工时',
    'wl':'工人登录','an':'管理员登录',
    'sn':'选择名字','swk':'选名字后输入密码',
    'sa':'输入管理员密码','wp':'Ac1234'
}
L['th'] = {
    'brd':'Attendify','sub':'การลงเวลา','adm':'จัดการ',
    'pw':'รหัสผ่าน','si':'เข้าสู่ระบบ','wb':'รหัสผ่านผิด','ou':'ออก',
    'ci':'เข้างาน','co':'ออกงาน','cI':'เข้าแล้ว','cO':'ออกแล้ว',
    'si_':'ไซต์','lo':'บันทึก','ts':'ตารางเวลา',
    'wk':'พนักงาน','on':'ในไซต์','as':'ไซต์เปิด','al':'ทั้งหมด',
    'li':'ออนไลน์','es':'สรุป',
    'th':'ชั่วโมงรวม','av':'เฉลี่ย/วัน','lx':'ออกล่าสุด',
    'ao':'ออกหมดแล้ว','nr':'ไม่มีบันทึก',
    'nm':'ชื่อ','st':'สถานะ',
    'da':'วัน','dt':'วันที่','in':'เข้า','ot':'ออก','hr':'ชั่วโมง',
    'ma':'ขาดงาน','mr':'เลือกเหตุผล',
    'sk':'ลาป่วย','wc':'อุบัติเหตุ','ns':'ไม่มา',
    'ed':'แก้ไข','sv':'บันทึก','ca':'ยกเลิก','eh':'แก้ชั่วโมง',
    'wl':'พนักงาน','an':'ผู้ดูแล',
    'sn':'เลือกชื่อ','swk':'เลือกชื่อแล้วใส่รหัส',
    'sa':'ใส่รหัสผู้ดูแล','wp':'Ac1234'
}
L['hi'] = {
    'brd':'Attendify','sub':'कर्मचारी उपस्थिति','adm':'प्रशासन',
    'pw':'पासवर्ड','si':'लॉगिन','wb':'गलत पासवर्ड','ou':'लॉगआउट',
    'ci':'चेक इन','co':'चेक आउट','cI':'इन हुआ','cO':'आउट हुआ',
    'si_':'साइट','lo':'उपस्थिति','ts':'टाइमशीट',
    'wk':'कर्मचारी','on':'साइट पर','as':'सक्रिय साइट','al':'सभी',
    'li':'लाइव','es':'सारांश',
    'th':'कुल घंटे','av':'औसत/दिन','lx':'अंतिम आउट',
    'ao':'सभी बाहर','nr':'कोई रिकॉर्ड नहीं',
    'nm':'नाम','st':'स्थिति',
    'da':'दिन','dt':'तारीख','in':'इन','ot':'आउट','hr':'घंटे',
    'ma':'अनुपस्थित','mr':'कारण चुनें',
    'sk':'बीमारी','wc':'दुर्घटना','ns':'नहीं आया',
    'ed':'संपादन','sv':'सहेजें','ca':'रद्द','eh':'घंटे संपादन',
    'wl':'कर्मचारी','an':'प्रशासक',
    'sn':'अपना नाम','swk':'नाम चुनें फिर पासवर्ड',
    'sa':'प्रशासक पासवर्ड डालें','wp':'Ac1234'
}
L['ru'] = {
    'brd':'Attendify','sub':'Учёт рабочих','adm':'Управление',
    'pw':'Пароль','si':'Войти','wb':'Неверный пароль','ou':'Выйти',
    'ci':'Войти','co':'Выйти','cI':'На объекте','cO':'Вышел',
    'si_':'Объект','lo':'Журнал','ts':'Табель',
    'wk':'Рабочие','on':'На объекте','as':'Активные','al':'Все',
    'li':'Сейчас','es':'Сводка',
    'th':'Всего часов','av':'Средн/день','lx':'Последний выход',
    'ao':'Все вышли','nr':'Нет записей',
    'nm':'Имя','st':'Статус',
    'da':'День','dt':'Дата','in':'Вход','ot':'Выход','hr':'Часы',
    'ma':'Отсутствие','mr':'Выберите причину',
    'sk':'Больничный','wc':'Травма','ns':'Не явился',
    'ed':'Изменить','sv':'Сохранить','ca':'Отмена','eh':'Изменить часы',
    'wl':'Рабочий','an':'Администратор',
    'sn':'Выберите имя','swk':'Выберите имя введите пароль',
    'sa':'Введите пароль админа','wp':'Ac1234'
}

lc = ['en','he','zh','th','hi','ru']
lb = ['EN','עב','中文','ไทย','हिन्दी','Русский']
dN = {
    'en':['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    'he':['א','ב','ג','ד','ה','ו','ש'],
    'zh':['周日','周一','周二','周三','周四','周五','周六'],
    'th':['อา','จ','อ','พ','พฤ','ศ','ส'],
    'hi':['रवि','सोम','मंगल','बुध','गुरु','शुक्र','शनि'],
    'ru':['Вс','Пн','Вт','Ср','Чт','Пт','Сб']
}

SITES = ['דנייה ווסט','פורמה','גולומב 38']
WK = [
    {"id":"w1","nm":"Weiming Zhang","si":0,"ic":"👷"},
    {"id":"w2","nm":"Somchai Patel","si":0,"ic":"👷"},
    {"id":"w3","nm":"Raj Kumar","si":0,"ic":"👷"},
    {"id":"w4","nm":"Li Wei","si":1,"ic":"👷"},
    {"id":"w5","nm":"Prasert Kham","si":1,"ic":"👷"},
    {"id":"w6","nm":"Arun Mehta","si":1,"ic":"👷"},
    {"id":"w7","nm":"Chen Ming","si":2,"ic":"👷"},
    {"id":"w8","nm":"Surin Wong","si":2,"ic":"👷"},
    {"id":"w9","nm":"Vikram Singh","si":2,"ic":"👷"},
    {"id":"w10","nm":"Wang Fei","si":0,"ic":"👷"},
    {"id":"w11","nm":"Nattapong Srisai","si":1,"ic":"👷"},
    {"id":"w12","nm":"Amit Patel","si":2,"ic":"👷"},
    {"id":"w13","nm":"Zhang Hao","si":0,"ic":"👷"},
    {"id":"w14","nm":"Kiat Somchai","si":1,"ic":"👷"},
    {"id":"w15","nm":"Ravi Kumar","si":2,"ic":"👷"},
    {"id":"w16","nm":"Liu Tao","si":0,"ic":"👷"},
    {"id":"w17","nm":"Phong Somsak","si":1,"ic":"👷"},
    {"id":"w18","nm":"Deepak Yadav","si":2,"ic":"👷"},
    {"id":"w19","nm":"Sun Yi","si":0,"ic":"👷"},
    {"id":"w20","nm":"Boonchu Prasit","si":1,"ic":"👷"}
]

parts = []
parts.append(r'''<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<meta name="theme-color" content="#0e7490">
<title>Attendify</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Heebo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--pri:#0e7490;--priL:#22d3ee;--bgD:#0c1222;--txt:#e2e8f0;--txtD:#94a3b8;--txtK:#1e293b;--ok:#22c55e;--err:#ef4444;--wn:#f59e0b;--r:14px;--rs:10px;-fF:Inter,Heebo,sans-serif}
html[dir=rtl] body{font-family:Heebo,Inter,sans-serif}
html[dir=ltr] body{font-family:var(--fF)}
body{min-height:100dvh;background:linear-gradient(135deg,var(--bgD),#0e4166,var(--bgD));color:var(--txt);overflow-x:hidden}
#app{position:relative;z-index:1}.h{display:none!important}
.fi{animation:fu .3s ease}@keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pu{0%,100%{opacity:1}50%{opacity:.5}}
.ls{appearance:none;padding:6px 28px 6px 10px;border-radius:20px;background:rgba(255,255,255,.1);color:#fff;font-size:13px;font-weight:500;border:1px solid rgba(255,255,255,.15);cursor:pointer;outline:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23fff' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center}
.ls option{background:#1e293b;color:#fff}
html[dir=rtl] .ls{background-position:left 8px center;padding:6px 10px 6px 28px}
.gl{background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.09);border-radius:var(--r)}
.gl-w{background:rgba(255,255,255,.96);border-radius:var(--r);color:var(--txtK);box-shadow:0 4px 24px rgba(0,0,0,.06)}
.cd{border-radius:var(--r);padding:16px;transition:transform .12s}.cd:active{transform:scale(.985)}
.id{width:100%;padding:13px 15px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);border-radius:var(--rs);font-size:15px;color:#fff;outline:none;transition:border .2s}
.id:focus{border-color:var(--priL)}.id::placeholder{color:rgba(255,255,255,.35)}
.iS{width:100%;padding:12px 14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);border-radius:var(--rs);font-size:14px;color:#fff;outline:none;appearance:none;cursor:pointer;font-weight:500;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center}
.iS option{background:#1e293b;color:#fff}
html[dir=rtl] .iS{background-position:left 12px center}
.bt{padding:13px 18px;border-radius:var(--rs);font-weight:600;font-size:15px;border:none;cursor:pointer;width:100%;color:#fff;transition:all .15s}
.bt:active{transform:scale(.97)}
.bp{background:linear-gradient(135deg,#0891b2,#06b6d4);box-shadow:0 4px 20px rgba(8,145,178,.3)}
.bN{background:linear-gradient(135deg,#ef4444,#f87171);box-shadow:0 4px 20px rgba(239,68,68,.3)}
.bB{background:linear-gradient(135deg,#3b82f6,#60a5fa);box-shadow:0 4px 20px rgba(59,130,246,.3)}
.bs{padding:7px 12px;font-size:13px;border-radius:8px;width:auto;font-weight:500}
.ba{background:rgba(34,197,94,.13);color:#4ade80}
.be{background:rgba(239,68,68,.13);color:#f87171}
.bg{background:rgba(148,163,184,.12);color:#94a3b8}
.bw{background:rgba(245,158,11,.13);color:#fbbf24}
.bd{font-size:11px;padding:3px 9px;border-radius:999px;font-weight:600;display:inline-block}
.tl{width:100%;border-collapse:collapse}
.tl th{text-align:left;padding:9px 6px;font-size:10px;letter-spacing:.6px;text-transform:uppercase;opacity:.65;border-bottom:1px solid rgba(255,255,255,.08);font-weight:600}
html[dir=rtl] .tl th{text-align:right}
.tl td{padding:10px 6px;font-size:13px;border-bottom:1px solid rgba(255,255,255,.04)}
.tl tr:hover{background:rgba(255,255,255,.03)}
.tw th{color:#64748b;border-bottom-color:#e2e8f0}
.tw td{border-bottom-color:#f1f5f9;color:#334155}
.mx{overflow-x:auto}.mx table{min-width:550px}
.mc{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:14px;margin-bottom:8px}
.mw{background:#f8fafc;border-radius:12px;padding:14px;margin-bottom:8px;border:1px solid #e2e8f0}
.ov{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:200;padding:16px;animation:fu .25s ease}
.st{font-size:14px;font-weight:700;margin-bottom:10px;display:flex;align-items:center;gap:6px}
.tp{padding:6px 14px;border-radius:999px;font-size:13px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:var(--txtD);cursor:pointer;font-weight:500;transition:all .2s}
.tp.ac{background:var(--pri);color:#fff;border-color:var(--pri);box-shadow:0 2px 12px rgba(8,145,178,.35)}
.sc{border-radius:var(--rs);padding:14px;text-align:center;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);transition:all .2s}
.sc:hover{transform:translateY(-2px);background:rgba(255,255,255,.08)}
.ck{font-family:Inter,monospace;font-size:16px;font-weight:700;letter-spacing:1px;color:var(--priL);text-shadow:0 0 12px rgba(34,211,238,.25)}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
@media(max-width:420px){.sc{padding:10px}.sc>div:first-child{font-size:18px}.cd{padding:12px}.g3{gap:6px}}
</style>
</head>
<body>
<div id="app"></div>
<script>
''')

def esc(s):
    return json.dumps(s, ensure_ascii=False)

parts.append('var L=' + json.dumps(L, ensure_ascii=False) + ';\n')
parts.append('var lc=' + json.dumps(lc) + ';\n')  
parts.append('var lb=' + json.dumps(lb, ensure_ascii=False) + ';\n')
parts.append('var dN=' + json.dumps(dN, ensure_ascii=False) + ';\n')
parts.append('var lg="en";\n')
parts.append("function _(k){return (L[lg]&&L[lg][k])?L[lg][k]:(L.en[k]||'');}\n")
parts.append("function sl(v){lg=v;document.documentElement.lang=lg;document.documentElement.dir=(lg==='he')?'rtl':'ltr';R();}\n")

parts.append('var SITES=' + json.dumps(SITES, ensure_ascii=False) + ';\n')
parts.append('var WK=' + json.dumps(WK, ensure_ascii=False) + ';\n')
parts.append("var Apw='1234',SK='af_v2';\n")
parts.append("var S=null;try{var rr=sessionStorage.getItem(SK)||localStorage.getItem(SK);if(rr)S=JSON.parse(rr);}catch(ex){}\n")
parts.append("var tab='live',sf='all',wv='cards',ei=null;\n")
parts.append("var RC=[];try{RC=JSON.parse(localStorage.getItem(SK+'_r')||'[]');}catch(ex){}\n")
parts.append(r"if(!RC.length){var td=new Date().toISOString().split('T')[0];var bh=[6,7,6,7,6,7,6,7,6,7,6,7,6,7,6,7,6,7,6,7];for(var i=0;i<WK.length;i++){var hh=bh[i]<10?'0'+bh[i]:String(bh[i]);RC.push({id:'d'+(i+1),wi:WK[i].id,wn:WK[i].nm,si:WK[i].si,dt:td,ci:td+'T'+hh+':00:00',co:td+'T'+(bh[i]+9)+':00:00',ab:null,rs:null});}svR();}" + "\n")
parts.append("function svR(){localStorage.setItem(SK+'_r',JSON.stringify(RC));}\n")
parts.append("function svS(){try{localStorage.setItem(SK,JSON.stringify(S));sessionStorage.setItem(SK,JSON.stringify(S));}catch(ex){}}\n")
parts.append("function fT(iso){if(!iso)return'\u2014';try{var d=new Date(iso);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}catch(ex){return'\u2014';}}\n")
parts.append("function fD(s){try{var d=new Date(s);return{w:dN[lg]?dN[lg][d.getDay()]:'\u2014',d:d.getDate()+'.'+(d.getMonth()+1)};}catch(ex){return{w:'\u2014',d:s};}}\n")
parts.append("function cH(a,b){if(!a||!b)return'\u2014';try{return((new Date(b)-new Date(a))/36e5).toFixed(1);}catch(ex){return'\u2014';}}\n")
parts.append("function isC(wi){var d=new Date().toISOString().split('T')[0];for(var i=0;i<RC.length;i++){if(RC[i].wi===wi&&RC[i].dt===d&&!RC[i].co)return true;}return false;}\n")
parts.append("function gW(wi){for(var i=0;i<WK.length;i++){if(WK[i].id===wi)return WK[i];}return null;}\n")

# Safe: escape for use inside onclick handlers and string literals
parts.append("function escA(s){return s.replace(/'/g,\"\\\\'\").replace(/\"/g,'&quot;');}\n")
parts.append("function lselH(){"
    +"var h='<select class=\"ls\" onchange=\"sl(this.value)\">';"
    +"for(var i=0;i<lc.length;i++)h+='<option value=\"'+lc[i]+'\"'+(lg===lc[i]?' selected':'')+'>'+lb[i]+'</option>';"
    +"h+='</select>';return h;}\n")
parts.append("function wOptsH(){"
    +"var h='<option value=\"\">'+_('sn')+'</option>';"
    +"for(var i=0;i<WK.length;i++)h+='<option value=\"'+WK[i].id+'\">'+WK[i].nm+'</option>';"
    +"return h;}\n")

# Actions - safe onclick using escaped worker IDs
parts.append("window.doWL=function(){"
    +"var wi=document.getElementById('swi').value,"
    +"pw=document.getElementById('spw').value.trim(),"
    +"e=document.getElementById('ser');e.className='h';"
    +"if(!wi){e.textContent=_('sn');e.className='';return;}"
    +"if(pw!==_('wp')){e.textContent=_('wb');e.className='';return;}"
    +"S={t:'w',wi:wi};svS();R();};\n")
parts.append("window.doAL=function(){"
    +"var pw=document.getElementById('apw').value.trim(),"
    +"e=document.getElementById('aer');e.className='h';"
    +"if(pw!==Apw){e.textContent=_('wb');e.className='';return;}"
    +"S={t:'a'};svS();R();};\n")

# Safe: use function to pass ID as argument
parts.append("window.doCI=function(wi){"
    +"var w=gW(wi);if(!w)return;"
    +"var d=new Date().toISOString().split('T')[0];"
    +"RC=RC.filter(function(r){return!(r.wi===wi&&r.dt===d&&!r.co);});"
    +"RC.push({id:'c'+Date.now(),wi:w.id,wn:w.nm,si:w.si,dt:d,ci:new Date().toISOString(),co:null,ab:null,rs:null});"
    +"svR();R();};\n")
parts.append("window.doCO=function(wi){"
    +"var now=new Date().toISOString();"
    +"for(var i=0;i<RC.length;i++){if(RC[i].wi===wi&&!RC[i].co){RC[i].co=now;break;}}"
    +"svR();R();};\n")
parts.append("window.doLO=function(){S=null;localStorage.removeItem(SK);sessionStorage.removeItem(SK);R();};\n")
parts.append("window.dTa=function(v){tab=v;R();};\n")
parts.append("window.dFi=function(v){sf=v;R();};\n")
parts.append("window.dWV=function(v){wv=v;R();};\n")
parts.append("window.dEd=function(rid){ei=rid;R();};\n")
parts.append("window.dCX=function(){ei=null;R();};\n")
parts.append("window.dSV=function(){"
    +"var c=document.getElementById('ed-ci').value,"
    +"o=document.getElementById('ed-co').value;"
    +"for(var i=0;i<RC.length;i++){if(RC[i].id!==ei)continue;"
    +"if(c){var p=c.split(':');RC[i].ci=RC[i].dt+'T'+p[0]+':'+p[1]+':00';}"
    +"if(o){var p=o.split(':');RC[i].co=RC[i].dt+'T'+p[0]+':'+p[1]+':00';}}"
    +"ei=null;svR();R();};\n")
parts.append("window.dAB=function(){"
    +"var wi=document.getElementById('ab-w').value,"
    +"rs=document.getElementById('ab-r').value;"
    +"if(!wi||!rs)return;"
    +"var d=new Date().toISOString().split('T')[0],f=false;"
    +"for(var i=0;i<RC.length;i++){if(RC[i].wi===wi&&RC[i].dt===d){f=true;RC[i].ab=true;RC[i].rs=rs;break;}}"
    +"if(!f){var w=gW(wi);if(w)RC.push({id:'ab'+Date.now(),wi:w.id,wn:w.nm,si:w.si,dt:d,ci:null,co:null,ab:true,rs:rs});}"
    +"svR();R();};\n")

# Renderer
parts.append("var cI=null;\n")
parts.append("function R(){try{if(cI)clearInterval(cI);cI=null;var a=document.getElementById('app');if(!S||!S.t)rL(a);else if(S.t==='w')rW(a);else rA(a);}catch(ex){}}\n")

# Login
parts.append("function rL(a){"
    +"var h='<div class=\"fi\" style=\"min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;position:relative\">';"
    +"h+='<div style=\"position:absolute;top:16px;right:16px\">'+lselH()+'</div>';"
    +"h+='<div style=\"margin-bottom:32px;text-align:center\">';"
    +"h+='<div style=\"font-size:48px;margin-bottom:6px\">🏗️</div>';"
    +"h+='<div style=\"font-size:32px;font-weight:900;color:#fff;letter-spacing:-.5px\">'+_('brd')+'</div>';"
    +"h+='<div style=\"font-size:13px;color:var(--priL);font-weight:500;margin-top:4px\">'+_('sub')+'</div></div>';"
    +"h+='<div class=\"gl cd\" style=\"width:100%;max-width:380px;padding:24px;margin-bottom:16px\">';"
    +"h+='<div style=\"font-size:15px;font-weight:700;margin-bottom:2px\">'+_('wl')+'</div>';"
    +"h+='<div style=\"font-size:12px;opacity:.5;margin-bottom:12px\">'+_('swk')+'</div>';"
    +"h+='<label style=\"font-size:11px;opacity:.5;display:block;margin-bottom:4px\">'+_('sn')+'</label>';"
    +"h+='<select id=\"swi\" class=\"iS\" style=\"margin-bottom:10px\">'+wOptsH()+'</select>';"
    +"h+='<label style=\"font-size:11px;opacity:.5;display:block;margin-bottom:4px\">'+_('pw')+'</label>';"
    +"h+='<input id=\"spw\" type=\"password\" class=\"id\" placeholder=\"'+_('wp')+'\">';"
    +"h+='<div id=\"ser\" class=\"h\" style=\"color:#f87171;font-size:13px;background:rgba(239,68,68,.1);padding:8px 12px;border-radius:8px;text-align:center;margin-top:10px\"></div>';"
    +"h+='<button onclick=\"doWL()\" class=\"bt bB\" style=\"margin-top:14px\">'+_('si')+'</button></div>';"
    +"h+='<div style=\"display:flex;align-items:center;gap:14px;margin:8px 0 14px;width:100%;max-width:380px\">';"
    +"h+='<div style=\"flex:1;height:1px;background:rgba(255,255,255,.08)\"></div>';"
    +"h+='<span style=\"font-size:11px;opacity:.35;font-weight:600;text-transform:uppercase;letter-spacing:1px\">'+_('an')+'</span>';"
    +"h+='<div style=\"flex:1;height:1px;background:rgba(255,255,255,.08)\"></div></div>';"
    +"h+='<div class=\"gl cd\" style=\"width:100%;max-width:380px;padding:20px\">';"
    +"h+='<div style=\"font-size:13px;font-weight:600;margin-bottom:8px\">🔐 '+_('sa')+'</div>';"
    +"h+='<input id=\"apw\" type=\"password\" class=\"id\" placeholder=\"'+_('pw')+'\" style=\"margin-bottom:10px\">';"
    +"h+='<div id=\"aer\" class=\"h\" style=\"color:#f87171;font-size:13px;background:rgba(239,68,68,.1);padding:8px 12px;border-radius:8px;text-align:center;margin-bottom:8px\"></div>';"
    +"h+='<button onclick=\"doAL()\" class=\"bt\" style=\"background:rgba(255,255,255,.08);font-size:14px;font-weight:500;border:1px solid rgba(255,255,255,.12)\">'+_('si')+'</button></div></div>';"
    +"a.innerHTML=h;"
    +"document.getElementById('spw').onkeydown=function(e){if(e.key==='Enter')doWL();};"
    +"document.getElementById('apw').onkeydown=function(e){if(e.key==='Enter')doAL();};}")

# Worker dashboard
parts.append("function rW(a){"
    +"var w=gW(S.wi);if(!w){doLO();return;}"
    +"var ci=isC(w.id),hi=[];"
    +"for(var i=0;i<RC.length;i++)if(RC[i].wi===w.id)hi.push(RC[i]);"
    +"hi.sort(function(x,y){return y.dt.localeCompare(x.dt);});"
    +"var h='<div class=\"fi\">';"
    +"h+='<header style=\"background:linear-gradient(135deg,#0e7490,#155e75);padding:14px 18px\">';"
    +"h+='<div style=\"display:flex;align-items:center;justify-content:space-between\">';"
    +"h+='<div style=\"display:flex;align-items:center;gap:10px\">';"
    +"h+='<div style=\"width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:20px\">'+w.ic+'</div>';"
    +"h+='<div><div style=\"font-size:15px;font-weight:700\">'+w.nm+'</div><div style=\"font-size:11px;opacity:.7\">'+SITES[w.si]+'</div></div></div>';"
    +"h+='<div style=\"display:flex;align-items:center;gap:8px\"><div class=\"ck\" id=\"sck\">'+new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})+'</div>';"
    +"h+=lselH()+'<button onclick=\"doLO()\" class=\"bt bs\" style=\"background:rgba(255,255,255,.15)\">'+_('ou')+'</button></div></div></header>';"
    #"h+='<body>'
    +"h+='<div style=\"padding:16px;max-width:540px;margin:0 auto\">';"
    +"h+='<div class=\"cd\" style=\"background:rgba(255,255,255,.07);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.1);text-align:center;margin-bottom:16px\">';"
    +"h+='<div style=\"font-size:12px;opacity:.45;margin-bottom:3px\">'+_('si_')+'</div>';"
    +"h+='<div style=\"font-size:20px;font-weight:800;color:#67e8f9;margin-bottom:18px\">'+SITES[w.si]+'</div>';"
    
    # Check in/out - pass string ID safely
    if True:
        wid_esc = json.dumps(w['id'])
        parts.append("h+=\"if(ci){"
            +"h+='<button onclick=\"doCO("
            +esc(wid_esc)
            +")\" class=\"bt bN\" style=\"font-size:18px;padding:16px;font-weight:800\">'+_('co')+'</button>';"
            +"h+='<div style=\"margin-top:10px\"><span class=\"bd ba\" style=\"animation:pu 2s infinite\">● '+_('cI')+'</span></div>';"
            "}"
            "else{"
            +"h+='<button onclick=\"doCI("+esc(wid_esc)+")\" class=\"bt bp\" style=\"font-size:18px;padding:16px;font-weight:800\">'+_('ci')+'</button>';"
            "}";")
    else:
        pass
    
    #"h+='</div>';"
    #"h+='<div class=\"st\" style=\"color:#fff\">📋 '+_('lo')+'</div>';"
    #"h+='<div style=\"display:flex;gap:6px;margin-bottom:10px\">';"
    # ... etc
    pass

# This is getting complex with the escaping. Let me just write it all directly via write tool.

fpath = '/home/eyal/.openclaw/workspace/projects/attendify-standalone/index'
