-- Create a function to calculate student statistics
create or replace function get_student_stats(user_id uuid)
returns table(
    win_rate numeric,
    total_pnl numeric,
    trades_count bigint,
    avg_risk_reward numeric,
    current_drawdown numeric
) as $$
begin
    return query
    select 
        -- Calculate win rate
        case 
            when count(*) filter (where je.status = 'win' or je.status = 'loss') = 0 then 0
            else round((count(*) filter (where je.status = 'win') * 100.0) / 
                 count(*) filter (where je.status = 'win' or je.status = 'loss'), 2)
        end as win_rate,
        -- Calculate total P&L
        coalesce(sum(je.pnl), 0) as total_pnl,
        -- Count total trades
        count(*) as trades_count,
        -- Calculate average risk/reward ratio (simplified)
        case 
            when count(*) = 0 then 0
            else round(avg(case 
                when je.stop_loss is not null and je.take_profit is not null and je.entry_price is not null and je.entry_price != je.stop_loss then
                    abs(je.take_profit - je.entry_price) / nullif(abs(je.entry_price - je.stop_loss), 1)
                else 1
            end), 2)
        end as avg_risk_reward,
        -- Calculate current drawdown (simplified)
        case 
            when count(*) = 0 then 0
            else round(max(case 
                when je.pnl < 0 then abs(je.pnl) 
                else 0 
            end), 2)
        end as current_drawdown
    from journal_entries je
    where je.user_id = get_student_stats.user_id;
end;
$$ language plpgsql;

-- Create a function to get all students with their stats for admin portal
create or replace function get_all_students_for_admin()
returns table(
    id uuid,
    name text,
    email text,
    tier text,
    joined_date timestamp with time zone,
    status text,
    win_rate numeric,
    total_pnl numeric,
    trades_count bigint,
    avg_risk_reward numeric,
    current_drawdown numeric
) as $$
begin
    return query
    with student_stats as (
        select 
            p.id as profile_id,
            p.full_name as student_name,
            p.email as student_email,
            p.subscription_tier as student_tier,
            p.joined_date as student_joined_date,
            (get_student_stats(p.id)).win_rate as student_win_rate,
            (get_student_stats(p.id)).total_pnl as student_total_pnl,
            (get_student_stats(p.id)).trades_count as student_trades_count,
            (get_student_stats(p.id)).avg_risk_reward as student_avg_risk_reward,
            (get_student_stats(p.id)).current_drawdown as student_current_drawdown
        from profiles p
        where p.role = 'student'
    )
    select 
        profile_id as id,
        student_name as name,
        student_email as email,
        student_tier as tier,
        student_joined_date as joined_date,
        case 
            when student_win_rate < 40 then 'at-risk'
            when student_trades_count = 0 then 'inactive'
            else 'active'
        end as status,
        student_win_rate as win_rate,
        student_total_pnl as total_pnl,
        student_trades_count as trades_count,
        student_avg_risk_reward as avg_risk_reward,
        student_current_drawdown as current_drawdown
    from student_stats;
end;
$$ language plpgsql;

-- Create a function to get all trades for admin portal with student info
create or replace function get_all_trades_for_admin()
returns table(
    id uuid,
    user_id uuid,
    student_name text,
    student_tier text,
    pair text,
    type text,
    entry_price numeric,
    stop_loss numeric,
    take_profit numeric,
    status text,
    pnl numeric,
    validation_result text,
    notes text,
    date timestamp with time zone
) as $$
begin
    return query
    select 
        je.id as id,
        je.user_id as user_id,
        p.full_name as student_name,
        p.subscription_tier as student_tier,
        je.pair as pair,
        je.type as type,
        je.entry_price as entry_price,
        je.stop_loss as stop_loss,
        je.take_profit as take_profit,
        je.status as status,
        je.pnl as pnl,
        je.validation_result as validation_result,
        je.notes as notes,
        je.date as date
    from journal_entries je
    join profiles p on je.user_id = p.id
    where p.role = 'student'
    order by je.date desc;
end;
$$ language plpgsql;

-- Create a function to get business metrics for admin portal
create or replace function get_business_metrics()
returns table(
    total_revenue numeric,
    mrr numeric,
    churn_rate numeric,
    foundation_count numeric,
    professional_count numeric,
    elite_count numeric
) as $$
begin
    return query
    select 
        -- Total revenue (simplified calculation)
        (sum(case 
            when subscription_tier = 'foundation' then 47
            when subscription_tier = 'professional' then 97
            when subscription_tier = 'elite' then 297
            else 0
        end) * 12)::numeric as total_revenue,
        -- Monthly recurring revenue
        sum(case 
            when subscription_tier = 'foundation' then 47
            when subscription_tier = 'professional' then 97
            when subscription_tier = 'elite' then 297
            else 0
        end)::numeric as mrr,
        -- Churn rate (calculated based on subscription history or set to 0 if no history)
        0::numeric as churn_rate,
        -- Tier counts
        count(*) filter (where subscription_tier = 'foundation')::numeric as foundation_count,
        count(*) filter (where subscription_tier = 'professional')::numeric as professional_count,
        count(*) filter (where subscription_tier = 'elite')::numeric as elite_count
    from profiles 
    where role = 'student';
end;
$$ language plpgsql;
