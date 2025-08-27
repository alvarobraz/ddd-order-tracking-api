import { Notification } from "../entities/notification"

export interface NotificationsRepository {
  create(notification: Notification): Promise<void>
}