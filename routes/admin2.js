const express = require('express');
//路由模組化，middleware

const router = express.Router();

router.get('/admin2/:p1?/:p2?',(req,res)=>{
    res.json({
        params:req.params,
        url: req.url,
        baseUrl: req.baseUrl,//沒有baseUrl，admin3才有
        originalUrl: req.originalUrl,
    })
});

module.exports = router;