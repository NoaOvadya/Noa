var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches
var done=false;
$(document).ready(function () {
    $("#main").click(function () {
        window.location.href = 'Home.html';
    });
    $("#schedule").click(function () {
        window.location.href = 'UpdateSchedule.html';
    });
    $("#alarm").click(function () {
        window.location.href = 'UpdateAlarm.html';
    });
    if (JSON.parse(localStorage.getItem("user")) != null && !(document.URL).includes("UpdateSchedule.html") && !(document.URL).includes("UpdateAlarm.html")) {
        window.location.href = 'Home.html';
    }
    if (JSON.parse(localStorage.getItem("user")) == null && ((document.URL).includes("UpdateSchedule.html") || (document.URL).includes("UpdateAlarm.html"))) {
        window.location.href = 'Home.html';
    }
    if ((document.URL).includes("UpdateSchedule.html")) {
        ClassSchedule();
    }    
    $("#lAlarm").click(function () { Next("sTable") })
    $("#lSchedule").click(function () { Previous("submit") })
    $(".next").click(function () {
        if (this.id == "register")
            Register();
        if (this.id == "sTable")
            SendSchedule();
        //Next(this.id);
    });    
});

function Next(state)
{
    //next field
    if (animating) return false;
    animating = true;

    current_fs = $("#"+state).parent();
    next_fs = $("#" + state).parent().next();

    //activate next step on progressbar using the index of next_fs
    $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

    //show the next fieldset
    next_fs.show();
    //hide the current fieldset with style
    current_fs.animate({ opacity: 0 }, {
        step: function (now, mx) {
            //as the opacity of current_fs reduces to 0 - stored in "now"
            //1. scale current_fs down to 80%
            scale = 1 - (1 - now) * 0.2;
            //2. bring next_fs from the right(50%)
            left = (now * 50) + "%";
            //3. increase opacity of next_fs to 1 as it moves in
            opacity = 1 - now;
            current_fs.css({
                'transform': 'scale(' + scale + ')',
                'position': 'absolute'
            });
            next_fs.css({ 'left': left, 'opacity': opacity });
        },
        duration: 800,
        complete: function () {
            current_fs.hide();
            animating = false;
        },
        //this comes from the custom easing plugin
        easing: 'easeInOutBack'
    })    
    if (state == "register") {
        ClassSchedule();
    }
}
//creat account
function Register()
{
    localStorage.setItem("user", JSON.stringify({layer:$("#layer").val(),clas:$("#clas").val()}));            
    Next("register");
} 

function Previous(state) {
    if (animating) return false;
    animating = true;

    current_fs = $("#" + state).parent();
    previous_fs = $("#" + state).parent().prev();

    //de-activate current step on progressbar
    $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");

    //show the previous fieldset
    previous_fs.show();
    //hide the current fieldset with style
    current_fs.animate({ opacity: 0 }, {
        step: function (now, mx) {
            //as the opacity of current_fs reduces to 0 - stored in "now"
            //1. scale previous_fs from 80% to 100%
            scale = 0.8 + (1 - now) * 0.2;
            //2. take current_fs to the right(50%) - from 0%
            left = ((1 - now) * 50) + "%";
            //3. increase opacity of previous_fs to 1 as it moves in
            opacity = 1 - now;
            current_fs.css({ 'left': left });
            previous_fs.css({ 'transform': 'scale(' + scale + ')', 'opacity': opacity });
        },
        duration: 800,
        complete: function () {
            current_fs.hide();
            animating = false;
        },
        //this comes from the custom easing plugin
        easing: 'easeInOutBack'
    });
}

//creat schedule
function ClassSchedule() {
    //gets html of class scheduale from school website and send them to BuildSchedule
    layer = JSON.parse(localStorage.getItem("user")).layer;
    clas = JSON.parse(localStorage.getItem("user")).clas;
    //layer = 12;
    //clas = 5;    
    var purl = "https://ohel-shem.com/portal6/pub/schedule/index.php?layer=" + layer + "&class=" + clas;
    $.getJSON('https://allorigins.me/get?charset=ISO-8859-1&url=' + encodeURIComponent(purl),
        function (data) {
            //$("#info").text(function () { return data.contents });
            BuildSchedule(data.contents.match(/<tbody>[\s|\S]*?<\/tbody>/));
        });
}
function BuildSchedule(data) {
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
    for (var i = 0; i < 12; i++) {
        s = "<tr class='sSchedule' id=hour" + (i + 1) + "><th>" + (i + 1) + "</th></tr>";
        $("#scheduleBody").append(s);
        var clas, teacher;
        for (var k = 0; k < 6; k++) {
            clas = week[k][0][i + 1];
            if (clas == "empty") {
                clas = "";
            }
            var color = "";
            if (clas.match(/,/) != null) {
                color = "style='color:red'";
            }
            s = "<td " + color + " contenteditable='true' class='schedule day" + (k + 1) + " hour" + (i + 1) + " clas' ><b>" + clas + "</td>";
            $("#hour" + (i + 1)).append(s);
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
            $("#hour" + (i + 1) + "t").append(s);
        }
    }

}
function Day(date, weeklyHours) {
    //gets daily schedule from html
    //date= the number of the day(for example sunday=1)
    date = date - 1;
    clas = ["", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"];
    teacher = ["", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"];
    var temp, c, t;
    for (var i = 1; i <= 12; i++) {
        temp = hours[(i - 1) * 6 + date];
        c = temp.match(/<b>[\s|\S]*?<\/b>/)[0].replace(/<b>/, "").replace(/<\/b>/, "");
        if (c != "")
            clas[i] = c;
        t = temp.match(/<br \/>[\s|\S]*?<\/td>/)[0].replace(/<br \/>/, "").replace(/<\/td>/, "");
        if (t != "")
            teacher[i] = t;

    }
    day = [clas, teacher];
    //alert(day[0][1]);
    return day;
}
function SendSchedule() {
    //saves schedule in local storage
    subject=[];
    teacher=[];
    for (var i = 1; i <= 6; i++) {
        subject[i] = GetDayFromTable(i);
        teacher[i] = GetTeacherFromTable(i);                
    }
    localStorage.setItem("subject", JSON.stringify(subject));
    localStorage.setItem("teacher", JSON.stringify(teacher));
    if ((document.URL).includes("UpdateSchedule.html")) {
            window.location.href = 'Home.html';
        }
    Next("sTable");
}

function GetDayFromTable(day) {//gets daily subjects from table
    clas = ["", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"];
    var temp;
    for (var i = 1; i <= 12; i++) {
        temp = $(".clas.day" + day + ".hour" + i).text();
        temp = temp.replace(/'/, "");
        if (temp != "")
            clas[i] = temp;
    }
    return clas;
}
function GetTeacherFromTable(day) {//gets daily teachers from table
    teacher = ["", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"];
    var temp;
    for (var i = 1; i <= 12; i++) {
        temp = $(".teacher.day" + day + ".hour" + i).text();
        temp = temp.replace(/'/, "");
        if (temp != "")
            teacher[i] = temp;
    }
    return teacher;
}

//clock
$(document).ready(function () {
    $("#bMenual").click(function () {
        $("#manual").toggle()
    });
});

$(document).ready(function () {
    $("#submit").click(function () { Manual(); });
});
//$(document).ready(function () { Defult(); })
//function Defult() {
//    var t = ["08:00", "08:50", "09:50", "10:40", "11:45", "12:35", "13:30", "14:20", "15:10", "10:40", "16:05", "17:55"];
//    for (var i = 0; i < t.length; i++) {
//        document.getElementById((i+1).toString()).defaultValue = t[i];
//    }    
//}
function Auto()
{
    var hours = [8*60, 8*60+50, 9*60+50, 10*60+40, 11*60+45, 12*60+35, 13*60+30, 14*60+20, 15*60+10,16*60, 16*60+50,17*60+40];
    var min = 60,temp,s;
    var wakeup = [];
    if($("#auto").val!="")
    {
        min = $("#auto").val();
    }
    for (var i = 0; i < hours.length; i++) {
        temp = hours[i] - min;
        if (temp < 0)
            temp = 24 * 60 - temp;
        s = parseInt(temp / 60) + ":" + temp % 60;
        if (s.length != 5)
        {
            if (s.match(/[\s|\S]*?:/)[0].length != 3)
                s = "0" + s;
            else
                s = s + "0";
        }        
        wakeup.push(s);
    }
    return wakeup;
}
function Manual()
{
    var arr = Auto();
    var temp;
    for (var i = 0; i < 12; i++) {
        temp = $("#" + (i + 1)).val();
        if (temp != "")
            arr[i]=temp;
    }    
    localStorage.setItem("wakeup", JSON.stringify(arr));
    window.location.href = 'Home.html';
}
