const db = require('./../modules/connect-mysql');

const tableName = 'products';
const pkField = 'sid';

class Product {

    constructor(defaultObj={}) {
        // `sid`, `author`, `bookname`, `category_sid`, `book_id`, `publish_date`, `pages`, `price`, `isbn`, `on_sale`, `introduction`
        this.data = defaultObj;
    }

    /* 讀取所有資料, 要有篩選的功能 */
    static async findAll(options={}){
        let op = {
            perPage: 5,
            page: 1,

            orderBy: '',

            category: null,
            priceLow: 0,
            priceHigh: 0,
            keyword: '',
            ...options
        };
        const output = {
            perPage: op.perPage,
            page: op.page,
            totalRows: 0,
            totalPages: 0,
            rows: [],
        };
        let where = ' WHERE 1 ';
        if(op.category){
            where += ' AND category_sid=' + parseInt(op.category) + ' ';
        }
        if(op.keyword){
            where += ' AND bookname LIKE ' + db.escape('%' + op.keyword + '%') + ' ';
        }
        if(op.priceLow){
            where += ' AND price >= ' + parseInt(op.priceLow) + ' ';
        }
        if(op.priceHigh){
            where += ' AND price <= ' + parseInt(op.priceHigh) + ' ';
        }


        const t_sql = `SELECT COUNT(1) totalRows FROM ${tableName} ${where}`;
        const [t_rs] = await db.query(t_sql);
        const totalRows = t_rs[0].totalRows;

        if(totalRows>0){
            output.totalRows = totalRows;
            output.totalPages = Math.ceil(totalRows/op.perPage);
            const sql = `SELECT * FROM ${tableName} ${where} LIMIT ${(op.page-1) * op.perPage}, ${op.perPage}`;
            const [rs] = await db.query(sql);
            output.rows = rs;
        }

        return output;
    }

    /* 讀取單筆資料 */
    static async findOne(pk=0){
        const sql = `SELECT * FROM ${tableName} WHERE ${pkField}=?`;
        const [rs] = await db.query(sql, [pk]);
        if(rs && rs.length===1){
            // return rs[0];
            return new Product(rs[0])
        }
        return null;
    }
    toJSON(){
        return this.data;
    }
    toString(){
        return JSON.stringify(this.data, null, 4);
    }
    async save(){
        // 若有 PK 則表示要做修改
        if(this.data.sid){
            const sid = this.data.sid;
            const data = {...this.data};
            delete data.sid;
            
            const sql = `UPDATE ${tableName} SET ? WHERE ${pkField}=?`;
            const [r] = await db.query(sql, [data, sid]);
            return r;
        } else {
            // 沒有 PK 則表示要做新增
            const sql = `INSERT INTO ${tableName} SET ?`;
            const [r] = await db.query(sql, [this.data]);
            return r;
        }
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

module.exports = Product;


