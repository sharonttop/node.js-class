const db = require('./../modules/connect-mysql');

const tableName = 'products';
const pkField = 'sid';

//類別方法
class Product {
    //defaultObj={}預設空物件
    constructor(defaultObj={}){
        //`sid`, `brand`, `name`, `category`, `price`, `on_sale`, `intro`SELECT * FROM `products` WHERE 1
        // this.name = defaultObj.name || '';//對應到資料表的欄位
        this.data = defaultObj;

    }

    /* 讀取所有資料, 要有篩選的功能 */
    //10/15 02:36:37 篩選條件功能
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
        //==============條件篩選功能=============
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
        //==============
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

    
    // 靜態方法
    //讀取單筆資料
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
        //判斷有無sid
        if(this.data.sid){
            //若有PK表示要做修改
            //UPDATE `products` SET `sid`='[value-1]',`brand`='[value-2]',`name`='[value-3]',`category`='[value-4]',`price`='[value-5]',`on_sale`='[value-6]',`intro`='[value-7]' WHERE 1
            //10/14(中)  00:12:00

            const sid = this.data.sid;
            const data = {...this.data};//先展開
            delete data.sid;
             //拷貝完刪掉不會影響到原本物件
             const sql = `UPDATE ${tableName} SET ? WHERE ${pkField}=?`;
             const [r] = await db.query(sql, [data, sid]);
             return r;

        }else{
            // 沒有PK代表要新增
            //INSERT INTO `products`(`sid`, `brand`, `name`, `category`, `price`, `on_sale`, `intro`) VALUES ('[value-1]','[value-2]','[value-3]','[value-4]','[value-5]','[value-6]','[value-7]')
            const sql = `INSERT INTO ${tableName} SET ?`;
            const [r] = await db.query(sql, [this.data]);
            return r;
        }
    }
    async edit(obj={}){
        //this.data = defaultObj;代表整個換掉，會有問題
        for(let i in this.data){
            if(i===pkField) continue;//略過sid不修改
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

module.exports = Product