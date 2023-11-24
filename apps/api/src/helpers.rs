use std::{fmt::Error, sync::Arc};

use crate::types::{AppState, User};
use axum_extra::extract::cookie::{Cookie, SameSite};
use chrono::Utc;
use rand::{rngs::StdRng, RngCore, SeedableRng};
use time;

pub fn hash_pass_hex(pass: &[u8], salt: &[u8]) -> String {
    let mut hashed_pass = [0u8; 64];
    pbkdf2::pbkdf2_hmac::<sha2::Sha256>(pass, salt, 4096, &mut hashed_pass);
    hex::encode(hashed_pass)
}

pub async fn create_session(state: Arc<AppState>, user: &User) -> Result<Cookie, Error> {
    let expiration = Utc::now()
        .checked_add_signed(chrono::Duration::days(30))
        .expect("valid timestamp");

    let mut token_str = [0u8; 5];
    StdRng::from_entropy().fill_bytes(&mut token_str);
    let token = hex::encode(token_str);

    let cookie = Cookie::build("token", token.clone())
        .path("/")
        .expires(
            time::OffsetDateTime::from_unix_timestamp(expiration.timestamp())
                .expect("valid timestamp"),
        )
        .max_age(time::Duration::days(30))
        .http_only(true)
        .secure(true)
        .same_site(SameSite::None)
        .finish();

    let res = sqlx::query!(
        "INSERT INTO sessions (user_id, id, expires_at) VALUES (?, ?, ?)",
        user.id,
        token,
        expiration
    )
    .execute(&state.db)
    .await;

    match res {
        Ok(_) => Ok(cookie),
        Err(err) => {
            tracing::error!("Error creating session: {:?}", err);
            Err(Error)
        }
    }
}

macro_rules! json_response {
    ($status:expr , $json:tt) => {
        ($status, Json(json!($json))).into_response()
    };
}

pub(crate) use json_response;
