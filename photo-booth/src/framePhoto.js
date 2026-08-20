// Ghép ảnh vừa chụp vào khung photo booth để xuất file .png.
// Vẽ thẳng bằng canvas nên ảnh ra nét, không phụ thuộc thư viện ngoài.

const W = 900;
const H = 1280;

const PINK = '#ffcbf2';
const ORANGE = '#f77f00';
const CREAM = '#fffbeb';
const RED = '#ef4444';
const GRAY = '#6b7280';
const HEART_PINK = '#f472b6';

function roundRect(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith('data:')) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Không tải được ảnh để ghép khung'));
    img.src = src;
  });
}

async function ensureFont() {
  if (!document.fonts || !document.fonts.load) return;
  try {
    await document.fonts.load('64px "Indie Flower"');
    await document.fonts.ready;
  } catch {
    // Không tải được font viết tay thì dùng font thay thế, không chặn việc xuất ảnh
  }
}

function drawCover(ctx, img, x, y, w, h, radius) {
  ctx.save();
  roundRect(ctx, x, y, w, h, radius);
  ctx.clip();
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}

// Trả về data URL của ảnh đã lồng khung photo booth.
export async function composeFramedPhoto(sourceUrl) {
  const [photo] = await Promise.all([loadImage(sourceUrl), ensureFont()]);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Nền trắng để file PNG không bị trong suốt
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Thân máy màu hồng, viền đen dày kiểu vẽ tay
  ctx.fillStyle = PINK;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 14;
  roundRect(ctx, 26, 26, W - 52, H - 52, 60);
  ctx.fill();
  ctx.stroke();

  // Bảng tên "証明写真" ở đỉnh máy
  const badgeW = 380;
  const badgeH = 92;
  const badgeX = (W - badgeW) / 2;
  const badgeY = 84;
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 8;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = RED;
  ctx.font = 'bold 50px "Hiragino Sans", "Noto Sans JP", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('証明写真', W / 2, badgeY + badgeH / 2 + 2);

  // Ô ảnh
  const photoX = 88;
  const photoY = 232;
  const photoW = W - photoX * 2;
  const photoH = 724;

  ctx.fillStyle = CREAM;
  roundRect(ctx, photoX, photoY, photoW, photoH, 28);
  ctx.fill();

  drawCover(ctx, photo, photoX, photoY, photoW, photoH, 28);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 12;
  roundRect(ctx, photoX, photoY, photoW, photoH, 28);
  ctx.stroke();

  // Trái tim trang trí hai góc
  ctx.fillStyle = HEART_PINK;
  ctx.font = '54px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('♥', 74, 138);
  ctx.textAlign = 'right';
  ctx.fillText('♥', W - 74, H - 96);

  // Dòng chữ viết tay
  ctx.fillStyle = ORANGE;
  ctx.font = '68px "Indie Flower", "Comic Sans MS", cursive';
  ctx.textAlign = 'center';
  ctx.fillText('POV: you found', W / 2, 1042);
  ctx.fillText('the cutest Photo Booth', W / 2, 1112);

  // Ngày giờ chụp
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} · ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}`;
  ctx.fillStyle = GRAY;
  ctx.font = '30px system-ui, sans-serif';
  ctx.fillText(stamp, W / 2, 1188);

  return canvas.toDataURL('image/png');
}
