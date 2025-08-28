import { Order } from '@/domain/order-control/enterprise/entities/order'
import { OrdersRepository } from '@/domain/order-control/application/repositories/orders-repository'

export class InMemoryOrdersRepository implements OrdersRepository {
  public items: Order[] = []

  async create(order: Order): Promise<void> {
    this.items.push(order)
  }

  async findById(id: string): Promise<Order | null> {
    const order = this.items.find((item) => item.id.toString() === id)
    return order || null
  }

  async save(order: Order): Promise<Order> {
    const index = this.items.findIndex(
      (item) => item.id.toString() === order.id.toString(),
    )
    if (index >= 0) {
      this.items[index] = order
    }
    return order
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === id)
    if (index >= 0) {
      this.items.splice(index, 1)
    }
  }

  async findAll(): Promise<Order[]> {
    return this.items
  }

  async findNearby(neighborhood: string): Promise<Order[]> {
    return this.items.filter((order) => order.neighborhood === neighborhood)
  }

  async findByDeliverymanId(deliverymanId: string): Promise<Order[]> {
    return this.items.filter(
      (order) => order.deliverymanId?.toString() === deliverymanId,
    )
  }
}
