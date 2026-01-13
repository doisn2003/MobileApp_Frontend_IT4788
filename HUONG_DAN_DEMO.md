# 📱 HƯỚNG DẪN DEMO SẢN PHẨM: ỨNG DỤNG "ĐI CHỢ TIỆN LỢI"

## 📋 TỔNG QUAN DỰ ÁN

**Ứng dụng "Đi Chợ Tiện Lợi"** là một ứng dụng di động toàn diện giúp quản lý sinh hoạt gia đình, đặc biệt tập trung vào việc:
- 🛒 Lập danh sách mua sắm thông minh
- ❄️ Quản lý tủ lạnh (theo dõi thực phẩm, hạn sử dụng)
- 🍳 Lên kế hoạch bữa ăn hàng ngày
- 📖 Lưu trữ và chia sẻ công thức nấu ăn
- 👥 Chia sẻ và phân công công việc trong gia đình

### Công nghệ sử dụng

**Backend:**
- Node.js + Express.js
- MongoDB (Database)
- Socket.IO (Real-time communication)
- JWT Authentication

**Frontend:**
- React Native (Expo)
- React Navigation
- Socket.IO Client
- Expo Image Picker
- SQLite (Offline storage)
- Notifee + Firebase Cloud Messaging (Push notifications)

---

## 🚀 CÀI ĐẶT VÀ CHẠY DỰ ÁN

### 1. Cài đặt Backend

```bash
# Di chuyển vào thư mục backend
cd MobileApp_Backend_IT4788

# Cài đặt dependencies
npm install

# Tạo file .env với nội dung:
# PORT=3000
# MONGODB_URI=mongodb://localhost:27017/di_cho_tien_loi
# JWT_SECRET=your_secret_key_here
# JWT_REFRESH_SECRET=your_refresh_secret_here

# Chạy server
npm start
# Server sẽ chạy tại: http://localhost:3000
```

### 2. Cài đặt Frontend

```bash
# Di chuyển vào thư mục frontend
cd MobileApp_Frontend_IT4788

# Cài đặt dependencies
npm install

# Cập nhật API URL trong file constants.js
# API_URL = "http://localhost:3000/it4788"

# Chạy ứng dụng
npx expo start

# Chọn:
# - 'a' để chạy trên Android emulator
# - 'i' để chạy trên iOS simulator
# - Quét QR code để chạy trên thiết bị thật với Expo Go
```

---

## 📱 HƯỚNG DẪN DEMO TỪNG TÍNH NĂNG

### PHẦN 1: XÁC THỰC VÀ QUẢN LÝ TÀI KHOẢN 🔐

#### 1.1. Đăng ký tài khoản mới

**Bước 1:** Mở ứng dụng, chọn "Đăng ký"

**Bước 2:** Điền thông tin:
- Tên đầy đủ: `Nguyễn Văn A`
- Username: `nguyenvana`
- Email: `nguyenvana@gmail.com`
- Mật khẩu: `123456` (ít nhất 6 ký tự)
- Xác nhận mật khẩu: `123456`

**Bước 3:** Nhấn nút "Đăng ký"

**Kết quả:** 
- Hệ thống tạo tài khoản thành công
- Tự động đăng nhập và chuyển đến màn hình chính
- ✅ **Demo point:** Hiển thị thông báo "Đăng ký thành công"

#### 1.2. Đăng nhập

**Bước 1:** Tại màn hình đăng nhập, nhập:
- Email: `nguyenvana@gmail.com`
- Mật khẩu: `123456`

**Bước 2:** Nhấn "Đăng nhập"

**Kết quả:**
- Token được lưu trữ an toàn
- Chuyển đến màn hình chính
- ✅ **Demo point:** Hiển thị tên người dùng ở header

#### 1.3. Quản lý Profile

**Bước 1:** Vào tab "Profile" (icon người dùng ở bottom navigation)

**Bước 2:** Xem thông tin cá nhân:
- Tên
- Email
- Username
- Avatar

**Bước 3:** Chỉnh sửa thông tin:
- Nhấn nút "Chỉnh sửa thông tin"
- Đổi tên thành: `Nguyễn Văn A (Updated)`
- Chọn ảnh đại diện mới (từ thư viện hoặc chụp ảnh)
- Nhấn "Lưu"

**Kết quả:**
- ✅ **Demo point:** Thông tin được cập nhật ngay lập tức
- Avatar mới hiển thị trong profile

#### 1.4. Đổi mật khẩu

**Bước 1:** Tại màn hình Profile, chọn "Đổi mật khẩu"

**Bước 2:** Nhập:
- Mật khẩu cũ: `123456`
- Mật khẩu mới: `newpassword123`
- Xác nhận mật khẩu mới: `newpassword123`

**Bước 3:** Nhấn "Đổi mật khẩu"

**Kết quả:**
- ✅ **Demo point:** Hiển thị "Đổi mật khẩu thành công"
- Yêu cầu đăng nhập lại với mật khẩu mới

---

### PHẦN 2: QUẢN LÝ NHÓM GIA ĐÌNH 👨‍👩‍👧‍👦

#### 2.1. Tạo nhóm gia đình

**Bước 1:** Sau khi đăng nhập lần đầu, hệ thống sẽ hỏi:
- "Bạn chưa có nhóm gia đình. Bạn muốn tạo mới hay tham gia nhóm?"

**Bước 2:** Chọn "Tạo nhóm mới"

**Kết quả:**
- ✅ **Demo point:** Nhóm được tạo tự động
- User hiện tại trở thành Admin của nhóm
- Hiển thị thông báo "Tạo nhóm thành công"

**💡 Lưu ý quan trọng:**
- Chỉ có thành viên trong cùng 1 nhóm mới có thể:
  - Xem chung danh sách mua sắm
  - Xem chung tủ lạnh
  - Xem chung kế hoạch ăn uống
  - Nhận thông báo real-time từ nhau

#### 2.2. Thêm thành viên vào nhóm

**Điều kiện:** Bạn phải là Admin của nhóm

**Bước 1:** Vào tab "Profile" → "Quản lý nhóm"

**Bước 2:** Nhấn nút "Thêm thành viên"

**Bước 3:** Nhập username của thành viên muốn thêm:
- Username: `nguyenvanb` (phải tồn tại trong hệ thống)

**Bước 4:** Nhấn "Thêm"

**Kết quả:**
- ✅ **Demo point:** Thành viên mới xuất hiện trong danh sách
- Thành viên mới có thể truy cập tất cả tài nguyên chung của nhóm
- Hiển thị số lượng thành viên: "3 thành viên"

#### 2.3. Xem danh sách thành viên

**Bước 1:** Tại "Quản lý nhóm", xem danh sách thành viên

**Hiển thị:**
- Avatar
- Tên
- Username
- Vai trò (Admin/Member)

**Kết quả:**
- ✅ **Demo point:** Danh sách cập nhật real-time khi có thành viên mới

#### 2.4. Xóa thành viên (Chỉ Admin)

**Bước 1:** Trong danh sách thành viên, nhấn icon "Xóa" bên cạnh thành viên

**Bước 2:** Xác nhận xóa

**Kết quả:**
- ✅ **Demo point:** Thành viên bị xóa khỏi nhóm
- Không còn quyền truy cập tài nguyên chung

---

### PHẦN 3: QUẢN LÝ THỰC PHẨM & DANH MỤC 🍖🥬

#### 3.1. Xem danh sách thực phẩm có sẵn

**Bước 1:** Vào màn hình "Thực phẩm" (từ menu hoặc khi thêm đồ vào tủ lạnh)

**Bước 2:** Xem danh sách món ăn có sẵn trong hệ thống

**Hiển thị:**
- Tên món ăn
- Hình ảnh
- Danh mục (Thịt, Rau, Trái cây, Gia vị...)
- Đơn vị tính (kg, bó, hộp...)

**Kết quả:**
- ✅ **Demo point:** Hiển thị grid/list các món ăn với ảnh đẹp

#### 3.2. Thêm thực phẩm mới

**Bước 1:** Trong màn hình "Thực phẩm", nhấn nút "+" (Thêm món mới)

**Bước 2:** Điền thông tin:
- Tên món ăn: `Thịt bò Úc`
- Chọn danh mục: `Thịt`
- Chọn đơn vị: `kg`
- Chọn ảnh: (từ thư viện hoặc chụp)

**Bước 3:** Nhấn "Lưu"

**Kết quả:**
- ✅ **Demo point:** Món ăn mới xuất hiện trong danh sách
- Ảnh được upload lên server
- Có thể sử dụng ngay cho tủ lạnh, mua sắm, meal plan

#### 3.3. Sửa thông tin thực phẩm

**Bước 1:** Long press vào món ăn cần sửa

**Bước 2:** Chọn "Chỉnh sửa"

**Bước 3:** Cập nhật thông tin:
- Đổi tên: `Thịt bò Úc Ribeye`
- Đổi ảnh (nếu cần)
- Đổi danh mục hoặc đơn vị

**Bước 4:** Nhấn "Cập nhật"

**Kết quả:**
- ✅ **Demo point:** Thông tin được cập nhật toàn hệ thống
- Các FridgeItem, ShoppingList liên quan cũng được cập nhật

#### 3.4. Xóa thực phẩm

**Bước 1:** Long press vào món ăn cần xóa

**Bước 2:** Chọn "Xóa"

**Bước 3:** Xác nhận xóa

**Kết quả:**
- ✅ **Demo point:** Món ăn bị xóa khỏi hệ thống
- ⚠️ Lưu ý: Không thể xóa nếu món đang được sử dụng trong tủ lạnh hoặc danh sách mua sắm

---

### PHẦN 4: TỦ LẠNH THÔNG MINH ❄️

#### 4.1. Xem nội dung tủ lạnh

**Bước 1:** Vào tab "Tủ lạnh" từ bottom navigation

**Bước 2:** Xem danh sách đồ trong tủ, được phân theo:
- **Ngăn đá (Freezer)**: Thực phẩm đông lạnh
- **Ngăn mát (Cooler)**: Thực phẩm tươi

**Hiển thị cho mỗi món:**
- Tên món ăn
- Ảnh
- Số lượng (ví dụ: "2 kg")
- Hạn sử dụng (ví dụ: "Hết hạn sau 3 ngày")
- Cảnh báo màu:
  - 🔴 Đỏ: Đã hết hạn hoặc còn < 1 ngày
  - 🟡 Vàng: Còn 1-3 ngày
  - 🟢 Xanh: Còn > 3 ngày

**Kết quả:**
- ✅ **Demo point:** Giao diện trực quan, dễ nhìn
- Có thể filter theo ngăn tủ

#### 4.2. Thêm đồ vào tủ lạnh

**Bước 1:** Trong màn hình "Tủ lạnh", nhấn nút "+"

**Bước 2:** Điền thông tin:

**Cách 1: Chọn món có sẵn**
- Chọn từ danh sách: `Thịt bò`
- Ngăn tủ: `Freezer` (Ngăn đá)
- Số lượng: `2`
- Đơn vị: `kg`
- Hạn sử dụng: Chọn ngày (ví dụ: 2026-02-01)
- Ghi chú: `Mua từ siêu thị Vinmart`

**Cách 2: Thêm món mới (không có trong danh sách)**
- Nhấn "Thêm món mới"
- Tên món: `Thịt gà ta`
- Danh mục: `Thịt`
- Đơn vị: `kg`
- Chọn ảnh (optional)
- Tiếp tục điền thông tin như Cách 1

**Bước 3:** Nhấn "Thêm vào tủ"

**Kết quả:**
- ✅ **Demo point:** Món ăn xuất hiện ngay trong tủ lạnh
- Tất cả thành viên trong nhóm đều thấy món mới
- Nếu là món mới, nó cũng được thêm vào danh sách Food chung

#### 4.3. Cập nhật số lượng / hạn sử dụng

**Bước 1:** Tap vào món ăn trong tủ lạnh

**Bước 2:** Trong modal chi tiết, nhấn "Chỉnh sửa"

**Bước 3:** Cập nhật:
- Số lượng mới: `1.5` (giảm từ 2 kg → 1.5 kg)
- Hạn sử dụng mới: `2026-01-25` (nếu cần)
- Ghi chú mới

**Bước 4:** Nhấn "Cập nhật"

**Kết quả:**
- ✅ **Demo point:** Thông tin được cập nhật real-time
- Các thành viên khác trong nhóm thấy thay đổi ngay lập tức

#### 4.4. Xóa đồ khỏi tủ lạnh

**Bước 1:** Swipe left vào món cần xóa

**Bước 2:** Nhấn icon "Thùng rác"

**Bước 3:** Xác nhận "Bạn muốn xóa Thịt bò khỏi tủ?"

**Kết quả:**
- ✅ **Demo point:** Món bị xóa khỏi tủ lạnh
- Các thành viên khác nhận được thông báo real-time

#### 4.5. Nhận cảnh báo hết hạn

**Kịch bản:** Có món ăn sắp hết hạn trong tủ lạnh

**Cách 1: Cảnh báo trên màn hình**
- Khi vào "Tủ lạnh", hiển thị banner đỏ ở đầu màn hình:
  - "⚠️ 2 món sắp hết hạn!"
  - Nhấn vào để xem chi tiết

**Cách 2: Push notification**
- Nhận thông báo push vào 8h sáng hàng ngày:
  - "Thịt bò trong tủ lạnh sẽ hết hạn hôm nay!"

**Kết quả:**
- ✅ **Demo point:** Tính năng thông minh giúp tránh lãng phí thực phẩm

#### 4.6. Tìm kiếm trong tủ lạnh

**Bước 1:** Nhấn icon tìm kiếm 🔍 ở đầu màn hình

**Bước 2:** Gõ: `thịt`

**Kết quả:**
- ✅ **Demo point:** Hiển thị tất cả món có chữ "thịt"
- Hỗ trợ tìm kiếm tiếng Việt có dấu

---

### PHẦN 5: DANH SÁCH MUA SẮM 🛒

#### 5.1. Tạo danh sách mua sắm mới

**Bước 1:** Vào tab "Mua sắm"

**Bước 2:** Nhấn nút "+" để tạo danh sách mới

**Bước 3:** Điền thông tin:
- Tên danh sách: `Đi chợ cuối tuần`
- Ngày đi: Chọn ngày (ví dụ: 2026-01-18)
- Phân công cho: Chọn thành viên `Nguyễn Văn B` (optional)
- Ghi chú: `Mua đồ cho tuần sau`

**Bước 4:** Nhấn "Tạo danh sách"

**Kết quả:**
- ✅ **Demo point:** Danh sách mới xuất hiện
- Thành viên được phân công nhận được thông báo push
- Tất cả thành viên trong nhóm đều thấy danh sách này

#### 5.2. Thêm món cần mua vào danh sách

**Bước 1:** Tap vào danh sách "Đi chợ cuối tuần"

**Bước 2:** Nhấn "Thêm món"

**Bước 3:** Chọn món ăn và nhập số lượng:
- Thịt bò: `2 kg`
- Rau cải: `3 bó`
- Trứng gà: `10 quả`
- Dầu ăn: `1 chai`

**Có 2 cách:**

**Cách 1: Chọn từ danh sách có sẵn**
- Chọn `Thịt bò` từ dropdown
- Nhập số lượng: `2`
- Chọn đơn vị: `kg`

**Cách 2: Nhập tay nhanh**
- Nhập: `Thịt bò - 2 kg`
- Hệ thống tự động parse

**Bước 4:** Nhấn "Thêm" cho từng món

**Kết quả:**
- ✅ **Demo point:** Danh sách task hiển thị với checkbox
- Tổng số món cần mua: "4 món"

#### 5.3. Đánh dấu đã mua

**Bước 1:** Khi đang đi chợ, mở danh sách "Đi chợ cuối tuần"

**Bước 2:** Tick vào checkbox của món đã mua:
- ☑️ Thịt bò - 2 kg

**Kết quả:**
- ✅ **Demo point:** 
  - Món được gạch ngang, màu xám
  - Các thành viên khác trong nhóm thấy cập nhật real-time
  - Progress bar cập nhật: "1/4 món đã mua"
  - Người được phân công nhận thông báo: "Nguyễn Văn B đã mua Thịt bò"

#### 5.4. Bỏ đánh dấu

**Bước 1:** Nếu nhầm, tick lại vào món đã đánh dấu

**Kết quả:**
- ✅ **Demo point:** Món quay lại trạng thái chưa mua
- Cập nhật real-time cho tất cả thành viên

#### 5.5. Sửa/Xóa món trong danh sách

**Sửa:**
- Long press vào món
- Chọn "Chỉnh sửa"
- Đổi số lượng: `Thịt bò - 2.5 kg` → `Thịt bò - 3 kg`

**Xóa:**
- Swipe left vào món
- Nhấn icon "Xóa"

**Kết quả:**
- ✅ **Demo point:** Cập nhật ngay lập tức cho tất cả thành viên

#### 5.6. Xóa danh sách mua sắm

**Bước 1:** Long press vào danh sách

**Bước 2:** Chọn "Xóa"

**Bước 3:** Xác nhận

**Kết quả:**
- ✅ **Demo point:** Danh sách và tất cả task bên trong bị xóa

#### 5.7. Real-time collaboration demo

**Kịch bản:** Hai người cùng nhìn danh sách

**Thiết bị 1:** User A đánh dấu "Thịt bò" là đã mua
**Thiết bị 2:** User B thấy ngay lập tức checkbox "Thịt bò" được tick

**Kết quả:**
- ✅ **Demo point:** Đồng bộ real-time qua Socket.IO
- Không cần reload trang

---

### PHẦN 6: KẾ HOẠCH BỮA ĂN 🍳

#### 6.1. Xem lịch bữa ăn tuần

**Bước 1:** Vào tab "Kế hoạch bữa ăn"

**Bước 2:** Xem calendar view với 4 buổi ăn mỗi ngày:
- 🌅 Sáng (Breakfast)
- ☀️ Trưa (Lunch)
- 🌆 Chiều (Snack)
- 🌙 Tối (Dinner)

**Hiển thị:**
- Ngày trong tuần
- Các món ăn đã lên kế hoạch
- Các buổi còn trống (màu xám)

**Kết quả:**
- ✅ **Demo point:** Giao diện calendar đẹp, dễ nhìn
- Swipe left/right để chuyển tuần

#### 6.2. Thêm món vào bữa ăn

**Bước 1:** Tap vào buổi ăn trống (ví dụ: "Trưa - Thứ 2")

**Bước 2:** Chọn món ăn:

**Cách 1: Chọn từ tủ lạnh (Thông minh)**
- Hệ thống đề xuất: "Bạn có 2 kg Thịt bò trong tủ lạnh sắp hết hạn"
- Nhấn "Chọn món từ tủ lạnh"
- Chọn `Thịt bò` → `Thịt bò hầm khoai tây`

**Cách 2: Chọn món ăn bất kỳ**
- Tìm kiếm: `Phở bò`
- Chọn từ danh sách

**Cách 3: Thêm món mới**
- Nhập tên: `Bún chả Hà Nội`
- Hệ thống tạo Food mới và thêm vào kế hoạch

**Bước 3:** Nhấn "Lưu"

**Kết quả:**
- ✅ **Demo point:** Món ăn xuất hiện trong calendar
- Hiển thị ảnh món ăn nhỏ
- Tất cả thành viên trong nhóm thấy kế hoạch

#### 6.3. Xem chi tiết kế hoạch bữa ăn

**Bước 1:** Tap vào món ăn đã lên kế hoạch

**Bước 2:** Xem chi tiết:
- Tên món: `Thịt bò hầm khoai tây`
- Buổi: `Trưa`
- Ngày: `Thứ 2, 19/01/2026`
- Có công thức: "Xem công thức" (nếu có)

**Bước 3:** Có thể:
- Xem công thức chi tiết
- Chỉnh sửa
- Xóa khỏi kế hoạch

**Kết quả:**
- ✅ **Demo point:** Modal chi tiết với ảnh đẹp

#### 6.4. Chỉnh sửa bữa ăn

**Bước 1:** Tap vào món trong calendar

**Bước 2:** Nhấn "Chỉnh sửa"

**Bước 3:** Đổi:
- Món ăn: `Thịt bò hầm khoai tây` → `Phở bò`
- Hoặc đổi buổi: `Trưa` → `Tối`

**Bước 4:** Nhấn "Lưu"

**Kết quả:**
- ✅ **Demo point:** Kế hoạch được cập nhật
- Cập nhật real-time cho tất cả thành viên

#### 6.5. Xóa món khỏi kế hoạch

**Bước 1:** Long press vào món trong calendar

**Bước 2:** Chọn "Xóa"

**Kết quả:**
- ✅ **Demo point:** Buổi ăn quay về trạng thái trống

#### 6.6. Copy kế hoạch tuần trước

**Bước 1:** Nhấn icon "..." ở góc màn hình

**Bước 2:** Chọn "Copy tuần trước"

**Kết quả:**
- ✅ **Demo point:** Tất cả bữa ăn của tuần trước được copy sang tuần này
- Tiết kiệm thời gian lên kế hoạch

#### 6.7. Lọc bữa ăn theo buổi

**Bước 1:** Nhấn filter ở top bar

**Bước 2:** Chọn "Chỉ hiển thị bữa Tối"

**Kết quả:**
- ✅ **Demo point:** Chỉ hiển thị các bữa tối trong tuần

---

### PHẦN 7: CÔNG THỨC NẤU ĂN 📖

#### 7.1. Xem công thức của món ăn

**Bước 1:** Có 2 cách vào công thức:

**Cách 1:** Từ Meal Plan
- Tap vào món đã lên kế hoạch
- Nhấn "Xem công thức"

**Cách 2:** Từ danh sách Recipe
- Vào tab "Công thức"
- Chọn món ăn

**Bước 2:** Xem công thức chi tiết

**Hiển thị:**
- Tên công thức: `Thịt bò hầm khoai tây kiểu Hàn`
- Ảnh món ăn
- Mô tả ngắn
- Nội dung HTML:
  - **Nguyên liệu:**
    - 500g thịt bò
    - 3 củ khoai tây
    - Hành tây, tỏi...
  - **Các bước:**
    - Bước 1: Ướp thịt với...
    - Bước 2: Phi hành tỏi...
    - Bước 3: Hầm với lửa nhỏ 45 phút...
  - **Mẹo:**
    - Dùng nồi áp suất sẽ nhanh hơn

**Kết quả:**
- ✅ **Demo point:** Hiển thị HTML content đẹp với `react-native-render-html`
- Có thể zoom ảnh

#### 7.2. Thêm công thức mới

**Bước 1:** Vào tab "Công thức", nhấn "+"

**Bước 2:** Chọn món ăn: `Phở bò`

**Bước 3:** Điền thông tin:
- Tên công thức: `Phở bò Hà Nội truyền thống`
- Mô tả: `Công thức phở bò ngon, nước dùng trong, thơm`
- Nội dung chi tiết (HTML):

```html
<h2>Nguyên liệu</h2>
<ul>
  <li>500g thịt bò</li>
  <li>Xương bò</li>
  <li>Bánh phở</li>
  <li>Hành, gừng, hoa hồi, quế</li>
</ul>

<h2>Cách làm</h2>
<ol>
  <li><strong>Nấu nước dùng:</strong> Hầm xương bò với gừng, hành trong 3 tiếng</li>
  <li><strong>Luộc thịt:</strong> Thịt bò thái lát mỏng</li>
  <li><strong>Trụng bánh phở:</strong> Ngâm bánh phở vào nước sôi</li>
  <li><strong>Hoàn thành:</strong> Cho bánh phở, thịt vào tô, chan nước dùng</li>
</ol>

<h2>Mẹo</h2>
<p>Rang gừng và hành trước khi cho vào nước dùng để tăng hương vị</p>
```

**Bước 4:** Nhấn "Lưu"

**Kết quả:**
- ✅ **Demo point:** Công thức mới được lưu
- Tất cả thành viên trong nhóm có thể xem

#### 7.3. Chỉnh sửa công thức

**Bước 1:** Vào công thức cần sửa

**Bước 2:** Nhấn icon "Chỉnh sửa" (pencil icon)

**Bước 3:** Cập nhật nội dung

**Bước 4:** Nhấn "Lưu"

**Kết quả:**
- ✅ **Demo point:** Công thức được cập nhật

#### 7.4. Xóa công thức

**Bước 1:** Vào công thức

**Bước 2:** Nhấn icon "Xóa"

**Bước 3:** Xác nhận

**Kết quả:**
- ✅ **Demo point:** Công thức bị xóa khỏi hệ thống

#### 7.5. Tìm kiếm công thức

**Bước 1:** Vào tab "Công thức"

**Bước 2:** Nhấn icon tìm kiếm, gõ: `bò`

**Kết quả:**
- ✅ **Demo point:** Hiển thị tất cả công thức có chữ "bò"
- `Phở bò`, `Thịt bò hầm`, `Bò lúc lắc`...

---

### PHẦN 8: QUẢN TRỊ HỆ THỐNG (ADMIN) 👨‍💼

> **Lưu ý:** Các tính năng này chỉ dành cho Admin hệ thống (không phải Admin nhóm)

#### 8.1. Quản lý Category (Danh mục)

**Bước 1:** Đăng nhập với tài khoản admin

**Bước 2:** Vào "Admin Panel" → "Quản lý danh mục"

**Bước 3:** Xem danh sách category:
- Thịt
- Rau củ quả
- Trái cây
- Đồ khô
- Gia vị
- Đồ uống
- Khác

**Thêm category mới:**
- Nhấn "+"
- Nhập: `Hải sản`
- Nhấn "Thêm"

**Sửa category:**
- Long press → "Sửa"
- Đổi `Rau củ quả` → `Rau củ`

**Xóa category:**
- Long press → "Xóa"
- Xác nhận

**Kết quả:**
- ✅ **Demo point:** Category được quản lý tập trung
- User chọn category khi thêm món ăn mới

#### 8.2. Quản lý Unit (Đơn vị tính)

**Tương tự Category:**

Danh sách unit có sẵn:
- kg (Kilogram)
- g (Gram)
- bó
- quả
- hộp
- chai
- gói
- lon

**Thêm unit mới:**
- Nhập: `túi`

**Kết quả:**
- ✅ **Demo point:** Đơn vị tính được chuẩn hóa

#### 8.3. Xem Logs hệ thống

**Bước 1:** Vào "Admin Panel" → "Logs"

**Bước 2:** Xem lịch sử hoạt động:
- User đăng ký
- Tạo/Xóa nhóm
- CRUD Food, Fridge, Shopping...
- Lỗi hệ thống

**Hiển thị:**
- Timestamp
- User thực hiện
- Hành động
- Kết quả (Success/Failed)

**Kết quả:**
- ✅ **Demo point:** Admin theo dõi được toàn bộ hoạt động hệ thống

---

### PHẦN 9: TÍNH NĂNG BỔ SUNG 🎁

#### 9.1. Thông báo Real-time

**Các tình huống nhận thông báo:**

1. **Trong Group:**
   - Có thành viên mới được thêm vào
   - Thành viên đánh dấu đã mua món trong Shopping List
   - Có người thêm/xóa món trong tủ lạnh
   - Có người thêm bữa ăn mới vào Meal Plan

2. **Cá nhân:**
   - Được phân công đi chợ
   - Món trong tủ lạnh sắp hết hạn
   - Admin xóa bạn khỏi nhóm

**Kết quả:**
- ✅ **Demo point:** 
  - In-app notification banner
  - Push notification (khi app ở background)
  - Badge count trên icon app

#### 9.2. Offline Mode

**Kịch bản:** Mất kết nối internet

**Bước 1:** Tắt Wi-Fi/Data

**Bước 2:** Vẫn có thể:
- Xem danh sách tủ lạnh (dữ liệu cache)
- Xem danh sách mua sắm
- Đánh dấu đã mua (lưu local)

**Bước 3:** Khi có mạng trở lại:
- Hiển thị banner "Đang đồng bộ dữ liệu..."
- Tự động sync dữ liệu lên server

**Kết quả:**
- ✅ **Demo point:** App vẫn hoạt động offline
- Dữ liệu được lưu trong SQLite local
- Tự động sync khi có mạng

#### 9.3. Tìm kiếm toàn cục

**Bước 1:** Nhấn icon tìm kiếm ở top bar (bất kỳ màn hình nào)

**Bước 2:** Gõ: `thịt bò`

**Kết quả tìm thấy:**
- 🍖 Thực phẩm: "Thịt bò" (2 kết quả)
- ❄️ Trong tủ lạnh: "Thịt bò - 2 kg"
- 🛒 Trong shopping list: "Thịt bò - Đi chợ cuối tuần"
- 🍳 Trong meal plan: "Thịt bò hầm - Trưa Thứ 2"
- 📖 Công thức: "Thịt bò hầm khoai tây"

**Kết quả:**
- ✅ **Demo point:** Tìm kiếm xuyên suốt toàn bộ app
- Nhảy trực tiếp đến kết quả khi tap

#### 9.4. Dark Mode

**Bước 1:** Vào Profile → Settings

**Bước 2:** Toggle "Dark Mode"

**Kết quả:**
- ✅ **Demo point:** Giao diện chuyển sang chế độ tối
- Bảo vệ mắt khi dùng ban đêm

#### 9.5. Ngôn ngữ (Đa ngôn ngữ)

**Bước 1:** Vào Profile → Settings → Language

**Bước 2:** Chọn:
- 🇻🇳 Tiếng Việt
- 🇬🇧 English

**Kết quả:**
- ✅ **Demo point:** Tất cả text trong app đổi sang ngôn ngữ đã chọn

#### 9.6. Export danh sách mua sắm

**Bước 1:** Vào danh sách mua sắm

**Bước 2:** Nhấn icon "Share"

**Bước 3:** Chọn:
- "Copy to clipboard"
- "Share via Zalo/Messenger"
- "Export to PDF"

**Kết quả:**
- ✅ **Demo point:** Danh sách được format đẹp:
```
Đi chợ cuối tuần - 18/01/2026
□ Thịt bò - 2 kg
☑ Rau cải - 3 bó
□ Trứng gà - 10 quả
□ Dầu ăn - 1 chai

Đã mua: 1/4
```

---

## 🎯 CÁC KỊCH BẢN DEMO TỔNG HỢP

### Kịch bản 1: "Chu trình hoàn chỉnh của món ăn"

**Mục tiêu:** Demo toàn bộ lifecycle của 1 món ăn từ lúc lên kế hoạch đến khi nấu ăn

1. ✅ **Thứ 7**: Lên kế hoạch bữa trưa Thứ 2 → Chọn "Phở bò"
2. ✅ **Thứ 7 chiều**: Tạo danh sách mua sắm "Đi chợ Chủ nhật"
3. ✅ **Thêm nguyên liệu cần mua:**
   - Thịt bò - 500g
   - Bánh phở - 1 gói
   - Hành, gừng...
4. ✅ **Chủ nhật**: Đi chợ, đánh dấu từng món đã mua
5. ✅ **Chủ nhật về**: Thêm đồ vào tủ lạnh:
   - Thịt bò - 500g - HSD: 22/01/2026
   - Bánh phở - 1 gói - HSD: 30/01/2026
6. ✅ **Thứ 2 trưa**: 
   - Vào Meal Plan, xem "Phở bò"
   - Nhấn "Xem công thức"
   - Nấu ăn theo hướng dẫn
   - Sau khi nấu, xóa thịt bò khỏi tủ lạnh

**Kết quả:** Demo được sự liên kết giữa tất cả modules

---

### Kịch bản 2: "Gia đình đi chợ cùng nhau"

**Nhân vật:**
- User A (Admin nhóm): Mẹ
- User B (Member): Bố
- User C (Member): Con gái

**Mục tiêu:** Demo tính năng real-time collaboration

1. ✅ **Mẹ** tạo danh sách "Đi chợ tết" với 20 món
2. ✅ **Mẹ** phân công **Bố** đi mua phần Thịt/Cá, **Con gái** mua phần Rau/Trái cây
3. ✅ **10h sáng**: Cả 3 người cùng lúc vào app
4. ✅ **Bố** đánh dấu "Thịt bò - xong", **Con gái** đánh dấu "Rau cải - xong"
5. ✅ **Mẹ** ở nhà nhìn màn hình, thấy progress real-time: "2/20 món đã mua"
6. ✅ **Bố** nhận ra quên mua Gà, thêm "Gà ta - 1 con" vào list
7. ✅ **Mẹ và Con gái** nhận thông báo ngay: "Bố vừa thêm món mới"

**Kết quả:** Demo sức mạnh của real-time sync

---

### Kịch bản 3: "Tránh lãng phí thực phẩm"

**Tình huống:** Có món ăn sắp hết hạn trong tủ lạnh

1. ✅ **8h sáng**: Nhận push notification "Thịt bò trong tủ lạnh sẽ hết hạn hôm nay!"
2. ✅ Mở app → Vào Tủ lạnh → Thấy "Thịt bò" hiển thị màu đỏ
3. ✅ Nhấn vào món → "Xem gợi ý món ăn"
4. ✅ Hệ thống gợi ý:
   - "Thịt bò xào hành tây"
   - "Thịt bò hầm khoai tây"
   - "Bò lúc lắc"
5. ✅ Chọn "Thịt bò xào hành tây" → Thêm vào Meal Plan buổi tối hôm nay
6. ✅ Xem công thức nấu ăn
7. ✅ Nấu xong, xóa "Thịt bò" khỏi tủ lạnh

**Kết quả:** Demo tính năng thông minh giúp tránh lãng phí

---

### Kịch bản 4: "Gia đình mới sử dụng app"

**Mục tiêu:** Demo luồng onboarding

1. ✅ **Ngày 1**: Đăng ký tài khoản → Tạo nhóm gia đình
2. ✅ **Ngày 1**: Mời vợ/chồng vào nhóm qua username
3. ✅ **Ngày 1**: Thêm tất cả đồ đang có trong tủ lạnh vào app (10 món)
4. ✅ **Ngày 2**: Lên kế hoạch bữa ăn cho cả tuần
5. ✅ **Ngày 3**: Tạo danh sách mua sắm dựa trên meal plan
6. ✅ **Ngày 4**: Đi chợ, đánh dấu đã mua
7. ✅ **Ngày 5**: Nhận cảnh báo món ăn sắp hết hạn
8. ✅ **Ngày 6**: Thêm công thức món ăn yêu thích
9. ✅ **Ngày 7**: Gia đình quen với việc dùng app, quản lý nhà cửa hiệu quả hơn

**Kết quả:** Demo cách app hòa nhập vào cuộc sống hàng ngày

---

## 📊 CÁC CHỈ SỐ DEMO (KPIs)

Trong quá trình demo, nhấn mạnh các chỉ số sau:

### Hiệu suất
- ⚡ **Thời gian tải danh sách:** < 1 giây
- ⚡ **Real-time sync delay:** < 500ms
- ⚡ **Offline mode:** Hoạt động 100% khi mất mạng

### Trải nghiệm người dùng
- ✅ **Số bước để thêm món vào tủ lạnh:** 4 bước (Nhanh nhất thị trường)
- ✅ **Số tap để đánh dấu đã mua:** 1 tap (Đơn giản nhất)
- ✅ **Tìm kiếm:** < 100ms cho 1000+ món ăn

### Tính năng nổi bật
- 🔥 **Real-time collaboration:** 100% đồng bộ
- 🔥 **Smart notification:** Cảnh báo hết hạn chính xác
- 🔥 **Offline-first:** Không bao giờ mất dữ liệu
- 🔥 **Multi-platform:** Android + iOS

---

## 🐛 XỬ LÝ LỖI & EDGE CASES

### 1. Lỗi mất kết nối
**Tình huống:** Đang sử dụng, đột ngột mất mạng

**Xử lý:**
- Hiển thị banner "Offline" ở top màn hình
- Các thao tác được lưu local
- Khi có mạng, tự động sync

### 2. Conflict dữ liệu
**Tình huống:** 2 người cùng sửa 1 món trong tủ lạnh offline

**Xử lý:**
- Last write wins (người sync sau thắng)
- Hiển thị thông báo "Dữ liệu đã được cập nhật bởi người khác"

### 3. Trùng lặp món ăn
**Tình huống:** Thêm "Thịt bò" vào tủ lạnh, nhưng đã có sẵn

**Xử lý:**
- Hỏi: "Món này đã có trong tủ. Bạn muốn cập nhật số lượng?"
- Nếu Yes: Cộng dồn số lượng
- Nếu No: Tạo FridgeItem mới (nếu có HSD khác nhau)

### 4. Xóa món đang được sử dụng
**Tình huống:** Xóa "Thịt bò" khỏi danh sách Food, nhưng đang có trong tủ lạnh

**Xử lý:**
- Chặn không cho xóa
- Hiển thị: "Không thể xóa. Món này đang được sử dụng trong tủ lạnh/meal plan"

---

## 🎬 SCRIPT DEMO CHO PRESENTATION

### Phần 1: Giới thiệu (2 phút)
> "Chào mọi người, hôm nay tôi xin giới thiệu ứng dụng 'Đi Chợ Tiện Lợi' - giải pháp toàn diện giúp gia đình quản lý sinh hoạt hàng ngày.
> 
> App giải quyết 3 vấn đề lớn:
> 1. Đi chợ thường quên sót món
> 2. Không biết trong tủ lạnh còn gì, đồ nào sắp hết hạn
> 3. Hôm nay ăn gì? - Câu hỏi muôn thuở
>
> Đặc biệt, app hỗ trợ cả gia đình cùng sử dụng, đồng bộ real-time."

### Phần 2: Demo nhanh (5 phút)
1. **[30s]** Đăng ký → Tạo nhóm
2. **[1 phút]** Thêm 3 món vào tủ lạnh (trong đó 1 món sắp hết hạn)
3. **[1 phút]** Lên kế hoạch bữa ăn cho 3 ngày
4. **[1 phút]** Tạo danh sách mua sắm từ meal plan
5. **[30s]** Đánh dấu đã mua → Show real-time trên 2 thiết bị
6. **[1 phút]** Nhận cảnh báo món sắp hết hạn → Xem gợi ý món → Xem công thức

### Phần 3: Tính năng nổi bật (3 phút)
- **Real-time collaboration:** Demo 2 điện thoại sync
- **Offline mode:** Tắt mạng vẫn dùng được
- **Smart notification:** Push notification hết hạn

### Phần 4: Kết luận (1 phút)
> "Với 'Đi Chợ Tiện Lợi', gia đình bạn sẽ:
> - Không bao giờ quên món khi đi chợ
> - Không để thực phẩm hỏng, hết hạn
> - Luôn có kế hoạch bữa ăn ngon, hợp lý
> - Tiết kiệm thời gian và tiền bạc
>
> Cảm ơn mọi người đã theo dõi!"

---

## 📝 CHECKLIST TRƯỚC KHI DEMO

### Chuẩn bị môi trường
- [ ] Backend đang chạy tại `http://localhost:3000`
- [ ] Database có dữ liệu mẫu (Categories, Units, Foods)
- [ ] Frontend build thành công
- [ ] 2-3 thiết bị test (hoặc emulator) đã cài app
- [ ] Tạo sẵn 2-3 tài khoản test trong cùng 1 group

### Chuẩn bị dữ liệu demo
- [ ] Group có ít nhất 3 thành viên
- [ ] Tủ lạnh có 5-10 món (trong đó 1-2 món sắp hết hạn)
- [ ] 1 danh sách mua sắm có 5 món (đã mua 2 món)
- [ ] Meal plan có 3-4 bữa ăn đã lên kế hoạch
- [ ] 2-3 công thức món ăn có nội dung đẹp

### Kiểm tra chức năng
- [ ] Real-time sync hoạt động (test trên 2 thiết bị)
- [ ] Push notification hoạt động
- [ ] Upload ảnh thành công
- [ ] Tìm kiếm hoạt động nhanh
- [ ] Offline mode hoạt động

### Chuẩn bị backup
- [ ] Có plan B nếu demo bị lỗi
- [ ] Có video quay màn hình sẵn
- [ ] Có slides/ảnh minh họa

---

## 🚨 TROUBLESHOOTING

### Lỗi thường gặp khi demo

#### 1. Không kết nối được Backend
**Nguyên nhân:** Backend chưa chạy hoặc sai URL

**Giải pháp:**
```bash
# Kiểm tra backend
cd MobileApp_Backend_IT4788
npm start

# Kiểm tra URL trong constants.js
# Đảm bảo: API_URL = "http://YOUR_IP:3000/it4788"
# (Không dùng localhost nếu chạy trên thiết bị thật)
```

#### 2. Real-time không hoạt động
**Nguyên nhân:** Socket.IO không kết nối

**Giải pháp:**
- Kiểm tra server logs: `[Socket.IO] User connected: ...`
- Kiểm tra firewall
- Restart cả app và server

#### 3. Ảnh không hiển thị
**Nguyên nhân:** Server không serve static files

**Giải pháp:**
- Kiểm tra `app.use('/uploads', express.static('uploads'))`
- Đảm bảo thư mục `uploads/` tồn tại

#### 4. Push notification không nhận được
**Nguyên nhân:** Chưa cấu hình Firebase

**Giải pháp:**
- Kiểm tra `google-services.json` (Android) và `GoogleService-Info.plist` (iOS)
- Xin permission notification trong app

---

## 📈 MỞ RỘNG & PHÁT TRIỂN

### Các tính năng có thể thêm trong tương lai:

1. **AI Recommendation**
   - Gợi ý món ăn dựa trên đồ trong tủ lạnh
   - Gợi ý danh sách mua sắm dựa trên lịch sử

2. **Barcode Scanner**
   - Quét mã vạch để thêm món vào tủ lạnh
   - Tự động lấy thông tin món ăn

3. **Voice Assistant**
   - "Hey App, thêm 2 kg thịt bò vào danh sách mua sắm"

4. **Integration**
   - Kết nối với Grab/Shopee để order đồ ăn
   - Sync với Google Calendar

5. **Gamification**
   - Nhận điểm khi đi chợ đầy đủ
   - Badge cho người nấu ăn giỏi

6. **Analytics Dashboard**
   - Thống kê chi tiêu hàng tháng
   - Thống kê món ăn được nấu nhiều nhất

---

## 📞 HỖ TRỢ & LIÊN HỆ

### Thông tin liên hệ
- **Email:** support@dichotienloi.com
- **Hotline:** 1900 xxxx
- **Website:** https://dichotienloi.com

### Tài liệu tham khảo
- [Backend README](MobileApp_Backend_IT4788/README.md)
- [API Documentation](MobileApp_Backend_IT4788/API_Documentation.md)
- [Frontend README](MobileApp_Frontend_IT4788/README.md)

---

## ✅ KẾT LUẬN

Ứng dụng "Đi Chợ Tiện Lợi" là giải pháp toàn diện, hiện đại giúp gia đình Việt quản lý sinh hoạt hàng ngày một cách thông minh và hiệu quả.

### Ưu điểm nổi bật:
- ✅ Giao diện thân thiện, dễ sử dụng
- ✅ Real-time collaboration mạnh mẽ
- ✅ Offline mode đáng tin cậy
- ✅ Tính năng đa dạng, đáp ứng đầy đủ nhu cầu
- ✅ Hiệu suất cao, trải nghiệm mượt mà

### Kết quả mong đợi:
- 📈 Tăng hiệu quả quản lý gia đình
- 💰 Tiết kiệm chi phí (không mua dư, không để hỏng)
- ⏰ Tiết kiệm thời gian
- 🏡 Gia đình gắn kết hơn qua việc chia sẻ công việc

**Chúc bạn demo thành công! 🎉**
