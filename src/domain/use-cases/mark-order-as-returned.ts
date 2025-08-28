import { OrdersRepository } from '@/domain/repositories/orders-repository'
import { UsersRepository } from '@/domain/repositories/users-repository'

interface MarkOrderAsReturnedUseCaseRequest {
  userId: string
  orderId: string
}

export class MarkOrderAsReturnedUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ userId, orderId }: MarkOrderAsReturnedUseCaseRequest) {
    const user = await this.usersRepository.findById(userId)
    if (!user || user.status !== 'active') {
      throw new Error('Only active users can mark orders as returned')
    }

    const order = await this.ordersRepository.findById(orderId)
    if (!order) {
      throw new Error('Order not found')
    }

    if (
      user.role === 'deliveryman' &&
      order.deliverymanId?.toString() !== userId
    ) {
      throw new Error(
        'Only the assigned deliveryman or an admin can mark the order as returned',
      )
    }

    order.status = 'returned'

    await this.ordersRepository.save(order)

    return order
  }
}
