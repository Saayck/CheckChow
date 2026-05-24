export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const getSession = () => {
	try {
		return JSON.parse(localStorage.getItem("checkchow_session") || "null");
	} catch {
		return null;
	}
};

const refreshAccessToken = async () => {
	const session = getSession();
	if (!session?.refreshToken) return null;

	try {
		const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken: session.refreshToken }),
		});

		if (!response.ok) return null;

		const data = await response.json().catch(() => null);
		if (data?.token) {
			localStorage.setItem(
				"checkchow_session",
				JSON.stringify({ ...session, token: data.token })
			);
			return data.token;
		}
	} catch {
		return null;
	}
	return null;
};

export const apiRequest = async (path, options = {}, _retry = true) => {
	const session = getSession();
	const { redirectOnUnauthorized = true, ...fetchOptions } = options;
	const headers = {
		...(fetchOptions.body ? { "Content-Type": "application/json" } : {}),
		...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
		...(fetchOptions.headers || {}),
	};

	const response = await fetch(`${API_BASE_URL}${path}`, {
		...fetchOptions,
		headers,
	});

	if (response.status === 401 && _retry) {
		const newToken = await refreshAccessToken();
		if (newToken) {
			return apiRequest(path, options, false);
		}
		localStorage.removeItem("checkchow_session");
		if (redirectOnUnauthorized !== false) {
			window.location.href = "/";
			return null;
		}
		throw new Error("Sesion expirada o no autorizada. Inicia sesion nuevamente.");
	}

	if (response.status === 204) {
		return null;
	}

	const data = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(data?.message || data?.error || `Error HTTP ${response.status}`);
	}

	return data;
};
