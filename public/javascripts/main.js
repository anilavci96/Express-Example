//Döküman Yüklenince Forgot Form açýlýr ve Captcha oluþturulur.
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
    //Forgot formdaki gönder butonuna basýnca bu fonksiyon devreye girer.
    $('#forgotButton').click(function (e) {
        e.preventDefault();
        //bilgileri alma
        inputCaptcha = document.getElementById("captchaTextBox").value;
        tckn = document.getElementById("inputTCKN").value;
        email = document.getElementById("inputEmail").value;

        //Captcha, tckn ve email doðrulama iþlemleri yapýlýr.
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

    //confirm formdaki gönder butonuna basýnca bu fonksiyon devreye girer.
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

    //reset formdaki gönder butonuna basýnca bu fonksiyon devreye girer.
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

    //Confirm formunda bir hata meydana geldiðinde çýkan hata ekranýndaki, GERÝ DÖN butonunun fonksiyonu.
    $('#toFFButton').click(function (e) { //CF iþleminde hata alýnýrsa FF iþlemine gönderen buton.
        e.preventDefault();
        show("FF");
    });

    //Ýþlem tamamlandýðý zaman, kullanýcýnýn programýn ana sayfasýna dönmesini saðlayan buton.
    $('#successButton').click(function (e) {
        e.preventDefault();
        //ANA SAYFAYA DÖNME ÝÞLEMÝ BURADA YAPILACAK
    });

});