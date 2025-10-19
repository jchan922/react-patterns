// Mock API with async/await for CRUD operations
// Simulates network delay for realistic behavior

let todoListsData = [];
let todoItemsData = [];
let nextListId = 1;
let nextItemId = 1;

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Todo Lists CRUD
  async getAllLists() {
    await delay();
    return [...todoListsData];
  },

  async createList(title) {
    await delay();
    const newList = {
      id: nextListId++,
      title,
      createdAt: new Date().toISOString(),
    };
    todoListsData.push(newList);
    return newList;
  },

  async updateList(id, title) {
    await delay();
    const list = todoListsData.find(l => l.id === id);
    if (!list) throw new Error('List not found');
    list.title = title;
    return list;
  },

  async deleteList(id) {
    await delay();
    todoListsData = todoListsData.filter(l => l.id !== id);
    todoItemsData = todoItemsData.filter(item => item.listId !== id);
    return { success: true };
  },

  // Todo Items CRUD
  async getItemsByList(listId) {
    await delay();
    return todoItemsData.filter(item => item.listId === listId);
  },

  async createItem(listId, title, priority) {
    await delay();
    const newItem = {
      id: nextItemId++,
      listId,
      title,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    todoItemsData.push(newItem);
    return newItem;
  },

  async updateItem(id, updates) {
    await delay();
    const item = todoItemsData.find(i => i.id === id);
    if (!item) throw new Error('Item not found');
    Object.assign(item, updates);
    return item;
  },

  async deleteItem(id) {
    await delay();
    todoItemsData = todoItemsData.filter(i => i.id !== id);
    return { success: true };
  },

  async toggleItem(id) {
    await delay();
    const item = todoItemsData.find(i => i.id === id);
    if (!item) throw new Error('Item not found');
    item.completed = !item.completed;
    return item;
  },
};
