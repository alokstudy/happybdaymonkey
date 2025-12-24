import React, { useEffect, useState, useRef } from "react";
import "./App.css";

export default function TerminalIntro({ onDone }) {
  const lines = [
    "hey...",
    "",
    "today is the birthday of my cutu babeeeee 🎂",
    "",
    "but...",
    "",
    "I’m not there to cut the cake with her 😔",
    "",
    "wait...",
    "",
    "can I do something?",
    "",
    "hmmm...",
    "",
    "lemme see...",
  ];

  const [visibleLines, setVisibleLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [fading, setFading] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    setVisibleLines(new Array(lines.length).fill(""));

    const wait = (ms) => new Promise((res) => setTimeout(res, ms));

    const run = async () => {
      await wait(200);
      for (let i = 0; i < lines.length; i++) {
        if (!mounted.current) return;
        const line = lines[i] ?? "";
        for (let c = 0; c <= line.length; c++) {
          if (!mounted.current) return;
          setVisibleLines((prev) => {
            const copy = [...prev];
            copy[i] = line.slice(0, c);
            return copy;
          });
          setCurrentLine(i);
          setCurrentChar(c);
          await wait(30 + Math.random() * 60);
        }
        await wait(250 + Math.random() * 400);
      }
      if (!mounted.current) return;
      setTimeout(() => setFading(true), 500);
      setTimeout(() => {
        if (onDone) onDone();
      }, 1200);
    };

    run();

    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // compute current rendering lines with typing cursor
  const rendered = visibleLines.map((ln, idx) => {
    if (idx < currentLine) return ln;
    if (idx === currentLine) {
      const full = lines[idx] ?? "";
      const shown = full.slice(0, currentChar);
      return shown;
    }
    return "";
  });

  return (
    <div className={`terminal-intro ${fading ? "terminal-fade" : ""}`}>
      <div className="terminal-window" aria-hidden={false}>
        <div className="terminal-header">
          <div className="terminal-dots">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
          <div className="terminal-title">bash — ~</div>
        </div>
        <pre className="terminal-pre">
          {rendered.map((l, i) => (
            <div className="terminal-line" key={i}>
              <span className="terminal-content">{l}</span>
              {i === currentLine && <span className="terminal-caret">█</span>}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
