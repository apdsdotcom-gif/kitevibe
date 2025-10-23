"use client";
import React, { useRef, useState } from "react";

export default function Page() {
  const [photoDataURL, setPhotoDataURL] = useState<string | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [hatType, setHatType] = useState<"brown" | "black">("brown");
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const hatImgRef = useRef<HTMLImageElement | null>(null);
  const photoImgRef = useRef<HTMLImageElement | null>(null);

  // Upload photo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setPhotoDataURL(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Change hat
  const handleChangeHat = () => {
    setHatType((prev) => (prev === "brown" ? "black" : "brown"));
  };

  // Zoom
  const handleZoomIn = () => setScale((s) => s + 0.1);
  const handleZoomOut = () => setScale((s) => Math.max(0.1, s - 0.1));

  // Drag hat
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

  // Generate preview
  const handlePreview = () => {
    const photo = photoImgRef.current;
    const hat = hatImgRef.current;
    if (!photo || !hat) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = photo.naturalWidth;
    canvas.height = photo.naturalHeight;

    ctx.drawImage(photo, 0, 0, photo.naturalWidth, photo.naturalHeight);

    const hatWidth = hat.naturalWidth * scale;
    const hatHeight = hat.naturalHeight * scale;
    const hatX = photo.naturalWidth / 2 - hatWidth / 2 + offset.x * 2;
    const hatY = photo.naturalHeight / 3 + offset.y * 2;

    ctx.drawImage(hat, hatX, hatY, hatWidth, hatHeight);
    setPreviewURL(canvas.toDataURL("image/png"));
  };

  // Download final image
  const handleDownload = () => {
    if (!previewURL) return;
    const link = document.createElement("a");
    link.href = previewURL;
    link.download = "kite-hat.png";
    link.click();
  };

  // Start new design
  const handleStartNewDesign = () => {
    setPhotoDataURL(null);
    setPreviewURL(null);
    setOffset({ x: 0, y: 0 });
    setScale(1);
    setHatType("brown");
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-28 text-center">
      <h1 className="font-playfair text-4xl font-bold mb-8 mt-24">
        Kite Hat Studio
      </h1>
      <p className="text-base mb-10">
        Upload your photo, adjust your hat preview, then download your final result.
      </p>

      <div className="flex flex-col md:flex-row justify-center items-start gap-10">
        {/* Image Editor */}
        <div
          className="relative bg-[#f6f6f6] rounded-2xl shadow-md overflow-hidden w-80 h-96 mx-auto"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
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
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
              <p>No photo uploaded yet</p>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} />
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div className="flex flex-col items-center gap-3">
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
            <button onClick={handleZoomIn} className="px-3 py-1 border rounded-md text-sm">
              Zoom In
            </button>
            <button onClick={handleZoomOut} className="px-3 py-1 border rounded-md text-sm">
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
            onClick={handleStartNewDesign}
            className="bg-[#B17C4A] hover:bg-[#a06e3f] text-white px-4 py-2 rounded-md mt-2 shadow"
          >
            Start New Design
          </button>

          {previewURL && (
            <div className="mt-4 border rounded-lg p-2 bg-white shadow-md">
              <h2 className="text-sm font-semibold mb-1">Preview</h2>
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
