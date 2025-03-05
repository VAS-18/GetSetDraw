// components/DrawingCanvas.tsx
"use client";
import { useRef, useEffect, useState } from 'react';
import * as fabric from 'fabric';


const DrawingCanvas = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState(2);
  const [eraserWidth, setEraserWidth] = useState(10);
  const [draw, setDraw] = useState("Drawing");

  const colors = [
    '#000000', // Black
    '#FFFFFF', // White
    '#FF0000', // Red
    '#00FF00', // Lime
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#00FFFF', // Cyan
    '#FF00FF', // Magenta
    '#C0C0C0', // Silver
    '#808080', // Gray
    '#800000', // Maroon
    '#808000', // Olive
    '#008000', // Green
    '#800080', // Purple
    '#008080', // Teal
    '#000080', // Navy
    '#FFA500', // Orange
    '#A52A2A', // Brown
    '#FFC0CB', // Pink
    '#FFD700', // Gold
    '#ADFF2F', // Green Yellow
    '#7FFFD4', // Aquamarine
    '#F0E68C', // Khaki
    '#FF1493', // Deep Pink
    '#1E90FF', // Dodger Blue
    '#32CD32', // Lime Green
    '#FF4500', // Orange Red
    '#DA70D6', // Orchid
    '#B22222', // Firebrick
    '#FF6347', // Tomato
  ];
  

  useEffect(() => {
    if (canvasRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        height: 900,
        width: 1500,
        isDrawingMode: true
      });

      const drawingBrush = new fabric.PencilBrush(fabricCanvas);
      drawingBrush.width = brushWidth;
      drawingBrush.color = currentColor;

      const eraserBrush = new fabric.PencilBrush(fabricCanvas);
      eraserBrush.width = eraserWidth;
      eraserBrush.color = '#ffffff';
      (eraserBrush as any).globalCompositeOperation = 'destination-out';

      fabricCanvas.freeDrawingBrush = drawingBrush;
      
      setCanvas(fabricCanvas);

      return () => {
        fabricCanvas.dispose();
      }
    }
    else {
      console.log("Error Occurred while generating the canvas");
    }canvas
  }, []);

  const handleDrawingMode = () => {
    if (canvas) {
      const drawingBrush = new fabric.PencilBrush(canvas);
      drawingBrush.width = brushWidth;
      drawingBrush.color = currentColor;
      canvas.freeDrawingBrush = drawingBrush;
      setDraw("Drawing");
    }
  };

  const handleEraserMode = () => {
    if (canvas) {
      const eraserBrush = new fabric.PencilBrush(canvas);
      eraserBrush.width = eraserWidth;
      eraserBrush.color = '#ffffff';
      (eraserBrush as any).globalCompositeOperation = 'destination-out';
      canvas.freeDrawingBrush = eraserBrush;
      setDraw("Eraser");
    }
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    if (canvas && canvas.freeDrawingBrush && canvas.freeDrawingBrush.color !== '#ffffff') {
      canvas.freeDrawingBrush.color = color;
    }
  };

  const handleBrushWidthChange = (width: number) => {
    setBrushWidth(width);
    if (canvas && canvas.freeDrawingBrush && canvas.freeDrawingBrush.color !== '#ffffff') {
      canvas.freeDrawingBrush.width = width;
    }
  };

  const handleEraserWidthChange = (width: number) => {
    setEraserWidth(width);
    if (canvas && canvas.freeDrawingBrush && canvas.freeDrawingBrush.color === '#ffffff') {
      canvas.freeDrawingBrush.width = width;
    }
  };

  const handleClearCanvas = () => {
    if(canvas) {
      canvas.clear();
    }
  }

  return (
    <>
      <div className='flex-col'>
        <div className="flex gap-2 mb-2">
        <div>
          {draw}
        </div>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleDrawingMode}
          >
            Draw
          </button>
          <button 
            className="px-4 py-2 bg-red-500 text-white hover:bg-red-600"
            onClick={handleEraserMode}
          >
            Erase
          </button>
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={handleClearCanvas} 
          >
            Clear Canvas
          </button>
        </div>
        <div className="flex gap-4 mb-2">
          <div className="flex items-center gap-2">
            <label htmlFor="brushWidth" className="text-sm">Brush Width:</label>
            <input
              type="range"
              id="brushWidth"
              min="1"
              max="50"
              value={brushWidth}
              onChange={(e) => handleBrushWidthChange(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm w-6">{brushWidth}</span>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="eraserWidth" className="text-sm">Eraser Width:</label>
            <input
              type="range"
              id="eraserWidth"
              min="1"
              max="50"
              value={eraserWidth}
              onChange={(e) => handleEraserWidthChange(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm w-6">{eraserWidth}</span>
          </div>
        </div>
        <div className="flex gap-1 mb-2">
          {colors.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 border-2 ${
                currentColor === color ? 'border-gray-400' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color)}
              aria-label={`Select ${color} color`}
            />
          ))}
        </div>
        <canvas ref={canvasRef} className='border'>
        </canvas>
      </div>
    </>
  );
}

export default DrawingCanvas;