use serde_json::Value;
use socketioxide::{adapter::LocalAdapter, layer::SocketIoLayer, SocketIo};

pub async fn create_websocket_handler(
) -> Result<SocketIoLayer<LocalAdapter>, Box<dyn std::error::Error>> {
    tracing::info!("creating websocket handler");
    let (layer, io) = SocketIo::new_layer();

    io.ns("/", |socket, _: Value| async move {
        socket.emit("hello", "world").ok();

        socket.on("note:join", |_, data: Value, bin, ack| async move {
            tracing::info!("note:join: {:?}", data);
            ack.bin(bin).send("").ok();
        });
    });

    Ok(layer)
}
