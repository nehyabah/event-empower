import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { storyController } from '../controllers/storyController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Dashboard
router.get('/dashboard', userController.getDashboard);
router.get('/planner', userController.getPlannerLink);

// User Event (wedding configuration)
router.get('/event', userController.getUserEvent);
router.patch('/event', userController.updateUserEvent);

// Guests
router.get('/guests', userController.getGuests);
router.get('/guests/stats', userController.getGuestStats);
router.get('/guests/:id', userController.getGuest);
router.post('/guests', userController.createGuest);
router.patch('/guests/:id', userController.updateGuest);
router.delete('/guests/:id', userController.deleteGuest);

// Expenses
router.get('/expenses', userController.getExpenses);
router.get('/expenses/summary', userController.getExpenseSummary);
router.get('/expenses/:id', userController.getExpense);
router.post('/expenses', userController.createExpense);
router.patch('/expenses/:id', userController.updateExpense);
router.delete('/expenses/:id', userController.deleteExpense);

// Todo Lists
router.get('/todos', userController.getTodoLists);
router.get('/todos/:id', userController.getTodoList);
router.post('/todos', userController.createTodoList);
router.patch('/todos/:id', userController.updateTodoList);
router.delete('/todos/:id', userController.deleteTodoList);

// Todo Items
router.post('/todos/:id/items', userController.addTodoItem);
router.patch('/todos/:id/items/:itemId', userController.updateTodoItem);
router.post('/todos/:id/items/:itemId/toggle', userController.toggleTodoItem);
router.delete('/todos/:id/items/:itemId', userController.deleteTodoItem);

// Couple story (private)
router.get('/story', storyController.getMyStory);
router.patch('/story', storyController.updateMyStory);
router.get('/story/images', storyController.listMyImages);
router.post('/story/images', storyController.addMyImage);
router.delete('/story/images/:id', storyController.deleteMyImage);
router.get('/story/comments', storyController.listMyComments);
router.post('/story/comments', storyController.addMyComment);

// Wishlist + bank details (private)
router.get('/wishlist', storyController.listMyWishlist);
router.post('/wishlist', storyController.addMyWishlistItem);
router.patch('/wishlist/:id', storyController.updateMyWishlistItem);
router.delete('/wishlist/:id', storyController.deleteMyWishlistItem);
router.get('/bank-details', storyController.listMyBankDetails);
router.post('/bank-details', storyController.addMyBankDetail);
router.patch('/bank-details/:id', storyController.updateMyBankDetail);
router.delete('/bank-details/:id', storyController.deleteMyBankDetail);

export default router;
