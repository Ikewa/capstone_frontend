import  Form  from "../components/Form";
import React from 'react'

function Login() {
    return (
        <div>
            <Form />
            <p>Don't have an account? <a href="/Signup">Sign up</a></p>
        </div>
    );
}

export default Login;