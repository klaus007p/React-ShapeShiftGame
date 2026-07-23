import React, { useEffect, useRef, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'



const Shapes = {
    circle: {
        id: "circle",
        path: "M50,10 a40,40 0 1,0 0.0001, 0",
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

    heart: {
        id: "heart",
        path: "M50 85 C40 75 10 55 10 30 C10 10 35 5 50 25 C65 5 90 10 90 30 C90 55 60 75 50 85 Z",
    },

    hexagram: {
        id: "hexagram",
        path: "M50 5 L61 38 H95 L68 58 L79 92 L50 72 L21 92 L32 58 L5 38 H39 Z",
    },

    arrow: {
        id: "arrow",
        path: "M10 40 H60 V20 L90 50 L60 80 V60 H10 Z",
    },
};

const SHAPE_KEYS = ["circle", "square", "triangle","diamond", "pentagon", "hexagon", "star", "heart", "hexagram", "arrow"];

function randomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


const [player, setPlayerShape] = useState("circle")
const [shapes, setShapes] = useState([]); //Falling Shapes
const [score, setScore] = useState(0);
const [lives, setLives] = useState(5); //
const [running, setRunning] = useState(false);
const spawnIntervalRef = useRef(null);
const gameTicketRef = useRef(null)
const areaRef = useRef(null)
const controls = useAnimation();


//Spawn Logic Start

useEffect(() => {
    function spawnShape() {
        const shapeType = SHAPE_KEYS[randomInt(0, SHAPE_KEYS.length - 1)];
        const left = randomInt(8 , 92); 
        const speed = randomInt(2000, 5000); // ms to fall
        const id = Math.random().toString(36).slice(2,9);
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

    if(running) {
        const base = Math.max(700, 1500 - Math.floor(score / 5) * 50);
        spawnIntervalRef.current = setInterval(spawnShape, base);

        //spawn immediately
        spawnShape();
    }

    return () => {
        clearInterval(spawnIntervalRef.current);
    };
}, [running, score]);


//Move Shapes Down!!


