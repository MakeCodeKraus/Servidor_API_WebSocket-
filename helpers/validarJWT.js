
const jwt = require('jsonwebtoken');
const {secret} = require('../helpers/generarJWT');

const validarJWT = (token)=>{
    //Vericamos si el token es valido
    let _uid;
    try {
      const payload = jwt.verify(token,secret);
      _uid = payload.uid;
    } catch (error) {
      console.log(error.message);
      
    }
   return _uid;
  }

  module.exports = {
    validarJWT
  }