import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        if (!username || !email || !password) {
            setMessage('All input fields are required');
            setMessageType('Error');
            return;
        };

        axios.post('/api/register', { username, email, password })
            .then(result => {
                console.log(result);
                setMessage('Account created successfully!');
                setMessageType('success');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            })
            .catch(err => console.log(err));
            setMessage('Registration failed. Please try again.');
            setMessageType('error'); 
    };

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 2000) //2 second for message
            return () => clearTimeout(timer);
        }
    }, [message]);

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
