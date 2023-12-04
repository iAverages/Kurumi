use std::sync::Arc;

use chrono::Utc;
use serde::{Deserialize, Serialize};
use socketioxide::extract::{AckSender, SocketRef};

use crate::{
    store::{get_note_store, ActiveNote},
    types::{AppState, Note},
};

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct JoinLeaveNoteReq {
    pub id: String,
}

pub async fn on_note_join(
    socket: SocketRef,
    sender: AckSender,
    data: JoinLeaveNoteReq,
    app_state: Arc<AppState>,
) {
    tracing::info!("note:join: {:?}", data.id.clone());
    socket.join(data.id.clone()).ok();
    let note = get_active_note(data.id.clone(), app_state).await;

    match note {
        Ok(note) => {
            tracing::info!("note:join: found note");
            sender.send(note.note).ok();
        }
        Err(err) => {
            tracing::error!("note:join: {:?}", err);
        }
    }
}

pub async fn on_note_leave(socket: SocketRef, data: JoinLeaveNoteReq) {
    tracing::info!("note:leave: {:?}", data.id);
    let mut store = get_note_store().write().await;
    let note = store.get(&data.id);

    if let Some(note) = note {
        let note = note.clone();
        store.insert(
            data.id.clone(),
            ActiveNote {
                has_active_sockets: false,
                ..note
            },
        );
    }

    socket.leave(data.id).ok();
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct NoteUpdate {
    pub id: String,
    pub content: String,
}

async fn get_active_note(id: String, state: Arc<AppState>) -> Result<ActiveNote, sqlx::Error> {
    let store = get_note_store().read().await;
    let local_note = store.get(&id);

    if let Some(local_note) = local_note {
        tracing::info!("note:update: found in local store");
        return Ok(local_note.clone());
    }

    let db_note = sqlx::query_as!(Note, "SELECT * FROM notes where id = ?", &id)
        .fetch_one(&state.db)
        .await
        .ok();
    let active_note = db_note.map(|note| ActiveNote {
        note,
        last_saved: Utc::now(),
        has_active_sockets: true,
    });

    if let Some(active_note) = active_note {
        Ok(active_note)
    } else {
        tracing::info!("note:update: note not found in db");
        Err(sqlx::Error::RowNotFound)
    }
}

pub async fn on_note_update(socket: SocketRef, data: NoteUpdate, state: Arc<AppState>) {
    tracing::info!("note:update: {:?}", data.id);

    let note = get_active_note(data.id.clone(), state.clone()).await;

    let note = match note {
        Ok(note) => note,
        Err(err) => {
            tracing::error!("note:update: {:?}", err);
            return;
        }
    };

    tracing::info!("Got active note, last updated at {}", note.last_saved);

    let id = data.id.clone();
    let new_note = data.clone();
    socket
        .within(id.clone())
        .except(socket.id)
        .emit(format!("note:update:{}", id), new_note)
        .ok();

    let note = ActiveNote {
        note: Note {
            id: note.note.id.clone(),
            title: note.note.title.clone(),
            content: data.content,
            created_at: note.note.created_at,
            updated_at: note.note.updated_at,
            user_id: note.note.user_id.clone(),
        },
        last_saved: Utc::now(),
        has_active_sockets: true,
    };

    get_note_store().write().await.insert(id.clone(), note);
    tracing::info!("note:update: {:?}", id);
}
