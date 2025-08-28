import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ListRecipientsUseCase } from './list-recipients'
import { RecipientsRepository } from '@/domain/order-control/application/repositories/recipients-repository'
import { UsersRepository } from '@/domain/order-control/application/repositories/users-repository'
import { Recipient } from '@/domain/order-control/enterprise/entities/recipient'
import { User } from '@/domain/order-control/enterprise/entities/user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

describe('List Recipients Use Case', () => {
  let recipientsRepository: RecipientsRepository
  let usersRepository: UsersRepository
  let sut: ListRecipientsUseCase

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
    sut = new ListRecipientsUseCase(recipientsRepository, usersRepository)
  })

  it('should list recipients if admin is valid and active', async () => {
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

    const recipient1 = Recipient.create(
      {
        name: 'João Silva',
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01001-000',
        phone: '(11) 98765-4321',
        email: 'joao@example.com',
      },
      new UniqueEntityID('recipient-1'),
    )

    const recipient2 = Recipient.create(
      {
        name: 'Maria Oliveira',
        street: 'Avenida Brasil',
        number: '456',
        neighborhood: 'Jardins',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '20040-902',
        phone: '(21) 91234-5678',
        email: 'maria@example.com',
      },
      new UniqueEntityID('recipient-2'),
    )

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(admin)
    vi.spyOn(recipientsRepository, 'findAll').mockResolvedValue([
      recipient1,
      recipient2,
    ])

    const result = await sut.execute({ adminId: 'admin-1' })

    expect(result).toEqual([recipient1, recipient2])
    expect(result[0].street).toBe('Rua das Flores')
    expect(result[0].city).toBe('São Paulo')
    expect(result[0].state).toBe('SP')
    expect(result[0].zipCode).toBe('01001-000')
    expect(result[1].street).toBe('Avenida Brasil')
    expect(result[1].city).toBe('Rio de Janeiro')
    expect(result[1].state).toBe('RJ')
    expect(result[1].zipCode).toBe('20040-902')
    expect(usersRepository.findById).toHaveBeenCalledWith('admin-1')
    expect(recipientsRepository.findAll).toHaveBeenCalled()
  })

  it('should throw an error if admin does not exist', async () => {
    vi.spyOn(usersRepository, 'findById').mockResolvedValue(null)

    await expect(sut.execute({ adminId: 'admin-1' })).rejects.toThrow(
      'Only active admins can list recipients',
    )
  })

  it('should throw an error if admin is not an admin', async () => {
    const deliveryman = User.create(
      {
        cpf: '12345678901',
        password: 'password123',
        role: 'deliveryman',
        name: 'João Silva',
        status: 'active',
      },
      new UniqueEntityID('deliveryman-1'),
    )

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(deliveryman)

    await expect(sut.execute({ adminId: 'deliveryman-1' })).rejects.toThrow(
      'Only active admins can list recipients',
    )
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

    await expect(sut.execute({ adminId: 'admin-1' })).rejects.toThrow(
      'Only active admins can list recipients',
    )
  })
})
