"use client";

import "./globals.css";
import { Provider } from "react-redux";
import store from "../../redux/store.js";
import DndWrapper from "./dnd-provider.jsx";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <DndWrapper>
            {children}
          </DndWrapper>
        </Provider>
      </body>
    </html>
  );
}
