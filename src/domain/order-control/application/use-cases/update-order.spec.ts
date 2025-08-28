import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UpdateOrderUseCase } from './update-order'
import { OrdersRepository } from '@/domain/order-control/application/repositories/orders-repository'
import { UsersRepository } from '@/domain/order-control/application/repositories/users-repository'
import { Order } from '@/domain/order-control/enterprise/entities/order'
import { User } from '@/domain/order-control/enterprise/entities/user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

describe('Update Order Use Case', () => {
  let ordersRepository: OrdersRepository
  let usersRepository: UsersRepository
  let sut: UpdateOrderUseCase

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
    sut = new UpdateOrderUseCase(ordersRepository, usersRepository)
  })

  it('should update an order if admin is valid and active', async () => {
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
        street: 'Carolina Castelli',
        number: '123',
        neighborhood: 'Novo Mundo',
        city: 'Curitiba',
        state: 'Paraná',
        zipCode: '12345',
        status: 'pending',
      },
      new UniqueEntityID('order-1'),
    )

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(admin)
    vi.spyOn(ordersRepository, 'findById').mockResolvedValue(order)
    vi.spyOn(ordersRepository, 'save').mockResolvedValue(order)

    const result = await sut.execute({
      adminId: 'admin-1',
      orderId: 'order-1',
      street: 'Ciryllo Merlin',
      number: '456',
    })

    expect(result).toBeInstanceOf(Order)
    expect(result.street).toBe('Ciryllo Merlin')
    expect(result.number).toBe('456')
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
        street: 'Oskar Kolbe',
      }),
    ).rejects.toThrow('Only active admins can update orders')
  })

  it('should throw an error if admin is not an admin', async () => {
    const deliveryman = User.create(
      {
        cpf: '12345678901',
        password: 'password123',
        role: 'deliveryman',
        name: 'John Doe',
        status: 'active',
      },
      new UniqueEntityID('deliveryman-1'),
    )

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(deliveryman)

    await expect(
      sut.execute({
        adminId: 'deliveryman-1',
        orderId: 'order-1',
        street: 'New St',
      }),
    ).rejects.toThrow('Only active admins can update orders')
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
        street: 'Oscar Kolbe',
      }),
    ).rejects.toThrow('Only active admins can update orders')
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
        street: 'Ciryllo Merlin',
      }),
    ).rejects.toThrow('Order not found')
  })
})
