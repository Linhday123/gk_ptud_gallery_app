import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { extractErrorMessage } from "../api.js";
import Navbar from "../components/Navbar.jsx";
import UploadModal from "../components/UploadModal.jsx";

function toImageSrc(imageUrl) {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
  return imageUrl;
}

function formatDate(value) {
  try {
    return new Date(value).toLocaleDateString("vi-VN");
  } catch {
    return "";
  }
}

export default function GalleryPage() {
  const navigate = useNavigate();

  const limit = 12;
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const isSearching = query.trim().length > 0;
  const lastRequestKey = useRef(0);

  const headerText = useMemo(() => {
    if (loading) return "Đang tải dữ liệu...";
    if (isSearching) return `Kết quả tìm kiếm cho "${query.trim()}"`;
    return "Thư viện ảnh của bạn";
  }, [isSearching, loading, query]);

  function logout() {
    navigate("/login", { replace: true });
  }

  async function fetchPage(p) {
    const reqKey = ++lastRequestKey.current;
    setLoading(true);
    try {
      const res = await api.get("/photos", { params: { page: p, limit } });
      const payload = res.data?.data ?? res.data;
      if (reqKey !== lastRequestKey.current) return;
      setItems(payload?.items ?? []);
      setTotal(payload?.total ?? 0);
      setPage(payload?.page ?? p);
      setPages(payload?.pages ?? 1);
    } catch (err) {
      if (reqKey !== lastRequestKey.current) return;
      toast.error(extractErrorMessage(err));
    } finally {
      if (reqKey === lastRequestKey.current) setLoading(false);
    }
  }

  async function fetchSearch(q) {
    const reqKey = ++lastRequestKey.current;
    setLoading(true);
    try {
      const res = await api.get("/photos/search", { params: { q } });
      const payload = res.data?.data ?? res.data;
      if (reqKey !== lastRequestKey.current) return;
      const list = Array.isArray(payload) ? payload : payload?.items ?? [];
      setItems(list);
      setTotal(list.length);
      setPage(1);
      setPages(1);
    } catch (err) {
      if (reqKey !== lastRequestKey.current) return;
      toast.error(extractErrorMessage(err));
    } finally {
      if (reqKey === lastRequestKey.current) setLoading(false);
    }
  }

  useEffect(() => {
    if (isSearching) return;
    fetchPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, isSearching]);

  useEffect(() => {
    const q = query.trim();
    const t = setTimeout(() => {
      if (q) {
        fetchSearch(q);
        return;
      }

      if (page !== 1) setPage(1);
      else fetchPage(1);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function onUploaded() {
    if (query.trim()) fetchSearch(query.trim());
    else fetchPage(page);
  }

  return (
    <div className="min-h-dvh">
      <Navbar
        query={query}
        onQueryChange={setQuery}
        onLogout={logout}
        showSearch
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <section className="panel rounded-[32px] p-5 shadow-card sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-medium text-teal-700">Tổng quan</div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{headerText}</h1>
              <p className="mt-2 text-sm text-slate-600">
                {isSearching ? `Tìm thấy ${total} kết quả phù hợp.` : `Bạn đang có ${total} ảnh trong thư viện.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isSearching ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="btn-secondary"
                >
                  Xóa tìm kiếm
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="btn-primary"
              >
                Tải ảnh mới
              </button>
            </div>
          </div>
        </section>

        <div className="mt-6">
          {items.length === 0 && !loading ? (
            <div className="panel rounded-[32px] border-dashed p-10 text-center shadow-sm">
              <div className="text-base font-semibold text-slate-900">
                Chưa có ảnh nào trong thư viện
              </div>
              <div className="mt-2 text-sm text-slate-600">
                Hãy tải ảnh đầu tiên lên để bắt đầu quản lý.
              </div>
              <button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="btn-primary mt-5"
              >
                Tải ảnh ngay
              </button>
            </div>
          ) : loading ? (
            <div className="panel rounded-[32px] p-10 text-center shadow-sm">
              <div className="text-sm font-medium text-slate-700">Đang tải danh sách ảnh...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <Link
                  key={p.id}
                  to={`/photos/${p.id}`}
                  className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <img
                      src={toImageSrc(p.image_url)}
                      alt={p.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <div className="truncate text-base font-semibold text-slate-900">{p.title}</div>
                    <div className="mt-2 text-sm text-slate-600">
                      Ngày tải: {formatDate(p.uploaded_at)}
                    </div>
                    <div className="mt-3 text-sm font-medium text-teal-700">Xem chi tiết</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {!isSearching ? (
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPage((x) => Math.max(1, x - 1))}
              disabled={page <= 1 || loading}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Trang trước
            </button>
            <div className="text-sm font-medium text-slate-700">
              Trang <span className="font-semibold">{page}</span> / {pages}
            </div>
            <button
              type="button"
              onClick={() => setPage((x) => Math.min(pages, x + 1))}
              disabled={page >= pages || loading}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Trang sau
            </button>
          </div>
        ) : null}
      </main>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={onUploaded}
      />
    </div>
  );
}
