import { useState, useCallback } from 'react';
import { Attachment } from '../types/chat';

interface FileUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export function useFileUpload() {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    isUploading: false,
    progress: 0,
    error: null
  });

  const validateFile = useCallback((file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/markdown',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/mpeg', 'audio/wav', 'audio/ogg'
    ];

    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    if (!allowedTypes.includes(file.type)) {
      return 'File type not supported';
    }

    return null;
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<Attachment | null> => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadState(prev => ({ ...prev, error: validationError }));
      return null;
    }

    setUploadState({
      isUploading: true,
      progress: 0,
      error: null
    });

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 200);

      // Create a mock attachment (in real app, this would upload to server)
      const attachment: Attachment = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('audio/') ? 'audio' :
              file.type.startsWith('video/') ? 'video' : 'document',
        url: URL.createObjectURL(file),
        size: file.size,
        mimeType: file.type
      };

      // Simulate upload completion
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadState({
          isUploading: false,
          progress: 100,
          error: null
        });
      }, 1000);

      return attachment;
    } catch (error) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
      return null;
    }
  }, [validateFile]);

  const uploadMultipleFiles = useCallback(async (files: FileList): Promise<Attachment[]> => {
    const attachments: Attachment[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const attachment = await uploadFile(files[i]);
      if (attachment) {
        attachments.push(attachment);
      }
    }
    
    return attachments;
  }, [uploadFile]);

  const clearError = useCallback(() => {
    setUploadState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    uploadState,
    uploadFile,
    uploadMultipleFiles,
    clearError
  };
}