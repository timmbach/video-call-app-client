// import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CreateRoom from "./routes/CreateRoom";
import Room from "./routes/Room";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" exact element={<CreateRoom />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
