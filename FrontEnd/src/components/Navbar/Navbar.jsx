// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.scss';

const Navbar = () => {
  return (
    <nav id="navbar">
      <h2 className="logo">FURIA</h2>
      <div>
        <ul>
          <li><Link to="/">Início</Link></li>
          <li><Link to="/chat">Chat Bot</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
