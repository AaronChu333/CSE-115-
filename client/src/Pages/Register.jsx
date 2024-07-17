import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!username || !email || !password) {
            setError('All input fields are required');
            return;_
        };

        axios.post('http://192.168.1.107:8080/register', { username, email, password })
            .then(result => {
                console.log(result);
                navigate('/login');
            })
            .catch(err => console.log(err));
    };

    return (
        <div className="flex justify-center items-center bg-gray-800 h-screen space-y-4 text-black overflow-hidden">
            <div className="bg-white px-80 py-96 rounded">
                <h2 className="text-center font-bold text-4xl mb-10">Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col justify-center mb-3 mr-5 font-bold text-xl space-y-2">
                        <label htmlFor="username">
                            Username
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Username"
                            autoComplete="off"
                            name="username"
                            className="form-control rounded-full text-black font-normal text-2xl outline-none bg-[#eaeaea] py-3 px-5 text-center"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <label htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="Enter Email"
                            autoComplete="off"
                            name="email"
                            className="form-control rounded-full text-black font-normal text-2xl outline-none bg-[#eaeaea] py-3 text-center"
                            onChange={(e) => setEmail(e.target.value)}
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
                            <p className="border-1 border-black rounded-full bg-black px-5 py-3 text-white">Register</p>
                        </div>
                        </button>
                    </div>
                </form>
                <div className="mt-3 text-center">
                    <p>Already have an account? <a href='/login' className='text-blue-500'>Sign in here.</a></p>
                </div>
            </div>
        </div>
    );
}

export default Signup;
