import  Form  from "../components/Form";
import React from 'react'

function Signup() {
    return (
        <div>
            <Form />
            <p>Already have an account? <a href="/Login">Login</a></p>
        </div>
    );
}

export default Signup;