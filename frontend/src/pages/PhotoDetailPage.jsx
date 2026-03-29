import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api, { clearStoredToken, extractErrorMessage } from "../api.js";
import Navbar from "../components/Navbar.jsx";

function toImageSrc(imageUrl) {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
  return imageUrl;
}

function formatDateTime(value) {
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return "";
  }
}

export default function PhotoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const uploadedAt = useMemo(() => formatDateTime(photo?.uploaded_at), [photo?.uploaded_at]);

  function logout() {
    clearStoredToken();
    navigate("/login", { replace: true });
  }

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(`/photos/${id}`);
      const payload = res.data?.data ?? res.data;
      setPhoto(payload);
      setTitle(payload?.title ?? "");
      setDescription(payload?.description ?? "");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onSave() {
    if (!title.trim()) return toast.error("Vui lòng nhập tên ảnh");
    setBusy(true);
    try {
      const res = await api.put(`/photos/${id}`, {
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
      });
      const payload = res.data?.data ?? res.data;
      setPhoto(payload);
      setEditing(false);
      toast.success("Cập nhật thành công");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    const ok = window.confirm("Bạn có chắc muốn xóa ảnh này không?");
    if (!ok) return;
    setBusy(true);
    try {
      await api.delete(`/photos/${id}`);
      toast.success("Đã xóa ảnh");
      navigate("/gallery", { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh">
      <Navbar onLogout={logout} showSearch={false} />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link to="/gallery" className="btn-secondary px-3 py-2">
            Quay lại
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing((x) => !x)}
              disabled={busy || loading || !photo}
              className="btn-secondary px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editing ? "Hủy sửa" : "Chỉnh sửa"}
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={busy || loading || !photo}
              className="btn-danger px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Xóa
            </button>
          </div>
        </div>

        {loading ? (
          <div className="panel rounded-[32px] p-8 shadow-sm">
            <div className="text-sm font-medium text-slate-700">Đăng tải thông tin ảnh...</div>
          </div>
        ) : !photo ? (
          <div className="panel rounded-[32px] p-8 shadow-sm">
            <div className="text-sm font-medium text-slate-700">Không tìm thấy ảnh.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-card">
                <img
                  src={toImageSrc(photo.image_url)}
                  alt={photo.title}
                  className="w-full object-contain"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="panel rounded-[32px] p-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Thông tin ảnh
                </div>

                {!editing ? (
                  <div className="mt-3 space-y-3">
                    <div>
                      <div className="text-lg font-semibold text-slate-900">{photo.title}</div>
                      <div className="mt-1 text-sm text-slate-600">
                        {photo.description || "Chua co mo ta"}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="text-xs font-semibold text-slate-600">Ngày tải lên</div>
                      <div className="mt-1 text-sm font-medium text-slate-900">{uploadedAt}</div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-800">Tên ảnh</label>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={busy}
                        className="field mt-1 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-800">Mô tả</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={busy}
                        rows={5}
                        className="field mt-1 resize-none disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={onSave}
                      disabled={busy}
                      className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busy ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
