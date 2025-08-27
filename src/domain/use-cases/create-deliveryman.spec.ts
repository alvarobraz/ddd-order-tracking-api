import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CreateDeliverymanUseCase } from './create-deliveryman'
import { UsersRepository } from '@/domain/repositories/users-repository'
import { User } from '@/domain/entities/user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

describe('Create Delivery man Use Case', () => {
  let usersRepository: UsersRepository
  let sut: CreateDeliverymanUseCase

  beforeEach(() => {
    usersRepository = {
      findByCpf: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      patch: vi.fn(),
      findAllDeliverymen: vi.fn(),
    }
    sut = new CreateDeliverymanUseCase(usersRepository)
  })

  it('should create a deliveryman if admin is valid and active', async () => {
    const admin = User.create({
      cpf: '12345678901',
      password: 'password123',
      role: 'admin',
      name: 'Admin',
      status: 'active',
    }, new UniqueEntityID('admin-1'))

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(admin)
    vi.spyOn(usersRepository, 'create').mockResolvedValue()

    const result = await sut.execute({
      adminId: 'admin-1',
      name: 'John Doe',
      cpf: '98765432100',
      password: 'password123',
      email: 'john@example.com',
      phone: '1234567890',
    })

    expect(result).toBeInstanceOf(User)
    expect(result.role).toBe('deliveryman')
    expect(result.status).toBe('active')
    expect(usersRepository.findById).toHaveBeenCalledWith('admin-1')
    expect(usersRepository.create).toHaveBeenCalledWith(expect.any(User))
  })

  it('should throw an error if admin does not exist', async () => {
    vi.spyOn(usersRepository, 'findById').mockResolvedValue(null)

    await expect(
      sut.execute({
        adminId: 'admin-1',
        name: 'John Doe',
        cpf: '98765432100',
        password: 'password123',
        email: 'john@example.com',
        phone: '1234567890',
      })
    ).rejects.toThrow('Only active admins can create deliverymen')
  })

  it('should throw an error if admin is not an admin', async () => {
    const deliveryman = User.create({
      cpf: '12345678901',
      password: 'password123',
      role: 'deliveryman',
      name: 'John Doe',
      status: 'active',
    }, new UniqueEntityID('deliveryman-1'))

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(deliveryman)

    await expect(
      sut.execute({
        adminId: 'deliveryman-1',
        name: 'John Doe',
        cpf: '98765432100',
        password: 'password123',
        email: 'john@example.com',
        phone: '1234567890',
      })
    ).rejects.toThrow('Only active admins can create deliverymen')
  })

  it('should throw an error if admin is inactive', async () => {
    const admin = User.create({
      cpf: '12345678901',
      password: 'password123',
      role: 'admin',
      name: 'Admin',
      status: 'inactive',
    }, new UniqueEntityID('admin-1'))

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(admin)

    await expect(
      sut.execute({
        adminId: 'admin-1',
        name: 'John Doe',
        cpf: '98765432100',
        password: 'password123',
        email: 'john@example.com',
        phone: '1234567890',
      })
    ).rejects.toThrow('Only active admins can create deliverymen')
  })
})