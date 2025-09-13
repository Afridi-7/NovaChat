import { useState, useRef, useCallback } from 'react';
import { VoiceRecording } from '../types/chat';

export function useVoiceRecording() {
  const [recording, setRecording] = useState<VoiceRecording>({
    isRecording: false,
    duration: 0
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      streamRef.current = stream;
      chunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecording(prev => ({
          ...prev,
          isRecording: false,
          audioBlob
        }));
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      
      setRecording({
        isRecording: true,
        duration: 0
      });
      
      // Start duration timer
      intervalRef.current = setInterval(() => {
        setRecording(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error('Microphone access denied or not available');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording.isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [recording.isRecording]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setRecording({
      isRecording: false,
      duration: 0
    });
    
    chunksRef.current = [];
  }, []);

  const clearRecording = useCallback(() => {
    setRecording({
      isRecording: false,
      duration: 0
    });
    chunksRef.current = [];
  }, []);

  return {
    recording,
    startRecording,
    stopRecording,
    cancelRecording,
    clearRecording
  };
}