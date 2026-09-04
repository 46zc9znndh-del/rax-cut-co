"use client";

import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export function HomeVideo({
  src = "/videos/rax-in-action.mp4",
  poster,
}: {
  src?: string;
  poster?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  async function togglePlay() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
        setPlaying(true);
        setStarted(true);
      } catch {
        setPlaying(false);
      }
      return;
    }

    video.pause();
    setPlaying(false);
  }

  return (
    <section className="bg-black py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <p className="section-kicker">In the Kitchen</p>
          <h2 className="mt-3 font-display text-4xl tracking-[0.08em] text-white uppercase sm:text-5xl">
            See the Drip Board Work
          </h2>
          <p className="mt-4 max-w-xl text-rax-muted-dark">
            Hit play — watch juices drain into the tray while you carve.
          </p>
        </Reveal>

        <div className="relative mt-10 overflow-hidden bg-rax-charcoal">
          <video
            ref={videoRef}
            className="aspect-video w-full object-cover"
            src={src}
            poster={poster}
            playsInline
            preload="metadata"
            controls={started}
            onPlay={() => {
              setPlaying(true);
              setStarted(true);
            }}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
          />

          {!started ? (
            <button
              type="button"
              onClick={togglePlay}
              aria-label="Play video"
              className="absolute inset-0 flex items-center justify-center bg-black/35 transition-colors hover:bg-black/25"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-rax-ember text-white shadow-lg transition-transform hover:scale-105">
                <Play className="ml-1 h-8 w-8 fill-current" />
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause video" : "Play video"}
              className={cn(
                "absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white transition-opacity",
                playing ? "opacity-0 hover:opacity-100 focus:opacity-100" : "opacity-100"
              )}
            >
              {playing ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="ml-0.5 h-5 w-5 fill-current" />
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
