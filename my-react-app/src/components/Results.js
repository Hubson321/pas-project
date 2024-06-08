import React, { useEffect, useState } from "react";
import axios from "axios";


const ENDPOINT = "https://hubmhot2hub04app.azurewebsites.net/api";

const Results = () => {
  const [results, setResults] = useState([]);
  const [searchTag, setSearchTag] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(ENDPOINT + "/list");
        setResults(response.data.list);
        setFilteredResults(response.data.list); // Initially set filtered results to all results
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    // Filter results based on the search tag
    const filtered = results.filter(
      (result) => result.Tags && result.Tags.includes(searchTag)
    );
    setFilteredResults(filtered);
  };

  return (
    <div className="results-container">
      <h2>Image Analysis Results</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by tag..."
          value={searchTag}
          onChange={(e) => setSearchTag(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <table className="result-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>URL</th>
            <th>Tags</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          {filteredResults.map((result) => (
            <tr key={result.RowKey}>
              <td>{result.RowKey}</td>
              <td>
                <a href={result.Url} target="_blank" rel="noopener noreferrer">
                  View Image
                </a>
              </td>
              <td>{result.Tags?.join(", ")}</td>
              <td>{result.State}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Results;
