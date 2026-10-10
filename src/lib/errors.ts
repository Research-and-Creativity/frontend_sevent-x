// Ambil pesan error dari respons axios untuk ditampilkan lewat toast.
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } })
      .response;
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
