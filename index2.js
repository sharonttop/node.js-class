//ES5的寫法
//react 是ES6寫法從某處 import 近來
const express = require('express')
const app = express()
 
// Server Side Render (SSR)

//Single Page Application(SPA)
//Middle Ware 中介軟體-做一些進入網頁前的前置處理 ex:cors
//body parse

app.get('/', function (req, res) {
  res.send('Hello World')
})
app.get('/product', function (req, res) {
  res.send('Product Page');
})

//用POST傳跟用GET傳可以寫兩個
app.get('/member', function (req, res) {
  res.send('Member Page')
})

app.post('/member', function (req, res) {
  //從req拿帳號、密碼，拿到後再去資料庫SQL搜尋，如果有資料代表登入成功。
  res.send('Member Page')
})
//專門去拿public資料夾裡面的檔案

//404 not found

app.listen(3000);
console.log("website is on: http://localhost:3000/")