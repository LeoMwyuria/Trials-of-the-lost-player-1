import { useState, useRef, useEffect } from 'react';
import './GateMusic.css';

/**
 * Simple music player for individual gates
 * @param {string} src - Audio file path
 * @param {boolean} autoplay - Whether to autoplay (default: true)
 * @param {number} initialVolume - Starting volume 0-1 (default: 0.2 = 20%)
 */
function GateMusic({ src, autoplay = true, initialVolume = 0.2, onTrackChange, startTime = 0, paused = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('gate_music_volume');
    return saved !== null ? parseFloat(saved) : initialVolume;
  });
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !autoplay) return;

    const startPlayback = () => {
      audio.volume = volume;
      if (startTime > 0) {
        audio.currentTime = startTime;
      }
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
          setTimeout(() => {
            if (startTime > 0) audio.currentTime = startTime;
            audio.play()
              .then(() => setIsPlaying(true))
              .catch(() => setIsPlaying(false));
          }, 1000);
        });
    };

    if (audio.readyState >= 1) {
      // Metadata already loaded — seek and play immediately
      const timer = setTimeout(startPlayback, 50);
      return () => clearTimeout(timer);
    } else {
      // Wait for metadata so currentTime seek actually works
      audio.addEventListener('loadedmetadata', startPlayback, { once: true });
      return () => audio.removeEventListener('loadedmetadata', startPlayback);
    }
  // volume intentionally excluded — handled by the effect below
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, autoplay, startTime]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Pause/resume without destroying the audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (paused) {
      audio.pause();
      setIsPlaying(false);
    } else if (audio.paused && audio.currentTime > 0) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [paused]);

  useEffect(() => {
    // Notify parent when track changes (for Gate 4 phase switching)
    if (onTrackChange) {
      onTrackChange(src);
    }
  }, [src, onTrackChange]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    localStorage.setItem('gate_music_volume', newVolume.toString());
  };

  return (
    <>
      <div className="gate-music-toggle">
        <button
          className="gate-music-btn"
          onClick={() => setShowControls(!showControls)}
          title="Music Controls"
        >
          🎵
        </button>
      </div>

      {showControls && (
        <div className="gate-music-panel">
          <button className="gate-music-close" onClick={() => setShowControls(false)}>
            ✕
          </button>
          <div className="gate-music-controls">
            <button className="gate-music-play-btn" onClick={togglePlay}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <div className="gate-music-volume">
              <span className="gate-music-vol-label">VOL</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="gate-music-slider"
              />
              <span className="gate-music-vol-value">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        src={src}
        loop
        preload="auto"
        onError={(e) => {
          console.error('Audio loading error:', e.target.error);
          console.error('Audio src:', src);
        }}
        onLoadedData={() => console.log('Audio loaded:', src)}
      />
    </>
  );
}

export default GateMusic;
