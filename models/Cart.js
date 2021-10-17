const db = require('./../modules/connect-mysql');

const tableName = 'carts';
const pkField = 'sid';


class Cart {

    constructor(defaultObj={}) {

        this.data = defaultObj;
    }

    /* 讀取所有資料, 要有篩選的功能 */
    static async getList(options={}){
        let op = {
            perPage: 5,
            page: 1,

            orderBy: '',

            category: null,
            priceLow: 0,
            priceHigh: 0,
            keyword: '',
        };
        const output = {
            perPage: op.perPage,
            page: op.page,
            totalRows: 0,
            totalPages: 0,
            rows: [],
        };
        const t_sql = `SELECT COUNT(1) totalRows FROM ${tableName}`;
        const [t_rs] = await db.query(t_sql);
        const totalRows = t_rs[0].totalRows;

        if(totalRows>0){
            output.totalRows = totalRows;
            output.totalPages = Math.ceil(totalRows/op.perPage);
            const sql = `SELECT * FROM ${tableName} LIMIT ${(op.page-1) * op.perPage}, ${op.perPage}`;
            const [rs] = await db.query(sql);
            output.rows = rs;
        }

        return output;
    }

    /* 透過商品 id 找項目 */
    static async findItem(member_id=0, product_id=0){
        const sql = `SELECT * FROM ${tableName} WHERE member_id=? AND product_id=?`;
        const [rs] = await db.query(sql, [member_id, product_id]);
        if(rs && rs.length===1){
            return rs[0];
        }
        return null;
    }

    static async add(member_id, product_id, quantity){
        const output = {
            success: false,
            error: ''
        }
        // TODO: 三個參數都必須要有資料

        // 不要重複輸入資料
        if(await Cart.findItem(member_id, product_id)){
            output.error = "資料重複了";
            return output;
        }

        const obj = {
            member_id, product_id, quantity
            //10/15 02:09:30
            // 要注意資料有無問題，若sql設定可以給空值，要檢查obj資料格式是否有問題，created_at就不能寫進obj，這邊因為若給資料就沒辦法使用資料表預設的時間，使用物件雖然方便但要小心。
        };

        const sql = `INSERT INTO carts SET ?`;
        //SET ?後面代表包含整個物件進來要小心不要寫錯錯傳入的資料
        const [r] = await db.query(sql, [obj]);
        output.success = !!r.affectedRows ? true : false;
        return output;
    }

    async edit(obj={}){
        for(let i in this.data){
            if(i===pkField) continue;
            if(obj[i]){
                this.data[i] = obj[i];
            }
        }
        return await this.save();
    }

    async remove(){
        const sql = `DELETE FROM ${tableName} WHERE ${pkField}=?`;
        const [r] = await db.query(sql, [this.data.sid]);
        return r;
    }
}

module.exports = Cart;


