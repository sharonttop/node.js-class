const express = require('express');
const db = require('../modules/connect-mysql');
const upload = require('../modules/upload-images');

const router = express.Router();



router.get('/',(req,res)=>{
    res.render('customers/main')
});
router.get('/list',async (req,res)=>{
    res.locals.pageName = 'customers-list';
    
    const perPage = 5;
    let page = parseInt(req.query.page) ||1;
    let keyword = req.query.keyword || '';

    res.locals.keyword = keyword;//傳給template

    const output = {
     
    };
    // 測試有沒有連線上 2021 09 10 10 10 47 00:31:18
    // const t_sql = "SELECT COUNT(1) totalRows FROM customers";
    // const[r1]= await db.query(t_sql);
    // output.r1 = r1;
    /*回傳值為 {
        "r1" : [
            {
                "totalRows":117
            }
        ]
    }*/
    //要取的值為"totalRows":117，因此要將陣列arry撥開三層。第一層為r1，在撥開一層[]取裡面的obj{}
    //const[[{totalRows}]]= await db.query(t_sql); 
    //output.totalRows = totalRows;
    /*回傳值為 
            {
                "totalRows":117
            }
    */
    let where = "WHERE 1";
    if(keyword){
        where += `AND \`name\` LIKE ${db.escape('%' + keyword + '%')} `;
        //escape可以幫忙做跳脫
    }

    const t_sql = `SELECT COUNT(1) totalRows FROM customers ${where}`;
    const [[{totalRows}]] = await db.query(t_sql);
    output.totalRows = totalRows;
    output.totalPages = Math.ceil(totalRows/perPage);//2021 09 10 10 10 47 00:39:56
    output.perPage = perPage;
    output.rows = [];
    output.page = page;

    //如果有資料才去取得分業的資料
    if(totalRows > 0){
        if(page < 1){
            return res.redirect('?page=1');
            //res.redirect([status,] path)
            // status：{Number}，表示要设置的HTTP状态码
            // path：{String}，要设置到Location头中的URL

        }
        if(page > output.totalPages){
            return res.redirect('?page=' + output.totalPages);
        }

        const sql = `SELECT * FROM \`customers\` ${where} ORDER BY sid DESC LIMIT ${(page-1)*perPage}, ${perPage}`;
        // \`customers\` 跳脫字元
        const [rows] = await db.query(sql)
        output.rows = rows;

    }

    // res.json(output);
    res.render('customers/list',output);

});


router.delete('/delete/:sid([0-9]+)', async (req, res)=>{
    const sql = "DELETE FROM customers WHERE sid=?";
    //[r]拿到的不是資料集
    const [r] = await db.query(sql, [req.params.sid]);
    console.log({r});
    res.json(r);
});


router.route('/add')
    .get(async (req, res)=>{
        res.locals.pageName = 'customers-add';
        res.render('customers/add');
    })
    .post(async (req, res)=>{
        // TODO: 欄位檢查
        const output = {
            success: false,
        }
        //跟前台欄位順序沒有關西。
        const sql = "INSERT INTO `customers`(" +
            "`name`, `email`, `mobile`, `birthday`, `address`, `created_at`) VALUES (?, ?, ?, ?, ?, NOW())";
        
        const [result] = await db.query(sql, [
            req.body.name,
            req.body.email,
            req.body.mobile,
            req.body.birthday,
            req.body.address,
        ]);

        //一定要依照前台欄位順序必填欄位都要有，全部欄位都必須要有才會成功，比較簡單但失敗機率大
        // const input = {...req.body, created_at: new Date()};
        // const sql = "INSERT INTO `customers` SET ?";
        // let result = {};
        // 處理新增資料時可能的錯誤
        try {
            [result] = await db.query(sql, [input]);
        } catch(ex){
            output.error = ex.toString();
        }
        output.result = result;
        if(result.affectedRows && result.insertId){
            output.success = true;
        }

        console.log({result});
        /*
        {
          result: ResultSetHeader {
            fieldCount: 0,
            affectedRows: 1,
            insertId: 148,
            info: '',
            serverStatus: 2,
            warningStatus: 0
          }
        }
         */

        res.json(output);
    });

    // router.route('/edit/:sid')
    // .get(async (req, res)=>{
    //     const sql = "SELECT * FROM customers WHERE sid=?";
    //     const [rs] = await db.query(sql, [req.params.sid]);

    //     if(rs.length){
    //         res.render('customers/edit', {row: rs[0]});
    //     } else {
    //         res.redirect('/customers/list');
    //     }
    // })
    // .post(async (req, res)=>{
    //     // TODO: 欄位檢查
    //     const output = {
    //         success: false,
    //         postData: req.body,
    //     }

    //     const input = {...req.body};
    //     const sql = "UPDATE `customers` SET ? WHERE sid=?";
    //     let result = {};
    //     // 處理修改資料時可能的錯誤
    //     try {
    //         [result] = await db.query(sql, [input, req.params.sid]);
    //     } catch(ex){
    //         output.error = ex.toString();
    //     }
    //     output.result = result;
    //     if(result.affectedRows===1){
    //         if(result.changedRows===1){
    //             output.success = true;
    //         } else {
    //             output.error = '資料沒有變更';
    //         }
    //     }

    //     res.json(output);
    // });




module.exports = router;