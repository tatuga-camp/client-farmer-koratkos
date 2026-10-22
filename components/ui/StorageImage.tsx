import Image, { ImageProps } from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { LuRefreshCw } from "react-icons/lu";

const RETRIES = 8;
const RETRY_MS = 1000;

type StorageImageProps = Omit<ImageProps, "src" | "fill" | "onLoad" | "onError"> & {
  src: string;
  /** Shown while waiting, e.g. "กำลังโหลดแผนที่…". */
  loadingText?: string;
  /** Text and retry button when it still fails; omit to show nothing. */
  failedText?: string;
};

/**
 * A `fill` image for files the server has only just written to storage (static maps,
 * profile pictures). The server answers with the URL before its upload finishes, so the
 * first request can 404: retry for a few seconds with a cache-busting query (storage
 * ignores it) before giving up. Place it inside a `relative` box with a size.
 */
export function StorageImage({ src, loadingText, failedText, className = "", alt, ...image }: StorageImageProps) {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const failed = attempt > RETRIES;

  useEffect(() => {
    setAttempt(0);
    setLoaded(false);
    return () => clearTimeout(timer.current);
  }, [src]);

  const scheduleRetry = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAttempt((count) => count + 1), RETRY_MS);
  };

  return (
    <>
      {!failed && (
        <Image
          {...image}
          key={attempt}
          src={attempt === 0 ? src : `${src}${src.includes("?") ? "&" : "?"}retry=${attempt}`}
          alt={alt}
          fill
          className={`transition-opacity ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
          onLoad={() => setLoaded(true)}
          onError={scheduleRetry}
        />
      )}
      {!loaded && !failed && (
        <div aria-hidden="true" className="absolute inset-0 flex animate-pulse items-center justify-center bg-third-color/20">
          {loadingText && <span className="text-base text-super-main-color/80">{loadingText}</span>}
        </div>
      )}
      {failed && failedText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
          <p className="text-base">{failedText}</p>
          <button type="button" onClick={() => setAttempt(0)} className="btn btn-secondary btn-sm">
            <LuRefreshCw aria-hidden="true" className="size-5" />
            ลองอีกครั้ง
          </button>
        </div>
      )}
    </>
  );
}
