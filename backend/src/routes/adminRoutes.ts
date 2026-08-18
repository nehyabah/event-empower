import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticate, requireAdminRole } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Admin authentication (no auth required)
router.post('/login', authLimiter, adminController.login);

// All routes below require authentication + admin user type + admin role
const adminAuth = [authenticate, requireAdminRole()]; // any admin role
const superOnly = [authenticate, requireAdminRole('super_admin')];
const adminPlus = [authenticate, requireAdminRole('super_admin', 'admin')];
const supportPlus = [authenticate, requireAdminRole('super_admin', 'admin', 'support')];
const allAdmins = [authenticate, requireAdminRole('super_admin', 'admin', 'support', 'analyst')];

// Admin profile
router.get('/me', ...allAdmins, adminController.me);

// Admin dashboard
router.get('/dashboard/stats', ...allAdmins, adminController.stats);
router.get('/dashboard/activity', ...allAdmins, adminController.dashboardActivity);

// User management
// Pending approvals
router.get('/pending-approvals', ...supportPlus, adminController.listPendingApprovals);
router.post('/users/:id/approve', ...adminPlus, adminController.approveUser);
router.post('/users/:id/reject', ...adminPlus, adminController.rejectUser);

router.get('/users', ...supportPlus, adminController.listUsers);
router.get('/users/:id', ...supportPlus, adminController.getUser);
router.patch('/users/:id', ...adminPlus, adminController.updateUser);
router.patch('/users/:id/notes', ...supportPlus, adminController.updateUserNotes);
router.post('/users/:id/reset-password', ...adminPlus, adminController.resetUserPassword);
router.post('/users/:id/suspend', ...adminPlus, adminController.suspendUser);
router.post('/users/:id/activate', ...adminPlus, adminController.activateUser);
router.delete('/users/:id', ...superOnly, adminController.softDeleteUser);

// Vendor management
router.get('/vendors', ...allAdmins, adminController.listVendors);
router.get('/vendors/:id', ...allAdmins, adminController.getVendor);
router.patch('/vendors/:id', ...adminPlus, adminController.updateVendor);
router.post('/vendors/:id/verify', ...adminPlus, adminController.verifyVendor);
router.post('/vendors/:id/unverify', ...adminPlus, adminController.unverifyVendor);
router.post('/vendors/:id/feature', ...adminPlus, adminController.featureVendor);
router.post('/vendors/:id/unfeature', ...adminPlus, adminController.unfeatureVendor);
router.post('/vendors/:id/suspend', ...adminPlus, adminController.suspendVendor);
router.post('/vendors/:id/activate', ...adminPlus, adminController.activateVendor);

// Inquiry management
router.get('/inquiries', ...supportPlus, adminController.listInquiries);
router.get('/inquiries/:id', ...supportPlus, adminController.getInquiry);
router.patch('/inquiries/:id', ...supportPlus, adminController.updateInquiry);

// Analytics
router.get('/analytics/overview', ...allAdmins, adminController.analyticsOverview);
router.get('/analytics/users', ...allAdmins, adminController.analyticsUsers);
router.get('/analytics/vendors', ...allAdmins, adminController.analyticsVendors);
router.get('/analytics/inquiries', ...allAdmins, adminController.analyticsInquiries);

// Support tickets
router.get('/support/tickets', ...supportPlus, adminController.listSupportTickets);
router.post('/support/tickets', ...supportPlus, adminController.createSupportTicket);
router.get('/support/tickets/:id', ...supportPlus, adminController.getSupportTicket);
router.patch('/support/tickets/:id', ...supportPlus, adminController.updateSupportTicket);
router.post('/support/tickets/:id/messages', ...supportPlus, adminController.addSupportMessage);

// Moderation
router.get('/moderation/comments', ...supportPlus, adminController.listModerationComments);
router.delete('/moderation/comments/:id', ...adminPlus, adminController.deleteModerationComment);
router.get('/moderation/images', ...supportPlus, adminController.listModerationImages);
router.delete('/moderation/images/:id', ...adminPlus, adminController.deleteModerationImage);

// Broadcasts
router.get('/broadcasts', ...adminPlus, adminController.listBroadcasts);
router.get('/broadcasts/:id', ...adminPlus, adminController.getBroadcast);
router.post('/broadcasts', ...adminPlus, adminController.createBroadcast);
router.patch('/broadcasts/:id', ...adminPlus, adminController.updateBroadcast);
router.delete('/broadcasts/:id', ...adminPlus, adminController.deleteBroadcast);
router.post('/broadcasts/:id/cancel', ...adminPlus, adminController.cancelBroadcast);

// Templates
router.get('/templates', ...adminPlus, adminController.listTemplates);
router.get('/templates/:id', ...adminPlus, adminController.getTemplate);
router.post('/templates', ...adminPlus, adminController.createTemplate);
router.patch('/templates/:id', ...adminPlus, adminController.updateTemplate);
router.delete('/templates/:id', ...adminPlus, adminController.deleteTemplate);

// Subscribers
router.get('/subscribers', ...allAdmins, adminController.listSubscribers);
router.post('/subscribers/:id/activate', ...adminPlus, adminController.activateSubscriber);
router.post('/subscribers/:id/deactivate', ...adminPlus, adminController.deactivateSubscriber);

// Audit
router.get('/audit-logs', ...allAdmins, adminController.listAuditLogs);

export default router;
