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

                onLogin(result.data.userId);
                navigate('/dashboard');

            })
            .catch(err => console.log(err));
    };

    return (
        <div className="flex justify-center items-center bg-gray-800 h-screen space-y-4 text-black">
            <div className="bg-white px-80 py-96 rounded w-50">
                <h2 className="text-center font-bold text-4xl mb-10">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col justify-center mb-3 mr-5 font-bold text-xl space-y-2">
                        <label htmlFor="username">
                            Username
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Username/Email"
                            autoComplete="off"
                            name="username"
                            className="form-control rounded-full text-black font-normal text-2xl outline-none bg-[#eaeaea] py-3 px-5 text-center"
                            onChange={(e) => setIdentifier(e.target.value)}
                        />
                        <label htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            autoComplete="off"
                            name="password"
                            className="form-control rounded-full text-black font-normal text-2xl outline-none bg-[#eaeaea] py-3 text-center"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        <div className="text-center ml-15">
                            <p className="border-2 border-black rounded-full bg-black px-5 py-1 text-white">Login</p>
                        </div>
                    </button>
                </form>
                <div className="mt-3 text-center">
                    <p>Don't have an account?</p>
                    <Link to="/register" className="btn btn-secondary">
                        <p className="border-2 border-black rounded-full bg-black text-white py-3">Register</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;


