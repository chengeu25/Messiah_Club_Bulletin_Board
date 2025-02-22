UPDATE event
SET start_time = DATE_ADD(start_time, INTERVAL 1 WEEK),
    end_time = DATE_ADD(end_time, INTERVAL 1 WEEK);