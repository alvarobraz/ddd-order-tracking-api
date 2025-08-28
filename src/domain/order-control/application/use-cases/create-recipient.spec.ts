import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CreateRecipientUseCase } from './create-recipient'
import { RecipientsRepository } from '@/domain/order-control/application/repositories/recipients-repository'
import { UsersRepository } from '@/domain/order-control/application/repositories/users-repository'
import { Recipient } from '@/domain/order-control/enterprise/entities/recipient'
import { User } from '@/domain/order-control/enterprise/entities/user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

describe('Create Recipient Use Case', () => {
  let recipientsRepository: RecipientsRepository
  let usersRepository: UsersRepository
  let sut: CreateRecipientUseCase

  beforeEach(() => {
    recipientsRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
    }
    usersRepository = {
      findByCpf: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      patch: vi.fn(),
      findAllDeliverymen: vi.fn(),
    }
    sut = new CreateRecipientUseCase(recipientsRepository, usersRepository)
  })

  it('should create a recipient if admin is valid and active', async () => {
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

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(admin)
    vi.spyOn(recipientsRepository, 'create').mockResolvedValue()

    const result = await sut.execute({
      adminId: 'admin-1',
      name: 'John Doe',
      street: 'Carolina Castelli',
      number: '123',
      neighborhood: 'Novo MUndo',
      city: 'Curitiba',
      state: 'Paraná',
      zipCode: '12345',
      phone: '1234567890',
      email: 'john@example.com',
    })

    expect(result).toBeInstanceOf(Recipient)
    expect(result.name).toBe('John Doe')
    expect(usersRepository.findById).toHaveBeenCalledWith('admin-1')
    expect(recipientsRepository.create).toHaveBeenCalledWith(
      expect.any(Recipient),
    )
  })

  it('should throw an error if admin does not exist', async () => {
    vi.spyOn(usersRepository, 'findById').mockResolvedValue(null)

    await expect(
      sut.execute({
        adminId: 'admin-1',
        name: 'John Doe',
        street: 'Oscar Kolbe',
        number: '123',
        neighborhood: 'Lindóia',
        city: 'Curitiba',
        state: 'Paraná',
        zipCode: '12345',
        phone: '1234567890',
        email: 'john@example.com',
      }),
    ).rejects.toThrow('Only active admins can create recipients')
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
        name: 'John Doe',
        street: 'Ciryloo Merlin',
        number: '123',
        neighborhood: 'Novo Mundo',
        city: 'Curitba',
        state: 'Paraná',
        zipCode: '12345',
        phone: '1234567890',
        email: 'john@example.com',
      }),
    ).rejects.toThrow('Only active admins can create recipients')
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
        name: 'John Doe',
        street: 'Reinaldo Gusso',
        number: '123',
        neighborhood: 'Capão Raso',
        city: 'Curitiba',
        state: 'Paraná',
        zipCode: '12345',
        phone: '1234567890',
        email: 'john@example.com',
      }),
    ).rejects.toThrow('Only active admins can create recipients')
  })
})
