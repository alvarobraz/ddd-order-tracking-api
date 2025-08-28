import { OrdersRepository } from '@/domain/repositories/orders-repository'
import { UsersRepository } from '@/domain/repositories/users-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

interface PickUpOrderUseCaseRequest {
  deliverymanId: string
  orderId: string
}

export class PickUpOrderUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ deliverymanId, orderId }: PickUpOrderUseCaseRequest) {
    const deliveryman = await this.usersRepository.findById(deliverymanId)
    if (
      !deliveryman ||
      deliveryman.role !== 'deliveryman' ||
      deliveryman.status !== 'active'
    ) {
      throw new Error('Only active deliverymen can pick up orders')
    }

    const order = await this.ordersRepository.findById(orderId)
    if (!order) {
      throw new Error('Order not found')
    }

    if (order.status !== 'pending') {
      throw new Error('Order must be pending to be picked up')
    }

    order.deliverymanId = new UniqueEntityID(deliverymanId)
    order.status = 'picked_up'

    await this.ordersRepository.save(order)

    return order
  }
}
