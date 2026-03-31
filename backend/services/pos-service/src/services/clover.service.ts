import axios, { AxiosInstance } from 'axios';
import { config } from '../config';

export class CloverService {
  private client: AxiosInstance;

  constructor(accessToken: string, merchantId: string) {
    this.client = axios.create({
      baseURL: `${config.clover.baseUrl}/v3/merchants/${merchantId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async getOrders(limit = 100, offset = 0) {
    const response = await this.client.get('/orders', {
      params: { limit, offset, expand: 'lineItems' },
    });
    return response.data.elements || [];
  }

  async getProducts(limit = 100, offset = 0) {
    const response = await this.client.get('/items', {
      params: { limit, offset },
    });
    return response.data.elements || [];
  }

  async getInventory() {
    const response = await this.client.get('/item_stocks');
    return response.data.elements || [];
  }

  async getCategories() {
    const response = await this.client.get('/categories');
    return response.data.elements || [];
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.client.get('');
      return true;
    } catch {
      return false;
    }
  }
}
