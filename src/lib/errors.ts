// Ambil pesan error dari respons axios untuk ditampilkan lewat toast.
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const response = (err as {
      response?: {
        data?: {
          message?: string;
          errorDetail?: Array<{ field?: string; message?: string }>;
        };
      };
    }).response;

    const details = response?.data?.errorDetail;
    if (Array.isArray(details) && details.length > 0) {
      // Tampilkan field yang gagal beserta pesan spesifiknya, supaya user
      // tahu persis input mana yang ditolak backend (bukan hanya pesan
      // generik "Validasi input gagal").
      const parts = details
        .map((d) => {
          const msg = d?.message ?? "";
          if (!msg) return null;
          return d?.field ? `${d.field}: ${msg}` : msg;
        })
        .filter((p): p is string => Boolean(p));
      if (parts.length > 0) {
        return parts.join("\n");
      }
    }

    if (response?.data?.message) return response.data.message;
  }
  return fallback;
}

// Beberapa halaman lama memakai rantai fallback
// response.data.message -> error.message -> pesan default. Helper ini
// mempertahankan perilaku tersebut tanpa memakai `any`.
export function getErrorMessageWithDefault(err: unknown, fallback: string): string {
  const message = err instanceof Error && err.message ? err.message : fallback;
  return getErrorMessage(err, message);
}
