use std::sync::Arc;

use nrzrepo_ui::wui::{event::WebUIEvent, query::SharedState};

use crate::{query, run::Run};

pub async fn start_web_ui_server(
    rx: tokio::sync::mpsc::UnboundedReceiver<WebUIEvent>,
    run: Arc<Run>,
) -> Result<(), nrzrepo_ui::Error> {
    let state = SharedState::default();
    let subscriber = nrzrepo_ui::wui::subscriber::Subscriber::new(rx);
    tokio::spawn(subscriber.watch(state.clone()));

    query::run_server(Some(state.clone()), run).await?;

    Ok(())
}
