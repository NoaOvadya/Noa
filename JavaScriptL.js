$(document).ready(function () {
    $("#login").click(function () {
        if (Valid()) { Login() }
    });
    if (JSON.parse(localStorage.getItem("user")) != null) {
        window.location.href = 'Home.html';
    }
});
function Login() {
    var params = JSON.stringify({ email: $("#email").val(), password: $("#password").val() });
    $.ajax({
        type: "POST",
        dataType: "json",
        data: params,
        contentType: "application/json; charset=utf-8",
        url: "WebService1.asmx/Login",
        success: Process_Result,
        error: Process_Error
    });
}
function Valid() {
    //checks that all fields are legal
    email = $("#email").val()
    if (email == "") {
        $("#valid").text("יש להכניס אימייל");
        $("#valid").css("color", "red");
        return false;
    }
    else {
        if (email.match(/\S@{1}\S/g) == null || email.match(/(^A-z|^0-9)/) != null) {
            $("#valid").text("אימייל לא תקין");
            $("#valid").css("color", "red");
            return false;
        }
    }    
    password = $("#password").val();    
    if (password == "") {
        $("#valid").text("יש להכניס סיסמה ");
        $("#valid").css("color", "red");
        return false;
    }
    else {
        if (password.match(/(^A-z|^0-9)/g) != null || password.length < 6) {
            $("#valid").text("סיסמה לא תקינה(סיסמה צריכה להיות בעלת שישה תווים לפחות המורכבים מאותיות באנגלית ומספרים בלבד");
            $("#valid").css("color", "red");
            return false;
        }        
    }
    $("#valid").text("");
    $("#valid").css("color", "black");
    return true;
}
function Process_Result(data) {
    if (data.d != null)
    {
        localStorage.setItem("user", JSON.stringify(data.d));
        window.location.href = 'Home.html';
    }
    else {
        $("#valid").text("אימייל או סיסמה לא נכונים, נסה שוב");
        $("#valid").css("color", "red");
    }

}
function Process_Error(data) {
    $("#valid").text("תקלה בשרת, נסה שוב מאוחר יותר");
    $("#valid").css("color", "red");
}
