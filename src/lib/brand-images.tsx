import { ImageResponse } from "next/og";
import { BRAND, brandFonts } from "./brand-fonts";

/**
 * Build-time brand images, served as real .png files (see app/brand/*) so GitHub Pages sends
 * the right content type and links can include the site's base path.
 */

/** A blackletter E on an ink block over a press-red rule, like a tiny masthead. */
export async function renderIcon(px: number) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: BRAND.ink,
      }}
    >
      <div
        style={{
          fontFamily: "Nameplate",
          fontSize: Math.round(px * 0.81),
          lineHeight: 1,
          color: BRAND.paper,
          marginTop: -Math.round(px * 0.09),
        }}
      >
        E
      </div>
      <div
        style={{
          width: Math.round(px * 0.62),
          height: Math.max(3, Math.round(px * 0.07)),
          background: BRAND.red,
          marginTop: Math.round(px * 0.03),
        }}
      />
    </div>,
    { width: px, height: px, fonts: await brandFonts() },
  );
}

const BEATS = [
  "NFL",
  "Coffee",
  "Mars missions",
  "Taylor Swift",
  "Formula 1",
  "Baking",
];

export const SOCIAL_CARD_ALT =
  "Extra Extra: a free personal newspaper about your teams, hobbies and interests";

/** Social card: the site's front page in miniature, so a shared link looks like a newspaper. */
export async function renderSocialCard() {
  const label = {
    fontFamily: "Display",
    fontSize: 20,
    letterSpacing: 4,
    color: BRAND.muted,
    textTransform: "uppercase" as const,
  };
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: BRAND.paper,
        padding: "36px 56px",
        color: BRAND.ink,
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", ...label }}
      >
        <span>Vol. I</span>
        <span>Printed every 6 hours</span>
        <span>Price: Free</span>
      </div>
      <div
        style={{
          display: "flex",
          height: 13,
          borderTop: `6px solid ${BRAND.ink}`,
          borderBottom: `2px solid ${BRAND.ink}`,
          marginTop: 10,
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          fontFamily: "Nameplate",
          fontSize: 132,
          lineHeight: 1.15,
        }}
      >
        Extra Extra
      </div>
      <div
        style={{
          display: "flex",
          height: 13,
          borderTop: `6px solid ${BRAND.ink}`,
          borderBottom: `2px solid ${BRAND.ink}`,
        }}
      />

      <div style={{ display: "flex", flex: 1, marginTop: 28, gap: 40 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            fontFamily: "Display",
            fontSize: 76,
            lineHeight: 0.95,
            textTransform: "uppercase",
          }}
        >
          <span>The latest on your</span>
          <span style={{ color: BRAND.red }}>teams, hobbies</span>
          <span style={{ color: BRAND.red }}>&amp; interests.</span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 330,
            borderLeft: `2px solid ${BRAND.ink}`,
            paddingLeft: 32,
            gap: 12,
          }}
        >
          <span style={{ ...label, color: BRAND.red }}>Your beats</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {BEATS.map((b, i) => (
              <span
                key={b}
                style={{
                  fontFamily: "Display",
                  fontSize: 22,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  padding: "6px 12px",
                  border: `2px solid ${BRAND.ink}`,
                  background: i < 2 ? BRAND.ink : BRAND.sheet,
                  color: i < 2 ? BRAND.paper : BRAND.ink,
                }}
              >
                {b}
              </span>
            ))}
          </div>
          <span style={{ ...label, marginTop: "auto", color: BRAND.ink }}>
            Free · No sign-up
          </span>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630, fonts: await brandFonts() },
  );
}
