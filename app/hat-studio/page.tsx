"use client";
import { useRef, useState } from "react";

export default function HatStudio() {
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const photoImgRef = useRef<HTMLImageElement | null>(null);
  const hatImgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [photoDataURL, setPhotoDataURL] = useState<string | null>(null);
  const [hatType, setHatType] = useState<"brown" | "black">("brown");
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoDataURL(event.target?.result as string);
      setPreviewReady(false);
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!dragging) return;
    setOffset((prev) => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY,
    }));
  };

  const handleMouseUp = () => setDragging(false);

  const handleZoom = (direction: "in" | "out") => {
    setScale((prev) => {
      const newScale = direction === "in" ? prev + 0.1 : prev - 0.1;
      return Math.max(0.3, Math.min(newScale, 3));
    });
  };

  const handlePreview = () => {
    const photo = photoImgRef.current;
    const hat = hatImgRef.current;
    const canvas = previewCanvasRef.current;
    if (!photo || !hat || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = photo.naturalWidth;
    const height = photo.naturalHeight;
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(photo, 0, 0, width, height);

    const hatWidth = hat.naturalWidth * scale;
    const hatHeight = hat.naturalHeight * scale;
    const x = width / 2 - hatWidth / 2 + offset.x;
    const y = height / 2 - hatHeight / 2 + offset.y;

    ctx.drawImage(hat, x, y, hatWidth, hatHeight);
    setPreviewReady(true);
  };

  const handleDownload = () => {
    if (!previewCanvasRef.current) return;
    const link = document.createElement("a");
    link.download = "kite-hat-result.png";
    link.href = previewCanvasRef.current.toDataURL("image/png");
    link.click();
  };

  const handleChangeHat = () => {
    setHatType((prev) => (prev === "brown" ? "black" : "brown"));
  };

  const handleReset = () => {
    setPhotoDataURL(null);
    setPreviewReady(false);
    setOffset({ x: 0, y: 0 });
    setScale(1);
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-[#FDFBF9] text-center">
      <h1 className="text-4xl font-playfair font-bold mt-16 mb-2">Kite Hat Studio</h1>
      <p className="text-sm text-gray-700 mb-8 max-w-md">
        Upload your photo, adjust your hat preview, then download your final result.
      </p>

      <div className="flex flex-col md:flex-row gap-10 justify-center items-start">
        <div className="relative bg-[#f3ece3] p-4 rounded-2xl shadow w-[300px] h-[350px] flex justify-center items-center overflow-hidden">
          {photoDataURL ? (
            <>
              <img
                ref={photoImgRef}
                src={photoDataURL}
                alt="Uploaded"
                className="absolute w-full h-full object-cover rounded-lg"
              />
              <img
                ref={hatImgRef}
                src={`/images/hat-${hatType}.png`}
                alt="Hat"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  transition: dragging ? "none" : "transform 0.2s ease",
                  cursor: "move",
                }}
                className="absolute w-40"
              />
            </>
          ) : (
            <label className="bg-[#a67c52] text-white px-6 py-3 rounded-lg shadow cursor-pointer hover:bg-[#8c6239] transition">
              Browse...
              <input
                type="file"
                accept="image/*"
                ref={photoInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Sidebar kanan */}
        <div className="flex flex-col gap-3 items-center">
          <button
            onClick={handleChangeHat}
            className={`px-5 py-2 rounded-lg text-white font-medium transition ${
              hatType === "brown" ? "bg-[#a67c52]" : "bg-[#3a3a3a]"
            }`}
          >
            Change Hat ({hatType})
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => handleZoom("in")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              Zoom In
            </button>
            <button
              onClick={() => handleZoom("out")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              Zoom Out
            </button>
          </div>
          <button
            onClick={handlePreview}
            className="bg-[#d79a61] text-white px-6 py-2 rounded-lg hover:bg-[#c78950] transition"
          >
            Preview Result
          </button>
          <button
            onClick={handleDownload}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Download PNG
          </button>
          <button
            onClick={handleReset}
            className="bg-[#EED2B3] text-[#4B2E05] px-6 py-2 rounded-lg mt-2 hover:bg-[#e4c59e] transition"
          >
            Start New Design
          </button>
        </div>

        {previewReady && (
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-2">Preview</h2>
            <canvas ref={previewCanvasRef} className="w-[300px] h-[350px] rounded-xl shadow-md" />
          </div>
        )}
      </div>
    </main>
  );
}
