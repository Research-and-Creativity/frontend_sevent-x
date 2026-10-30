"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useGalleryItem,
  useUpdateGalleryItem,
  useDeleteGalleryItem,
} from "@/hooks/use-admin";
import { getErrorMessageWithDefault } from "@/lib/errors";

export default function AdminGalleryDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: item, isLoading } = useGalleryItem(id);
  const updateMutation = useUpdateGalleryItem();
  const deleteMutation = useDeleteGalleryItem();

  const [title, setTitle] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const titleValue = title ?? item?.title ?? "";

  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  const maxSize = 5 * 1024 * 1024;

  const handleFile = (f: File) => {
    if (!allowed.includes(f.type)) {
      setError("File must be JPG, JPEG, or PNG.");
      return;
    }
    if (f.size > maxSize) {
      setError("File must be less than 5MB.");
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
    const finalTitle = titleValue.trim();
    if (!finalTitle) {
      setError("Image name is required.");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id,
        title: finalTitle,
        file: file ?? undefined,
      });
      toast.success("Gambar berhasil diperbarui.");
      router.push("/admin/gallery");
    } catch (err: unknown) {
      toast.error(getErrorMessageWithDefault(err, "Gagal memperbarui gambar"));
    }
  };

  const onDelete = async () => {
    if (!confirm("Delete this image?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Gambar berhasil dihapus.");
      router.push("/admin/gallery");
    } catch (err: unknown) {
      toast.error(getErrorMessageWithDefault(err, "Gagal menghapus gambar"));
    }
  };

  const displayUrl = previewUrl ?? item?.imageUrl ?? null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 mb-6">
        <h1 className="font-display text-3xl font-bold">Detail Image</h1>
      </div>

      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-8">
        {isLoading ? (
          <div className="space-y-6">
            <div className="h-12 rounded-full bg-white/5 animate-pulse" />
            <div className="aspect-video rounded-lg bg-white/5 animate-pulse" />
          </div>
        ) : !item ? (
          <p className="py-16 text-center text-sm text-white/40">
            Gambar tidak ditemukan.
          </p>
        ) : (
          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <label className="text-sm text-white/70">Image Name</label>
              <input
                type="text"
                placeholder="Image Name"
                value={titleValue}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 w-full h-12 rounded-full border border-white/30 bg-transparent px-5 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60"
              />
            </div>

            <div>
              <label className="text-sm text-white/70">Upload Image</label>
              <div className="mt-2 w-full aspect-video bg-black/30 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center p-2">
                {displayUrl ? (
                  // no-referrer wajib: Google membalas 429 bila permintaan membawa Referer.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <span className="text-white/40 text-sm">
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

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onDelete}
                disabled={deleteMutation.isPending}
                className="cursor-pointer bg-[#3B5BFF] text-white font-semibold text-sm px-10 py-2.5 rounded-full shadow-[0_0_20px_rgba(59,91,255,0.4)] hover:bg-[#2f4bd6] transition-colors disabled:opacity-50"
              >
                Delete
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="cursor-pointer bg-white text-[#5B6BBF] font-semibold text-sm px-10 py-2.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {updateMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
