import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-3 text-center">
      <p className="text-6xl font-semibold text-slate-300 dark:text-slate-700">404</p>
      <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
        Trang bạn tìm không tồn tại
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Có thể đường dẫn đã thay đổi hoặc bạn nhập sai URL.
      </p>
      <Link
        to="/"
        className="mt-2 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
      >
        Quay về Dashboard
      </Link>
    </div>
  )
}
