const express = require('express');
const db = require('./../modules/connect-mysql');
const upload = require('./../modules/upload-images');

const router = express.Router();

async function getListData(req, res){
    const perPage = 5;
    let page = parseInt(req.query.page) || 1;
    let keyword = req.query.keyword || '';
    keyword = keyword.trim(); // 去掉頭尾的空白

    // res.locals.keyword = keyword; // 傳給 template

    const output = {

    };

    let where = " WHERE 1 ";
    if(keyword){
        output.keyword = keyword;
        where += ` AND \`name\` LIKE ${ db.escape('%' + keyword + '%') } `;
    }


    const t_sql = `SELECT COUNT(1) totalRows FROM customers ${where}`;
    const [[{totalRows}]] = await db.query(t_sql);
    output.totalRows = totalRows;
    output.totalPages = Math.ceil(totalRows/perPage);
    output.perPage = perPage;
    output.rows = [];
    output.page = page;

    // 如果有資料才去取得分頁的資料
    if(totalRows > 0){
        if(page < 1){
            output.redirect = '?page=1';
            return output;
        }
        if(page > output.totalPages){
            output.redirect = '?page=' + output.totalPages;
            return output;
        }

        const sql = `SELECT * FROM \`customers\` ${where} ORDER BY sid DESC LIMIT ${(page-1)*perPage}, ${perPage}`;
        const [rows] = await db.query(sql)
        output.rows = rows;

    }
    return output;
}

router.getListData = getListData; // 將 function 掛在 router 物件上做匯出

router.get('/', (req, res)=>{
    res.render('customers/main');
});

router.get('/list', async (req, res)=>{
    res.locals.pageName = 'customers-list';


    const output = await getListData(req, res);
    if(output.redirect){
        return res.redirect(output.redirect)
    }
    res.render('customers/list', output);
});


router.get('/api/list', async (req, res)=>{
    const output = await getListData(req, res);
    res.json(output);
});


router.delete('/delete/:sid([0-9]+)', async (req, res)=>{
    const sql = "DELETE FROM customers WHERE sid=?";

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
        // res.json(req.body);
        // TODO: 欄位檢查
        const output = {
            success: false,
            postData: req.body,
        }
        
        //傳統寫法
        // const sql = "INSERT INTO `customers`(" +
        //     "`name`, `email`, `mobile`, `birthday`, `address`, `created_at`) VALUES (?, ?, ?, ?, ?, NOW())";
        //
        // const [result] = await db.query(sql, [
        //     req.body.name,
        //     req.body.email,
        //     req.body.mobile,
        //     req.body.birthday,
        //     req.body.address,
        // ]);

        const input = {...req.body, created_at: new Date()};
        const sql = "INSERT INTO `customers` SET ?";
        let result = {};
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


router.route('/edit/:sid')
    .get(async (req, res)=>{
        const sql = "SELECT * FROM customers WHERE sid=?";
        const [rs] = await db.query(sql, [req.params.sid]);

        if(rs.length){
            res.render('customers/edit', {row: rs[0]});
        } else {
            res.redirect('/customers/list');
        }
    })
    .post(async (req, res)=>{
        // TODO: 欄位檢查
        const output = {
            success: false,
            postData: req.body,
        }

        const input = {...req.body};
        const sql = "UPDATE `customers` SET ? WHERE sid=?";
        let result = {};
        // 處理修改資料時可能的錯誤
        try {
            [result] = await db.query(sql, [input, req.params.sid]);
        } catch(ex){
            output.error = ex.toString();
        }
        output.result = result;
        if(result.affectedRows===1){
            if(result.changedRows===1){
                output.success = true;
            } else {
                output.error = '資料沒有變更';
            }
        }

        res.json(output);
    });


module.exports = router;