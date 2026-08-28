import { Router } from 'express';
import { requireApproved } from '../middleware/requireApproved.js';
import multer from 'multer';
import { vendorController } from '../controllers/vendorController.js';
import { authenticate, optionalAuth, requireUserType } from '../middleware/auth.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
});

// Vendor profile (authenticated vendor)
router.get('/me', authenticate, requireUserType('vendor'), vendorController.getMyVendorProfile);
router.patch('/me', authenticate, requireUserType('vendor'), vendorController.upsertMyVendorProfile);
router.get('/dashboard', authenticate, requireUserType('vendor'), vendorController.getVendorDashboard);
router.get('/me/projects', authenticate, requireUserType('vendor'), vendorController.getVendorProjects);
router.get('/workspace', authenticate, requireUserType('vendor'), vendorController.getVendorWorkspace);
router.get('/bookings', authenticate, requireUserType('vendor'), vendorController.listVendorBookings);
router.get('/bookable-clients', authenticate, requireUserType('vendor'), vendorController.listBookableClients);
router.post('/bookings', authenticate, requireUserType('vendor'), requireApproved, vendorController.createVendorBooking);
router.patch('/bookings/:id', authenticate, requireUserType('vendor'), requireApproved, vendorController.updateVendorBooking);
router.delete('/bookings/:id', authenticate, requireUserType('vendor'), requireApproved, vendorController.deleteVendorBooking);
router.get('/inquiries', authenticate, requireUserType('vendor'), vendorController.listVendorInquiries);
router.get('/inquiries/:id', authenticate, requireUserType('vendor'), vendorController.getInquiryWithMessages);
router.patch('/inquiries/:id', authenticate, requireUserType('vendor'), requireApproved, vendorController.updateVendorInquiry);
router.delete('/inquiries/:id', authenticate, requireUserType('vendor'), requireApproved, vendorController.deleteVendorInquiry);
router.get('/inquiries/:id/messages', authenticate, requireUserType('vendor'), vendorController.getInquiryMessages);
router.post('/inquiries/:id/messages', authenticate, requireUserType('vendor'), requireApproved, vendorController.sendInquiryMessage);
router.post(
  '/uploads',
  authenticate,
  requireUserType('vendor'),
  upload.single('file'),
  vendorController.uploadVendorImage
);

// Public vendor directory. optionalAuth so contact details can be unlocked
// for a couple who has actually booked this vendor - anonymous browsers and
// everyone else get them masked.
router.get('/', optionalAuth, vendorController.getVendors);
router.get('/:id', optionalAuth, vendorController.getVendor);

export default router;
