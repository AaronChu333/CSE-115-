import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:8080/login', { identifier, password })
            .then(result => {
                console.log(result);
                navigate('/Dashboard');
            })
            .catch(err => console.log(err));
    };

    return (
        <div className="login-container d-flex justify-content-center align-items-center vh-100 bg-secondary">
            <div className="login-form bg-white p-4 rounded">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="identifier" className="form-label">
                            <strong>Username or Email</strong>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Username or Email"
                            autoComplete="off"
                            name="identifier"
                            className="form-control"
                            onChange={(e) => setIdentifier(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                            <strong>Password</strong>
                        </label>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            autoComplete="off"
                            name="password"
                            className="form-control"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        Login
                    </button>
                </form>
                <div className="mt-3 text-center">
                    <p>Don't have an account?</p>
                    <Link to="/register" className="btn btn-secondary">
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
