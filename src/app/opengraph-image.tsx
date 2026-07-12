import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const description =
  "designer based in Argentina. Raised by FADU & soulseek and making the internet fun (and raw) again.";

async function loadMonoFont(text: string) {
  const url = `https://fonts.googleapis.com/css2?family=Geist+Mono&text=${encodeURIComponent(text)}`;
  const css = await (
    await fetch(url, {
      headers: {
        // An old-browser UA gets a ttf back instead of woff2, which Satori can't parse.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
      },
    })
  ).text();

  const match = css.match(
    /src: url\((.+?)\) format\('(opentype|truetype|woff)'\)/,
  );
  if (!match) throw new Error("Could not load Geist Mono font data");

  const res = await fetch(match[1]);
  return res.arrayBuffer();
}

export default async function Image() {
  const fontData = await loadMonoFont(description);

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
