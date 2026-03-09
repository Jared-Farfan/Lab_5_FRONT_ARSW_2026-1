import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const IO_BASE = import.meta.env.VITE_IO_BASE ?? 'http://localhost:3001';

export default function App() {
    const canvasRef = useRef(null);
    const [drawing, setDrawing] = useState(false);
    const [color, setColor] = useState('#000');
    const [socket, setSocket] = useState(null);

    const prevPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const s = io(IO_BASE);
        setSocket(s);

        s.on('assignColor', (assignedColor) => {
            setColor(assignedColor);
        });

        s.on('draw', (data) => {
            drawLine(data.from, data.to, data.color, false);
        });

        s.on('drawHistory', (history) => {
            for (const d of history) {
                drawLine(d.from, d.to, d.color, false);
            }
        });

        s.on('clear', () => {
            clearCanvas();
        });

        return () => {
            s.disconnect();
        };
    }, []);

    function getCanvasPos(e) {
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: (e.touches ? e.touches[0].clientX : e.clientX) - rect.left,
            y: (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
        };
    }

    function handlePointerDown(e) {
        setDrawing(true);
        prevPos.current = getCanvasPos(e);
    }

    function handlePointerMove(e) {
        if (!drawing) return;
        const newPos = getCanvasPos(e);
        drawLine(prevPos.current, newPos, color, true);
        if (socket) {
            socket.emit('draw', { from: prevPos.current, to: newPos, color });
        }
        prevPos.current = newPos;
    }

    function handlePointerUp() {
        setDrawing(false);
    }

    function drawLine(from, to, color, local = false) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        ctx.closePath();
    }

    function clearCanvas() {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    function handleClear() {
        if (socket) {
            socket.emit('clear');
        }
        clearCanvas();
    }

    return (
        <div style={{ textAlign: 'center', marginTop: 30 }}>
            <h2>Tablero colaborativo en tiempo real</h2>
            <canvas
                ref={canvasRef}
                width={700}
                height={500}
                style={{ border: '2px solid #333', background: '#fff', touchAction: 'none', cursor: 'crosshair' }}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
            />
            <div style={{ margin: '20px 0' }}>
                <button onClick={handleClear} style={{ padding: '10px 20px', fontSize: 16 }}>Borrar tablero</button>
            </div>
            <div>Tu color: <span style={{ color, fontWeight: 'bold' }}>{color}</span></div>
        </div>
    );
}
