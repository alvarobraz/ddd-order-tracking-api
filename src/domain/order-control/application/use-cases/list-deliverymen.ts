import { User } from '@/domain/order-control/enterprise/entities/user'
import { UsersRepository } from '@/domain/order-control/application/repositories/users-repository'

interface ListDeliverymenUseCaseRequest {
  adminId: string
}

export class ListDeliverymenUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ adminId }: ListDeliverymenUseCaseRequest): Promise<User[]> {
    const admin = await this.usersRepository.findById(adminId)
    if (!admin || admin.role !== 'admin' || admin.status !== 'active') {
      throw new Error('Only active admins can list deliverymen')
    }

    const deliverymen = await this.usersRepository.findAllDeliverymen()
    return deliverymen.filter((user) => user.status === 'active')
  }
}
