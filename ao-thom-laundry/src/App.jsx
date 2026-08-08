import React, { useState } from 'react';
import {
  Sparkles,
  Truck,
  Phone,
  MessageCircle,
  Shirt,
  CheckCircle2,
  Calculator,
  ShieldCheck,
  Flame
} from 'lucide-react';

export default function App() {
  // Thông tin liên hệ từ bảng giá Áo Thơm
  const PHONE_NUM = "0969693114";
  const PHONE_DISPLAY = "0969 69 3114";

  // Trạng thái tính tiền dự tính
  const [calcType, setCalcType] = useState('laundry'); // 'laundry' | 'blanket' | 'shoes' | 'stain' | 'iron'
  const [weight, setWeight] = useState(4); // dành cho quần áo/chăn màn (kg)
  const [shoesQty, setShoesQty] = useState(1); // giặt giày (đôi)
  const [stainQty, setStainQty] = useState(2); // tẩy quần áo (cái)
  const [ironQty, setIronQty] = useState(3); // ủi đồ (cái)

  // Công thức tính tiền theo đúng bảng giá trên ảnh
  const calculateTotal = () => {
    let total = 0;
    if (calcType === 'laundry') {
      if (weight <= 0) return 0;
      if (weight < 3) {
        total = 30; // 30K đồng giá cho dưới 3kg
      } else {
        total = weight * 10; // 10K / kg cho trên 3kg
      }
    } else if (calcType === 'blanket') {
      total = weight * 25; // 25K / kg
    } else if (calcType === 'shoes') {
      total = shoesQty * 70; // 70K / đôi
    } else if (calcType === 'stain') {
      total = stainQty * 20; // 20K / cái
    } else if (calcType === 'iron') {
      total = ironQty * 5; // 5K / cái
    }
    return total;
  };

  // Tạo đường dẫn Zalo có sẵn nội dung tính tiền
  const getZaloCalcLink = () => {
    let serviceName = '';
    if (calcType === 'laundry') serviceName = `Giặt sấy quần áo (${weight}kg)`;
    else if (calcType === 'blanket') serviceName = `Giặt chăn màn (${weight}kg)`;
    else if (calcType === 'shoes') serviceName = `Giặt giày (${shoesQty} đôi)`;
    else if (calcType === 'stain') serviceName = `Tẩy quần áo (${stainQty} cái)`;
    else if (calcType === 'iron') serviceName = `Ủi đồ (${ironQty} cái)`;

    const message = `Chào Áo Thơm, tôi muốn đặt dịch vụ: ${serviceName} (Dự tính: ${calculateTotal()}K). Nhờ shop tư vấn thu gom giúp tôi!`;
    return `https://zalo.me/${PHONE_NUM}?text=${encodeURIComponent(message)}`;
  };

  const CALC_SERVICES = [
    { key: 'laundry', label: 'Giặt quần áo' },
    { key: 'blanket', label: 'Giặt chăn màn' },
    { key: 'shoes', label: 'Giặt giày' },
    { key: 'stain', label: 'Tẩy quần áo' },
    { key: 'iron', label: 'Ủi đồ' },
  ];

  const isWeightType = calcType === 'laundry' || calcType === 'blanket';
  const currentQty = isWeightType ? weight : calcType === 'shoes' ? shoesQty : calcType === 'stain' ? stainQty : ironQty;
  const qtyUnit = isWeightType ? 'kg' : calcType === 'shoes' ? 'đôi' : 'cái';

  const adjustQty = (delta) => {
    if (calcType === 'laundry' || calcType === 'blanket') setWeight((w) => Math.max(1, w + delta));
    else if (calcType === 'shoes') setShoesQty((q) => Math.max(1, q + delta));
    else if (calcType === 'stain') setStainQty((q) => Math.max(1, q + delta));
    else if (calcType === 'iron') setIronQty((q) => Math.max(1, q + delta));
  };

  const COMMITMENTS = [
    { icon: ShieldCheck, title: 'An Toàn Đồ Đạc', desc: 'Mỗi khách 1 lồng giặt riêng, không giặt chung, không thất lạc đồ.' },
    { icon: Sparkles, title: 'Sạch Thơm Lâu', desc: 'Nước xả thơm cao cấp, sấy khô mềm mại, gấp gọn trước khi giao.' },
    { icon: Truck, title: 'Giao Nhận Tận Nơi', desc: 'Free ship bán kính 2km, thu gom và trả đồ đúng hẹn.' },
    { icon: Flame, title: 'Giá Tốt Mỗi Ngày', desc: 'Bảng giá rõ ràng, minh bạch, không phát sinh chi phí ẩn.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col pb-20 md:pb-0 selection:bg-yellow-300 selection:text-blue-900">

      {/* 1. THANH THÔNG BÁO ƯU ĐÃI TRÊN CÙNG */}
      <div className="bg-yellow-400 text-blue-950 font-bold text-xs py-2 px-4 text-center flex items-center justify-center space-x-2 shadow-inner">
        <Truck className="w-4 h-4 animate-bounce" />
        <span>GIAO NHẬN TẬN NƠI - FREE SHIP BÁN KÍNH 2KM!</span>
        <span className="hidden sm:inline-block">| Hotline/Zalo: <strong>{PHONE_DISPLAY}</strong></span>
      </div>

      {/* 2. THANH MENU ĐẦU TRANG */}
      <header className="bg-[#0038A8] text-white sticky top-0 z-40 shadow-lg border-b border-blue-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo Áo Thơm */}
          <a href="#" className="flex items-center space-x-2.5 group">
            <div className="bg-white p-2 rounded-2xl shadow-md border-2 border-yellow-400 transition transform group-hover:scale-105">
              <Sparkles className="w-6 h-6 text-[#0038A8]" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight leading-none flex items-center text-white">
                Áo <span className="text-yellow-300 ml-1">thơm</span>
              </div>
              <div className="text-[10px] text-blue-200 font-medium tracking-wider uppercase">Giặt sấy sạch thơm tận nơi</div>
            </div>
          </a>

          {/* Điều hướng nhanh */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold">
            <a href="#banggia" className="hover:text-yellow-300 transition">Bảng Giá</a>
            <a href="#tinhgia" className="hover:text-yellow-300 transition">Tính Tiền Giặt</a>
            <a href="#camket" className="hover:text-yellow-300 transition">Cam Kết</a>
          </nav>

          {/* Các nút liên hệ trực tiếp */}
          <div className="flex items-center space-x-2">
            <a
              href={`tel:${PHONE_NUM}`}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-md transition transform active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Gọi Ngay</span>
            </a>
            <a
              href={`https://zalo.me/${PHONE_NUM}`}
              target="_blank"
              rel="noreferrer"
              className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center space-x-1.5 shadow-md transition transform active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-blue-950" />
              <span>Zalo {PHONE_DISPLAY}</span>
            </a>
          </div>
        </div>
      </header>

      {/* 3. KHU VỰC HERO GIỚI THIỆU */}
      <section className="bg-gradient-to-b from-[#0038A8] via-[#002f90] to-blue-900 text-white pt-10 pb-16 px-4 relative overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          {/* Thông điệp bên trái */}
          <div className="md:col-span-7 space-y-5 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 bg-yellow-400/20 border border-yellow-300/40 text-yellow-300 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide">
              <Sparkles className="w-4 h-4" />
              <span>Sạch Sâu - Thơm Lâu - Gấp Gọn Mặc Ngay</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
              GIẶT SẤY CHUYÊN NGHIỆP <br />
              <span className="text-yellow-300 underline decoration-yellow-400 decoration-wavy decoration-2">CHỈ TỪ 10K/KG</span>
            </h1>

            <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-xl mx-auto md:mx-0">
              Tiệm giặt sấy Áo Thơm nhận giặt sấy quần áo, giặt chăn màn, vệ sinh giày, tẩy vết bẩn và ủi đồ.
              Giao nhận tận nơi siêu tốc - Miễn phí ship bán kính 2km!
            </p>

            {/* Các điểm mạnh */}
            <div className="pt-1 flex flex-wrap justify-center md:justify-start gap-2 text-xs font-semibold">
              <div className="bg-blue-800/80 border border-blue-700 px-3 py-1.5 rounded-lg flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-yellow-300" />
                <span>Mỗi khách 1 lồng giặt riêng</span>
              </div>
              <div className="bg-blue-800/80 border border-blue-700 px-3 py-1.5 rounded-lg flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-yellow-300" />
                <span>Free Ship bán kính 2km</span>
              </div>
            </div>

            {/* NÚT BẤM LIÊN HỆ TRỰC TIẾP (KHÔNG DÙNG FORM) */}
            <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <a
                href={`https://zalo.me/${PHONE_NUM}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-4 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black rounded-2xl shadow-xl transition transform active:scale-95 text-base flex items-center space-x-2"
              >
                <MessageCircle className="w-5 h-5 fill-blue-950" />
                <span>Nhắn Zalo Đặt Đồ Ngay</span>
              </a>
              <a
                href={`tel:${PHONE_NUM}`}
                className="px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-xl transition transform active:scale-95 text-base flex items-center space-x-2"
              >
                <Phone className="w-5 h-5" />
                <span>Gọi Hotline: {PHONE_DISPLAY}</span>
              </a>
            </div>
          </div>

          {/* Thẻ dịch vụ nhanh bên phải */}
          <div className="md:col-span-5 flex justify-center">
            <div className="w-full max-w-sm bg-white text-slate-800 rounded-3xl p-6 shadow-2xl border-4 border-yellow-400 relative">
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-blue-950 font-black text-xs px-3 py-1 rounded-full shadow-md uppercase">
                Free Ship 2KM
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 text-[#0038A8] rounded-2xl mx-auto flex items-center justify-center shadow-inner">
                  <Shirt className="w-8 h-8" />
                </div>
                <h3 className="font-black text-xl text-[#0038A8]">GIẶT SẤY ÁO THƠM</h3>
                <p className="text-xs text-slate-500">Chỉ cần 1 cú chạm để mở Zalo chat trực tiếp với tiệm!</p>

                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-left space-y-2 text-xs">
                  <div className="flex items-center space-x-2 text-blue-900 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Giặt sấy (&lt; 3kg): Chỉ 30K / lần</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[#0038A8] font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Giặt sấy (&gt; 3kg): Chỉ 10K / kg</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-900 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Giặt chăn màn: 25K / kg</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-900 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Giặt giày chuyên sâu: 70K / đôi</span>
                  </div>
                </div>

                <a
                  href={`https://zalo.me/${PHONE_NUM}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 bg-[#0038A8] hover:bg-blue-800 text-white font-black rounded-xl text-sm flex items-center justify-center space-x-2 shadow-lg transition"
                >
                  <MessageCircle className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  <span>Bấm Vào Đây Để Nhắn Zalo</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BẢNG GIÁ CHÍNH THỨC TỪ ẢNH MẪU */}
      <section id="banggia" className="py-16 px-4 bg-slate-100">
        <div className="max-w-4xl mx-auto space-y-8">

          <div className="text-center space-y-2">
            <span className="text-[#0038A8] font-bold text-xs uppercase tracking-widest bg-blue-100 px-3 py-1 rounded-full">
              Bảng Giá Niêm Yết
            </span>
            <h2 className="text-3xl font-black text-slate-900">BẢNG GIÁ DỊCH VỤ GIẶT SẤY</h2>
            <p className="text-slate-500 text-xs sm:text-sm">Bảng giá thực tế tại Tiệm Giặt Sấy Áo Thơm</p>
          </div>

          {/* TÁI HIỆN TƯƠNG TỰ BẢNG GIÁ TRÊN ẢNH 1857.PNG */}
          <div className="bg-[#0038A8] text-white rounded-3xl p-5 sm:p-8 shadow-2xl border-4 border-dashed border-white relative overflow-hidden">

            <div className="text-center border-b border-blue-700/80 pb-6 mb-6">
              <div className="inline-block text-3xl sm:text-5xl font-black tracking-tight text-white mb-1">
                Áo <span className="text-yellow-300">thơm</span>
              </div>
              <div className="text-2xl sm:text-4xl font-black tracking-wider text-yellow-300 uppercase">
                BẢNG GIÁ DỊCH VỤ GIẶT SẤY
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">

              {/* Cột trái: DỊCH VỤ GIẶT SẤY */}
              <div className="bg-blue-900/60 rounded-2xl p-5 border-2 border-white/80 space-y-5">
                <div className="flex items-center space-x-3 pb-3 border-b border-blue-700">
                  <div className="p-2.5 bg-white text-[#0038A8] rounded-xl shadow">
                    <Shirt className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-white tracking-wide">DỊCH VỤ GIẶT SẤY</h3>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-dashed border-blue-700">
                  <div>
                    <div className="text-base sm:text-lg font-bold text-yellow-300 flex items-center">
                      <span className="mr-1.5 text-yellow-400">●</span> Giặt sấy
                    </div>
                    <div className="text-xs text-yellow-200 pl-4 font-semibold">(&lt; 3kg)</div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-black text-yellow-300">30K</span>
                    <span className="text-xs text-slate-200 block">/ lần</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-dashed border-blue-700">
                  <div>
                    <div className="text-base sm:text-lg font-bold text-yellow-300 flex items-center">
                      <span className="mr-1.5 text-yellow-400">●</span> Giặt sấy
                    </div>
                    <div className="text-xs text-yellow-200 pl-4 font-semibold">(&gt; 3kg)</div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-black text-yellow-300">10K</span>
                    <span className="text-xs text-slate-200 block">/ kg</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-base sm:text-lg font-bold text-yellow-300 flex items-center">
                      <span className="mr-1.5 text-yellow-400">●</span> Giặt chăn màn
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-black text-yellow-300">25K</span>
                    <span className="text-xs text-slate-200 block">/ kg</span>
                  </div>
                </div>
              </div>

              {/* Cột phải: DỊCH VỤ KHÁC */}
              <div className="bg-blue-900/60 rounded-2xl p-5 border-2 border-yellow-400 space-y-5">
                <div className="flex items-center space-x-3 pb-3 border-b border-yellow-400/50">
                  <div className="p-2.5 bg-yellow-400 text-blue-950 rounded-xl shadow font-black">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="bg-yellow-400 text-blue-950 px-3 py-1 rounded-xl font-black text-lg">
                    DỊCH VỤ KHÁC
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-dashed border-blue-700">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">●</span>
                    <div className="text-base sm:text-lg font-bold text-white">Giặt giày</div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-black text-yellow-300">70K</span>
                    <span className="text-xs text-slate-200 block">/ đôi</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-dashed border-blue-700">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">●</span>
                    <div className="text-base sm:text-lg font-bold text-white">Tẩy quần áo</div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-black text-yellow-300">20K</span>
                    <span className="text-xs text-slate-200 block">/ cái</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">●</span>
                    <div className="text-base sm:text-lg font-bold text-white">Ủi đồ</div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-black text-yellow-300">5K</span>
                    <span className="text-xs text-slate-200 block">/ cái</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Chân bảng giá: Nút Free Ship & Zalo */}
            <div className="mt-8 pt-6 border-t border-blue-700 space-y-4">
              <div className="bg-white text-[#0038A8] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-red-100 text-red-600 rounded-xl">
                    <Truck className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-[#0038A8] tracking-tight">
                      FREE SHIP <span className="text-red-600">BÁN KÍNH 2KM</span>
                    </div>
                    <div className="text-xs text-slate-500">Chỉ cần bấm nhắn Zalo, tiệm cho nhân viên đến lấy đồ!</div>
                  </div>
                </div>

                <a
                  href={`https://zalo.me/${PHONE_NUM}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl text-sm flex items-center space-x-2 shadow-md shrink-0 w-full sm:w-auto justify-center"
                >
                  <MessageCircle className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  <span>Bấm Chat Zalo Ngay</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. CÔNG CỤ TÍNH TIỀN TỰ ĐỘNG */}
      <section id="tinhgia" className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-1.5 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
              <Calculator className="w-4 h-4" />
              <span>Tính Giá Nhanh</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">TÍNH TIỀN GIẶT DỰ TÍNH</h2>
            <p className="text-xs sm:text-sm text-slate-500">Ước tính giá xong bấm nhắn Zalo gửi tiệm ngay</p>
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">

            {/* Nút chọn loại dịch vụ */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Chọn dịch vụ</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {CALC_SERVICES.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setCalcType(item.key)}
                    className={`px-2 py-3 rounded-xl text-xs sm:text-sm font-bold border-2 transition ${
                      calcType === item.key
                        ? 'bg-[#0038A8] border-[#0038A8] text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nhập số lượng */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">
                {isWeightType ? 'Khối lượng (kg)' : calcType === 'shoes' ? 'Số đôi giày' : calcType === 'stain' ? 'Số cái cần tẩy' : 'Số cái cần ủi'}
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => adjustQty(-1)}
                  className="w-11 h-11 rounded-xl bg-slate-200 hover:bg-slate-300 font-black text-xl text-slate-700 shrink-0"
                >
                  −
                </button>
                <div className="flex-1 text-center py-2.5 bg-white border-2 border-slate-200 rounded-xl font-black text-xl text-[#0038A8]">
                  {currentQty}
                  <span className="text-xs font-semibold text-slate-400 ml-1">{qtyUnit}</span>
                </div>
                <button
                  type="button"
                  onClick={() => adjustQty(1)}
                  className="w-11 h-11 rounded-xl bg-[#0038A8] hover:bg-blue-800 font-black text-xl text-white shrink-0"
                >
                  +
                </button>
              </div>
            </div>

            {/* Kết quả tính tiền */}
            <div className="bg-gradient-to-r from-[#0038A8] to-blue-700 rounded-2xl p-5 flex items-center justify-between text-white shadow-lg">
              <div>
                <div className="text-xs text-blue-200 font-semibold uppercase">Số tiền dự tính</div>
                <div className="text-3xl sm:text-4xl font-black text-yellow-300">
                  {calculateTotal().toLocaleString('vi-VN')}.000đ
                </div>
              </div>
              <Calculator className="w-10 h-10 text-blue-300" />
            </div>

            <a
              href={getZaloCalcLink()}
              target="_blank"
              rel="noreferrer"
              className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black rounded-2xl text-sm sm:text-base flex items-center justify-center space-x-2 shadow-lg transition transform active:scale-95"
            >
              <MessageCircle className="w-5 h-5 fill-blue-950" />
              <span>Gửi Yêu Cầu Qua Zalo</span>
            </a>
          </div>
        </div>
      </section>

      {/* 6. CAM KẾT CHẤT LƯỢNG */}
      <section id="camket" className="py-16 px-4 bg-slate-100">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[#0038A8] font-bold text-xs uppercase tracking-widest bg-blue-100 px-3 py-1 rounded-full">
              Cam Kết Áo Thơm
            </span>
            <h2 className="text-3xl font-black text-slate-900">VÌ SAO CHỌN ÁO THƠM?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {COMMITMENTS.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 shadow-md border border-slate-200 text-center space-y-3 hover:shadow-xl transition">
                <div className="w-14 h-14 bg-blue-100 text-[#0038A8] rounded-2xl mx-auto flex items-center justify-center">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="font-black text-sm text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-[#0038A8] text-blue-100 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="text-2xl font-black text-white flex items-center justify-center md:justify-start">
              Áo <span className="text-yellow-300 ml-1">thơm</span>
            </div>
            <p className="text-xs mt-1">Giặt sấy sạch thơm tận nơi &middot; Free ship bán kính 2km</p>
          </div>
          <div className="flex items-center space-x-3">
            <a href={`tel:${PHONE_NUM}`} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <a href={`https://zalo.me/${PHONE_NUM}`} target="_blank" rel="noreferrer" className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 px-4 py-2.5 rounded-xl text-sm font-black flex items-center space-x-2">
              <MessageCircle className="w-4 h-4 fill-blue-950" />
              <span>Chat Zalo</span>
            </a>
          </div>
        </div>
        <div className="text-center text-[11px] text-blue-300 mt-6">&copy; {new Date().getFullYear()} Áo Thơm Laundry. All rights reserved.</div>
      </footer>

      {/* Thanh hành động nổi cho di động */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-slate-200 shadow-2xl flex z-50">
        <a href={`tel:${PHONE_NUM}`} className="flex-1 py-3.5 bg-emerald-500 text-white font-black text-sm flex items-center justify-center space-x-2">
          <Phone className="w-4 h-4" />
          <span>Gọi Ngay</span>
        </a>
        <a href={`https://zalo.me/${PHONE_NUM}`} target="_blank" rel="noreferrer" className="flex-1 py-3.5 bg-yellow-400 text-blue-950 font-black text-sm flex items-center justify-center space-x-2">
          <MessageCircle className="w-4 h-4 fill-blue-950" />
          <span>Chat Zalo</span>
        </a>
      </div>
    </div>
  );
}
