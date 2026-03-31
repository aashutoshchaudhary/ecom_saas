import { api } from "./client";

export interface Wallet {
  id: string;
  tenantId: string;
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  status: "completed" | "pending" | "failed";
  createdAt: string;
}

export const walletApi = {
  get() {
    return api.get<Wallet>("/wallet");
  },

  getTransactions(params?: { page?: number; limit?: number; type?: string }) {
    return api.get<{ data: WalletTransaction[]; meta: any }>("/wallet/transactions", params);
  },

  addFunds(amount: number, paymentMethodId: string) {
    return api.post<WalletTransaction>("/wallet/add-funds", { amount, paymentMethodId });
  },
};
