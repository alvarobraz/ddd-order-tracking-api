import { Order } from '@/domain/entities/order'
import { OrdersRepository } from '@/domain/repositories/orders-repository'
import { UsersRepository } from '@/domain/repositories/users-repository'

interface ListNearbyOrdersUseCaseRequest {
  deliverymanId: string
  neighborhood: string
}

export class ListNearbyOrdersUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    deliverymanId,
    neighborhood,
  }: ListNearbyOrdersUseCaseRequest): Promise<Order[]> {
    const deliveryman = await this.usersRepository.findById(deliverymanId)
    if (
      !deliveryman ||
      deliveryman.role !== 'deliveryman' ||
      deliveryman.status !== 'active'
    ) {
      throw new Error('Only active deliverymen can list nearby orders')
    }

    return this.ordersRepository.findNearby(neighborhood)
  }
}
