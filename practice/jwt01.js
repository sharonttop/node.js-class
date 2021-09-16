const jwt = require('jsonwebtoken');
const secretKey ='fewrgdfgdsgsdf';//如果換了所有都要重新設定

(async ()=>{
    //加密
    const token = await jwt.sign({name:'david'},secretKey);

    console.log(token);

    
    const token1 ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiZGF2aWQiLCJpYXQiOjE2MzE2ODU1Njl9.fz4P7Q_nWp1ljZf9_W7KtVO6ayQ7jpwhoa1__brXgck'

    //解密，ait是編成toke的時間點，每次生成時間點不同，加密的token內容就不同。
    const decoded =await jwt.verify(token1,secretKey)
    console.log(decoded);

})();