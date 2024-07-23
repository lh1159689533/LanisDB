// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod common;
mod mysql;
mod sqlite;

use mysql::{mysql_execute, mysql_load, mysql_select, mysql_close, DbInstances as MySQLDbInstances};
use sqlite::{sqlite_execute, sqlite_load, sqlite_select, sqlite_close, DbInstances as SqliteDbInstances};

fn main() {
    tauri::Builder::default()
        .manage(SqliteDbInstances::default())
        .manage(MySQLDbInstances::default())
        .invoke_handler(tauri::generate_handler![
            sqlite_load,
            sqlite_select,
            sqlite_execute,
            sqlite_close,
            mysql_load,
            mysql_select,
            mysql_execute,
            mysql_close
            // 系统本身db操作
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
