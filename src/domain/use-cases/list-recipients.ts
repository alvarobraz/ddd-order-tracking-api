import { Recipient } from '@/domain/entities/recipient'
import { RecipientsRepository } from '@/domain/repositories/recipients-repository'
import { UsersRepository } from '@/domain/repositories/users-repository'

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
