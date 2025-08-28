import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ListOrdersUseCase } from './list-orders'
import { OrdersRepository } from '@/domain/order-control/application/repositories/orders-repository'
import { UsersRepository } from '@/domain/order-control/application/repositories/users-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeUser } from 'test/factories/make-users'
import { makeOrder } from 'test/factories/make-order'

describe('List Orders Use Case', () => {
  let ordersRepository: OrdersRepository
  let usersRepository: UsersRepository
  let sut: ListOrdersUseCase

  beforeEach(() => {
    ordersRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
      findNearby: vi.fn(),
      findByDeliverymanId: vi.fn(),
    }
    usersRepository = {
      findByCpf: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      patch: vi.fn(),
      findAllDeliverymen: vi.fn(),
    }
    sut = new ListOrdersUseCase(ordersRepository, usersRepository)
  })

  it('should list orders if admin is valid and active', async () => {
    const admin = makeUser({}, new UniqueEntityID('admin-1'))

    const order1 = makeOrder(
      {
        recipientId: new UniqueEntityID('recipient-1'),
      },
      new UniqueEntityID('order-1'),
    )

    const order2 = makeOrder(
      {
        recipientId: new UniqueEntityID('recipient-2'),
      },
      new UniqueEntityID('order-2'),
    )

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(admin)
    vi.spyOn(ordersRepository, 'findAll').mockResolvedValue([order1, order2])

    const result = await sut.execute({ adminId: 'admin-1' })

    expect(result).toEqual([order1, order2])
    expect(usersRepository.findById).toHaveBeenCalledWith('admin-1')
    expect(ordersRepository.findAll).toHaveBeenCalled()
  })

  it('should throw an error if admin does not exist', async () => {
    vi.spyOn(usersRepository, 'findById').mockResolvedValue(null)

    await expect(sut.execute({ adminId: 'admin-1' })).rejects.toThrow(
      'Only active admins can list orders',
    )
  })

  it('should throw an error if admin is not an admin', async () => {
    const deliveryman = makeUser(
      { role: 'deliveryman' },
      new UniqueEntityID('deliveryman-1'),
    )

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(deliveryman)

    await expect(sut.execute({ adminId: 'deliveryman-1' })).rejects.toThrow(
      'Only active admins can list orders',
    )
  })

  it('should throw an error if admin is inactive', async () => {
    const admin = makeUser(
      { status: 'inactive' },
      new UniqueEntityID('admin-1'),
    )

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(admin)

    await expect(sut.execute({ adminId: 'admin-1' })).rejects.toThrow(
      'Only active admins can list orders',
    )
  })
})
