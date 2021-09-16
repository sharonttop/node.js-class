class Person {
    //CommonJS 的模組引入和匯出
    constructor(name='noname',age=20){
        this.name = name;
        this.age = age;
    }
    toJSON(){
        return {
            name: this.name,
            age: this.age,
        }
    }
    toString(){
        return JSON.stringify(this.toJSON(),null, 4);
        //取代:因為沒有要取代的東西所以設定null，4為縮排數
    }

}

module.exports = Person;