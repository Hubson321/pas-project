import React, { useEffect, useState } from "react";
import axios from "axios";

const ENDPOINT = "https://hubmhot2hub04app.azurewebsites.net/api";

const Results = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(ENDPOINT + "/list");
        setResults(response.data.list);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Image Analysis Results</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>URL</th>
            <th>Tags</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
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
