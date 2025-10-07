import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { IdeaProvider } from "./contexts/IdeaContext.jsx"; // if you have this context

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AuthProvider>
        <IdeaProvider>
          <App />
        </IdeaProvider>
      </AuthProvider>
    </StrictMode>
  );
}



