const bcrypt = require('bcryptjs');
const db = require('../modules/connect-mysql');



    const output = {
        success: false,
        postData: req.body,
        error: ''
    };
    // TODO: 欄位檢查
    

    const hash = await bcrypt.hash(req.body.password, 10);

    const sql = "INSERT INTO `members`" +
        "(`email`, `password`, `mobile`, `birthday`, `nickname`, `create_at`)" +
        " VALUES (?, ?, ?, ?, ?, NOW())";

    let result;//在外面使用時，一定要加
    try {
        [result] = await db.query(sql, [
            req.body.email.toLowerCase().trim(),//Email不區分大小寫。//9/15 01:11:00
            hash,// 注意hash加密
            req.body.mobile,
            req.body.birthday,
            req.body.nickname,
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