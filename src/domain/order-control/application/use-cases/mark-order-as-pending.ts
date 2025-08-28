import { OrdersRepository } from '@/domain/order-control/application/repositories/orders-repository'
import { UsersRepository } from '@/domain/order-control/application/repositories/users-repository'

interface MarkOrderAsPendingUseCaseRequest {
  adminId: string
  orderId: string
}

export class MarkOrderAsPendingUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ adminId, orderId }: MarkOrderAsPendingUseCaseRequest) {
    const admin = await this.usersRepository.findById(adminId)
    if (!admin || admin.role !== 'admin' || admin.status !== 'active') {
      throw new Error('Only active admins can mark orders as pending')
    }

    const order = await this.ordersRepository.findById(orderId)
    if (!order) {
      throw new Error('Order not found')
    }

    order.status = 'pending'

    await this.ordersRepository.save(order)

    return order
  }
}
