// api/api.notifications.ts
import api from "./axios";
import type { Any } from "../types/any";
import { handleRequest } from "./api.handle-request";
import type { NotificationType } from "../types/notification-type";

export const createNotification = (payload: Any) => handleRequest(api.post("/api/Notifications", payload));
export const getNotification = (id: string) => handleRequest(api.get(`/api/Notifications/${id}`));
export const updateNotification = (id: string, payload: Any) => handleRequest(api.put(`/api/Notifications/${id}`, payload));
export const deleteNotification = (id: string) => handleRequest(api.delete(`/api/Notifications/${id}`));
export const getUserNotifications = (userId: string, page = 1, limit = 20) => handleRequest<NotificationType[]>(api.get(`/api/Notifications/user/${userId}`, { params: { page, limit } }));
export const getUnreadNotifications = (userId: string, page = 1, limit = 20) => handleRequest(api.get(`/api/Notifications/user/${userId}/unread`, { params: { page, limit } }));
export const markNotificationAsRead = (id: string) => handleRequest(api.post(`/api/Notifications/${id}/mark-read`));
export const markAllNotificationsAsRead = (userId: string) => handleRequest(api.post(`/api/Notifications/user/${userId}/mark-all-read`));
export const deleteAllNotifications = (userId: string) => handleRequest(api.delete(`/api/Notifications/user/${userId}/all`));
