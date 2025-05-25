// Инициализация Telegram Web App API
window.Telegram = window.Telegram || {};
Telegram.WebApp = Telegram.WebApp || {};

window.addEventListener("DOMContentLoaded", () => {
  if (Telegram.WebApp && Telegram.WebApp.ready) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();

    Telegram.WebApp.MainButton.setText("Завершить ход");
    Telegram.WebApp.MainButton.show();

    Telegram.WebApp.MainButton.onClick(() => {
      if (typeof endTurn === "function") endTurn();
    });
  }
});
