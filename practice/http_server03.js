require('dotenv').config();
//require('dotenv').config({path: 'C:\\Users\\庭瑄\\Desktop\\mfee19-node\\.env'});可以曾加路徑
//載入.env的設定，如果要指定設定檔的位置config({path: 'C:\\Users\\庭瑄\\Desktop\\mfee19-node\\.env'})
console.log(require('dotenv').config());

const http = require('http');

const server = http.createServer((req, res)=>{
    res.writeHead(200, {
        'Content-Type': 'text/html'
    })
    res.end(`<p>PORT: ${process.env.PORT}</p>`);
});

console.log(`PORT: ${process.env.PORT}`);
server.listen(process.env.PORT );
console.log("website is on: http://localhost:3001/")