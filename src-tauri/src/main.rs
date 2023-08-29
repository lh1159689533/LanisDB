// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod common;
mod mysql;
mod sqlite;
mod sys_db;

use mysql::{mysql_execute, mysql_load, mysql_select, mysql_close, DbInstances as MySQLDbInstances};
use sqlite::{sqlite_execute, sqlite_load, sqlite_select, sqlite_close, DbInstances as SqliteDbInstances};
use sys_db::{sysdb_execute, sysdb_load, sysdb_select, sys_close, DbInstances as SysDbInstances};

fn main() {
    tauri::Builder::default()
        .manage(SysDbInstances::default())
        .manage(SqliteDbInstances::default())
        .manage(MySQLDbInstances::default())
        .invoke_handler(tauri::generate_handler![
            sysdb_load,
            sysdb_execute,
            sysdb_select,
            sys_close,
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
