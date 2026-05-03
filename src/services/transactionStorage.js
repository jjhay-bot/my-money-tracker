import localforage from "localforage";

export const TRANSACTIONS_STORAGE_KEY = "money-tracker-transactions";

localforage.config({
  name: "money-tracker",
  storeName: "transactions",
});

export const loadTransactions = async () => {
  const stored = await localforage.getItem(TRANSACTIONS_STORAGE_KEY);
  return Array.isArray(stored) ? stored : [];
};

export const saveTransactions = async (transactions) => {
  await localforage.setItem(TRANSACTIONS_STORAGE_KEY, transactions);
};
