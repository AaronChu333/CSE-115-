import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Signup() {
    const [username, setUsername] = useState('');
    const [email, createEmail] = useState('');
    const [password, createPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:8080/register', { username, email, password })
            .then(result => {
                console.log(result);
                navigate('/login');
            })
            .catch(err => console.log(err));
    };

    return (
        <div className="flex justify-center items-center bg-gray-700 h-screen space-y-4 text-white">
            <div className="bg-gray-500 p-40 rounded w-50">
                <h2 className="text-center font-bold text-4xl mb-10">Register  </h2>
                <form onSubmit={handleSubmit}>
                <div className="flex flex-col justify-center mb-3 mr-5 font-bold text-2xl">
                        <label htmlFor="username">
                            Username
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Username"
                            autoComplete="off"
                            name="username"
                            className="form-control rounded-0"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <label htmlFor="email">
                            <strong>Email</strong>
                        </label>
                        <input
                            type="email"
                            placeholder="Enter Email"
                            autoComplete="off"
                            name="email"
                            className="form-control rounded-0"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <label htmlFor="password">
                            <strong>Password</strong>
                        </label>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            autoComplete="off"
                            name="password"
                            className="form-control rounded-0"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Register
                    </button>
                </form>
                <div className="mt-3 text-center">
                    <p>Already have an account?</p>
                    <Link to="/login" className="btn btn-primary">
                        <p className="border-2 border-black"> Login </p>
                    </Link>
                </div>
            </div>
        </div>
    );
}


export default Signup;
