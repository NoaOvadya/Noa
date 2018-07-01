
var days = [, "ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי"];
$(document).ready(function () {     
    //call the getday or htmlchanges base on hour and day       
        if (JSON.parse(localStorage.getItem("user")) == null ) {
            window.location.href = 'Register2.html';
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
            localStorage.setItem("wakeup", null);            
            localStorage.setItem("changes", null);
            localStorage.setItem("todayS", null);
            localStorage.setItem("todayT", null);
            window.location.href = 'Register2.html';
        });
        if(localStorage.getItem("alarm")!=null && localStorage.getItem("alarm")=="false")
        {
            $(".switch").append("<input id='alarmSwitch' type='checkbox' ><span class='slider round'></span>");   
        }
        else{
           $(".switch").append("<input id='alarmSwitch' type='checkbox' checked><span class='slider round'></span>");
           localStorage.setItem("alarm", true);           
        }
        IsVacation();       
        //GetDay();
        $("#update").click(function () {
            window.location.href = 'UpdateSchedule.html';
        });
        $("#alarmSwitch").click(function(){
    if($("#alarmSwitch").is(':checked'))
    {
        localStorage.setItem("alarm", true);
        Calender();
    }
    else{
        localStorage.setItem("alarm", false);
    }
})   
        
})

function IsVacation()
{
    var holiday=[[new Date("09/20/2017"),new Date("09/22/2017"),"ראש השנה"],
    [new Date("09/29/2017"),new Date("09/30/2017"),"יום כיפור"],
    [new Date("10/04/2017"),new Date("10/13/2017"),"סוכות"],
    [new Date("12/14/2017"),new Date("12/20/2017"),"חנוכה"],
    [new Date("02/28/2018"),new Date("03/02/2018"),"פורים"],
    [new Date("03/22/2018"),new Date("04/07/2018"),"פסח"],
    [new Date("04/19/2018"),new Date("04/19/2018"),"יום העצמאות"],
    [new Date("05/03/2018"),new Date("05/03/2018"),"ל\"ג בעומר"],
    [new Date("05/19/2018"),new Date("05/19/2018"),"שבועות"]
  ];
    vaction=false;
    d=new Date();
    t=d.getTime();
    layer=JSON.parse(localStorage.getItem("user")).layer;
    for (i = 0; i < holiday.length; i++){
        if (t >= holiday[i][0].getTime() && t <= holiday[i][1].getTime()) {            
            vaction=true;
        }  
        if( holiday[i][2]=="יום העצמאות" && t > holiday[i][0].getTime() && layer==12){
            vaction=true;   
        }
    }
    if(vaction==true)
    {
       $("#title").text("חופש");       
       $("th").remove();
    }
    else
        GetDay();
}
function GetDay()
{
    //get schedule of the day from local storage
    //call the HtmlChanges function(in the procces result)    
    var temp = new Date();
    var day = temp.getDay() + 1;
    if (temp.getHours() >= 21)
        day=day+1;
    if(day==8)
        day=1;
    if (day != 7)
    {        
        localStorage.setItem("day", day);
        $("#title").text("מערכת ליום "+days[day]);
        $("th").remove();
        HtmlChanges();
    }  
    else
    {
        $("#title").text("תתביישו לכם שבת היום");
    }
}

function HtmlChanges() {
    //gets html of changes of the day from school website and send them to TodayChanges
    layer=JSON.parse(localStorage.getItem("user")).layer;
    clas = JSON.parse(localStorage.getItem("user")).clas;
    var purl = "https://ohel-shem.com/portal6/pub/schedule/live.php?layer=" + layer + "&class=" + clas;
    $.getJSON('https://allorigins.me/get?charset=ISO-8859-1&url='+ encodeURIComponent(purl),
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
    localStorage.setItem("changes", JSON.stringify(day));
    Today();
}
function Today()
{
    day=JSON.parse(localStorage.getItem("day"));
    subject = JSON.parse(localStorage.getItem("subject"))[day];
    teacher = JSON.parse(localStorage.getItem("teacher"))[day];
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
    if(localStorage.getItem("alarm")=="true")
    {
        Calender();
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
    //var hours = [8 * 60, 8 * 60 + 50, 9 * 60 + 50, 10 * 60 + 40, 11 * 60 + 45, 12 * 60 + 35, 13 * 60 + 30, 14 * 60 + 20, 15 * 60 + 10, 16 * 60, 16 * 60 + 50, 17 * 60 + 40];
    var hours=JSON.parse(localStorage.getItem("wakeup"));
    start = hours[StartHour()-1];
    //if (start<0) {
    //    start = 24 * 60 - start;
    //}
    h =start[0];
    m = start[1];
    d=new Date();
    //if(d.getHours()>=21 || d.getHours()<h)
    //{        
        MyHandler.setAlarm(h,m);
    //}    
}
//function WakeUp()
//{
//    return JSON.parse(localStorage.getItem("wakeup"))[StartHour()-1];    
//}
//function Alarm()
//{
//    email = JSON.parse(localStorage.getItem("user")).email;
//    startMyHandler.calcSomething(5,7);=StartHour();
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
