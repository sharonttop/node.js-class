//上傳圖片檔案名稱暗碼
const multer = require('multer');
const {v4:uuidv4} = require('uuid');

const extMap = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/jif': '.jif',

};
//destination:存放檔案的位置，filename檔案名稱。
const storage =multer.diskStorage({
    destination:(req,file, cb)=>{
    cb(null, __dirname + '/../public/img')
    //放在public底下就是所有人都可看的到那張圖無權限問題。null為錯誤，錯誤先行的概念，若無錯誤就給空值null
    },
    filename:(req,file, cb)=>{
        cb(null, uuidv4()+ extMap[file.mimetype]);
    },
});

const fileFilter = (req, file, cb)=>{
    cb(null, !!extMap[file.mimetype]);
}

module.exports = multer({storage,fileFilter})