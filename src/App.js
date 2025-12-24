import PixelAnimator from "./PixelAnimator";
import "./App.css";
import Confetti from "./Confetti";
import TerminalIntro from "./TerminalIntro";
import { useEffect, useRef, useState } from "react";

export default function App() {
  const audioRef = useRef(null);
  const [staticFrame, setStaticFrame] = useState(null);
  const [showTerminal, setShowTerminal] = useState(true);

  const micStreamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const gainNodeRef = useRef(null);
  const rafRef = useRef(null);

  // 🎂 asset paths (FROM public/assets)
  // 🎂 asset paths (FROM public/assets)
const cake1 = "/assets/cake1.png";
const cake2 = "/assets/cake2.png";
const cake3 = "/assets/cake3.png";
const cake100 = "/assets/100.png";
const cake80 = "/assets/80.png";
const cake60 = "/assets/60.png";
const cake40 = "/assets/40.png";
const cake20 = "/assets/20.png";
const birthdayText = "/assets/birthdaytext (1).png";
const birthdaySong = "/assets/bdayaudo.mp3";


  useEffect(() => {
    const playAudio = async () => {
      try {
        await audioRef.current.play();
      } catch (err) {
        console.log("Autoplay blocked, waiting for user interaction:", err);
      }
    };
    if (!showTerminal) playAudio();
  }, [showTerminal]);

  useEffect(() => {
    startMicMonitoring();
    return () => stopMicMonitoring();
  }, []);

  const handleCakeClick = () => {
    audioRef.current?.play();
  };

  const pickStaticFrame = (rms) => {
    if (rms < 0.02) return null;
    if (rms >= 0.30) return cake20;
    if (rms >= 0.22) return cake40;
    if (rms >= 0.15) return cake60;
    if (rms >= 0.08) return cake80;
    return cake100;
  };

  const startMicMonitoring = async () => {
    if (micStreamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 3.0;
      gainNodeRef.current = gainNode;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      source.connect(gainNode);
      gainNode.connect(analyser);

      const data = new Float32Array(analyser.fftSize);

      const loop = () => {
        analyser.getFloatTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
        const rms = Math.sqrt(sum / data.length);

        const chosen = pickStaticFrame(rms);
        setStaticFrame((prev) => (prev === chosen ? prev : chosen));
        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
    } catch (err) {
      console.warn("Microphone access denied:", err);
    }
  };

  const stopMicMonitoring = (reset = true) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    micStreamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    gainNodeRef.current = null;
    if (reset) setStaticFrame(null);
  };

  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (staticFrame === cake20) {
      stopMicMonitoring(false);
      setCelebrating(true);
    }
  }, [staticFrame]);

  return (
    <div className="App">
      <audio ref={audioRef} src={birthdaySong} loop />

      {showTerminal ? (
        <TerminalIntro onDone={() => setShowTerminal(false)} />
      ) : (
        <>
          <img
            src={birthdayText}
            alt="Happy Birthday"
            className="birthdayText"
            draggable={false}
          />

          <div className="cakeLoop">
            <PixelAnimator
              className="cake"
              frames={
                staticFrame
                  ? [staticFrame]
                  : [cake1, cake2, cake3]
              }
              fps={3}
              scale={4}
              mode="img"
              onClick={handleCakeClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleCakeClick();
              }}
            />
          </div>

          {celebrating && (
            <Confetti
              pieces={48}
              duration={8000}
              onDone={() => setCelebrating(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
