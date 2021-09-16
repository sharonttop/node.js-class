require('dotenv').config(); // 載入 .env 的設定

const express = require('express');

const multer = require('multer');//檔案上傳功能，但不是很常用
const upload = multer({dest:'tmp_uploads/'})
const uploadImg = require('./modules/upload-images')

const session = require('express-session')
const jwt = require('jsonwebtoken');
const MysqlStore = require('express-mysql-session')(session);//用來記錄用戶的session到資料表

const fs = require('fs').promises;
const cors = require('cors');

const moment = require("moment-timezone")

const db = require('./modules/connect-mysql');
const sessionStore= new MysqlStore({},db);

const app = express();

app.set('view engine','ejs');

const corsOptions = {
    credentials: true,
    origin: (origin, cb)=>{
       console.log(`origin: ${origin}`);
       cb(null, true);
    }
};
app.use( cors(corsOptions) );
// app.use(cors());//如果放到後面，必須放在靜態資料夾之前，同樣是use還是會有優先順序的問題。Access-Control-Allow-Origin: *會全開。

app.use(session({
    name:'mySessionID',//可以修改Application的cookie原本的name(原為connect.sid)，也可以不用改
    saveUninitialized:false,
    resave:false,//強制回存
    store: sessionStore,//session存放資料cookie的位置，2021 09 10 09 01 20 00:30:03
    secret:"erw3r3243243wr2323tewr",//key字串隨便設定，加密用設定
    cookie:{
        maxAge:1200000,//最多停留20分鐘，單位毫秒
    }
}));

//Toplevel-middleware

//設定為false代表不使用qs套件，處理大量資料才需要使用
app.use( express.urlencoded({extended: false}) );

app.use(express.json());

const urlencodedParser = express.urlencoded({extended: false});

//app.use()的方法代表所有方法都可以進來，和app.get()post()只接受他們方法不同
app.use(express.static('public'));
//如果在好幾層資料夾裡可以用app.use(express.static(__dirname+'/public'));
app.use('/jquery', express.static('node_modules/jquery/dist'));
app.use('/bootstrap', express.static('node_modules/bootstrap/dist'));

//順序放在靜態的前面--------------------
//自己定義middleware，app開頭的都是middleware有些不會往下傳遞，也有有加next()為會往下傳遞的middleware。
//2021 09 09 09 01 34 00:27:40
app.use(async (req,res,next)=>{
    res.locals.title = '小新的網站';//頂層的middleware
    res.locals.pageName = '';
    res.locals.keyword = '';


    // 設定template 的helper functions ，建立一個全站都可用的middleware)01:01:00
    res.locals.dateToDateString = d =>moment(d).format('YYYY-MM-DD');
    res.locals.dateToDateTimeString = d =>moment(d).format('YYYY-MM-DD HH:mm:ss');
    // const fm = 'YYYY-MM-DD HH:mm:ss';

    res.locals.session = req.session; //把session的資料傳到ejs


    // jwt 驗證  2021 09 15 15 50 29  00:42:10
    //用token就算domain(主機)不同也可抓到，session如果不同domain可能抓不到值
    req.myAuth = null;  // 自訂的屬性 myAuth
    const auth = req.get('Authorization');//抓到token
    if(auth && auth.indexOf('Bearer ')===0){
        //選取有Authorization，且用indexOf找內有含Bearer的部分符合才往下找
        const token = auth.slice(7);
        //抓header的Authorization:Bearer 往後為加密token...因此要從第七個空格(Bearer )以後開始取token的值
        try{
            req.myAuth = await jwt.verify(token, process.env.JWT_SECRET);//解密
            console.log('req.myAuth:', req.myAuth);
        } catch(ex) {
            console.log('jwt-ex:', ex);
        }
    }

    next();
})

// *** 路由定義開始 :BEGIN
app.get('/', (req, res)=>{
    res.locals.title ="首頁-"+ res.locals.title;
    // res.send(`<h2>Hello</h2>`);
    res.render('home',{name: 'Sharon'})
});

app.get('/json-sales',(req,res)=>{
    res.locals.pageName = 'json-sales';
    const sales = require('./data/sales');//require過的不會再require，若修改/data/sales原始檔nodemon不會重新載入更新版。
    // console.log(sales);
    // res.json(sales);把客戶端資料轉成json格式
    res.render('json-sales',{sales});
})

app.get('/try-qs',(req,res)=>{
    res.json(req.query);//在url上使用req.query，url後加?a=1 & b=1
});


app.get('/try-post-form',urlencodedParser,(req,res)=>{
    res.render('try-post-form',{email:'',password:''});
});


app.post('/try-post-form',urlencodedParser,(req,res)=>{
    
    res.render('try-post-form',req.body);
});

//上傳單一檔案single
app.post('/try-upload',upload.single('avatar'),async (req,res)=>{
    if(req.file && req.file.mimetype==='image/jpeg'){
        try{
            await fs.rename(req.file.path, __dirname + '/public/img/' + req.file.originalname);
            return res.json({success:true ,filename: req.file.originalname});
        } catch(ex){
            //ex=except(error)
            res.json({success:false,error:'無法存檔'});
        }
        } else {
            await fs.unlink(req.file.path);//刪除暫存檔案
            res.json({success:false,error:'格式不對'});
            //當圖檔不為image/jpeg
        }


})

app.post('/try-upload2',uploadImg.single('avatar'),async (req,res)=>{
    res.json(req.file);
    //單一檔案上傳，圖片名稱暗碼
        
})

app.post('/try-upload3',uploadImg.array('photo',10),async (req,res)=>{
    res.json(req.files);
        //上傳10張以內照片
})


app.get('/my-params1/:action?/:id(\\d+)?',(req,res)=>{
    //第一個倒斜線為第一次跳脫
    //跳脫表示法\\d+用來限制輸入只能為數字，id([0-9]+)限制為0~9
    //加?代表選擇性，可填可不填，拿到的值一定都是字串
    res.json(req.params);
    //做分頁querystring比較有彈性
})

app.get(/^\/m\/09\d{2}-?\d{3}-?\d{3}$/i,(req,res)=>{
    //跳脫掉其他字元
    let u = req.url.split('?')[0];
    u = u.slice(3);
    u = u.split('-').join('');

    res.json({
        url:req.url,
        mobile:u
    });
})

//路由模組化-middleware，拆開來到別的檔案方便管理，app和router的差別 2021 09 09 09 01 34 00:11:30
app.use(require('./routes/admin2'));//沒加路徑相當於app.use('/',require('./routes/admin2'));
app.use('/', require('./routes/login'));

app.use('/admin3', require('./routes/admin3'));//一定要符合/admin3才會進到routes，當更新版本要換路徑時直接修改會比較方便，
app.use('/customers', require('./routes/customers'));




app.get('/try-sess', (req, res)=>{
    //myVar自己設定自己取
    req.session.myVar = req.session.myVar || 0;
    req.session.myVar++;

    res.json(req.session);
});


app.get('/try-moment', (req, res)=>{
    const fm = 'YYYY-MM-DD HH:mm:ss';
    //2021-09-10T01:06:30.937Z  TZ為標準時間

    res.json({
        m1: moment().format(fm),
        m2: moment().tz('Europe/Berlin').format(fm),
        m3: moment().tz('Asia/Tokyo').format(fm),
    });
});

app.get('/try-db', async (req, res)=>{
    const [r] = await db.query("SELECT * FROM customers WHERE `name` LIKE ?", ['%小%']);

    res.json(r);

});

// *** 路由定義結束 :END

app.use((req, res)=>{
    res.status(404).send(`<h1>找不到頁面</h1>`)
})

let port = process.env.PORT || 3000;
const node_env = process.env.NODE_ENV ||'development';
app.listen(port, ()=>{
    console.log(`NODE_ENV: ${node_env}`);
    console.log(`啟動: ${port}`, new Date());
});