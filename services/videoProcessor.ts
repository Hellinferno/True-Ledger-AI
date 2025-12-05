/**
 * Extracts frames from a video file at 10%, 50%, and 90% of its duration.
 * 
 * @param videoFile The video file object to process.
 * @returns A promise that resolves to an array of base64 encoded image strings.
 */
export const extractFramesFromVideo = async (videoFile: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames: string[] = [];
    const timestamps = [0.1, 0.5, 0.9]; // 10%, 50%, 90% duration
    let currentStep = 0;

    if (!ctx) {
      reject(new Error('Canvas context not supported by this browser.'));
      return;
    }

    // Create a temporary URL for the video file
    const fileUrl = URL.createObjectURL(videoFile);
    video.src = fileUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata'; // We need duration

    // Function to capture the current frame
    const captureFrame = () => {
      if (!ctx || !video) return;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      
      // Convert to high quality JPEG base64 (0.95 quality)
      const frame = canvas.toDataURL('image/jpeg', 0.95);
      frames.push(frame);

      currentStep++;
      seekToNextFrame();
    };

    // Function to move the video head to the next timestamp
    const seekToNextFrame = () => {
      if (currentStep >= timestamps.length) {
        // All frames captured
        cleanup();
        resolve(frames);
        return;
      }

      if (Number.isFinite(video.duration)) {
        const time = video.duration * timestamps[currentStep];
        video.currentTime = time;
      } else {
        cleanup();
        reject(new Error('Could not determine video duration.'));
      }
    };

    const cleanup = () => {
      URL.revokeObjectURL(fileUrl);
      video.remove();
      canvas.remove();
    };

    // Event listeners
    
    // Using onseeked ensures the frame is ready to be drawn
    video.onseeked = () => {
      captureFrame();
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Error processing video file. The file might be corrupted or format unsupported.'));
    };

    // Handle case where metadata might already be loaded
    if (video.readyState >= 1) { // HAVE_METADATA
      seekToNextFrame();
    } else {
      video.onloadedmetadata = () => {
        seekToNextFrame();
      };
    }
  });
};
