//簡易web server
const http = require('http');

const server = http.createServer((req,res)=>{
    res.writeHead(200, {'Content-Type': 'text/html'})
    //statusCode:200，自己設定
    //'Content-Type':'text/plain' 純文字
    res.end(`<h1>hola,${req.url}</h1>`)

});

server.listen(3000);
console.log("website is on: http://localhost:3000/")