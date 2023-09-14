import React, { useState } from "react";
import "./App.css";
import Chessgame from "../../chess/src/components/Chessgame";
import StartingPage from "./components/StartingPage";

function App() {
  const [playerColor, setPlayerColor] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState("");
  const [computerColor, setComputerColor] = useState(""); // New state for computer color

  const onSelectColor = (mode, color) => {
    setGameMode(mode);
    setPlayerColor(color);
    setComputerColor(color === "white" ? "black" : "white"); // Set computer's color based on player's choice
    setGameStarted(true);
  };

  return (
      <div id="app">
        {playerColor ? (
            <Chessgame
                gameMode={gameMode}
                computerColor={computerColor} // Pass computer's color to Chessgame
            />
        ) : (
            <StartingPage onStartGame={onSelectColor} />
        )}
      </div>
  );
}

export default App;
