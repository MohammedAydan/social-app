// api/api.notifications.ts — Notifications, backed by the generated SDK
// (`app/lib/sdk/endpoints/notifications`). No manual HTTP, no `Any` payloads:
// writes use the canonical DTOs. `NotificationType`/`NotificationInboxResponse`
// stay local (response entities with no spec model).
import {
    deleteApiNotificationsId,
    deleteApiNotificationsUserUserIdAll,
    getApiNotificationsId,
    getApiNotificationsInbox,
    getApiNotificationsPreferences,
    getApiNotificationsUnreadCount,
    getApiNotificationsUserUserId,
    getApiNotificationsUserUserIdUnread,
    postApiNotifications,
    postApiNotificationsIdMarkRead,
    postApiNotificationsUserUserIdMarkAllRead,
    putApiNotificationsId,
    putApiNotificationsPreferences,
} from "~/lib/sdk/endpoints/notifications/notifications";
import type {
    CreateNotificationDto,
    NotificationPreferenceDto,
    UpdateNotificationDto,
} from "~/lib/sdk/models";
import {
    GetApiNotificationsInboxQueryParams,
    GetApiNotificationsUserUserIdQueryParams,
    GetApiNotificationsUserUserIdUnreadQueryParams,
    PostApiNotificationsBody,
    PutApiNotificationsIdBody,
    PutApiNotificationsPreferencesBody,
} from "~/lib/sdk/validations/notifications/notifications";
import { handleRequest } from "./api.handle-request";
import type { NotificationInboxResponse, NotificationType } from "../types/notification-type";

export const createNotification = (payload: CreateNotificationDto) =>
    handleRequest(postApiNotifications(PostApiNotificationsBody.parse(payload)));
export const getNotification = (id: string) => handleRequest(getApiNotificationsId(id));
export const updateNotification = (id: string, payload: UpdateNotificationDto) =>
    handleRequest(putApiNotificationsId(id, PutApiNotificationsIdBody.parse(payload)));
export const deleteNotification = (id: string) => handleRequest(deleteApiNotificationsId(id));
export const getUserNotifications = (userId: string, page = 1, limit = 20) =>
    handleRequest<NotificationType[]>(
        getApiNotificationsUserUserId(
            userId,
            GetApiNotificationsUserUserIdQueryParams.parse({ page, limit })
        )
    );
export const getUnreadNotifications = (userId: string, page = 1, limit = 20) =>
    handleRequest(
        getApiNotificationsUserUserIdUnread(
            userId,
            GetApiNotificationsUserUserIdUnreadQueryParams.parse({ page, limit })
        )
    );
export const markNotificationAsRead = (id: string) =>
    handleRequest(postApiNotificationsIdMarkRead(id));
export const markAllNotificationsAsRead = (userId: string) =>
    handleRequest(postApiNotificationsUserUserIdMarkAllRead(userId));
export const deleteAllNotifications = (userId: string) =>
    handleRequest(deleteApiNotificationsUserUserIdAll(userId));

/* ---- Smart-inbox endpoints (ADR-010, API_REFERENCE §7) ---- */

export interface InboxParams {
    type?: string;
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
}

export const getInbox = (params: InboxParams = {}) =>
    handleRequest<NotificationInboxResponse>(
        getApiNotificationsInbox(
            GetApiNotificationsInboxQueryParams.parse({
                ...(params.type ? { type: params.type } : {}),
                unreadOnly: params.unreadOnly ?? false,
                page: params.page ?? 1,
                limit: params.limit ?? 20,
            })
        )
    );

export const getUnreadCount = () => handleRequest<number>(getApiNotificationsUnreadCount());

export const getNotificationPreferences = () =>
    handleRequest<NotificationPreferenceDto>(getApiNotificationsPreferences());

export const updateNotificationPreferences = (payload: NotificationPreferenceDto) =>
    handleRequest<NotificationPreferenceDto>(
        putApiNotificationsPreferences(PutApiNotificationsPreferencesBody.parse(payload))
    );
