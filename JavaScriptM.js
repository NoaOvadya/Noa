﻿//בעיות:
//*מקבל עברית בסיסמאות ובאימייל

//דף ראשי:
//*כיוון שעון מעורר

//*בדיקת לוח בגרויות
//*התראה למתכונות ובגרויות
//*מתן אפשרות לבטל שעון להיום
//*מתן אפשרות לערוך מערכת שעות/הגדרת שעון
//*הגדרת מערכת חדשה כל שנה(מעבר כיתות אוטומטי)

var days = [, "ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי"];
$(document).ready(function () {        
    //call the getday or htmlchanges base on hour and day       
        if (JSON.parse(localStorage.getItem("user")) == null ) {
            window.location.href = 'Login2.html';
        }
        $("#schedule").click(function () {
            window.location.href = 'UpdateSchedule.html';
        });
        $("#alarm").click(function () {
            window.location.href = 'UpdateAlarm.html';
        });
        $("#logout").click(function () {
            localStorage.setItem("user", null);
            localStorage.setItem("subject", null);
            localStorage.setItem("teacher", null);
            localStorage.setItem("day", null);
            localStorage.setItem("hours", null);
            localStorage.setItem("changes", null);
            localStorage.setItem("todayS", null);
            localStorage.setItem("todayT", null);
            window.location.href = 'Login2.html';
        });
        $("#update").click(function () {
            window.location.href = 'UpdateSchedule.html';
        });
        var temp = new Date();
        var h = temp.getHours();
        var day = temp.getDay();
        if (h>16) {
            day+=1;
        }        
        if (localStorage.getItem("day") != day && (h >= 21 || h<16))
        {
            IsVacation();            
        }        
        else {
            if (!localStorage.getItem("vacation"))
                HtmlChanges();            
    }
            ls = JSON.parse(localStorage.getItem("user"));
            name = ls.firstName +" "+ ls.lastName;
            $("#user").text("שלום" + " " + name);
            if ($("#alarmSwitch").value()) {
                Calender();
            }            
})
function ClassUp() {
    user = JSON.parse(localStorage.getItem("user"));
    if (user.layer!=12) {
        user.layer++;
    }
    var params = JSON.stringify({ email: user.email, layer: user.layer });
    $.ajax({
        type: "POST",
        dataType: "json",
        data: params,
        contentType: "application/json; charset=utf-8",
        url: "WebService1.asmx/UpdateLayer",
        success: Process_ResultUp,
        error: Process_Error
    });    
}
function Process_ResultUp(data) {
    if (data.d != null) {
        //saves new user in local storage
        localStorage.setItem("user", JSON.stringify(data.d));
        Next("register");
    }
    else {
        alert("error")
        //$("#valid").text("שגיאה");
        //$("#valid").css("color", "red");
    }
}

function IsVacation()
{
    var temp = new Date();
    if (temp.getHours>16) {
        temp.setDate(temp.getDate() + 1);
    }    
    d = temp.getDate();
    m = temp.getMonth()+1;
    y = temp.getFullYear();
    var params = JSON.stringify({ day: d, month:m ,year:y });
    $.ajax({
        type: "POST",
        dataType: "json",
        data: params,
        contentType: "application/json; charset=utf-8",
        url: "WebService1.asmx/IsVacation",
        success: Process_ResultV,
        error: Process_Error
    });
}
function Process_ResultV(data) {
    if (data != null) {
        if(data.d)
        {
            localStorage.setItem("vacation", true);
            $("#title").text("חופש");
            $("#title").css("font-size", "200%");
            $("th").remove();            
        }
        else {
            localStorage.setItem("vacation", false);
            GetDay();
        }        
    }
    else
        alert("שגיאת שרת");    
}
function GetDay()
{
    //get schedule of the day from data base
    //call the HtmlChanges function(in the procces result)
    email = JSON.parse(localStorage.getItem("user")).email;
    var temp = new Date();
    var day = temp.getDay() + 1;
    if (temp.hours >= 21)
        day++;
    if (day != 7)
    {
        var params = JSON.stringify({ day: day, email: email});
            $.ajax({
                type: "POST",
                dataType: "json",
                data: params,
                contentType: "application/json; charset=utf-8",
                url: "WebService1.asmx/GetDay",
                success: Process_Result,
                error: Process_Error
            });
    }    
}
function Process_Result(data)
{
    if(data!=null)
    {
        var temp = new Date();
        var day = temp.getDay() + 1;
        localStorage.setItem("subject", JSON.stringify(data.d.subject));
        localStorage.setItem("teacher", JSON.stringify(data.d.teacher));
        localStorage.setItem("day", day);
        $("#title").text("מערכת ליום "+days[day]);
        HtmlChanges();
    }
}
function Process_Error()
{
    alert("שגיאה");
}
function HtmlChanges() {
    //gets html of changes of the day from school website and send them to TodayChanges
    layer=JSON.parse(localStorage.getItem("user")).layer;
    clas = JSON.parse(localStorage.getItem("user")).clas;
    var purl = "http://ohel-shem.com/portal6/pub/schedule/live.php?layer=" + layer + "&class=" + clas;
    $.getJSON('http://whateverorigin.org/get?url=' +
        encodeURIComponent(purl) + '&callback=?',
        function (data) {
            TodayChanges(data.contents.match(/<tbody>[\s|\S]*?<\/tbody>/));
        });
}
function TodayChanges(data) {
    //gets html of changes of the day and analyze them into an array(first hour at place 1)  
    var day = ["", "no change", "no change", "no change", "no change", "no change", "no change", "no change", "no change", "no change", "no change", "no change", "no change"];
    //$("#info").text(function () { return data });
    hours = data[0].match(/<tr class='[\s|\S]*?'>[\s|\S]*?<\/tr>/g);
    if (hours != null) {
        for (i = 0; i < hours.length; i++) {
            h = hours[i].match(/>\d+<\/td>/)[0].match(/\d+/);
            day[h] = hours[i].match(/<td style='font-size:20px;font-weight:bold;'>[\s|\S]*?<span/)[0].replace(/<span/, "").replace(/<td style='font-size:20px;font-weight:bold;'>/, "");
        }
    }
    var d = new Date();
    var h = d.getHours();    
    localStorage.setItem("hours", h);
    localStorage.setItem("changes", JSON.stringify(day));
    Today();
}
function Today()
{
    subject = JSON.parse(localStorage.getItem("subject"));
    teacher = JSON.parse(localStorage.getItem("teacher"));
    changes = JSON.parse(localStorage.getItem("changes"));
    var ttemp, canceled=false;
    for (var i = 1; i < changes.length; i++) {
        if(changes[i]!="no change" && teacher[i]!="")
        {
            if (changes[i].includes("חופשת")) {
                canceled = true;
            }
            if (changes[i] == "מבוטל" || changes[i] == "בספריה")
            {
                subject[i] = "empty";
                teacher[i] = "empty";
            }
            else {
                if (changes[i].includes("בלי")) {
                    ttemp = teacher[i].split(" ");
                    for (var i = 0; j < ttemp.length; j++) {                        
                        if (changes[i].includes(ttemp[j])) {
                            subject[i] = "empty";
                            teacher[i] = "empty";
                        }
                    }
                }
                else
                {
                    subject[i] = changes[i];
                    teacher[i] = "changed";
                }
            }
        }
    }
    if (canceled) {
        for (var i = 0; i < subject.length; i++) {
            subject[i] = "empty";
            teacher[i] = "empty";
        }
    }
    localStorage.setItem("todayS", JSON.stringify(subject));
    localStorage.setItem("todayT", JSON.stringify(teacher));
    BuildSchedule();
}
function BuildSchedule()
{
    subject = JSON.parse(localStorage.getItem("todayS"));
    teacher = JSON.parse(localStorage.getItem("todayT"));
    var temp,s,t,color;
    for (var i = 1; i < 13; i++) {
        s = subject[i];
        t = teacher[i];
        if (s == "empty") {
            s = "";
            t = "";
        }
        if (t=="changed") {
            t = "";
            color = "style = 'color:red'";
        }
        temp = "<tr class='Schedule' id=" + i + "></tr>";
        $("#scheduleBody").append(temp);
        temp = "<td>" + i + "</td><td " + color + "><b>" + s + "</b></td>";
        $("#" + i).append(temp);
        temp = "<tr class='Schedule' id=s" + i + "></tr>";
        $("#scheduleBody").append(temp);
        temp = "<td></td><td>" + t + "</td>";
        $("#s" + i).append(temp);
        color = "";
    }    
}
function StartHour()
{
    subject = JSON.parse(localStorage.getItem("todayS"));
    start = 12;
    for (var i = 1; i < subject.length; i++) {
        if (subject[i] != "empty")
        {
            start = i;
            break;
        }            
    }
    return start;
}
function Calender()
{
    var hours = [8 * 60, 8 * 60 + 50, 9 * 60 + 50, 10 * 60 + 40, 11 * 60 + 45, 12 * 60 + 35, 13 * 60 + 30, 14 * 60 + 20, 15 * 60 + 10, 16 * 60, 16 * 60 + 50, 17 * 60 + 40];
    start = hours[StartHour()-1] - 3 * 60;
    if (start<0) {
        start = 24 * 60 - start;
    }
    h = parseInt(start / 60);
    m = start % 60;
    if (h<10) {
        h = "0" + h;
    }
    if (m<10) {
        m = "0" + m;
    }
    time = h + "" + m;
    var temp = new Date();
    var year = temp.getFullYear();
    var month = temp.getMonth() + 1;
    if (month < 10)
        month = "0" + month;
    var day = temp.getDate();
    if (day < 10)
        day = "0" + day;
    date = year + "" + month + "" + day;    
    url = 'https://www.google.com/calendar/render?action=TEMPLATE&text=Alarm&dates=' + date + 'T' + time + '00Z%2F' + date + 'T' + time + '00Z';
    var win = window.open(url, '_blank');
    if (win) {
        //Browser has allowed it to be opened
        win.focus();
    } else {
        //Browser has blocked it
        alert('Please allow popups for this website');
    }
    

}
//function Alarm()
//{
//    email = JSON.parse(localStorage.getItem("user")).email;
//    start=StartHour();
//    var params = JSON.stringify({ email:email , hour: start});
//    $.ajax({
//    type: "POST",
//    dataType: "json",
//    data: params,
//    contentType: "application/json; charset=utf-8",
//    url: "WebService1.asmx/GetAlarmByHour",
//    success: Process_ResultA,
//    error: Process_Error
//    });
//}
//function Process_ResultA(data) {
//    if (data != null) {
//        localStorage.setItem("hour", JSON.stringify(data.d.hour));
//        localStorage.setItem("min", JSON.stringify(data.d.min));
//    }
//    else
//        alert("שגיאת שרת");
//}