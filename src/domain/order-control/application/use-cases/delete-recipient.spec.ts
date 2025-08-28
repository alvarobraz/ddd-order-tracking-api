import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DeleteRecipientUseCase } from './delete-recipient'
import { RecipientsRepository } from '@/domain/order-control/application/repositories/recipients-repository'
import { UsersRepository } from '@/domain/order-control/application/repositories/users-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeUser } from 'test/factories/make-users'
import { makeRecipient } from 'test/factories/make-recipient'

describe('Delete Recipient UseCase', () => {
  let recipientsRepository: RecipientsRepository
  let usersRepository: UsersRepository
  let sut: DeleteRecipientUseCase

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
    sut = new DeleteRecipientUseCase(recipientsRepository, usersRepository)
  })

  it('should delete a recipient if admin is valid and active', async () => {
    const admin = makeUser({}, new UniqueEntityID('admin-1'))

    const recipient = makeRecipient({}, new UniqueEntityID('recipient-1'))

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(admin)
    vi.spyOn(recipientsRepository, 'findById').mockResolvedValue(recipient)
    vi.spyOn(recipientsRepository, 'delete').mockResolvedValue()

    await sut.execute({
      adminId: 'admin-1',
      recipientId: 'recipient-1',
    })

    expect(usersRepository.findById).toHaveBeenCalledWith('admin-1')
    expect(recipientsRepository.findById).toHaveBeenCalledWith('recipient-1')
    expect(recipientsRepository.delete).toHaveBeenCalledWith('recipient-1')
  })

  it('should throw an error if admin does not exist', async () => {
    vi.spyOn(usersRepository, 'findById').mockResolvedValue(null)

    await expect(
      sut.execute({
        adminId: 'admin-1',
        recipientId: 'recipient-1',
      }),
    ).rejects.toThrow('Only active admins can delete recipients')
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
      }),
    ).rejects.toThrow('Only active admins can delete recipients')
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
      }),
    ).rejects.toThrow('Only active admins can delete recipients')
  })

  it('should throw an error if recipient does not exist', async () => {
    const admin = makeUser({}, new UniqueEntityID('admin-1'))

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(admin)
    vi.spyOn(recipientsRepository, 'findById').mockResolvedValue(null)

    await expect(
      sut.execute({
        adminId: 'admin-1',
        recipientId: 'recipient-1',
      }),
    ).rejects.toThrow('Recipient not found')
  })
})
