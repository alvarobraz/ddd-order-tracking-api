import { Notification } from '@/domain/order-control/enterprise/entities/notification'
import { NotificationsRepository } from '@/domain/order-control/application/repositories/notifications-repository'

export class InMemoryNotificationsRepository
  implements NotificationsRepository
{
  public items: Notification[] = []

  async create(notification: Notification): Promise<void> {
    this.items.push(notification)
  }
}
