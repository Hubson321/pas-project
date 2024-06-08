import React, { useState } from "react";
import axios from "axios";

const ENDPOINT = "https://happy-moss-00c230c03.5.azurestaticapps.net/api";

const Upload = () => {
  const [selectedFiles, setSelectedFiles] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles) return;
    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("images", selectedFiles[i]);
    }

    try {
      await axios.post(ENDPOINT + "/post", formData);
      alert("Upload successful!");
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Upload failed!");
    }
  };

  return (
    <div>
      <h2>Upload Images</h2>
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default Upload;
