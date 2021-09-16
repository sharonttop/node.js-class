const  fs = require('fs');

const data = {
    name:"David",
    age:28
};

fs.writeFile(
    __dirname +'/data.json',  //以js所在位置為參考位置
    JSON.stringify(data, null, 4),
    error=>{
        if(error){
            console.log('無法寫入檔案:',error);
            process.exit();
        }
        console.log('寫入成功');
});