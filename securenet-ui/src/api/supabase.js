import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hegixktbwgbmnsszlrqm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZ2l4a3Rid2dibW5zc3pscnFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NTk4MDgsImV4cCI6MjA5MTAzNTgwOH0.Wc3NiXjGwkMyBkcG6F6rpsxRW2yxcUttvvSriVt8TZU'

export const supabase = createClient(supabaseUrl, supabaseKey)
