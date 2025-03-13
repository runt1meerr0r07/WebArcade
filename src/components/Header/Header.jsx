import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase.js';
import { onAuthStateChanged, signOut, updatePassword } from 'firebase/auth';
import logo from './logo.png';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase.js';
import { Filter } from 'bad-words';

const filter = new Filter();

export default function Header() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        
        return () => unsubscribe();
    }, []);

    
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/auth');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const containsProfanity = (text) => {
        if (!text) return false;
        return filter.isProfane(text);
    };

    const changeUsername = async () => {
        const newUsername = prompt("Enter new username:");
        
        if (newUsername) {
            if (containsProfanity(newUsername)) {
                window.location.href = "https://www.youtube.com/watch?v=l60MnDJklnM&ab_channel=as";
                return;
            }
            
            if (user) {
                try {
                   
                    const userRef = doc(db, "users", user.uid);
                    await updateDoc(userRef, {
                        username: newUsername
                    });
                    
                    alert("Username updated successfully!");
                } catch (error) {
                    console.error("Error updating username:", error);
                    alert("Failed to update username.");
                }
            }
        }
    };

    const changePassword = async () => {
        const newPassword = prompt("Enter new password:");
        if (newPassword && user) {
            try {
                await updatePassword(user, newPassword);
                alert("Password updated successfully!");
            } catch (error) {
                console.error("Error updating password:", error);
                alert("Failed to update password. You may need to re-login first.");
            }
        }
    };

    return (
        <header className="bg-black text-white shadow-md fixed w-full top-0 z-50">
            <nav className="bg-black border-gray-700 px-4 lg:px-6 py-2.5">
                <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
                    <Link to="/" className="flex items-center">
                        <img src={logo} className="mr-3 h-12" alt="Logo" />
                    </Link>
                    
                    <div className="flex-1 flex justify-center lg:order-1">
                        <ul className="flex space-x-8 text-lg">
                            <li>
                                <NavLink to="/" className={({ isActive }) =>
                                    `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-white" : "text-gray-400"} border-b border-gray-100 hover:bg-gray-700 lg:hover:bg-transparent lg:border-0 hover:text-white lg:p-0`
                                }>
                                    Home
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/games" className={({ isActive }) =>
                                    `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-white" : "text-gray-400"} border-b border-gray-100 hover:bg-gray-700 lg:hover:bg-transparent lg:border-0 hover:text-white lg:p-0`
                                }>
                                    Games
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/about" className={({ isActive }) =>
                                    `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-white" : "text-gray-400"} border-b border-gray-100 hover:bg-gray-700 lg:hover:bg-transparent lg:border-0 hover:text-white lg:p-0`
                                }>
                                    About
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                    
                    <div className="flex items-center gap-4 lg:order-2">
                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button 
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-1 px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 focus:outline-none"
                                >
                                    <i className="fas fa-user-circle text-lg"></i>
                                    <span className="hidden sm:inline">Menu</span>
                                    <i className="fas fa-chevron-down text-xs ml-1"></i>
                                </button>

                                {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 border border-gray-600 rounded-md shadow-xl py-1 z-50" style={{ 
                                boxShadow: '0 4px 20px rgba(0,0,0,0.9)',
                                backgroundColor: '#111' 
                            }}>
                                <button 
                                    onClick={changeUsername} 
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '8px 16px',
                                        fontSize: '0.875rem',
                                        color: 'white',
                                        borderBottom: '1px solid #333',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <i className="fas fa-edit mr-2"></i> Change Username
                                </button>
                                <button 
                                    onClick={changePassword} 
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '8px 16px',
                                        fontSize: '0.875rem',
                                        color: 'white',
                                        borderBottom: '1px solid #333',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <i className="fas fa-key mr-2"></i> Change Password
                                </button>
                                <button 
                                    onClick={handleLogout} 
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '8px 16px',
                                        fontSize: '0.875rem',
                                        color: 'white',
                                        backgroundColor: '#111', 
                                        transition: 'background-color 0.2s',
                                        fontWeight: '500',
                                        borderTop: '1px solid #333' 
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e53e3e'} 
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#111'} 
                                >
                                    <i className="fas fa-sign-out-alt mr-2"></i> Logout
                                </button>
                            </div>
                        )}
                        </div>
                        ) : (
                            <Link
                                to="/auth"
                                className="text-black bg-white hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none"
                            >
                                Log in
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}