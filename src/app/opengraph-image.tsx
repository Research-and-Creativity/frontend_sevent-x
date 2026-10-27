import { ImageResponse } from "next/og";

export const alt = "SEVENT X — Software Engineering Event";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 76px",
          color: "#ffffff",
          background:
            "linear-gradient(135deg, #05070d 0%, #0b1428 55%, #102b62 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -250,
            width: 650,
            height: 650,
            borderRadius: 325,
            border: "1px solid rgba(119, 164, 255, 0.3)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -35,
            top: -165,
            width: 480,
            height: 480,
            borderRadius: 240,
            border: "1px solid rgba(119, 164, 255, 0.2)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 5,
            color: "#a8c4ff",
          }}
        >
          SOFTWARE ENGINEERING EVENT
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 104,
              lineHeight: 1,
              fontWeight: 800,
              letterSpacing: -5,
            }}
          >
            SEVENT X
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#c4ccda",
            }}
          >
            Kompetisi teknologi untuk inovator muda Indonesia
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 20,
            letterSpacing: 3,
            color: "#8daef0",
          }}
        >
          SOFTWARE DEVELOPMENT · UI/UX DESIGN
        </div>
      </div>
    ),
    size,
  );
}
