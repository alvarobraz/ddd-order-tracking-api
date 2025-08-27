import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DeactivateDeliverymanUseCase } from './deactivate-deliveryman'
import { UsersRepository } from '@/domain/repositories/users-repository'
import { User } from '@/domain/entities/user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

describe('Deactivate Deliveryma Use Case', () => {
  let usersRepository: UsersRepository
  let sut: DeactivateDeliverymanUseCase

  beforeEach(() => {
    usersRepository = {
      findByCpf: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      patch: vi.fn(),
      findAllDeliverymen: vi.fn(),
    }
    sut = new DeactivateDeliverymanUseCase(usersRepository)
  })

  it('should deactivate a deliveryman if admin is valid and active', async () => {
    const admin = User.create({
      cpf: '12345678901',
      password: 'password123',
      role: 'admin',
      name: 'Admin',
      status: 'active',
    }, new UniqueEntityID('admin-1'))

    const deliveryman = User.create({
      cpf: '98765432100',
      password: 'password123',
      role: 'deliveryman',
      name: 'John Doe',
      status: 'active',
    }, new UniqueEntityID('deliveryman-1'))

    vi.spyOn(usersRepository, 'findById').mockImplementation(async (id) => {
      if (id === 'admin-1') return admin
      if (id === 'deliveryman-1') return deliveryman
      return null
    })
    vi.spyOn(usersRepository, 'patch').mockResolvedValue(deliveryman)

    const result = await sut.execute({
      adminId: 'admin-1',
      deliverymanId: 'deliveryman-1',
    })

    expect(result).toBeInstanceOf(User)
    expect(usersRepository.findById).toHaveBeenCalledWith('admin-1')
    expect(usersRepository.findById).toHaveBeenCalledWith('deliveryman-1')
    expect(usersRepository.patch).toHaveBeenCalledWith('deliveryman-1', 'inactive')
  })

  it('should throw an error if admin does not exist', async () => {
    vi.spyOn(usersRepository, 'findById').mockResolvedValue(null)

    await expect(
      sut.execute({
        adminId: 'admin-1',
        deliverymanId: 'deliveryman-1',
      })
    ).rejects.toThrow('Only active admins can deactivate deliverymen')
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
        deliverymanId: 'deliveryman-2',
      })
    ).rejects.toThrow('Only active admins can deactivate deliverymen')
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
        deliverymanId: 'deliveryman-1',
      })
    ).rejects.toThrow('Only active admins can deactivate deliverymen')
  })

  it('should throw an error if deliveryman does not exist', async () => {
    const admin = User.create({
      cpf: '12345678901',
      password: 'password123',
      role: 'admin',
      name: 'Admin',
      status: 'active',
    }, new UniqueEntityID('admin-1'))

    vi.spyOn(usersRepository, 'findById').mockImplementation(async (id) => {
      if (id === 'admin-1') return admin
      return null
    })

    await expect(
      sut.execute({
        adminId: 'admin-1',
        deliverymanId: 'deliveryman-1',
      })
    ).rejects.toThrow('Active deliveryman not found')
  })

  it('should throw an error if deliveryman is not a deliveryman', async () => {
    const admin = User.create({
      cpf: '12345678901',
      password: 'password123',
      role: 'admin',
      name: 'Admin',
      status: 'active',
    }, new UniqueEntityID('admin-1'))

    const notDeliveryman = User.create({
      cpf: '98765432100',
      password: 'password123',
      role: 'admin',
      name: 'Jane Doe',
      status: 'active',
    }, new UniqueEntityID('admin-2'))

    vi.spyOn(usersRepository, 'findById').mockImplementation(async (id) => {
      if (id === 'admin-1') return admin
      if (id === 'admin-2') return notDeliveryman
      return null
    })

    await expect(
      sut.execute({
        adminId: 'admin-1',
        deliverymanId: 'admin-2',
      })
    ).rejects.toThrow('Active deliveryman not found')
  })

  it('should throw an error if deliveryman is already inactive', async () => {
    const admin = User.create({
      cpf: '12345678901',
      password: 'password123',
      role: 'admin',
      name: 'Admin',
      status: 'active',
    }, new UniqueEntityID('admin-1'))

    const deliveryman = User.create({
      cpf: '98765432100',
      password: 'password123',
      role: 'deliveryman',
      name: 'John Doe',
      status: 'inactive',
    }, new UniqueEntityID('deliveryman-1'))

    vi.spyOn(usersRepository, 'findById').mockImplementation(async (id) => {
      if (id === 'admin-1') return admin
      if (id === 'deliveryman-1') return deliveryman
      return null
    })

    await expect(
      sut.execute({
        adminId: 'admin-1',
        deliverymanId: 'deliveryman-1',
      })
    ).rejects.toThrow('Active deliveryman not found')
  })
})