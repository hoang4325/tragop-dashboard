import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { loginApi } from "../api/identityApi"

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: "admin@mobilehub.com",
    password: "123",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const data = await loginApi(form)
      login(data.accessToken, data.user)
      navigate("/", { replace: true })
    } catch (err) {
      console.error(err)
      setError(
        err?.response?.data?.message ??
          "Đăng nhập thất bại, kiểm tra lại thông tin."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#e8d5c4] flex items-center justify-center p-4">
      <div
        className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex"
        style={{ minHeight: "600px" }}
      >
        {/* Left side - Gradient */}
        <div className="w-1/2 relative hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-blue-400 opacity-90" />
          <div className="absolute top-8 left-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
          </div>

          {/* Logo/Brand on gradient side */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-3xl font-bold backdrop-blur mx-auto mb-4">
                TG
              </div>
              <h2 className="text-2xl font-light">Hệ thống trả góp</h2>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
          {/* Top right small pill (no HOME/ABOUT/etc) */}
          <div className="flex justify-end mb-10 md:mb-14">
            <div className="px-4 md:px-6 py-2 bg-[#c4a084] text-white rounded-full text-xs md:text-sm">
              SIGN IN
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-light text-gray-400 mb-3">
              Welcome.
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed">
              Đăng nhập để quản lý gói trả góp, hồ sơ và hợp đồng.
              <br />
              Vui lòng nhập thông tin đăng nhập của bạn.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 flex-1">
            <div>
              <label className="block text-xs text-gray-400 mb-2 ml-1 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#c4a084] focus:ring-1 focus:ring-[#c4a084] transition-colors"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2 ml-1 uppercase tracking-wide">
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#c4a084] focus:ring-1 focus:ring-[#c4a084] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#c4a084] text-white rounded-lg text-sm font-medium hover:bg-[#b08968] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "ĐANG ĐĂNG NHẬP..." : "LOGIN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
