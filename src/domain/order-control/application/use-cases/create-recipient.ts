import { Recipient } from '@/domain/order-control/enterprise/entities/recipient'
import { RecipientsRepository } from '@/domain/order-control/application/repositories/recipients-repository'
import { UsersRepository } from '@/domain/order-control/application/repositories/users-repository'

interface CreateRecipientUseCaseRequest {
  adminId: string
  name: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
}

export class CreateRecipientUseCase {
  constructor(
    private recipientsRepository: RecipientsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    adminId,
    name,
    street,
    number,
    neighborhood,
    city,
    state,
    zipCode,
    phone,
    email,
  }: CreateRecipientUseCaseRequest) {
    const admin = await this.usersRepository.findById(adminId)
    if (!admin || admin.role !== 'admin' || admin.status !== 'active') {
      throw new Error('Only active admins can create recipients')
    }

    const recipient = Recipient.create({
      name,
      street,
      number,
      neighborhood,
      city,
      state,
      zipCode,
      phone,
      email,
    })

    await this.recipientsRepository.create(recipient)

    return recipient
  }
}
