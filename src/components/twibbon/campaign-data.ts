// Campaign configuration — swap frameSrc & edit caption/props when official assets are ready.
// Props listed here become the fill-in fields shown on the download step.
const campaignData = {
  frameSrc: "/images/twibbon-frame-placeholder.svg",
  // TODO: replace with official caption copy from SEVENT-X committee
  caption:
    "Saya [nama], dari [institusi], siap bersaing di SEVENT-X 2025! 🚀\n#SEVENTX #ITCompetition #SelamatBerlomba",
  props: ["nama", "institusi"],
} as const;

export default campaignData;
