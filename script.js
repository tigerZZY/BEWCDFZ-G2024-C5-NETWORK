// ================= 自定义配置区（自行修改）=================
const ACCESS_PASSWORD = "bewcdfz2024";
const ADMIN_PASSWORD  = "lb666";
const targetDate = new Date("2027-06-07");
const TERM_START = new Date("2026-03-01"); // 开学第一天（计算周次）
// ============================================================

// 全局数据存储
let noticeList = JSON.parse(localStorage.getItem("clsNotice")) || [];
let lessonData = JSON.parse(localStorage.getItem("clsLesson")) || {
    time: "07:30 早读\n08:00 第一节课\n12:20 午饭\n14:00 下午课\n18:20 放学\n19:00 晚自习",
    schedule: "周一：语文/数学/英语\n周二：物理/化学/生物\n周三：历史/地理/政治"
};
let alertContent = localStorage.getItem("clsAlert") || "";
let classConfig = JSON.parse(localStorage.getItem("clsConfig")) || {
    name:"高二五班 · 班级通知系统",logo:"logo.png"
};
let topNotice = localStorage.getItem("clsTopNotice") || "";
let homeworkList = JSON.parse(localStorage.getItem("clsHomework")) || [];
let examDate = localStorage.getItem("clsExamDate") || "2026-06-10";
let birthdayData = localStorage.getItem("clsBirthday") || "";

// 离线缓存 - 断网可用
window.addEventListener('load', ()=>{
    document.documentElement.dataset.offline = "true";
    renderAll();
    checkBirthdayToday();
});

// 初始化基础信息
document.getElementById("className").innerText = classConfig.name;
document.getElementById("logoImg").src = classConfig.logo;

// 主题切换+记忆
function toggleTheme(){
    document.body.classList.toggle("light-theme");
    localStorage.setItem("theme",document.body.className);
}
if(localStorage.getItem("theme")){
    document.body.className = localStorage.getItem("theme");
}

// 周次计算
function getWeekInfo(){
    let now = new Date();
    let diffDay = Math.floor((now - TERM_START) / (1000*60*60*24));
    let week = Math.floor(diffDay / 7) + 1;
    document.getElementById("weekInfo").innerText = `本周：第${week}周`;
}

// 实时天气（免费公开接口）
async function getWeather(){
    try{
        let res = await fetch("https://wttr.in/?format=1");
        let text = await res.text();
        document.getElementById("weatherInfo").innerText = text;
    }catch{e=>document.getElementById("weatherInfo").innerText="天气获取失败";}
}
getWeather();

// 校园时段倒计时
function updateSchoolTimer(){
    let now = new Date();
    let h = now.getHours(),m=now.getMinutes();
    let tips = "";
    if(h<7||(h===7&&m<20)) tips = "📚 距离早读开始："+countDownStr(7,20);
    else if(h<12) tips = "🏫 上午上课中";
    else if(h<14) tips = "🍚 午休时间";
    else if(h<17||(h===17&&m<30)) tips = "📖 下午上课中";
    else if(h<18||(h===18&&m<30)) tips = "🌆 放学休息";
    else tips = "🌙 晚自习进行中";
    document.getElementById("schoolTimer").innerText = tips;
}
function countDownStr(targetH,targetM){
    let now = new Date();
    let tar = new Date();
    tar.setHours(targetH,targetM,0);
    let diff = Math.floor((tar - now)/60000);
    if(diff<0) return "已结束";
    return diff+" 分钟";
}

// 考试倒计时
function updateExamCount(){
    let exam = new Date(examDate);
    let now = new Date();
    let day = Math.ceil((exam - now)/(1000*60*60*24));
    document.getElementById("examCountdown").innerText = `距离大型考试：${day} 天`;
}

// 节假日简易提醒
function holidayTip(){
    let m = new Date().getMonth()+1;
    let tip = "正常上学，认真学习";
    if(m===5) tip = "五一劳动节假期临近";
    if(m===10) tip = "国庆节假日提醒";
    document.getElementById("holidayTip").innerText = tip;
}

// 访问密码
function checkAccess(){
    let val = document.getElementById("accessPwd").value.trim();
    if(val === ACCESS_PASSWORD){
        document.getElementById("accessLock").style.display = "none";
        document.getElementById("mainWrap").style.display = "block";
        renderAll();
    }else{
        alert("访问密码错误");
    }
}

// 假期倒计时
function updateCountdown(){
    let now = new Date();
    let diff = Math.ceil((targetDate - now) / (1000*60*60*24));
    document.getElementById("countdown").innerText = `距离假期：${diff} 天`;
}

// 全局渲染
function renderAll(){
    getWeekInfo();
    updateSchoolTimer();
    updateExamCount();
    holidayTip();
    renderNotice();
    renderTopNotice();
    renderHomework();
    renderTimeTable();
    renderSchedule();
    updateCountdown();
    checkAlert();
}

// 置顶通知
function renderTopNotice(){
    if(topNotice){
        document.getElementById("topNoticeWrap").style.display = "block";
        document.getElementById("topNotice").innerText = topNotice;
    }else{
        document.getElementById("topNoticeWrap").style.display = "none";
    }
}
function pushTopNotice(){
    let txt = document.getElementById("topNoticeText").value.trim();
    if(!txt)return alert("请输入置顶内容");
    topNotice = txt;
    localStorage.setItem("clsTopNotice",txt);
    alert("置顶通知发布成功");
}
function clearTopNotice(){
    topNotice = "";
    localStorage.removeItem("clsTopNotice");
    alert("已取消置顶");
}

// 作业专区
function renderHomework(){
    let box = document.getElementById("homeworkList");
    if(homeworkList.length===0){
        box.innerHTML = "<p>今日暂无作业</p>";
        return;
    }
    let html = "";
    homeworkList.reverse().forEach(item=>{
        html += `<div class="item">${item.time}<br>${item.content}</div>`;
    });
    box.innerHTML = html;
}
function pushHomework(){
    let txt = document.getElementById("homeworkText").value.trim();
    if(!txt)return alert("作业内容不能为空");
    homeworkList.push({content:txt,time:new Date().toLocaleString()});
    localStorage.setItem("clsHomework",JSON.stringify(homeworkList));
    alert("作业发布完成");
}

// 通知渲染+删除
function renderNotice(){
    const last = document.getElementById("latestNotice");
    const hist = document.getElementById("historyList");
    if(noticeList.length === 0){
        last.innerHTML = "<p>暂无通知</p>";
        hist.innerHTML = "<p>无历史记录</p>";
        return;
    }
    let latest = noticeList[noticeList.length-1];
    let html = `<div class="item">[${latest.time}]<br>${latest.content}`;
    if(latest.img) html += `<br><img src="${latest.img}">`;
    last.innerHTML = html+"</div>";

    let histHtml = "";
    noticeList.forEach((item,idx)=>{
        let t = `<div class="item small">
            [${item.time}] ${item.content}
            <button class="del-btn" onclick="delNotice(${idx})">删除</button>`;
        if(item.img) t += `<br><img src="${item.img}" style="max-width:200px">`;
        histHtml += t+"</div>";
    });
    hist.innerHTML = histHtml;
}
function delNotice(index){
    if(!confirm("确定删除？"))return;
    noticeList.splice(index,1);
    localStorage.setItem("clsNotice",JSON.stringify(noticeList));
    renderNotice();
}
function clearAllNotice(){
    if(!confirm("确定清空？不可恢复！"))return;
    noticeList = [];
    localStorage.setItem("clsNotice",JSON.stringify([]));
    renderNotice();
}

// 课表作息
function renderTimeTable(){document.getElementById("timeTable").innerText = lessonData.time;}
function renderSchedule(){document.getElementById("scheduleTable").innerText = lessonData.schedule;}

// 紧急弹窗
function checkAlert(){if(alertContent){document.getElementById("alertText").innerText=alertContent;document.getElementById("alertModal").style.display="flex";}}
function closeAlert(){document.getElementById("alertModal").style.display = "none";}
function clearAlert(){alertContent="";localStorage.removeItem("clsAlert");alert("已清除");}

// 生日检测
function checkBirthdayToday(){
    if(!birthdayData)return;
    let list = birthdayData.split("\n");
    let nowM = String(new Date().getMonth()+1).padStart(2,'0');
    let nowD = String(new Date().getDate()).padStart(2,'0');
    let todayBD = [];
    list.forEach(line=>{
        let arr = line.split("-");
        if(arr.length>=3){
            let m = arr[1],d=arr[2];
            if(m===nowM&&d===nowD) todayBD.push(arr[0]);
        }
    });
    if(todayBD.length>0){
        document.getElementById("birthdayText").innerText = todayBD.join("、")+" 生日快乐！";
        document.getElementById("birthdayModal").style.display = "flex";
    }
}
function closeBirthday(){document.getElementById("birthdayModal").style.display="none";}

// 管理员
function adminLogin(){
    let pwd = document.getElementById("adminPwd").value.trim();
    if(pwd === ADMIN_PASSWORD){
        document.getElementById("loginBox").style.display="none";
        document.getElementById("adminPanel").style.display="block";
        document.getElementById("editTime").value = lessonData.time;
        document.getElementById("editSchedule").value = lessonData.schedule;
        document.getElementById("setClassName").value = classConfig.name;
        document.getElementById("setLogoUrl").value = classConfig.logo;
        document.getElementById("examDate").value = examDate;
        document.getElementById("birthdayList").value = birthdayData;
    }else{alert("密码错误");}
}
function logoutAdmin(){
    document.getElementById("adminPanel").style.display="none";
    document.getElementById("loginBox").style.display="block";
}

// 发布通知/图片
function pushNotice(){
    let txt = document.getElementById("noticeText").value.trim();
    if(!txt)return alert("内容不能为空");
    noticeList.push({content:txt, time:new Date().toLocaleString(), img:""});
    localStorage.setItem("clsNotice",JSON.stringify(noticeList));
    alert("发布成功");document.getElementById("noticeText").value="";
}
function pushImage(){
    let file = document.getElementById("imgUpload").files[0];
    if(!file)return alert("请选择图片");
    let reader = new FileReader();
    reader.onload = function(e){
        noticeList.push({content:"图片通知",time:new Date().toLocaleString(),img:e.target.result});
        localStorage.setItem("clsNotice",JSON.stringify(noticeList));
        alert("图片发布成功");
    }
    reader.readAsDataURL(file);
}
function pushAlert(){
    let txt = document.getElementById("alertTextarea").value.trim();
    if(!txt)return;
    alertContent = txt;localStorage.setItem("clsAlert",txt);
    alert("紧急弹窗已推送");
}

// 保存配置
function saveSchedule(){
    lessonData.time = document.getElementById("editTime").value;
    lessonData.schedule = document.getElementById("editSchedule").value;
    localStorage.setItem("clsLesson",JSON.stringify(lessonData));
    alert("保存成功");
}
function saveClassConfig(){
    classConfig.name = document.getElementById("setClassName").value || "班级通知系统";
    classConfig.logo = document.getElementById("setLogoUrl").value || "logo.png";
    localStorage.setItem("clsConfig",JSON.stringify(classConfig));
    document.getElementById("className").innerText = classConfig.name;
    document.getElementById("logoImg").src = classConfig.logo;
    alert("班级信息已更新");
}
function saveExamDate(){
    examDate = document.getElementById("examDate").value;
    localStorage.setItem("clsExamDate",examDate);
    alert("考试时间保存成功");
}
function saveBirthday(){
    birthdayData = document.getElementById("birthdayList").value;
    localStorage.setItem("clsBirthday",birthdayData);
    alert("生日列表保存成功");
}

// 定时刷新时间
setInterval(()=>{
    updateSchoolTimer();
},1000*60);