import React, { useEffect, useState } from "react";
import axios from "axios";

const ENDPOINT = "https://hubmhot2hub04app.azurewebsites.net/api";

const Results = () => {
  const [results, setResults] = useState([]);
  const [searchTag, setSearchTag] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(ENDPOINT + "/list");
        const sortedResults = response.data.list.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
        setResults(sortedResults);
        setFilteredResults(sortedResults);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSearch = () => {
    if (!searchTag.trim()) {
      setFilteredResults(results);
      return;
    }
    const filtered = results.filter((result) => {
      if (!result.Tags) return false;
      const tagsArray = result.Tags.split(";");
      return tagsArray.includes(searchTag.trim());
    });
    setFilteredResults(filtered);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredResults.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="results-container">
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
            <th>Timestamp</th>
            <th>URL</th>
            <th>State</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item) => (
            <tr key={item.RowKey}>
              <td>{item.Timestamp}</td>
              <td><a href={item.Url} target="_blank" rel="noopener noreferrer">{item.Url}</a></td>
              <td>{item.State}</td>
              <td>{item.Tags}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="pagination">
        {pageNumbers.map(number => (
          <li key={number} onClick={() => setCurrentPage(number)} style={{ cursor: 'pointer', display: 'inline-block', margin: '0 5px' }}>
            {number}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Results;
