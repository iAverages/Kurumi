use std::sync::Arc;

use axum::{extract::State, response::IntoResponse, Json};
use reqwest::StatusCode;

use crate::{
    helpers::{create_token_cookies, hash_pass_hex},
    types::{AppState, LoginUser, User},
};

#[axum::debug_handler]
pub async fn post(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LoginUser>,
) -> impl IntoResponse {
    let user = match sqlx::query_as!(User, "SELECT * FROM users WHERE email = ?", &payload.email,)
        .fetch_one(&state.db)
        .await
    {
        Ok(user) => user,
        Err(_) => return (StatusCode::FORBIDDEN, "Unauthorized").into_response(),
    };

    let salt_bytes = hex::decode(&user.password_salt).unwrap();
    let hashed_provided_pass = hash_pass_hex(payload.password.as_bytes(), &salt_bytes);

    if hashed_provided_pass != user.password {
        return (StatusCode::FORBIDDEN, "Unauthorized").into_response();
    }

    let (cookie, refresh_cookie) = create_token_cookies(&user);

    (StatusCode::OK, user).into_response()
}
