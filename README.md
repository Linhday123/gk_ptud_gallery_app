# Photo Manager

Ứng dụng quản lý ảnh full-stack (React + FastAPI + SQLite).

---

## 1. Cài đặt Node.js (nếu máy chưa có)

Tải Node.js tại: https://nodejs.org/en/download  
Chọn bản **LTS** → cài đặt bình thường → khởi động lại máy tính.

> Kiểm tra đã cài thành công chưa:
> ```powershell
> node -v
> npm -v
> ```

---

## 2. Chạy Backend

**Cách A:** chạy từ thư mục backend

```powershell
cd d:\HocTap\2026\PTUD\GK\backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Cách B:** chạy từ thư mục gốc dự án

```powershell
cd d:\HocTap\2026\PTUD\GK
uvicorn backend.main:app --reload
```

> Nếu lỗi **không có quyền admin** khi dùng `pip`, thêm `--user` vào cuối:
> ```powershell
> pip install -r requirements.txt --user
> ```

Backend chạy tại: `http://localhost:8000`

---

## 3. Chạy Frontend

```powershell
cd d:\HocTap\2026\PTUD\GK\frontend
npm install
npm run dev
```

Frontend chạy tại: `http://localhost:5173`

### Xử lý lỗi khi chạy npm

**Lỗi "script cannot be loaded" / bị chặn chạy script:**

```powershell
Set-ExecutionPolicy RemoteSigned
```

**Nếu máy không cho chạy lệnh trên (không có quyền admin),** mở PowerShell theo cách sau:  
Nhấn `Win + R` → gõ `powershell` → nhấn `Ctrl + Shift + Enter` để mở với quyền Administrator.  
Hoặc chạy lệnh dưới đây trong scope người dùng hiện tại (không cần quyền admin):

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 4. Xem toàn bộ dữ liệu người dùng trong database

Chạy lệnh sau trong PowerShell để xem danh sách tài khoản đã đăng ký:

```powershell
@'
import sqlite3
conn = sqlite3.connect(r'd:\HocTap\2026\PTUD\GK\backend\photos.db')
cur = conn.cursor()

rows = cur.execute("SELECT id, username, email FROM users ORDER BY id").fetchall()
print(f"{'ID':<5} {'USERNAME':<20} {'EMAIL'}")
print("-" * 60)
for r in rows:
    print(f"{r[0]:<5} {r[1]:<20} {r[2]}")

conn.close()
'@ | python -
```

---

## 5. GitHub – Quản lý mã nguồn

### Lần đầu: tạo repo local rồi đẩy lên GitHub

Trong thư mục `GK`:

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/Linhday123/gk_ptud_gallery_app.git
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

### Những lần sau: cập nhật code lên GitHub

Trong thư mục project:

```powershell
git add .
git commit -m "update code"
git push
```

---

### Nếu sang máy khác hoặc mất project local

Clone lại:

```powershell
git clone https://github.com/Linhday123/gk_ptud_gallery_app.git
cd gk_ptud_gallery_app
```

Sửa code xong, đẩy lên lại:

```powershell
git add .
git commit -m "update code"
git push
```

---

## Ghi chú

- JWT secret: `dev-secret-key-change-in-prod`
- Database: `./backend/photos.db`
- Thư mục upload: `./backend/uploads`
