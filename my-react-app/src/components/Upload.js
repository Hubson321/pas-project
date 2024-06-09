import React, { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom"; // Import useHistory hook

const ENDPOINT = "https://hubmhot2hub04app.azurewebsites.net/api";

const Upload = () => {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const history = useHistory(); // Initialize useHistory hook

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = async (event) => {
    event.preventDefault(); 
    if (!selectedFiles) return;
    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("images", selectedFiles[i]);
    }

    try {
      await axios.post(ENDPOINT + "/post", formData);
      alert("Upload successful!");
      history.push("/results"); // Navigate to the "Results" tab after successful upload
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Upload failed!");
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Images</h2>
      <form onSubmit={handleUpload}>
        <input type="file" multiple onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default Upload;
