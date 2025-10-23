"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export default function HatStudio() {
  const [photoDataURL, setPhotoDataURL] = useState<string | null>(null);
  const [hat, setHat] = useState<"black" | "brown">("black");
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const photoImgRef = useRef<HTMLImageElement | null>(null);
  const hatImgRef = useRef<HTMLImageElement | null>(null);

  // Handle photo upload
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoDataURL(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Handle hat drag
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setDragging(false);

  // Handle download
  const handleDownload = () => {
    const photo = photoImgRef.current;
    const hatEl = hatImgRef.current;
    if (!photo || !hatEl) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = photo.naturalWidth;
    canvas.height = photo.naturalHeight;

    ctx.drawImage(photo, 0, 0);
    ctx.drawImage(
      hatEl,
      canvas.width / 2 - (hatEl.width * scale) / 2 + offset.x,
      canvas.height * 0.25 + offset.y,
      hatEl.width * scale,
      hatEl.height * scale
    );

    const link = document.createElement("a");
    link.download = "kite_hat_result.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <main className="min-h-screen bg-cream text-brown px-4 py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="font-playfair text-4xl font-bold mb-2">Kite Hat Studio</h1>
        <p className="text-sm mb-8">
          Upload your photo, choose a hat, drag and resize it, then download your result.
        </p>

        {/* Upload photo */}
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="mb-6 text-sm"
        />

        {/* Preview Area */}
        <div
          className="relative mx-auto w-80 h-96 bg-white rounded-xl overflow-hidden shadow cursor-pointer select-none"
          onMouseDown={handleMouseDown}
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
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div
                style={{
                  position: "absolute",
                  top: "25%",
                  left: "50%",
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  transition: dragging ? "none" : "transform 0.1s ease-out",
                }}
              >
                <Image
                  ref={hatImgRef}
                  src={`/images/hat-${hat}.png`}
                  alt="Hat"
                  width={180}
                  height={180}
                  draggable={false}
                  className="pointer-events-none select-none"
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-brown mt-40">No photo uploaded yet.</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 mt-6 flex-wrap">
          <button
            onClick={() => setHat(hat === "black" ? "brown" : "black")}
            className="px-4 py-2 bg-brown text-cream rounded-full shadow hover:opacity-90 transition"
          >
            Change Hat ({hat})
          </button>

          <button
            onClick={() => setScale((s) => Math.min(2.5, s + 0.1))}
            className="px-4 py-2 bg-cream border border-brown rounded-full hover:bg-brown hover:text-cream transition"
          >
            Zoom In
          </button>

          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            className="px-4 py-2 bg-cream border border-brown rounded-full hover:bg-brown hover:text-cream transition"
          >
            Zoom Out
          </button>

          <button
            onClick={handleDownload}
            disabled={!photoDataURL}
            className="px-4 py-2 bg-orange-700 text-cream rounded-full shadow hover:bg-orange-800 transition disabled:opacity-50"
          >
            Download PNG
          </button>
        </div>
      </div>
    </main>
  );
}
