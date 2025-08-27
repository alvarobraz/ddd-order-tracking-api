import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ListNearbyOrdersUseCase } from './list-nearby-orders'
import { OrdersRepository } from '@/domain/repositories/orders-repository'
import { UsersRepository } from '@/domain/repositories/users-repository'
import { Order } from '@/domain/entities/order'
import { User } from '@/domain/entities/user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

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
    const deliveryman = User.create({
      cpf: '12345678901',
      password: 'password123',
      role: 'deliveryman',
      name: 'João Silva',
      status: 'active',
    }, new UniqueEntityID('deliveryman-1'))

    const order1 = Order.create({
      recipientId: new UniqueEntityID('recipient-1'),
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01001-000',
      status: 'pending',
    }, new UniqueEntityID('order-1'))

    const order2 = Order.create({
      recipientId: new UniqueEntityID('recipient-2'),
      street: 'Avenida Paulista',
      number: '456',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01311-000',
      status: 'pending',
    }, new UniqueEntityID('order-2'))

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(deliveryman)
    vi.spyOn(ordersRepository, 'findNearby').mockResolvedValue([order1, order2])

    const result = await sut.execute({
      deliverymanId: 'deliveryman-1',
      neighborhood: 'Centro',
    })

    expect(result).toEqual([order1, order2])
    expect(result[0].street).toBe('Rua das Flores')
    expect(result[0].city).toBe('São Paulo')
    expect(result[0].state).toBe('SP')
    expect(result[0].zipCode).toBe('01001-000')
    expect(result[1].street).toBe('Avenida Paulista')
    expect(result[1].city).toBe('São Paulo')
    expect(result[1].state).toBe('SP')
    expect(result[1].zipCode).toBe('01311-000')
    expect(usersRepository.findById).toHaveBeenCalledWith('deliveryman-1')
    expect(ordersRepository.findNearby).toHaveBeenCalledWith('Centro')
  })

  it('should throw an error if deliveryman does not exist', async () => {
    vi.spyOn(usersRepository, 'findById').mockResolvedValue(null)

    await expect(
      sut.execute({
        deliverymanId: 'deliveryman-1',
        neighborhood: 'Centro',
      })
    ).rejects.toThrow('Only active deliverymen can list nearby orders')
  })

  it('should throw an error if user is not a deliveryman', async () => {
    const admin = User.create({
      cpf: '12345678901',
      password: 'password123',
      role: 'admin',
      name: 'Admin',
      status: 'active',
    }, new UniqueEntityID('admin-1'))

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(admin)

    await expect(
      sut.execute({
        deliverymanId: 'admin-1',
        neighborhood: 'Centro',
      })
    ).rejects.toThrow('Only active deliverymen can list nearby orders')
  })

  it('should throw an error if deliveryman is inactive', async () => {
    const deliveryman = User.create({
      cpf: '12345678901',
      password: 'password123',
      role: 'deliveryman',
      name: 'João Silva',
      status: 'inactive',
    }, new UniqueEntityID('deliveryman-1'))

    vi.spyOn(usersRepository, 'findById').mockResolvedValue(deliveryman)

    await expect(
      sut.execute({
        deliverymanId: 'deliveryman-1',
        neighborhood: 'Centro',
      })
    ).rejects.toThrow('Only active deliverymen can list nearby orders')
  })

  it('should return an empty array if no nearby orders are found', async () => {
    const deliveryman = User.create({
      cpf: '12345678901',
      password: 'password123',
      role: 'deliveryman',
      name: 'João Silva',
      status: 'active',
    }, new UniqueEntityID('deliveryman-1'))

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