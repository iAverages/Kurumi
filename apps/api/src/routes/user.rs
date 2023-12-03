use std::collections::HashMap;

use crate::{helpers::json_response, store::get_note_store, types::CurrentUser};
use axum::{response::IntoResponse, Extension, Json};
use reqwest::StatusCode;
use serde::Serialize;
use serde_json::json;

#[axum::debug_handler]
pub async fn current_user(Extension(user): Extension<CurrentUser>) -> impl IntoResponse {
    json_response!(StatusCode::OK, { "user": user })
}

#[derive(Serialize)]
struct ActiveNotesResponse {
    notes: HashMap<String, crate::store::ActiveNote>,
}

#[axum::debug_handler]
pub async fn dan() -> impl IntoResponse {
    let a = get_note_store().read().await;
    // let b = a.clone();
    // ActiveNotesResponse { notes: a }

    json_response!(StatusCode::OK, { "notes": *a })
}
