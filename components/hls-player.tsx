'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { AlertTriangle, Cpu } from 'lucide-react';

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
  const [errorState, setErrorState] = useState<'none' | 'invalid' | 'rtsp'>('none');

  // Check URL signatures
  const urlLower = src.toLowerCase().trim();
  const isRtsp = urlLower.startsWith('rtsp://') || urlLower.startsWith('rtmp://') || urlLower.startsWith('rtsp:') || urlLower.startsWith('rtmp:');
  const isProbablyVideo = urlLower.includes('.m3u8') || urlLower.includes('.mp4') || urlLower.includes('.webm') || urlLower.includes('/hls/') || urlLower.includes('/live/') || urlLower.includes('stream');

  useEffect(() => {
    // Reset error state on source change
    setErrorState('none');

    const video = videoRef.current;
    if (!video) return;

    if (!src || src.trim() === '') {
      setErrorState('invalid');
      return;
    }

    if (isRtsp) {
      // Browsers can't play RTSP directly. Show transcode simulation state.
      setErrorState('rtsp');
      // Trigger error so parent switches to a mock public HLS stream to show live motion
      onError?.();
      return;
    }

    if (!isProbablyVideo) {
      // Not a valid video stream format. Show error message instead of playing fallback movie.
      setErrorState('invalid');
      return;
    }

    const handleNativeError = () => {
      console.warn(`Native video error playing: ${src}`);
      onError?.();
    };

    video.addEventListener('error', handleNativeError);

    if (Hls.isSupported() && src.includes('.m3u8')) {
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
            timeoutRetry: { maxNumRetry: 2, retryDelayMs: 1000, maxRetryDelayMs: 8000 },
            errorRetry: { maxNumRetry: 1, retryDelayMs: 1000, maxRetryDelayMs: 8000 },
          }
        }
      });
      
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().catch(() => {});
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.warn(`Fatal HLS error: ${data.type} for stream: ${src}`);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR || 
                  data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT) {
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
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.src = src;
      if (autoPlay) {
        video.play().catch(() => {});
      }
    }

    return () => {
      video.removeEventListener('error', handleNativeError);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay, onError, isRtsp, isProbablyVideo]);

  if (errorState === 'invalid') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#07070a]" style={style}>
        <div className="w-9 h-9 rounded-full bg-[var(--accent-rose)]/10 flex items-center justify-center text-[var(--accent-rose)] mb-2">
          <AlertTriangle size={16} />
        </div>
        <h4 className="text-xs font-semibold text-white">Invalid Stream Format</h4>
        <p className="text-[10px] text-[var(--text-muted)] mt-1 max-w-[200px] leading-relaxed">
          Please enter a valid HLS (.m3u8) or MP4 stream URL.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" style={style}>
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
        }}
      />

      {/* CCTV / RTSP Watermark Overlay if simulating RTSP */}
      {errorState === 'rtsp' && (
        <div className="absolute inset-0 bg-black/10 pointer-events-none flex flex-col justify-between p-3 select-none">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold tracking-wider text-[var(--accent-lime)] bg-black/60 px-2 py-0.5 rounded flex items-center gap-1">
              <Cpu size={10} className="animate-spin" />
              RTSP TRANSCODE ACTIVE
            </span>
            <span className="text-[9px] font-mono font-bold text-white bg-black/60 px-2 py-0.5 rounded">
              CAM STREAM SIMULATED
            </span>
          </div>
          {/* Static Scanlines effect */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
              backgroundSize: '100% 4px, 6px 100%',
            }}
          />
        </div>
      )}
    </div>
  );
}
