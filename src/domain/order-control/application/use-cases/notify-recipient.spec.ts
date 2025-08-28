import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NotifyRecipientUseCase } from './notify-recipient'
import { OrdersRepository } from '@/domain/order-control/application/repositories/orders-repository'
import { NotificationsRepository } from '@/domain/order-control/application/repositories/notifications-repository'
import { Notification } from '@/domain/order-control/enterprise/entities/notification'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeOrder } from 'test/factories/make-order'

describe('NotifyRecipientUseCase', () => {
  let ordersRepository: OrdersRepository
  let notificationsRepository: NotificationsRepository
  let sut: NotifyRecipientUseCase

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
    notificationsRepository = {
      create: vi.fn().mockResolvedValue(undefined), // Mock returns void
    }
    sut = new NotifyRecipientUseCase(ordersRepository, notificationsRepository)
  })

  it('should create a notification for recipient when order status is pending', async () => {
    const order = makeOrder(
      {
        recipientId: new UniqueEntityID('recipient-1'),
      },
      new UniqueEntityID('order-1'),
    )

    vi.spyOn(ordersRepository, 'findById').mockResolvedValue(order)
    vi.spyOn(notificationsRepository, 'create')

    const result = await sut.execute({
      orderId: 'order-1',
      status: 'pending',
    })

    expect(result).toBeInstanceOf(Notification)
    expect(result.orderId.toString()).toBe('order-1')
    expect(result.message).toBe('Order status updated to pending')
    expect(result.type).toBe('email')
    expect(ordersRepository.findById).toHaveBeenCalledWith('order-1')
    expect(notificationsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: new UniqueEntityID('order-1'),
        message: 'Order status updated to pending',
        type: 'email',
      }),
    )
  })

  it('should create a notification for recipient when order status is picked_up', async () => {
    const order = makeOrder(
      {
        recipientId: new UniqueEntityID('recipient-1'),
      },
      new UniqueEntityID('order-1'),
    )

    vi.spyOn(ordersRepository, 'findById').mockResolvedValue(order)
    vi.spyOn(notificationsRepository, 'create')

    const result = await sut.execute({
      orderId: 'order-1',
      status: 'picked_up',
    })

    expect(result).toBeInstanceOf(Notification)
    expect(result.orderId.toString()).toBe('order-1')
    expect(result.message).toBe('Order status updated to picked_up')
    expect(result.type).toBe('email')
    expect(ordersRepository.findById).toHaveBeenCalledWith('order-1')
    expect(notificationsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: new UniqueEntityID('order-1'),
        message: 'Order status updated to picked_up',
        type: 'email',
      }),
    )
  })

  it('should create a notification for recipient when order status is delivered', async () => {
    const order = makeOrder(
      {
        recipientId: new UniqueEntityID('recipient-1'),
      },
      new UniqueEntityID('order-1'),
    )
    vi.spyOn(ordersRepository, 'findById').mockResolvedValue(order)
    vi.spyOn(notificationsRepository, 'create')

    const result = await sut.execute({
      orderId: 'order-1',
      status: 'delivered',
    })

    expect(result).toBeInstanceOf(Notification)
    expect(result.orderId.toString()).toBe('order-1')
    expect(result.message).toBe('Order status updated to delivered')
    expect(result.type).toBe('email')
    expect(ordersRepository.findById).toHaveBeenCalledWith('order-1')
    expect(notificationsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: new UniqueEntityID('order-1'),
        message: 'Order status updated to delivered',
        type: 'email',
      }),
    )
  })

  it('should create a notification for recipient when order status is returned', async () => {
    const order = makeOrder(
      {
        recipientId: new UniqueEntityID('recipient-1'),
      },
      new UniqueEntityID('order-1'),
    )

    vi.spyOn(ordersRepository, 'findById').mockResolvedValue(order)
    vi.spyOn(notificationsRepository, 'create')

    const result = await sut.execute({
      orderId: 'order-1',
      status: 'returned',
    })

    expect(result).toBeInstanceOf(Notification)
    expect(result.orderId.toString()).toBe('order-1')
    expect(result.message).toBe('Order status updated to returned')
    expect(result.type).toBe('email')
    expect(ordersRepository.findById).toHaveBeenCalledWith('order-1')
    expect(notificationsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: new UniqueEntityID('order-1'),
        message: 'Order status updated to returned',
        type: 'email',
      }),
    )
  })

  it('should throw an error if order does not exist', async () => {
    vi.spyOn(ordersRepository, 'findById').mockResolvedValue(null)

    await expect(
      sut.execute({
        orderId: 'order-1',
        status: 'pending',
      }),
    ).rejects.toThrow('Order not found')
  })
})
