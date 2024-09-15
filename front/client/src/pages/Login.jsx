import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";

export default function Login() {
    return (
        <div className="formContainer">
            <Formik initialValues={{}}>
                <Form className="form-login-group">
                    <h1>Chat</h1>
                    <div className="flex-column">
                        <label htmlFor="email">Email</label>
                        <Field id="email" name="email" className="form-field" placeholder="name@host.com" />
                        <ErrorMessage
                            component="span"
                            name="email"
                            className="form-error" 
                        />
                    </div>
                    <div className="flex-column">
                        <label htmlFor="password">Password</label>
                        <Field id="password" name="password" className="form-field" type="password" placeholder="Password"/>
                        <ErrorMessage 
                            component="span"
                            name="password"
                            className="form-erroe"
                        />
                    </div>

                    <button className="button-submit-form" type="submit">Sign in</button>
                </Form>
            </Formik>
        </div>
    );
}