import React, { useState } from "react";
import "./App.css";
import Chessgame from "./components/Chessgame";
import StartingPage from "./components/StartingPage";

function App() {
  const [playerColor, setPlayerColor] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState("");
  const [computerColor, setComputerColor] = useState("");

  const onSelectColor = (mode, color) => {
    setGameMode(mode);
    setPlayerColor(color);
    setComputerColor(color === "white" ? "black" : "white");
    setGameStarted(true);
  };

  return (
      <div id="app">
        {playerColor ? (
            <Chessgame
                gameMode={gameMode}
                computerColor={computerColor}
            />
        ) : (
            <StartingPage onStartGame={onSelectColor} />
        )}
      </div>
  );
}

export default App;
