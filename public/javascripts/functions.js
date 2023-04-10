//GLOBAL VARIABLES
const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 60;
const ALERT_THRESHOLD = 20;
const TIME_LIMIT = 180;
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;
const COLOR_CODES = {
    info: {
        color: "green"
    },
    warning: {
        color: "orange",
        threshold: WARNING_THRESHOLD
    },
    alert: {
        color: "red",
        threshold: ALERT_THRESHOLD
    }
};
let remainingPathColor = COLOR_CODES.info.color;

//Captcha Oluþturma Fonksiyonu
function createCaptcha() {
    document.getElementById('captcha').innerHTML = "";
    var charsArray = "123456789abcdefghijklmnprstuvwxyz";
    var lengthOtp = 4;
    var captcha = [];
    for (var i = 0; i < lengthOtp; i++) {
        var index = Math.floor(Math.random() * charsArray.length + 1);//Karakterlerin tekrar etmesi engellenir.
        if (captcha.indexOf(charsArray[index]) == -1)
            captcha.push(charsArray[index]);
        else i--;
    }
    var canv = document.createElement("canvas");//Canvas Oluþturma
    canv.id = "captcha";
    canv.width = 250;
    canv.height = 100;
    var ctx = canv.getContext("2d");//Canvasa Yazý Ekleme
    ctx.font = "32px Georgia";
    ctx.strokeText(captcha.join(""), 0, 30);
    captchaCode = captcha.join("");//Captcha Kodu daha sonra doðrulama için GLOBAL deðiþkene atýlýr.
    document.getElementById("captcha").appendChild(canv);//Canvas sayfaya konulur.
}

//TCKN Verify
function verifyTCKN(TCNO) {
    var tek = 0, cift = 0, res = 0, TCToplam = 0;

    if (TCNO.length != 11) return false;
    if (isNaN(TCNO)) return false;
    if (TCNO[0] == 0) return false;

    tek = parseInt(TCNO[0]) + parseInt(TCNO[2]) + parseInt(TCNO[4]) + parseInt(TCNO[6]) + parseInt(TCNO[8]);
    cift = parseInt(TCNO[1]) + parseInt(TCNO[3]) + parseInt(TCNO[5]) + parseInt(TCNO[7]);

    tek = tek * 7;
    res = Math.abs(tek - cift);
    if (res % 10 != TCNO[9]) return false;

    for (var i = 0; i < 10; i++) {
        TCToplam += parseInt(TCNO[i]);
    }

    if (TCToplam % 10 != TCNO[10]) return false;

    return true;
}

//Email Verify
function verifyEmail(email) {
    var re = /\S+@\S+\.\S+/;
    if (!re.test(email)) {
        console.log('Email not valid.');
        return false;
    }
    return true;
}

//Captcha Verify
function verifyCaptcha(captcha) {
    if (captcha == captchaCode) {
        return true;
    }
    else {
        console.log("Invalid Captcha. try Again");
        createCaptcha();
        return false;
    }
}

//Confirm Code Verify
function verifyCode(code) {
    //Kod 6 haneli olmak zorunda.
    if (code.length != 6) {
        return false;
    }
    if (code == "" || code == null) {
        return false;
    }

    return true;
}

//Password Verify
function verifyPassword(pass1, pass2) {
    if (pass1 != pass2) {
        return false;
    }
    if (pass1 == "" || pass1 == null) {
        return false;
    }
    return true;
}

//Arayüz elemanlarý arasý geçiþlerin olduðu fonksiyon
function show(form) {
    //hata gösterme alanlarýný her bir gösterimden önce sýfýrlanýr.
    document.getElementById("errCaptcha").innerHTML = "";
    document.getElementById("errInputTCKN").innerHTML = "";
    document.getElementById("errInputEmail").innerHTML = "";
    document.getElementById("err_pass").innerHTML = "";
    document.getElementById("err_pass2").innerHTML = "";

    //Gelen parametreye göre hangi gösterimin yapýlacaðý seçilir.
    switch (form) {
        case "FF":
            document.getElementById("forgotForm").style.display = "block";
            document.getElementById("confirmForm").style.display = "none";
            document.getElementById("confirmFormErr").style.display = "none";
            document.getElementById("resetForm").style.display = "none";          
            document.getElementById("successForm").style.display = "none"; 
            break;

        case "errFF_captcha":
            document.getElementById("errCaptcha").innerHTML = "Hatali Captcha";
            createCaptcha();
            break;

        case "errFF_tckn":
            document.getElementById("errInputTCKN").innerHTML = "Gecersiz TC No";
            createCaptcha();
            break; 

        case "errFF_email":
            document.getElementById("errInputEmail").innerHTML = "Gecersiz Email";
            createCaptcha();
            break;

        case "errFF_falseResponseEmail":
            document.getElementById("errInputEmail").innerHTML = "Mail Adresi Kayitli Degil";
            createCaptcha();
            break;

        case "errFF_falseResponseTCKN":
            document.getElementById("errInputTCKN").innerHTML = "TCKN Kayitli Degil";
            createCaptcha();
            break;

        case "CF":
            resetTimer();
            document.getElementById("forgotForm").style.display = "none";
            document.getElementById("confirmForm").style.display = "block";
            //Timer burada oluþturulur.
            document.getElementById("app").innerHTML = `
<div class="base-timer">
  <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="base-timer__circle">
      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
      <path
        id="base-timer-path-remaining"
        stroke-dasharray="283"
        class="base-timer__path-remaining ${remainingPathColor}"
        d="
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
      ></path>
    </g>
  </svg>
  <span id="base-timer-label" class="base-timer__label">${formatTime(
                timeLeft
            )}</span>
</div>
`;
            startTimer();
            break;

        case "errCF":
            document.getElementById("confirmForm").style.display = "none";
            document.getElementById("confirmFormErr").style.display = "block";
            createCaptcha();            
            resetTimer();
            break;

        case "RF":
            document.getElementById("confirmForm").style.display = "none";
            document.getElementById("resetForm").style.display = "block";      
            break;

        case "errRF":
            document.getElementById("err_pass").innerHTML = "Sifreler Eslesmiyor";
            document.getElementById("err_pass2").innerHTML = "Sifreler Eslesmiyor";
            break;

        case "success":
            document.getElementById("resetForm").style.display = "none";
            document.getElementById("successForm").style.display = "block";
            break;
    }
}

//Sunucuya POST isteði gönderen fonksiyon
function send(destination) {
    var postURL;
    switch (destination) {
        case "FF":         
            var data = {};
            data.email = email;
            data.tckn = tckn;   
            postURL = "form";
            break;

        case "CF":
            var data = {};
            data.message = code;
            postURL = "confirm";
            break;

        case "RF":
            var data = {};
            data.message = pass;
            postURL = "reset";
            break;
    }

    $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: '/'+postURL,
        success: function (data) {
            console.log('POST request sent successfully.');
            var dataFromServer = new String(data);
            if (dataFromServer == "trueFF") {
                console.log("FF Response-True");
                show("CF");
                return true;
            }
            else if (dataFromServer == "false_email") {
                console.log("FF Response-False-email");
                show("errFF_falseResponseEmail");
                return false;
            }
            else if (dataFromServer == "false_tckn") {
                console.log("FF Response-False-tckn");
                show("errFF_falseResponseTCKN");
                return false;
            }          
            else if (dataFromServer == "trueCF") {
                console.log("CF Response-True");
                show("RF");
                return false;
            } 
            else if (dataFromServer == "falseCF") {
                console.log("CF Response-False-wrongcode");
                show("errCF");
                return false;
            } 
            else if (dataFromServer == "trueRF") {
                console.log("THE END");
                show("success");
                return false;
            } 
            else if (dataFromServer == "falseRF") {
                console.log("FF Response-False-UNEXPECTED ERROR");
                show("FF");
                return false;
            } 
        }
    });
}

//Reset-From þifreyi görünür yapma fonksiyonu
function showPassword() {
    var x = document.getElementById("reset-pass");
    var y = document.getElementById("reset-pass-2");
    if (x.type === "password") {
        x.type = "text";
        y.type = "text";
    } else {
        x.type = "password";
        y.type = "password";
    }
}

//Timer Fonksiyonlarý
function onTimesUp() {
    clearInterval(timerInterval);

}

function startTimer() {
    timerInterval = setInterval(() => {
        timePassed = timePassed += 1;
        timeLeft = TIME_LIMIT - timePassed;
        document.getElementById("base-timer-label").innerHTML = formatTime(
            timeLeft
        );
        setCircleDasharray();
        setRemainingPathColor(timeLeft);

        if (timeLeft === 0) {
            onTimesUp();
        }
    }, 1000);
}

function resetTimer() {
    onTimesUp();
    timePassed = 0;
    timeLeft = TIME_LIMIT;
    timerInterval = null;
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;

    if (seconds < 10) {
        seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
}

function setRemainingPathColor(timeLeft) {
    const { alert, warning, info } = COLOR_CODES;
    if (timeLeft <= alert.threshold) {
        document
            .getElementById("base-timer-path-remaining")
            .classList.remove(warning.color);
        document
            .getElementById("base-timer-path-remaining")
            .classList.add(alert.color);
    } else if (timeLeft <= warning.threshold) {
        document
            .getElementById("base-timer-path-remaining")
            .classList.remove(info.color);
        document
            .getElementById("base-timer-path-remaining")
            .classList.add(warning.color);
    }
}

function calculateTimeFraction() {
    const rawTimeFraction = timeLeft / TIME_LIMIT;
    return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
    const circleDasharray = `${(
        calculateTimeFraction() * FULL_DASH_ARRAY
    ).toFixed(0)} 283`;
    document
        .getElementById("base-timer-path-remaining")
        .setAttribute("stroke-dasharray", circleDasharray);
}