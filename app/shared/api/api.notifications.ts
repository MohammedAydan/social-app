// api/api.notifications.ts
import api from "./axios";
import type { Any } from "../types/any";

export const createNotification = async (payload: Any) => await api.post("/api/Notifications", payload);
export const getNotification = async (id: string) => await api.get(`/api/Notifications/${id}`);
export const updateNotification = async (id: string, payload: Any) => await api.put(`/api/Notifications/${id}`, payload);
export const deleteNotification = async (id: string) => await api.delete(`/api/Notifications/${id}`);
export const getUserNotifications = async (userId: string, page = 1, limit = 20) => await api.get(`/api/Notifications/user/${userId}`, { params: { page, limit } });
export const getUnreadNotifications = async (userId: string, page = 1, limit = 20) => await api.get(`/api/Notifications/user/${userId}/unread`, { params: { page, limit } });
export const markNotificationAsRead = async (id: string) => await api.post(`/api/Notifications/${id}/mark-read`);
export const markAllNotificationsAsRead = async (userId: string) => await api.post(`/api/Notifications/user/${userId}/mark-all-read`);
export const deleteAllNotifications = async (userId: string) => await api.delete(`/api/Notifications/user/${userId}/all`);
