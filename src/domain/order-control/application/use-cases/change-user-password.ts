import { UsersRepository } from '@/domain/order-control/application/repositories/users-repository'

interface ChangeUserPasswordUseCaseRequest {
  adminId: string
  userId: string
  newPassword: string
}

export class ChangeUserPasswordUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    adminId,
    userId,
    newPassword,
  }: ChangeUserPasswordUseCaseRequest) {
    const admin = await this.usersRepository.findById(adminId)
    if (!admin || admin.role !== 'admin' || admin.status !== 'active') {
      throw new Error('Only active admins can change user passwords')
    }

    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    user.password = newPassword

    await this.usersRepository.save(user)

    return user
  }
}
