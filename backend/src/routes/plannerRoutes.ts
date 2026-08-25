import { Router } from 'express';
import multer from 'multer';
import { plannerController } from '../controllers/plannerController.js';
import { authenticate, requireUserType } from '../middleware/auth.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });

const router = Router();

// All routes require authentication and planner role
router.use(authenticate);
router.use(requireUserType('planner'));

// Profile
router.get('/profile', plannerController.getMyProfile);
router.patch('/profile', plannerController.updateMyProfile);
router.post('/profile/upload', upload.single('file'), plannerController.uploadProfileImage);

// Dashboard
router.get('/dashboard', plannerController.getDashboardStats);

// Clients
router.get('/clients', plannerController.getClients);
router.get('/clients/:id', plannerController.getClient);
router.post('/clients', plannerController.createClient);
router.patch('/clients/:id', plannerController.updateClient);
router.delete('/clients/:id', plannerController.deleteClient);
router.post('/clients/:id/invite', plannerController.createInvite);
router.post('/clients/:id/archive', plannerController.archiveClient);
router.post('/clients/:id/unarchive', plannerController.unarchiveClient);

// Client workspace (combined view)
router.get('/clients/:clientId/workspace', plannerController.getClientWorkspace);

// Client project (event + vendor roster)
router.get('/clients/:clientId/project', plannerController.getClientProject);
router.post('/clients/:clientId/project/vendors', plannerController.addClientProjectVendor);
router.patch('/clients/:clientId/project/vendors/:vendorId', plannerController.updateClientProjectVendor);
router.delete('/clients/:clientId/project/vendors/:vendorId', plannerController.removeClientProjectVendor);

// Client vision board (shared)
router.get('/clients/:clientId/expenses', plannerController.getClientExpenses);
router.get('/clients/:clientId/vision-board', plannerController.getClientVisionBoard);
router.post('/clients/:clientId/vision-board', plannerController.addClientVisionBoardItem);
router.post('/clients/:clientId/vision-board/upload', upload.single('file'), plannerController.uploadClientVisionBoardImage);
router.patch('/clients/:clientId/vision-board/:itemId', plannerController.updateClientVisionBoardItem);
router.delete('/clients/:clientId/vision-board/:itemId', plannerController.deleteClientVisionBoardItem);

// Client shared todo lists (read) + item management
router.get('/clients/:clientId/todos', plannerController.getClientTodos);
router.post('/clients/:clientId/todos/:listId/items', plannerController.addClientTodoItem);
router.patch('/clients/:clientId/todos/:listId/items/:itemId', plannerController.updateClientTodoItem);
router.post('/clients/:clientId/todos/:listId/items/:itemId/toggle', plannerController.toggleClientTodoItem);
router.delete('/clients/:clientId/todos/:listId/items/:itemId', plannerController.deleteClientTodoItem);

// Tasks
router.get('/tasks', plannerController.getTasks);
router.get('/tasks/:id', plannerController.getTask);
router.post('/tasks', plannerController.createTask);
router.patch('/tasks/:id', plannerController.updateTask);
router.delete('/tasks/:id', plannerController.deleteTask);

// Calendar data (events + wedding dates + todo due dates)
router.get('/calendar', plannerController.getCalendarData);

// Events
router.get('/events', plannerController.getEvents);
router.get('/events/:id', plannerController.getEvent);
router.post('/events', plannerController.createEvent);
router.patch('/events/:id', plannerController.updateEvent);
router.delete('/events/:id', plannerController.deleteEvent);

export default router;
