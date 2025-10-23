"use client";
import { useState, useRef, useEffect } from "react";

export default function HatStudio() {
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [hatType, setHatType] = useState<"brown" | "black">("brown");
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  const photoRef = useRef<HTMLImageElement | null>(null);
  const hatRef = useRef<HTMLImageElement | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhotoURL(URL.createObjectURL(file));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setDragging(false);

  const handleZoom = (direction: "in" | "out") => {
    setScale((prev) => Math.max(0.5, Math.min(2, prev + (direction === "in" ? 0.1 : -0.1))));
  };

  const handleChangeHat = () => {
    setHatType((prev) => (prev === "brown" ? "black" : "brown"));
  };

  const handlePreview = () => {
    const photo = photoRef.current;
    const hat = hatRef.current;
    if (!photo || !hat) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = photo.width;
    const height = photo.height;
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(photo, 0, 0, width, height);

    const hatWidth = hat.width * scale;
    const hatHeight = hat.height * scale;
    const x = width / 2 - hatWidth / 2 + offset.x;
    const y = height / 2 - hatHeight / 2 + offset.y;
    ctx.drawImage(hat, x, y, hatWidth, hatHeight);

    const resultURL = canvas.toDataURL("image/png");
    setPreviewURL(resultURL);
  };

  const handleDownload = () => {
    if (!previewURL) return;
    const link = document.createElement("a");
    link.href = previewURL;
    link.download = "kite-hat-result.png";
    link.click();
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-center mb-6 font-playfair">Kite Hat Studio</h1>
      <p className="text-center mb-10 text-gray-700">
        Upload your photo, choose a hat, adjust the position, preview, and download your result.
      </p>

      <div className="flex flex-col md:flex-row gap-8 justify-center">
        {/* Left side: Editor */}
        <div
          className="relative border border-gray-300 rounded-xl p-4 shadow bg-[#FAF5EE]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {photoURL ? (
            <>
              <img
                ref={photoRef}
                src={photoURL}
                alt="uploaded"
                className="w-[320px] h-[400px] object-cover rounded-md"
              />
              <img
                ref={hatRef}
                src={`/images/hat-${hatType}.png`}
                alt="hat"
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  width: "200px",
                  pointerEvents: "none",
                }}
              />
            </>
          ) : (
            <div className="w-[320px] h-[400px] flex items-center justify-center bg-gray-100 rounded-md text-gray-500">
              Upload a photo
            </div>
          )}

          <input type="file" accept="image/*" onChange={handleUpload} className="mt-4" />
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <button
              onClick={handleChangeHat}
              className={`px-4 py-2 rounded-full text-white ${
                hatType === "brown" ? "bg-[#B08968]" : "bg-black"
              }`}
            >
              Change Hat ({hatType})
            </button>
            <button onClick={() => handleZoom("in")} className="px-4 py-2 border rounded-full">
              Zoom In
            </button>
            <button onClick={() => handleZoom("out")} className="px-4 py-2 border rounded-full">
              Zoom Out
            </button>
            <button
              onClick={handlePreview}
              className="px-4 py-2 rounded-full bg-[#D18A42] text-white hover:opacity-90"
            >
              Preview Result
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-full bg-green-600 text-white hover:opacity-90"
            >
              Download PNG
            </button>
          </div>
        </div>

        {/* Right side: Preview */}
        <div className="flex flex-col items-center justify-center w-[340px]">
          <h2 className="text-2xl font-semibold font-playfair mb-3">Preview</h2>
          {previewURL ? (
            <img
              src={previewURL}
              alt="Preview"
              className="w-[320px] h-[400px] object-cover rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-[320px] h-[400px] flex items-center justify-center border border-dashed border-gray-400 text-gray-500 rounded-lg">
              No preview yet
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
