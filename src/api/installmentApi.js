import axios from "axios";

const BASE_URL = "http://localhost:8093/api/v1";

// ========== AXIOS INSTANCE ==========
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// ========== API REQUESTS ==========

// 1. Lấy danh sách gói trả góp
export async function getPlans(token) {
  const res = await client.get("/plans", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

// 2. Tạo gói trả góp
export async function createPlan(token, payload) {
  const res = await client.post("/plans", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
}

// 2.1. Cập nhật gói trả góp
export async function updatePlan(token, id, payload) {
  const res = await client.put(`/plans/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
}

// 2.2. Xoá (ngưng áp dụng) gói trả góp
// BE sẽ set active = false, không xoá cứng trong DB
export async function deactivatePlan(token, id) {
  const res = await client.delete(`/plans/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data; // trả về PlanResponse với active = false
}

// 3. Dashboard overview
export async function getDashboardOverview(token) {
  const res = await client.get("/dashboard/overview", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

// 4. Lấy hồ sơ trả góp
export async function getApplications(token, filters = {}) {
  const res = await client.get("/applications", {
    params: filters,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

// 🟢 STATUS MAPPING: FE → BE ENUM
const STATUS_MAP = {
  approve: "APPROVED",
  reject: "REJECTED",
  pending: "PENDING",
};

// 5. Cập nhật trạng thái hồ sơ
export async function updateApplicationStatus(token, id, action) {
  const status = STATUS_MAP[action];

  const res = await client.put(
    `/applications/${id}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
}

// 6. Lấy danh sách hợp đồng
export async function getContracts(token, filters = {}) {
  const res = await client.get("/contracts", {
    params: filters,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function getContractDetail(token, id) {
  const res = await client.get(`/contracts/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

// ========== EXPORT ==========
const InstallmentApi = {
  getPlans,
  createPlan,
  updatePlan,
  deactivatePlan,
  getDashboardOverview,
  getApplications,
  updateApplicationStatus,
  getContracts,
  getContractDetail,  
};

export default InstallmentApi;
