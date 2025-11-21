import { createHttpClient } from "./httpClient";

/**
 * Gọi installment-service qua API Gateway
 * Public pattern:
 *   http://localhost:8080/api/v1/installment/...
 */

const GATEWAY_BASE_URL =
  import.meta.env.VITE_GATEWAY_BASE_URL || "http://localhost:8080";

const API_PREFIX =
  import.meta.env.VITE_GATEWAY_API_PREFIX || "/api/v1";

const INSTALLMENT_PREFIX =
  import.meta.env.VITE_INSTALLMENT_PREFIX || "/installment";

const client = createHttpClient(GATEWAY_BASE_URL);

const gw = (path) => `${API_PREFIX}${INSTALLMENT_PREFIX}${path}`;

// ================== API REQUESTS ==================

export async function getPlans(token) {
  const res = await client.get(gw("/plans"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function createPlan(token, payload) {
  const res = await client.post(gw("/plans"), payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function updatePlan(token, id, payload) {
  const res = await client.put(gw(`/plans/${id}`), payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function deactivatePlan(token, id) {
  const res = await client.delete(gw(`/plans/${id}`), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getDashboardOverview(token) {
  const res = await client.get(gw("/dashboard/overview"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getApplications(token, filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      params.append(k, v);
    }
  });

  const res = await client.get(gw(`/applications?${params.toString()}`), {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
}

/**
 * Update trạng thái hồ sơ.
 * status phải là "APPROVED" | "REJECTED" | "PENDING"
 */
export async function updateApplicationStatus(token, id, status) {
  const res = await client.put(
    gw(`/applications/${id}/status`),
    { status },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
}

/**
 * Precheck cho site khách.
 * payload BẮT BUỘC có tenorMonths (kỳ hạn trả góp).
 */
export async function precheckApplication(payload) {
  const res = await client.post(gw("/applications/precheck"), payload);
  return res.data;
}

/**
 * Tạo hồ sơ trả góp mới.
 * payload BẮT BUỘC có tenorMonths.
 */
export async function createApplication(payload) {
  const res = await client.post(gw("/applications"), payload);
  return res.data;
}

// ================== CONTRACTS ==================

export async function getContracts(token, filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      params.append(k, v);
    }
  });

  const res = await client.get(gw(`/contracts?${params.toString()}`), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getContractDetail(token, id) {
  const res = await client.get(gw(`/contracts/${id}`), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

const InstallmentApi = {
  getPlans,
  createPlan,
  updatePlan,
  deactivatePlan,
  getDashboardOverview,

  getApplications,
  updateApplicationStatus,
  precheckApplication,
  createApplication,

  getContracts,
  getContractDetail,
};

export default InstallmentApi;
