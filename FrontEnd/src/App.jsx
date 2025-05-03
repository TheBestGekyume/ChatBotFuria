import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './pages/Home/Home';
import Chat from './pages/Chat/Chat';
import Navbar from './components/Navbar/Navbar';
// import NotFound from './pages/NotFound';

import "../src/styles/App.scss";
import "../src/styles/reset.scss";


function App() {
  return (
    <Router>
      <section id='app'>
        <Navbar />
        <div className="content">
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            {/* <Route component={NotFound} /> Página 404 */}
          </Routes>
        </div>
      </section>
    </Router>
  );
}

export default App;
