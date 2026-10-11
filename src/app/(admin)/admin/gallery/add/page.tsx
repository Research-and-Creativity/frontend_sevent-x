"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateGalleryItem } from "@/hooks/use-admin";
import { getErrorMessageWithDefault } from "@/lib/errors";

export default function AdminGalleryAddPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const createMutation = useCreateGalleryItem();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  const maxSize = 5 * 1024 * 1024;

  const handleFile = (f: File) => {
    if (!allowed.includes(f.type)) {
      setError("File must be JPG, JPEG, or PNG.");
      setFile(null);
      setFileName(null);
      return;
    }
    if (f.size > maxSize) {
      setError("File must be less than 5MB.");
      setFile(null);
      setFileName(null);
      return;
    }
    setError("");
    setFile(f);
    setFileName(f.name);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Image name is required.");
      return;
    }
    if (!file) {
      setError("Please select an image.");
      return;
    }
    try {
      await createMutation.mutateAsync({ title: title.trim(), file });
      toast.success("Gambar berhasil ditambahkan.");
      router.push("/admin/gallery");
    } catch (err: unknown) {
      toast.error(getErrorMessageWithDefault(err, "Gagal menambahkan gambar"));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 mb-6">
        <h1 className="font-display text-3xl font-bold">Add Image</h1>
      </div>

      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-8">
        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label className="text-sm text-white/70">Image Name</label>
            <input
              type="text"
              placeholder="Image Name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full h-12 rounded-full border border-white/30 bg-transparent px-5 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Upload Image</label>
            <div className="mt-2 w-full aspect-video bg-neutral-200/90 rounded-lg overflow-hidden flex items-center justify-center">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-neutral-500 text-sm">
                  No image selected
                </span>
              )}
            </div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className="mt-4 border border-dashed border-white/30 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-colors"
            >
              <span className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#5B6BBF] mb-4">
                <UploadCloud className="w-7 h-7" />
              </span>
              <p className="font-medium">Drag or Upload your files here</p>
              <p className="text-xs text-white/50 mt-1">
                Upload your image.
                <br />
                (JPG, JPEG, PNG. Max 1 File and 5MB)
              </p>
              {fileName && (
                <p className="text-xs text-[#7FA7F5] mt-3">
                  Selected: {fileName}
                </p>
              )}
              {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={onChange}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="cursor-pointer bg-white text-[#5B6BBF] font-semibold text-sm px-10 py-2.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {createMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
