const ACCESS_PASSWORD = "bewcdfz202405";
const ADMIN_PASSWORD = "lb666";
const targetDate = new Date("2026-07-01");
const TERM_START = new Date("2024-09-01");

let noticeList = JSON.parse(localStorage.getItem("clsNotice")) || [];
let lessonData = JSON.parse(localStorage.getItem("clsLesson")) || {
    time:"07:20 早读\n08:00 上课\n12:00 午饭\n14:00 下午课\n17:30 放学",
    schedule:"周一：语文 数学 英语"
};
let classConfig = JSON.parse(localStorage.getItem("clsConfig")) || {
    name:"北二外成都附中 · 高二五班",
    logo:"https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/7974dd1295534e3e8385fbd49f297d58.webp"
};
let topNotice = localStorage.getItem("clsTopNotice")||"";
let homeworkList = JSON.parse(localStorage.getItem("clsHomework"))||[];
let broadcastList = JSON.parse(localStorage.getItem("broadcastList"))||[];
let receiptList = JSON.parse(localStorage.getItem("receiptList"))||[];

document.getElementById("className").innerText = classConfig.name;
document.getElementById("logoImg").src = classConfig.logo;

function toggleTheme(){
    document.body.classList.toggle("light-theme");
    localStorage.setItem("theme",document.body.className);
}
if(localStorage.getItem("theme")) document.body.className = localStorage.getItem("theme");

function getWeekInfo(){
    let now=new Date();
    let d=Math.floor((now-TERM_START)/(1000*60*60*24));
    document.getElementById("weekInfo").innerText=`本周：第${Math.floor(d/7)+1}周`;
}

async function getWeather(){
    try{
        let r=await fetch("https://wttr.in/?format=1");
        document.getElementById("weatherInfo").innerText=await r.text();
    }catch(e){}
}

function updateSchoolTimer(){
    let h=new Date().getHours(), m=new Date().getMinutes();
    let t="正常上课";
    if(h<7||(h==7&&m<20))t="早读准备";
    else if(h<12)t="上午课程";
    else if(h<14)t="午休";
    else if(h<17)t="下午课程";
    else t="放学/晚自习";
    document.getElementById("schoolTimer").innerText=t;
}

function checkAccess(){
    let v=document.getElementById("accessPwd").value;
    if(v==ACCESS_PASSWORD){
        document.getElementById("accessLock").style.display="none";
        document.getElementById("mainWrap").style.display="block";
        renderAll();
        checkBroadcast();
    }else alert("密码错误");
}

function renderAll(){
    getWeekInfo(); getWeather(); updateSchoolTimer();
    renderNotice(); renderTopNotice(); renderHomework();
}

function sendBroadcast(){
    let target=document.getElementById("broadTarget").value;
    let level=document.getElementById("broadLevel").value;
    let txt=document.getElementById("broadText").value;
    if(!txt)return alert("内容不能为空");

    let obj={
        time:new Date().toLocaleString(),
        target:target, level:level, content:txt,
        file:""
    };
    broadcastList.push(obj);
    localStorage.setItem("broadcastList",JSON.stringify(broadcastList));
    alert("广播已发送");
}

function checkBroadcast(){
    let b=broadcastList[broadcastList.length-1];
    if(!b)return;
    if(b.level=="urgent"){
        showBroadcast(b);
    }
}

function showBroadcast(b){
    document.getElementById("broadTitle").innerText = b.level=="urgent"?"⚠️紧急广播":"📢常规广播";
    document.getElementById("broadContent").innerText = b.content;
    document.getElementById("broadcastModal").style.display="flex";
}

function confirmBroadcast(){
    let user=prompt("请输入你的名字确认已读：");
    if(!user)return;
    receiptList.push({
        time:new Date().toLocaleString(),
        user:user,
        broadcast:broadcastList[broadcastList.length-1]?.content||""
    });
    localStorage.setItem("receiptList",JSON.stringify(receiptList));
    document.getElementById("broadcastModal").style.display="none";
    alert("确认成功！");
}

function renderNotice(){
    let last=document.getElementById("latestNotice");
    let hist=document.getElementById("historyList");
    if(noticeList.length==0){last.innerHTML="<p>无</p>";hist.innerHTML="<p>无</p>";return;}
    let latest=noticeList[noticeList.length-1];
    last.innerHTML=`[${latest.time}]<br>${latest.content}${latest.img?"<br><img src='"+latest.img+"'>":""}`;
}

function renderTopNotice(){
    if(topNotice){
        document.getElementById("topNoticeWrap").style.display="block";
        document.getElementById("topNotice").innerText=topNotice;
    }
}

function renderHomework(){
    let h=document.getElementById("homeworkList");
    if(homeworkList.length==0){h.innerHTML="<p>无作业</p>";return;}
    h.innerHTML=homeworkList.map(i=>`<div>${i.time}<br>${i.content}</div>`).join("");
}

function adminLogin(){
    if(document.getElementById("adminPwd").value==ADMIN_PASSWORD){
        document.getElementById("loginBox").style.display="none";
        document.getElementById("adminPanel").style.display="block";
    }else alert("密码错误");
}

setInterval(updateSchoolTimer,60000);
