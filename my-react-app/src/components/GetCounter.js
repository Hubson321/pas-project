import React, { useEffect, useState } from "react";
import axios from "axios";

const ENDPOINT = "https://hubmhot2hub04app.azurewebsites.net/api";

const GetCounter = () => {
  const [counters, setCounters] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(ENDPOINT + "/get_counters");
        setCounters(response.data.counters);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="counter-container">
      <h2>Tag Counters</h2>
      <ul>
        {counters.map(([tag, count]) => (
          <li key={tag}>
            {tag} {count}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GetCounter;
