use axum::{
    http::{HeaderMap, HeaderValue, Request},
    middleware::Next,
    response::{IntoResponse, Response},
};
use regex::Regex;
use reqwest::{
    header::{
        ACCESS_CONTROL_ALLOW_CREDENTIALS, ACCESS_CONTROL_ALLOW_HEADERS,
        ACCESS_CONTROL_ALLOW_METHODS, ACCESS_CONTROL_ALLOW_ORIGIN, ACCESS_CONTROL_REQUEST_HEADERS,
        CONTENT_LENGTH, ORIGIN, VARY,
    },
    Method, StatusCode,
};

pub async fn cors_middleware<T: std::fmt::Debug>(
    request: Request<T>,
    next: Next<T>,
) -> Result<Response, StatusCode> {
    lazy_static! {
        static ref LOCALHOST_RE: Regex =
            Regex::new(r"(localhost\:([0-9]{4}))").expect("valid localhost regex");
    }

    let origin_value = match request.headers().get(ORIGIN) {
        Some(value) => value.clone(),
        None => return Err(StatusCode::FORBIDDEN),
    };

    let origin = origin_value
        .to_str()
        .expect("origin header should be a string");

    if LOCALHOST_RE.is_match(origin)
        || origin.starts_with("https://chat.abbyani.com")
        || origin.starts_with("https://tauri.localhost")
    {
        let response = match request.method() == Method::OPTIONS {
            true => None,
            false => Some(next.run(request).await),
        };

        return Ok(match response {
            None => {
                let mut headers = HeaderMap::new();
                add_cors_headers(&mut headers, origin_value, true);
                (StatusCode::NO_CONTENT, headers.clone()).into_response()
            }
            Some(mut res) => {
                add_cors_headers(res.headers_mut(), origin_value, false);
                res
            }
        });
    }

    Err(StatusCode::FORBIDDEN)
}

fn add_cors_headers(
    headers: &mut HeaderMap,
    origin_value: HeaderValue,
    is_option: bool,
) -> &mut HeaderMap {
    headers.insert(
        ACCESS_CONTROL_ALLOW_CREDENTIALS,
        HeaderValue::from_static("true"),
    );
    headers.insert(ACCESS_CONTROL_ALLOW_ORIGIN, origin_value);
    headers.insert(
        ACCESS_CONTROL_ALLOW_HEADERS,
        headers
            .get(ACCESS_CONTROL_REQUEST_HEADERS)
            .unwrap_or(&HeaderValue::from_static("content-type"))
            .clone(),
    );
    headers.insert(
        VARY,
        HeaderValue::from_str(&[ORIGIN, ACCESS_CONTROL_ALLOW_HEADERS].join(","))
            .expect("valid header value"),
    );

    if is_option {
        headers.insert(CONTENT_LENGTH, HeaderValue::from_static("0"));
        headers.insert(
            ACCESS_CONTROL_ALLOW_METHODS,
            HeaderValue::from_static("GET,HEAD,PUT,PATCH,POST,DELETE"),
        );
    }

    headers
}
