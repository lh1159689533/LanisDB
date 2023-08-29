use crate::common::{to_json, Error, Result};
use serde_json::Value as JsonValue;
use sqlx::{migrate::MigrateDatabase, sqlite::SqlitePool, Column, Pool, Row, Sqlite};
use std::collections::HashMap;
use tauri::{command, State};
use tokio::sync::Mutex;

type Db = sqlx::sqlite::Sqlite;

#[derive(Default)]
pub struct DbInstances(Mutex<Vec<Pool<Db>>>);

// fn app_path<R: Runtime>(app: &AppHandle<R>) -> PathBuf {
//     #[allow(deprecated)]
//     app.path_resolver()
//         .app_local_data_dir()
//         .expect("No App path was found!")
// }

// fn path_mapper(mut app_path: PathBuf, connection_string: &str) -> String {
//     app_path.push(
//         connection_string
//             .split_once(':')
//             .expect("Couldn't parse the connection string for DB!")
//             .1,
//     );

//     format!(
//         "sqlite:{}",
//         app_path
//             .to_str()
//             .expect("Problem creating fully qualified path to Database file!")
//     )
// }

// fn get_dburl() -> String {
//     String::from("../db/sys.db")
// }

#[command]
pub async fn sysdb_load(
    db_instances: State<'_, DbInstances>,
    url: String,
    // app: AppHandle<R>,
) -> Result<bool> {
    // let db_path = path_mapper(app_path(&app), &url);
    let db_path = url.clone();
    if !Sqlite::database_exists(&db_path).await.unwrap_or(false) {
        Sqlite::create_database(&db_path).await?;
    }

    let mut lock = db_instances.0.lock().await;
    let pool = SqlitePool::connect(&db_path).await?;

    lock.push(pool);
    // lock.insert(db_path.clone(), pool);

    Ok(true)
}

#[command]
pub async fn sysdb_select(
    db_instances: State<'_, DbInstances>,
    query: String,
) -> Result<Vec<HashMap<String, JsonValue>>> {
    let mut instances = db_instances.0.lock().await;
    let db = instances
        .get_mut(0)
        .ok_or(Error::DatabaseNotLoaded(String::from("sysdb")))?;
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
pub async fn sysdb_execute(
    db_instances: State<'_, DbInstances>,
    query: String,
) -> Result<(u64, i64)> {
    let mut instances = db_instances.0.lock().await;
    let db = instances
        .get_mut(0)
        .ok_or(Error::DatabaseNotLoaded(String::from("sysdb")))?;
    let query = sqlx::query(&query);
    let result = query.execute(&*db).await?;
    Ok((result.rows_affected(), result.last_insert_rowid()))
}

#[command]
pub async fn sys_close(db_instances: State<'_, DbInstances>) -> Result<bool> {
    let mut instances = db_instances.0.lock().await;

    let db = instances
        .get_mut(0) //
        .ok_or(Error::DatabaseNotLoaded(String::from("sysdb")))?;
    db.close().await;

    Ok(true)
}
