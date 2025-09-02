import { describe, it, expect, beforeEach } from 'vitest'
import { MarkOrderAsDeliveredUseCase } from './mark-order-as-delivered'
import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeUser } from 'test/factories/make-users'
import { makeOrder } from 'test/factories/make-order'
import { left } from '@/core/either'
import { OnlyActiveDeliverymenCanMarkOrdersAsDeliveredError } from './errors/only-active-deliverymen-can-mark-orders-as-delivered-error'
import { OrderNotFoundError } from './errors/order-not-found-error'
import { OnlyAssignedDeliverymanCanMarkOrderAsDeliveredError } from './errors/only-assigned-deliveryman-can-mark-order-as-delivered-error'
import { OrderMustBePickedUpToBeMarkedAsDeliveredError } from './errors/order-must-be-picked-up-to-be-marked-as-delivered-error'
import { DeliveryPhotoIsRequiredError } from './errors/delivery-photo-is-required-error'

let inMemoryOrdersRepository: InMemoryOrdersRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let sut: MarkOrderAsDeliveredUseCase

describe('Mark Order As Delivered', () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()
    sut = new MarkOrderAsDeliveredUseCase(
      inMemoryOrdersRepository,
      inMemoryUsersRepository,
    )
  })

  it('should mark order as delivered with attachments if deliveryman is valid and active', async () => {
    const deliveryman = makeUser(
      {
        role: 'deliveryman',
        status: 'active',
      },
      new UniqueEntityID('deliveryman-1'),
    )

    const order = makeOrder(
      {
        recipientId: new UniqueEntityID('recipient-1'),
        deliverymanId: new UniqueEntityID('deliveryman-1'),
        status: 'picked_up',
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Centro',
        city: 'Curitiba',
        state: 'PR',
        zipCode: '80010-000',
        deliveryPhoto: [],
      },
      new UniqueEntityID('order-1'),
    )

    await inMemoryUsersRepository.create(deliveryman)
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      deliverymanId: 'deliveryman-1',
      orderId: 'order-1',
      deliveryPhotoIds: ['photo-1', 'photo-2'],
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      order: expect.objectContaining({
        id: new UniqueEntityID('order-1'),
        deliverymanId: new UniqueEntityID('deliveryman-1'),
        status: 'delivered',
        deliveryPhoto: [
          expect.objectContaining({
            orderId: new UniqueEntityID('order-1'),
            attachmentId: new UniqueEntityID('photo-1'),
          }),
          expect.objectContaining({
            orderId: new UniqueEntityID('order-1'),
            attachmentId: new UniqueEntityID('photo-2'),
          }),
        ],
      }),
    })
    expect(await inMemoryOrdersRepository.findById('order-1')).toEqual(
      expect.objectContaining({
        id: new UniqueEntityID('order-1'),
        status: 'delivered',
        deliveryPhoto: [
          expect.objectContaining({
            orderId: new UniqueEntityID('order-1'),
            attachmentId: new UniqueEntityID('photo-1'),
          }),
          expect.objectContaining({
            orderId: new UniqueEntityID('order-1'),
            attachmentId: new UniqueEntityID('photo-2'),
          }),
        ],
        street: 'Rua das Flores',
        number: '123',
      }),
    )
  })

  it('should return error if deliveryman does not exist', async () => {
    const order = makeOrder(
      {
        recipientId: new UniqueEntityID('recipient-1'),
        deliverymanId: new UniqueEntityID('deliveryman-1'),
        status: 'picked_up',
      },
      new UniqueEntityID('order-1'),
    )

    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      deliverymanId: 'deliveryman-1',
      orderId: 'order-1',
      deliveryPhotoIds: ['photo-1'],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(
      OnlyActiveDeliverymenCanMarkOrdersAsDeliveredError,
    )
    expect(result).toEqual(
      left(new OnlyActiveDeliverymenCanMarkOrdersAsDeliveredError()),
    )
    expect(await inMemoryOrdersRepository.findById('order-1')).toEqual(
      expect.objectContaining({
        id: new UniqueEntityID('order-1'),
        status: 'picked_up',
        deliveryPhoto: [],
      }),
    )
  })

  it('should return error if user is not a deliveryman', async () => {
    const admin = makeUser(
      {
        role: 'admin',
        status: 'active',
      },
      new UniqueEntityID('admin-1'),
    )

    const order = makeOrder(
      {
        recipientId: new UniqueEntityID('recipient-1'),
        deliverymanId: new UniqueEntityID('deliveryman-1'),
        status: 'picked_up',
      },
      new UniqueEntityID('order-1'),
    )

    await inMemoryUsersRepository.create(admin)
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      deliverymanId: 'admin-1',
      orderId: 'order-1',
      deliveryPhotoIds: ['photo-1'],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(
      OnlyActiveDeliverymenCanMarkOrdersAsDeliveredError,
    )
    expect(result).toEqual(
      left(new OnlyActiveDeliverymenCanMarkOrdersAsDeliveredError()),
    )
    expect(await inMemoryOrdersRepository.findById('order-1')).toEqual(
      expect.objectContaining({
        id: new UniqueEntityID('order-1'),
        status: 'picked_up',
        deliveryPhoto: [],
      }),
    )
  })

  it('should return error if deliveryman is inactive', async () => {
    const deliveryman = makeUser(
      {
        role: 'deliveryman',
        status: 'inactive',
      },
      new UniqueEntityID('deliveryman-1'),
    )

    const order = makeOrder(
      {
        recipientId: new UniqueEntityID('recipient-1'),
        deliverymanId: new UniqueEntityID('deliveryman-1'),
        status: 'picked_up',
      },
      new UniqueEntityID('order-1'),
    )

    await inMemoryUsersRepository.create(deliveryman)
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      deliverymanId: 'deliveryman-1',
      orderId: 'order-1',
      deliveryPhotoIds: ['photo-1'],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(
      OnlyActiveDeliverymenCanMarkOrdersAsDeliveredError,
    )
    expect(result).toEqual(
      left(new OnlyActiveDeliverymenCanMarkOrdersAsDeliveredError()),
    )
    expect(await inMemoryOrdersRepository.findById('order-1')).toEqual(
      expect.objectContaining({
        id: new UniqueEntityID('order-1'),
        status: 'picked_up',
        deliveryPhoto: [],
      }),
    )
  })

  it('should return error if order does not exist', async () => {
    const deliveryman = makeUser(
      {
        role: 'deliveryman',
        status: 'active',
      },
      new UniqueEntityID('deliveryman-1'),
    )

    await inMemoryUsersRepository.create(deliveryman)

    const result = await sut.execute({
      deliverymanId: 'deliveryman-1',
      orderId: 'order-1',
      deliveryPhotoIds: ['photo-1'],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(OrderNotFoundError)
    expect(result).toEqual(left(new OrderNotFoundError()))
    expect(await inMemoryOrdersRepository.findById('order-1')).toBeNull()
  })

  it('should return error if deliveryman is not assigned to the order', async () => {
    const deliveryman = makeUser(
      {
        role: 'deliveryman',
        status: 'active',
      },
      new UniqueEntityID('deliveryman-1'),
    )

    const order = makeOrder(
      {
        recipientId: new UniqueEntityID('recipient-1'),
        deliverymanId: new UniqueEntityID('deliveryman-2'),
        status: 'picked_up',
      },
      new UniqueEntityID('order-1'),
    )

    await inMemoryUsersRepository.create(deliveryman)
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      deliverymanId: 'deliveryman-1',
      orderId: 'order-1',
      deliveryPhotoIds: ['photo-1'],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(
      OnlyAssignedDeliverymanCanMarkOrderAsDeliveredError,
    )
    expect(result).toEqual(
      left(new OnlyAssignedDeliverymanCanMarkOrderAsDeliveredError()),
    )
    expect(await inMemoryOrdersRepository.findById('order-1')).toEqual(
      expect.objectContaining({
        id: new UniqueEntityID('order-1'),
        status: 'picked_up',
        deliveryPhoto: [],
      }),
    )
  })

  it('should return error if order is not picked up', async () => {
    const deliveryman = makeUser(
      {
        role: 'deliveryman',
        status: 'active',
      },
      new UniqueEntityID('deliveryman-1'),
    )

    const order = makeOrder(
      {
        recipientId: new UniqueEntityID('recipient-1'),
        deliverymanId: new UniqueEntityID('deliveryman-1'),
        status: 'pending',
      },
      new UniqueEntityID('order-1'),
    )

    await inMemoryUsersRepository.create(deliveryman)
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      deliverymanId: 'deliveryman-1',
      orderId: 'order-1',
      deliveryPhotoIds: ['photo-1'],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(
      OrderMustBePickedUpToBeMarkedAsDeliveredError,
    )
    expect(result).toEqual(
      left(new OrderMustBePickedUpToBeMarkedAsDeliveredError()),
    )
    expect(await inMemoryOrdersRepository.findById('order-1')).toEqual(
      expect.objectContaining({
        id: new UniqueEntityID('order-1'),
        status: 'pending',
        deliveryPhoto: [],
      }),
    )
  })

  it('should return error if delivery photo IDs are not provided', async () => {
    const deliveryman = makeUser(
      {
        role: 'deliveryman',
        status: 'active',
      },
      new UniqueEntityID('deliveryman-1'),
    )

    const order = makeOrder(
      {
        recipientId: new UniqueEntityID('recipient-1'),
        deliverymanId: new UniqueEntityID('deliveryman-1'),
        status: 'picked_up',
      },
      new UniqueEntityID('order-1'),
    )

    await inMemoryUsersRepository.create(deliveryman)
    await inMemoryOrdersRepository.create(order)

    const result = await sut.execute({
      deliverymanId: 'deliveryman-1',
      orderId: 'order-1',
      deliveryPhotoIds: [],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(DeliveryPhotoIsRequiredError)
    expect(result).toEqual(left(new DeliveryPhotoIsRequiredError()))
    expect(await inMemoryOrdersRepository.findById('order-1')).toEqual(
      expect.objectContaining({
        id: new UniqueEntityID('order-1'),
        status: 'picked_up',
        deliveryPhoto: [],
      }),
    )
  })
})
