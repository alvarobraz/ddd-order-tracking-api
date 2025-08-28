import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UpdateDeliverymanUseCase } from './update-deliveryman'
import { UsersRepository } from '@/domain/order-control/application/repositories/users-repository'
import { User } from '@/domain/order-control/enterprise/entities/user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeUser } from 'test/factories/make-users'

describe('Update Deliveryman Use Case', () => {
  let usersRepository: UsersRepository
  let sut: UpdateDeliverymanUseCase

  beforeEach(() => {
    usersRepository = {
      findByCpf: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      patch: vi.fn(),
      findAllDeliverymen: vi.fn(),
    }
    sut = new UpdateDeliverymanUseCase(usersRepository)
  })

  it('should update a deliveryman if admin and deliveryman are valid and active', async () => {
    const admin = makeUser({}, new UniqueEntityID('admin-1'))

    const deliveryman = makeUser(
      { role: 'deliveryman' },
      new UniqueEntityID('deliveryman-1'),
    )

    vi.spyOn(usersRepository, 'findById').mockImplementation(async (id) => {
      if (id === 'admin-1') return admin
      if (id === 'deliveryman-1') return deliveryman
      return null
    })
    vi.spyOn(usersRepository, 'save').mockResolvedValue(deliveryman)

    const result = await sut.execute({
      adminId: 'admin-1',
      deliverymanId: 'deliveryman-1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '0987654321',
    })

    expect(result).toBeInstanceOf(User)
    expect(result.name).toBe('Jane Doe')
    expect(result.email).toBe('jane@example.com')
    expect(result.phone).toBe('0987654321')
    expect(usersRepository.findById).toHaveBeenCalledWith('admin-1')
    expect(usersRepository.findById).toHaveBeenCalledWith('deliveryman-1')
    expect(usersRepository.save).toHaveBeenCalledWith(deliveryman)
  })

  it('should throw an error if admin does not exist', async () => {
    vi.spyOn(usersRepository, 'findById').mockResolvedValue(null)

    await expect(
      sut.execute({
        adminId: 'admin-1',
        deliverymanId: 'deliveryman-1',
        name: 'Jane Doe',
      }),
    ).rejects.toThrow('Only active admins can update deliverymen')
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
        deliverymanId: 'deliveryman-2',
        name: 'Jane Doe',
      }),
    ).rejects.toThrow('Only active admins can update deliverymen')
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
        deliverymanId: 'deliveryman-1',
        name: 'Jane Doe',
      }),
    ).rejects.toThrow('Only active admins can update deliverymen')
  })

  it('should throw an error if deliveryman does not exist', async () => {
    const admin = makeUser({}, new UniqueEntityID('admin-1'))

    vi.spyOn(usersRepository, 'findById').mockImplementation(async (id) => {
      if (id === 'admin-1') return admin
      return null
    })

    await expect(
      sut.execute({
        adminId: 'admin-1',
        deliverymanId: 'deliveryman-1',
        name: 'Jane Doe',
      }),
    ).rejects.toThrow('Active deliveryman not found')
  })

  it('should throw an error if deliveryman is not a deliveryman', async () => {
    const admin = makeUser({}, new UniqueEntityID('admin-1'))

    const notDeliveryman = makeUser({}, new UniqueEntityID('admin-2'))

    vi.spyOn(usersRepository, 'findById').mockImplementation(async (id) => {
      if (id === 'admin-1') return admin
      if (id === 'admin-2') return notDeliveryman
      return null
    })

    await expect(
      sut.execute({
        adminId: 'admin-1',
        deliverymanId: 'admin-2',
        name: 'Jane Doe',
      }),
    ).rejects.toThrow('Active deliveryman not found')
  })

  it('should throw an error if deliveryman is inactive', async () => {
    const admin = makeUser({}, new UniqueEntityID('admin-1'))

    const deliveryman = makeUser(
      { role: 'deliveryman', status: 'inactive' },
      new UniqueEntityID('deliveryman-1'),
    )

    vi.spyOn(usersRepository, 'findById').mockImplementation(async (id) => {
      if (id === 'admin-1') return admin
      if (id === 'deliveryman-1') return deliveryman
      return null
    })

    await expect(
      sut.execute({
        adminId: 'admin-1',
        deliverymanId: 'deliveryman-1',
        name: 'Jane Doe',
      }),
    ).rejects.toThrow('Active deliveryman not found')
  })
})
