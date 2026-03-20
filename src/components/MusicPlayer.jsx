import { useState, useRef, useEffect } from 'react';
import './MusicPlayer.css';

// List of tracks - add more mp3 files to the audio folder and add them here
const tracks = [
  {
    name: 'LOBODA - Случайная',
    path: '/src/assets/audio/LOBODA  Случайная [AUDIO].mp3'
  },
  {
    name: 'Knight of The Seven Kingdoms',
    path: '/src/assets/audio/This Dance Music Goes Hard  A Knight of The Seven Kingdoms.mp3'
  },
];

function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set volume for new track
    audio.volume = volume;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const setVolumeOnLoad = () => {
      audio.volume = volume;
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('loadeddata', setVolumeOnLoad);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('loadeddata', setVolumeOnLoad);
    };
  }, [currentTrackIndex, volume]);


  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(false);
    setCurrentTime(0);

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.volume = volume; // Ensure volume is set
        audioRef.current.play();
        setIsPlaying(true);
      }
    }, 100);
  };

  const previousTrack = () => {
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(false);
    setCurrentTime(0);

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.volume = volume; // Ensure volume is set
        audioRef.current.play();
        setIsPlaying(true);
      }
    }, 100);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  return (
    <div className="music-player-container">
      {/* Track name */}
      <div className="track-name">{tracks[currentTrackIndex].name}</div>

      {/* Progress bar */}
      <div className="progress-bar-container">
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={currentTime}
          onChange={handleProgressChange}
          className="progress-bar"
        />
      </div>

      {/* Control buttons row */}
      <div className="controls-row">
        {/* Previous button */}
        <button className="control-btn prev-btn" onClick={previousTrack} title="Previous">
          <div className="prev-icon">
            <div className="prev-bar"></div>
            <div className="prev-triangle"></div>
          </div>
        </button>

        {/* Play/Pause button (larger, in middle) */}
        <button className="control-btn play-btn-main" onClick={togglePlay}>
          {isPlaying ? (
            <div className="pause-icon">
              <div className="pause-bar"></div>
              <div className="pause-bar"></div>
            </div>
          ) : (
            <div className="play-icon"></div>
          )}
        </button>

        {/* Next button */}
        <button className="control-btn next-btn" onClick={nextTrack} title="Next">
          <div className="next-icon">
            <div className="next-triangle"></div>
            <div className="next-bar"></div>
          </div>
        </button>
      </div>

      {/* Volume control */}
      <div className="volume-row">
        <span className="volume-label">VOL</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
      </div>

      <audio ref={audioRef} loop key={currentTrackIndex}>
        <source src={tracks[currentTrackIndex].path} type="audio/mpeg" />
      </audio>
    </div>
  );
}

export default MusicPlayer;
