import { Order } from '@/domain/order-control/enterprise/entities/order'
import { OrdersRepository } from '@/domain/order-control/application/repositories/orders-repository'
import { UsersRepository } from '@/domain/order-control/application/repositories/users-repository'

interface ListOrdersUseCaseRequest {
  adminId: string
}

export class ListOrdersUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ adminId }: ListOrdersUseCaseRequest): Promise<Order[]> {
    const admin = await this.usersRepository.findById(adminId)
    if (!admin || admin.role !== 'admin' || admin.status !== 'active') {
      throw new Error('Only active admins can list orders')
    }

    return this.ordersRepository.findAll()
  }
}
