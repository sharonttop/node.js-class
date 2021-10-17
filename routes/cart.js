const express = require('express');
// const db = require('../modules/connect-mysql');
const Cart = require('./../models/Cart');
const upload = require('../modules/upload-images');

const router = express.Router();

//TODO:管理的功能，以下需登入才能操作=================
router.use((req, res, next) => {
    if(req.myAuth && req.myAuth.id){
        next();
    } else {
        res.json({success:false, error:'沒有 token 或者 token 不合法'});
    }
    //通過驗證才能進行下去
    //先透過postman確認有無抓到資料，用get方式/cart，並且在Headers增加Authorization項目"Bearer + 拷貝登入的token"看有沒通過驗證。

})
// 讀取購物車清單
router.get('/', async (req, res) => {
    res.json({info: 'ok'});
});

// 新增項目
router.post('/', async (req, res) => {
    // req.body.product_id
    // req.body.quantity
    res.json( await Cart.add(req.myAuth.id, req.body.product_id,req.body.quantity));
});


// 刪除項目
router.delete('/:id', async(req, res)=>{
    res.json( await Cart.update(req.myAuth.id, req.body.product_id,req.body.quantity));

});


module.exports = router;