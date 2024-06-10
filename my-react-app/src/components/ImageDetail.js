// ImageDetail.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const ImageDetail = ({ match }) => {
  const [imageUrl, setImageUrl] = useState("");
  
  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const response = await axios.get(`/api/images/${match.params.imageId}`);
        setImageUrl(response.data.imageUrl);
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    fetchImageUrl();
  }, [match.params.imageId]);

  return (
    <div className="image-detail">
      <h2>Image Detail</h2>
      {imageUrl && <img src={imageUrl} alt="Image" />}
    </div>
  );
};

export default ImageDetail;
