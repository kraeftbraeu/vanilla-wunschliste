const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if(req.url.startsWith('/login.json')) {
    console.log('  valid request: ' + req.url);
    res.end('{"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJodHRwczpcL1wvbWs0LWEuc3J2LnNpeGhvcC5uZXQiLCJpYXQiOjE1NzAxOTIwMjIsImV4cCI6MTU3MDE5NTYyMiwidV9pZCI6IjciLCJ1X25hbWUiOiJNYW51ZWwiLCJ1X2FkbSI6IlkifQ.wklnkzabEidRYQaszyM_m08s3hlquMFoQqezD92HKolmN5TRDrPzEmWUED4HG8jwsomD6dysLKuvtJXXF1IGUw"}');
  } else if(req.method === 'GET' && req.url === '/?path=wish/w_user/7') {
    res.end('{"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJodHRwczpcL1wvbWs0LWEuc3J2LnNpeGhvcC5uZXQiLCJpYXQiOjE1NzE3NTE5NzUsImV4cCI6MTU3MTc1NTU3NSwidV9pZCI6IjciLCJ1X25hbWUiOiJNYW51ZWwiLCJ1X2FkbSI6IlkifQ.be1pIHNL9pik7OPZFPgPxtBbWIT0-BcZaZyx4DiN-mFPiVoGm1kuULaoaVCsNkRtiX9prhwJoBtnO9fSOMUmVg","content":[{"w_id":"109","w_user":"7","w_descr":"ISpindel f\u00fcr die Kontrolle der Bierg\u00e4rung","w_link":"https:\/\/www.3d-mechatronics.de\/de\/ispindel-diy-set-2600mah_151.html"},{"w_id":"111","w_user":"7","w_descr":"Bluetooth Kopfh\u00f6rer","w_link":"https:\/\/www.amazon.de\/JBL-Kabelloser-Integrierter-Musiksteuerung-Kompatibel-Schwarz\/dp\/B01M6WNWR6\/ref=sr_1_3?ie=UTF8&qid=1542487175&sr=8-3"}]}');
  } else if(req.method === 'GET' && req.url === '/?path=present/p_wisher/7') {
  res.end('{"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJodHRwczpcL1wvbWs0LWEuc3J2LnNpeGhvcC5uZXQiLCJpYXQiOjE1NzE3NTE5NzUsImV4cCI6MTU3MTc1NTU3NSwidV9pZCI6IjciLCJ1X25hbWUiOiJNYW51ZWwiLCJ1X2FkbSI6IlkifQ.be1pIHNL9pik7OPZFPgPxtBbWIT0-BcZaZyx4DiN-mFPiVoGm1kuULaoaVCsNkRtiX9prhwJoBtnO9fSOMUmVg","content":[{"p_id":"4","p_wisher":"7","p_giver":"2","p_wish":"109","p_pdescr":"ISpindel f\u00fcr die Kontrolle der Bierg\u00e4rung","p_plink":"https:\/\/www.3d-mechatronics.de\/de\/ispindel-diy-set-2600mah_151.html"},{"p_id":"35","p_wisher":"7","p_giver":"5","p_wish":"111","p_pdescr":"Bluetooth Kopfh\u00f6rer","p_plink":"https:\/\/www.amazon.de\/JBL-Kabelloser-Integrierter-Musiksteuerung-Kompatibel-Schwarz\/dp\/B01M6WNWR6\/ref=sr_1_3?ie=UTF8&qid=1542487175&sr=8-3"}]}');
  } else if(req.method === 'POST' && req.url.startsWith('/?path=wish')) {
    res.end('{"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJodHRwczpcL1wvbWs0LWEuc3J2LnNpeGhvcC5uZXQiLCJpYXQiOjE1NzE4MjMzMzYsImV4cCI6MTU3MTgyNjkzNiwidV9pZCI6IjciLCJ1X25hbWUiOiJNYW51ZWwiLCJ1X2FkbSI6IlkifQ.2n50i8BBiBZy9cfKZPl3g-ADUfzY6RILOiAUC8-PvMO33OMVWgdCnWvXVhJDXiKBm-v1l-ZA3p3uewi9LQz2Mg","content":109}');
  } else {
    console.error('invalid request: ' + req.url);
    res.end('{"result":"invalid"}');
  }
  
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});