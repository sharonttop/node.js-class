const express = require('express');

const router = express.Router();
//middleware也可寫在Router

router.get('/:p3?/:p4?', (req, res)=>{
    res.json({
        params: req.params,
        url: req.url,
        baseUrl: req.baseUrl,
        originalUrl: req.originalUrl,
    });
});
module.exports = router;