
export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TodoListItem {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  items: TodoItem[];
  isCompleted: boolean;
}

export interface WishlistItem {
  id: string;
  name: string;
  price?: string;
  link?: string;
  priority: "high" | "medium" | "low";
  purchasedBy?: string;
}

export interface BankDetail {
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode?: string;
  iban?: string;
  swift?: string;
  description?: string;
}

