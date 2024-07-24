import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        if (!username || !email || !password || !confirmPassword) {
            setMessage('All input fields are required');
            setMessageType('error');
            return;
        }

        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            setMessageType('error');
            return;
        }

        axios.post('/api/register', { username, email, password })
            .then(result => {
                setMessage('Account created successfully!');
                setMessageType('success');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            })
            .catch(err => {
                console.error(err);
                if (err.response && err.response.data && err.response.data.message) {
                    setMessage(err.response.data.message);
                } else {
                    setMessage('Registration failed. Please try again.');
                }
                setMessageType('error');
            });
    };

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 5000); // 5 seconds for message
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div className="flex justify-center items-center bg-gray-800 h-screen text-black overflow-hidden">
            <div className="auth-container register">
                <h2 className="text-center font-bold text-4xl mb-10">Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col mb-3 space-y-2">
                        <label htmlFor="username" className="font-bold text-xl">Username</label>
                        <input
                            type="text"
                            placeholder="Enter Username"
                            autoComplete="off"
                            name="username"
                            className="form-control rounded-full text-black font-normal text-2xl outline-none bg-[#eaeaea] py-3 px-5 text-center"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <label htmlFor="email" className="font-bold text-xl">Email</label>
                        <input
                            type="email"
                            placeholder="Enter Email"
                            autoComplete="off"
                            name="email"
                            className="form-control rounded-full text-black font-normal text-2xl outline-none bg-[#eaeaea] py-3 text-center"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <label htmlFor="password" className="font-bold text-xl">Password</label>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            autoComplete="off"
                            name="password"
                            className="form-control rounded-full text-black font-normal text-2xl outline-none bg-[#eaeaea] py-3 text-center"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <label htmlFor="confirmPassword" className="font-bold text-xl">Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            autoComplete="off"
                            name="confirmPassword"
                            className="form-control rounded-full text-black font-normal text-2xl outline-none bg-[#eaeaea] py-3 text-center"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary mt-4">
                            <div className="text-center py-3">
                                <p className="border-1 border-black rounded-full bg-black px-5 py-3 text-white">Register</p>
                            </div>
                        </button>
                    </div>
                </form>
                <div className="mt-3 text-center">
                    <p>Already have an account? <Link to='/login' className='text-blue-500'>Sign in here.</Link></p>
                </div>
            </div>
            {message && (
                <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg ${messageType === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                    {message}
                </div>
            )}
        </div>
    );
}

export default Signup;
