use std::sync::Arc;

use crate::types::{AppState, Note};
use crate::{helpers::json_response, types::CurrentUser};
use axum::extract::State;
use axum::{response::IntoResponse, Extension, Json};
use reqwest::StatusCode;
use serde_json::json;

#[axum::debug_handler]
pub async fn get_note_list(
    State(state): State<Arc<AppState>>,
    Extension(user): Extension<CurrentUser>,
) -> impl IntoResponse {
    let notes = match sqlx::query_as!(Note, "SELECT * FROM notes where user_id = ?", &user.id,)
        .fetch_all(&state.db)
        .await
    {
        Ok(notes) => notes,
        Err(err) => {
            tracing::error!("Error fetching nodes: {:?}", err);
            return json_response!(StatusCode::FORBIDDEN, {"message":"Failed to fetch nodes"});
        }
    };
    json_response!(StatusCode::OK, { "notes": notes })
}

// #[axum::debug_handler]
// pub async fn update_node(
//     State(state): State<Arc<AppState>>,
//     Extension(user): Extension<CurrentUser>,
// ) -> impl IntoResponse {
// }
