use std::sync::Arc;

use crate::{
    helpers::{create_session, hash_pass_hex, json_response},
    types::{AppState, LoginUser, User},
};
use axum::{extract::State, http::HeaderValue, response::IntoResponse, Json};
use reqwest::{header::SET_COOKIE, StatusCode};
use serde_json::json;

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
        Err(_) => {
            return json_response!(StatusCode::FORBIDDEN, {"message":"Invalid username or password"})
        }
    };

    let salt_bytes = hex::decode(&user.password_salt).unwrap();
    let hashed_provided_pass = hash_pass_hex(payload.password.as_bytes(), &salt_bytes);

    if hashed_provided_pass != user.password {
        return json_response!(StatusCode::FORBIDDEN, {"message":"Invalid username or password"});
    }

    let cookie_res = create_session(state, &user).await;

    if cookie_res.is_err() {
        tracing::error!("Failed to create session for user {}", &user.id);
        return json_response!(StatusCode::INTERNAL_SERVER_ERROR, {"message":"Internal Server Error"});
    }

    let cookie = cookie_res.unwrap();

    let mut response = json_response!(StatusCode::OK, {"message":"User logged in successfully"});

    let headers = response.headers_mut();

    headers.append(
        SET_COOKIE,
        HeaderValue::from_str(&cookie.to_string()).unwrap(),
    );

    response
}
