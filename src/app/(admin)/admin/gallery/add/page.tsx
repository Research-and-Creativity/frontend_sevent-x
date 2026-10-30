"use client";

import { useRef, useState, DragEvent, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useCreateGalleryItem } from "@/hooks/use-admin";
import { getErrorMessageWithDefault } from "@/lib/errors";

export default function AdminGalleryAddPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const createMutation = useCreateGalleryItem();

  const [title, setTitle] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState("");

  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  const maxSize = 5 * 1024 * 1024;
  const maxFiles = 10;

  useEffect(() => {
    return () => {
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previewUrls]);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const filesArr = Array.from(list);
    if (filesArr.length > maxFiles) {
      setError(`Maksimal ${maxFiles} file sekaligus.`);
      setFiles([]);
      setFileNames([]);
      setPreviewUrls((prev) => {
        prev.forEach((u) => URL.revokeObjectURL(u));
        return [];
      });
      return;
    }
    const accepted: File[] = [];
    const names: string[] = [];
    const previews: string[] = [];
    let err = "";
    for (const f of filesArr) {
      if (!allowed.includes(f.type)) {
        err = "File must be JPG, JPEG, or PNG.";
        continue;
      }
      if (f.size > maxSize) {
        err = "File must be less than 5MB.";
        continue;
      }
      accepted.push(f);
      names.push(f.name);
      previews.push(URL.createObjectURL(f));
    }
    setPreviewUrls((prev) => {
      prev.forEach((u) => URL.revokeObjectURL(u));
      return previews;
    });
    if (err) setError(err);
    else setError("");
    setFiles(accepted);
    setFileNames(names);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileNames((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Image name is required.");
      return;
    }
    if (files.length === 0) {
      setError("Please select at least one image.");
      return;
    }
    try {
      for (const f of files) {
        await createMutation.mutateAsync({ title: title.trim(), file: f });
      }
      toast.success(`${files.length} gambar berhasil ditambahkan.`);
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
            <div className="mt-2 w-full bg-black/30 border border-white/10 rounded-2xl overflow-hidden p-4">
              {previewUrls.length === 0 ? (
                <div className="aspect-[16/6] flex flex-col items-center justify-center text-white/40 text-sm gap-1">
                  <span>Belum ada gambar yang dipilih</span>
                  <span className="text-xs text-white/20">
                    Pilih atau drag & drop file pada area di bawah
                  </span>
                </div>
              ) : previewUrls.length === 1 ? (
                <div className="relative group max-h-96 w-full flex items-center justify-center overflow-hidden rounded-xl bg-black/40 border border-white/5 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrls[0]}
                    alt="Preview"
                    className="max-h-80 w-auto max-w-full rounded-lg object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(0)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-red-500 text-white flex items-center justify-center transition-colors border border-white/20 shadow-lg cursor-pointer"
                    title="Hapus gambar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {previewUrls.map((u, i) => (
                    <div
                      key={i}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/40"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u}
                        alt={`Preview ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-red-500 text-white flex items-center justify-center transition-colors border border-white/20 shadow-md cursor-pointer"
                        title="Hapus gambar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
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
                Upload your image(s).
                <br />
                (JPG, JPEG, PNG. Multiple files allowed, max 10 files, max 5MB each)
              </p>
              {fileNames.length > 0 && (
                <p className="text-xs text-[#7FA7F5] mt-3">
                  Selected: {fileNames.length} file(s) – {fileNames.join(", ")}
                </p>
              )}
              {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png"
                multiple
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
