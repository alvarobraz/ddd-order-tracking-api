import { UsersRepository } from '@/domain/order-control/application/repositories/users-repository'

interface LoginUserUseCaseRequest {
  cpf: string
  password: string
}

interface LoginUserUseCaseResponse {
  userId: string
  role: 'admin' | 'deliveryman'
}

export class LoginUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    cpf,
    password,
  }: LoginUserUseCaseRequest): Promise<LoginUserUseCaseResponse> {
    const user = await this.usersRepository.findByCpf(cpf)

    if (!user || user.password !== password) {
      throw new Error('Invalid credentials')
    }

    if (user.status !== 'active') {
      throw new Error('User account is inactive')
    }

    return {
      userId: user.id.toString(),
      role: user.role,
    }
  }
}
