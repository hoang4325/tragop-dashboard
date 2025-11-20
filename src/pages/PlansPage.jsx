import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createPlan, getPlans, deactivatePlan } from '../api/installmentApi'
import { Card, CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { SelectInput, TextInput } from '../components/ui/Input'

const PARTNER_OPTIONS = [
  { id: 1, name: 'FE Credit' },
  { id: 2, name: 'Home Credit' },
]

export default function PlansPage() {
  const { token } = useAuth()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    code: '',
    name: '',
    partnerId: 1,
    minPrice: 3000000,
    downPaymentPercent: 20,
    interestRate: 1.8,
    allowedTenors: '3,6,12',
    active: true,
  })
  const [error, setError] = useState('')

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const data = await getPlans(token)
      setPlans(data)
    } catch (err) {
      console.error('Failed to load plans', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return
    fetchPlans()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const payload = {
        ...form,
        partnerId: Number(form.partnerId),
        minPrice: Number(form.minPrice),
        downPaymentPercent: Number(form.downPaymentPercent),
        interestRate: Number(form.interestRate),
      }

      await createPlan(token, payload)
      setShowForm(false)
      setForm((prev) => ({
        ...prev,
        code: '',
        name: '',
      }))
      fetchPlans()
    } catch (err) {
      console.error('Create plan error', err)
      setError(err?.response?.data?.message ?? 'Không thể tạo gói trả góp')
    }
  }

  // 🔴 Xóa = chuyển trạng thái sang ngưng áp dụng (soft delete)
  const handleDeactivatePlan = async (planId) => {
    try {
      await deactivatePlan(token, planId)
      fetchPlans()
    } catch (err) {
      console.error('Deactivate plan error', err)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Gói trả góp"
          description="Quản lý danh sách gói trả góp áp dụng cho các sản phẩm."
          actions={
            <Button onClick={() => setShowForm((v) => !v)}>
              {showForm ? 'Đóng form' : 'Thêm gói trả góp'}
            </Button>
          }
        />

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-4 grid gap-4 rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-900/60 md:grid-cols-2 lg:grid-cols-3"
          >
            <TextInput
              label="Mã gói"
              name="code"
              value={form.code}
              onChange={handleChange}
              required
            />
            <TextInput
              label="Tên gói"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <SelectInput
              label="Đối tác"
              name="partnerId"
              value={form.partnerId}
              onChange={handleChange}
            >
              {PARTNER_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </SelectInput>
            <TextInput
              label="Giá tối thiểu (VND)"
              name="minPrice"
              type="number"
              min={0}
              value={form.minPrice}
              onChange={handleChange}
            />
            <TextInput
              label="Trả trước (%)"
              name="downPaymentPercent"
              type="number"
              min={0}
              max={100}
              value={form.downPaymentPercent}
              onChange={handleChange}
            />
            <TextInput
              label="Lãi suất (%/tháng)"
              name="interestRate"
              type="number"
              step="0.1"
              min={0}
              value={form.interestRate}
              onChange={handleChange}
            />
            <TextInput
              label="Kỳ hạn được áp dụng"
              name="allowedTenors"
              value={form.allowedTenors}
              onChange={handleChange}
              placeholder="Ví dụ: 3,6,12"
            />

            <div className="flex items-center space-x-2">
              <input
                id="active"
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <label
                htmlFor="active"
                className="text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Đang kích hoạt
              </label>
            </div>

            {error && (
              <p className="md:col-span-2 lg:col-span-3 text-sm text-red-500">
                {error}
              </p>
            )}

            <div className="md:col-span-2 lg:col-span-3">
              <Button type="submit">Lưu gói trả góp</Button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Đang tải danh sách gói trả góp...
          </p>
        ) : plans.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Chưa có gói trả góp nào.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const tenors = plan.allowedTenors?.split(',') || []
              const installmentPrice = plan.minPrice || 0
              const downPayment = (installmentPrice * plan.downPaymentPercent) / 100
              const loanAmount = installmentPrice - downPayment
              
              return tenors.map((tenor) => {
                const months = parseInt(tenor)
                const monthlyInterest = plan.interestRate / 100
                const monthlyPayment = loanAmount / months + (loanAmount * monthlyInterest)
                
                const partnerColor = plan.partnerName === 'Home Credit' 
                  ? 'bg-gradient-to-r from-pink-600 to-pink-700' 
                  : 'bg-gradient-to-r from-green-600 to-green-700'
                
                const buttonStyle = plan.active
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                  : 'bg-white text-orange-500 border-2 border-orange-500 hover:bg-orange-50'
                
                return (
                  <div
                    key={`${plan.id}-${tenor}`}
                    className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
                  >
                    {/* Header */}
                    <div className={`${partnerColor} px-4 py-3 text-white`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold">
                            {plan.partnerName === 'Home Credit' ? 'HOME' : 'FE'}
                          </span>
                          <span className="text-xs">
                            {plan.partnerName === 'Home Credit' ? 'CREDIT' : 'CREDIT'}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">Kỳ hạn {months} tháng</div>
                          <div className="text-xs">Không phí: Bảo hiểm, hồ sơ</div>
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="space-y-2 p-4 text-sm">
                      <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">Mã gói</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {plan.code}
                        </span>
                      </div>
                      
                      <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">Tên gói</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {plan.name}
                        </span>
                      </div>
                      
                      <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">Đối tác</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {plan.partnerName}
                        </span>
                      </div>
                      
                      <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">Giá tối thiểu</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {installmentPrice.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                      
                      <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">Trả trước</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {plan.downPaymentPercent}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">Lãi suất</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {plan.interestRate}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between pb-2">
                        <span className="text-slate-600 dark:text-slate-400">Kỳ hạn</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {months} tháng
                        </span>
                      </div>
                    </div>

                    {/* Footer Status */}
                    <div className="flex gap-2 px-4 pb-4">
                      <div
                        className={`flex-1 rounded-lg px-4 py-3 text-center font-semibold ${buttonStyle}`}
                      >
                        {plan.active ? 'Đang áp dụng' : 'Ngưng áp dụng'}
                      </div>
                      <button
                        onClick={() => plan.active && handleDeactivatePlan(plan.id)}
                        disabled={!plan.active}
                        className={`rounded-lg px-4 py-3 font-semibold text-white transition-colors ${
                          plan.active
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-slate-400 cursor-not-allowed'
                        }`}
                        title={
                          plan.active
                            ? 'Ngưng áp dụng gói này'
                            : 'Gói đã ngưng áp dụng'
                        }
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                )
              })
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
