import axios, { AxiosInstance } from 'axios';
import { config } from '../config';

export class SquareService {
  private client: AxiosInstance;
  private locationId: string;

  constructor(accessToken: string, locationId: string) {
    this.locationId = locationId;
    this.client = axios.create({
      baseURL: `${config.square.baseUrl}/v2`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2024-01-18',
      },
    });
  }

  async getOrders(limit = 100, cursor?: string) {
    const response = await this.client.post('/orders/search', {
      location_ids: [this.locationId],
      limit,
      cursor,
    });
    return response.data.orders || [];
  }

  async getProducts(cursor?: string) {
    const response = await this.client.get('/catalog/list', {
      params: { types: 'ITEM', cursor },
    });
    return response.data.objects || [];
  }

  async getInventory(cursor?: string) {
    const response = await this.client.post('/inventory/batch-retrieve-counts', {
      location_ids: [this.locationId],
      cursor,
    });
    return response.data.counts || [];
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.client.get('/locations');
      return true;
    } catch {
      return false;
    }
  }
}
