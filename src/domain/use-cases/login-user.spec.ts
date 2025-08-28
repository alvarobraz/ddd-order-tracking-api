import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LoginUserUseCase } from './login-user'
import { UsersRepository } from '@/domain/repositories/users-repository'
import { User } from '@/domain/entities/user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

describe('Login User Use Case', () => {
  let usersRepository: UsersRepository
  let sut: LoginUserUseCase

  beforeEach(() => {
    usersRepository = {
      findByCpf: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      patch: vi.fn(),
      findAllDeliverymen: vi.fn(),
    }
    sut = new LoginUserUseCase(usersRepository)
  })

  it('should login a user with valid credentials', async () => {
    const user = User.create(
      {
        cpf: '12345678901',
        password: 'password123',
        role: 'admin',
        name: 'John Doe',
        status: 'active',
      },
      new UniqueEntityID('user-1'),
    )

    vi.spyOn(usersRepository, 'findByCpf').mockResolvedValue(user)

    const result = await sut.execute({
      cpf: '12345678901',
      password: 'password123',
    })

    expect(result).toEqual({
      userId: 'user-1',
      role: 'admin',
    })
    expect(usersRepository.findByCpf).toHaveBeenCalledWith('12345678901')
  })

  it('should throw an error if credentials are invalid', async () => {
    vi.spyOn(usersRepository, 'findByCpf').mockResolvedValue(null)

    await expect(
      sut.execute({
        cpf: '12345678901',
        password: 'wrong-password',
      }),
    ).rejects.toThrow('Invalid credentials')
  })

  it('should throw an error if user is inactive', async () => {
    const user = User.create(
      {
        cpf: '12345678901',
        password: 'password123',
        role: 'admin',
        name: 'John Doe',
        status: 'inactive',
      },
      new UniqueEntityID('user-1'),
    )

    vi.spyOn(usersRepository, 'findByCpf').mockResolvedValue(user)

    await expect(
      sut.execute({
        cpf: '12345678901',
        password: 'password123',
      }),
    ).rejects.toThrow('User account is inactive')
  })
})
