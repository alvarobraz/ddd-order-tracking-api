import { Entity } from "@/core/entities/entity"
import { UniqueEntityID } from "@/core/entities/unique-entity-id"
import { Optional } from "@/core/types/optional"

interface DeliverymanProps {
  name: string
  cpf: string
  contactInfo: string
  createdAt: Date
  updatedAt?: Date
}

export class Deliveryman extends Entity<DeliverymanProps> {
  get name() {
    return this.props.name
  }

  get cpf() {
    return this.props.cpf
  }

  get contactInfo() {
    return this.props.contactInfo
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

  set name(name: string) {
    this.props.name = name
    this.touch()
  }

  set contactInfo(contactInfo: string) {
    this.props.contactInfo = contactInfo
    this.touch()
  }

  static create(
    props: Optional<DeliverymanProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID
  ) {
    const deliveryman = new Deliveryman(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )

    return deliveryman
  }
}