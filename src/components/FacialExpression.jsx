import React, { useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import"./facialExpression.css";
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

export default function FacialExpression({setSongs}) {
    const videoRef = useRef();
    const navigate = useNavigate()
    const loadModels = async () => {
        const MODEL_URL = '/models';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    };

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video:true })
            .then((stream) => {
                videoRef.current.srcObject = stream;
            })
            .catch((err) => console.error("Error accessing webcam: ", err));
    };

    async function detectMood() {

        const detections = await faceapi
            .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();
        let mostProableExpression = 0
        let _expression = '';

        if (!detections || detections.length === 0) {
            console.log("No face detected");
            return;
        }

        for (const expression of Object.keys(detections[ 0 ].expressions)) {
            if (detections[ 0 ].expressions[ expression ] > mostProableExpression) {
                mostProableExpression = detections[ 0 ].expressions[ expression ]
                _expression = expression;
            }
        }

        console.log(_expression)
        await axios.get(`http://localhost:3000/api/songs?mood=${_expression}`).then(response=>{
        console.log(response.data);
        setSongs(response.data.songs)
        navigate('/Songs');
     
    })
    }
    
    
    
    useEffect(() => {
        loadModels().then(startVideo);
    }, []);

    return (
        <div className="moody-player-container">
            {/* Animated Background */}
            <div className="background-animation">
                <div className="floating-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                    <div className="shape shape-4"></div>
                    <div className="shape shape-5"></div>
                    <div className="shape shape-6"></div>
                </div>
                <div className="gradient-orbs">
                    <div className="orb orb-1"></div>
                    <div className="orb orb-2"></div>
                    <div className="orb orb-3"></div>
                </div>
            </div>

            {/* Header Section */}
            <header className="moody-header">
                <div className="logo-container">
                    <div className="logo-icon">🎵</div>
                    <h1 className="site-title">Moody Player</h1>
                </div>
                <p className="tagline">AI-Powered Music That Matches Your Vibe</p>
            </header>

            {/* Hero Content */}
            <main className="hero-content">
                <section className="intro-section">
                    <h2 className="hero-title">
                        Your Face, Your <span className="gradient-text">Mood</span>, Your Music
                    </h2>
                    <p className="hero-description">
                        Experience the magic of AI-driven music curation. Our advanced facial recognition 
                        technology analyzes your emotions in real-time and curates the perfect playlist 
                        to match your current mood. Whether you're happy, sad, excited, or relaxed - 
                        we've got the soundtrack for your life.
                    </p>
                </section>

                {/* Main Interaction Area */}
                <div className='mood-element'>
                    <div className="video-container">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            className='user-video-feed'
                            style={{ transform: 'scaleX(-1)' }} 
                        />
                        <div className="video-overlay">
                            <div className="scanning-line"></div>
                        </div>
                    </div>
                    <div className="detection-panel">
                        <h3 className="panel-title">Ready to Discover Your Vibe?</h3>
                        <p className="panel-description">
                            Position your face in the camera frame and let our AI analyze your expression. 
                            In seconds, you'll have a personalized playlist that perfectly matches your mood!
                        </p>
                        <button onClick={detectMood} className="detect-button">
                            <span className="button-icon">🎭</span>
                            Detect My Mood
                            <span className="button-sparkle">✨</span>
                        </button>
                        <div className="mood-indicators">
                            <div className="mood-chip">😊 Happy</div>
                            <div className="mood-chip">😢 Sad</div>
                            <div className="mood-chip">😤 Angry</div>
                            <div className="mood-chip">😮 Surprised</div>
                            <div className="mood-chip">😰 Fearful</div>
                            <div className="mood-chip">🤢 Disgusted</div>
                            <div className="mood-chip">😐 Neutral</div>
                        </div>
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="moody-footer">
                <p>© 2025 Moody Player - Where Emotions Meet Music</p>
            </footer>
        </div>
    );
}