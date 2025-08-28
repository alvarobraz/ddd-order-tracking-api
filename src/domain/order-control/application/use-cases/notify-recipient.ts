import { Notification } from '@/domain/order-control/enterprise/entities/notification'
import { NotificationsRepository } from '@/domain/order-control/application/repositories/notifications-repository'
import { OrdersRepository } from '@/domain/order-control/application/repositories/orders-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

interface NotifyRecipientUseCaseRequest {
  orderId: string
  status: 'pending' | 'picked_up' | 'delivered' | 'returned'
}

export class NotifyRecipientUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private notificationsRepository: NotificationsRepository,
  ) {}

  async execute({ orderId, status }: NotifyRecipientUseCaseRequest) {
    const order = await this.ordersRepository.findById(orderId)
    if (!order) {
      throw new Error('Order not found')
    }

    const notification = Notification.create({
      orderId: new UniqueEntityID(orderId),
      message: `Order status updated to ${status}`,
      type: 'email',
    })

    await this.notificationsRepository.create(notification)

    return notification
  }
}
