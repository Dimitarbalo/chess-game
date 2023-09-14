import React from "react";
import "./tile-style.css";

const Tile = ({ number, image, isSelected, onClick }) => {
    const tileStyle = {
        boxShadow: isSelected ? "inset 0 0 0 2px yellow" : "none",
    };

    if (number % 2 === 0) {
        return (
            <div className="tile brown-tile" style={tileStyle} onClick={onClick}>
                {image && (
                    <div
                        className="chess-piece"
                        style={{ backgroundImage: `url(${image})` }}
                    ></div>
                )}
            </div>
        );
    } else {
        return (
            <div className="tile gray-tile" style={tileStyle} onClick={onClick}>
                {image && (
                    <div
                        className="chess-piece"
                        style={{ backgroundImage: `url(${image})` }}
                    ></div>
                )}
            </div>
        );
    }
};

export default Tile;
