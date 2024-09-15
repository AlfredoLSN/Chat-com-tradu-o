import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Register() {
    const[values, setvalue] = useState({
        email: "",
        username: "",
        password: "",
        confirmPassword: ""
    });
    const [msgErroEmail, setMsgErroEmail] = useState('');
    const [msgErroPassword, setMsgErroPassword] = useState('');
    const [msgErroUsername, setMsgErroUsername] = useState('');
    const [msgErroConfirmPassword, setMsgErroConfirmPassword] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        handleValidation();
    }

    const handleValidation = () => {
        const {email, username, password, confirmPassword} = values;
        const regex = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/;


        if(username === '' || username.length < 3){
            setMsgErroUsername('Nome de usuário muito curto!');
            return false;
        }
        
        if (email === '' || !regex.test(email.toLowerCase())) {
            setMsgErroEmail('Esse e-mail é inválido.');
            return false;
        }

        if(password === '' || password.length < 4){
            setMsgErroPassword('Senha muito curta!');
            return false;
        }

        if(confirmPassword !== password){
            setMsgErroConfirmPassword('As senhas não coincidem!');
            return false;
        }

        return true;

    }

    const handleChange = (event) => {
        setvalue({...values,[event.target.name]: event.target.value,});
    }

    return (
        <div className="formContainer">         
            <form className="form-login-group" onSubmit={(event) => handleSubmit(event)}>
                <h1>Chat</h1>
                <div className="flex-column">
                    <label htmlFor="username">Username</label>
                    <input id="username" name="username" className="form-field" placeholder="username" onChange={(e) => {handleChange(e), setMsgErroUsername('')}}/>
                    <span className="msgError">{msgErroUsername}</span>
                </div>
                <div className="flex-column">
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" className="form-field" placeholder="name@host.com" onChange={(e) => {handleChange(e), setMsgErroEmail('')}}/>
                    <span className="msgError">{msgErroEmail}</span>
                </div>
                <div className="flex-column">
                    <label htmlFor="password">Password</label>
                    <input id="password" name="password" className="form-field" type="password" placeholder="Password" onChange={(e) => {handleChange(e), setMsgErroPassword('')}}/>
                    <span className="msgError">{msgErroPassword}</span>
                </div>
                <div className="flex-column">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input id="confirmPassword" name="confirmPassword" className="form-field" type="password" placeholder="Confirm Password" onChange={(e) => {handleChange(e), setMsgErroConfirmPassword('')}}/>
                    <span className="msgError">{msgErroConfirmPassword}</span>
                </div>

                <button className="button-submit-form" type="submit">Sign up</button>

                <div>
                    <span>Já possui uma conta? <Link to={'/login'}>Login</Link> </span>
                </div>
            </form>
        </div>
    )
}