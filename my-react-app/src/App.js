import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom"; // Make sure Link is imported

import Upload from "./components/Upload";
import Results from "./components/Results";

const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/upload">Upload</Link>
            </li>
            <li>
              <Link to="/results">Results</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/upload" element={<Upload />} />
          <Route path="/results" element={<Results />} />
          <Route path="/" element={<h2>Welcome to Azure Image Analyzer</h2>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
