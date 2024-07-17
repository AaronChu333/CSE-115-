import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('/api/login', { identifier, password })
            .then(result => {
                console.log(result);
                navigate('/dashboard');
            })
            .catch(err => console.log(err));
    };

    return (
        <div className="flex justify-center items-center bg-gray-800 h-screen space-y-4 text-black overflow-hidden">
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
                    <button type="submit" className="btn btn-primary">
                        <div className="text-center ml-15 py-3">
                            <p className="border-1 border-black rounded-full bg-black px-4 py-3 text-white">Login</p>
                        </div>
                        </button>
                        </div>
                </form>
                <div className="mt-3 text-center">
                    <p>Don't have an account? <a href='/register' className='text-blue-500'>Register here.</a></p>
                </div>
            </div>
        </div>
    );
}

export default Login;
