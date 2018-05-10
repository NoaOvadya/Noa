//analyzing school website

function HtmlChanges(layer,clas)
{
    //gets html of changes of the day from school website and send them to TodayChanges
    var purl = "http://ohel-shem.com/portal6/pub/schedule/live.php?layer="+layer+"&class="+clas;
    $.getJSON('http://whateverorigin.org/get?url=' +
        encodeURIComponent(purl) + '&callback=?',
        function (data) {
            return TodayChanges(data.contents.match(/<tbody>[\s|\S]*?<\/tbody>/));             
        }); 
}
function TodayChanges(data)
{
    //gets html of changes of the day and analyze them into an array(first hour at place 1)  
    var day=["","no change","no change","no change","no change","no change","no change","no change","no change","no change","no change","no change","no change"];    
    //$("#info").text(function () { return data });
    hours = data[0].match(/<tr class='[\s|\S]*?'>[\s|\S]*?<\/tr>/g);
    if (hours != null)
    {
        for (i = 0; i < hours.length; i++)
        {        
            h = hours[i].match(/>\d+<\/td>/)[0].match(/\d+/);
            day[h] = hours[i].match(/<td style='font-size:20px;font-weight:bold;'>[\s|\S]*?<span/)[0].replace(/<span/,"").replace(/<td style='font-size:20px;font-weight:bold;'>/,"");
        }
    }
    
    alert(day);
    return day;    
}
function ClassSchedule(layer, clas) {
    //gets html of class scheduale from school website and send them to BuildSchedule
    var purl = "http://ohel-shem.com/portal6/pub/schedule/index.php?layer=" + layer + "&class=" + clas;
    $.getJSON('http://whateverorigin.org/get?url=' +
        encodeURIComponent(purl) + '&callback=?',
        function (data) {
            //$("#info").text(function () { return data.contents });
            BuildSchedule(data.contents.match(/<tbody>[\s|\S]*?<\/tbody>/));
        });
}
function BuildSchedule(data)
{
    //gets html of class and analyze them into an array[0]=teachers,[1]=classes(first hour at place 1)  
    //$("#info").text(function () { return data });
    hours = data[0].match(/<td>[\s|\S]*?<\/td>/g);    
    sunday = Day(1, hours);
    monday = Day(2, hours);
    tuesday = Day(3, hours);
    wednesday = Day(4, hours);
    thursday = Day(5, hours);
    friday = Day(6, hours);
    week = [sunday, monday, tuesday, wednesday, thursday, friday];
    var s;
    for (var i = 0; i < 12; i++)
    {
        s = "<tr class='sSchedule' id=hour" + (i + 1) + "><th>"+(i+1)+"</th></tr>";
        $("#scheduleBody").append(s);
        var clas, teacher;
        for (var k = 0; k < 6; k++)
        {
            clas = week[k][0][i + 1];                
            if (clas == "empty")
            {
                clas = "";             
            }
            var color="";
            if (clas.match(/,/)!=null) {
                color="style='color:red'";
            }            
            s = "<td " + color + " contenteditable='true' class='schedule day" + (k + 1) + " hour" + (i + 1) + " clas' ><b>" + clas + "</td>";
            $("#hour"+(i+1)).append(s);
        }
        s = "<tr class='sSchedule' id='hour" + (i + 1) + "t'><th></th></tr>";
        $("#scheduleBody").append(s);        
        for (var k = 0; k < 6; k++) {
            clas = week[k][0][i + 1];
            teacher = week[k][1][i + 1];
            if (teacher == "empty") {
                teacher = "";
            }
            var color = "";          
            if (teacher.match(/,/) != null) {
                color = "style='color:red'";
            }
            s = "<td " + color + " contenteditable='true' class='schedule day" + (k + 1) + " hour" + (i + 1) + " teacher' >" + teacher + "</td>";
            $("#hour" + (i + 1)+"t").append(s);
        }
    }   
    
}
function SendSchedule(email)
{ //send schedule to data base
    for (var i = 1; i <= 6; i++)
    {    
        subject=GetDayFromTable(i);
        teacher=GetTeacherFromTable(i);
        var params = JSON.stringify({ day: i, email: email, subject: subject, teacher: teacher });
                        $.ajax({
                            type: "POST",
                            dataType: "json",
                            data: params,
                            contentType: "application/json; charset=utf-8",
                            url: "WebService1.asmx/SetDay",
                            success: Process_Result,
                            error: Process_Error
                        });    
       localStorage.setItem("subjects"+i, subject);
       localStorage.setItem("teacher"+i, teacher);
    }
        
}
function GetDayFromTable(day)
{//gets daily subjects from table
    clas=["", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"];
    var temp;
    for (var i = 1; i <= 12; i++) 
    {
        temp = $(".clas.day" + day + ".hour" + i).text();
        temp = temp.replace(/'/, "");
        if(temp!="")
            clas[i]=temp;
    }
    return clas;
}
function GetTeacherFromTable(day)
{//gets daily teachers from table
    teacher=["", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"];
    var temp;
    for (var i = 1; i <= 12; i++) 
    {
        temp = $(".teacher.day" + day + ".hour" + i).text();
        temp = temp.replace(/'/, "");
        if(temp!="")
            teacher[i]=temp;
    }
    return teacher;
}
function Day(date, weeklyHours)
{
    //gets daily schedule from html
    //date= the number of the day(for example sunday=1)
    date =date-1;
    clas = ["", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"];
    teacher = ["", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"];
    var temp,c,t;
    for (var i = 1; i <= 12; i++) {
        temp = hours[(i - 1) * 6 + date];
        c = temp.match(/<b>[\s|\S]*?<\/b>/)[0].replace(/<b>/, "").replace(/<\/b>/, "");
        if (c != "")
            clas[i] = c;
        t = temp.match(/<br \/>[\s|\S]*?<\/td>/)[0].replace(/<br \/>/, "").replace(/<\/td>/, "");
        if (t!="")
            teacher[i] = t;
        
    }
    day = [clas, teacher];
    //alert(day[0][1]);
    return day;
}
function GetScheduleFromDB(day,email)
{
    //gets schedule from data base
    var params = JSON.stringify({ day: day, email: email});
    $.ajax({
        type: "POST",
        dataType: "json",
        data: params,
        contentType: "application/json; charset=utf-8",
        url: "WebService1.asmx/GetDay",
        success: ScheduleLS,
        error: Process_Error
    });    
}
function ScheduleLS(schedule)
{
    localStorage.setItem("subjects"+schedule.d.day, schedule.d.subject);
    localStorage.setItem("teacher"+schedule.d.day, schedule.d.teacher);
}
function GetUserClassFromDB(email)
{
    //gets user's class from data base
    var params = JSON.stringify({ email: email });
    $.ajax({
        type: "POST",
        dataType: "json",
        data: params,
        contentType: "application/json; charset=utf-8",
        url: "WebService1.asmx/GetUser",
        success: UserClassLS,
        error: Process_Error
    });
}
function UserClassLS(user) {
    localStorage.setItem("user", user.d);    
}
function StartHour()
{

    if (localStorage.getItem("user") == null)
        window.location.assign("Login.html")
    else
    {
        email = localStorage.getItem("user").email;
        if (localStorage.getItem("layer") == null)
            GetUserClassFromDB(email);
        var d = new Date();
        var n = d.getDay();
        if (localStorage.getItem("subjects" + n) == null)
        {
            GetScheduleFromDB(n, email);
        }                
        changes = HtmlChanges(localStorage.getItem("layer"), localStorage.getItem("clas"));
        alert(changes);
    }
    
}
function Process_Result(data)
{
    alert("success");
}
function Process_Error(data)
{
    alert("ERROR");
}



//$.getJSON('http://allorigins.us/get?url=http%3A//ohel-shem.com/portal6/pub/changes/index.php%3Flayer%3D12&callback=?', function (data) {
//    alert(data.contents.replace(/<thead>[\s|\S]*?<\/thead>/g).match(/bg-olive/g).length);
//});
