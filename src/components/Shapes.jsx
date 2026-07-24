

import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";



const SHAPES = {
    circle: {
        id: "circle",
        path: "M50,10 a40,40 0 1,0 0.0001,0",
    },
    square: {
        id: "square",
        path: "M10 10 H90 V90 H10 Z",
    },
    triangle: {
        id: "triangle",
        path: "M50 10 L90 85 H10 Z",
    },
    diamond: {
        id: "diamond",
        path: "M50 10 L90 50 L50 90 L10 50 Z",
    },

    pentagon: {
        id: "pentagon",
        path: "M50 10 L88 38 L73 85 H27 L12 38 Z",
    },

    hexagon: {
        id: "hexagon",
        path: "M25 10 H75 L95 50 L75 90 H25 L5 50 Z",
    },

    star: {
        id: "star",
        path: "M50 5 L61 36 L95 36 L68 56 L79 90 L50 70 L21 90 L32 56 L5 36 H39 Z",
    },

 
};

const SHAPE_KEYS = ["circle", "square", "triangle"];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function ShapeShifterGame() {
    const [playerShape, setPlayerShape] = useState("circle");
    const [shapes, setShapes] = useState([]); // falling shapes
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [running, setRunning] = useState(false);
    const spawnIntervalRef = useRef(null);
    const gameTickRef = useRef(null);
    const areaRef = useRef(null);
    const controls = useAnimation();

    // Spawn logic
    useEffect(() => {
        function spawnShape() {
            const shapeType = SHAPE_KEYS[randomInt(0, SHAPE_KEYS.length - 1)];
            const left = randomInt(8, 92);
            const speed = randomInt(2000, 5000); // ms to fall
            const id = Math.random().toString(36).slice(2, 9);
            setShapes((s) => [
                ...s,
                {
                    id,
                    type: shapeType,
                    left,
                    top: -10,
                    createdAt: Date.now(),
                    speed,
                },
            ]);
        }

        if (running) {

            const base = Math.max(700, 1500 - Math.floor(score / 5) * 50);
            spawnIntervalRef.current = setInterval(spawnShape, base);

            spawnShape();
        }

        return () => {
            clearInterval(spawnIntervalRef.current);
        };
    }, [running, score]);


    useEffect(() => {
        if (!running) return;
        const tickMs = 40; // 25 FPS

        gameTickRef.current = setInterval(() => {
            setShapes((prev) => {
                const area = areaRef.current;
                const areaHeight = area ? area.clientHeight : 600;
                const playerY = areaHeight - 110; 
                const next = prev
                    .map((sh) => {
                        const elapsed = Date.now() - sh.createdAt;
                        const progress = Math.min(1, elapsed / sh.speed);
                        const top = -10 + progress * (areaHeight + 20);
                        return { ...sh, top };
                    })
                    .filter((sh) => {
                        
                        const leftPx = ((area ? area.clientWidth : 800) * sh.left) / 100;
                        const topPx = (area ? area.clientHeight : 600) * (sh.top / (area ? area.clientHeight : 600));
                        const dx = Math.abs(leftPx - (area ? area.clientWidth / 2 : 400));
                        const dy = Math.abs(topPx - playerY);
                        const hit = dx < 60 && dy < 60 && sh.top > areaHeight - 150; // collision thresh
                        if (hit) {
                            
                            if (sh.type === playerShape) {
                                setScore((s) => s + 10);
                            
                                controls.start({ scale: [1, 1.15, 1], transition: { duration: 0.35 } });
                            } else {
                                setLives((l) => l - 1);
                                controls.start({ rotate: [0, -6, 6, 0], transition: { duration: 0.5 } });
                            
                                if (navigator.vibrate) navigator.vibrate(80);
                            }
                            return null;
                        }
                        
                        if (sh.top > areaHeight + 50) return null;
                        return sh;
                    });

                return next;
            });
        }, tickMs);

        return () => clearInterval(gameTickRef.current);
    }, [running, playerShape, controls]);

    // Keyboard controls
    useEffect(() => {
        function onKey(e) {
            if (e.key === "1") setPlayerShape("circle");
            if (e.key === "2") setPlayerShape("square");
            if (e.key === "3") setPlayerShape("triangle");
            if (e.key === "4") setPlayerShape("diamond");
            if (e.key === "5") setPlayerShape("star");
            if (e.key === "6") setPlayerShape("heart");
            if (e.key === "7") setPlayerShape("pentagon");
            
            if (e.key === " ") setRunning((r) => !r);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Game over watcher
    useEffect(() => {
        if (lives <= 0) {
            setRunning(false);
        }
    }, [lives]);

    function resetGame() {
        setScore(0);
        setLives(3);
        setShapes([]);
        setPlayerShape("circle");
        setRunning(true);
    }

    function shapeButton(shape) {
        const active = playerShape === shape;
        return (
            <button
                key={shape}
                onClick={() => setPlayerShape(shape)}
                className={`px-3 py-2 rounded-xl shadow-md transform-gpu hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition-all duration-150 ${active ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-gray-800"
                    }`}
            >
                <div className="w-8 h-8">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <path d={SHAPES[shape].path} fill={active ? "white" : "#4b5563"} />
                    </svg>
                </div>
            </button>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white p-6 flex items-center justify-center">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="md:col-span-1 bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/5 shadow-lg">
                    <h2 className="text-xl font-semibold">Shape Shifter</h2>
                    <p className="text-sm text-gray-300 mt-1">Match falling shapes. Use keys 1-3 or buttons below. Space to pause.</p>

                    <div className="mt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-300">Score</div>
                                <div className="text-2xl font-bold">{score}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-300">Lives</div>
                                <div className="text-2xl font-bold">{lives}</div>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-3">{SHAPE_KEYS.map((s) => shapeButton(s))}</div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setRunning((r) => !r)}
                                className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 shadow-md"
                            >
                                {running ? "Pause" : "Start"}
                            </button>
                            <button onClick={resetGame} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">
                                Restart
                            </button>
                        </div>

                        <div className="mt-4 text-xs text-gray-400">Tip: The game speeds up as your score increases. Match quickly!</div>
                    </div>
                </div>

                
                <div className="md:col-span-2 bg-gradient-to-b from-transparent to-black/40 rounded-3xl relative overflow-hidden border border-white/5" ref={areaRef} style={{ minHeight: 420 }}>
                    
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
                    >
                        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
                    </motion.div>

                
                    {shapes.map((sh) => (
                        <motion.div
                            key={sh.id}
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: sh.top, opacity: 1 }}
                            transition={{ ease: "linear", duration: 0.04 }}
                            style={{ position: "absolute", left: `${sh.left}%`, x: "-50%" }}
                        >
                            <div className="w-20 h-20">
                                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
                                    <path d={SHAPES[sh.type].path} fill="#fff" stroke="#00000022" strokeWidth={2} />
                                </svg>
                            </div>
                        </motion.div>
                    ))}

                    
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <motion.div animate={controls} className="w-36 h-36 bg-white/5 rounded-2xl flex items-center justify-center shadow-2xl p-4">
                            <svg viewBox="0 0 100 100" className="w-28 h-28">
                                <motion.path
                                    d={SHAPES[playerShape].path}
                                    fill="url(#grad)"
                                    stroke="#00000050"
                                    strokeWidth={1.5}
                                    animate={{ d: SHAPES[playerShape].path }}
                                    transition={{ type: "spring", stiffness: 200, damping: 18 }}
                                />
                                <defs>
                                    <linearGradient id="grad" x1="0" x2="1">
                                        <stop offset="0%" stopColor="#7c3aed" />
                                        <stop offset="100%" stopColor="#06b6d4" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </motion.div>

                        <div className="mt-3 text-sm text-gray-300">Current: <span className="font-medium text-white">{playerShape}</span></div>
                    </div>

                
                    <div className="absolute left-0 right-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />

                    
                    <div className="absolute top-6 right-6 bg-white/6 px-3 py-2 rounded-lg text-sm">Score {score} • Lives {lives}</div>

                   
                    {!running && lives <= 0 && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <div className="bg-white/5 p-8 rounded-2xl text-center">
                                <h3 className="text-2xl font-bold">Game Over</h3>
                                <p className="mt-2 text-gray-300">Final score: {score}</p>
                                <div className="mt-4 flex justify-center gap-3">
                                    <button onClick={resetGame} className="px-4 py-2 rounded-lg bg-indigo-500">Play again</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

           
            <div className="fixed bottom-4 left-4 text-xs text-gray-400">Keys: 1=Circle 2=Square 3=Triangle • Space = Pause</div>
        </div>
    );
}