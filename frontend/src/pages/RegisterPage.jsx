import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { extractErrorMessage, getStoredToken } from "../api.js";

function isEmailLike(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  useEffect(() => {
    const token = getStoredToken();
    if (token) navigate("/gallery", { replace: true });
  }, [navigate]);

  const clientErrors = useMemo(() => {
    const errs = {};
    if (username.trim().length > 0 && username.trim().length < 3) {
      errs.username = "Tên đăng nhập phải có ít nhất 3 ký tự";
    }
    if (email.trim().length > 0 && !isEmailLike(email.trim())) {
      errs.email = "Email không đúng định dạng";
    }
    if (password.length > 0 && password.length < 5) {
      errs.password = "Mật khẩu phải có ít nhất 5 ký tự";
    }
    return errs;
  }, [username, email, password]);

  async function onSubmit(e) {
    e.preventDefault();
    setServerErrors({});
    if (!username.trim()) return toast.error("Vui lòng nhập tên đăng nhập");
    if (!isEmailLike(email.trim())) return toast.error("Email không hợp lệ");
    if (password.length < 5) return toast.error("Mật khẩu quá ngắn");

    setBusy(true);
    try {
      await api.post("/register", {
        username: username.trim(),
        email: email.trim(),
        password,
      });
      toast.success("Tạo tài khoản thành công. Hãy đăng nhập.");
      navigate("/login", { replace: true });
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (Array.isArray(detail)) {
        const nextErrors = {};
        detail.forEach((item) => {
          const field = item?.loc?.[1];
          if (field) nextErrors[field] = item?.msg || "Giá trị không hợp lệ";
        });
        setServerErrors(nextErrors);
      } else if (typeof detail === "string") {
        const lc = detail.toLowerCase();
        if (lc.includes("username")) {
          setServerErrors({ username: detail });
        } else if (lc.includes("email")) {
          setServerErrors({ email: detail });
        } else if (lc.includes("password")) {
          setServerErrors({ password: detail });
        }
      }
      toast.error(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
      <div className="panel w-full max-w-lg animate-fade-up rounded-[32px] p-6 shadow-card sm:p-8">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Đăng ký tài khoản</h1>
          <p className="mt-1 text-sm text-slate-600">
            Mỗi tài khoản chỉ xem và quản lý dữ liệu ảnh của chính mình.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-800">Tên đăng nhập</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={busy}
              className="field mt-1 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="linhday123"
              required
            />
            {clientErrors.username ? (
              <div className="mt-1 text-xs font-medium text-rose-600">{clientErrors.username}</div>
            ) : serverErrors.username ? (
              <div className="mt-1 text-xs font-medium text-rose-600">{serverErrors.username}</div>
            ) : null}
          </div>

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
            {clientErrors.email ? (
              <div className="mt-1 text-xs font-medium text-rose-600">{clientErrors.email}</div>
            ) : serverErrors.email ? (
              <div className="mt-1 text-xs font-medium text-rose-600">{serverErrors.email}</div>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-800">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
              className="field mt-1 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Tối thiểu 5 ký tự"
              required
            />
            <div className="mt-1 text-xs text-slate-500">
              Mật khẩu phải có ít nhất 5 ký tự
            </div>
            {clientErrors.password ? (
              <div className="mt-1 text-xs font-medium text-rose-600">{clientErrors.password}</div>
            ) : serverErrors.password ? (
              <div className="mt-1 text-xs font-medium text-rose-600">{serverErrors.password}</div>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={busy || Object.keys(clientErrors).length > 0}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-600">
          Đã có tài khoản?{" "}
          <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
