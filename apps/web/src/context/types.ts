
export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  status: "todo" | "in_progress" | "done";
  sortOrder: number;
}

export interface TodoListItem {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  items: TodoItem[];
  isCompleted: boolean;
  isShared: boolean;
}

export interface WishlistItem {
  id: string;
  name: string;
  price?: string;
  link?: string;
  imageUrl?: string;
  priority: "high" | "medium" | "low";
  purchasedBy?: string;
  isAnonymous?: boolean;
}

export interface BankDetail {
  id?: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode?: string;
  iban?: string;
  swift?: string;
  description?: string;
}
