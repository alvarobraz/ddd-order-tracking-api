import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UpdateDeliverymanUseCase } from './update-deliveryman'
import { UsersRepository } from '@/domain/repositories/users-repository'
import { User } from '@/domain/entities/user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

describe('Update Deliveryman Use Case', () => {
  let usersRepository: UsersRepository
  let sut: UpdateDeliverymanUseCase

  beforeEach(() => {
    usersRepository = {
      findByCpf: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      patch: vi.fn(),
      findAllDeliverymen: vi.fn(),
    }
    sut = new UpdateDeliverymanUseCase(usersRepository)
  })

  it('should update a deliveryman if admin and deliveryman are valid and active', async () => {
    const admin = User.create(
      {
        cpf: '12345678901',
        password: 'password123',
        role: 'admin',
        name: 'Admin',
        status: 'active',
      },
      new UniqueEntityID('admin-1'),
    )

    const deliveryman = User.create(
      {
        cpf: '98765432100',
        password: 'password123',
        role: 'deliveryman',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        status: 'active',
      },
      new UniqueEntityID('deliveryman-1'),
    )

    vi.spyOn(usersRepository, 'findById').mockImplementation(async (id) => {
      if (id === 'admin-1') return admin
      if (id === 'deliveryman-1') return deliveryman
      return null
    })
    vi.spyOn(usersRepository, 'save').mockResolvedValue(deliveryman)

    const result = await sut.execute({
      adminId: 'admin-1',
      deliverymanId: 'deliveryman-1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '0987654321',
    })

    expect(result).toBeInstanceOf(User)
    expect(result.name).toBe('Jane Doe')
    expect(result.email).toBe('jane@example.com')
    expect(result.phone).toBe('0987654321')
    expect(usersRepository.findById).toHaveBeenCalledWith('admin-1')
    expect(usersRepository.findById).toHaveBeenCalledWith('deliveryman-1')
    expect(usersRepository.save).toHaveBeenCalledWith(deliveryman)
  })

  it('should throw an error if admin does not exist', async () => {
    vi.spyOn(usersRepository, 'findById').mockResolvedValue(null)

    await expect(
      sut.execute({
        adminId: 'admin-1',
        deliverymanId: 'deliveryman-1',
        name: 'Jane Doe',
      }),
    ).rejects.toThrow('Only active admins can update deliverymen')
  })

  it('should throw an error if admin is not an admin', async () => {
    const deliveryman = User.create(
      {
        cpf: '12345678901',
        password: 'password123',
        role: 'deliveryman',
        name: 'John Doe',
        status: 'active',
      },
      new UniqueEntityID('deliveryman-1'),
    )

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(deliveryman)

    await expect(
      sut.execute({
        adminId: 'deliveryman-1',
        deliverymanId: 'deliveryman-2',
        name: 'Jane Doe',
      }),
    ).rejects.toThrow('Only active admins can update deliverymen')
  })

  it('should throw an error if admin is inactive', async () => {
    const admin = User.create(
      {
        cpf: '12345678901',
        password: 'password123',
        role: 'admin',
        name: 'Admin',
        status: 'inactive',
      },
      new UniqueEntityID('admin-1'),
    )

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(admin)

    await expect(
      sut.execute({
        adminId: 'admin-1',
        deliverymanId: 'deliveryman-1',
        name: 'Jane Doe',
      }),
    ).rejects.toThrow('Only active admins can update deliverymen')
  })

  it('should throw an error if deliveryman does not exist', async () => {
    const admin = User.create(
      {
        cpf: '12345678901',
        password: 'password123',
        role: 'admin',
        name: 'Admin',
        status: 'active',
      },
      new UniqueEntityID('admin-1'),
    )

    vi.spyOn(usersRepository, 'findById').mockImplementation(async (id) => {
      if (id === 'admin-1') return admin
      return null
    })

    await expect(
      sut.execute({
        adminId: 'admin-1',
        deliverymanId: 'deliveryman-1',
        name: 'Jane Doe',
      }),
    ).rejects.toThrow('Active deliveryman not found')
  })

  it('should throw an error if deliveryman is not a deliveryman', async () => {
    const admin = User.create(
      {
        cpf: '12345678901',
        password: 'password123',
        role: 'admin',
        name: 'Admin',
        status: 'active',
      },
      new UniqueEntityID('admin-1'),
    )

    const notDeliveryman = User.create(
      {
        cpf: '98765432100',
        password: 'password123',
        role: 'admin',
        name: 'Jane Doe',
        status: 'active',
      },
      new UniqueEntityID('admin-2'),
    )

    vi.spyOn(usersRepository, 'findById').mockImplementation(async (id) => {
      if (id === 'admin-1') return admin
      if (id === 'admin-2') return notDeliveryman
      return null
    })

    await expect(
      sut.execute({
        adminId: 'admin-1',
        deliverymanId: 'admin-2',
        name: 'Jane Doe',
      }),
    ).rejects.toThrow('Active deliveryman not found')
  })

  it('should throw an error if deliveryman is inactive', async () => {
    const admin = User.create(
      {
        cpf: '12345678901',
        password: 'password123',
        role: 'admin',
        name: 'Admin',
        status: 'active',
      },
      new UniqueEntityID('admin-1'),
    )

    const deliveryman = User.create(
      {
        cpf: '98765432100',
        password: 'password123',
        role: 'deliveryman',
        name: 'John Doe',
        status: 'inactive',
      },
      new UniqueEntityID('deliveryman-1'),
    )

    vi.spyOn(usersRepository, 'findById').mockImplementation(async (id) => {
      if (id === 'admin-1') return admin
      if (id === 'deliveryman-1') return deliveryman
      return null
    })

    await expect(
      sut.execute({
        adminId: 'admin-1',
        deliverymanId: 'deliveryman-1',
        name: 'Jane Doe',
      }),
    ).rejects.toThrow('Active deliveryman not found')
  })
})
