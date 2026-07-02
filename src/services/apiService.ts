const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const API_ENDPOINT = `${API_BASE_URL}/api/Task`;

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

async function request<T>(url: string, options: RequestInit = {}, authToken?: string | null): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...options.headers,
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Request failed with status ${response.status}`;

    if (errorText) {
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson?.title || errorJson?.detail || errorJson?.errors) {
          errorMessage += ` - ${JSON.stringify(errorJson)}`;
        } else {
          errorMessage += ` - ${errorText}`;
        }
      } catch {
        errorMessage += ` - ${errorText}`;
      }
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const apiService = {
  // GET /api/Task - Retrieve all tasks, optionally filtered by userId
  getAllTasks: (userId?: string, authToken?: string | null) => request<unknown[]>(
    userId ? `${API_ENDPOINT}?userId=${encodeURIComponent(userId)}` : API_ENDPOINT,
    undefined,
    authToken
  ),

  // GET /api/Task/{id} - Retrieve a specific task by ID
  getTaskById: (id: number | string, authToken?: string | null) => request<unknown>(`${API_ENDPOINT}/${id}`, undefined, authToken),

  // POST /api/Task - Create a new task
  createTask: (task: unknown, authToken?: string | null) => request<unknown>(API_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(task),
  }, authToken),

  // PUT /api/Task/{id} - Update an existing task
  updateTask: (id: number | string, task: unknown, authToken?: string | null) => request<unknown>(`${API_ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(task),
  }, authToken),

  // DELETE /api/Task/{id} - Delete an existing task
  deleteTask: (id: number | string, authToken?: string | null) => request<void>(`${API_ENDPOINT}/${id}`, {
    method: 'DELETE',
  }, authToken),
};
