const apiHelper = (() => {
  async function fetchData(url, options = {}) {
    const urlQuery = url.includes("?") ? url.split("?")[1] : "";
    const urlWithoutQuery = url.replace(`?${urlQuery}`, "");
    const fixUrl = urlWithoutQuery.endsWith("/")
      ? urlWithoutQuery.slice(0, -1)
      : urlWithoutQuery;
    const fullUrl = fixUrl + (urlQuery ? `?${urlQuery}` : "");

    const token = getAccessToken();
    const headers = {
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(fullUrl, {
      ...options,
      mode: "cors",
      headers,
    });
  }

  // Ubah objek parameter menjadi query string, nilai kosong diabaikan.
  // Contoh: buildQuery({ status: "lost", is_me: 1, q: "" }) => "?status=lost&is_me=1"
  function buildQuery(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        searchParams.append(key, value);
      }
    });
    const query = searchParams.toString();
    return query ? `?${query}` : "";
  }

  function putAccessToken(token) {
    if (!token) {
      localStorage.removeItem("accessToken");
    } else {
      localStorage.setItem("accessToken", token);
    }
  }

  function getAccessToken() {
    return localStorage.getItem("accessToken");
  }

  return {
    fetchData,
    buildQuery,
    putAccessToken,
    getAccessToken,
  };
})();

export default apiHelper;
