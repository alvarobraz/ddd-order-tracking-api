import { describe, it, expect, beforeEach } from 'vitest'
import { CreateOrderUseCase } from './create-order'
import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeOrder } from 'test/factories/make-order'
import { makeUser } from 'test/factories/make-users'
import { Order } from '@/domain/order-control/enterprise/entities/order'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let sut: CreateOrderUseCase

describe('Create Order Use Case', () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()
    sut = new CreateOrderUseCase(
      inMemoryOrdersRepository,
      inMemoryUsersRepository,
    )
  })

  it('should create an order if admin is valid and active', async () => {
    const admin = makeUser({}, new UniqueEntityID('admin-1'))

    await inMemoryUsersRepository.create(admin)

    const orderProps = makeOrder({
      recipientId: new UniqueEntityID('recipient-1'),
    })

    const result = await sut.execute({
      adminId: 'admin-1',
      recipientId: 'recipient-1',
      street: orderProps.street,
      number: orderProps.number,
      neighborhood: orderProps.neighborhood,
      city: orderProps.city,
      state: orderProps.state,
      zipCode: orderProps.zipCode,
    })

    expect(result).toBeInstanceOf(Order)
    expect(result.status).toBe('pending')
    expect(result.street).toBe(orderProps.street)
    expect(result.number).toBe(orderProps.number)
    expect(result.neighborhood).toBe(orderProps.neighborhood)
    expect(result.city).toBe(orderProps.city)
    expect(result.state).toBe(orderProps.state)
    expect(result.zipCode).toBe(orderProps.zipCode)
    expect(result.recipientId).toBeDefined()
    expect(result.recipientId?.toString()).toBe('recipient-1')
    expect(inMemoryOrdersRepository.items).toHaveLength(1)
    expect(inMemoryOrdersRepository.items[0].id).toEqual(result.id)
    expect(inMemoryOrdersRepository.items[0].recipientId?.toString()).toBe(
      'recipient-1',
    )
  })

  it('should throw an error if admin does not exist', async () => {
    const orderProps = makeOrder({
      recipientId: new UniqueEntityID('recipient-1'),
    })

    await expect(
      sut.execute({
        adminId: 'admin-1',
        recipientId: 'recipient-1',
        street: orderProps.street,
        number: orderProps.number,
        neighborhood: orderProps.neighborhood,
        city: orderProps.city,
        state: orderProps.state,
        zipCode: orderProps.zipCode,
      }),
    ).rejects.toThrow('Only active admins can create orders')
  })

  it('should throw an error if admin is not an admin', async () => {
    const deliveryman = makeUser(
      { role: 'deliveryman' },
      new UniqueEntityID('deliveryman-1'),
    )

    await inMemoryUsersRepository.create(deliveryman)

    const orderProps = makeOrder({
      recipientId: new UniqueEntityID('recipient-1'),
    })

    await expect(
      sut.execute({
        adminId: 'deliveryman-1',
        recipientId: 'recipient-1',
        street: orderProps.street,
        number: orderProps.number,
        neighborhood: orderProps.neighborhood,
        city: orderProps.city,
        state: orderProps.state,
        zipCode: orderProps.zipCode,
      }),
    ).rejects.toThrow('Only active admins can create orders')
  })

  it('should throw an error if admin is inactive', async () => {
    const admin = makeUser(
      {
        status: 'inactive',
      },
      new UniqueEntityID('admin-1'),
    )

    await inMemoryUsersRepository.create(admin)

    const orderProps = makeOrder({
      recipientId: new UniqueEntityID('recipient-1'),
    })

    await expect(
      sut.execute({
        adminId: 'admin-1',
        recipientId: 'recipient-1',
        street: orderProps.street,
        number: orderProps.number,
        neighborhood: orderProps.neighborhood,
        city: orderProps.city,
        state: orderProps.state,
        zipCode: orderProps.zipCode,
      }),
    ).rejects.toThrow('Only active admins can create orders')
  })
})
