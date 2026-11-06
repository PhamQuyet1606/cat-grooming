# Sạch By · Landing page

Landing page test nhu cầu dịch vụ tắm mèo tận nhà. HTML/CSS/JS thuần, không cần build.

```
index.html                  Nội dung trang
styles.css                  Giao diện
main.js                     Form, tracking, tiêu đề theo quảng cáo
config.js                   Cấu hình (link form, Pixel, Zalo, giá) — chỉ cần sửa file này
favicon.svg
google-apps-script/Code.gs  Script nhận lead và ghi vào Google Sheet
```

## Chạy thử trên máy

```bash
python3 -m http.server 8000
# mở http://localhost:8000
```

Khi `FORM_ENDPOINT` còn trống, form vẫn chạy được trên localhost (lead in ra console, không lưu). Trên tên miền thật mà chưa cấu hình, form sẽ báo lỗi để không âm thầm mất lead.

## 1. Nối form với Google Sheets

1. Tạo một Google Sheet mới, đặt tên ví dụ `Sạch By - Leads`.
2. Vào **Extensions → Apps Script**, xoá code mẫu, dán toàn bộ nội dung `google-apps-script/Code.gs`, bấm Save.
3. Bấm **Deploy → New deployment** → loại **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Cấp quyền khi được hỏi, rồi copy **Web app URL** (dạng `https://script.google.com/macros/s/.../exec`).
5. Dán URL vào `FORM_ENDPOINT` trong `config.js`.

Lead mới sẽ vào sheet `Leads` (tự tạo ở lần gửi đầu tiên). Cột **Trạng thái** để bạn tự cập nhật: Mới → Đã nhắn → Đã chốt → Đã làm → Quay lại.

> Mỗi lần sửa `Code.gs`, phải **Deploy → Manage deployments → Edit → New version** thì thay đổi mới có hiệu lực (URL giữ nguyên).

## 2. Meta Pixel

1. Vào Meta **Events Manager** → Connect data sources → Web → tạo Pixel.
2. Dán ID Pixel (dãy số) vào `META_PIXEL_ID` trong `config.js`.

Các sự kiện trang gửi đi:

| Sự kiện | Khi nào |
|---|---|
| `PageView` | mở trang |
| `InitiateCheckout` | lần đầu bấm vào form |
| `Lead` | gửi form thành công (kèm giá trị ước tính theo cân nặng × số bé) |
| `Contact` | bấm nút Zalo |

Khi tạo chiến dịch, chọn mục tiêu **Leads** và sự kiện tối ưu là **Lead**. Kiểm tra bằng tab **Test events** trong Events Manager trước khi chạy tiền thật.

## 2b. TikTok Pixel

1. TikTok Ads Manager → **Tools → Events → Web Events → Set up web events** → chọn **TikTok Pixel**, cách cài **Manually install pixel code**.
2. Copy Pixel ID (dãy chữ số, dạng `C...`) dán vào `TIKTOK_PIXEL_ID` trong `config.js`. Không cần dán đoạn code TikTok vào trang, `main.js` đã có sẵn.
3. Trang gửi `PageView` (tự động), `InitiateCheckout`, `Lead` (kèm giá trị) và `Contact` (bấm Zalo). Chọn sự kiện tối ưu là **Lead** khi tạo chiến dịch.
4. Kiểm tra bằng **Test Events** trong TikTok Events Manager.

## 3. Nút Zalo

Điền `ZALO_URL` trong `config.js`, ví dụ `https://zalo.me/0912345678` (hoặc link Zalo OA). Để trống thì các nút Zalo tự ẩn.

## 4. Link quảng cáo và tiêu đề theo thông điệp

Thêm `?v=` vào link để tiêu đề trang khớp với nội dung quảng cáo:

| `v=` | Tiêu đề |
|---|---|
| (không có) / `minhbach` | Bé không phải rời nhà. Bạn được thấy từng bước. |
| `khongstress` | Tắm sấy cho mèo mà bé không phải rời khỏi nhà. |
| `vesinh` | Dụng cụ tiệt trùng riêng cho từng bé, mở ngay trước mặt bạn. |
| `tutam` | Không còn tự tắm, tự sấy, tự dọn lông khắp nhà. |

Link mẫu cho từng mẫu quảng cáo:

```
https://<tên-miền>/?v=khongstress&utm_source=facebook&utm_medium=paid&utm_campaign=test-hn-01&utm_content=khongstress
https://<tên-miền>/?v=minhbach&utm_source=instagram&utm_medium=paid&utm_campaign=test-hn-01&utm_content=minhbach
https://<tên-miền>/?v=vesinh&utm_source=zalo&utm_medium=paid&utm_campaign=test-hn-01&utm_content=vesinh
```

Mỗi lead trong sheet đều ghi lại `v` và các tham số UTM, nên bạn so được thông điệp nào ra lead thật.

Sửa nội dung các tiêu đề trong `main.js`, biến `VARIANTS`.

## 5. Deploy lên Cloudflare Pages

1. Đẩy repo này lên GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → chọn repo.
3. Framework preset: **None**. Build command: để trống. Build output directory: `/`.
4. Deploy. Mỗi lần push lên nhánh chính, trang tự cập nhật.
5. **Custom domains** → thêm tên miền đã mua và làm theo hướng dẫn trỏ DNS.
6. Xác minh tên miền trong Meta Business Settings → Brand safety → Domains.

## 6. Ảnh

- `assets/hero.jpg` (1200×800): ảnh ở đầu trang. Nếu thiếu file này, trang tự hiện hình mèo minh hoạ (SVG trong `index.html`).
- `assets/og.jpg` (1200×630): ảnh khi chia sẻ link. Khi có tên miền, thêm vào `<head>`:
  `<meta property="og:image" content="https://<tên-miền>/assets/og.jpg">`
- Ảnh hiện tại lấy từ Pexels (miễn phí cho mục đích thương mại). Khi có ảnh tự chụp (bé sau khi sấy, túi dụng cụ tiệt trùng), thay vào cùng tên file. Nén dưới ~200KB (ví dụ bằng squoosh.app) để trang tải nhanh trên 4G.

## 7. Trang tuyển groomer (`/groomer`)

- File: `groomer.html` + `groomer.js` (dùng chung `styles.css`, `config.js`). Link nhỏ ở chân trang chủ: "Bạn là groomer? Đăng ký hợp tác".
- Link để dán vào bài tuyển: `https://sachby.com/groomer?utm_source=facebook&utm_campaign=tuyen-groomer` (đổi `utm_source` theo nơi đăng để biết groomer đến từ đâu).
- Đăng ký ghi vào sheet **Groomers** (tự tạo ở lần gửi đầu), tách khỏi sheet `Leads` của khách.
- Trang này **không** tải Meta/TikTok Pixel và không gửi sự kiện `Lead`, để quảng cáo không tối ưu nhầm sang groomer.
- Sau khi cập nhật `google-apps-script/Code.gs`: dán lại code vào Apps Script, rồi **Deploy → Manage deployments → Edit → New version** (URL giữ nguyên). Nếu chưa làm bước này, đăng ký groomer sẽ bị ghi nhầm vào sheet `Leads`.

## Checklist trước khi bật quảng cáo

- [ ] `FORM_ENDPOINT` đã điền, gửi thử 1 lead và thấy dòng mới trong sheet
- [ ] `META_PIXEL_ID` đã điền, Test events nhận được `PageView` và `Lead`
- [ ] `ZALO_URL` đã điền, bấm thử mở đúng Zalo
- [ ] Tên miền đã gắn và đã xác minh trong Meta
- [ ] Mở trang trên điện thoại thật (4G) xem lại toàn bộ
- [ ] Đã có ít nhất 1–2 groomer sẵn sàng nhận đơn
- [ ] Xoá các dòng test trong sheet
