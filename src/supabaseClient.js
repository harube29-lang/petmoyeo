import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wgrydaaawoufioswlsvb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndncnlkYWFhd291Zmlvc3dsc3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MjE0OTYsImV4cCI6MjA4Mzk5NzQ5Nn0.7oRvqDoVhqfsXqhH7ERZfBTD0KrkszDQXbThbib7QoI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
