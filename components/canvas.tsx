import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

interface Point {
  x: number;
  y: number;
  lineWidth: number;
}

export const CanvasPainter = React.forwardRef((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [lineWidth, setLineWidth] = useState<number>(50);
  const [drawHistory, setDrawHistory] = useState<Point[][]>([]);
  const [previousPoint, setPreviousPoint] = useState<Point | null>(null);

  useImperativeHandle(ref, () => ({
    exportMaskAsDataURL,
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        // context.fillStyle = "white";
        context.fillStyle = "rgba(0, 0, 0, 0)";

        context.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = ({
    nativeEvent,
  }: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = nativeEvent;
    setPreviousPoint({ x: offsetX, y: offsetY, lineWidth });
  };

  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !previousPoint) return;
    const { offsetX, offsetY } = nativeEvent;
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;

    const newPoint: Point = { x: offsetX, y: offsetY, lineWidth };
    drawBrush(context, previousPoint, newPoint);
    setPreviousPoint(newPoint);
  };

  const drawBrush = (
    context: CanvasRenderingContext2D,
    startPoint: Point,
    endPoint: Point
  ) => {
    const distance = Math.sqrt(
      Math.pow(endPoint.x - startPoint.x, 2) +
        Math.pow(endPoint.y - startPoint.y, 2)
    );
    const angle = Math.atan2(
      endPoint.y - startPoint.y,
      endPoint.x - startPoint.x
    );

    for (let i = 0; i < distance; i += lineWidth / 10) {
      // Adjust the step size for smoother strokes
      const x = startPoint.x + Math.cos(angle) * i;
      const y = startPoint.y + Math.sin(angle) * i;

      drawCircle(context, x, y, lineWidth);
    }
  };

  CanvasPainter.displayName = "CanvasPainter";

  const drawCircle = (
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    lineWidth: number
  ) => {
    // const gradient = context.createRadialGradient(x, y, 0, x, y, lineWidth / 2);
    // gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
    // gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    context.strokeStyle = "white";
    context.fillStyle = "white";

    // context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, lineWidth / 2, 0, Math.PI * 2);
    context.fill();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (previousPoint) {
      setDrawHistory([...drawHistory, [previousPoint]]);
      setPreviousPoint(null);
    }
  };

  const handleLineWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLineWidth(Number(e.target.value));
  };

  const exportMaskAsDataURL = (): string => {
    const canvas = canvasRef.current;
    return canvas ? canvas.toDataURL() : "";
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={512}
        height={512}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      <div className="space-x-4">
        <input
          type="range"
          min="1"
          max="100"
          value={lineWidth}
          onChange={handleLineWidthChange}
        />
      </div>
    </div>
  );
});
