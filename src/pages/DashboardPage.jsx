import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getDashboardOverview } from "../api/installmentApi";
import { Card, CardHeader } from "../components/ui/Card";
import { DollarSign, AlertCircle, TrendingUp, FileText } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate, useLocation } from "react-router-dom"; // <<< add useLocation

/* ================== Utils ================== */

const formatCurrency = (amount) => {
  if (amount == null) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatTime = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* ================== Component ================== */

export default function DashboardPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // <<< add
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getDashboardOverview(token);
      setOverview(data);
    } catch (err) {
      console.error("Failed to load dashboard overview", err);
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ✅ Refetch when token changes OR when navigate back to this page
  useEffect(() => {
    fetchOverview();
  }, [fetchOverview, location.key]);

  // ✅ Refetch when tab/window regains focus
  useEffect(() => {
    if (!token) return;

    const onFocus = () => fetchOverview();
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchOverview();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [token, fetchOverview]);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-500">
        <span className="animate-pulse">Đang tải dữ liệu dashboard...</span>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="text-sm text-slate-500">
        Không có dữ liệu dashboard. Vui lòng kiểm tra lại API / dữ liệu mẫu.
      </div>
    );
  }

  /* ====== Chuẩn hóa dữ liệu từ API / fallback ====== */

  const growthPercent =
    typeof overview.revenueGrowthPercent === "number"
      ? overview.revenueGrowthPercent
      : 0;
  const growthLabel = `${growthPercent >= 0 ? "+" : ""}${growthPercent.toFixed(
    1
  )}% so với tháng trước`;
  const growthColor = growthPercent >= 0 ? "text-green-600" : "text-red-600";

  const chartDataFromApi = Array.isArray(overview.revenueChart)
    ? overview.revenueChart.map((m) => ({
        name: m.monthLabel ?? m.label ?? "N/A",
        revenue: m.revenue ?? 0,
      }))
    : null;

  const chartData =
    chartDataFromApi && chartDataFromApi.length > 0
      ? chartDataFromApi
      : [
          { name: "T1", revenue: 40000000 },
          { name: "T2", revenue: 30000000 },
          { name: "T3", revenue: 20000000 },
          { name: "T4", revenue: 27800000 },
          { name: "T5", revenue: 18900000 },
          { name: "T6", revenue: 23900000 },
        ];

  // ✅ tolerant mapping for BE fields
  const recentPendingApps = Array.isArray(overview.recentPendingApplications)
    ? overview.recentPendingApplications
    : Array.isArray(overview.recentPendingApps)
    ? overview.recentPendingApps
    : [];

  return (
    <div className="space-y-6 pb-10">
      {/* --- SECTION 1: THẺ CHỈ SỐ (STATS) --- */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Tổng quan kinh doanh
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Doanh số giải ngân"
            value={formatCurrency(overview.totalRevenue)}
            icon={<DollarSign className="h-5 w-5 text-green-600" />}
            trend={growthLabel}
            trendColor={growthColor}
          />
          <StatCard
            label="Tổng dư nợ hiện tại"
            value={formatCurrency(overview.outstandingDebt)}
            icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          />
          <StatCard
            label="Hợp đồng quá hạn"
            value={overview.overdueContracts}
            subValue="Hợp đồng cần xử lý"
            icon={<AlertCircle className="h-5 w-5 text-red-600" />}
            highlight={true}
          />
          <StatCard
            label="Tổng hợp đồng active"
            value={overview.activeContracts}
            icon={<FileText className="h-5 w-5 text-purple-600" />}
          />
        </div>
      </div>

      {/* --- SECTION 2: TRẠNG THÁI HỒ SƠ --- */}
      <Card>
        <CardHeader
          title="Trạng thái hồ sơ"
          description="Tình hình xử lý hồ sơ trong ngày hôm nay."
        />
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
          <StatusItem
            label="Tổng hồ sơ mới"
            value={overview.totalApplications}
            color="bg-blue-100 text-blue-700"
          />
          <StatusItem
            label="Đã duyệt"
            value={overview.approvedApplications}
            color="bg-green-100 text-green-700"
          />
          <StatusItem
            label="Đang chờ duyệt"
            value={overview.pendingApplications}
            color="bg-orange-100 text-orange-700"
          />
        </div>
      </Card>

      {/* --- SECTION 3: BIỂU ĐỒ & HỒ SƠ GẦN NHẤT --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cột trái: Biểu đồ doanh thu (2/3) */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader title="Xu hướng doanh thu (6 tháng)" />
            <div className="h-[300px] w-full p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value / 1_000_000}tr`}
                  />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar
                    dataKey="revenue"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Cột phải: Hồ sơ chờ duyệt gần nhất (1/3) */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader title="Hồ sơ chờ duyệt gần nhất" />
            <div className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Khách hàng</th>
                      <th className="px-4 py-3 font-medium">Gói / Sản phẩm</th>
                      <th className="px-4 py-3 font-medium text-right">
                        Thời gian
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentPendingApps.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-4 text-center text-slate-400"
                        >
                          Không có hồ sơ chờ duyệt.
                        </td>
                      </tr>
                    )}
                    {recentPendingApps.map((app, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium">
                          {app.customerName}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {app.planName || app.productName || "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-400">
                          {formatTime(app.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t p-3 text-center">
                <button
                  className="text-sm font-medium text-blue-600 hover:underline"
                  onClick={() => navigate("/applications")} // ✅ go to hồ sơ page
                >
                  Xem tất cả hồ sơ
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ================== Sub components ================== */

function StatCard({
  label,
  value,
  subValue,
  icon,
  trend,
  trendColor,
  highlight,
}) {
  return (
    <div
      className={`rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${
        highlight
          ? "border-red-200 bg-red-50"
          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <h3
            className={`mt-2 text-2xl font-bold ${
              highlight ? "text-red-700" : "text-slate-900"
            }`}
          >
            {value}
          </h3>
          {subValue && <p className="text-xs text-slate-500">{subValue}</p>}
        </div>
        <div
          className={`rounded-lg p-2 ${
            highlight ? "bg-red-100" : "bg-slate-100"
          }`}
        >
          {icon}
        </div>
      </div>
      {trend && (
        <div
          className={`mt-4 flex items-center text-xs font-medium ${
            trendColor || ""
          }`}
        >
          {trend.startsWith("-") ? "▼" : "▲"} {trend}
        </div>
      )}
    </div>
  );
}

function StatusItem({ label, value, color }) {
  return (
    <div className={`flex items-center justify-between rounded-lg p-4 ${color}`}>
      <span className="font-medium">{label}</span>
      <span className="text-xl font-bold">{value}</span>
    </div>
  );
}
