const {f1,f3} =require("./arrow-func");
const f2 =require(__dirname +"/arrow-func");
//f2為在一次帶入整個{f1,f3}，這個寫法也可注意名稱前要/,屬於比較傳統的寫法，和一般寫法沒有不同。

console.log("2",__dirname);
console.log(f1(9));
console.log(f3(10));

//f2不是function不能直接叫出來無法定義，要如下寫法。
console.log(f2.f1(9));
console.log(f2.f3(10));
