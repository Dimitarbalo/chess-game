import React, { useState } from "react";
import "./startingPage-style.css";

const StartingPage = ({ onStartGame }) => {
    const [selectedMode, setSelectedMode] = useState("");
    const [selectedColor, setSelectedColor] = useState("");

    const handleModeSelection = (mode) => {
        setSelectedMode(mode);
    };

    const handleColorSelection = (color) => {
        setSelectedColor(color);
    };

    const handleStartGame = () => {
        if (selectedMode && selectedColor) {
            onStartGame(selectedMode, selectedColor);
        }
    };

    return (
        <div className="start-page">
            <h1 style={{ marginTop: "-200px", fontSize: "50px", color:"black" }}>
                Choose your color and mode to play with
            </h1>
            <div>
                <button
                    className={`button-color ${
                        selectedMode === "PvP" ? "selected-mode" : ""
                    }`}
                    onClick={() => handleModeSelection("PvP")}
                style={{fontWeight:"bold"}}
                >
                    Player vs Player
                </button>
                <button
                    className={`button-color ${
                        selectedMode === "PvC" ? "selected-mode" : ""
                    }`}
                    onClick={() => handleModeSelection("PvC")}
                    style={{fontWeight:"bold"}}
                >
                    Player vs Computer
                </button>
                <br />
                <button
                    className={`button-color ${
                        selectedColor === "black" ? "selected-color" : ""
                    }`}
                    onClick={() => handleColorSelection("black")}
                    style={{fontWeight:"bold"}}
                >
                    Black
                </button>
                <button
                    className={`button-color ${
                        selectedColor === "white" ? "selected-color" : ""
                    }`}
                    onClick={() => handleColorSelection("white")}
                    style={{fontWeight:"bold"}}
                >
                    White
                </button>
                <br />
                <img
                    style={{ marginRight: "50px", marginLeft: "20px" }}
                    src={"pieces\\pawn_black.png"}
                    alt="Black Pawn"
                />
                <img
                    style={{ marginLeft: "30px" }}
                    src={"pieces\\pawn_white.png"}
                    alt="White Pawn"
                />
                <br />
                <button
                    className="start-button"
                    onClick={handleStartGame}
                    disabled={!selectedMode || !selectedColor}
                >
                    Start Game
                </button>
            </div>
        </div>
    );
};

export default StartingPage;