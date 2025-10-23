"use client";
import { useRef, useState } from "react";

export default function HatStudioPage() {
  const [photoDataURL, setPhotoDataURL] = useState<string | null>(null);
  const [hat, setHat] = useState<"brown" | "black">("brown");
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  const photoImgRef = useRef<HTMLImageElement | null>(null);
  const hatImgRef = useRef<HTMLImageElement | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoDataURL(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragStart) {
      setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  const handleZoom = (zoomIn: boolean) => {
    setScale((prev) => Math.max(0.2, zoomIn ? prev + 0.1 : prev - 0.1));
  };

  const handleHatChange = () => {
    setHat((prev) => (prev === "brown" ? "black" : "brown"));
  };

  // ✅ Generate preview before download
  const handlePreview = () => {
    const photo = photoImgRef.current;
    const hatEl = hatImgRef.current;
    if (!photo || !hatEl) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = photo.width;
    canvas.height = photo.height;
    ctx.drawImage(photo, 0, 0, photo.width, photo.height);

    const hatWidth = hatEl.width * scale;
    const hatHeight = hatEl.height * scale;
    const hatX = photo.width / 2 - hatWidth / 2 + offset.x;
    const hatY = photo.height / 4 + offset.y;

    ctx.drawImage(hatEl, hatX, hatY, hatWidth, hatHeight);
    setPreviewURL(canvas.toDataURL("image/png"));
  };

  // ✅ Download image after preview
  const handleDownload = () => {
    if (!previewURL) return;
    const a = document.createElement("a");
    a.href = previewURL;
    a.download = "kite-hat-result.png";
    a.click();
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-center mb-4">Kite Hat Studio</h1>
      <p className="text-center text-brown mb-10">
        Upload your photo, adjust your hat, preview it, then download your final result.
      </p>

      <div className="flex flex-col lg:flex-row items-start gap-10 justify-center">
        {/* Upload & Editor */}
        <div
          className="relative w-72 h-96 bg-cream shadow rounded-xl overflow-hidden flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {photoDataURL ? (
            <>
              <img
                ref={photoImgRef}
                src={photoDataURL}
                alt="Uploaded"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <img
                ref={hatImgRef}
                src={`/images/hat-${hat}.png`}
                alt="Hat"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  transformOrigin: "center top",
                  pointerEvents: "none",
                }}
                className="absolute top-1/4 left-1/2 -translate-x-1/2"
              />
            </>
          ) : (
            <p className="text-gray-500">Upload a photo to start</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 items-center justify-center">
          <input type="file" accept="image/*" onChange={handleUpload} />
          <button
            onClick={handleHatChange}
            className={`px-4 py-2 rounded-full shadow text-white ${
              hat === "brown" ? "bg-[#8B5E3C]" : "bg-black"
            }`}
          >
            Change Hat ({hat})
          </button>
          <div className="flex gap-3">
            <button onClick={() => handleZoom(true)} className="px-3 py-2 border rounded">
              Zoom In
            </button>
            <button onClick={() => handleZoom(false)} className="px-3 py-2 border rounded">
              Zoom Out
            </button>
          </div>
          <button
            onClick={handlePreview}
            className="px-4 py-2 bg-[#C97E4D] text-white rounded shadow"
          >
            Preview Result
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 text-white rounded shadow"
          >
            Download PNG
          </button>
        </div>

        {/* Preview Panel */}
        {previewURL && (
          <div className="w-72 h-96 bg-white rounded-xl shadow flex flex-col items-center justify-center">
            <p className="text-brown font-semibold mb-2">Preview</p>
            <img src={previewURL} alt="Preview" className="w-full h-full object-contain rounded" />
          </div>
        )}
      </div>
    </main>
  );
}
