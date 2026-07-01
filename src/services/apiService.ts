const API_BASE_URL = 'http://localhost:5112';
const API_ENDPOINT = `${API_BASE_URL}/api/Task`;

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...options.headers,
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
  // GET /api/Task - Retrieve all tasks
  getAllTasks: () => request<unknown[]>(API_ENDPOINT),

  // GET /api/Task/{id} - Retrieve a specific task by ID
  getTaskById: (id: number | string) => request<unknown>(`${API_ENDPOINT}/${id}`),

  // POST /api/Task - Create a new task
  createTask: (task: unknown) => request<unknown>(API_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(task),
  }),
};
