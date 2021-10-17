const express = require('express');
// const db = require('../modules/connect-mysql');
const Product = require('./../models/Product');
const upload = require('../modules/upload-images');

const router = express.Router();

// 列表
router.get('/',async(req,res)=>{
    res.json(await Product.findAll(req.query));

});

// 讀取單筆
router.get('/:id', async(req, res)=>{
    const output = {
        //可以自己決定要設定哪些
        success: false,
        // status:'',
        // statusCode: 0,
        data:null,
    }
    //===直接把db require來的方法
    // const sql ="SELECT * FROM products WHERE sid=?";
    // const [rs] = await db.query(sql,[req.params.id])
    // if(rs && rs.length===1){
    //     output.success = true;
    //     output.data = rs[0]
    // }
    // res.json(output)


    //===將db分開放進models==========
    output.data = await Product.findOne(req.params.id);
     if(output.data){
        output.success = true;
    }
    res.json(output)
});

// 測試用
router.get('/test01/3',async (req, res) => {

    const p1 = await Product.findOne(3);
    p1.data.price *= 2;//直接修改價格乘2

    res.json(await p1.save());
} );

//TODO:管理的功能，以下需登入才能操作=================
// 新增
router.post('/', async (req, res) => {
    const p1 = new Product(req.body);
    res.json(await p1.save());
});

// 修改
router.put('/:id', async(req, res)=>{
    const output = {
        success: false,
        result: null,
    };
    const p1 = await Product.findOne(req.params.id);
    if(p1){
        output.success = true;
        output.result = await p1.edit(req.body);
    }
    res.json(output);
});

// 刪除
router.delete('/:id', async(req, res)=>{
    const output = {
        success: false,
        data:null,
    }
    const p1 = await Product.findOne(req.params.id);
    if(p1){
         return res.json(await p1.remove());
    }
    res.json({info: 'item not found!'});
});




module.exports = router;