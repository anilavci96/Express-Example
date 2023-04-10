//D�k�man Y�klenince Forgot Form a��l�r ve Captcha olu�turulur.
$(document).ready(function () {    
    show("FF");
    createCaptcha();
});
//GLOBAL VARIABLES
var captchaCode;
var inputCaptcha;
var tckn;
var email;
var code;
var pass;
$(function () {
    //Forgot formdaki g�nder butonuna bas�nca bu fonksiyon devreye girer.
    $('#forgotButton').click(function (e) {
        e.preventDefault();
        //bilgileri alma
        inputCaptcha = document.getElementById("captchaTextBox").value;
        tckn = document.getElementById("inputTCKN").value;
        email = document.getElementById("inputEmail").value;

        //Captcha, tckn ve email do�rulama i�lemleri yap�l�r.
        if (!verifyCaptcha(inputCaptcha)) {
            show("errFF_captcha");
            return false;
        }
        else if (!verifyTCKN(tckn)) {
            show("errFF_tckn");
            return false;
        }
        else if (!verifyEmail(email)) {
            show("errFF_email");
            return false;
        }
        else {
            send("FF");
        }
    });

    //confirm formdaki g�nder butonuna bas�nca bu fonksiyon devreye girer.
    $('#confirmButton').click(function (e) {
        e.preventDefault();

        code = document.getElementById("confirm-code").value;
        if (!verifyCode(code)) {
            show("errCF");
            return false;
        }
        else {
            send("CF");
        }
        
    });

    //reset formdaki g�nder butonuna bas�nca bu fonksiyon devreye girer.
    $('#resetButton').click(function (e) {
        e.preventDefault();
        pass = document.getElementById("reset-pass").value;
        var pass2 = document.getElementById("reset-pass-2").value;

        if (!verifyPassword(pass, pass2)) {
            show("errRF");
            return false;
        }
        else {
            send("RF");
        }      
        
    });

    //Confirm formunda bir hata meydana geldi�inde ��kan hata ekran�ndaki, GER� D�N butonunun fonksiyonu.
    $('#toFFButton').click(function (e) { //CF i�leminde hata al�n�rsa FF i�lemine g�nderen buton.
        e.preventDefault();
        show("FF");
    });

    //��lem tamamland��� zaman, kullan�c�n�n program�n ana sayfas�na d�nmesini sa�layan buton.
    $('#successButton').click(function (e) {
        e.preventDefault();
        //ANA SAYFAYA D�NME ��LEM� BURADA YAPILACAK
    });

});