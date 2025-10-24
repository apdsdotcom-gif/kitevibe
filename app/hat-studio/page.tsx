"use client";

import { useState, useRef, useEffect } from "react";

export default function Page() {
  const [photoDataURL, setPhotoDataURL] = useState<string | null>(null);
  const [hatType, setHatType] = useState<"brown" | "black">("brown");
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const photoImgRef = useRef<HTMLImageElement | null>(null);
  const hatImgRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoDataURL(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (photoImgRef.current) {
      const img = photoImgRef.current;
      img.onload = () => {
        setImageSize({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
    }
  }, [photoDataURL]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleMouseUp = () => setDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset((prev) => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY,
    }));
  };

  const handleZoomIn = () => setScale((prev) => prev + 0.1);
  const handleZoomOut = () => setScale((prev) => Math.max(0.2, prev - 0.1));

  const handleChangeHat = () => {
    setHatType((prev) => (prev === "brown" ? "black" : "brown"));
  };

  const handleReset = () => {
    setPhotoDataURL(null);
    setPreviewURL(null);
    setOffset({ x: 0, y: 0 });
    setScale(1);
    setHatType("brown");
  };

  // ✅ FIXED: High-resolution preview and download (sharp)
  const generateCanvas = (multiplier = 1) => {
    const photoEl = photoImgRef.current;
    const hatEl = hatImgRef.current;
    if (!photoEl || !hatEl) return null;

    const width = photoEl.naturalWidth * multiplier;
    const height = photoEl.naturalHeight * multiplier;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(photoEl, 0, 0, width, height);

    const ratioX = width / photoEl.clientWidth;
    const ratioY = height / photoEl.clientHeight;

    const hatRect = hatEl.getBoundingClientRect();
    const photoRect = photoEl.getBoundingClientRect();

    const hatX = (hatRect.left - photoRect.left) * ratioX;
    const hatY = (hatRect.top - photoRect.top) * ratioY;
    const hatW = hatRect.width * ratioX;
    const hatH = hatRect.height * ratioY;

    ctx.drawImage(hatEl, hatX, hatY, hatW, hatH);
    return canvas;
  };

  const handlePreview = () => {
    const canvas = generateCanvas(2);
    if (!canvas) return;
    const dataURL = canvas.toDataURL("image/png", 1.0);
    setPreviewURL(dataURL);
  };

  const handleDownload = () => {
    const canvas = generateCanvas(1);
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "kite-hat-result.png";
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
  };

  return (
    <main className="relative overflow-hidden min-h-screen py-20 px-4 bg-[#FDF9F3] text-center">
      <h1 className="font-playfair text-4xl mb-3 text-[#3b2f1b]">Kite Hat Studio</h1>
      <p className="text-sm mb-10 text-[#5b4636]">
        Upload your photo, adjust your hat preview, then download your final result.
      </p>

      <div className="flex flex-col md:flex-row justify-center items-center gap-10">
        {/* Main Editor */}
        <div
          className="relative bg-white/90 rounded-2xl shadow-lg p-4 w-[300px] flex items-center justify-center overflow-hidden transition-all"
          style={{
            height:
              imageSize.height && imageSize.width
                ? `${(imageSize.height / imageSize.width) * 300}px`
                : "400px",
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {!photoDataURL ? (
            <label className="cursor-pointer text-sm bg-[#B17C4A] text-white px-5 py-2 rounded-md shadow hover:bg-[#a06e3f] transition">
              Browse...
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
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
                className="absolute top-1/3 left-1/2 w-[180px] select-none transition-transform duration-200"
                onMouseDown={handleMouseDown}
                draggable={false}
              />
            </>
          )}
        </div>

        {/* Control Panel */}
        <div className="flex flex-col items-center gap-3 w-[250px]">
          {/* Buttons always visible */}
          <button
            onClick={handleChangeHat}
            className={`px-4 py-2 rounded-md text-white font-medium shadow transition ${
              hatType === "brown"
                ? "bg-[#B17C4A] hover:bg-[#a06e3f]"
                : "bg-[#333] hover:bg-[#222]"
            }`}
          >
            Change Hat ({hatType})
          </button>

          <div className="flex gap-2">
            <button onClick={handleZoomIn} className="px-3 py-1 border rounded-md text-sm hover:bg-[#f5f0e8]">
              Zoom In
            </button>
            <button onClick={handleZoomOut} className="px-3 py-1 border rounded-md text-sm hover:bg-[#f5f0e8]">
              Zoom Out
            </button>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <button
              onClick={handlePreview}
              className="bg-[#B17C4A] text-white px-4 py-2 rounded-md hover:bg-[#a06e3f] transition"
            >
              Preview Result
            </button>
            <button
              onClick={handleDownload}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              Download PNG
            </button>
            <button
              onClick={handleReset}
              className="border border-[#d5bfa6] text-[#5a432b] px-4 py-2 rounded-md hover:bg-[#f6ebd8] transition"
            >
              Start New Design
            </button>
          </div>

          {previewURL && (
            <div className="mt-4 border rounded-lg p-2 bg-white shadow-md w-[270px]">
              <h2 className="text-sm font-semibold mb-1 text-[#3b2f1b]">Preview</h2>
              <img
                src={previewURL}
                alt="Preview"
                className="object-contain w-full rounded-md"
              />
            </div>
          )}
        </div>
      </div>
      {/* Animated clouds */}
      <img src="/images/cloud-1.svg" alt="" className="cloud absolute left-4 top-6 w-28" />
      <img src="/images/cloud-2.svg" alt="" className="cloud absolute left-1/4 top-24 w-24" />
      <img src="/images/cloud-1.svg" alt="" className="cloud absolute right-6 top-8 w-32" />
      <img src="/images/cloud-2.svg" alt="" className="cloud absolute right-1/4 top-24 w-24" />
      <img src="/images/cloud-1.svg" alt="" className="cloud absolute right-10 bottom-8 w-40" />
      <img src="/images/cloud-1.svg" alt="" className="cloud absolute left-10 bottom-8 w-40 opacity-70" />

      {/* Kites */}
      <img src="/images/kite-left.svg" alt="" className="kite absolute left-6 md:left-12 top-40 w-20" />
      <img src="/images/kite-right.svg" alt="" className="kite absolute right-6 md:right-12 top-40 w-20 [animation-duration:9s]" />
    </main>
  );
}
