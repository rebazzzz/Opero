/*
  Frontend fetch test for GET /dashboard/summary
  Usage in browser console:
    await fetchDashboardSummary({
      apiBaseUrl: "http://localhost:4000",
      accessToken: "<valid_access_token>"
    });
*/

const REQUIRED_KEYS = [
  "totalProjects",
  "activeProjects",
  "totalClients",
  "unpaidInvoices",
  "revenueThisMonth",
  "unreadNotifications"
];

const assertDashboardMetrics = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Expected JSON object response");
  }

  const data = payload.data;
  if (!data || typeof data !== "object") {
    throw new Error("Missing 'data' object in response");
  }

  for (const key of REQUIRED_KEYS) {
    if (!(key in data)) {
      throw new Error(`Missing metric '${key}'`);
    }
    if (typeof data[key] !== "number" || Number.isNaN(data[key])) {
      throw new Error(`Metric '${key}' must be a valid number`);
    }
  }
};

export const fetchDashboardSummary = async ({ apiBaseUrl, accessToken }) => {
  const response = await fetch(`${apiBaseUrl}/dashboard/summary`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const json = await response.json();
  console.log("Dashboard summary response:", json);

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}: ${JSON.stringify(json)}`);
  }

  assertDashboardMetrics(json);
  return json;
};

/*
  Axios equivalent (if axios is available in your frontend app):

  import axios from "axios";

  export async function fetchDashboardSummaryAxios(apiBaseUrl, accessToken) {
    const { data } = await axios.get(`${apiBaseUrl}/dashboard/summary`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    assertDashboardMetrics(data);
    console.log("Dashboard summary response:", data);
    return data;
  }
*/
