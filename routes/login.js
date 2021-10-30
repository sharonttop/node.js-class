const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('../modules/connect-mysql');
const upload = require('../modules/upload-images');

const { getListData } = require('./customers');

const router = express.Router();

// 登入
router.get('/login', (req, res)=>{
    res.locals.pageName = 'login';
    res.render('login');
});
router.post('/login', async (req, res)=>{

    // TODO: 欄位檢查

    const [rs] = await db.query("SELECT * FROM members WHERE `email`=?", [req.body.email]);//搜尋的時候不區分大小寫所以在此不用轉換

    if(!rs.length){
        // 帳號錯誤
        return res.json({success: false});
    }

    const success = await bcrypt.compare(req.body.password, rs[0].password);
    if(success){
        const {id, email, nickname} = rs[0];//rs[0]，回傳一筆，第一筆
        req.session.member = {id, email, nickname};//session裡面會記錄登入的資料
    }

    res.json({success});
});

// 註冊
router.get('/register', (req, res)=>{
    res.locals.pageName = 'register';
    res.render('register');
});
router.post('/register', async (req, res)=>{
    const output = {
        success: false,
        postData: req.body,
        error: ''
    };
    // TODO: 欄位檢查
    

    const hash = await bcrypt.hash(req.body.password, 10);

    //SELECT `id`, `avatar`, `name`, `nickname`, `email`, `password`, `mobile`, `birthday`, `address`, `hash`, `activated`, `create_at`, `coupon_signup`(註冊預設空值，設定為datetime), `coupon_petid`(註冊呈現空值，登入寵物id時給一個日期), FROM `members` WHERE 1

    const sql = "INSERT INTO `members`"+
    "(`avatar`, `name`, `nickname`, `email`, `password`, `mobile`, `birthday`, `address`,`create_at`)" + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";

    let result;//在外面使用時，一定要加
    try {
        [result] = await db.query(sql, [
            req.body.avatar,
            req.body.name,
            req.body.nickname,
            req.body.email.toLowerCase().trim(),//Email不區分大小寫。//9/15 01:11:00
            hash,// 注意hash加密
            req.body.mobile,
            req.body.birthday,
            req.body.address,
        ]);

        if(result.affectedRows===1){
            output.success = true;
        } else {
            output.error = '無法新增會員';
        }
    } catch(ex){
        console.log(ex);
        output.error = 'Email 已被使用過';
    }

    res.json(output);
});
//Email 重複檢查
router.get('/account-check', async (req, res)=>{
    const sql = "SELECT 1 FROM members WHERE `email`=?";
    const [rs] = await db.query(sql, [req.query.email ]);
    res.json({used: !!rs.length });
});

// 登出
router.get('/logout', (req, res)=>{
    delete req.session.member;//刪掉的是member
    //可以增加一個網站管理者用戶admin
    res.redirect('/');
});


router.post('/login-jwt', async (req, res)=>{
    const output = {
        success: false,
        token: null,
    };
    // TODO: 欄位檢查

    const [rs] = await db.query("SELECT * FROM members WHERE `email`=?", [req.body.email]);

    if(!rs.length){
        // 帳號錯誤
        return res.json({success: false});
    }

    const success = await bcrypt.compare(req.body.password, rs[0].password);
    if(success){
        const {id, email, nickname} = rs[0];

        output.success = true;
        output.member = {id, email, nickname};
        output.token = await jwt.sign({id, email, nickname}, process.env.JWT_SECRET);

        req.session.member = {id, email, nickname};//session裡面
    }
    res.json(output);
});

router.get('/get-data-jwt',async (req, res)=>{
    /*const data = await getListData(req, res);第一步測試有沒有抓到資料
     res.json(data); */ 
    //2021 09 15 15 50 29 00:26:00
    const output = {
        success: false,
        data: null
    }
    //單獨for get-data-jwt 的 jwt驗，如果有其他功能也要經過jwt驗證，就必須在每個檔案裡都掛以下的資料，所以也可以放在主程式的middleware。
    // try{
    //    output.member = decoded; //若要拿用戶資料就必須去decoded拿取
    //    output.success = true;
    //    output.data = await getListData(req, res);
    // }catch(ex){
    //     output.error = 'token 錯誤'
    // }

    //未更改10/28以前原來的範例
    // 判斷有沒有通過 jwt 驗證  2021 09 15 15 50 29 00:40:48
    // if(req.myAuth && req.myAuth.id){
    //     output.member = req.myAuth;
    //     output.success = true;
    //     output.data = await getListData(req, res);
    // } else {
    //     output.error = '沒有 token 或者 token 不合法';
    // }
    //----------
    
    if(req.myAuth && req.myAuth.id){
        output.member = req.myAuth;
        output.success = true;

    } else {
        output.error = '沒有 token 或者 token 不合法';
    }
    
    res.json(output);
});
//變更密碼-----------------------
// router.get('/password-change', async (req, res)=>{
//     const output = {
//         success: false,
//         postData: req.body,
//         error: ''
//     };
//     //檢查有無登入
//     if(req.myAuth && req.myAuth.id){
//         output.member = req.myAuth;
//         output.success = true;
//         // output.member = {id, email, nickname};

//     } else {
//         output.error = '沒有 token 或者 token 不合法';
//     }

//     const sql = "SELECT * FROM `members` WHERE id=?";
//     const [r] = await db.query(sql, [req.myAuth.id]);
//     res.json(r[0] ? r[0] : {});
   
//     //驗證舊密碼
//     const success = await bcrypt.compare(req.myAuth.password, r[0].password);
//     if(success){
//         // const {id, email, nickname} = rs[0];

//         output.success = true;
//         output.member = {id, email, nickname};
//         output.token = await jwt.sign({id, email, nickname}, process.env.JWT_SECRET);

//     }else {
//         output.error = '密碼錯誤';
//     }

//     res.json(output);
// });

router.put('/password-change', async (req, res)=>{
    const output = {
        success: false,
        postData: req.body,
        error: ''
    };
    //檢查有無登入
    if(req.myAuth && req.myAuth.id){
        output.member = req.myAuth;
    } else {
        output.error = '沒有 token 或者 token 不合法';
    }

    const sql = "SELECT * FROM `members` WHERE id=?";
    const [r] = await db.query(sql, [req.myAuth.id]);

    //驗證舊密碼
    const success = await bcrypt.compare(req.body.oldpassword, r[0].password);
    console.log('body========================')
    console.log(success)
    console.log('body========================')
    console.log([req.body.password] )
    console.log('r[]========================')
    console.log([r[0].password] )
    console.log('========================')


    if(success){

        const hash = await bcrypt.hash(req.body.password, 10);

        const sql = "UPDATE members SET `password`=? WHERE id=?";
    
        // const sql = "UPDATE `members`" + SET +
        // "(`password`)" + "VALUES (?)";
    
        let result;//在外面使用時，一定要加
        try {

            [result] = await db.query(sql, [req.body.password,
                hash,// 注意hash加密
            ]);

            console.log([result]);

            if(result.affectedRows===1){
                output.success = true;
            } else {
                output.error = '密碼變更失敗';
            }
        } catch(ex){
            console.log(ex);
            output.error = '';
        }

    }else {
        output.error = '密碼錯誤';
    }

    res.json(output);
});

module.exports = router;