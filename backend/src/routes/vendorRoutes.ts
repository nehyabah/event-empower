import { Router } from 'express';
import multer from 'multer';
import { vendorController } from '../controllers/vendorController.js';
import { authenticate, requireUserType } from '../middleware/auth.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Vendor profile (authenticated vendor)
router.get('/me', authenticate, requireUserType('vendor'), vendorController.getMyVendorProfile);
router.patch('/me', authenticate, requireUserType('vendor'), vendorController.upsertMyVendorProfile);
router.get('/dashboard', authenticate, requireUserType('vendor'), vendorController.getVendorDashboard);
router.post('/bookings', authenticate, requireUserType('vendor'), vendorController.createVendorBooking);
router.patch('/bookings/:id', authenticate, requireUserType('vendor'), vendorController.updateVendorBooking);
router.get('/inquiries', authenticate, requireUserType('vendor'), vendorController.listVendorInquiries);
router.patch('/inquiries/:id', authenticate, requireUserType('vendor'), vendorController.updateVendorInquiry);
router.delete('/inquiries/:id', authenticate, requireUserType('vendor'), vendorController.deleteVendorInquiry);
router.post(
  '/uploads',
  authenticate,
  requireUserType('vendor'),
  upload.single('file'),
  vendorController.uploadVendorImage
);

// Public vendor directory
router.get('/', vendorController.getVendors);
router.get('/:id', vendorController.getVendor);

export default router;
