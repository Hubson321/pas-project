import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom"; 

import Upload from "./components/Upload";
import Results from "./components/Results";
import GetCounter from "./components/GetCounter";

import "./App.css";

const App = () => {
  return (
    <Router>
      <div>
        <nav className="navbar">
          <ul className="nav-links">
            <li>
              <Link to="/upload">Upload</Link>
            </li>
            <li>
              <Link to="/results">Results</Link>
            </li>
            <li>
              <Link to="/get-counter">Get Counter</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/upload" element={<Upload />} />
          <Route path="/results" element={<Results />} />
          <Route path="/get-counter" element={<GetCounter />} />
          <Route path="/image/:imageId" element={<ImageDetail />} /> {/* Add route for ImageDetail */}
          <Route path="/" element={<h2>Welcome to Azure Image Analyzer</h2>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
