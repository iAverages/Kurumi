pub mod helpers;
pub mod middlewares;
pub mod routes;
pub mod store;
pub mod types;

#[macro_use]
extern crate lazy_static;

use axum::routing::post;
use axum::{middleware, routing::get, Router};
use chrono::Utc;
use dotenvy::dotenv;
use socketioxide::extract::{AckSender, Data, SocketRef};
use socketioxide::SocketIo;
use sqlx::mysql::MySqlPoolOptions;
use std::net::SocketAddr;
use std::sync::Arc;
use tower::ServiceBuilder;

use crate::middlewares::{cors::cors_middleware, guard::guard, logger::logger_middleware};
use crate::routes::{login, notes, register, user, websocket};
use crate::store::ActiveNote;
use crate::types::AppState;

async fn note_save_loop(app_state: Arc<AppState>) {
    loop {
        tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
        let mut store = store::get_note_store().write().await;
        let store_mut = store.clone();

        for (id, note) in store_mut.iter() {
            let now = Utc::now();
            let diff = now - note.last_saved;
            if diff.num_seconds() > 5 || !note.has_active_sockets {
                tracing::info!("Saving note: {:?}", id.clone());
                let last_saved = chrono::Utc::now();
                sqlx::query!(
                    "UPDATE notes SET content = ? WHERE id = ?",
                    note.note.content,
                    note.note.id
                )
                .execute(&app_state.db)
                .await
                .unwrap();

                store.insert(
                    id.clone(),
                    ActiveNote {
                        note: note.note.clone(),
                        last_saved,
                        has_active_sockets: true,
                    },
                );
            }

            if !note.has_active_sockets {
                tracing::info!(
                    "No clients listening for {:?}, removing from store...",
                    id.clone()
                );
                store.remove(id);
            }
        }
    }
}

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

    tokio::spawn(note_save_loop(app_state.clone()));

    let app_state_clone = app_state.clone();

    io.ns("/", move |socket: SocketRef| {
        let app_state = app_state_clone.clone();
        socket.on(
            "note:join",
            |socket: SocketRef,
             sender: AckSender,
             Data(data): Data<websocket::JoinLeaveNoteReq>| {
                tokio::spawn(websocket::on_note_join(socket, sender, data, app_state));
            },
        );

        socket.on(
            "note:leave",
            |socket: SocketRef, Data(data): Data<websocket::JoinLeaveNoteReq>| {
                tokio::spawn(websocket::on_note_leave(socket, data));
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
