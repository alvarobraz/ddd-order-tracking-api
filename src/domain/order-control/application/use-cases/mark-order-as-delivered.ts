import { Either, left, right } from '@/core/either'
import { OrdersRepository } from '@/domain/order-control/application/repositories/orders-repository'
import { UsersRepository } from '@/domain/order-control/application/repositories/users-repository'
import { OnlyActiveDeliverymenCanMarkOrdersAsDeliveredError } from './errors/only-active-deliverymen-can-mark-orders-as-delivered-error'
import { OrderNotFoundError } from './errors/order-not-found-error'
import { OnlyAssignedDeliverymanCanMarkOrderAsDeliveredError } from './errors/only-assigned-deliveryman-can-mark-order-as-delivered-error'
import { OrderMustBePickedUpToBeMarkedAsDeliveredError } from './errors/order-must-be-picked-up-to-be-marked-as-delivered-error'
import { DeliveryPhotoIsRequiredError } from './errors/delivery-photo-is-required-error'
import { Order } from '../../enterprise/entities/order'
import { OrderAttachment } from '../../enterprise/entities/order-attachment'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

interface MarkOrderAsDeliveredUseCaseRequest {
  deliverymanId: string
  orderId: string
  deliveryPhotoIds: string[]
}

type MarkOrderAsDeliveredUseCaseResponse = Either<
  | OnlyActiveDeliverymenCanMarkOrdersAsDeliveredError
  | OrderNotFoundError
  | OnlyAssignedDeliverymanCanMarkOrderAsDeliveredError
  | OrderMustBePickedUpToBeMarkedAsDeliveredError
  | DeliveryPhotoIsRequiredError,
  { order: Order }
>

export class MarkOrderAsDeliveredUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    deliverymanId,
    orderId,
    deliveryPhotoIds,
  }: MarkOrderAsDeliveredUseCaseRequest): Promise<MarkOrderAsDeliveredUseCaseResponse> {
    const deliveryman = await this.usersRepository.findById(deliverymanId)
    if (
      !deliveryman ||
      deliveryman.role !== 'deliveryman' ||
      deliveryman.status !== 'active'
    ) {
      return left(new OnlyActiveDeliverymenCanMarkOrdersAsDeliveredError())
    }

    const order = await this.ordersRepository.findById(orderId)
    if (!order) {
      return left(new OrderNotFoundError())
    }

    if (order.deliverymanId?.toString() !== deliverymanId) {
      return left(new OnlyAssignedDeliverymanCanMarkOrderAsDeliveredError())
    }

    if (order.status !== 'picked_up') {
      return left(new OrderMustBePickedUpToBeMarkedAsDeliveredError())
    }

    if (deliveryPhotoIds.length === 0) {
      return left(new DeliveryPhotoIsRequiredError())
    }

    const orderAttachments = deliveryPhotoIds.map((deliveryPhotoId) => {
      return OrderAttachment.create({
        attachmentId: new UniqueEntityID(deliveryPhotoId),
        orderId: new UniqueEntityID(orderId),
      })
    })

    order.status = 'delivered'
    order.deliveryPhoto = orderAttachments

    await this.ordersRepository.save(order)

    return right({ order })
  }
}
