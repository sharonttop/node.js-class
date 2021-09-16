const f1 = a=>a*a;
const f3 = a=>a*a*a;

console.log(f1(7));
console.log("1:",__dirname);

module.exports = {f1,f3};
//以物件Obj的方式匯出function匯出，完整寫法為{f1:f1，f3:f3}