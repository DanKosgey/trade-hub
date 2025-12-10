// Script to apply the penalty trends migration to Supabase
import { supabase } from './supabase/client';

async function applyMigration() {
  try {
    console.log('=== Applying Penalty Trends Migration ===\n');

    // The SQL to create the function
    const sql = `
      create or replace function get_penalty_trends()
      returns table(
          date_period date,
          rejected_count bigint,
          warning_count bigint,
          total_penalties bigint
      ) as $$
      begin
          return query
          select 
              date_trunc('day', je.date)::date as date_period,
              count(case when je.validation_result = 'rejected' then 1 end) as rejected_count,
              count(case when je.validation_result = 'warning' then 1 end) as warning_count,
              count(*) as total_penalties
          from journal_entries je
          join profiles p on je.user_id = p.id
          where p.role = 'student'
          and je.validation_result in ('rejected', 'warning')
          and je.date >= (current_date - interval '90 days')
          group by date_trunc('day', je.date)::date
          order by date_trunc('day', je.date)::date;
      end;
      $$ language plpgsql security definer;
    `;

    console.log('Step 1: Creating get_penalty_trends function...');
    
    // Execute the raw SQL
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // Try alternative approach - use Supabase SQL interface
      console.log('Direct SQL execution failed, trying alternative method...');
      
      // We'll need to use the Postgres admin API
      const response = await fetch(
        `${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/get_penalty_trends`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({}),
        }
      );

      if (response.status === 404) {
        console.log('Function does not exist - needs to be created via Supabase dashboard');
        console.log('\nPlease run the following SQL in your Supabase SQL editor:');
        console.log(sql);
        return;
      }
      
      throw error;
    }

    console.log('✅ Migration applied successfully!');
    
    // Test the function
    console.log('\nStep 2: Testing the function...');
    const { data, error: testError } = await supabase.rpc('get_penalty_trends');
    
    if (testError) {
      console.error('❌ Error testing function:', testError);
      return;
    }
    
    console.log('✅ Function works! Returned', data?.length || 0, 'records');
    
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    console.log('\nPlease copy and paste this SQL into your Supabase SQL editor:');
    console.log(`
      create or replace function get_penalty_trends()
      returns table(
          date_period date,
          rejected_count bigint,
          warning_count bigint,
          total_penalties bigint
      ) as $$
      begin
          return query
          select 
              date_trunc('day', je.date)::date as date_period,
              count(case when je.validation_result = 'rejected' then 1 end) as rejected_count,
              count(case when je.validation_result = 'warning' then 1 end) as warning_count,
              count(*) as total_penalties
          from journal_entries je
          join profiles p on je.user_id = p.id
          where p.role = 'student'
          and je.validation_result in ('rejected', 'warning')
          and je.date >= (current_date - interval '90 days')
          group by date_trunc('day', je.date)::date
          order by date_trunc('day', je.date)::date;
      end;
      $$ language plpgsql security definer;
    `);
  }
}

// Run the migration
applyMigration();
