import React, { useEffect, useState } from "react";
import axios from "axios";

const ENDPOINT = "https://hubmhot2hub04app.azurewebsites.net/api";

const GetCounter = () => {
  const [counters, setCounters] = useState([]);
  const [searchTag, setSearchTag] = useState("");
  const [filteredCounters, setFilteredCounters] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(ENDPOINT + "/get_counters");
        const sortedCounters = response.data.counters.sort((a, b) => a[0].localeCompare(b[0]));
        setCounters(sortedCounters);
        setFilteredCounters(sortedCounters);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    if (!searchTag.trim()) {
      setFilteredCounters(counters);
      return;
    }
    const filtered = counters.filter(([tag, _]) => tag.includes(searchTag.trim()));
    setFilteredCounters(filtered);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  let sortedCounters = [...filteredCounters];
  if (sortField && sortOrder) {
    sortedCounters.sort((a, b) => {
      let comparison = 0;
      if (sortField === "tag") {
        comparison = a[0].localeCompare(b[0]);
      } else {
        comparison = a[1] - b[1];
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }

  return (
    <div className="counter-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by tag..."
          value={searchTag}
          onChange={(e) => setSearchTag(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <table className="counter-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("tag")} style={{ cursor: "pointer" }}>
              Tag {sortField === "tag" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("count")} style={{ cursor: "pointer" }}>
              Count {sortField === "count" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedCounters.map(([tag, count]) => (
            <tr key={tag}>
              <td>{tag}</td>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GetCounter;
