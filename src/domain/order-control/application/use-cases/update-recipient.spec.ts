import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UpdateRecipientUseCase } from './update-recipient'
import { RecipientsRepository } from '@/domain/order-control/application/repositories/recipients-repository'
import { UsersRepository } from '@/domain/order-control/application/repositories/users-repository'
import { Recipient } from '@/domain/order-control/enterprise/entities/recipient'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeUser } from 'test/factories/make-users'
import { makeRecipient } from 'test/factories/make-recipient'

describe('Update Recipient Use Case', () => {
  let recipientsRepository: RecipientsRepository
  let usersRepository: UsersRepository
  let sut: UpdateRecipientUseCase

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
    sut = new UpdateRecipientUseCase(recipientsRepository, usersRepository)
  })

  it('should update a recipient if admin is valid and active', async () => {
    const admin = makeUser({}, new UniqueEntityID('admin-1'))

    const recipient = makeRecipient({}, new UniqueEntityID('recipient-1'))

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(admin)
    vi.spyOn(recipientsRepository, 'findById').mockResolvedValue(recipient)
    vi.spyOn(recipientsRepository, 'save').mockResolvedValue(recipient)

    const result = await sut.execute({
      adminId: 'admin-1',
      recipientId: 'recipient-1',
      name: 'Jane Doe',
      email: 'jane@example.com',
    })

    expect(result).toBeInstanceOf(Recipient)
    expect(result.name).toBe('Jane Doe')
    expect(result.email).toBe('jane@example.com')
    expect(usersRepository.findById).toHaveBeenCalledWith('admin-1')
    expect(recipientsRepository.findById).toHaveBeenCalledWith('recipient-1')
    expect(recipientsRepository.save).toHaveBeenCalledWith(recipient)
  })

  it('should throw an error if admin does not exist', async () => {
    vi.spyOn(usersRepository, 'findById').mockResolvedValue(null)

    await expect(
      sut.execute({
        adminId: 'admin-1',
        recipientId: 'recipient-1',
        name: 'Jane Doe',
      }),
    ).rejects.toThrow('Only active admins can update recipients')
  })

  it('should throw an error if admin is not an admin', async () => {
    const deliveryman = makeUser(
      { role: 'deliveryman' },
      new UniqueEntityID('deliveryman-1'),
    )

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(deliveryman)

    await expect(
      sut.execute({
        adminId: 'deliveryman-1',
        recipientId: 'recipient-1',
        name: 'Jane Doe',
      }),
    ).rejects.toThrow('Only active admins can update recipients')
  })

  it('should throw an error if admin is inactive', async () => {
    const admin = makeUser(
      { status: 'inactive' },
      new UniqueEntityID('admin-1'),
    )

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(admin)

    await expect(
      sut.execute({
        adminId: 'admin-1',
        recipientId: 'recipient-1',
        name: 'Jane Doe',
      }),
    ).rejects.toThrow('Only active admins can update recipients')
  })

  it('should throw an error if recipient does not exist', async () => {
    const admin = makeUser({}, new UniqueEntityID('admin-1'))

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(admin)
    vi.spyOn(recipientsRepository, 'findById').mockResolvedValue(null)

    await expect(
      sut.execute({
        adminId: 'admin-1',
        recipientId: 'recipient-1',
        name: 'Jane Doe',
      }),
    ).rejects.toThrow('Recipient not found')
  })
})
