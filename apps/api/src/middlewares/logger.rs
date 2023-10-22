use axum::{http::Request, middleware::Next, response::Response};
use reqwest::StatusCode;

pub async fn logger_middleware<T: std::fmt::Debug>(
    request: Request<T>,
    next: Next<T>,
) -> Result<Response, StatusCode> {
    tracing::info!(
        r#"{} {} {:?}"#,
        request.method(),
        request.uri().path(),
        request.version(),
    );
    Ok(next.run(request).await)
}
