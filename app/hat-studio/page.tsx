"use client";
import { useRef, useState } from "react";

export default function HatStudio() {
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const photoImgRef = useRef<HTMLImageElement | null>(null);
  const hatImgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [hatType, setHatType] = useState<"brown" | "black">("brown");
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);

  // Upload image
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoURL(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Drag hat
  const handleMouseDown = () => setDragging(true);
  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!dragging) return;
    setOffset((p) => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
  };
  const handleMouseUp = () => setDragging(false);

  // Zoom
  const zoom = (d: "in" | "out") =>
    setScale((s) => Math.max(0.3, Math.min(3, s + (d === "in" ? 0.1 : -0.1))));

  // Change hat color
  const changeHat = () =>
    setHatType((p) => (p === "brown" ? "black" : "brown"));

  // Reset design
  const resetAll = () => {
    setPhotoURL(null);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // Preview & Download combined fix
  const generateCanvas = (download = false) => {
    const photo = photoImgRef.current;
    const hat = hatImgRef.current;
    const canvas = canvasRef.current;
    if (!photo || !hat || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = photo.naturalWidth;
    const h = photo.naturalHeight;
    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(photo, 0, 0, w, h);

    const hw = hat.naturalWidth * scale;
    const hh = hat.naturalHeight * scale;
    const x = w / 2 - hw / 2 + offset.x;
    const y = h / 2 - hh / 2 + offset.y;

    ctx.drawImage(hat, x, y, hw, hh);

    if (download) {
      const link = document.createElement("a");
      link.download = "kite-hat-result.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-[#FDFBF9] text-center">
      <h1 className="text-4xl font-playfair font-bold mt-24 mb-2">
        Kite Hat Studio
      </h1>
      <p className="text-sm text-gray-700 mb-8 max-w-md">
        Upload your photo, adjust your hat preview, then download your final
        result.
      </p>

      <div className="flex flex-col md:flex-row gap-10 justify-center items-start">
        {/* Main Editor */}
        <div className="relative bg-[#f3ece3] p-4 rounded-2xl shadow w-[300px] h-[350px] flex justify-center items-center overflow-hidden">
          {photoURL ? (
            <>
              <img
                ref={photoImgRef}
                src={photoURL}
                alt="photo"
                className="absolute w-full h-full object-cover rounded-lg"
              />
              <img
                ref={hatImgRef}
                src={`/images/hat-${hatType}.png`}
                alt="hat"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  transition: dragging ? "none" : "transform 0.15s ease",
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
                onChange={handleFile}
                ref={photoInputRef}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 items-center">
          <button
            onClick={changeHat}
            className={`px-5 py-2 rounded-lg text-white font-medium transition ${
              hatType === "brown" ? "bg-[#a67c52]" : "bg-[#3a3a3a]"
            }`}
          >
            Change Hat ({hatType})
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => zoom("in")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              Zoom In
            </button>
            <button
              onClick={() => zoom("out")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              Zoom Out
            </button>
          </div>

          <button
            onClick={() => generateCanvas(false)}
            className="bg-[#d79a61] text-white px-6 py-2 rounded-lg hover:bg-[#c78950] transition"
          >
            Preview Result
          </button>

          <button
            onClick={() => generateCanvas(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Download PNG
          </button>

          <button
            onClick={resetAll}
            className="bg-[#EED2B3] text-[#4B2E05] px-6 py-2 rounded-lg mt-2 hover:bg-[#e4c59e] transition"
          >
            Start New Design
          </button>
        </div>

        {/* Canvas Preview */}
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2">Preview</h2>
          <canvas
            ref={canvasRef}
            className="w-[300px] h-[350px] rounded-xl shadow-md bg-[#f3ece3]"
          />
        </div>
      </div>
    </main>
  );
}
