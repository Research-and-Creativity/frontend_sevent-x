// Konfigurasi campaign. Ganti frameSrc & caption saat aset resmi dari panitia siap.
// Setiap key di `props` menjadi field isian pada langkah download.
const campaignData = {
  frameSrc: "/images/twibbon-frame-placeholder.svg",
  caption:
    "Saya [nama], dari [institusi], siap bersaing di SEVENT-X 2026! 🚀\n#SEVENTX #ITCompetition #SelamatBerlomba",
  props: ["nama", "institusi"],
} as const;

export default campaignData;
