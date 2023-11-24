use crate::{helpers::json_response, types::CurrentUser};
use axum::{response::IntoResponse, Extension, Json};
use reqwest::StatusCode;
use serde_json::json;

#[axum::debug_handler]
pub async fn current_user(Extension(user): Extension<CurrentUser>) -> impl IntoResponse {
    json_response!(StatusCode::OK, { "user": user })
}
