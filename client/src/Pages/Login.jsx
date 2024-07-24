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
                localStorage.setItem('userId', result.data.userId);
                navigate('/dashboard');
            })
            .catch(err => console.log(err));
    };

    return (
        <div className="flex flex-col justify-center items-center bg-gradient-to-r from-purple-500 to-indigo-600 h-screen">
            <h1 className="text-white text-5xl font-bold mb-8">Welcome to Project Manager</h1>
            <div className="bg-white bg-opacity-20 p-8 rounded-lg shadow-lg max-w-sm w-full space-y-8">
                <h2 className="text-center text-3xl font-bold text-white">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="identifier" className="sr-only">Username or Email</label>
                            <input
                                id="identifier"
                                name="identifier"
                                type="text"
                                autoComplete="off"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Username or Email"
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                        </div>
                        <div className="mt-3">
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="off"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Login
                        </button>
                    </div>
                </form>
                <div className="text-center mt-4 text-white">
                    <p>Don't have an account? <Link to="/register" className="font-medium text-indigo-200 hover:text-indigo-100">Register here</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Login;
