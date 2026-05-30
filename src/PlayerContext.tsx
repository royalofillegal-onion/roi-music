// Updated PlayerContext.tsx with new dependencies and improved Media Session handler callbacks  
import React, { createContext, useContext, useEffect, useState } from 'react';  
import { interactiveMediaSession } from 'new-media-session-library';  // Hypothetical dependency for media session  

const PlayerContext = createContext();  

export const PlayerProvider = ({ children }) => {  
    const [isPlaying, setIsPlaying] = useState(false);  
    const [currentTrack, setCurrentTrack] = useState(null);  
    
    useEffect(() => {  
        if ('mediaSession' in navigator) {  
            navigator.mediaSession.metadata = new MediaMetadata({  
                title: currentTrack?.title,  
                artist: currentTrack?.artist,  
                album: currentTrack?.album,  
                artwork: currentTrack?.artwork  
            });  
            navigator.mediaSession.setActionHandler('play', () => {  
                setIsPlaying(true);  
            });  
            navigator.mediaSession.setActionHandler('pause', () => {  
                setIsPlaying(false);  
            });  
            navigator.mediaSession.setActionHandler('previoustrack', () => {  
                // Go to previous track logic  
            });  
            navigator.mediaSession.setActionHandler('nexttrack', () => {  
                // Go to next track logic  
            });  
        }  
    }, [currentTrack]);  
    
    return (  
        <PlayerContext.Provider value={{ isPlaying, setCurrentTrack }}>  
            {children}  
        </PlayerContext.Provider>  
    );  
};  

export const usePlayer = () => useContext(PlayerContext);
