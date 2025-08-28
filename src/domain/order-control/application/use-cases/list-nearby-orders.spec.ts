import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ListNearbyOrdersUseCase } from './list-nearby-orders'
import { OrdersRepository } from '@/domain/order-control/application/repositories/orders-repository'
import { UsersRepository } from '@/domain/order-control/application/repositories/users-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeUser } from 'test/factories/make-users'
import { makeOrder } from 'test/factories/make-order'

describe('ListNearbyOrdersUseCase', () => {
  let ordersRepository: OrdersRepository
  let usersRepository: UsersRepository
  let sut: ListNearbyOrdersUseCase

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
    sut = new ListNearbyOrdersUseCase(ordersRepository, usersRepository)
  })

  it('should list nearby orders if deliveryman is valid and active', async () => {
    const deliveryman = makeUser(
      { role: 'deliveryman' },
      new UniqueEntityID('deliveryman-1'),
    )

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

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(deliveryman)
    vi.spyOn(ordersRepository, 'findNearby').mockResolvedValue([order1, order2])

    const result = await sut.execute({
      deliverymanId: 'deliveryman-1',
      neighborhood: 'Centro',
    })

    expect(result).toEqual([order1, order2])
    expect(result[0].street).toBe(order1.street)
    expect(result[0].city).toBe(order1.city)
    expect(result[0].state).toBe(order1.state)
    expect(result[0].zipCode).toBe(order1.zipCode)
    expect(result[1].street).toBe(order2.street)
    expect(result[1].city).toBe(order2.city)
    expect(result[1].state).toBe(order2.state)
    expect(result[1].zipCode).toBe(order2.zipCode)
    expect(usersRepository.findById).toHaveBeenCalledWith('deliveryman-1')
    expect(ordersRepository.findNearby).toHaveBeenCalledWith('Centro')
  })

  it('should throw an error if deliveryman does not exist', async () => {
    vi.spyOn(usersRepository, 'findById').mockResolvedValue(null)

    await expect(
      sut.execute({
        deliverymanId: 'deliveryman-1',
        neighborhood: 'Centro',
      }),
    ).rejects.toThrow('Only active deliverymen can list nearby orders')
  })

  it('should throw an error if user is not a deliveryman', async () => {
    const admin = makeUser({}, new UniqueEntityID('admin-1'))

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(admin)

    await expect(
      sut.execute({
        deliverymanId: 'admin-1',
        neighborhood: 'Centro',
      }),
    ).rejects.toThrow('Only active deliverymen can list nearby orders')
  })

  it('should throw an error if deliveryman is inactive', async () => {
    const deliveryman = makeUser(
      { role: 'deliveryman', status: 'inactive' },
      new UniqueEntityID('deliveryman-1'),
    )

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(deliveryman)

    await expect(
      sut.execute({
        deliverymanId: 'deliveryman-1',
        neighborhood: 'Centro',
      }),
    ).rejects.toThrow('Only active deliverymen can list nearby orders')
  })

  it('should return an empty array if no nearby orders are found', async () => {
    const deliveryman = makeUser(
      { role: 'deliveryman' },
      new UniqueEntityID('deliveryman-1'),
    )

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(deliveryman)
    vi.spyOn(ordersRepository, 'findNearby').mockResolvedValue([])

    const result = await sut.execute({
      deliverymanId: 'deliveryman-1',
      neighborhood: 'Centro',
    })

    expect(result).toEqual([])
    expect(usersRepository.findById).toHaveBeenCalledWith('deliveryman-1')
    expect(ordersRepository.findNearby).toHaveBeenCalledWith('Centro')
  })
})
