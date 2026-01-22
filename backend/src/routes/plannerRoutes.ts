import { Router } from 'express';
import { plannerController } from '../controllers/plannerController.js';
import { authenticate, requireUserType } from '../middleware/auth.js';

const router = Router();

// All routes require authentication and planner role
router.use(authenticate);
router.use(requireUserType('planner'));

// Dashboard
router.get('/dashboard', plannerController.getDashboardStats);

// Clients
router.get('/clients', plannerController.getClients);
router.get('/clients/:id', plannerController.getClient);
router.post('/clients', plannerController.createClient);
router.patch('/clients/:id', plannerController.updateClient);
router.delete('/clients/:id', plannerController.deleteClient);
router.post('/clients/:id/invite', plannerController.createInvite);

// Tasks
router.get('/tasks', plannerController.getTasks);
router.get('/tasks/:id', plannerController.getTask);
router.post('/tasks', plannerController.createTask);
router.patch('/tasks/:id', plannerController.updateTask);
router.delete('/tasks/:id', plannerController.deleteTask);

// Events
router.get('/events', plannerController.getEvents);
router.get('/events/:id', plannerController.getEvent);
router.post('/events', plannerController.createEvent);
router.patch('/events/:id', plannerController.updateEvent);
router.delete('/events/:id', plannerController.deleteEvent);

export default router;
