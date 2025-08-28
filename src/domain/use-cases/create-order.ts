import { Order } from '@/domain/entities/order'
import { OrdersRepository } from '@/domain/repositories/orders-repository'
import { UsersRepository } from '@/domain/repositories/users-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

interface CreateOrderUseCaseRequest {
  adminId: string
  recipientId: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

export class CreateOrderUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    adminId,
    recipientId,
    street,
    number,
    neighborhood,
    city,
    state,
    zipCode,
  }: CreateOrderUseCaseRequest) {
    const admin = await this.usersRepository.findById(adminId)
    if (!admin || admin.role !== 'admin' || admin.status !== 'active') {
      throw new Error('Only active admins can create orders')
    }

    const order = Order.create({
      recipientId: new UniqueEntityID(recipientId),
      street,
      number,
      neighborhood,
      city,
      state,
      zipCode,
      status: 'pending',
    })

    await this.ordersRepository.create(order)

    return order
  }
}
