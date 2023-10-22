use axum_extra::extract::cookie::{Cookie, SameSite};
use chrono::Utc;

use crate::types::User;

pub fn hash_pass_hex(pass: &[u8], salt: &[u8]) -> String {
    let mut hashed_pass = [0u8; 64];
    pbkdf2::pbkdf2_hmac::<sha2::Sha256>(pass, &salt, 4096, &mut hashed_pass);
    hex::encode(hashed_pass)
}

pub fn create_token_cookies(current_user: &User) -> (Cookie, Cookie) {
    let token_expiration = Utc::now()
        .checked_add_signed(chrono::Duration::minutes(5))
        .expect("valid timestamp")
        .timestamp();

    let expiration = Utc::now()
        .checked_add_signed(chrono::Duration::days(7))
        .expect("valid timestamp")
        .timestamp();

    let token_claims = TokenClaims {
        user_id: current_user.id,
        username: current_user.username.clone(),
        password: current_user.password.clone(),
        exp: token_expiration as usize,
    };

    let claims = TokenClaims {
        user_id: current_user.id,
        username: current_user.username.clone(),
        password: current_user.password.clone(),
        exp: expiration as usize,
    };

    let header = Header::new(Algorithm::HS512);
    let token = encode(
        &header,
        &token_claims,
        &EncodingKey::from_secret(b"pepesmol"),
    )
    .unwrap();
    let refresh_token = encode(&header, &claims, &EncodingKey::from_secret(b"pepesmol")).unwrap();

    let cookie = Cookie::build("token", token)
        .path("/")
        // .expires(OffsetDateTime::from_unix_timestamp(token_expiration).expect("valid timestamp"))
        .max_age(time::Duration::minutes(5))
        .http_only(true)
        .secure(true)
        .same_site(SameSite::None)
        .finish();

    let refresh_cookie = Cookie::build("refreshToken", refresh_token)
        .path("/")
        // .expires(OffsetDateTime::from_unix_timestamp(expiration).expect("valid timestamp"))
        .max_age(time::Duration::days(7))
        .http_only(true)
        .secure(true)
        .same_site(SameSite::None)
        .finish();

    (cookie, refresh_cookie)
}
