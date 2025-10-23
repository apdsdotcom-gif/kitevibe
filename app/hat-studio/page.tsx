"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export default function HatStudio() {
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [hatType, setHatType] = useState<"brown" | "black">("brown");
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const photoRef = useRef<HTMLImageElement | null>(null);
  const hatRef = useRef<HTMLImageElement | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhotoURL(URL.createObjectURL(file));
  };

  const handleMouseDown = () => setDragging(true);
  const handleMouseUp = () => setDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset((prev) => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY,
    }));
  };

  const handleZoom = (dir: "in" | "out") => {
    setScale((s) => Math.max(0.5, Math.min(2, s + (dir === "in" ? 0.1 : -0.1))));
  };

  const handleChangeHat = () =>
    setHatType((h) => (h === "brown" ? "black" : "brown"));

  const handlePreview = () => {
    const photo = photoRef.current;
    const hat = hatRef.current;
    const container = containerRef.current;
    if (!photo || !hat || !container) return;

    const rect = container.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(photo, 0, 0, rect.width, rect.height);
    const hatW = hat.naturalWidth * scale * 0.6;
    const hatH = hat.naturalHeight * scale * 0.6;
    const x = rect.width / 2 - hatW / 2 + offset.x;
    const y = rect.height / 2 - hatH / 2 + offset.y;
    ctx.drawImage(hat, x, y, hatW, hatH);

    setPreviewURL(canvas.toDataURL("image/png"));
  };

  const handleDownload = () => {
    if (!previewURL) return;
    const a = document.createElement("a");
    a.href = previewURL;
    a.download = "kite-hat-result.png";
    a.click();
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-playfair font-bold text-center mb-6">
        Kite Hat Studio
      </h1>
      <p className="text-center text-gray-700 mb-10">
        Upload foto, pilih topi, atur posisi & ukuran, lalu preview dan unduh hasilnya.
      </p>

      <div className="flex flex-col lg:flex-row justify-center items-start gap-10">
        {/* Editor */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="relative w-[300px] h-[380px] bg-[#fdf8f3] border border-[#cbb8a0] rounded-2xl shadow-md flex items-center justify-center overflow-hidden"
        >
          {photoURL ? (
            <>
              <img
                ref={photoRef}
                src={photoURL}
                alt="uploaded"
                className="absolute w-full h-full object-cover"
              />
              <img
                ref={hatRef}
                src={`/images/hat-${hatType}.png`}
                alt="hat"
                className="absolute transition-transform duration-100"
                style={{
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  left: "50%",
                  top: "50%",
                  width: "200px",
                  pointerEvents: "none",
                }}
              />
            </>
          ) : (
            <span className="text-gray-400">Upload Foto</span>
          )}
        </div>

        {/* Controls & Preview */}
        <div className="flex flex-col items-center gap-4 w-[320px]">
          <input type="file" accept="image/*" onChange={handleUpload} />

          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={handleChangeHat}
              className={`px-4 py-2 rounded-full text-white transition ${
                hatType === "brown" ? "bg-[#B08968]" : "bg-black"
              }`}
            >
              Change Hat ({hatType})
            </button>
            <button onClick={() => handleZoom("in")} className="px-3 py-2 border rounded-full">
              Zoom In
            </button>
            <button onClick={() => handleZoom("out")} className="px-3 py-2 border rounded-full">
              Zoom Out
            </button>
            <button
              onClick={handlePreview}
              className="px-4 py-2 bg-[#C47E43] text-white rounded-full hover:opacity-90"
            >
              Preview Result
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-full hover:opacity-90"
            >
              Download PNG
            </button>
          </div>

          <h2 className="text-2xl font-semibold font-playfair mt-4">Preview</h2>
          {previewURL ? (
            <motion.img
              key={previewURL}
              src={previewURL}
              alt="Preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-[300px] h-[380px] rounded-lg shadow object-cover"
            />
          ) : (
            <div className="w-[300px] h-[380px] flex items-center justify-center border border-dashed rounded-lg text-gray-500">
              Belum ada preview
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
