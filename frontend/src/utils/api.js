export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const getSession = () => {
	try {
		return JSON.parse(localStorage.getItem("checkchow_session") || "null");
	} catch {
		return null;
	}
};

export const apiRequest = async (path, options = {}) => {
	const session = getSession();
	const headers = {
		...(options.body ? { "Content-Type": "application/json" } : {}),
		...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
		...(options.headers || {}),
	};

	const response = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers,
	});

	if (response.status === 204) {
		return null;
	}

	const data = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(data?.message || data?.error || `Error HTTP ${response.status}`);
	}

	return data;
};
