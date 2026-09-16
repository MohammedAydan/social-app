import type { Any } from "../types/any";
import type { NotificationType } from "../types/notification-type";
import { sdkDelete, sdkGet, sdkPost, sdkPut, pageParams } from "~/sdk/endpoints";

export const createNotification = (payload: Any) => sdkPost("/api/Notifications", payload);
export const getNotification = (id: string) => sdkGet(`/api/Notifications/${id}`);
export const updateNotification = (id: string, payload: Any) => sdkPut(`/api/Notifications/${id}`, payload);
export const deleteNotification = (id: string) => sdkDelete(`/api/Notifications/${id}`);
export const getUserNotifications = (userId: string, page = 1, limit = 20) => sdkGet<NotificationType[]>(`/api/Notifications/user/${userId}`, pageParams(page, limit));
export const getUnreadNotifications = (userId: string, page = 1, limit = 20) => sdkGet<NotificationType[]>(`/api/Notifications/user/${userId}/unread`, pageParams(page, limit));
export const markNotificationAsRead = (id: string) => sdkPost(`/api/Notifications/${id}/mark-read`);
export const markAllNotificationsAsRead = (userId: string) => sdkPost(`/api/Notifications/user/${userId}/mark-all-read`);
export const deleteAllNotifications = (userId: string) => sdkDelete(`/api/Notifications/user/${userId}/all`);
