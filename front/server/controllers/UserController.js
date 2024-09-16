const bcrypt = require("bcryptjs");
const UserModel = require('../models/UserModel');
const e = require("express");

module.exports.login = async (req, res) => {
    try {
        const{username, password} = req.body;
        const user = await UserModel.findOne({username});

        if(!user) {
            return res.status(404).json({message: "Usuario nao encontrado."});
        }

        const hashedPassword = await bcrypt.hash(password.toString(), 10);
        const valid = await bcrypt.compare(password.toString(), hashedPassword);

        if(!valid) {
            return res.status(401).json({message: "Credenciais invalidas."});
        }
        delete user.password;
        return res.status(200).json(user);
    } catch (error) {
        error.status = 500;
    }
}

module.exports.register = async (req, res) => {
    try {
        const{username, email, password} = req.body;
        const confirmUsername = await UserModel.findOne({username});
        if(confirmUsername)
            return res.json({ msg: "Usuario ja existe", status: false });

        const confirmEmail = await UserModel.findOne({email});
        if(confirmEmail)
            return res.json({msg:"email ja cadastrado."});

        const hashedPassword = await bcrypt.hash(password.toString(), 10);

        const newUser = UserModel.create({
            email,
            username,
            password: hashedPassword,
        });
        delete newUser.password;
        return res.status(201).json(newUser);
    } catch (error) {
        error.status = 500;
    }
}