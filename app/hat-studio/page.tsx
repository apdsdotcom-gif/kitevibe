"use client";
import React, { useRef, useState } from "react";

export default function Page() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [hat, setHat] = useState<"brown" | "black">("brown");
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const photoRef = useRef<HTMLImageElement | null>(null);
  const hatRef = useRef<HTMLImageElement | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setPhoto(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setOffset((prev) => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY,
    }));
  };

  const handleMouseUp = () => setDragging(false);

  const handleZoomIn = () => setScale((prev) => prev + 0.1);
  const handleZoomOut = () => setScale((prev) => Math.max(0.1, prev - 0.1));
  const toggleHat = () => setHat((prev) => (prev === "brown" ? "black" : "brown"));
  const resetDesign = () => {
    setPhoto(null);
    setPreview(null);
    setOffset({ x: 0, y: 0 });
    setScale(1);
  };

  const handlePreview = () => {
    const photoEl = photoRef.current;
    const hatEl = hatRef.current;
    if (!photoEl || !hatEl) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = photoEl.naturalWidth;
    const height = photoEl.naturalHeight;
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(photoEl, 0, 0, width, height);

    const hatWidth = hatEl.naturalWidth * scale;
    const hatHeight = hatEl.naturalHeight * scale;
    const hatX = width / 2 - hatWidth / 2 + offset.x * 2;
    const hatY = height / 4 + offset.y * 2;

    ctx.drawImage(hatEl, hatX, hatY, hatWidth, hatHeight);

    setPreview(canvas.toDataURL("image/png"));
  };

  const handleDownload = () => {
    if (!preview) return;
    const link = document.createElement("a");
    link.href = preview;
    link.download = "kite-hat.png";
    link.click();
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-28 text-center">
      <h1 className="font-playfair text-4xl font-bold mb-4">Kite Hat Studio</h1>
      <p className="text-base mb-12">
        Upload your photo, adjust your hat preview, then download your final result.
      </p>

      <div className="flex flex-col md:flex-row justify-center items-start gap-10">
        {/* Photo Area */}
        <div
          className="relative bg-[#f6f6f6] rounded-2xl shadow-md overflow-hidden w-80 h-96 mx-auto"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {photo ? (
            <>
              <img
                ref={photoRef}
                src={photo}
                alt="Uploaded"
                className="w-full h-full object-cover"
              />
              <img
                ref={hatRef}
                src={`/images/hat-${hat}.png`}
                alt="Hat"
                className="absolute cursor-move select-none"
                style={{
                  top: `25%`,
                  left: `50%`,
                  transform: `translate(-50%, -50%) scale(${scale}) translate(${offset.x}px, ${offset.y}px)`,
                  width: "200px",
                  pointerEvents: "auto",
                }}
                onMouseDown={handleMouseDown}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              No photo uploaded yet
            </div>
          )}
        </div>

        {/* Control Area */}
        <div className="flex flex-col items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="mb-2 text-sm text-gray-500"
          />
          <button
            onClick={toggleHat}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              hat === "brown" ? "bg-[#8b5e3c]" : "bg-black"
            }`}
          >
            Change Hat ({hat})
          </button>

          <div className="flex gap-2 mt-2">
            <button onClick={handleZoomIn} className="px-3 py-2 rounded-md border">
              Zoom In
            </button>
            <button onClick={handleZoomOut} className="px-3 py-2 rounded-md border">
              Zoom Out
            </button>
          </div>

          <button
            onClick={handlePreview}
            className="bg-[#c37c44] hover:bg-[#a56636] text-white px-4 py-2 mt-3 rounded-md shadow"
          >
            Preview Result
          </button>

          <button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow"
          >
            Download PNG
          </button>

          <button
            onClick={resetDesign}
            className="bg-[#c37c44] hover:bg-[#a56636] text-white px-4 py-2 mt-3 rounded-md shadow"
          >
            Start New Design
          </button>
        </div>

        {/* Preview */}
        {preview && (
          <div className="bg-[#f6f6f6] rounded-2xl shadow-md overflow-hidden w-80 h-96 mx-auto flex items-center justify-center">
            <img src={preview} alt="Preview" className="object-contain w-full h-full" />
          </div>
        )}
      </div>
    </main>
  );
}
