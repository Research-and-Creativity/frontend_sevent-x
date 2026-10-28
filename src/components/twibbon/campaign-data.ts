// Konfigurasi campaign. Ganti frameSrc & caption saat aset resmi dari panitia siap.
// Setiap key di `props` menjadi field isian pada langkah download.
// Caption dipisah per kompetisi karena tagar & nama kompetisinya berbeda.
const CAPTION_SOFTDEV = `🚀 READY TO BUILD THE FUTURE! 💻✨
Hi everyone! I’m [Nama] from [School], ready to take part in SEVENT X - Software Development Competition and bring my ideas into real digital solutions!

With the theme “Tech for Society: Building Smart, Scalable and Intuitive Solutions”, I am ready to participate in sustainable innovation. Let’s build great innovations and create a better future! 🚀

@se_telkomuniversity.pwt @sevent.tup (tag teman 3)
#SeventX #SoftwareEngineering #NationalCompetition #TelkomUniversity #SoftwareDevelopment`;

const CAPTION_UIUX = `🚀 READY TO BUILD THE FUTURE! 💻✨
Hi everyone! I’m [Nama] from [School], ready to take part in SEVENT X - UI/UX Design Competition and bring my ideas into real digital solutions!

With the theme “Tech for Society: Building Smart, Scalable and Intuitive Solutions”, I am ready to participate in sustainable innovation. Let’s build great innovations and create a better future! 🚀

@se_telkomuniversity.pwt @sevent.tup (tag teman 3)
#SeventX #SoftwareEngineering #NationalCompetition #TelkomUniversity #UIUXDesign`;

const campaignData = {
  frameSrc: "/images/twiboon-frame.png",
  props: ["Nama", "School"],
  defaultCompetition: "software-development",
  competitions: {
    "software-development": "Software Development",
    "ui-ux": "UI/UX Design",
  },
  captions: {
    "software-development": CAPTION_SOFTDEV,
    "ui-ux": CAPTION_UIUX,
  },
} as const;

export type CampaignCompetition = keyof typeof campaignData.captions;

export default campaignData;
