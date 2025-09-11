import { BrowserRouter } from "react-router-dom";
import "./index.css";
import AppRouter from "../routers";

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
