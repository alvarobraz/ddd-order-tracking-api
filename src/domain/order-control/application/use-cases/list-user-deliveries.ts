import { Order } from '@/domain/order-control/enterprise/entities/order'
import { OrdersRepository } from '@/domain/order-control/application/repositories/orders-repository'
import { UsersRepository } from '@/domain/order-control/application/repositories/users-repository'

interface ListUserDeliveriesUseCaseRequest {
  deliverymanId: string
}

export class ListUserDeliveriesUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    deliverymanId,
  }: ListUserDeliveriesUseCaseRequest): Promise<Order[]> {
    const deliveryman = await this.usersRepository.findById(deliverymanId)
    if (
      !deliveryman ||
      deliveryman.role !== 'deliveryman' ||
      deliveryman.status !== 'active'
    ) {
      throw new Error('Only active deliverymen can list their deliveries')
    }

    return this.ordersRepository.findByDeliverymanId(deliverymanId)
  }
}
