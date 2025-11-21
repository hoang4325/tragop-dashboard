import React, { useEffect, useState, useCallback, useRef } from "react"
import { useAuth } from "../context/AuthContext"
import { getApplications, updateApplicationStatus } from "../api/installmentApi"
import { Card, CardHeader } from "../components/ui/Card"
import { Table, THead, TBody, Th, Td } from "../components/ui/Table"
import Badge from "../components/ui/Badge"
import Button from "../components/ui/Button"
import { SelectInput, TextInput } from "../components/ui/Input"

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
]

// UI action -> backend enum
const ACTION_TO_STATUS = {
  approve: "APPROVED",
  reject: "REJECTED",
}

function statusBadge(status) {
  switch (status) {
    case "PENDING":
      return <Badge color="warning">Chờ duyệt</Badge>
    case "APPROVED":
      return <Badge color="success">Đã duyệt</Badge>
    case "REJECTED":
      return <Badge color="danger">Từ chối</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

export default function ApplicationsPage() {
  const { token } = useAuth()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: "", q: "" })
  const [updatingId, setUpdatingId] = useState(null)

  // keep a ref to current scroll so we can restore if needed
  const lastScrollYRef = useRef(0)

  // ============================
  // FETCH APPLICATIONS
  // opts:
  //  - silent: don't toggle global loading (prevents layout collapse)
  //  - preserveScroll: restore scroll after data update
  // ============================
  const fetchApps = useCallback(
    async (opts = {}) => {
      const { silent = false, preserveScroll = false } = opts

      if (preserveScroll) {
        lastScrollYRef.current = window.scrollY || 0
      }

      if (!silent) setLoading(true)

      try {
        const data = await getApplications(token, {
          status: filters.status || undefined,
          q: filters.q || undefined,
        })
        setApps(data)
      } catch (err) {
        console.error("Failed to fetch applications", err)
      } finally {
        if (!silent) setLoading(false)

        if (preserveScroll) {
          // wait for DOM update then restore scroll
          requestAnimationFrame(() => {
            window.scrollTo({
              top: lastScrollYRef.current,
              behavior: "auto",
            })
          })
        }
      }
    },
    [token, filters.status, filters.q]
  )

  useEffect(() => {
    if (token) fetchApps()
  }, [token, fetchApps])

  // ============================
  // FILTER HANDLER
  // ============================
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    fetchApps({ silent: false, preserveScroll: false })
  }

  // ============================
  // UPDATE STATUS (APPROVE / REJECT)
  // ============================
  const handleUpdateStatus = async (id, action, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    setUpdatingId(id)
    try {
      const status = ACTION_TO_STATUS[action]
      if (!status) throw new Error(`Unknown action: ${action}`)

      await updateApplicationStatus(token, id, status)

      // refresh list WITHOUT collapsing UI + keep scroll
      await fetchApps({ silent: true, preserveScroll: true })
    } catch (err) {
      console.error("Update status error:", err)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Hồ sơ trả góp"
          description="Danh sách hồ sơ khách hàng đăng ký trả góp."
        />

        {/* FILTER */}
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
            {STATUS_OPTIONS.map((opt) => (
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
            placeholder="Tên KH, sản phẩm, mã hồ sơ..."
          />

          <div className="flex items-end">
            <Button type="submit">Lọc</Button>
          </div>
        </form>

        {/* If loading and no data yet -> show text.
            If already has data -> keep table mounted to avoid scroll jump. */}
        {loading && apps.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Đang tải hồ sơ...
          </p>
        ) : (
          <>
            {loading && apps.length > 0 && (
              <p className="mb-2 text-xs text-slate-400">
                Đang cập nhật dữ liệu...
              </p>
            )}

            <Table>
              <THead>
                <tr>
                  <Th>Mã hồ sơ</Th>
                  <Th>Khách hàng</Th>
                  <Th>Sản phẩm</Th>
                  <Th align="right">Giá SP</Th>
                  <Th align="right">Vay</Th>
                  <Th>Đối tác</Th>
                  <Th>Gói</Th>
                  <Th align="center">Trạng thái</Th>
                  <Th align="center">Thao tác</Th>
                </tr>
              </THead>

              <TBody>
                {apps.map((app) => (
                  <tr key={app.id}>
                    <Td>{app.code}</Td>

                    <Td>
                      <div className="flex flex-col">
                        <span>{app.customerName}</span>
                        {app.customerPhone && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {app.customerPhone}
                          </span>
                        )}
                      </div>
                    </Td>

                    <Td>{app.productName}</Td>

                    <Td align="right">
                      {app.productPrice?.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        maximumFractionDigits: 0,
                      })}
                    </Td>

                    <Td align="right">
                      {app.loanAmount?.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        maximumFractionDigits: 0,
                      })}
                    </Td>

                    <Td>{app.partnerName}</Td>
                    <Td>{app.planName}</Td>

                    <Td align="center">{statusBadge(app.status)}</Td>

                    <Td align="center">
                      {app.status === "PENDING" && (
                        <div className="flex justify-center gap-2">
                          <Button
                            type="button"
                            variant="primary"
                            className="px-2 py-1 text-xs"
                            disabled={updatingId === app.id}
                            onClick={(e) =>
                              handleUpdateStatus(app.id, "approve", e)
                            }
                          >
                            Duyệt
                          </Button>

                          <Button
                            type="button"
                            variant="danger"
                            className="px-2 py-1 text-xs"
                            disabled={updatingId === app.id}
                            onClick={(e) =>
                              handleUpdateStatus(app.id, "reject", e)
                            }
                          >
                            Từ chối
                          </Button>
                        </div>
                      )}
                    </Td>
                  </tr>
                ))}

                {apps.length === 0 && (
                  <tr>
                    <Td colSpan={9}>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Không có hồ sơ nào.
                      </span>
                    </Td>
                  </tr>
                )}
              </TBody>
            </Table>
          </>
        )}
      </Card>
    </div>
  )
}
