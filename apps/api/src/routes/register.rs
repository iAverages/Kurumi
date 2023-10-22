use std::sync::Arc;

use axum::{extract::State, response::IntoResponse, Json};
use rand::{rngs::StdRng, RngCore, SeedableRng};
use reqwest::StatusCode;

use crate::{
    helpers::hash_pass_hex,
    types::{AppState, RegisterUser},
};

#[axum::debug_handler]
pub async fn post(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<RegisterUser>,
) -> impl IntoResponse {
    let mut salt = [0u8; 32];
    StdRng::from_entropy().fill_bytes(&mut salt);

    let hashed_password = hash_pass_hex(payload.password.as_bytes(), &salt);
    let salt = hex::encode(salt);

    let res = sqlx::query!(
        "INSERT INTO users (id, name, email, password, password_salt) VALUES (?, ?, ?, ?, ?)",
        uuid::Uuid::new_v4().to_string(),
        payload.name,
        payload.email,
        hashed_password,
        salt,
    )
    .execute(&state.db)
    .await;

    match res {
        Ok(_) => (StatusCode::OK, "User created successfully").into_response(),
        Err(err) => err
            .as_database_error()
            .map(|err| {
                if err.is_unique_violation() {
                    return (StatusCode::CONFLICT, "User already exists").into_response();
                }

                tracing::error!("Error creating user: {:?}", err);
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error").into_response()
            })
            .unwrap_or_else(|| {
                tracing::error!("Error creating user: {:?}", err);
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error").into_response()
            }),
    }
}
