import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ListDeliverymenUseCase } from './list-deliverymen'
import { UsersRepository } from '@/domain/order-control/application/repositories/users-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeUser } from 'test/factories/make-users'

describe('List Deliverymen Use Case', () => {
  let usersRepository: UsersRepository
  let sut: ListDeliverymenUseCase

  beforeEach(() => {
    usersRepository = {
      findByCpf: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      patch: vi.fn(),
      findAllDeliverymen: vi.fn(),
    }
    sut = new ListDeliverymenUseCase(usersRepository)
  })

  it('should list active deliverymen if admin is valid and active', async () => {
    const admin = makeUser({}, new UniqueEntityID('admin-1'))

    const deliveryman1 = makeUser(
      { role: 'deliveryman', name: 'John Doe' },
      new UniqueEntityID('deliveryman-1'),
    )

    const deliveryman2 = makeUser(
      { role: 'deliveryman', name: 'Jane Doe' },
      new UniqueEntityID('deliveryman-2'),
    )

    const deliveryman3 = makeUser(
      { role: 'deliveryman', name: 'Bob Smith' },
      new UniqueEntityID('deliveryman-3'),
    )

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(admin)
    vi.spyOn(usersRepository, 'findAllDeliverymen').mockResolvedValue([
      deliveryman1,
      deliveryman2,
      deliveryman3,
    ])

    const result = await sut.execute({ adminId: 'admin-1' })

    expect(result).toEqual([deliveryman1, deliveryman2, deliveryman3])
    expect(usersRepository.findById).toHaveBeenCalledWith('admin-1')
    expect(usersRepository.findAllDeliverymen).toHaveBeenCalled()
  })

  it('should throw an error if admin does not exist', async () => {
    vi.spyOn(usersRepository, 'findById').mockResolvedValue(null)

    await expect(sut.execute({ adminId: 'admin-1' })).rejects.toThrow(
      'Only active admins can list deliverymen',
    )
  })

  it('should throw an error if admin is not an admin', async () => {
    const deliveryman = makeUser(
      { role: 'deliveryman' },
      new UniqueEntityID('deliveryman-1'),
    )

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(deliveryman)

    await expect(sut.execute({ adminId: 'deliveryman-1' })).rejects.toThrow(
      'Only active admins can list deliverymen',
    )
  })

  it('should throw an error if admin is inactive', async () => {
    const admin = makeUser(
      { status: 'inactive' },
      new UniqueEntityID('admin-1'),
    )

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(admin)

    await expect(sut.execute({ adminId: 'admin-1' })).rejects.toThrow(
      'Only active admins can list deliverymen',
    )
  })
})
