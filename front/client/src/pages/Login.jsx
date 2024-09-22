import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { loginRoute } from "../utils/APIRoutes";


export default function Login() {

    const navigate = useNavigate();

    const[values, setvalue] = useState({
        username: "",
        password: "",
    });

    const [msgErroEmail, setMsgErroEmail] = useState('');
    const [msgErroPassword, setMsgErroPassword] = useState('');
    const [msg, setMsg] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        if(handleValidation()) {
            const {username, password} = values;

            try {
                const { data } = await axios.post(loginRoute, {
                    username,
                    password,
                });
                
                localStorage.setItem("user", JSON.stringify(data));
                console.log('teste')
                navigate("/chat");
                
            } catch (error) {
                setMsg(error.response.data.msg);
            }   
        }
    }

    const handleValidation = async () => {
        const {username, password} = values;
        
        if (username === '' || username.length < 3) {
            setMsgErroEmail('Nome de usuario ou email inválido.');
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
        setMsg('');
    }
    return (
        <div className="formContainer">
            
            <form className="form-login-group" onSubmit={(event) => handleSubmit(event)}>
                <h1>Chat</h1>
                <span className="msgError">{msg}</span>
                <div className="flex-column">
                    <label htmlFor="username">Email or Username</label>
                    <input id="username" name="username" className="form-field" placeholder="Email or Username" onChange={(e) => {handleChange(e), setMsgErroEmail('')}}/>
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