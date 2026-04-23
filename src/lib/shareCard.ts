// Canvas-based PNG share card generator for Daily results.

interface ShareCardParams {
  dailyNumber: number;
  results: boolean[];
  score: number;
  streak: number;
  rank: string;
}

export async function generateShareCard(
  params: ShareCardParams
): Promise<Blob | null> {
  const { dailyNumber, results, score, streak, rank } = params;
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Background
  ctx.fillStyle = "#0f0f1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Radial glow top-left
  const g1 = ctx.createRadialGradient(200, 120, 0, 200, 120, 500);
  g1.addColorStop(0, "rgba(138, 43, 226, 0.3)");
  g1.addColorStop(1, "rgba(138, 43, 226, 0)");
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const g2 = ctx.createRadialGradient(1000, 500, 0, 1000, 500, 600);
  g2.addColorStop(0, "rgba(0, 255, 163, 0.2)");
  g2.addColorStop(1, "rgba(0, 255, 163, 0)");
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Panel
  const panelX = 60;
  const panelY = 60;
  const panelW = canvas.width - 120;
  const panelH = canvas.height - 120;
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(panelX, panelY, panelW, panelH);
  // Chunky pixel border
  ctx.fillStyle = "#2d2d44";
  ctx.fillRect(panelX - 6, panelY - 6, panelW + 12, 6);
  ctx.fillRect(panelX - 6, panelY + panelH, panelW + 12, 6);
  ctx.fillRect(panelX - 6, panelY - 6, 6, panelH + 12);
  ctx.fillRect(panelX + panelW, panelY - 6, 6, panelH + 12);

  // Title
  ctx.fillStyle = "#00ffa3";
  ctx.font = "bold 44px monospace";
  ctx.textAlign = "left";
  ctx.fillText("HISTORY_BRAIN", panelX + 40, panelY + 80);

  ctx.fillStyle = "#8888a0";
  ctx.font = "20px monospace";
  ctx.fillText(`DAILY CHALLENGE · DAY #${dailyNumber}`, panelX + 40, panelY + 114);

  // Rank pill
  ctx.fillStyle = "#ffcc00";
  ctx.fillRect(panelX + 40, panelY + 140, 200, 36);
  ctx.fillStyle = "#0f0f1a";
  ctx.font = "bold 18px monospace";
  ctx.textAlign = "center";
  ctx.fillText(rank, panelX + 140, panelY + 164);

  // Score
  ctx.fillStyle = "#ffcc00";
  ctx.font = "bold 140px monospace";
  ctx.textAlign = "left";
  ctx.fillText(String(score), panelX + 40, panelY + 340);

  ctx.fillStyle = "#8888a0";
  ctx.font = "20px monospace";
  ctx.fillText("SCORE", panelX + 40, panelY + 370);

  // Result squares
  const sqSize = 70;
  const sqGap = 16;
  const totalW = results.length * sqSize + (results.length - 1) * sqGap;
  const startX = panelX + panelW - totalW - 40;
  const startY = panelY + 220;
  results.forEach((r, i) => {
    ctx.fillStyle = r ? "#00ffa3" : "#ff3860";
    ctx.fillRect(startX + i * (sqSize + sqGap), startY, sqSize, sqSize);
  });

  // Correct/total under squares
  const correct = results.filter(Boolean).length;
  ctx.fillStyle = "#e8e8f0";
  ctx.font = "bold 36px monospace";
  ctx.textAlign = "right";
  ctx.fillText(
    `${correct}/${results.length}`,
    panelX + panelW - 40,
    startY + sqSize + 50
  );

  // Streak badge bottom
  ctx.fillStyle = "#ff6ec7";
  ctx.fillRect(panelX + 40, panelY + panelH - 100, 280, 50);
  ctx.fillStyle = "#0f0f1a";
  ctx.font = "bold 22px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`STREAK: ${streak} DAY${streak === 1 ? "" : "S"}`, panelX + 180, panelY + panelH - 68);

  // URL bottom right
  ctx.fillStyle = "#4a4a6a";
  ctx.font = "18px monospace";
  ctx.textAlign = "right";
  ctx.fillText("historybrain.app", panelX + panelW - 40, panelY + panelH - 40);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
