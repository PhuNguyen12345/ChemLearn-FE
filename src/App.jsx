
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import VirtualLab from "./pages/VirtualLab";
import AdvancedVirtualLab from "./pages/AdvancedVirtualLab";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/lab1"
            element={<VirtualLab></VirtualLab>}
          ></Route>
          <Route
            path="/lab2"
            element={<AdvancedVirtualLab></AdvancedVirtualLab>}
          ></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
