import React, { useState } from 'react';
import './App.css';

const ImageClassifier = () => {
    const [image, setImage] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [darkMode, setDarkMode] = useState(false);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
                classifyImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const classifyImage = async (imageData) => {
        setPredictions([]);
        setLoading(true);
        setError(null);

        const apiKey = process.env.REACT_APP_HUGGING_FACE_API_KEY;
        const modelEndpoint = 'https://api-inference.huggingface.co/models/google/vit-base-patch16-224';

        try {
            const response = await fetch(modelEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: imageData.split(',')[1] // Send only the base64 part
                }),
            });
            
            if (!response.ok) throw new Error('Failed to classify image');

            const result = await response.json();
            console.log("Predictions:", result);
            setPredictions(result);
        } catch (error) {
            console.error("Error:", error);
            setError("Failed to classify the image. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setImage(null);
        setPredictions([]);
        setError(null);
    };

    const toggleDarkMode = () => {
        setDarkMode((prevMode) => !prevMode);
    };

    return (
        <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
    <button className="toggle-button" onClick={toggleDarkMode}>
        {darkMode ? 'Light' : 'Dark'}
    </button>

    <div className="file-input-container">
        <label htmlFor="file-upload" className="custom-file-upload">
            Choose File
        </label>
        <input id="file-upload" type="file" accept="image/*" onChange={handleImageUpload} />
    </div>

    {image && (
        <div className="image-preview">
            <img src={image} alt="Uploaded Preview" width="100%" />
        </div>
    )}

    {loading && <p>Loading...</p>}
    {error && <p style={{ color: 'red' }}>{error}</p>}

    <div className="predictions-container">
        {predictions.length > 0 &&
            predictions.map((prediction, index) => (
                <div key={index} className="prediction-item">
                    <span><strong>{prediction.label}</strong></span>
                    <span>{(prediction.score * 100).toFixed(2)}%</span>
                </div>
            ))}
    </div>
    <div><button onClick={handleClear} className="clear-button">Clear</button>
    </div>
</div>

    );
};

export default ImageClassifier;
