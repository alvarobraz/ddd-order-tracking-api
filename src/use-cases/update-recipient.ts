import { RecipientsRepository } from "@/domain/repositories/recipients-repository"
import { UsersRepository } from "@/domain/repositories/users-repository"

interface UpdateRecipientUseCaseRequest {
  adminId: string
  recipientId: string
  name?: string
  street?: string
  number?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
  phone?: string
  email?: string
  latitude?: number
  longitude?: number
}

export class UpdateRecipientUseCase {
  constructor(
    private recipientsRepository: RecipientsRepository,
    private usersRepository: UsersRepository
  ) {}

  async execute({ adminId, recipientId, name, street, number, neighborhood, city, state, zipCode, phone, email }: UpdateRecipientUseCaseRequest) {
    const admin = await this.usersRepository.findById(adminId)
    if (!admin || admin.role !== 'admin' || admin.status !== 'active') {
      throw new Error('Only active admins can update recipients')
    }

    const recipient = await this.recipientsRepository.findById(recipientId)
    if (!recipient) {
      throw new Error('Recipient not found')
    }

    if (name !== undefined) {
      recipient.name = name
    }
    if (street !== undefined) {
      recipient.street = street
    }
    if (number !== undefined) {
      recipient.number = number
    }
    if (neighborhood !== undefined) {
      recipient.neighborhood = neighborhood
    }
    if (city !== undefined) {
      recipient.city = city
    }
    if (state !== undefined) {
      recipient.state = state
    }
    if (zipCode !== undefined) {
      recipient.zipCode = zipCode
    }
    if (phone !== undefined) {
      recipient.phone = phone
    }
    if (email !== undefined) {
      recipient.email = email
    }

    await this.recipientsRepository.save(recipient)

    return recipient
  }
}