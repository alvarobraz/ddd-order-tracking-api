import { RecipientsRepository } from '@/domain/repositories/recipients-repository'
import { UsersRepository } from '@/domain/repositories/users-repository'

interface DeleteRecipientUseCaseRequest {
  adminId: string
  recipientId: string
}

export class DeleteRecipientUseCase {
  constructor(
    private recipientsRepository: RecipientsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ adminId, recipientId }: DeleteRecipientUseCaseRequest) {
    const admin = await this.usersRepository.findById(adminId)
    if (!admin || admin.role !== 'admin' || admin.status !== 'active') {
      throw new Error('Only active admins can delete recipients')
    }

    const recipient = await this.recipientsRepository.findById(recipientId)
    if (!recipient) {
      throw new Error('Recipient not found')
    }

    await this.recipientsRepository.delete(recipientId)
  }
}
