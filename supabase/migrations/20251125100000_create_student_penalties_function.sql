-- Create a function to get student penalties for analytics
create or replace function get_student_penalties()
returns table(
    id uuid,
    name text,
    email text,
    tier text,
    rejected_count bigint,
    warning_count bigint,
    total_penalties bigint
) as $$
begin
    return query
    with student_penalties as (
        select 
            p.id,
            p.full_name,
            p.email,
            p.subscription_tier,
            count(*) filter (where je.validation_result = 'rejected') as rejected_count,
            count(*) filter (where je.validation_result = 'warning') as warning_count
        from profiles p
        left join journal_entries je on p.id = je.user_id
        where p.role = 'student'
        and je.validation_result in ('rejected', 'warning')
        group by p.id, p.full_name, p.email, p.subscription_tier
    )
    select 
        sp.id,
        coalesce(sp.full_name, sp.email, 'Unknown') as name,
        sp.email,
        sp.subscription_tier as tier,
        coalesce(sp.rejected_count, 0) as rejected_count,
        coalesce(sp.warning_count, 0) as warning_count,
        (coalesce(sp.rejected_count, 0) + coalesce(sp.warning_count, 0)) as total_penalties
    from student_penalties sp
    where (coalesce(sp.rejected_count, 0) + coalesce(sp.warning_count, 0)) > 0
    order by (coalesce(sp.rejected_count, 0) + coalesce(sp.warning_count, 0)) desc
    limit 20;
end;
$$ language plpgsql;