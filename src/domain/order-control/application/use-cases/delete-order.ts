import { OrdersRepository } from '@/domain/order-control/application/repositories/orders-repository'
import { UsersRepository } from '@/domain/order-control/application/repositories/users-repository'

interface DeleteOrderUseCaseRequest {
  adminId: string
  orderId: string
}

export class DeleteOrderUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ adminId, orderId }: DeleteOrderUseCaseRequest) {
    const admin = await this.usersRepository.findById(adminId)
    if (!admin || admin.role !== 'admin' || admin.status !== 'active') {
      throw new Error('Only active admins can delete orders')
    }

    const order = await this.ordersRepository.findById(orderId)
    if (!order) {
      throw new Error('Order not found')
    }

    await this.ordersRepository.delete(orderId)
  }
}
