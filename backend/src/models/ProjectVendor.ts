import { query, queryOne } from '../config/database.js';

export type ProjectVendorStatus = 'inquired' | 'quoted' | 'booked' | 'confirmed' | 'cancelled';

export interface ProjectVendor {
  id: string;
  event_id: string;
  vendor_profile_id: string;
  category: string | null;
  status: ProjectVendorStatus;
  amount: number | null;
  notes: string | null;
  added_by: string | null;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  business_name?: string;
  vendor_category?: string;
  vendor_location?: string | null;
  vendor_email?: string | null;
  vendor_phone?: string | null;
  vendor_is_verified?: boolean;
}

export interface CreateProjectVendorInput {
  event_id: string;
  vendor_profile_id: string;
  category?: string;
  status?: ProjectVendorStatus;
  amount?: number;
  notes?: string;
  added_by?: string;
}

export interface UpdateProjectVendorInput {
  status?: ProjectVendorStatus;
  amount?: number | null;
  notes?: string | null;
  category?: string | null;
}

const WITH_VENDOR = `
  SELECT pv.*, vp.business_name, vp.category as vendor_category,
         vp.location as vendor_location, vp.email as vendor_email,
         vp.phone as vendor_phone, vp.is_verified as vendor_is_verified
  FROM project_vendors pv
  JOIN vendor_profiles vp ON pv.vendor_profile_id = vp.id
`;

export const ProjectVendorModel = {
  async findByEventId(eventId: string): Promise<ProjectVendor[]> {
    return query<ProjectVendor>(
      `${WITH_VENDOR} WHERE pv.event_id = $1 ORDER BY pv.created_at ASC`,
      [eventId]
    );
  },

  async findByVendorProfileId(vendorProfileId: string): Promise<ProjectVendor[]> {
    return query<ProjectVendor>(
      `${WITH_VENDOR} WHERE pv.vendor_profile_id = $1 ORDER BY pv.created_at DESC`,
      [vendorProfileId]
    );
  },

  async findById(id: string): Promise<ProjectVendor | null> {
    return queryOne<ProjectVendor>(
      `${WITH_VENDOR} WHERE pv.id = $1`,
      [id]
    );
  },

  async findByEventAndVendor(eventId: string, vendorProfileId: string): Promise<ProjectVendor | null> {
    return queryOne<ProjectVendor>(
      `${WITH_VENDOR} WHERE pv.event_id = $1 AND pv.vendor_profile_id = $2`,
      [eventId, vendorProfileId]
    );
  },

  async create(input: CreateProjectVendorInput): Promise<ProjectVendor> {
    const result = await queryOne<ProjectVendor>(
      `INSERT INTO project_vendors (event_id, vendor_profile_id, category, status, amount, notes, added_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        input.event_id,
        input.vendor_profile_id,
        input.category || null,
        input.status || 'inquired',
        input.amount ?? null,
        input.notes || null,
        input.added_by || null,
      ]
    );

    if (!result) throw new Error('Failed to add vendor to project');

    const full = await this.findById(result.id);
    return full!;
  },

  async update(id: string, input: UpdateProjectVendorInput): Promise<ProjectVendor | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let p = 1;

    if (input.status !== undefined) { fields.push(`status = $${p++}`); values.push(input.status); }
    if (input.amount !== undefined) { fields.push(`amount = $${p++}`); values.push(input.amount ?? null); }
    if (input.notes !== undefined) { fields.push(`notes = $${p++}`); values.push(input.notes ?? null); }
    if (input.category !== undefined) { fields.push(`category = $${p++}`); values.push(input.category ?? null); }

    if (fields.length === 0) return this.findById(id);

    fields.push(`updated_at = NOW()`);
    values.push(id);

    await queryOne<ProjectVendor>(
      `UPDATE project_vendors SET ${fields.join(', ')} WHERE id = $${p} RETURNING id`,
      values
    );

    return this.findById(id);
  },

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM project_vendors WHERE id = $1 RETURNING id', [id]);
    return result.length > 0;
  },
};
