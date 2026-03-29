import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { extractErrorMessage, getStoredToken, storeToken } from "../api.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/gallery";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (token) navigate("/gallery", { replace: true });
  }, [navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post("/login", { email, password });
      const payload = res.data?.data ?? res.data;
      const token = payload?.access_token;
      if (!token) throw new Error("Không tìm thấy access_token trong phản hồi");
      storeToken(token, true);
      toast.success("Đăng nhập thành công");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden rounded-[32px] bg-teal-700 p-8 text-white shadow-card lg:block">
          <div className="max-w-sm">
            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-100">GK Photo</div>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">Lưu trữ ảnh gọn gàng, dễ sử dụng.</h1>
            <p className="mt-4 text-sm leading-7 text-teal-50/90">
              Đăng nhập để xem thư viện ảnh, tìm kiếm theo tên, cập nhật thông tin và xóa ảnh khi cần.
            </p>
          </div>
        </div>

        <div className="panel w-full animate-fade-up rounded-[32px] p-6 shadow-card sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Đăng nhập</h2>
            <p className="mt-2 text-sm text-slate-600">
              Nhập email và mật khẩu để vào hệ thống quản lý ảnh.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-800">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                className="field mt-1 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="ban@example.com"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-800">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
                className="field mt-1 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="font-semibold text-teal-700 hover:text-teal-800">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
