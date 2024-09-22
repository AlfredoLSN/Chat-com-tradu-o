import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { registerRoute } from "../utils/APIRoutes";
import languagesData from "../data/languages.json";

export default function Register() {
    const navigate = useNavigate();
    const [values, setValues] = useState({
        email: "",
        username: "",
        language: "",
        password: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    const [languages, setLanguages] = useState([]);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        setLanguages(languagesData);
    }, []);
    
    /*
    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await axios.get('https://api.deepl.com/v2/languages');
                setLanguages(response.data); 
            } catch (error) {
                console.error("Erro ao buscar idiomas", error);
            }
        };
        fetchLanguages();
    }, []);
*/
    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (handleValidation()) {
            const{username, email, password, language} = values;
           
            try {
                const {data} = await axios.post(registerRoute, {
                    username,
                    email,
                    password,
                    language,
                });
                console.log(data);

                navigate("/");
                
            } catch (error) {
                setMsg(error.response.data.msg);
            }
        }
    }

    const handleValidation = () => {
        const { email, username, password, confirmPassword } = values;
        const regex = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/;
        let newErrors = {}; 

        if (username === '' || username.length < 3) {
            newErrors.username = 'Nome de usuário muito curto!';
        }

        if (email === '' || !regex.test(email.toLowerCase())) {
            newErrors.email = 'Esse e-mail é inválido.';
        }

        if (password === '' || password.length < 4) {
            newErrors.password = 'Senha muito curta!';
        }

        if (confirmPassword !== password) {
            newErrors.confirmPassword = 'As senhas não coincidem!';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    const handleChange = (event) => {
        setValues({ ...values, [event.target.name]: event.target.value });
        setErrors({ ...errors, [event.target.name]: '' });
        setMsg('');
    }

    return (
        <div className="formContainer">
            <form className="form-login-group" onSubmit={handleSubmit}>
                <h1>Chat</h1>
                <span className="msgError">{msg}</span>
                <div className="flex-column">
                    <label htmlFor="username">Username</label>
                    <input id="username" name="username" className="form-field" placeholder="username" onChange={handleChange} />
                    <span className="msgError">{errors.username}</span>
                </div>
                <div className="flex-column">
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" className="form-field" placeholder="name@host.com" onChange={handleChange} />
                    <span className="msgError">{errors.email}</span>
                </div>
                <div className="flex-column">
                    <label htmlFor="language">Preferred Language</label>
                    <select id="language" name="language" className="form-field" onChange={handleChange}>
                        <option value="">Select Language</option>
                        {languages.map((language) => (
                            <option key={language.language} value={language.language}> {language.name}</option>
                        ))}
                    </select>

                    <span className="msgError">{errors.language}</span>
                </div>
                <div className="flex-column">
                    <label htmlFor="password">Password</label>
                    <input id="password" name="password" className="form-field" type="password" placeholder="Password" onChange={handleChange} />
                    <span className="msgError">{errors.password}</span>
                </div>
                <div className="flex-column">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input id="confirmPassword" name="confirmPassword" className="form-field" type="password" placeholder="Confirm Password" onChange={handleChange} />
                    <span className="msgError">{errors.confirmPassword}</span>
                </div>

                <button className="button-submit-form" type="submit">Sign up</button>

                <div>
                    <span>Já possui uma conta? <Link to={'/'}>Login</Link> </span>
                </div>
            </form>
        </div>
    );
}
