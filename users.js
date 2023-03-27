const fs = require("fs");

let users = [];

const loadUsersBD = ()=>{

    try {
        users = require("./db/users.json");        
    } catch (error) {   
        users = [];        
    }
}
const saveUserDB=  async ()=>{
    const data = JSON.stringify(users);

    fs.writeFile("db/users.json",data,(err)=>{
        if(err){
            throw new Error("Error guardando el archivo users.json");          
        }
        console.log("Save user ok");
        return;       
    })

}
loadUsersBD();

const addUser = async (email,username,password)=>{
    if( users.some(user => user.email === email)){
        throw new Error(`El correo  ${email} ya esta registrado`);
    }
    if(users.some(user => user.username === username)){
        throw new Error(`El nombre usuario ${username} ya esta registrado`);
    }

    let newUser = {
        id: users.length + 1,
        email,
        username,
        password,
        score:0
    }

    users.push(newUser);

    await saveUserDB();

    return newUser;
}

const getUser = async (id)=>{
    const user = users.find(user=>user.id == id);
    return user;
}
const getUserByEmail = async (email)=>{
    const user = users.find(user=>user.email == email);
    return user;
}

 module.exports = {
    addUser,
    getUser,
    getUserByEmail
 }
