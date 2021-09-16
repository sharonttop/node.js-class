
const bcrypt = require('bcryptjs');


(async ()=>{

    const salt = await bcrypt.genSalt(8);
    console.log(`salt: ${salt}`);

    const hash1 = await bcrypt.hash('shinder', salt);
    console.log(`hash1: ${hash1}`);

    const hash2 = await bcrypt.hash('shinder', 10);
    console.log(`hash2: ${hash2}`);

    const hash3 = await bcrypt.hash('shinder', salt);
    console.log(`hash3: ${hash3}`);


    console.log(await bcrypt.compare('shinder', hash2));
    console.log(await bcrypt.compare('shInder', hash2));

})();
