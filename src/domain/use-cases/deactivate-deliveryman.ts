import { UsersRepository } from '@/domain/repositories/users-repository'

interface DeactivateDeliverymanUseCaseRequest {
  adminId: string
  deliverymanId: string
}

export class DeactivateDeliverymanUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    adminId,
    deliverymanId,
  }: DeactivateDeliverymanUseCaseRequest) {
    const admin = await this.usersRepository.findById(adminId)
    if (!admin || admin.role !== 'admin' || admin.status !== 'active') {
      throw new Error('Only active admins can deactivate deliverymen')
    }

    const deliveryman = await this.usersRepository.findById(deliverymanId)
    if (
      !deliveryman ||
      deliveryman.role !== 'deliveryman' ||
      deliveryman.status !== 'active'
    ) {
      throw new Error('Active deliveryman not found')
    }

    await this.usersRepository.patch(deliverymanId, 'inactive')

    return deliveryman
  }
}
