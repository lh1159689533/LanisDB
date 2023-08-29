use crate::common::{to_json, Error, Result};
use serde_json::Value as JsonValue;
use sqlx::{migrate::MigrateDatabase, sqlite::SqlitePool, Column, Pool, Row, Sqlite};
use std::collections::HashMap;
// use std::path::PathBuf;
use tauri::{command, State};
use tokio::sync::Mutex;

type Db = sqlx::sqlite::Sqlite;

#[derive(Default)]
pub struct DbInstances(Mutex<HashMap<String, Pool<Db>>>);

#[command]
pub async fn sqlite_load(
    db_instances: State<'_, DbInstances>,
    url: String,
) -> Result<bool> {
    let db_path = url.clone();
    Sqlite::database_exists(&db_path).await?;

    let mut lock = db_instances.0.lock().await;
    let pool = SqlitePool::connect(&db_path).await?;

    lock.insert(db_path.clone(), pool);

    Ok(true)
}

#[command]
pub async fn sqlite_select(
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

            let v = to_json(v)?;

            value.insert(column.name().to_string(), v);
        }

        values.push(value);
    }

    Ok(values)
}

#[command]
pub async fn sqlite_execute(
    db_instances: State<'_, DbInstances>,
    url: String,
    query: String,
) -> Result<(u64, i64)> {
    let mut instances = db_instances.0.lock().await;
    let db = instances
        .get_mut(&url)
        .ok_or(Error::DatabaseNotLoaded(url))?;
    let query = sqlx::query(&query);
    let result = query.execute(&*db).await?;
    Ok((result.rows_affected(), result.last_insert_rowid()))
}

#[command]
pub async fn sqlite_close(db_instances: State<'_, DbInstances>, url: Option<String>) -> Result<bool> {
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

// pub async fn executes(
//     db_instances: State<'_, DbInstances>,
//     url: String,
//     query: String,
// ) -> Result<Either<SqliteQueryResult, SqliteRow>> {
//     let mut instances = db_instances.0.lock().await;
//     let db = instances
//         .get_mut(&url)
//         .ok_or(Error::DatabaseNotLoaded(url))?;
//     let query = sqlx::query(&query);
//     let result = query.fetch_many(&*db).await?;
//     result.try_into()
//     //   match result {
//     //     Either::Left(res) => res,
//     //     Either::Right(r) => r
//     //   }
// }
