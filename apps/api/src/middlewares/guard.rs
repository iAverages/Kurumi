use std::sync::Arc;

use axum::{extract::State, http::Request, middleware::Next, response::Response};
use axum_extra::extract::CookieJar;
use reqwest::StatusCode;

use crate::types::{AppState, CurrentUser, Session, User};

pub async fn guard<T: std::fmt::Debug>(
    State(state): State<Arc<AppState>>,
    jar: CookieJar,
    mut request: Request<T>,
    next: Next<T>,
) -> Result<Response, StatusCode> {
    // let token = request
    //     .headers()
    //     .get(header::AUTHORIZATION)
    //     .and_then(|value| value.to_str().ok());
    let token = jar.get("token").map(|cookie| cookie.value());

    tracing::debug!("Token: {:?}", token);

    if token.is_none() {
        return Err(StatusCode::UNAUTHORIZED);
    }

    let session = match sqlx::query_as!(Session, "SELECT * FROM sessions WHERE id = ?", token)
        .fetch_one(&state.db)
        .await
    {
        Ok(user) => user,
        Err(_) => return Err(StatusCode::UNAUTHORIZED),
    };

    let user = match sqlx::query_as!(User, "SELECT * FROM users WHERE id = ?", session.user_id,)
        .fetch_one(&state.db)
        .await
    {
        Ok(user) => user,
        Err(_) => return Err(StatusCode::UNAUTHORIZED),
    };

    request.extensions_mut().insert(CurrentUser {
        id: session.user_id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
    });

    Ok(next.run(request).await)
}
