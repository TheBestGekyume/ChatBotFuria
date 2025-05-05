// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';
import { FaUserCircle } from "react-icons/fa";
import './Navbar.scss';

const Navbar = () => {
  const { auth } = useAuth();

  return (
    <nav id="navbar">
      <h2 className="logo">FURIOSO</h2>
      <div className='content'>
        <ul>
          {/* <li><Link to="/">Início</Link></li> */}
          <li><Link to="/chat">Chat Bot</Link></li>
        </ul>
        {auth?.user && (
          <div className="user">
            <FaUserCircle  />
            <span className="welcome-message">Olá, {auth.user.username}</span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;