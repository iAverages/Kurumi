use axum::response::{IntoResponse, Response};
use serde::{Deserialize, Serialize};

pub struct AppState {
    pub db: sqlx::Pool<sqlx::MySql>,
    pub reqwest_client: reqwest::Client,
}

#[derive(Serialize, Deserialize)]
pub struct LoginUser {
    pub email: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct RegisterUser {
    pub name: String,
    pub email: String,
    pub password: String,
}

pub struct NewUser {
    pub name: String,
    pub email: String,
    pub password: String,
    pub password_salt: String,
}

#[derive(sqlx::FromRow, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub name: String,
    pub email: String,
    pub password: String,
    pub password_salt: String,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

impl IntoResponse for User {
    fn into_response(self) -> Response {
        let body = serde_json::to_string(&self).unwrap();
        (axum::http::StatusCode::OK, body).into_response()
    }
}

#[derive(sqlx::FromRow, Serialize, Deserialize, Clone)]
pub struct CurrentUser {
    pub id: String,
    pub name: String,
    pub email: String,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

#[derive(sqlx::FromRow, Serialize, Deserialize)]
pub struct Session {
    pub id: String,
    pub user_id: String,
    pub expires_at: chrono::NaiveDateTime,
    pub created_at: chrono::NaiveDateTime,
}

#[derive(sqlx::FromRow, Serialize, Deserialize, Debug, Clone)]
pub struct Note {
    pub id: String,
    pub user_id: String,
    pub title: String,
    pub content: String,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}
