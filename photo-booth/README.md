# POV: the cutest Photo Booth 📸

Web app photo booth dễ thương: một chiếc điện thoại nắp gập và một máy ảnh kỹ thuật số
có thể kéo thả tự do trên màn hình, cả hai cùng hiển thị luồng camera trước.
Bấm **Chụp ảnh** để lấy khung hình (đã lật gương), **Chụp lại** để quay về live view,
**Lưu về máy** để tải ảnh xuống, **Chia sẻ** để gửi qua hộp chia sẻ của máy, và
**Xem ảnh to** để nhấn giữ vào ảnh rồi lưu — cách chạy được trên mọi trình duyệt kể cả khi
tải file bị chặn.

Nếu trình duyệt chặn camera, app tự chuyển sang chế độ ảnh mẫu để vẫn trải nghiệm được.

## Công nghệ

- React 18 + Vite
- Tailwind CSS 3
- `getUserMedia` + `<canvas>` để chụp ảnh
- Pointer Events (`setPointerCapture`) để kéo thả mượt trên cả chuột lẫn cảm ứng

## Chạy tại máy

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # xuất ra dist/
```

Lưu ý: camera chỉ hoạt động trên `localhost` hoặc HTTPS.

## Deploy

Project được deploy lên Vercel (framework tự nhận diện là Vite, output `dist/`).
