import { OrdersRepository } from '@/domain/order-control/application/repositories/orders-repository'
import { UsersRepository } from '@/domain/order-control/application/repositories/users-repository'

interface MarkOrderAsDeliveredUseCaseRequest {
  deliverymanId: string
  orderId: string
  deliveryPhoto: string
}

export class MarkOrderAsDeliveredUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    deliverymanId,
    orderId,
    deliveryPhoto,
  }: MarkOrderAsDeliveredUseCaseRequest) {
    const deliveryman = await this.usersRepository.findById(deliverymanId)
    if (
      !deliveryman ||
      deliveryman.role !== 'deliveryman' ||
      deliveryman.status !== 'active'
    ) {
      throw new Error('Only active deliverymen can mark orders as delivered')
    }

    const order = await this.ordersRepository.findById(orderId)
    if (!order) {
      throw new Error('Order not found')
    }

    if (order.deliverymanId?.toString() !== deliverymanId) {
      throw new Error(
        'Only the assigned deliveryman can mark the order as delivered',
      )
    }

    if (order.status !== 'picked_up') {
      throw new Error('Order must be picked up to be marked as delivered')
    }

    if (!deliveryPhoto) {
      throw new Error('Delivery photo is required')
    }

    order.status = 'delivered'
    order.deliveryPhoto = deliveryPhoto

    await this.ordersRepository.save(order)

    return order
  }
}
