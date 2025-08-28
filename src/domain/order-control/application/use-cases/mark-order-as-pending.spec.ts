import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MarkOrderAsPendingUseCase } from './mark-order-as-pending'
import { OrdersRepository } from '@/domain/order-control/application/repositories/orders-repository'
import { UsersRepository } from '@/domain/order-control/application/repositories/users-repository'
import { Order } from '@/domain/order-control/enterprise/entities/order'
import { User } from '@/domain/order-control/enterprise/entities/user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

describe('MarkOrderAsPendingUseCase', () => {
  let ordersRepository: OrdersRepository
  let usersRepository: UsersRepository
  let sut: MarkOrderAsPendingUseCase

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
    sut = new MarkOrderAsPendingUseCase(ordersRepository, usersRepository)
  })

  it('should mark an order as pending if admin is valid and active', async () => {
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

    const order = Order.create(
      {
        recipientId: new UniqueEntityID('recipient-1'),
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01001-000',
        status: 'picked_up',
      },
      new UniqueEntityID('order-1'),
    )

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(admin)
    vi.spyOn(ordersRepository, 'findById').mockResolvedValue(order)
    vi.spyOn(ordersRepository, 'save').mockResolvedValue(order)

    const result = await sut.execute({
      adminId: 'admin-1',
      orderId: 'order-1',
    })

    expect(result).toBeInstanceOf(Order)
    expect(result.status).toBe('pending')
    expect(result.street).toBe('Rua das Flores')
    expect(result.city).toBe('São Paulo')
    expect(result.state).toBe('SP')
    expect(result.zipCode).toBe('01001-000')
    expect(usersRepository.findById).toHaveBeenCalledWith('admin-1')
    expect(ordersRepository.findById).toHaveBeenCalledWith('order-1')
    expect(ordersRepository.save).toHaveBeenCalledWith(order)
  })

  it('should throw an error if admin does not exist', async () => {
    vi.spyOn(usersRepository, 'findById').mockResolvedValue(null)

    await expect(
      sut.execute({
        adminId: 'admin-1',
        orderId: 'order-1',
      }),
    ).rejects.toThrow('Only active admins can mark orders as pending')
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

    await expect(
      sut.execute({
        adminId: 'deliveryman-1',
        orderId: 'order-1',
      }),
    ).rejects.toThrow('Only active admins can mark orders as pending')
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

    await expect(
      sut.execute({
        adminId: 'admin-1',
        orderId: 'order-1',
      }),
    ).rejects.toThrow('Only active admins can mark orders as pending')
  })

  it('should throw an error if order does not exist', async () => {
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

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(admin)
    vi.spyOn(ordersRepository, 'findById').mockResolvedValue(null)

    await expect(
      sut.execute({
        adminId: 'admin-1',
        orderId: 'order-1',
      }),
    ).rejects.toThrow('Order not found')
  })
})
