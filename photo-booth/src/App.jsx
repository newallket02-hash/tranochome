import React, { useState, useEffect, useRef } from 'react';
import { composeFramedPhoto } from './framePhoto';

// --- CUSTOM HOOK: Xử lý kéo thả siêu mượt cho cả chuột và cảm ứng ---
function useDraggable(initialX, initialY) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  const onPointerDown = (e) => {
    setIsDragging(true);
    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    e.target.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    setPos({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  const onPointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    style: {
      transform: `translate(${pos.x}px, ${pos.y}px)`,
      position: 'absolute',
      touchAction: 'none', // Chặn cuộn trang khi kéo thả trên điện thoại
      cursor: isDragging ? 'grabbing' : 'grab',
      zIndex: isDragging ? 50 : 10,
    },
  };
}

// Hộp chia sẻ của Windows/macOS không có lựa chọn lưu ra file, chỉ gửi sang app khác.
// Vì vậy chỉ dùng navigator.share trên thiết bị cảm ứng; máy tính thì tải file xuống.
function isTouchDevice() {
  if (typeof navigator === 'undefined') return false;
  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) return true;
  // iPadOS khai báo user agent giống máy Mac
  return /Mac/.test(navigator.userAgent) && navigator.maxTouchPoints > 1;
}

// Đổi data URL sang Blob mà không cần fetch, để cú click tải file nằm gọn
// trong thao tác của người dùng (một số trình duyệt chặn tải file sau await).
function dataUrlToBlob(dataUrl) {
  const [header, body] = dataUrl.split(',');
  const mime = (header.match(/:(.*?);/) || [])[1] || 'image/png';
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [useFallback, setUseFallback] = useState(false); // Chế độ ảnh mẫu khi lỗi Camera
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const [saveHint, setSaveHint] = useState(''); // dòng hướng dẫn sau khi bấm Lưu
  const [showSaveSheet, setShowSaveSheet] = useState(false); // xem ảnh to để nhấn giữ lưu
  const [framedImage, setFramedImage] = useState(null); // ảnh đã lồng khung photo booth để lưu

  const videoRefPhone = useRef(null);
  const videoRefCamera = useRef(null);
  const hiddenCanvasRef = useRef(null);

  // Ảnh mẫu dễ thương dùng khi không mở được Camera
  const fallbackImgUrl =
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';

  // Xin quyền mở Camera
  const startCamera = async () => {
    try {
      // Thử yêu cầu camera
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      setStream(mediaStream);
      setHasEntered(true);
    } catch (err) {
      console.warn('Không thể mở Camera, chuyển sang ảnh mẫu:', err);
      // Nếu lỗi (do trình duyệt chặn), bật chế độ Fallback
      setUseFallback(true);
      setHasEntered(true);
    }
  };

  // Gắn luồng Camera vào video
  useEffect(() => {
    if (stream) {
      if (videoRefPhone.current) videoRefPhone.current.srcObject = stream;
      if (videoRefCamera.current) videoRefCamera.current.srcObject = stream;
    }
  }, [stream, capturedImage]);

  // Lồng ảnh vào khung photo booth để lưu về máy. Ghép hỏng thì vẫn lưu được ảnh thường.
  const buildFramedImage = async (sourceUrl) => {
    setFramedImage(null);
    try {
      setFramedImage(await composeFramedPhoto(sourceUrl));
    } catch (err) {
      console.warn('Không ghép được khung, sẽ lưu ảnh không khung:', err);
    }
  };

  // Nút chụp ảnh
  const takePhoto = () => {
    if (useFallback) {
      // Nếu đang dùng ảnh mẫu thì "chụp" luôn ảnh mẫu
      setCapturedImage(fallbackImgUrl);
      buildFramedImage(fallbackImgUrl);
      return;
    }

    if (videoRefPhone.current && hiddenCanvasRef.current) {
      const video = videoRefPhone.current;
      const canvas = hiddenCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      // Lật ảnh gương
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL('image/png');
      setCapturedImage(imageUrl);
      buildFramedImage(imageUrl);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setSaveState('idle');
    setSaveHint('');
    setShowSaveSheet(false);
    setFramedImage(null);
  };

  const buildFileName = () =>
    `photo-booth-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`;

  // Ảnh đem lưu là ảnh đã lồng khung; chỉ khi ghép khung hỏng mới dùng ảnh trần
  const imageToSave = framedImage || capturedImage;

  const getBlob = async () =>
    imageToSave.startsWith('data:')
      ? dataUrlToBlob(imageToSave)
      : (await fetch(imageToSave)).blob();

  // Tải file .png xuống máy. Trên điện thoại nhiều trình duyệt (iOS Safari, một số
  // webview trong app) không tải được, nên nếu hỏng sẽ mở khung xem ảnh để nhấn giữ lưu.
  const savePhoto = async () => {
    if (!imageToSave || saveState === 'saving') return;
    setSaveState('saving');
    setSaveHint('');

    try {
      const blob = await getBlob();
      const fileName = buildFileName();
      const link = document.createElement('a');

      if (typeof link.download !== 'string') throw new Error('Trình duyệt không hỗ trợ tải file');

      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = fileName;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);

      setSaveState('saved');
      setSaveHint(
        isTouchDevice()
          ? 'Ảnh nằm trong thư mục Tải về (Downloads). Không thấy? Bấm "Xem ảnh to" rồi nhấn giữ để lưu.'
          : 'Đã tải xuống thư mục Downloads.'
      );
      setTimeout(() => setSaveState('idle'), 2500);
    } catch (err) {
      console.warn('Không tải được file, chuyển sang xem ảnh để nhấn giữ lưu:', err);
      setSaveState('idle');
      setShowSaveSheet(true);
    }
  };

  // Gửi ảnh qua hộp chia sẻ của máy (điện thoại: lưu vào thư viện ảnh, gửi Zalo/Messenger...)
  const sharePhoto = async () => {
    if (!imageToSave) return;
    try {
      const blob = await getBlob();
      const file = new File([blob], buildFileName(), { type: blob.type || 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Photo Booth' });
      } else {
        setShowSaveSheet(true);
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      console.warn('Không chia sẻ được ảnh:', err);
      setShowSaveSheet(true);
    }
  };

  // Vị trí mặc định trên màn hình
  const phoneDrag = useDraggable(20, 80);
  const cameraDrag = useDraggable(40, 480);

  // --- MÀN HÌNH CHỜ (LANDING) ---
  if (!hasEntered) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center font-sans relative overflow-hidden px-4">
        <div className="relative flex flex-col items-center mb-10 mt-10">
          <div className="w-48 h-72 bg-[#ffcbf2] border-4 border-black rounded-t-xl relative flex flex-col items-center pt-3 shadow-lg">
            <div className="bg-white border-2 border-black rounded px-3 py-1 mb-3 font-bold tracking-widest text-red-500 text-sm">
              証明写真
            </div>
            <div className="w-36 h-40 bg-[#a2d2ff] border-2 border-black flex justify-center items-end pb-2">
              <div className="w-12 h-3 bg-yellow-600 rounded-full border-2 border-black mb-1"></div>
            </div>
            <div className="absolute bottom-3 left-3 w-10 h-12 bg-yellow-200 border-2 border-black flex items-center justify-center text-[8px] text-center font-bold">
              Nhận
              <br />
              Ảnh
            </div>
          </div>

          <h1 className="handwriting text-4xl text-[#f77f00] font-bold text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] pointer-events-none drop-shadow-sm rotate-[-4deg]">
            POV: you found <br /> the cutest Photo Booth
          </h1>
        </div>

        <button
          onClick={startCamera}
          className="bg-[#2a9d8f] hover:bg-[#21867a] text-white font-bold py-3 px-10 rounded-full border-4 border-[#264653] shadow-[4px_4px_0px_#264653] transition-transform active:translate-y-1 active:shadow-[0px_0px_0px_#264653] text-xl z-10"
        >
          Enter
        </button>
        <p className="mt-4 text-xs text-gray-400 text-center px-4 max-w-xs">
          (Nếu không mở được Camera, hệ thống sẽ hiển thị ảnh mẫu để bạn trải nghiệm)
        </p>
      </div>
    );
  }

  // --- MÀN HÌNH CHÍNH (Đã vào trong) ---
  return (
    <div
      className="min-h-screen bg-[#f8f9fa] overflow-hidden relative touch-none"
      style={{
        backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
        backgroundSize: '16px 16px',
      }}
    >
      {useFallback && !capturedImage && (
        <div className="absolute top-16 w-full text-center z-0">
          <p className="text-red-400 text-xs font-bold bg-red-50 inline-block px-3 py-1 rounded-full border border-red-200">
            ⚠️ Đang dùng ảnh mẫu do Camera bị chặn
          </p>
        </div>
      )}

      {/* Dòng chữ trang trí nền */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 px-2">
        <h1 className="handwriting text-4xl sm:text-5xl text-[#f77f00] font-bold text-center leading-tight opacity-50 rotate-[-5deg]">
          POV: you found <br /> the cutest Photo Booth
        </h1>
      </div>

      {/* Thanh công cụ ở trên cùng */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-full px-2 flex flex-col items-center gap-2">
        <div className="flex gap-2 justify-center flex-wrap">
          {!capturedImage ? (
            <button
              onClick={takePhoto}
              className="bg-pink-400 text-white px-5 py-2 rounded-full text-sm font-bold border-2 border-black shadow-[2px_2px_0px_black] active:translate-y-1 active:shadow-none"
            >
              📸 Chụp ảnh
            </button>
          ) : (
            <>
              <button
                onClick={retakePhoto}
                className="bg-yellow-400 text-black px-4 py-2 rounded-full text-xs sm:text-sm font-bold border-2 border-black shadow-[2px_2px_0px_black] active:translate-y-1 active:shadow-none"
              >
                🔄 Chụp lại
              </button>
              <button
                onClick={savePhoto}
                disabled={saveState === 'saving'}
                className="bg-[#2a9d8f] text-white px-4 py-2 rounded-full text-xs sm:text-sm font-bold border-2 border-black shadow-[2px_2px_0px_black] active:translate-y-1 active:shadow-none disabled:opacity-70"
              >
                {saveState === 'saving' ? '⏳ Đang lưu...' : saveState === 'saved' ? '✅ Đã tải' : '💾 Lưu về máy'}
              </button>
              <button
                onClick={() => setShowSaveSheet(true)}
                className="bg-[#a2d2ff] text-black px-4 py-2 rounded-full text-xs sm:text-sm font-bold border-2 border-black shadow-[2px_2px_0px_black] active:translate-y-1 active:shadow-none"
              >
                🔍 Xem ảnh to
              </button>
              {typeof navigator !== 'undefined' && !!navigator.share && (
                <button
                  onClick={sharePhoto}
                  className="bg-[#ffcbf2] text-black px-4 py-2 rounded-full text-xs sm:text-sm font-bold border-2 border-black shadow-[2px_2px_0px_black] active:translate-y-1 active:shadow-none"
                >
                  📤 Chia sẻ
                </button>
              )}
            </>
          )}
        </div>
        {saveHint && (
          <p className="bg-white/90 text-[11px] text-gray-700 px-3 py-1 rounded-full border border-gray-300 text-center max-w-xs">
            {saveHint}
          </p>
        )}
      </div>

      {/* --- KHUNG XEM ẢNH TO: nhấn giữ để lưu, cách chạy được trên mọi trình duyệt --- */}
      {showSaveSheet && imageToSave && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 flex flex-col items-center justify-center gap-4 p-4"
          style={{ touchAction: 'auto' }}
        >
          <p className="handwriting text-white text-2xl text-center leading-snug">
            Nhấn giữ vào ảnh → chọn <br /> "Lưu ảnh" / "Tải ảnh xuống"
          </p>
          <img
            src={imageToSave}
            alt="Ảnh vừa chụp"
            className="max-w-full max-h-[65vh] rounded-2xl border-4 border-white"
            style={{ touchAction: 'auto', WebkitTouchCallout: 'default' }}
          />
          <button
            onClick={() => setShowSaveSheet(false)}
            className="bg-yellow-400 text-black px-6 py-2 rounded-full text-sm font-bold border-2 border-black shadow-[2px_2px_0px_black] active:translate-y-1 active:shadow-none"
          >
            Đóng
          </button>
        </div>
      )}

      {/* --- KHUNG 1: ĐIỆN THOẠI NẮP GẬP --- */}
      <div {...phoneDrag} className="flex flex-col items-center drop-shadow-xl select-none">
        <div className="w-40 h-[220px] bg-[#a2d2ff] rounded-t-[2.5rem] rounded-b-xl border-[4px] border-black p-3 flex flex-col items-center relative shadow-inner pointer-events-none">
          <div className="absolute top-2 left-4 text-pink-400 text-xl">♥</div>
          <div className="absolute top-3 flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
            <div className="w-8 h-1.5 rounded-full bg-black"></div>
          </div>

          <div className="w-full mt-7 h-40 bg-yellow-50 rounded-xl border-[3px] border-black overflow-hidden relative flex items-center justify-center">
            {capturedImage ? (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            ) : useFallback ? (
              <img src={fallbackImgUrl} alt="Fallback" className="w-full h-full object-cover" />
            ) : (
              <video
                ref={videoRefPhone}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            )}
          </div>
        </div>

        <div className="w-36 h-5 bg-gray-300 border-x-[4px] border-black flex justify-between px-2 items-center pointer-events-none">
          <div className="w-full border-t-2 border-black opacity-30"></div>
        </div>

        <div className="w-40 h-[190px] bg-[#a2d2ff] rounded-b-[2.5rem] rounded-t-xl border-[4px] border-black p-3 flex flex-col items-center gap-2 pointer-events-none">
          <div className="w-14 h-14 bg-yellow-200 rounded-full border-[3px] border-black flex items-center justify-center relative mb-1">
            <div className="w-5 h-5 bg-white rounded-full border-2 border-black"></div>
          </div>
          <div className="grid grid-cols-3 gap-2 w-full px-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((btn) => (
              <div
                key={btn}
                className="w-full h-6 bg-[#ffcbf2] rounded-full border-2 border-black flex items-center justify-center font-bold text-black text-xs"
              >
                {btn}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- KHUNG 2: MÁY ẢNH KỸ THUẬT SỐ --- */}
      <div
        {...cameraDrag}
        className="w-[280px] h-48 bg-[#cce3de] rounded-[2rem] border-[4px] border-black p-3 flex flex-row items-center gap-2 drop-shadow-xl select-none"
      >
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex gap-2 pointer-events-none">
          <div className="w-8 h-2 bg-gray-800 rounded-full border border-black"></div>
        </div>

        <div className="w-3/5 h-full bg-[#ffcbf2] rounded-xl border-[3px] border-black p-2 flex flex-col relative mt-1.5 pointer-events-none">
          <div className="text-center font-bold text-[8px] mb-0.5 tracking-widest">FUJIFILM</div>
          <div className="flex-1 bg-black rounded-md border-[3px] border-gray-700 overflow-hidden relative flex items-center justify-center text-white text-[10px]">
            {capturedImage ? (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            ) : useFallback ? (
              <img src={fallbackImgUrl} alt="Fallback" className="w-full h-full object-cover" />
            ) : (
              <video
                ref={videoRefCamera}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            )}
          </div>
        </div>

        <div className="w-2/5 h-full flex flex-col items-center justify-center gap-4 mt-2 pointer-events-none">
          <div className="w-16 h-16 bg-[#ffcbf2] rounded-full border-[3px] border-black flex items-center justify-center relative shadow-sm">
            <div className="w-5 h-5 bg-gray-100 rounded-full border-2 border-black"></div>
            <div className="absolute top-1.5 w-0 h-0 border-l-[3px] border-r-[3px] border-b-[5px] border-l-transparent border-r-transparent border-b-black"></div>
            <div className="absolute bottom-1.5 w-0 h-0 border-l-[3px] border-r-[3px] border-t-[5px] border-l-transparent border-r-transparent border-t-black"></div>
            <div className="absolute left-1.5 w-0 h-0 border-t-[3px] border-b-[3px] border-r-[5px] border-t-transparent border-b-transparent border-r-black"></div>
            <div className="absolute right-1.5 w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-t-transparent border-b-transparent border-l-black"></div>
          </div>

          <div className="flex w-full justify-around px-1">
            <div className="w-7 h-7 rounded-full bg-[#a2d2ff] border-[3px] border-black flex items-center justify-center text-[7px] font-bold">
              DISP
            </div>
            <div className="w-7 h-7 rounded-full bg-yellow-200 border-[3px] border-black flex items-center justify-center text-[7px] font-bold">
              MENU
            </div>
          </div>
        </div>
      </div>

      <canvas ref={hiddenCanvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
}
