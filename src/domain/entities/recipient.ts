import { Entity } from "@/core/entities/entity"
import { UniqueEntityID } from "@/core/entities/unique-entity-id"
import { Optional } from "@/core/types/optional"

interface RecipientProps {
  name: string
  address: string
  contactInfo: string
  latitude: number
  longitude: number
  createdAt: Date
  updatedAt?: Date
}

export class Recipient extends Entity<RecipientProps> {
  get name() {
    return this.props.name
  }

  get address() {
    return this.props.address
  }

  get contactInfo() {
    return this.props.contactInfo
  }

  get latitude() {
    return this.props.latitude
  }

  get longitude() {
    return this.props.longitude
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

  set address(address: string) {
    this.props.address = address
    this.touch()
  }

  set contactInfo(contactInfo: string) {
    this.props.contactInfo = contactInfo
    this.touch()
  }

  set latitude(latitude: number) {
    this.props.latitude = latitude
    this.touch()
  }

  set longitude(longitude: number) {
    this.props.longitude = longitude
    this.touch()
  }

  static create(
    props: Optional<RecipientProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID
  ) {
    const recipient = new Recipient(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )

    return recipient
  }
}