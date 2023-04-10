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

//SSL Sertifikas� olmad��� i�in mail yollamak i�in kullan�l�yor. Daha sonra kald�r�lmal�d�r.
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

app.use(session({
	secret: 'labenko'
}));

//Mail g�ndermek i�in kullan�lan hesab�n bilgileri
var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: '****',// G�nderen email adresi bilgileri g�ncellenmeli
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

	//Bu k�s�mda post iste�inden gelen bilgiler ve veri taban�ndaki kullanc�lar�n bilgileri kar��la�t�r�lacakt�r.
	var db_email = "****";
	var db_tckn = "****";

	if (tckn == db_tckn) {//TCKN kay�t kontrol

		if (email == db_email) {//Email kay�t kontrol

			//CODE GENERATION
			var confirmCode = speakeasy.totp({//step*window = ge�erlilik s�resi.
				secret: secret.base32,
				encoding: 'base32',
				algorithm: "sha256",
				step: 10, //step= Yeni token olusturma aral���. Saniye cinsinden de�er al�r. 10 ise 10 saniye sonra yeni �ifre olu�turulur.
				window: 18 //window= Ka� tane token aral���na bak�lacak. Her yeni �ifre 1 tane windowdur, e�er window 18 ise 18 tane �ifre ge�erli olacakt�r.
			});

			console.log("User: " + email + "  Generated Code: " + confirmCode);

			//SESS�ON  ile gerekli bilgileri saklama		
			req.session.email = email;
			req.session.TCKN = tckn;

			//G�nderilen mailin bilgilerinin girilmesi.
			var mailOptions = {
				from: '****@gmail.com',
				to: email,
				subject: 'LABENKO ONAY',
				text: 'Onay Kodu: ' + confirmCode + '  Sifrenizi degistirmek icin onay kodunu sisteme giriniz. Eger bu mail bilginiz dahilinde degil ise lutfen bizimle iletisime geciniz.'
			};

			//Mail g�nderme fonksiyonu
			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					//console.log(error);
				} else {
					console.log('Email sent to: ' + email);
				}
			});

			//CF postuna gelen iste�in onaylamas� i�in a�a��daki de�i�kene atama yap�l�r.
			req.session.CFactive = true;
			req.session.save();//Sessionlara atama yapt�ktan sonra kaydetmek gerekmektedir.

			res.send("trueFF")
		}
		else {
			res.send("false_email")
			console.log("Veritaban�nda b�yle bir Email kaydi bulunamad�.");
		}
	}
	else {
		res.send("false_tckn")
		console.log("Veritaban�nda b�yle bir TCKN kayd� bulunamad�.");
	}
});

app.post('/confirm', function (req, res) {
	if (req.session.CFactive == true) {// Bu de�i�ken Forgot Postunda aktive olmu�sa bu k�s�ma giri� yap�labilir.
		req.session.CFactive = false;
		var code = req.body.message;

		//Kullan�c�dan gelen kod ile token'in kar��la�t�r�lmas�.
		var tokenValidates = speakeasy.totp.verifyDelta({//step= yeni token olusturma aral���. window=ne kadar token aral���na bak�lacak. step*window = ge�erlilik s�resi.
			secret: secret.base32,
			encoding: 'base32',
			algorithm: "sha256",
			token: code,
			step: 10,
			window: 18
		});

		//Kar��la�t�rmadan ��kan sonucun i�lenmesi
		if (tokenValidates) {
			res.send("trueCF");
			req.session.RFactive = true;// RF iste�ini onaylar.
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
	if (req.session.RFactive == true) {// Bu de�i�ken Confirm Postunda aktive olmu�sa bu k�s�ma giri� yap�labilir. 
		req.session.RFactive = false;
		var pass = req.body.message;
		console.log("User: " + req.session.email + " New Pass: " + pass);

		try {
			//VER�TABANI UPDATE ��LEM� YAPILACAK

			res.send("trueRF");

			//i�lem ba�ar�l� olarak sonu�lan�rsa session yok edilir.
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
