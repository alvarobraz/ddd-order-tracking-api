import { Entity } from "@/core/entities/entity"
import { UniqueEntityID } from "@/core/entities/unique-entity-id"
import { Optional } from "@/core/types/optional"

interface OrderProps {
  recipientId?: UniqueEntityID
  deliverymanId?: UniqueEntityID
  status: 'pending' | 'picked_up' | 'delivered' | 'returned'
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
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

  get street() {
    return this.props.street
  }

  get number() {
    return this.props.number
  }

  get neighborhood() {
    return this.props.neighborhood
  }

  get city() {
    return this.props.city
  }

  get state() {
    return this.props.state
  }

  get zipCode() {
    return this.props.zipCode
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

  set recipientId(recipientId: UniqueEntityID | undefined) {
    this.props.recipientId = recipientId
    this.touch()
  }

  set deliverymanId(deliverymanId: UniqueEntityID | undefined) {
    this.props.deliverymanId = deliverymanId
    this.touch()
  }

  set status(status: 'pending' | 'picked_up' | 'delivered' | 'returned') {
    this.props.status = status
    this.touch()
  }

  set street(street: string) {
    this.props.street = street
    this.touch()
  }

  set number(number: string) {
    this.props.number = number
    this.touch()
  }

  set neighborhood(neighborhood: string) {
    this.props.neighborhood = neighborhood
    this.touch()
  }

  set city(city: string) {
    this.props.city = city
    this.touch()
  }

  set state(state: string) {
    this.props.state = state
    this.touch()
  }

  set zipCode(zipCode: string) {
    this.props.zipCode = zipCode
    this.touch()
  }

  set deliveryPhoto(deliveryPhoto: string | undefined) {
    this.props.deliveryPhoto = deliveryPhoto
    this.touch()
  }

  static create(
    props: Optional<OrderProps, 'createdAt' | 'updatedAt' | 'recipientId' | 'deliverymanId' | 'deliveryPhoto'>,
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