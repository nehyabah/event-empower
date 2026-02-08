# Admin Suite Requirements Document

## Overview

This document outlines the complete requirements for a comprehensive admin suite for the Planr wedding planning platform. The admin suite will enable administrators to monitor, manage, and analyze all platform activity.

---

## 1. User Types & Roles

### 1.1 Admin Roles
| Role | Description | Access Level |
|------|-------------|--------------|
| **Super Admin** | Full system access, can create other admins | All features |
| **Admin** | Standard admin access | All except admin management |
| **Support Agent** | Customer support focused | Read-only + support tools |
| **Analyst** | Analytics and reporting | Read-only dashboards |

### 1.2 Database Changes Required
```sql
-- Add admin user type
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN admin_role VARCHAR(20) CHECK (admin_role IN ('super_admin', 'admin', 'support', 'analyst'));

-- Admin audit log
CREATE TABLE admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50), -- 'user', 'vendor', 'inquiry', etc.
    target_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 2. Dashboard & Analytics

### 2.1 Overview Dashboard
- **Real-time Stats Cards**
  - Total users (clients, vendors, planners)
  - Active users (last 24h, 7d, 30d)
  - New registrations today/this week/this month
  - Total revenue (if applicable)
  - Platform health status

- **Activity Feed**
  - Recent user registrations
  - Recent logins
  - Recent inquiries
  - System alerts/errors

### 2.2 User Analytics
- User growth over time (chart)
- User retention rates
- User engagement metrics
- Geographic distribution (by location)
- User type breakdown (pie chart)
- Churn rate analysis

### 2.3 Vendor Analytics
- Total vendors by category
- Vendor registration trends
- Most popular vendor categories
- Vendor response rates to inquiries
- Average vendor rating distribution
- Top performing vendors

### 2.4 Event Analytics
- Total events/weddings planned
- Events by month/season
- Average guest count
- Average budget ranges
- Popular venues (if trackable)

### 2.5 Inquiry Analytics
- Total inquiries sent
- Inquiry response rate
- Average response time
- Inquiry conversion rate
- Inquiries by vendor category

---

## 3. User Management

### 3.1 User List View
- Searchable/filterable table of all users
- Filters: user type, status, registration date, location
- Columns: ID, name, email, phone, type, status, created, last login
- Bulk actions: activate, deactivate, export

### 3.2 User Detail View
- Profile information
- Account status (active/suspended/deleted)
- Activity history
- Login history (with IP addresses)
- Associated data:
  - For clients: events, guests, expenses, todos
  - For vendors: profile, services, inquiries, bookings
  - For planners: clients, tasks, events

### 3.3 User Actions
- View user details
- Edit user information
- Reset password
- Suspend/activate account
- Delete account (soft delete)
- Impersonate user (for debugging)
- Send notification/email
- Add admin notes

---

## 4. Vendor Management

### 4.1 Vendor List View
- All vendor profiles
- Filters: category, location, rating, status, verification
- Pending verification queue
- Featured vendor management

### 4.2 Vendor Detail View
- Business profile
- Services offered
- Portfolio/images
- Reviews and ratings
- Inquiry history
- Booking history
- Revenue (if commission-based)

### 4.3 Vendor Actions
- Approve/reject vendor
- Verify vendor (verified badge)
- Feature/unfeature vendor
- Edit vendor profile
- Suspend vendor
- View/manage reviews
- Contact vendor

### 4.4 Vendor Verification Queue
- List of pending vendor applications
- Verification checklist
- Document upload review
- Approve/reject with reason

---

## 5. Inquiry & Booking Management

### 5.1 Inquiry List
- All inquiries across platform
- Filters: status, date, vendor, client
- Search by content

### 5.2 Inquiry Detail
- Full conversation thread
- Client details
- Vendor details
- Status history
- Response times

### 5.3 Inquiry Actions
- View conversation
- Flag inappropriate content
- Close/resolve inquiry
- Escalate to support

### 5.4 Booking Management (Future)
- Booking list
- Booking details
- Payment status
- Refund management

---

## 6. Content Moderation

### 6.1 Review Moderation
- Pending reviews queue
- Flagged reviews
- Review approval/rejection
- Edit reviews (with audit log)

### 6.2 Profile Moderation
- Flagged profiles
- Inappropriate content detection
- Image moderation queue
- Bio/description review

### 6.3 Message Moderation
- Flagged messages
- Spam detection
- Inappropriate content alerts

---

## 7. System Monitoring

### 7.1 API Monitoring
- Request volume over time
- Response times (avg, p95, p99)
- Error rates by endpoint
- Rate limiting stats
- Top endpoints by usage

### 7.2 Error Tracking
- Error log viewer
- Error grouping
- Error trends
- Stack traces
- Affected users

### 7.3 Database Monitoring
- Query performance
- Slow query log
- Connection pool status
- Table sizes
- Index usage

### 7.4 Server Health
- CPU usage
- Memory usage
- Disk space
- Network I/O
- Uptime

---

## 8. Reports & Exports

### 8.1 Scheduled Reports
- Daily summary email
- Weekly analytics report
- Monthly business report
- Custom report builder

### 8.2 Export Capabilities
- User data export (CSV, JSON)
- Vendor data export
- Inquiry export
- Analytics data export
- Full database backup

### 8.3 Report Types
- User acquisition report
- Vendor performance report
- Revenue report (if applicable)
- Engagement report
- Support ticket report

---

## 9. Notifications & Communications

### 9.1 System Notifications
- Push notification management
- Email template management
- SMS management (if applicable)
- In-app notification center

### 9.2 Broadcast Messaging
- Send to all users
- Send to user segment
- Send to specific user type
- Schedule messages

### 9.3 Email Templates
- Welcome email
- Password reset
- Inquiry notification
- Booking confirmation
- Marketing emails

---

## 10. Settings & Configuration

### 10.1 Platform Settings
- Site name and branding
- Feature flags
- Maintenance mode
- Registration settings (open/closed/invite-only)

### 10.2 Vendor Categories
- Manage vendor categories
- Add/edit/delete categories
- Category icons and descriptions
- Category ordering

### 10.3 Location Management
- Supported regions/cities
- Location-based features
- Geo-restrictions

### 10.4 Pricing & Plans (Future)
- Subscription plans
- Pricing tiers
- Feature access by plan
- Promo codes

---

## 11. Support Tools

### 11.1 Support Tickets
- Ticket list view
- Ticket detail view
- Assign to agent
- Priority levels
- Status management
- Response templates

### 11.2 Live Chat (Future)
- Active chat sessions
- Chat history
- Canned responses
- Chat transfer

### 11.3 Knowledge Base Management
- FAQ management
- Help article editor
- Category organization
- Search analytics

---

## 12. Security & Audit

### 12.1 Audit Logs
- All admin actions logged
- User activity logs
- Login attempt logs
- Data change history

### 12.2 Security Settings
- Password policies
- 2FA enforcement
- Session management
- IP whitelisting for admin

### 12.3 Access Control
- Role-based permissions
- Feature-level access
- API key management
- OAuth app management

---

## 13. Technical Implementation

### 13.1 New Database Tables
```sql
-- Admin users extended
CREATE TABLE admin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    role VARCHAR(20) NOT NULL,
    permissions JSONB DEFAULT '{}',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Support tickets
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium',
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES support_tickets(id),
    sender_id UUID REFERENCES users(id),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- System settings
CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Feature flags
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    enabled BOOLEAN DEFAULT false,
    description TEXT,
    user_percentage INTEGER DEFAULT 100,
    user_types TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Analytics events (for detailed tracking)
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    session_id VARCHAR(100),
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);
```

### 13.2 New API Endpoints

```
# Admin Authentication
POST   /api/admin/login
POST   /api/admin/logout
GET    /api/admin/me

# Dashboard
GET    /api/admin/dashboard/stats
GET    /api/admin/dashboard/activity
GET    /api/admin/dashboard/charts

# User Management
GET    /api/admin/users
GET    /api/admin/users/:id
PATCH  /api/admin/users/:id
POST   /api/admin/users/:id/suspend
POST   /api/admin/users/:id/activate
POST   /api/admin/users/:id/reset-password
DELETE /api/admin/users/:id

# Vendor Management
GET    /api/admin/vendors
GET    /api/admin/vendors/:id
PATCH  /api/admin/vendors/:id
POST   /api/admin/vendors/:id/verify
POST   /api/admin/vendors/:id/feature
GET    /api/admin/vendors/pending

# Inquiries
GET    /api/admin/inquiries
GET    /api/admin/inquiries/:id
PATCH  /api/admin/inquiries/:id

# Analytics
GET    /api/admin/analytics/users
GET    /api/admin/analytics/vendors
GET    /api/admin/analytics/inquiries
GET    /api/admin/analytics/events

# Reports
GET    /api/admin/reports/users
GET    /api/admin/reports/vendors
GET    /api/admin/reports/revenue
POST   /api/admin/reports/export

# Support
GET    /api/admin/tickets
GET    /api/admin/tickets/:id
POST   /api/admin/tickets
PATCH  /api/admin/tickets/:id
POST   /api/admin/tickets/:id/messages

# Settings
GET    /api/admin/settings
PATCH  /api/admin/settings
GET    /api/admin/feature-flags
PATCH  /api/admin/feature-flags/:id

# Audit
GET    /api/admin/audit-logs
GET    /api/admin/login-history

# System
GET    /api/admin/system/health
GET    /api/admin/system/metrics
```

### 13.3 Frontend Pages

```
/admin                     - Dashboard
/admin/users               - User list
/admin/users/:id           - User detail
/admin/vendors             - Vendor list
/admin/vendors/:id         - Vendor detail
/admin/vendors/pending     - Pending verifications
/admin/inquiries           - Inquiry list
/admin/inquiries/:id       - Inquiry detail
/admin/analytics           - Analytics dashboard
/admin/analytics/users     - User analytics
/admin/analytics/vendors   - Vendor analytics
/admin/reports             - Reports
/admin/support             - Support tickets
/admin/support/:id         - Ticket detail
/admin/settings            - Platform settings
/admin/settings/categories - Vendor categories
/admin/settings/emails     - Email templates
/admin/audit               - Audit logs
/admin/system              - System health
```

---

## 14. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Admin authentication & roles
- [ ] Basic dashboard with stats
- [ ] User list and detail views
- [ ] Audit logging

### Phase 2: Core Management (Week 3-4)
- [ ] Vendor management
- [ ] Inquiry management
- [ ] User actions (suspend, delete, etc.)
- [ ] Search and filters

### Phase 3: Analytics (Week 5-6)
- [ ] Analytics dashboard
- [ ] Charts and graphs
- [ ] Date range filters
- [ ] Export functionality

### Phase 4: Support & Moderation (Week 7-8)
- [ ] Support ticket system
- [ ] Content moderation
- [ ] Review management
- [ ] Notification system

### Phase 5: Advanced Features (Week 9-10)
- [ ] System monitoring
- [ ] Advanced reporting
- [ ] Feature flags
- [ ] Settings management

---

## 15. Technology Recommendations

### Frontend
- React with TypeScript (existing stack)
- Recharts or Chart.js for analytics
- TanStack Table for data tables
- React Query for data fetching

### Backend
- Express.js (existing stack)
- Add caching with Redis
- Background jobs with Bull/Agenda
- Elasticsearch for search (optional)

### Monitoring
- Sentry for error tracking
- Prometheus + Grafana for metrics
- Winston for logging

---

## 16. Security Considerations

1. **Admin-only routes** - Separate middleware for admin authentication
2. **IP restrictions** - Optional IP whitelist for admin access
3. **Rate limiting** - Stricter rate limits on admin endpoints
4. **Audit everything** - Log all admin actions
5. **2FA requirement** - Enforce 2FA for admin accounts
6. **Session management** - Shorter session timeouts for admins
7. **Encryption** - Encrypt sensitive data at rest
8. **RBAC** - Granular role-based access control

---

## Appendix: Mockup Descriptions

### A. Dashboard Layout
```
+------------------------------------------+
|  PLANR ADMIN                    [Profile] |
+--------+----------------------------------|
|        |  Welcome, Admin                  |
| NAV    |  +---------+ +---------+         |
|        |  | Users   | | Vendors |         |
| Users  |  | 1,234   | | 456     |         |
| Vendors|  +---------+ +---------+         |
| Inquiry|  +---------+ +---------+         |
| Reports|  | Inquiries| | Events |         |
| Support|  | 789     | | 123     |         |
| Settings| +---------+ +---------+         |
|        |                                  |
|        |  [Activity Chart]               |
|        |  [Recent Activity Feed]         |
+--------+----------------------------------+
```

### B. User List Layout
```
+------------------------------------------+
| Users                        [+ Add User] |
+------------------------------------------+
| Search: [___________] Type: [All v]       |
| Status: [All v]  Date: [All time v]       |
+------------------------------------------+
| [ ] | Name      | Email    | Type | Status|
+------------------------------------------+
| [ ] | John Doe  | j@...    | Client| Active|
| [ ] | Jane Vendor| v@...   | Vendor| Active|
| [ ] | ...       | ...      | ...   | ...   |
+------------------------------------------+
| [Bulk Actions v]         < 1 2 3 4 5 >    |
+------------------------------------------+
```

---

## 17. Wedding-Specific Management

### 17.1 RSVP & Invitation Management
- View all RSVPs across platform
- RSVP response rates analytics
- Invitation delivery tracking
- Failed/bounced invitations
- RSVP trends by date/season

### 17.2 Invitation Template Management
- Manage save-the-date templates
- Add/edit/delete templates
- Template usage analytics
- Featured templates
- Template categories (elegant, casual, tropical, etc.)

### 17.3 Guest List Analytics
- Total guests across all weddings
- Average guests per wedding
- Confirmation rates (confirmed/declined/pending)
- Dietary restriction trends
- Plus-one statistics

### 17.4 Budget & Expense Analytics
- Average wedding budget by region
- Budget distribution by category
- Most common expense categories
- Spending trends over time
- Budget vs actual spending analysis
- Price range distribution

### 17.5 Couple Story Management
- View all couple stories
- Moderate story content
- Manage story images
- Flag inappropriate content
- Featured stories for marketing

### 17.6 Wishlist & Gift Registry
- View all wishlists
- Popular gift items
- Gift fulfillment rates
- Registry analytics

---

## 18. Planner Management

### 18.1 Planner List View
- All registered planners
- Filters: location, status, client count
- Performance metrics

### 18.2 Planner Detail View
- Planner profile
- Client list
- Task completion rates
- Revenue (if commission-based)
- Reviews and ratings

### 18.3 Planner-Client Relationships
- View all planner-client connections
- Connection history
- Invitation codes issued
- Active vs completed projects

### 18.4 Planner Analytics
- Planners by region
- Average clients per planner
- Task completion rates
- Client satisfaction scores

---

## 19. Seasonal & Trend Analytics

### 19.1 Wedding Season Analytics
- Weddings by month/season
- Popular wedding dates
- Date booking trends
- Peak season identification

### 19.2 Trend Reports
- Popular venue types
- Trending vendor categories
- Budget trends year-over-year
- Guest count trends
- Popular wedding themes/styles

### 19.3 Regional Analytics
- Weddings by region/city
- Regional pricing differences
- Popular vendors by region
- Regional feature usage

---

## 20. Financial Management

### 20.1 Revenue Dashboard (if applicable)
- Total platform revenue
- Revenue by source (subscriptions, commissions, ads)
- Revenue trends over time
- Average revenue per user

### 20.2 Subscription Management
- Active subscriptions
- Plan distribution
- Subscription churn rate
- Upgrade/downgrade trends
- Failed payments

### 20.3 Commission Tracking
- Vendor commissions
- Booking commissions
- Payout management
- Commission reports

### 20.4 Promo & Discount Codes
- Create promo codes
- Usage tracking
- Expiration management
- Campaign performance

---

## 21. Marketing & Growth

### 21.1 Referral Program
- Referral code management
- Referral tracking
- Reward distribution
- Top referrers

### 21.2 Email Marketing
- Newsletter subscribers
- Email campaign management
- Template editor
- Send history
- Open/click rates

### 21.3 SEO Management
- Meta tags management
- Landing page editor
- Blog/content management
- Search keyword tracking

### 21.4 Social Media
- Social link management
- Share tracking
- Social login analytics

---

## 22. Customer Feedback

### 22.1 Feedback Collection
- In-app feedback widget
- NPS surveys
- Feature requests
- Bug reports from users

### 22.2 Feedback Analytics
- Satisfaction scores
- Common complaints
- Feature request voting
- Sentiment analysis

### 22.3 Review Management
- All platform reviews
- Review moderation queue
- Response templates
- Review analytics

---

## 23. Dispute & Issue Resolution

### 23.1 Dispute Management
- Client-vendor disputes
- Dispute categories
- Resolution workflow
- Escalation process

### 23.2 Refund Management
- Refund requests
- Refund approval workflow
- Refund history
- Refund analytics

### 23.3 Cancellation Management
- Booking cancellations
- Cancellation reasons
- Cancellation policies
- Cancellation trends

---

## 24. Search & Discovery

### 24.1 Search Analytics
- Top search queries
- Zero-result searches
- Search-to-action conversion
- Search filters usage

### 24.2 Discovery Management
- Featured vendors
- Recommended vendors algorithm
- Category ordering
- Homepage featured content

### 24.3 Vendor Matching
- Match algorithm tuning
- Match success rates
- User preferences analysis

---

## 25. Communication Management

### 25.1 Email Delivery
- Email delivery rates
- Bounce tracking
- Spam complaints
- Email provider health

### 25.2 SMS Management (if applicable)
- SMS delivery rates
- SMS templates
- SMS costs tracking

### 25.3 Push Notifications
- Push notification campaigns
- Delivery rates
- Click-through rates
- Opt-out tracking

### 25.4 In-App Messaging
- Message volume
- Response times
- Conversation analytics

---

## 26. Data & Privacy

### 26.1 Data Export Requests
- GDPR data requests
- Data export queue
- Export history

### 26.2 Data Deletion
- Account deletion requests
- Deletion queue
- Retention policies

### 26.3 Privacy Settings
- Consent management
- Cookie preferences
- Privacy policy versions

### 26.4 Data Backup
- Backup schedules
- Backup history
- Restore functionality
- Backup verification

---

## 27. Integrations

### 27.1 Third-Party Integrations
- Connected services
- API key management
- Integration health monitoring
- Webhook management

### 27.2 Calendar Integrations
- Google Calendar sync status
- iCal exports
- Calendar sync errors

### 27.3 Payment Gateways
- Gateway status
- Transaction logs
- Failed transaction handling

### 27.4 Social Logins
- OAuth provider status
- Login method analytics
- Provider error rates

---

## 28. Localization

### 28.1 Language Management
- Supported languages
- Translation management
- Missing translations
- Language usage analytics

### 28.2 Currency Management
- Supported currencies
- Exchange rates
- Currency by region

### 28.3 Regional Settings
- Date/time formats
- Number formats
- Address formats

---

## 29. A/B Testing & Experiments

### 29.1 Experiment Management
- Active experiments
- Create new experiments
- Experiment results
- Winner selection

### 29.2 Feature Rollouts
- Gradual rollout management
- Rollout by user segment
- Rollback capability

---

## 30. Compliance & Legal

### 30.1 Terms & Policies
- Terms of service versions
- Privacy policy versions
- Cookie policy
- User consent tracking

### 30.2 Compliance Reports
- GDPR compliance status
- Data processing records
- Consent audit trail

### 30.3 Legal Requests
- Subpoena handling
- Legal hold management
- Compliance documentation

---

## Updated Database Tables

```sql
-- Invitation templates
CREATE TABLE invitation_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    preview_image_url TEXT,
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Promo codes
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20), -- 'percentage', 'fixed'
    discount_value DECIMAL(10,2),
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    applicable_to VARCHAR(50), -- 'subscription', 'booking', 'all'
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Referrals
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES users(id),
    referred_id UUID REFERENCES users(id),
    referral_code VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending',
    reward_issued BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Disputes
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES users(id),
    vendor_id UUID REFERENCES users(id),
    booking_id UUID,
    inquiry_id UUID,
    category VARCHAR(50),
    description TEXT,
    status VARCHAR(20) DEFAULT 'open',
    resolution TEXT,
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Feedback
CREATE TABLE user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(20), -- 'bug', 'feature', 'general'
    category VARCHAR(50),
    subject VARCHAR(255),
    message TEXT,
    status VARCHAR(20) DEFAULT 'new',
    votes INTEGER DEFAULT 0,
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Search logs
CREATE TABLE search_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    query TEXT,
    filters JSONB,
    results_count INTEGER,
    clicked_result_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Email logs
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    email_type VARCHAR(50),
    recipient_email VARCHAR(255),
    subject VARCHAR(255),
    status VARCHAR(20), -- 'sent', 'delivered', 'bounced', 'failed'
    provider_id VARCHAR(100),
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- A/B experiments
CREATE TABLE experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    variants JSONB NOT NULL,
    traffic_percentage INTEGER DEFAULT 100,
    target_metric VARCHAR(100),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    winner_variant VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE experiment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID REFERENCES experiments(id),
    user_id UUID REFERENCES users(id),
    variant VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(experiment_id, user_id)
);
```

---

## Summary: Complete Feature List

| Category | Features |
|----------|----------|
| **Users** | List, detail, suspend, delete, impersonate, notes |
| **Vendors** | List, verify, feature, moderate, analytics |
| **Planners** | List, clients, tasks, performance |
| **Inquiries** | List, view, flag, resolve |
| **RSVPs** | Analytics, delivery tracking |
| **Templates** | Invitation templates management |
| **Guests** | Cross-platform analytics |
| **Expenses** | Budget analytics, trends |
| **Stories** | Moderation, featuring |
| **Reviews** | Moderation, responses |
| **Disputes** | Resolution workflow |
| **Refunds** | Request handling |
| **Search** | Analytics, optimization |
| **Marketing** | Referrals, promos, email |
| **Analytics** | Users, vendors, revenue, trends |
| **Reports** | Scheduled, custom, exports |
| **Support** | Tickets, knowledge base |
| **Settings** | Platform, categories, flags |
| **Audit** | Logs, security, compliance |
| **System** | Health, monitoring, backups |
| **A/B Testing** | Experiments, rollouts |
| **Localization** | Languages, currencies |
| **Integrations** | APIs, webhooks, payments |
| **Legal** | Compliance, GDPR, policies |

---

*Document Version: 2.0*
*Last Updated: February 2026*
