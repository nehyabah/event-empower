
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tewvbhwqhsqngfuzmsop.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRld3ZiaHdxaHNxbmdmdXptc29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzODA1NzMsImV4cCI6MjA1Njk1NjU3M30.6eJ9nU6X48fKOsDQ6yqFQCL0fMLQpqkyY5rVpG_p0uE";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
