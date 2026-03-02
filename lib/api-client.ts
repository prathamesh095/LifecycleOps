/**
 * API client utilities for communicating with backend
 * All requests include the userId header for authorization
 */

import { getUserId } from "./auth-setup";

const API_BASE = "/api";
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const userId = getUserId();
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      "x-user-id": userId,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json();
}

// ============ APPLICATIONS ============

export interface ApplicationResponse {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: "active" | "archived" | "closed";
  category?: string;
  appliedDate?: string;
  createdAt: string;
  updatedAt: string;
  activities?: any[];
  contacts?: any[];
  reminders?: any[];
}

export interface ApplicationsListResponse {
  items: ApplicationResponse[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const applicationsAPI = {
  list: async (cursor?: string, limit = 20, status?: string) => {
    const params = new URLSearchParams();
    if (cursor) params.append("cursor", cursor);
    params.append("limit", limit.toString());
    if (status) params.append("status", status);
    
    return apiRequest<ApplicationsListResponse>(
      `/applications?${params.toString()}`
    );
  },

  get: async (id: string) => {
    return apiRequest<ApplicationResponse>(`/applications/${id}`);
  },

  create: async (data: {
    name: string;
    description?: string;
    status?: string;
    category?: string;
    appliedDate?: string;
  }) => {
    return apiRequest<ApplicationResponse>("/applications", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: Partial<{
      name: string;
      description?: string;
      status?: string;
      category?: string;
      appliedDate?: string;
    }>
  ) => {
    return apiRequest<ApplicationResponse>(`/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/applications/${id}`, {
      method: "DELETE",
    });
  },
};

// ============ ACTIVITIES ============

export interface ActivityResponse {
  id: string;
  userId: string;
  applicationId?: string;
  type: string;
  title: string;
  description?: string;
  date?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  application?: any;
}

export interface ActivitiesListResponse {
  items: ActivityResponse[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const activitiesAPI = {
  list: async (cursor?: string, limit = 20, applicationId?: string) => {
    const params = new URLSearchParams();
    if (cursor) params.append("cursor", cursor);
    params.append("limit", limit.toString());
    if (applicationId) params.append("applicationId", applicationId);
    
    return apiRequest<ActivitiesListResponse>(
      `/activities?${params.toString()}`
    );
  },

  get: async (id: string) => {
    return apiRequest<ActivityResponse>(`/activities/${id}`);
  },

  create: async (data: {
    applicationId?: string;
    type: string;
    title: string;
    description?: string;
    date?: string;
    notes?: string;
  }) => {
    return apiRequest<ActivityResponse>("/activities", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: Partial<{
      applicationId?: string;
      type?: string;
      title?: string;
      description?: string;
      date?: string;
      notes?: string;
    }>
  ) => {
    return apiRequest<ActivityResponse>(`/activities/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/activities/${id}`, {
      method: "DELETE",
    });
  },
};

// ============ CONTACTS ============

export interface ContactResponse {
  id: string;
  userId: string;
  applicationId?: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  application?: any;
}

export interface ContactsListResponse {
  items: ContactResponse[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const contactsAPI = {
  list: async (cursor?: string, limit = 20, applicationId?: string) => {
    const params = new URLSearchParams();
    if (cursor) params.append("cursor", cursor);
    params.append("limit", limit.toString());
    if (applicationId) params.append("applicationId", applicationId);
    
    return apiRequest<ContactsListResponse>(
      `/contacts?${params.toString()}`
    );
  },

  get: async (id: string) => {
    return apiRequest<ContactResponse>(`/contacts/${id}`);
  },

  create: async (data: {
    applicationId?: string;
    name: string;
    role?: string;
    email?: string;
    phone?: string;
    company?: string;
    notes?: string;
  }) => {
    return apiRequest<ContactResponse>("/contacts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: Partial<{
      applicationId?: string;
      name?: string;
      role?: string;
      email?: string;
      phone?: string;
      company?: string;
      notes?: string;
    }>
  ) => {
    return apiRequest<ContactResponse>(`/contacts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/contacts/${id}`, {
      method: "DELETE",
    });
  },
};

// ============ REMINDERS ============

export interface ReminderResponse {
  id: string;
  userId: string;
  applicationId?: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  application?: any;
}

export interface RemindersListResponse {
  items: ReminderResponse[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const remindersAPI = {
  list: async (
    cursor?: string,
    limit = 20,
    applicationId?: string,
    completed?: boolean
  ) => {
    const params = new URLSearchParams();
    if (cursor) params.append("cursor", cursor);
    params.append("limit", limit.toString());
    if (applicationId) params.append("applicationId", applicationId);
    if (completed !== undefined) params.append("completed", completed.toString());
    
    return apiRequest<RemindersListResponse>(
      `/reminders?${params.toString()}`
    );
  },

  get: async (id: string) => {
    return apiRequest<ReminderResponse>(`/reminders/${id}`);
  },

  create: async (data: {
    applicationId?: string;
    title: string;
    description?: string;
    dueDate: string;
    priority?: "low" | "medium" | "high";
    completed?: boolean;
  }) => {
    return apiRequest<ReminderResponse>("/reminders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: Partial<{
      applicationId?: string;
      title?: string;
      description?: string;
      dueDate?: string;
      priority?: "low" | "medium" | "high";
      completed?: boolean;
    }>
  ) => {
    return apiRequest<ReminderResponse>(`/reminders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/reminders/${id}`, {
      method: "DELETE",
    });
  },
};
