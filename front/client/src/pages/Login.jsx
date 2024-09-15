import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Login() {
    const[values, setvalue] = useState({
        email: "",
        password: "",
    });
    const [msgErroEmail, setMsgErroEmail] = useState('');
    const [msgErroPassword, setMsgErroPassword] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        handleValidation();
    }

    const handleValidation = () => {
        const {email, password} = values;
        const regex = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/;

        if (email === '' || !regex.test(email.toLowerCase())) {
            setMsgErroEmail('Esse e-mail é inválido.');
            return false;
        }

        if(password === '' || password.length < 4){
            setMsgErroPassword('Senha muito curta!');
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
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" className="form-field" placeholder="name@host.com" onChange={(e) => {handleChange(e), setMsgErroEmail('')}}/>
                    <span className="msgError">{msgErroEmail}</span>
                </div>
                <div className="flex-column">
                    <label htmlFor="password">Password</label>
                    <input id="password" name="password" className="form-field" type="password" placeholder="Password" onChange={(e) => {handleChange(e), setMsgErroPassword('')}}/>
                    <span className="msgError">{msgErroPassword}</span>
                </div>

                <button className="button-submit-form" type="submit">Sign in</button>

                <div>
                    <span>Precisa de uma conta? <Link to={'/register'}>Registre-se</Link> </span>
                </div>
            </form>
        </div>
    );
}