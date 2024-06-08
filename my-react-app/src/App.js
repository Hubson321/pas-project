import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom"; // Updated import

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
        <Routes> {/* Updated usage */}
          <Route path="/upload">
            <Upload />
          </Route>
          <Route path="/results">
            <Results />
          </Route>
          <Route path="/">
            <h2>Welcome to Azure Image Analyzer</h2>
          </Route>
        </Routes> {/* Updated usage */}
      </div>
    </Router>
  );
};

export default App;
