
const bcrypt = require('bcryptjs');


(async ()=>{

    const t1 = Date.now();

    const hash2 = await bcrypt.hash('shinder', 8);
    console.log(`hash2: ${hash2}`);
    const t2 = Date.now();
    console.log(t2-t1);


    const hash3 = await bcrypt.hash('shinder', 12);
    console.log(`hash3: ${hash3}`);
    const t3 = Date.now();
    console.log(t3-t2);

})();
