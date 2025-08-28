import { describe, it, expect, beforeEach } from 'vitest'
import { LoginUserUseCase } from './login-user'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeUser } from 'test/factories/make-users'

let inMemoryUsersRepository: InMemoryUsersRepository
let sut: LoginUserUseCase

describe('Login User Use Case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    sut = new LoginUserUseCase(inMemoryUsersRepository)
  })

  it('should login a user with valid credentials', async () => {
    const user = makeUser({}, new UniqueEntityID('user-1'))

    await inMemoryUsersRepository.create(user)

    const result = await sut.execute({
      cpf: user.cpf,
      password: 'password123',
    })

    expect(result).toEqual({
      userId: 'user-1',
      role: 'admin',
    })
    expect(inMemoryUsersRepository.items).toHaveLength(1)
    expect(inMemoryUsersRepository.items[0].cpf).toBe(user.cpf)
  })

  it('should throw an error if credentials are invalid', async () => {
    // No user created in the repository, simulating invalid credentials
    await expect(
      sut.execute({
        cpf: '12345678901',
        password: 'wrong-password',
      }),
    ).rejects.toThrow('Invalid credentials')
  })

  it('should throw an error if user is inactive', async () => {
    const user = makeUser({ status: 'inactive' }, new UniqueEntityID('user-1'))

    await inMemoryUsersRepository.create(user)

    await expect(
      sut.execute({
        cpf: user.cpf,
        password: 'password123',
      }),
    ).rejects.toThrow('User account is inactive')
  })
})
