import { UsersRepository } from '@/domain/repositories/users-repository'

interface UpdateDeliverymanUseCaseRequest {
  adminId: string
  deliverymanId: string
  name?: string
  email?: string
  phone?: string
}

export class UpdateDeliverymanUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    adminId,
    deliverymanId,
    name,
    email,
    phone,
  }: UpdateDeliverymanUseCaseRequest) {
    const admin = await this.usersRepository.findById(adminId)
    if (!admin || admin.role !== 'admin' || admin.status !== 'active') {
      throw new Error('Only active admins can update deliverymen')
    }

    const deliveryman = await this.usersRepository.findById(deliverymanId)
    if (
      !deliveryman ||
      deliveryman.role !== 'deliveryman' ||
      deliveryman.status !== 'active'
    ) {
      throw new Error('Active deliveryman not found')
    }

    if (name !== undefined) {
      deliveryman.name = name
    }
    if (email !== undefined) {
      deliveryman.email = email
    }
    if (phone !== undefined) {
      deliveryman.phone = phone
    }

    await this.usersRepository.save(deliveryman)

    return deliveryman
  }
}
