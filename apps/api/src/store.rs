use std::{collections::HashMap, sync::OnceLock};

use chrono::{DateTime, Utc};
use serde::Serialize;
use tokio::sync::RwLock;

use crate::types::Note;

#[derive(Debug, Clone, Serialize)]
pub struct ActiveNote {
    pub note: Note,
    pub last_saved: DateTime<Utc>,
    pub has_active_sockets: bool,
}

static NOTE_STORE: OnceLock<RwLock<HashMap<String, ActiveNote>>> = OnceLock::new();

pub fn get_note_store() -> &'static RwLock<HashMap<String, ActiveNote>> {
    NOTE_STORE.get_or_init(|| RwLock::new(HashMap::new()))
}
