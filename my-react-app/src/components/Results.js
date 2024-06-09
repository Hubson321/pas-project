import React, { useEffect, useState } from "react";
import axios from "axios";

const ENDPOINT = "https://hubmhot2hub04app.azurewebsites.net/api";

const Results = () => {
  const [results, setResults] = useState([]);
  const [searchTag, setSearchTag] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Define currentPage state
  const [itemsPerPage] = useState(10); // Define itemsPerPage state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(ENDPOINT + "/list");
        const sortedResults = response.data.list.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
        setResults(sortedResults);
        setFilteredResults(sortedResults); // Initially set filtered results to all results
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Define handleSearch function
  const handleSearch = () => {
    // If searchTag is empty or contains only spaces, set filteredResults to all results
    if (!searchTag.trim()) {
      setFilteredResults(results);
      return;
    }

    // Filter results based on the search tag
    const filtered = results.filter((result) => {
      if (!result.Tags) return false; // If Tags is not defined, exclude the result
      const tagsArray = result.Tags.split(";"); // Split the Tags string into an array
      return tagsArray.includes(searchTag.trim()); // Check if the searched tag is included in the array
    });
    setFilteredResults(filtered);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredResults.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="results-container">
      {/* Search bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by tag..."
          value={searchTag}
          onChange={(e) => setSearchTag(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Result table */}
      <table className="result-table">
        {/* Table header */}
        {/* Table body */}
      </table>

      {/* Pagination */}
      <ul className="pagination">
        {pageNumbers.map(number => (
          <li key={number} onClick={() => setCurrentPage(number)}>
            {number}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Results;
