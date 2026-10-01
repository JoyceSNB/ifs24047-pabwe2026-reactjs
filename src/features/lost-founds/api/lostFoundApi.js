import apiHelper from "../../../helpers/apiHelper";

const lostFoundApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/lost-founds`;

  function _url(path) {
    return BASE_URL + path;
  }

  // Kirim request lalu validasi format respons Delcom ({ status, message, data })
  async function _request(path, options, errorMessage) {
    const response = await apiHelper.fetchData(_url(path), options);
    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || errorMessage);
    }
    return result;
  }

  function _jsonOptions(method, body) {
    return {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };
  }

  async function postLostFound(title, description, status) {
    const result = await _request(
      "/",
      _jsonOptions("POST", { title, description, status }),
      "Gagal menambahkan laporan"
    );
    return result.data;
  }

  async function postLostFoundCover(lostFoundId, cover) {
    const formData = new FormData();
    formData.append("cover", cover, cover.name || "cover.jpg");
    const result = await _request(
      `/${lostFoundId}/cover`,
      { method: "POST", body: formData },
      "Gagal mengubah cover"
    );
    return result.message;
  }

  async function putLostFound(lostFoundId, title, description, status, is_completed) {
    const result = await _request(
      `/${lostFoundId}`,
      _jsonOptions("PUT", {
        title,
        description,
        status,
        is_completed: is_completed ? 1 : 0,
      }),
      "Gagal mengubah laporan"
    );
    return result.message;
  }

  // filters: { status: "lost" | "found", is_completed: 1 | 0, is_me: 1 }
  async function getLostFounds(filters = {}) {
    const query = apiHelper.buildQuery({
      status: filters.status,
      is_completed: filters.is_completed,
      is_me: filters.is_me,
    });
    const result = await _request(`/${query}`, { method: "GET" }, "Gagal mengambil data laporan");
    return result.data?.lost_founds || [];
  }

  async function getLostFoundById(lostFoundId) {
    const result = await _request(
      `/${lostFoundId}`,
      { method: "GET" },
      "Gagal mengambil detail laporan"
    );
    return result.data?.lost_found;
  }

  async function deleteLostFound(lostFoundId) {
    const result = await _request(
      `/${lostFoundId}`,
      { method: "DELETE" },
      "Gagal menghapus laporan"
    );
    return result.message;
  }

  // period: "daily" | "monthly", params: { end_date, total_data }
  async function getStats(period, params = {}) {
    const query = apiHelper.buildQuery({
      end_date: params.end_date,
      total_data: params.total_data,
    });
    const result = await _request(
      `/stats/${period}${query}`,
      { method: "GET" },
      "Gagal mengambil statistik"
    );
    return result.data || {};
  }

  function getStatsDaily(params) {
    return getStats("daily", params);
  }

  function getStatsMonthly(params) {
    return getStats("monthly", params);
  }

  return {
    postLostFound,
    postLostFoundCover,
    putLostFound,
    getLostFounds,
    getLostFoundById,
    deleteLostFound,
    getStatsDaily,
    getStatsMonthly,
  };
})();

export default lostFoundApi;
