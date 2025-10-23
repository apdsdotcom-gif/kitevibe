"use client";
import React, { useState, useRef } from "react";

export default function Page() {
  const [photoDataURL, setPhotoDataURL] = useState<string | null>(null);
  const [hatType, setHatType] = useState<"brown" | "black">("brown");
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  const photoImgRef = useRef<HTMLImageElement | null>(null);
  const hatImgRef = useRef<HTMLImageElement | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoDataURL(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleZoomIn = () => setScale((prev) => prev + 0.1);
  const handleZoomOut = () => setScale((prev) => Math.max(0.1, prev - 0.1));

  const handleChangeHat = () => {
    setHatType((prev) => (prev === "brown" ? "black" : "brown"));
  };

  const handlePreview = () => {
    const photo = photoImgRef.current;
    const hat = hatImgRef.current;
    if (!photo || !hat) return;

    const canvas = document.createElement("canvas");
    canvas.width = photo.naturalWidth;
    canvas.height = photo.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(photo, 0, 0, canvas.width, canvas.height);

    const hatWidth = hat.width * scale;
    const hatHeight = hat.height * scale;
    const hatX = (canvas.width - hatWidth) / 2 + offset.x;
    const hatY = canvas.height / 3 + offset.y;

    ctx.drawImage(hat, hatX, hatY, hatWidth, hatHeight);
    setPreviewURL(canvas.toDataURL("image/png"));
  };

  const handleDownload = () => {
    if (!previewURL) return;
    const link = document.createElement("a");
    link.download = "kite-hat.png";
    link.href = previewURL;
    link.click();
  };

  const handleReset = () => {
    setPhotoDataURL(null);
    setPreviewURL(null);
    setOffset({ x: 0, y: 0 });
    setScale(1);
    setHatType("brown");
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-24 select-none">
      <h1 className="text-center font-playfair text-5xl font-bold mb-8">
        Kite Hat Studio
      </h1>
      <p className="text-center mb-10">
        Upload your photo, adjust your hat preview, then download your final
        result.
      </p>

      <div
        className="flex flex-col md:flex-row items-start justify-center gap-10"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Image Container */}
        <div className="relative w-[300px] h-[400px] bg-gray-100 rounded-lg overflow-hidden shadow-md">
          {photoDataURL ? (
            <>
              <img
                ref={photoImgRef}
                src={photoDataURL}
                alt="Uploaded"
                className="absolute inset-0 w-full h-full object-contain rounded-md"
              />
              <img
                ref={hatImgRef}
                src={`/images/hat-${hatType}.png`}
                alt="Hat"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  transformOrigin: "center",
                  cursor: "grab",
                }}
                className="absolute top-1/3 left-1/2 w-[180px] select-none"
                onMouseDown={handleMouseDown}
                draggable={false}
              />
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              No image uploaded.
            </div>
          )}
        </div>

        {/* Control Panel & Preview Side by Side */}
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="flex flex-col items-center gap-3">
            <label className="bg-[#B17C4A] text-white px-4 py-2 rounded-md cursor-pointer hover:bg-[#a06e3f]">
              Browse...
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={handleChangeHat}
              className={`px-4 py-2 rounded-md text-white font-medium shadow ${
                hatType === "brown"
                  ? "bg-[#B17C4A] hover:bg-[#a06e3f]"
                  : "bg-[#333] hover:bg-[#222]"
              }`}
            >
              Change Hat ({hatType})
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleZoomIn}
                className="px-3 py-1 border rounded-md text-sm"
              >
                Zoom In
              </button>
              <button
                onClick={handleZoomOut}
                className="px-3 py-1 border rounded-md text-sm"
              >
                Zoom Out
              </button>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={handlePreview}
                className="bg-[#B17C4A] text-white px-4 py-2 rounded-md hover:bg-[#a06e3f]"
              >
                Preview Result
              </button>
              <button
                onClick={handleDownload}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Download PNG
              </button>
            </div>

            <button
              onClick={handleReset}
              className="mt-2 bg-[#B17C4A] text-white px-4 py-2 rounded-md hover:bg-[#a06e3f]"
            >
              Start New Design
            </button>
          </div>

          {previewURL && (
            <div className="border rounded-lg p-2 bg-white shadow-md">
              <h2 className="text-sm font-semibold mb-1 text-center">
                Preview
              </h2>
              <img
                src={previewURL}
                alt="Preview"
                className="object-contain w-[300px] rounded-md"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
