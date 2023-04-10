'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = require('express')();
var http = require('http').Server(app);
var nodemailer = require('nodemailer');
const session = require('express-session');
var speakeasy = require("speakeasy");
var port = 3000;

//SSL Sertifikasý olmadýðý için mail yollamak için kullanýlýyor. Daha sonra kaldýrýlmalýdýr.
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

app.use(session({
	secret: 'labenko'
}));

//Mail göndermek için kullanýlan hesabýn bilgileri
var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: '****',// Gönderen email adresi bilgileri güncellenmeli
		pass: '****'
	}
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//GLOBAL VARIABLES
var secret = speakeasy.generateSecret({ length: 20 });

app.get('/', function (req, res) {	
	res.sendFile(__dirname + '/views/index.html');
});

app.post('/form', function (req, res) {
	var email = req.body.email;
	var tckn = req.body.tckn;

	//Bu kýsýmda post isteðinden gelen bilgiler ve veri tabanýndaki kullancýlarýn bilgileri karþýlaþtýrýlacaktýr.
	var db_email = "****";
	var db_tckn = "****";

	if (tckn == db_tckn) {//TCKN kayýt kontrol

		if (email == db_email) {//Email kayýt kontrol

			//CODE GENERATION
			var confirmCode = speakeasy.totp({//step*window = geçerlilik süresi.
				secret: secret.base32,
				encoding: 'base32',
				algorithm: "sha256",
				step: 10, //step= Yeni token olusturma aralýðý. Saniye cinsinden deðer alýr. 10 ise 10 saniye sonra yeni þifre oluþturulur.
				window: 18 //window= Kaç tane token aralýðýna bakýlacak. Her yeni þifre 1 tane windowdur, eðer window 18 ise 18 tane þifre geçerli olacaktýr.
			});

			console.log("User: " + email + "  Generated Code: " + confirmCode);

			//SESSÝON  ile gerekli bilgileri saklama		
			req.session.email = email;
			req.session.TCKN = tckn;

			//Gönderilen mailin bilgilerinin girilmesi.
			var mailOptions = {
				from: '****@gmail.com',
				to: email,
				subject: 'LABENKO ONAY',
				text: 'Onay Kodu: ' + confirmCode + '  Sifrenizi degistirmek icin onay kodunu sisteme giriniz. Eger bu mail bilginiz dahilinde degil ise lutfen bizimle iletisime geciniz.'
			};

			//Mail gönderme fonksiyonu
			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					//console.log(error);
				} else {
					console.log('Email sent to: ' + email);
				}
			});

			//CF postuna gelen isteðin onaylamasý için aþaðýdaki deðiþkene atama yapýlýr.
			req.session.CFactive = true;
			req.session.save();//Sessionlara atama yaptýktan sonra kaydetmek gerekmektedir.

			res.send("trueFF")
		}
		else {
			res.send("false_email")
			console.log("Veritabanýnda böyle bir Email kaydi bulunamadý.");
		}
	}
	else {
		res.send("false_tckn")
		console.log("Veritabanýnda böyle bir TCKN kaydý bulunamadý.");
	}
});

app.post('/confirm', function (req, res) {
	if (req.session.CFactive == true) {// Bu deðiþken Forgot Postunda aktive olmuþsa bu kýsýma giriþ yapýlabilir.
		req.session.CFactive = false;
		var code = req.body.message;

		//Kullanýcýdan gelen kod ile token'in karþýlaþtýrýlmasý.
		var tokenValidates = speakeasy.totp.verifyDelta({//step= yeni token olusturma aralýðý. window=ne kadar token aralýðýna bakýlacak. step*window = geçerlilik süresi.
			secret: secret.base32,
			encoding: 'base32',
			algorithm: "sha256",
			token: code,
			step: 10,
			window: 18
		});

		//Karþýlaþtýrmadan çýkan sonucun iþlenmesi
		if (tokenValidates) {
			res.send("trueCF");
			req.session.RFactive = true;// RF isteðini onaylar.
			req.session.save();
		}
		else {
			res.send("falseCF");
			console.log("INVALID TOKEN");
			req.session.destroy();
		}
	}
});

app.post('/reset', function (req, res) {
	if (req.session.RFactive == true) {// Bu deðiþken Confirm Postunda aktive olmuþsa bu kýsýma giriþ yapýlabilir. 
		req.session.RFactive = false;
		var pass = req.body.message;
		console.log("User: " + req.session.email + " New Pass: " + pass);

		try {
			//VERÝTABANI UPDATE ÝÞLEMÝ YAPILACAK

			res.send("trueRF");

			//iþlem baþarýlý olarak sonuçlanýrsa session yok edilir.
			req.session.destroy();
		}
		catch{
			res.send("falseRF");
		}
	}
});


http.listen(port, function () {
	console.log('listening on port:' + port);
});
