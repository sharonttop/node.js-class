
const db = require('./../modules/connect-mysql');

//2021 09 09 11 23 28 00:06:31
db.query("SELECT * FROM customers LIMIT 3,2")
    .then( ([r]) => {
        //2021 09 09 11 23 28 00:07:46
        //因為promise成功只會回傳一個值所以被包成array=[results,fields]，但我們只要取用[results]，因此要解開 array，寫成[r]。2021 09 09 11 23 28 00:22:08
        console.log(r);
        process.exit();
    })
    .catch(ex=>{
        console.log(ex);
    })


