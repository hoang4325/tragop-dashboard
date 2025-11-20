import React from "react"
import {
  DollarSign,
  TrendingUp,
  Clock,
  FileText,
  User,
  Package,
  Calendar,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react"

/* ================== TYPES ================== */

export type PaymentScheduleItem = {
  period: number
  dueDate: string
  amount: number
  status: "Paid" | "Unpaid" | "Overdue"
}

export type ContractDetail = {
  code: string
  applicationCode: string
  customerName: string
  productName: string
  planName: string
  totalLoan: number
  remainingAmount: number
  status: string
  paymentSchedule: PaymentScheduleItem[]
}

type IconComponent = React.ComponentType<{ className?: string }>

interface ContractDetailModalProps {
  open: boolean
  contract: ContractDetail | null
  onClose: () => void
}

/* ================== HELPERS ================== */

const formatMoney = (n: number) => n?.toLocaleString("vi-VN") + " ₫"

const getInstallmentStatusInfo = (s: PaymentScheduleItem["status"]) => {
  switch (s) {
    case "Paid":
      return {
        label: "Đã thanh toán",
        color:
          "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30",
        icon: CheckCircle2,
      }
    case "Overdue":
      return {
        label: "Quá hạn",
        color:
          "text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/30",
        icon: XCircle,
      }
    default:
      return {
        label: "Chưa thanh toán",
        color:
          "text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/30",
        icon: AlertCircle,
      }
  }
}

const getContractStatusChip = (status: string) => {
  if (status.toLowerCase().includes("hiệu lực")) {
    return {
      className:
        "bg-emerald-500/15 text-emerald-50 ring-1 ring-emerald-300/50",
      dotClass: "bg-emerald-400",
    }
  }
  if (status.toLowerCase().includes("tất toán")) {
    return {
      className: "bg-blue-500/15 text-blue-50 ring-1 ring-blue-300/50",
      dotClass: "bg-blue-400",
    }
  }
  if (status.toLowerCase().includes("quá hạn")) {
    return {
      className: "bg-red-500/15 text-red-50 ring-1 ring-red-300/50",
      dotClass: "bg-red-400",
    }
  }
  return {
    className: "bg-slate-500/15 text-slate-50 ring-1 ring-slate-300/40",
    dotClass: "bg-slate-300",
  }
}

/* ================== MAIN MODAL ================== */

export default function ContractDetailModal({
  open,
  contract,
  onClose,
}: ContractDetailModalProps) {
  if (!open || !contract) return null

  const schedule = contract.paymentSchedule ?? []
  const paid = schedule.filter(s => s.status === "Paid").length
  const total = schedule.length
  const percent = total === 0 ? 0 : Math.round((paid / total) * 100)

  const contractStatusChip = getContractStatusChip(contract.status)

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4 py-6"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-50 shadow-2xl border border-slate-200/70 dark:bg-slate-900 dark:border-slate-700/60"
      >
        {/* HEADER */}
        <div className="rounded-t-3xl bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 px-8 pt-6 pb-5 text-white">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 transition"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
                  <FileText className="h-4 w-4" />
                </span>
                <p className="text-xs uppercase tracking-[0.2em] text-sky-100/80">
                  HỢP ĐỒNG TRẢ GÓP
                </p>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Chi tiết hợp đồng
              </h2>
              <p className="mt-1 text-sm text-sky-100">
                Mã hợp đồng:{" "}
                <span className="font-semibold">{contract.code}</span>
              </p>
            </div>

            <div className="mt-1 space-y-2 md:text-right">
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium shadow-sm ${contractStatusChip.className}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${contractStatusChip.dotClass}`}
                />
                {contract.status}
              </div>
              <p className="text-xs text-sky-100/80">
                Gói:{" "}
                <span className="font-semibold">{contract.planName}</span>
              </p>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* STATS */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={DollarSign}
              label="Tổng vay"
              value={formatMoney(contract.totalLoan)}
              gradient="from-sky-500 to-sky-600"
            />
            <StatCard
              icon={TrendingUp}
              label="Còn lại"
              value={formatMoney(contract.remainingAmount)}
              gradient="from-purple-500 to-purple-600"
            />
            <StatCard
              icon={Clock}
              label="Tiến độ"
              value={`${paid}/${total || 0} kỳ`}
              gradient="from-emerald-500 to-emerald-600"
            />
          </div>

          {/* INFO + PROGRESS */}
          <div className="grid gap-6 lg:grid-cols-[1.3fr,1fr]">
            {/* CONTRACT INFO */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
              <div className="mb-4 flex items-center gap-2">
                <div className="rounded-lg bg-sky-100 p-1.5 dark:bg-sky-900/40">
                  <FileText className="h-4 w-4 text-sky-700 dark:text-sky-300" />
                </div>
                <h3 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-100">
                  Thông tin hợp đồng
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow
                  label="Mã hợp đồng"
                  value={contract.code}
                  icon={FileText}
                />
                <InfoRow
                  label="Mã hồ sơ"
                  value={contract.applicationCode}
                  icon={FileText}
                />
                <InfoRow
                  label="Khách hàng"
                  value={contract.customerName}
                  icon={User}
                />
                <InfoRow
                  label="Sản phẩm"
                  value={contract.productName}
                  icon={Package}
                />
                <InfoRow
                  label="Gói trả góp"
                  value={contract.planName}
                  icon={Calendar}
                />
                <InfoRow label="Trạng thái" value={contract.status} />
              </div>
            </div>

            {/* PROGRESS */}
            <div className="rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50 to-indigo-50 p-5 shadow-sm dark:border-sky-800 dark:from-sky-900/20 dark:to-indigo-900/30">
              <div className="mb-4 flex items-center gap-2">
                <div className="rounded-lg bg-sky-100 p-1.5 dark:bg-sky-900/40">
                  <TrendingUp className="h-4 w-4 text-sky-700 dark:text-sky-300" />
                </div>
                <h3 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-50">
                  Tiến độ thanh toán
                </h3>
              </div>

              <div className="flex flex-col items-center gap-4">
                {/* vòng tròn % */}
                <div className="relative h-24 w-24">
                  <div className="absolute inset-0 rounded-full bg-slate-200/70 dark:bg-slate-800" />
                  <div
                    className="absolute inset-1 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500"
                    style={{
                      maskImage:
                        "conic-gradient(from 0deg, #000 0deg, #000 " +
                        percent +
                        "deg, transparent " +
                        percent +
                        "deg, transparent 360deg)",
                      WebkitMaskImage:
                        "conic-gradient(from 0deg, #000 0deg, #000 " +
                        percent +
                        "deg, transparent " +
                        percent +
                        "deg, transparent 360deg)",
                    }}
                  />
                  <div className="absolute inset-3 rounded-full bg-slate-50 flex items-center justify-center dark:bg-slate-900">
                    <span className="text-2xl font-bold text-sky-600 dark:text-sky-300">
                      {percent}
                    </span>
                    <span className="text-xs ml-0.5 text-slate-500 dark:text-slate-400">
                      %
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 text-center dark:text-slate-300">
                  Đã thanh toán{" "}
                  <span className="font-semibold text-sky-700 dark:text-sky-300">
                    {paid}
                  </span>{" "}
                  trên{" "}
                  <span className="font-semibold">{total || 0}</span> kỳ.
                </p>

                <div className="w-full">
                  <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT SCHEDULE */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-slate-100 p-1.5 dark:bg-slate-800">
                <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              </div>
              <h3 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-100">
                Lịch thanh toán
              </h3>
            </div>

            {schedule.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
                <Calendar className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Chưa có dữ liệu thanh toán cho hợp đồng này.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-100/80 dark:bg-slate-800/80">
                      <tr>
                        <Th>Kỳ</Th>
                        <Th>Ngày đến hạn</Th>
                        <Th className="text-right">Số tiền</Th>
                        <Th className="text-center">Trạng thái</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map(item => {
                        const info = getInstallmentStatusInfo(item.status)
                        const StatusIcon = info.icon
                        return (
                          <tr
                            key={item.period}
                            className="border-t border-slate-200/70 hover:bg-slate-50/80 dark:border-slate-700/70 dark:hover:bg-slate-800/80 transition-colors"
                          >
                            <Td>
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                {item.period}
                              </span>
                            </Td>
                            <Td>
                              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-100">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                {item.dueDate}
                              </div>
                            </Td>
                            <Td className="text-right">
                              <span className="font-semibold text-slate-900 dark:text-slate-50">
                                {formatMoney(item.amount)}
                              </span>
                            </Td>
                            <Td className="text-center">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${info.color}`}
                              >
                                <StatusIcon className="h-3.5 w-3.5" />
                                {info.label}
                              </span>
                            </Td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================== SMALL COMPONENTS ================== */

interface StatCardProps {
  icon: IconComponent
  label: string
  value: string
  gradient: string
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  gradient,
}) => (
  <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition-shadow dark:border-slate-700 dark:bg-slate-900/80">
    <div className="absolute inset-y-0 right-0 w-1/3 opacity-5 bg-gradient-to-br from-sky-500 to-indigo-500 pointer-events-none" />
    <div className="flex items-center gap-4">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
          {value}
        </p>
      </div>
    </div>
  </div>
)

interface InfoRowProps {
  label: string
  value?: string
  icon?: IconComponent
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon: Icon }) => (
  <div className="rounded-xl bg-white/80 p-3 dark:bg-slate-900/60">
    <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </div>
    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
      {value ?? "—"}
    </p>
  </div>
)

const Th: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  children,
  className = "",
}) => (
  <th
    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 ${className}`}
  >
    {children}
  </th>
)

const Td: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  children,
  className = "",
}) => (
  <td
    className={`px-4 py-3 align-middle text-sm text-slate-700 dark:text-slate-200 ${className}`}
  >
    {children}
  </td>
)
