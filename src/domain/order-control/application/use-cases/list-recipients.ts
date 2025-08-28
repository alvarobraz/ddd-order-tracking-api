import { Recipient } from '@/domain/order-control/enterprise/entities/recipient'
import { RecipientsRepository } from '@/domain/order-control/application/repositories/recipients-repository'
import { UsersRepository } from '@/domain/order-control/application/repositories/users-repository'

interface ListRecipientsUseCaseRequest {
  adminId: string
}

export class ListRecipientsUseCase {
  constructor(
    private recipientsRepository: RecipientsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    adminId,
  }: ListRecipientsUseCaseRequest): Promise<Recipient[]> {
    const admin = await this.usersRepository.findById(adminId)
    if (!admin || admin.role !== 'admin' || admin.status !== 'active') {
      throw new Error('Only active admins can list recipients')
    }

    return this.recipientsRepository.findAll()
  }
}
