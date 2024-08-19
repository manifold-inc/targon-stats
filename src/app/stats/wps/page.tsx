import ClientPage from "./ClientPage";

export const revalidate = 86400; // 60 * 60 * 24

export default  function Page() {
  /*const data = db.execute(sql`with daily_stats as (
    select 
        date_trunc('day', vr.timestamp) as day,
        (mr.stats->>'wps')::decimal as wps
    from 
        miner_response mr
    join 
        validator_request vr on mr.r_nanoid = vr.r_nanoid
    where 
        vr.timestamp >= now() - interval '7 days'
        and (mr.stats->>'verified')::boolean = true
        and mr.stats->>'wps' is not null
),
daily_aggregates as (
    select 
        day,
        max(wps) as max_wps,
        percentile_cont(0.8) within group (order by wps) as percentile_80_wps
    from 
        daily_stats
    group by 
        day
    order by 
        day
),
final_aggregates as (
    select
        da.day,
        da.max_wps,
        da.percentile_80_wps,
        lag(da.percentile_80_wps) over (order by da.day) as previous_percentile_80_wps,
        ((da.percentile_80_wps - lag(da.percentile_80_wps) over (order by da.day)) / lag(da.percentile_80_wps) over (order by da.day) * 100) as percent_change_percentile_80_wps
    from daily_aggregates da
    where da.percentile_80_wps is not null
)
select 
    day, 
    max_wps,
    percentile_80_wps,
    percent_change_percentile_80_wps
from final_aggregates
where previous_percentile_80_wps is not null
order by day;`); */
  return <ClientPage />;
} 
