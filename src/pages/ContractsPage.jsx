import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getContracts, getContractDetail } from '../api/installmentApi'
import { Card, CardHeader } from '../components/ui/Card'
import { Table, THead, TBody, Th, Td } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SelectInput, TextInput } from '../components/ui/Input'
import {
  DollarSign,
  TrendingUp,
  Clock,
  FileText,
  User,
  Package,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react'

const CONTRACT_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'ACTIVE', label: 'Đang hiệu lực' },
  { value: 'CLOSED', label: 'Đã tất toán' },
  { value: 'OVERDUE', label: 'Quá hạn' },
]

function contractStatusBadge(status) {
  switch (status) {
    case 'ACTIVE':
      return <Badge color="success">Đang hiệu lực</Badge>
    case 'CLOSED':
      return <Badge>Đã tất toán</Badge>
    case 'OVERDUE':
      return <Badge color="danger">Quá hạn</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

/** Map status từ BE → status FE đang dùng cho lịch thanh toán */
function mapPaymentStatus(status) {
  if (!status) return 'Unpaid'

  const upper = String(status).toUpperCase()

  if (upper === 'PAID') return 'Paid'
  if (upper === 'OVERDUE') return 'Overdue'
  if (upper === 'PLANNED' || upper === 'UNPAID') return 'Unpaid'

  // Nếu BE đã trả sẵn "Paid" / "Unpaid" / "Overdue" thì giữ nguyên
  return status
}

/** Chuẩn hóa mảng schedule từ BE về dạng { period, dueDate, amount, principalAmount, interestAmount, status } */
function buildPaymentSchedule(rawSchedule = []) {
  return rawSchedule.map((item, index) => ({
    period: item.period ?? item.periodNumber ?? index + 1,
    dueDate: item.dueDate,
    amount: item.amount,
    principalAmount: item.principalAmount,
    interestAmount: item.interestAmount,
    status: mapPaymentStatus(item.status),
  }))
}

function ContractDetail({ contract }) {
  const formatMoney = (n) => (n ?? 0).toLocaleString('vi-VN') + ' ₫'

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Paid':
        return { label: 'Đã thanh toán', color: 'success', Icon: CheckCircle2 }
      case 'Overdue':
        return { label: 'Quá hạn', color: 'danger', Icon: XCircle }
      default:
        return { label: 'Chưa thanh toán', color: 'warning', Icon: AlertCircle }
    }
  }

  const schedule = contract.paymentSchedule || []
  const paid = schedule.filter((s) => s.status === 'Paid').length
  const total = schedule.length

  const statusText =
    contract.status === 'ACTIVE'
      ? 'Đang hiệu lực'
      : contract.status === 'CLOSED'
      ? 'Đã tất toán'
      : contract.status === 'OVERDUE'
      ? 'Quá hạn'
      : contract.status

  return (
    <div className="space-y-6">
      {/* Stats - 3 cards ngang */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-4 dark:border-slate-700 dark:from-blue-950/30 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Tổng vay
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {formatMoney(contract.totalLoan)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-4 dark:border-slate-700 dark:from-emerald-950/30 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Còn lại
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {formatMoney(contract.remainingAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-purple-50 to-white p-4 dark:border-slate-700 dark:from-purple-950/30 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/50">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Tiến độ
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {paid}/{total} kỳ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info + Schedule - 2 cột */}
      <div className="grid gap-6 lg:grid-cols-[1fr,2fr]">
        {/* Thông tin hợp đồng */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Thông tin hợp đồng
          </h3>

          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Mã hợp đồng
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {contract.code}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Mã hồ sơ
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {contract.applicationCode}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Khách hàng
                </p>
              </div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {contract.customerName}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-slate-400" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Sản phẩm
                </p>
              </div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {contract.productName}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Gói trả góp
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {contract.planName}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Trạng thái
              </p>
              <div>{contractStatusBadge(contract.status)}</div>
            </div>
          </div>
        </div>

        {/* Lịch thanh toán */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50">
          <div className="border-b border-slate-200 p-4 dark:border-slate-700">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Lịch thanh toán
            </h3>
          </div>

          {schedule.length === 0 ? (
            <p className="p-4 text-sm text-slate-500 dark:text-slate-400">
              Chưa có dữ liệu lịch thanh toán cho hợp đồng này.
            </p>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Kỳ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Ngày đến hạn
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Số tiền
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {schedule.map((item) => {
                    const statusInfo = getStatusInfo(item.status)
                    return (
                      <tr
                        key={item.period}
                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <td className="px-4 py-3">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                            {item.period}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-200">
                          {item.dueDate}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-900 dark:text-white">
                          <div className="flex flex-col items-end">
                            <span className="font-bold">
                              {formatMoney(item.amount)}
                            </span>
                            {(item.principalAmount != null ||
                              item.interestAmount != null) && (
                              <span className="mt-0.5 text-[11px] font-normal text-slate-500 dark:text-slate-400">
                                Gốc: {formatMoney(item.principalAmount ?? 0)} •
                                {' '}
                                Lãi: {formatMoney(item.interestAmount ?? 0)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge color={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ContractsPage() {
  const { token } = useAuth()
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', q: '' })
  const [selectedContract, setSelectedContract] = useState(null)
  const [detailLoadingId, setDetailLoadingId] = useState(null)

  const fetchContracts = async () => {
    setLoading(true)
    try {
      const data = await getContracts(token, {
        status: filters.status || undefined,
        q: filters.q || undefined,
      })
      setContracts(data)
    } catch (err) {
      console.error('Failed to fetch contracts', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return
    fetchContracts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    fetchContracts()
  }

  const handleViewDetail = async (contract) => {
    if (!token) return

    try {
      setDetailLoadingId(contract.id)

      // Gọi BE lấy chi tiết hợp đồng
      const detail = await getContractDetail(token, contract.id)

      // Ưu tiên dùng schedule từ BE; fallback nếu BE đặt tên khác
      const rawSchedule =
        detail?.paymentSchedule ||
        detail?.schedule ||
        contract.paymentSchedule ||
        []

      const paymentSchedule = buildPaymentSchedule(rawSchedule)

      // Gộp data list + detail để không mất các field FE đang dùng
      const merged = {
        ...contract,
        ...detail,
        paymentSchedule,
      }

      setSelectedContract(merged)
    } catch (err) {
      console.error('Failed to load contract detail', err)
    } finally {
      setDetailLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Danh sách hợp đồng"
          description="Quản lý các hợp đồng trả góp đã được tạo."
        />

        <form
          onSubmit={handleFilterSubmit}
          className="mb-4 grid gap-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-900/60 md:grid-cols-4"
        >
          <SelectInput
            label="Trạng thái"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            {CONTRACT_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </SelectInput>

          <TextInput
            label="Tìm kiếm"
            name="q"
            value={filters.q}
            onChange={handleFilterChange}
            placeholder="Tên KH, sản phẩm, mã HĐ..."
          />

          <div className="flex items-end">
            <Button type="submit">Lọc</Button>
          </div>
        </form>

        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Đang tải hợp đồng...
          </p>
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>Mã HĐ</Th>
                <Th>Mã hồ sơ</Th>
                <Th>Khách hàng</Th>
                <Th>Sản phẩm</Th>
                <Th>Gói</Th>
                <Th align="right">Tổng vay</Th>
                <Th align="right">Còn lại</Th>
                <Th align="center">Trạng thái</Th>
                <Th align="center">Thao tác</Th>
              </tr>
            </THead>
            <TBody>
              {contracts.map((c) => (
                <tr key={c.id}>
                  <Td>{c.code}</Td>
                  <Td>{c.applicationCode}</Td>
                  <Td>{c.customerName}</Td>
                  <Td>{c.productName}</Td>
                  <Td>{c.planName}</Td>
                  <Td align="right">
                    {c.totalLoan?.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      maximumFractionDigits: 0,
                    })}
                  </Td>
                  <Td align="right">
                    {c.remainingAmount?.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      maximumFractionDigits: 0,
                    })}
                  </Td>
                  <Td align="center">{contractStatusBadge(c.status)}</Td>
                  <Td align="center">
                    <button
                      onClick={() => handleViewDetail(c)}
                      disabled={detailLoadingId === c.id}
                      className="rounded bg-blue-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {detailLoadingId === c.id ? 'Đang tải...' : 'Xem chi tiết'}
                    </button>
                  </Td>
                </tr>
              ))}
              {contracts.length === 0 && (
                <tr>
                  <Td colSpan={9}>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Không có hợp đồng nào.
                    </span>
                  </Td>
                </tr>
              )}
            </TBody>
          </Table>
        )}
      </Card>

      {selectedContract && (
        <Card>
          <CardHeader
            title="Chi tiết hợp đồng"
            description={`Thông tin chi tiết và lịch thanh toán cho hợp đồng ${selectedContract.code}`}
            actions={
              <Button onClick={() => setSelectedContract(null)} variant="ghost">
                Đóng
              </Button>
            }
          />

          <ContractDetail contract={selectedContract} />
        </Card>
      )}
    </div>
  )
}
