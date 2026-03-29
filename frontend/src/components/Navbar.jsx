import React from "react";
import { Link, useLocation } from "react-router-dom";
import SearchBar from "./SearchBar.jsx";
import { clearStoredToken } from "../api.js";

export default function Navbar({
  title = "Quản lý ảnh",
  query,
  onQueryChange,
  onLogout,
  showSearch = false,
}) {
  const location = useLocation();
  const isGallery = location.pathname === "/gallery";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <Link to="/gallery" className="group inline-flex flex-col">
            <span className="text-lg font-semibold tracking-tight text-slate-900 group-hover:text-slate-700">
              {title}
            </span>
            <span className="text-sm text-slate-500">
              {isGallery ? "Lưu trữ và quản lý ảnh của bạn" : "Xem và cập nhật thông tin ảnh"}
            </span>
          </Link>
        </div>

        {showSearch ? (
          <div className="w-full lg:max-w-md">
            <SearchBar value={query} onChange={onQueryChange} />
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              clearStoredToken();
              onLogout?.();
            }}
            className="btn-secondary px-4 py-2.5"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}
