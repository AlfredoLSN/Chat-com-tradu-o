const bcrypt = require("bcryptjs");
const UserModel = require('../models/UserModel');

module.exports.login = async (req, res) => {
    try {
        const{emailOrUsername, password} = req.body;
        //procura pelo nome de usuário ou email passado como parâmetro
        const user = await UserModel.findOne({$or:[{username:emailOrUsername}, {email:emailOrUsername}]});

        if(!user) {
            return res.status(404).json({msg: "Usuario nao encontrado."});
        }

        const valid = await bcrypt.compare(password.toString(), user.password);

        if(!valid) {
            return res.status(401).json({msg: "Credenciais invalidas."});
        }

        const userObj = user.toObject();
        delete userObj.password;
       
        return res.status(200).json({userObj, msg: "login realizado", status: true});
    } catch (error) {
        error.status = 500;
    }
}

module.exports.register = async (req, res) => {
    try {
        const{username, email, password, preferredLanguage} = req.body;
        const confirmUsername = await UserModel.findOne({username});
        if(confirmUsername)
            return res.status(400).json({ msg: "Usuario ja existe"});

        const confirmEmail = await UserModel.findOne({email});
        if(confirmEmail)
            return res.status(400).json({msg:"email ja cadastrado."});

        const hashedPassword = await bcrypt.hash(password.toString(), 10);

        const newUser = await UserModel.create({
            email,
            username,
            preferredLanguage,
            password: hashedPassword,
        });
        return res.status(201).json({msg:"usuario cadastrado com sucesso.", status: true});
    } catch (error) {
        error.status = 500;
    }
}