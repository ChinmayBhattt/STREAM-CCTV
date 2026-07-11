'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HlsPlayerProps {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onError?: () => void;
}

export default function HlsPlayer({
  src,
  autoPlay = true,
  muted = true,
  className,
  style,
  onError,
}: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Handle empty or invalid source immediately
    if (!src || src.trim() === '') {
      onError?.();
      return;
    }

    // Native HTML5 Video Element error handler
    const handleNativeError = () => {
      console.warn(`Native video error playing: ${src}`);
      onError?.();
    };

    video.addEventListener('error', handleNativeError);

    if (Hls.isSupported() && src.toLowerCase().includes('.m3u8')) {
      // Clear previous hls instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 10,
        maxMaxBufferLength: 30,
        manifestLoadPolicy: {
          default: {
            maxTimeToFirstByteMs: 8000,
            maxLoadTimeMs: 20000,
            timeoutRetry: {
              maxNumRetry: 2,
              retryDelayMs: 1000,
              maxRetryDelayMs: 8000,
            },
            errorRetry: {
              maxNumRetry: 1,
              retryDelayMs: 1000,
              maxRetryDelayMs: 8000,
            },
          }
        }
      });
      
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().catch(() => {
            // Playback might be blocked by browser policy
          });
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.warn(`Fatal HLS error: ${data.type} for stream: ${src}`);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Try loading manifest/fragments again once, then trigger fallback if still failing
              if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR || 
                  data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT) {
                console.warn("Manifest load failed fatally. Triggering fallback.");
                onError?.();
              } else {
                hls.startLoad();
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              onError?.();
              break;
          }
        }
      });
    } else {
      // HTML5 video player fallback for MP4/direct streams
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.src = src;
      if (autoPlay) {
        video.play().catch((err) => {
          console.warn("Autoplay failed or blocked: ", err);
        });
      }
    }

    return () => {
      video.removeEventListener('error', handleNativeError);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay, onError]);

  return (
    <video
      ref={videoRef}
      muted={muted}
      playsInline
      className={className}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        background: '#000',
        ...style,
      }}
    />
  );
}
