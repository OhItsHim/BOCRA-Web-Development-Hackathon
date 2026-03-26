use deadpool_redis::Pool as RedisPool;
use redis::AsyncCommands;

pub async fn check_rate_limit(
    redis: &RedisPool,
    key: &str,
    max_requests: u64,
    window_secs: u64,
) -> Result<bool, anyhow::Error> {
    let mut conn = redis.get().await?;
    let count: u64 = conn.incr(key, 1u64).await.unwrap_or(1);
    if count == 1 {
        let _: () = conn.expire(key, window_secs as i64).await.unwrap_or(());
    }
    Ok(count <= max_requests)
}
