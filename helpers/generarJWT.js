const jwt = require('jsonwebtoken');

const secret = "PaS$w0rdXt2023";

const generarJWT = (uid)=>{

   return new Promise((resolve,reject)=>{

       const payload = {uid};
       jwt.sign(payload,secret,{
        expiresIn:'8H'
       },(err,token)=>{
            if(err){
                console.log(err.message);
                reject('No se pudo generar el token');
            }
            else{
                resolve(token);
            }
       })

   })
}

module.exports = {
    generarJWT,secret
}