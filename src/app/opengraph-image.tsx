import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const description =
  "designer based in Argentina. Raised by FADU & soulseek and making the internet fun (and raw) again.";

export default async function Image() {
  const fontData = await readFile(
    join(process.cwd(), "src/app/fonts/GeistMono-Regular.woff"),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafaf9",
          padding: "0 160px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Geist Mono",
            fontSize: 28,
            lineHeight: 1.6,
            color: "#52525b",
          }}
        >
          {description}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Geist Mono",
          data: fontData,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
