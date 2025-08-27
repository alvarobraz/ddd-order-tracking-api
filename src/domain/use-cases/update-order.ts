import { OrdersRepository } from "@/domain/repositories/orders-repository"
import { UsersRepository } from "@/domain/repositories/users-repository"
import { UniqueEntityID } from "@/core/entities/unique-entity-id"

interface UpdateOrderUseCaseRequest {
  adminId: string
  orderId: string
  recipientId?: string
  street?: string
  number?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
}

export class UpdateOrderUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private usersRepository: UsersRepository
  ) {}

  async execute({ adminId, orderId, recipientId, street, number, neighborhood, city, state, zipCode }: UpdateOrderUseCaseRequest) {
    const admin = await this.usersRepository.findById(adminId)
    if (!admin || admin.role !== 'admin' || admin.status !== 'active') {
      throw new Error('Only active admins can update orders')
    }

    const order = await this.ordersRepository.findById(orderId)
    if (!order) {
      throw new Error('Order not found')
    }

    if (recipientId !== undefined) {
      order.recipientId = new UniqueEntityID(recipientId)
    }
    if (street !== undefined) {
      order.street = street
    }
    if (number !== undefined) {
      order.number = number
    }
    if (neighborhood !== undefined) {
      order.neighborhood = neighborhood
    }
    if (city !== undefined) {
      order.city = city
    }
    if (state !== undefined) {
      order.state = state
    }
    if (zipCode !== undefined) {
      order.zipCode = zipCode
    }

    await this.ordersRepository.save(order)

    return order
  }
}