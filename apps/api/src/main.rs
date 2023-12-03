pub mod helpers;
pub mod middlewares;
pub mod routes;
pub mod store;
pub mod types;

#[macro_use]
extern crate lazy_static;

use axum::routing::post;
use axum::{middleware, routing::get, Router};
use dotenvy::dotenv;
use socketioxide::extract::{AckSender, Data, SocketRef};
use socketioxide::SocketIo;
use sqlx::mysql::MySqlPoolOptions;
use std::net::SocketAddr;
use std::sync::Arc;
use tower::ServiceBuilder;

use crate::middlewares::{cors::cors_middleware, guard::guard, logger::logger_middleware};
use crate::routes::{login, notes, register, user, websocket};
use crate::types::AppState;

#[tokio::main]
async fn main() {
    dotenv().ok();
    tracing_subscriber::fmt::init();

    let connection_url = std::env::var("DATABASE_URL").expect("DATABASE_URL is not set in .env");

    let pool = MySqlPoolOptions::new()
        .max_connections(5)
        .connect(&connection_url);

    let app_state = Arc::new(AppState {
        db: pool.await.unwrap(),
        reqwest_client: reqwest::Client::new(),
    });

    let (websocket_layer, io) = SocketIo::new_layer();

    let app_state_clone = app_state.clone();

    io.ns("/", move |socket: SocketRef| {
        let app_state = app_state_clone.clone();
        socket.on(
            "note:join",
            |socket: SocketRef, sender: AckSender, Data(data): Data<websocket::JoinNoteReq>| {
                tokio::spawn(websocket::on_note_join(socket, sender, data, app_state));
            },
        );

        let app_state = app_state_clone.clone();
        socket.on(
            "note:update",
            move |socket: SocketRef, Data(data): Data<websocket::NoteUpdate>| {
                tokio::spawn(websocket::on_note_update(socket, data, app_state));
            },
        );
    });

    let app = Router::new()
        .layer(
            ServiceBuilder::new()
                .layer(middleware::from_fn_with_state(app_state.clone(), guard))
                .layer(websocket_layer),
        )
        .route("/dan", get(user::dan))
        .nest(
            "/api/v1",
            Router::new()
                .route("/", get(|| async { "Hello, World!" }))
                .nest(
                    "/auth",
                    Router::new()
                        .route("/login", post(login::post))
                        .route("/register", post(register::post)),
                )
                .nest(
                    "/notes",
                    Router::new()
                        .route("/", get(notes::get_note_list))
                        .layer(middleware::from_fn_with_state(app_state.clone(), guard)),
                )
                .nest(
                    "/user",
                    Router::new()
                        .route("/me", get(user::current_user))
                        .layer(middleware::from_fn_with_state(app_state.clone(), guard)),
                )
                .with_state(app_state),
        )
        .layer(middleware::from_fn(cors_middleware))
        .layer(middleware::from_fn(logger_middleware));

    let address = SocketAddr::from(([127, 0, 0, 1], 3001));
    tracing::info!("listening on {}", address);
    axum::Server::bind(&address)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
