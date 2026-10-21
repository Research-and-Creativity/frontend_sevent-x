import * as z from "zod";

/**
 * Aturan password dipakai bersama oleh halaman register, reset-password, dan
 * profil (ganti password) supaya aturannya tidak berbeda-beda tiap tempat.
 * Backend memakai aturan yang sama di src/modules/auth/auth.validation.ts,
 * jadi password yang ditolak di sini juga ditolak oleh server dan sebaliknya.
 */
const PASSWORD_MIN_LENGTH = 8;

const PASSWORD_RULE_MESSAGE =
  "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number";

// Satu pemeriksaan tunggal, bukan rantai .min() + .regex(), supaya server
// selalu mengembalikan tepat satu pesan. Pada zod versi lama rantai seperti itu
// masih menambahkan pesan terpisah untuk tiap aturan yang gagal.
export const passwordSchema = z.string().superRefine((value, ctx) => {
  const panjangCukup = value.length >= PASSWORD_MIN_LENGTH;
  const memuatHurufBesar = /[A-Z]/.test(value);
  const memuatHurufKecil = /[a-z]/.test(value);
  const memuatAngka = /[0-9]/.test(value);

  if (!panjangCukup || !memuatHurufBesar || !memuatHurufKecil || !memuatAngka) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: PASSWORD_RULE_MESSAGE,
    });
  }
});

/** Untuk tempat yang memvalidasi manual (bukan lewat zod), mis. halaman profil. */
export function isPasswordStrong(password: string) {
  return passwordSchema.safeParse(password).success;
}
