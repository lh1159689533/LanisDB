use crate::common::{to_json_mysql, Error, Result};
use serde_json::Value as JsonValue;
use sqlx::{mysql::MySqlPool, Column, Pool, Row};
use std::collections::HashMap;
use tauri::{command, State};
use tokio::sync::Mutex;

type Db = sqlx::mysql::MySql;
#[derive(Default)]
pub struct DbInstances(Mutex<HashMap<String, Pool<Db>>>);

#[command]
pub async fn mysql_load(db_instances: State<'_, DbInstances>, url: String) -> Result<bool> {
    let db_path = url.clone();
    // MySql::database_exists(&db_path).await?;

    let mut lock = db_instances.0.lock().await;
    let pool = MySqlPool::connect(&db_path).await?;

    lock.insert(db_path.clone(), pool);

    Ok(true)
}

#[command]
pub async fn mysql_select(
    db_instances: State<'_, DbInstances>,
    url: String,
    query: String,
) -> Result<Vec<HashMap<String, JsonValue>>> {
    let mut instances = db_instances.0.lock().await;
    let db = instances
        .get_mut(&url)
        .ok_or(Error::DatabaseNotLoaded(url))?;
    let query = sqlx::query(&query);
    let rows = query.fetch_all(&*db).await?;

    let mut values = Vec::new();
    for row in rows {
        let mut value = HashMap::default();
        for (i, column) in row.columns().iter().enumerate() {
            let v = row.try_get_raw(i)?;

            let v = to_json_mysql(v)?;

            value.insert(column.name().to_string(), v);
        }

        values.push(value);
    }

    Ok(values)
}

#[command]
pub async fn mysql_execute(
    db_instances: State<'_, DbInstances>,
    url: String,
    query: String,
) -> Result<(u64, u64)> {
    let mut instances = db_instances.0.lock().await;
    let db = instances
        .get_mut(&url)
        .ok_or(Error::DatabaseNotLoaded(url))?;
    let query = sqlx::query(&query);
    let result = query.execute(&*db).await?;
    Ok((result.rows_affected(), result.last_insert_id()))
}

#[command]
pub async fn mysql_close(
    db_instances: State<'_, DbInstances>,
    url: Option<String>,
) -> Result<bool> {
    let mut instances = db_instances.0.lock().await;

    let pools = if let Some(url) = url {
        vec![url]
    } else {
        instances.keys().cloned().collect()
    };

    for pool in pools {
        let db = instances
            .get_mut(&pool) //
            .ok_or(Error::DatabaseNotLoaded(pool))?;
        db.close().await;
    }

    Ok(true)
}
