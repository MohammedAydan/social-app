// api/api.notifications.ts
import { apiClient } from "~/sdk/api-client";
import type { Any } from "../types/any";
import type { NotificationType } from "../types/notification-type";

export const createNotification = (payload: Any) => apiClient.post("/api/Notifications", payload);
export const getNotification = (id: string) => apiClient.get(`/api/Notifications/${encodeURIComponent(id)}`);
export const updateNotification = (id: string, payload: Any) => apiClient.put(`/api/Notifications/${encodeURIComponent(id)}`, payload);
export const deleteNotification = (id: string) => apiClient.delete(`/api/Notifications/${encodeURIComponent(id)}`);
export const getUserNotifications = (userId: string, page = 1, limit = 20) => apiClient.get<NotificationType[]>(`/api/Notifications/user/${encodeURIComponent(userId)}`, { page, limit });
export const getUnreadNotifications = (userId: string, page = 1, limit = 20) => apiClient.get<NotificationType[]>(`/api/Notifications/user/${encodeURIComponent(userId)}/unread`, { page, limit });
export const markNotificationAsRead = (id: string) => apiClient.post(`/api/Notifications/${encodeURIComponent(id)}/mark-read`);
export const markAllNotificationsAsRead = (userId: string) => apiClient.post(`/api/Notifications/user/${encodeURIComponent(userId)}/mark-all-read`);
export const deleteAllNotifications = (userId: string) => apiClient.delete(`/api/Notifications/user/${encodeURIComponent(userId)}/all`);
