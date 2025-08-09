import React, { useState, useRef, useEffect } from 'react'
import './MoodSongs.css'
import { useNavigate } from 'react-router';
import { 
    FaPlay, 
    FaPause, 
    FaStepForward, 
    FaStepBackward, 
    FaRandom, 
    FaRedo, 
    FaVolumeUp, 
    FaVolumeDown, 
    FaVolumeMute,
    FaHeart,
    FaRegHeart,
    FaDownload
} from "react-icons/fa";

const MoodSongs = ({Songs}) => {
       useEffect(()=>{
   navigator.mediaDevices.getUserMedia({ video:false})
      },[])
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isShuffled, setIsShuffled] = useState(false);
    const [isRepeating, setIsRepeating] = useState(false);
    const [likedSongs, setLikedSongs] = useState(new Set());
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    
    const audioRef = useRef(null);
    const navigate = useNavigate();
   
    // Initialize audio element
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Update current time
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        
        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleSongEnd);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleSongEnd);
        };
    }, [currentSongIndex]);

    const handlePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            // Ensure the audio source is loaded before playing
            audio.load();
            audio.play().then(() => {
                setIsPlaying(true);
            }).catch((error) => {
                console.error('Error playing audio:', error);
                setIsPlaying(false);
            });
        }
    };

    const handleSongEnd = () => {
        if (isRepeating) {
            const audio = audioRef.current;
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch((error) => {
                    console.error('Error repeating song:', error);
                });
            }
        } else {
            handleNext();
        }
    };

    const handleNext = () => {
        let nextIndex;
        if (isShuffled) {
            nextIndex = Math.floor(Math.random() * Songs.length);
        } else {
            nextIndex = (currentSongIndex + 1) % Songs.length;
        }
        setCurrentSongIndex(nextIndex);
        setCurrentTime(0);
        setIsPlaying(false);
        
        // Auto-play next song
        setTimeout(() => {
            const audio = audioRef.current;
            if (audio && Songs[nextIndex]?.audio) {
                audio.load();
                audio.play().then(() => {
                    setIsPlaying(true);
                }).catch((error) => {
                    console.error('Error playing next song:', error);
                });
            }
        }, 100);
    };

    const handlePrevious = () => {
        let prevIndex;
        if (isShuffled) {
            prevIndex = Math.floor(Math.random() * Songs.length);
        } else {
            prevIndex = currentSongIndex === 0 ? Songs.length - 1 : currentSongIndex - 1;
        }
        setCurrentSongIndex(prevIndex);
        setCurrentTime(0);
        setIsPlaying(false);
        
        // Auto-play previous song
        setTimeout(() => {
            const audio = audioRef.current;
            if (audio && Songs[prevIndex]?.audio) {
                audio.load();
                audio.play().then(() => {
                    setIsPlaying(true);
                }).catch((error) => {
                    console.error('Error playing previous song:', error);
                });
            }
        }, 100);
    };

    const handleSeek = (e) => {
        const audio = audioRef.current;
        if (!audio) return;

        const clickX = e.nativeEvent.offsetX;
        const width = e.target.offsetWidth;
        const newTime = (clickX / width) * duration;
        
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    const toggleLike = (songId) => {
        const newLikedSongs = new Set(likedSongs);
        if (newLikedSongs.has(songId)) {
            newLikedSongs.delete(songId);
        } else {
            newLikedSongs.add(songId);
        }
        setLikedSongs(newLikedSongs);
    };

    const handleSongSelect = (index) => {
        setCurrentSongIndex(index);
        setCurrentTime(0);
        
        // Wait for next tick to ensure state is updated
        setTimeout(() => {
            const audio = audioRef.current;
            if (audio && Songs[index]?.audio) {
                audio.load();
                audio.play().then(() => {
                    setIsPlaying(true);
                }).catch((error) => {
                    console.error('Error playing selected song:', error);
                    setIsPlaying(false);
                });
            }
        }, 100);
    };

    const formatTime = (time) => {
        if (!time || isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getAlbumArt = (song, index) => {
        if (song.image) {
            return <img src={song.image} alt={song.title} className="song-image" />;
        }
        
        const firstLetter = song.title ? song.title.charAt(0).toUpperCase() : '♪';
        const gradients = [
            'linear-gradient(45deg, #667eea, #764ba2)',
            'linear-gradient(45deg, #f093fb, #f5576c)',
            'linear-gradient(45deg, #4facfe, #00f2fe)',
            'linear-gradient(45deg, #43e97b, #38f9d7)',
            'linear-gradient(45deg, #fa709a, #fee140)',
            'linear-gradient(45deg, #a8edea, #fed6e3)',
            'linear-gradient(45deg, #ffecd2, #fcb69f)',
            'linear-gradient(45deg, #667db6, #0082c8)'
        ];
        
        return (
            <div 
                className="song-image" 
                style={{background: gradients[index % gradients.length]}}
            >
                {firstLetter}
            </div>
        );
    };

    const currentSong = Songs[currentSongIndex];

    return (
        <div className='mood-songs'>
            {/* Header */}
            <div className="nav">
                <h2>Recommended Songs</h2>
                <button onClick={() => navigate('/')} className="regenerate-btn">
                    Detect Again
                </button>
            </div>

            {/* Current Playing Section */}
            {currentSong && (
                <div className="now-playing">
                    <div className="now-playing-info">
                        {getAlbumArt(currentSong, currentSongIndex)}
                        <div className="current-song-details">
                            <h3>{currentSong.title}</h3>
                            <p>{currentSong.artist || 'Unknown Artist'}</p>
                        </div>
                        <div className="song-actions">
                            <button 
                                className="action-btn"
                                onClick={() => toggleLike(currentSong._id)}
                            >
                                {likedSongs.has(currentSong._id) ? 
                                    <FaHeart className="liked" /> : 
                                    <FaRegHeart />
                                }
                            </button>
                            <button className="action-btn">
                                <FaDownload />
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress-section">
                        <span className="time-display">{formatTime(currentTime)}</span>
                        <div className="progress-bar" onClick={handleSeek}>
                            <div 
                                className="progress-fill" 
                                style={{width: `${duration ? (currentTime / duration) * 100 : 0}%`}}
                            ></div>
                        </div>
                        <span className="time-display">{formatTime(duration)}</span>
                    </div>

                    {/* Controls */}
                    <div className="player-controls">
                        <button 
                            className={`control-btn ${isShuffled ? 'active' : ''}`}
                            onClick={() => setIsShuffled(!isShuffled)}
                        >
                            <FaRandom />
                        </button>
                        
                        <button className="control-btn" onClick={handlePrevious}>
                            <FaStepBackward />
                        </button>
                        
                        <button className="play-btn" onClick={handlePlayPause}>
                            {isPlaying ? <FaPause /> : <FaPlay />}
                        </button>
                        
                        <button className="control-btn" onClick={handleNext}>
                            <FaStepForward />
                        </button>
                        
                        <button 
                            className={`control-btn ${isRepeating ? 'active' : ''}`}
                            onClick={() => setIsRepeating(!isRepeating)}
                        >
                            <FaRedo />
                        </button>

                        {/* Volume Control */}
                        <div className="volume-control">
                            <button 
                                className="control-btn"
                                onMouseEnter={() => setShowVolumeSlider(true)}
                                onMouseLeave={() => setShowVolumeSlider(false)}
                            >
                                {volume === 0 ? <FaVolumeMute /> : 
                                 volume < 0.5 ? <FaVolumeDown /> : <FaVolumeUp />}
                            </button>
                            {showVolumeSlider && (
                                <div 
                                    className="volume-slider"
                                    onMouseEnter={() => setShowVolumeSlider(true)}
                                    onMouseLeave={() => setShowVolumeSlider(false)}
                                >
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={volume}
                                        onChange={handleVolumeChange}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Songs List */}
            <div className="songs-list">
                <h3>Playlist</h3>
                {Songs.map((song, index) => (
                    <div 
                        className={`song ${index === currentSongIndex ? 'active' : ''}`} 
                        key={song._id || index}
                        onClick={() => handleSongSelect(index)}
                    >
                        {getAlbumArt(song, index)}
                        
                        <div className="title">
                            <h4>{song.title}</h4>
                            <p>{song.artist || 'Unknown Artist'}</p>
                            <span className="mood-tag">{song.mood}</span>
                        </div>
                        
                        <div className="song-controls">
                            <button 
                                className="like-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLike(song._id);
                                }}
                            >
                                {likedSongs.has(song._id) ? 
                                    <FaHeart className="liked" /> : 
                                    <FaRegHeart />
                                }
                            </button>
                            
                            <button 
                                className="play-song-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (index === currentSongIndex) {
                                        // If this is the current song, toggle play/pause
                                        handlePlayPause();
                                    } else {
                                        // If this is a different song, select and play it
                                        handleSongSelect(index);
                                    }
                                }}
                            >
                                {index === currentSongIndex && isPlaying ? 
                                    <FaPause /> : <FaPlay />
                                }
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Hidden Audio Element */}
            <audio 
                ref={audioRef} 
                src={currentSong?.audio}
                preload="metadata"
                onLoadStart={() => console.log('Loading started for:', currentSong?.title)}
                onCanPlay={() => console.log('Can play:', currentSong?.title)}
                onError={(e) => console.error('Audio error:', e.target.error)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />
        </div>
    );
};

export default MoodSongs;