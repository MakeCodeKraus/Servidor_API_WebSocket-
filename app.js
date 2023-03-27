const express = require('express');
const { Server } = require("socket.io");
const http = require('http');
const path = require("path");
const bcryptjs = require('bcryptjs');

const users = require('./users');
const {generarJWT} = require('./helpers/generarJWT');
const { validarJWT } = require('./helpers/validarJWT');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const publicPath = path.resolve(__dirname, "./public");
app.use(express.static(publicPath));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
  });
   
 app.post("/auth/signup",async(req,res)=>{
    const {email,username,password} = req.body;
    if(!email){
        return res.status(400).json({
          msg:"Debe enviar el correo",
          field:"email"
        })
      }
    if(!username){
        return res.status(400).json({
          msg:"Debe enviar el username",
          field:"username"
        })
      }
    if(!password){
        return res.status(400).json({
          msg:"Debe enviar el password",
          field:"password"
        })
    }

    //Encriptar la contraseña
    const salt = bcryptjs.genSaltSync();
    const hash = bcryptjs.hashSync(password,salt);

    try {
        const {password:_password,...user} = await users.addUser(email,username,hash);
        //Generar el token
       const token = await generarJWT(user.id);

        res.status(200).json({user,token})
        
    } catch (error) {
        res.status(400).json({
            msg:error.message
          })
    }
 }) 
 
 app.post("/auth/login",async (req,res)=>{
     //Verificar el body de la petición
     const {email,password} = req.body;
    console.log(req.body);
     if(!email){
       return res.status(400).json({
         msg:"Debe enviar el email",
         field:"email"
       })
     }
     if(!password){
       return res.status(400).json({
         msg:"Debe enviar el password",
         field:"password"
       })
     }
   
     //verificar si existe el usuario
     const userDB = await users.getUserByEmail(email);
   
     if(!userDB){
       return res.status(400).json({
         msg:'Usuario o contraseña no son correctos - email'
       })
     }
     //Verificar la contraseña
     const validPassword = bcryptjs.compareSync(password,userDB.password);
   
     if(!validPassword){
       return res.status(400).json({
         msg:'Usuario o contraseña no son correctos - password'
       })
     }
   
       const {password:pass ,...user} = userDB;
   
       //Generar el token
       const token = await generarJWT(user.id);
   
       res.json({
         user,
         token
       })
       
 })
app.post("/auth/check",async (req, res) => {
  try {
    const token = req.headers['x-token'];
    if(!token){
      return res.status(401).json({
        msg:`No hay token en la petición`
      });
    }
    
    const uid = validarJWT(token)

    if(!uid){
      return res.status(401).json({
        msg:`token no valido`,        
      });
    }

    const user = await users.getUser(uid);
    res.json({
      ok: true,
      user,
      token,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Error generando el token de autenticacion",
    });
  }
})
 io.on('connection', async(socket)=>{

    const {token} = socket.handshake.auth
    const uid = validarJWT(token)

    if(!uid){
        socket.emit("connectionRejected");
        socket.disconnect();
        return;

    }
    else{
      const user = await users.getUser(uid);
      console.log( user.username + " connected");
      socket.broadcast.emit("UserConnected",user);
    }

    
    
    socket.on('KnockKnock',()=>{
      console.log("Knock Knock");
    })
    socket.on('FindMatch',()=>{
      console.log(socket.id+" esta buscando partida" );
    })
    socket.on('disconnect', () => {

     
    });
 }) 


  server.listen(3000, () => {
    console.log('listening on *:3000');
  }); 