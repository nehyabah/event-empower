import { Router } from 'express';
import multer from 'multer';
import { userController } from '../controllers/userController.js';
import { storyController } from '../controllers/storyController.js';
import { authenticate } from '../middleware/auth.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Dashboard
router.get('/dashboard', userController.getDashboard);
router.get('/planner', userController.getPlannerLink);
router.get('/rsvp-code', userController.getRsvpCode);

// Guest RSVP reminders
router.get('/guest-reminders', userController.getReminderSettings);
router.patch('/guest-reminders', userController.updateReminderSettings);
router.post('/guest-reminders/send', userController.sendRemindersNow);

// Workspace (combined view: event + planner + vendors + shared todos + guest stats)
router.get('/workspace', userController.getWorkspace);

// Project (event + planner + vendor roster)
router.get('/project', userController.getProject);
router.post('/project/vendors', userController.addProjectVendor);
router.patch('/project/vendors/:id', userController.updateProjectVendor);
router.delete('/project/vendors/:id', userController.removeProjectVendor);

// Vendor reviews (couples rate vendors they have used)
router.get('/reviewable-vendors', userController.getReviewableVendors);
router.put('/vendors/:vendorProfileId/review', userController.submitVendorReview);
router.delete('/vendors/:vendorProfileId/review', userController.deleteVendorReview);

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
router.get('/story/check-slug', storyController.checkSlug);
router.get('/story/images', storyController.listMyImages);
router.post('/story/images', storyController.addMyImage);
router.delete('/story/images/:id', storyController.deleteMyImage);
router.get('/story/comments', storyController.listMyComments);
router.post('/story/comments', storyController.addMyComment);

// Timeline
router.get('/story/timeline', storyController.listTimeline);
router.post('/story/timeline', storyController.addTimeline);
router.patch('/story/timeline/reorder', storyController.reorderTimeline);
router.patch('/story/timeline/:id', storyController.updateTimeline);
router.delete('/story/timeline/:id', storyController.deleteTimeline);

// Wedding Party
router.get('/story/wedding-party', storyController.listWeddingParty);
router.post('/story/wedding-party', storyController.addWeddingParty);
router.patch('/story/wedding-party/reorder', storyController.reorderWeddingParty);
router.patch('/story/wedding-party/:id', storyController.updateWeddingParty);
router.delete('/story/wedding-party/:id', storyController.deleteWeddingParty);

// Travel
router.get('/story/travel', storyController.listTravel);
router.post('/story/travel', storyController.addTravel);
router.patch('/story/travel/reorder', storyController.reorderTravel);
router.patch('/story/travel/:id', storyController.updateTravel);
router.delete('/story/travel/:id', storyController.deleteTravel);

// FAQ
router.get('/story/faq', storyController.listFaq);
router.post('/story/faq', storyController.addFaq);
router.patch('/story/faq/reorder', storyController.reorderFaq);
router.patch('/story/faq/:id', storyController.updateFaq);
router.delete('/story/faq/:id', storyController.deleteFaq);

// Wishlist + bank details (private)
router.post('/wishlist/upload', upload.single('file'), userController.uploadImage);
router.get('/wishlist', storyController.listMyWishlist);
router.post('/wishlist', storyController.addMyWishlistItem);
router.patch('/wishlist/:id', storyController.updateMyWishlistItem);
router.delete('/wishlist/:id', storyController.deleteMyWishlistItem);
router.get('/bank-details', storyController.listMyBankDetails);
router.post('/bank-details', storyController.addMyBankDetail);
router.patch('/bank-details/:id', storyController.updateMyBankDetail);
router.delete('/bank-details/:id', storyController.deleteMyBankDetail);

// Client inquiries (for messaging with vendors)
router.get('/inquiries', userController.listMyInquiries);
router.get('/inquiries/:id', userController.getMyInquiry);
router.post('/inquiries/:id/messages', userController.sendMyInquiryMessage);

export default router;
