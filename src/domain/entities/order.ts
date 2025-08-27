import { Entity } from "@/core/entities/entity"
import { UniqueEntityID } from "@/core/entities/unique-entity-id"
import { Optional } from "@/core/types/optional"

interface OrderProps {
  recipientId: UniqueEntityID
  deliverymanId?: UniqueEntityID
  status: 'pending' | 'picked_up' | 'delivered' | 'returned'
  deliveryAddress: string
  deliveryPhoto?: string
  createdAt: Date
  updatedAt?: Date
}

export class Order extends Entity<OrderProps> {
  get recipientId() {
    return this.props.recipientId
  }

  get deliverymanId() {
    return this.props.deliverymanId
  }

  get status() {
    return this.props.status
  }

  get deliveryAddress() {
    return this.props.deliveryAddress
  }

  get deliveryPhoto() {
    return this.props.deliveryPhoto
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  set deliverymanId(deliverymanId: UniqueEntityID | undefined) {
    this.props.deliverymanId = deliverymanId
    this.touch()
  }

  set status(status: 'pending' | 'picked_up' | 'delivered' | 'returned') {
    this.props.status = status
    this.touch()
  }

  set deliveryPhoto(deliveryPhoto: string | undefined) {
    this.props.deliveryPhoto = deliveryPhoto
    this.touch()
  }

  static create(
    props: Optional<OrderProps, 'createdAt' | 'updatedAt' | 'deliverymanId' | 'deliveryPhoto'>,
    id?: UniqueEntityID
  ) {
    const order = new Order(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )

    return order
  }
}