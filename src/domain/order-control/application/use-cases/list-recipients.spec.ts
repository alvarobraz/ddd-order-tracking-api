import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ListRecipientsUseCase } from './list-recipients'
import { RecipientsRepository } from '@/domain/order-control/application/repositories/recipients-repository'
import { UsersRepository } from '@/domain/order-control/application/repositories/users-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeUser } from 'test/factories/make-users'
import { makeRecipient } from 'test/factories/make-recipient'

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
    const admin = makeUser({}, new UniqueEntityID('admin-1'))

    const recipient1 = makeRecipient({}, new UniqueEntityID('recipient-1'))

    const recipient2 = makeRecipient({}, new UniqueEntityID('recipient-2'))

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(admin)
    vi.spyOn(recipientsRepository, 'findAll').mockResolvedValue([
      recipient1,
      recipient2,
    ])

    const result = await sut.execute({ adminId: 'admin-1' })

    expect(result).toEqual([recipient1, recipient2])
    expect(result[0].street).toBe(recipient1.street)
    expect(result[0].city).toBe(recipient1.city)
    expect(result[0].state).toBe(recipient1.state)
    expect(result[0].zipCode).toBe(recipient1.zipCode)
    expect(result[1].street).toBe(recipient2.street)
    expect(result[1].city).toBe(recipient2.city)
    expect(result[1].state).toBe(recipient2.state)
    expect(result[1].zipCode).toBe(recipient2.zipCode)
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
    const deliveryman = makeUser(
      { role: 'deliveryman' },
      new UniqueEntityID('deliveryman-1'),
    )

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(deliveryman)

    await expect(sut.execute({ adminId: 'deliveryman-1' })).rejects.toThrow(
      'Only active admins can list recipients',
    )
  })

  it('should throw an error if admin is inactive', async () => {
    const admin = makeUser(
      { status: 'inactive' },
      new UniqueEntityID('admin-1'),
    )
    vi.spyOn(usersRepository, 'findById').mockResolvedValue(admin)

    await expect(sut.execute({ adminId: 'admin-1' })).rejects.toThrow(
      'Only active admins can list recipients',
    )
  })
})
