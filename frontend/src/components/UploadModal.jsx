import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api, { extractErrorMessage } from "../api.js";

export default function UploadModal({ isOpen, onClose, onUploaded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setDescription("");
      setFile(null);
      setBusy(false);
      setProgress(0);
    }
  }, [isOpen]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      // 📝 VĂN BẢN: Thông báo lỗi khi chưa nhập tên ảnh
      toast.error("Vui lòng nhập tên ảnh");
      return;
    }
    if (!file) {
      // 📝 VĂN BẢN: Thông báo lỗi khi chưa chọn file
      toast.error("Vui lòng chọn file JPG hoặc PNG");
      return;
    }

    const isAllowed =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.name.toLowerCase().endsWith(".jpg") ||
      file.name.toLowerCase().endsWith(".jpeg") ||
      file.name.toLowerCase().endsWith(".png");
    if (!isAllowed) {
      // 📝 VĂN BẢN: Thông báo lỗi định dạng file không hợp lệ
      toast.error("Chỉ hỗ trợ file JPG và PNG");
      return;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("title", title.trim());
    if (description.trim()) form.append("description", description.trim());

    setBusy(true);
    setProgress(0);
    try {
      await api.post("/photos", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          const total = evt.total ?? 0;
          if (!total) return;
          setProgress(Math.min(100, Math.round((evt.loaded / total) * 100)));
        },
      });
      // 📝 VĂN BẢN: Thông báo tải ảnh thành công
      toast.success("Tải ảnh lên thành công");
      onClose();
      onUploaded?.();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={() => (busy ? null : onClose())}
      />

      <div className="panel relative w-full max-w-2xl animate-fade-up rounded-3xl p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            {/* 📝 VĂN BẢN: Tiêu đề của modal */}
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Tải ảnh mới</h2>
            <p className="mt-1 text-sm text-slate-600">
              {/* 📝 VĂN BẢN: Mô tả hướng dẫn dưới tiêu đề */}
              Chọn ảnh, nhập tiêu đề và mô tả ngắn nếu cần.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="btn-secondary px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {/* 📝 VĂN BẢN: Nút đóng modal */}
            Đóng
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <div>
                {/* 📝 VĂN BẢN: Nhãn trường tên ảnh */}
                <label className="text-sm font-medium text-slate-800">Tên ảnh</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={busy}
                  className="field mt-1 disabled:cursor-not-allowed disabled:opacity-60"
                  // 📝 VĂN BẢN: Placeholder ô tên ảnh
                  placeholder="Ví dụ: Ảnh kỷ niệm"
                />
              </div>

              <div>
                {/* 📝 VĂN BẢN: Nhãn trường chọn file */}
                <label className="text-sm font-medium text-slate-800">Tệp tin ảnh</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  disabled={busy}
                  className="mt-1 block w-full text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                />
                {/* 📝 VĂN BẢN: Ghi chú định dạng hỗ trợ */}
                <div className="mt-1 text-xs text-slate-500">Hỗ trợ: JPG, JPEG, PNG</div>
              </div>

              <div>
                {/* 📝 VĂN BẢN: Nhãn trường mô tả */}
                <label className="text-sm font-medium text-slate-800">Mô tả</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={busy}
                  rows={4}
                  className="field mt-1 resize-none disabled:cursor-not-allowed disabled:opacity-60"
                  // 📝 VĂN BẢN: Placeholder ô mô tả
                  placeholder="Nhập mô tả ngắn nếu cần"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    // 📝 VĂN BẢN: Alt text ảnh xem trước
                    alt="Xem trước"
                    className="h-64 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center px-6 text-center text-sm text-slate-500">
                    {/* 📝 VĂN BẢN: Chữ hiển thị khi chưa chọn ảnh */}
                    Ảnh xem trước sẽ hiển thị tại đây
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between text-sm">
                  {/* 📝 VĂN BẢN: Nhãn thanh tiến độ */}
                  <span className="font-medium text-slate-800">Tiến độ tải lên</span>
                  {/* 📝 VĂN BẢN: Trạng thái % hoặc "Chưa bắt đầu" */}
                  <span className="text-slate-500">{busy ? `${progress}%` : "Chưa bắt đầu"}</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-teal-600 transition-all"
                    style={{ width: `${busy ? progress : 0}%` }}
                  />
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  {/* 📝 VĂN BẢN: Ghi chú dưới thanh tiến độ (2 trạng thái) */}
                  {busy ? "Đang tải ảnh lên máy chủ..." : "Ảnh sẽ được lưu trong thư mục uploads của backend."}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {/* 📝 VĂN BẢN: Nút Hủy */}
              Hủy
            </button>
            <button
              type="submit"
              disabled={busy}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {/* 📝 VĂN BẢN: Nút Tải ảnh (2 trạng thái: đang tải / chờ) */}
              {busy ? "Đang tải..." : "Tải ảnh"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
