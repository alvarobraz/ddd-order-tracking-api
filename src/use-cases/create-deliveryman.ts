import { User } from "@/domain/entities/user"
import { UsersRepository } from "@/domain/repositories/users-repository"

interface CreateDeliverymanUseCaseRequest {
  adminId: string
  name: string
  cpf: string
  password: string
  email: string
  phone: string
}

export class CreateDeliverymanUseCase {
  constructor(
    private usersRepository: UsersRepository
  ) {}

  async execute({ adminId, name, cpf, password, email, phone }: CreateDeliverymanUseCaseRequest) {
    const admin = await this.usersRepository.findById(adminId)
    if (!admin || admin.role !== 'admin' || admin.status !== 'active') {
      throw new Error('Only active admins can create deliverymen')
    }

    const user = User.create({
      name,
      cpf,
      password,
      role: 'deliveryman',
      email,
      phone,
      status: 'active'
    })

    await this.usersRepository.create(user)

    return user
  }
}