// app/api/admin/generate-poster/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, theme, date, venue, colorScheme, posterImages } = await req.json();

    if (!title || !date || !venue) {
      return NextResponse.json({ error: "Missing required event details." }, { status: 400 });
    }

    const CLUB_LOGO = "https://i.postimg.cc/qB9gLwmz/Whats-App-Image-2026-09-03-at-09-49-04.jpg";
    const DEKUT_LOGO = "https://i.postimg.cc/Xq84V1xK/Dekut-logo.jpg";

    const themes: Record<string, { bg1: string; bg2: string; accent: string; cardBg: string }> = {
      forest: { bg1: "#022c22", bg2: "#064e3b", accent: "#34d399", cardBg: "#011c16" },
      earth: { bg1: "#292524", bg2: "#44403c", accent: "#fbbf24", cardBg: "#1c1917" },
      navy: { bg1: "#0f172a", bg2: "#1e3a8a", accent: "#38bdf8", cardBg: "#020617" },
      sunset: { bg1: "#4c0519", bg2: "#831843", accent: "#f472b6", cardBg: "#310410" },
    };

    const selectedTheme = themes[colorScheme || "forest"] || themes.forest;
    const imgs: string[] = Array.isArray(posterImages) ? posterImages.filter(Boolean) : [];

    let photoGridSvg = "";
    if (imgs.length > 0) {
      const imgWidth = imgs.length === 1 ? 800 : imgs.length === 2 ? 385 : 255;
      const imgHeight = 220;
      const startX = 112;
      const startY = 460;

      photoGridSvg = `
        <g id="photoGrid">
          ${imgs.slice(0, 4).map((url, idx) => {
            let x = startX;
            let y = startY;
            if (imgs.length === 2) {
              x = startX + idx * (imgWidth + 30);
            } else if (imgs.length >= 3) {
              const col = idx % 3;
              const row = Math.floor(idx / 3);
              x = startX + col * (imgWidth + 15);
              if (row > 0) y = startY + imgHeight + 15;
            }
            return `
              <g transform="translate(${x}, ${y})">
                <rect x="0" y="0" width="${imgWidth}" height="${imgHeight}" rx="14" fill="#000000" stroke="${selectedTheme.accent}" stroke-width="2" />
                <image href="${url}" x="0" y="0" width="${imgWidth}" height="${imgHeight}" rx="14" preserveAspectRatio="xMidYMid slice" />
              </g>
            `;
          }).join('')}
        </g>
      `;
    }

    const svgContent = `
      <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${selectedTheme.bg1}" />
            <stop offset="100%" stop-color="${selectedTheme.bg2}" />
          </linearGradient>
          <style>
            .title { font-family: 'Arial Black', Arial, sans-serif; font-weight: 900; fill: #ffffff; text-anchor: middle; }
            .subtitle { font-family: Arial, sans-serif; font-weight: bold; fill: ${selectedTheme.accent}; text-anchor: middle; }
            .label { font-family: Arial, sans-serif; font-weight: bold; fill: ${selectedTheme.accent}; }
            .value { font-family: Arial, sans-serif; font-weight: bold; fill: #ffffff; }
          </style>
        </defs>

        <rect width="1024" height="1024" fill="url(#bgGrad)" />
        
        <circle cx="850" cy="200" r="250" fill="${selectedTheme.accent}" opacity="0.15" filter="blur(40px)" />
        <circle cx="150" cy="850" r="300" fill="${selectedTheme.accent}" opacity="0.15" filter="blur(50px)" />

        <rect x="40" y="40" width="944" height="944" rx="24" fill="none" stroke="${selectedTheme.accent}" stroke-width="4" opacity="0.6" />

        <!-- Top Left Club Logo -->
        <g transform="translate(70, 45)">
          <rect x="0" y="0" width="84" height="84" rx="16" fill="#ffffff" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.5))" />
          <image href="${CLUB_LOGO}" x="4" y="4" width="76" height="76" rx="12" preserveAspectRatio="xMidYMid slice" />
        </g>

        <!-- Top Right University Logo -->
        <g transform="translate(870, 45)">
          <rect x="0" y="0" width="84" height="84" rx="16" fill="#ffffff" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.5))" />
          <image href="${DEKUT_LOGO}" x="4" y="4" width="76" height="76" rx="12" preserveAspectRatio="xMidYMid slice" />
        </g>

        <text x="512" y="80" class="subtitle" font-size="18" letter-spacing="2">DEDAN KIMATHI WILDLIFE &amp; ENVIRONMENTAL CLUB</text>
        <text x="512" y="105" font-family="Arial, sans-serif" font-weight="600" font-size="13" fill="#94a3b8" text-anchor="middle" letter-spacing="1">DEDAN KIMATHI UNIVERSITY OF TECHNOLOGY</text>

        <line x1="200" y1="125" x2="824" y2="125" stroke="${selectedTheme.accent}" stroke-width="2" opacity="0.4" />

        <rect x="262" y="145" width="500" height="40" rx="20" fill="${selectedTheme.bg2}" stroke="${selectedTheme.accent}" stroke-width="1.5" />
        <text x="512" y="171" class="subtitle" font-size="15" fill="#ecfdf5" letter-spacing="2">${theme ? theme.toUpperCase() : "CONSERVATION EXPEDITION"}</text>

        <text x="512" y="270" class="title" font-size="44" filter="drop-shadow(0px 4px 8px rgba(0,0,0,0.6))">${title.toUpperCase()}</text>

        ${photoGridSvg}

        <rect x="112" y="710" width="800" height="135" rx="18" fill="${selectedTheme.cardBg}" fill-opacity="0.95" stroke="${selectedTheme.accent}" stroke-width="2" />

        <g transform="translate(150, 755)">
          <circle cx="20" cy="0" r="20" fill="${selectedTheme.bg2}" />
          <text x="20" y="6" text-anchor="middle" font-size="14">📅</text>
          <text x="55" y="-5" class="label" font-size="13">DATE &amp; TIME</text>
          <text x="55" y="16" class="value" font-size="16">${date}</text>
        </g>

        <g transform="translate(540, 755)">
          <circle cx="20" cy="0" r="20" fill="${selectedTheme.bg2}" />
          <text x="20" y="6" text-anchor="middle" font-size="14">📍</text>
          <text x="55" y="-5" class="label" font-size="13">VENUE / LOCATION</text>
          <text x="55" y="16" class="value" font-size="16">${venue}</text>
        </g>

        <rect x="162" y="880" width="700" height="52" rx="26" fill="${selectedTheme.accent}" />
        <text x="512" y="913" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="#022c22" text-anchor="middle" letter-spacing="1">JOIN THE GREEN MOVEMENT • ALL STUDENTS WELCOME</text>
      </svg>
    `.trim();

    const encodedSvg = encodeURIComponent(svgContent);
    const imageUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error("Poster Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error during poster generation." },
      { status: 500 }
    );
  }
}
