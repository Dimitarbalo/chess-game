import React, {useState} from "react";
import './chessgame-style.css';
import Tile from "./Tile";
import StartingPage from "./StartingPage";

const horizontalAxis = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const verticalAxis = ['1', '2', '3', '4', '5', '6', '7', '8'];

const pieces = [];
for(let p=0 ; p<2; p++){
    const type = (p === 0 ? "black" : "white");
    const y = (p === 0 ? 7 : 0);

    pieces.push({image:`pieces/rook_${type}.png`,horizontalAxis:0,verticalAxis:y});
    pieces.push({image: `pieces/knight_${type}.png`,horizontalAxis:1,verticalAxis:y});
    pieces.push({image:`pieces/bishop_${type}.png`,horizontalAxis:2,verticalAxis:y});
    pieces.push({image:`pieces/queen_${type}.png`,horizontalAxis:3,verticalAxis:y});
    pieces.push({image:`pieces/king_${type}.png`,horizontalAxis:4,verticalAxis:y});
    pieces.push({image:`pieces/bishop_${type}.png`,horizontalAxis:5,verticalAxis:y});
    pieces.push({image:`pieces/knight_${type}.png`,horizontalAxis:6,verticalAxis:y});
    pieces.push({image:`pieces/rook_${type}.png`,horizontalAxis:7,verticalAxis:y});
}

for(let i=0;i<8;i++){
    pieces.push({image:'pieces/pawn_black.png',horizontalAxis:i,verticalAxis:6})
}
for(let i=0;i<8;i++){
    pieces.push({image:'pieces/pawn_white.png',horizontalAxis:i,verticalAxis:1})
}

const Chessgame = ({gameMode, computerColor}) => {
    const [currentPlayer, setCurrentPlayer] = useState("white");
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [checkmate, setCheckmate] = useState(false);
    const [resetGame, setResetGame] = useState(false);
    const [playerColor, setPlayerColor] = useState(null);
    const [playerVsComputer, setPlayerVsComputer] = useState(false);

    const togglePlayerVsComputer = () => {
        setPlayerVsComputer(prevState => !prevState);
    };

    const isPawnMoveValid = (startH, startV, endH, endV) => {
        const dy = endV - startV;
        const dx = Math.abs(endH - startH);

        if (currentPlayer === "white") {
            if (dy === 1 && dx === 1 && pieces.some(p => p.horizontalAxis === endH && p.verticalAxis === endV && p.image.includes("black"))) {
                // Valid move to capture opponent's piece diagonally
                return true;
            } else if (dy === 1 && dx === 0 && !pieces.some(p => p.horizontalAxis === endH && p.verticalAxis === endV)) {
                // Valid move to move one square forward
                return true;
            } else if (dy === 2 && dx === 0 && startV === 1 &&  !pieces.some(p => p.horizontalAxis === endH && p.verticalAxis === endV)) {
                // Valid initial move of two squares forward
                return true;
            }
        } else if (currentPlayer === "black") {
            if (dy === -1 && dx === 1 && pieces.some(p => p.horizontalAxis === endH && p.verticalAxis === endV && p.image.includes("white"))) {
                // Valid move to capture opponent's piece diagonally
                return true;
            } else if (dy === -1 && dx === 0 && !pieces.some(p => p.horizontalAxis === endH && p.verticalAxis === endV)) {
                // Valid move to move one square forward
                return true;
            } else if (dy === -2 && dx === 0 && startV === 6 && !pieces.some(p => p.horizontalAxis === endH && p.verticalAxis === endV)) {
                // Valid initial move of two squares forward
                return true;
            }
        }
        return false;
    };

    const isRookMoveValid = (startH, startV, endH, endV) => {
        const dy = Math.abs(endV - startV);
        const dx = Math.abs(endH - startH);

        if ((dx === 0 && dy > 0) || (dx > 0 && dy === 0)) {
            const rowIncrement = Math.sign(endV - startV);
            const colIncrement = Math.sign(endH - startH);

            let currentRow = startV + rowIncrement;
            let currentCol = startH + colIncrement;

            while (currentRow !== endV || currentCol !== endH) {
                if (pieces.some(p => p.horizontalAxis === currentCol && p.verticalAxis === currentRow)) {
                    return false; // There's a piece blocking the path
                }
                currentRow += rowIncrement;
                currentCol += colIncrement;
            }
            if (pieces.some(p => p.horizontalAxis === endH && p.verticalAxis === endV && p.image.includes(currentPlayer))) {
                return false;
            }
            return true;
        }
        return false;
    };
    const isKnightMoveValid = (startH, startV, endH, endV, playerColor) => {
        const dy = Math.abs(endV - startV);
        const dx = Math.abs(endH - startH);
        // Knight's movement pattern: 2 squares in one direction and 1 square in the other
        if ((dx === 1 && dy === 2) || (dx === 2 && dy === 1)) {
            const pieceAtDestination = pieces.find(p => p.horizontalAxis === endH && p.verticalAxis === endV);
            // Check if the destination square is empty or has an opponent's piece
            if (!pieceAtDestination || (!pieceAtDestination.image.includes(currentPlayer) && !pieceAtDestination.image.includes(playerColor))) {
                return true;
            }
        }
        return false;
    };
    const isBishopMoveValid = (startH, startV, endH, endV) => {
        const dy = Math.abs(endV - startV);
        const dx = Math.abs(endH - startH);
        // Check if the bishop's movement is diagonal and clear (no pieces in the way)
        if (dx === dy) {
            const rowIncrement = endV > startV ? 1 : -1;
            const colIncrement = endH > startH ? 1 : -1;

            let currentRow = startV + rowIncrement;
            let currentCol = startH + colIncrement;

            while (currentRow !== endV && currentCol !== endH) {
                if (pieces.some(p => p.horizontalAxis === currentCol && p.verticalAxis === currentRow)) {
                    return false; // There's a piece in the way
                }
                currentRow += rowIncrement;
                currentCol += colIncrement;
            }

            const pieceAtDestination = pieces.find(p => p.horizontalAxis === endH && p.verticalAxis === endV);
            if (!pieceAtDestination || !pieceAtDestination.image.includes(currentPlayer)) {
                return true;
            }
        }

        return false;
    };
    const isQueenMoveValid = (startH, startV, endH, endV) => {
        const dx = Math.abs(endH - startH);
        const dy = Math.abs(endV - startV);
        // Queen can move like a rook (horizontally or vertically) or a bishop (diagonally)
        if ((dx === 0 || dy === 0) || (dx === dy)) {
            return isRookMoveValid(startH, startV, endH, endV) || isBishopMoveValid(startH, startV, endH, endV);
        }
        return false;
    };
    // Function to check if the king is in check after a piece is captured
    const isKingInCheckAfterCapture = (playerColor, pieces, kingH, kingV) => {
        const tempPieces = pieces.map(piece => ({ ...piece })); // Deep clone using spread syntax

        const kingIndex = tempPieces.findIndex(p => p && p.image === `king_${playerColor}`);
        if (kingIndex !== -1) {
            const king = tempPieces[kingIndex];
            king.horizontalAxis = null;
            king.verticalAxis = null;
            return isKingInCheck(playerColor, tempPieces, kingH, kingV);
        }
        return false;
    };

    const isKingMoveValid = (startH, startV, endH, endV, playerColor) => {
        const dy = Math.abs(endV - startV);
        const dx = Math.abs(endH - startH);
        if (dx <= 1 && dy <= 1) {
            const pieceAtDestination = pieces.find(p => p.horizontalAxis === endH && p.verticalAxis === endV);
            if (!pieceAtDestination || (!pieceAtDestination.image.includes(currentPlayer) && !pieceAtDestination.image.includes(playerColor))) {

                const isCapturingCheckingPiece = pieces.some(piece => {
                    return piece && piece.horizontalAxis === endH && piece.verticalAxis === endV &&
                        piece.image.includes(playerColor === "white" ? "black" : "white");
                });

                if (!isCapturingCheckingPiece || isKingInCheckAfterCapture(playerColor, pieces, endH, endV)) {
                    return true;
                }

                for (const piece of pieces) {
                    if (piece.image.includes(currentPlayer)) {
                        continue; // Skip checking friendly pieces
                    }
                    const pieceH = piece.horizontalAxis;
                    const pieceV = piece.verticalAxis;

                    if (piece.image.includes("pawn")) {
                        if (isPawnMakingCheck(pieceH, pieceV, endH, endV)) {
                            return false;
                        }
                    } else if (piece.image.includes("rook")) {
                        if (isRookMakingCheck(pieceH, pieceV, endH, endV)) {
                            return false;
                        }
                    } else if (piece.image.includes("knight")) {
                        if (isKnightMakingCheck(pieceH, pieceV, endH, endV)) {
                            return false;
                        }
                    } else if (piece.image.includes("bishop")) {
                        if (isBishopMakingCheck(pieceH, pieceV, endH, endV)) {
                            return false;
                        }
                    } else if (piece.image.includes("queen")) {
                        if (isQueenMakingCheck(pieceH, pieceV, endH, endV) || isQueenMakingCheck(pieceH, pieceV, endH, endV, true)) {
                            return false;
                        }
                    }
                }
                return true;
            }
        }
        return false; // Return false if the move is not valid
    };


    const isPawnMakingCheck = (pawnH, pawnV, kingH, kingV) => {
        const dy = kingV - pawnV;
        const dx = Math.abs(kingH - pawnH);

        if (pieces.find(p => p.horizontalAxis === pawnH && p.verticalAxis === pawnV && p.image.includes("white"))) {
            // Check if the white pawn is 1 square diagonally forward and to the right or left of the king
            if (dx === 1 && dy === 1 && dy > 0) {
                return true; // The white pawn can capture the king diagonally forward
            }
        } else if (pieces.find(p => p.horizontalAxis === pawnH && p.verticalAxis === pawnV && p.image.includes("black"))) {
            // Check if the black pawn is 1 square diagonally forward and to the right or left of the king
            if (dx === 1 && dy === -1 && dy < 0) {
                return true; // The black pawn can capture the king diagonally forward (down the board)
            }
        }
        return false;
    };

    const isRookMakingCheck = (rookH, rookV, kingH, kingV) => {
        // Check if the rook can threaten the king horizontally or vertically
        if (rookH === kingH || rookV === kingV) {
            const dx = Math.sign(kingH - rookH);
            const dy = Math.sign(kingV - rookV);

            const pathLength = Math.max(Math.abs(kingH - rookH), Math.abs(kingV - rookV));

            for (let i = 1; i < pathLength; i++) {
                const checkH = rookH + i * dx;
                const checkV = rookV + i * dy;

                if (isSquareOccupied(checkH, checkV)) {
                    return false; // There's a piece blocking the path
                }
            }
            return true;
        }
        return false;
    };
    const isKnightMakingCheck = (knightH, knightV, kingH, kingV) => {
        const dy = Math.abs(kingV - knightV);
        const dx = Math.abs(kingH - knightH);

        // A knight's move consists of two squares in one direction and one square in the other
        if ((dx === 1 && dy === 2) || (dx === 2 && dy === 1)) {
            return true;
        }
        return false;
    };
    const isBishopMakingCheck = (bishopH, bishopV, kingH, kingV) => {
        // Check if the bishop can threaten the king diagonally
        if (Math.abs(bishopH - kingH) === Math.abs(bishopV - kingV)) {
            const dx = Math.sign(kingH - bishopH);
            const dy = Math.sign(kingV - bishopV);

            const pathLength = Math.abs(kingH - bishopH);

            for (let i = 1; i < pathLength; i++) {
                const checkH = bishopH + i * dx;
                const checkV = bishopV + i * dy;

                if (isSquareOccupied(checkH, checkV)) {
                    return false; // There's a piece blocking the path
                }
            }

            return true;
        }

        return false;
    };

    const isQueenMakingCheck = (queenH, queenV, kingH, kingV, kingCanCapture = false) => {
        const vDiff = Math.abs(queenV - kingV);
        const hDiff = Math.abs(queenH - kingH);

        if ((vDiff > 0 && hDiff > 0 && vDiff !== hDiff) || (vDiff === 0 && hDiff === 0)) {
            return false; // Queen is not threatening the king
        }

        const vStep = queenV === kingV ? 0 : (queenV > kingV ? -1 : 1);
        const hStep = queenH === kingH ? 0 : (queenH > kingH ? -1 : 1);

        let v = queenV + vStep;
        let h = queenH + hStep;

        while (v !== kingV || h !== kingH) {
            if (isSquareOccupied(h, v)) {
                return false; // Queen's path to king is blocked
            }
            v += vStep;
            h += hStep;
        }

        if (kingCanCapture) {
            // Simulate king capturing the queen
            const originalKingH = kingH;
            const originalKingV = kingV;
            kingH = queenH;
            kingV = queenV;

            if (!isKingInCheck()) {
                kingH = originalKingH;
                kingV = originalKingV;
                return false; // King can capture the queen without being in check
            }

            kingH = originalKingH;
            kingV = originalKingV;
        }

        return true; // Queen is making check
    };

    const isKingInCheck = () => {
        const playerKing = pieces.find(p => p.image.includes(currentPlayer) && p.image.includes("king"));

        if (!playerKing) {
            return false; // Player's king not found
        }

        const kingH = playerKing.horizontalAxis;
        const kingV = playerKing.verticalAxis;

        for (const piece of pieces) {
            if (piece.image.includes(currentPlayer)) {
                continue; // Skip checking friendly pieces
            }

            const pieceH = piece.horizontalAxis;
            const pieceV = piece.verticalAxis;

            if (piece.image.includes("pawn")) {
                if (isPawnMakingCheck(pieceH, pieceV, kingH, kingV)) {
                    setCurrentPlayer(currentPlayer === "white" ? "white" : "black");
                    setSelectedPiece(null);
                    return true;
                }
            } else if (piece.image.includes("rook")) {
                if (isRookMakingCheck(pieceH, pieceV, kingH, kingV)) {
                    setCurrentPlayer(currentPlayer === "white" ? "white" : "black");
                    setSelectedPiece(null);
                    return true;
                }
            } else if (piece.image.includes("knight")) {
                if (isKnightMakingCheck(pieceH, pieceV, kingH, kingV)) {
                    setCurrentPlayer(currentPlayer === "white" ? "white" : "black");
                    setSelectedPiece(null);
                    return true;
                }
            } else if (piece.image.includes("bishop")) {
                if (isBishopMakingCheck(pieceH, pieceV, kingH, kingV)) {
                    setCurrentPlayer(currentPlayer === "white" ? "white" : "black");
                    setSelectedPiece(null);
                    return true;
                }
            } else if (piece.image.includes("queen")) {
                if (isQueenMakingCheck(pieceH, pieceV, kingH, kingV) || isQueenMakingCheck(pieceH, pieceV, kingH, kingV, true)) {
                    setCurrentPlayer(currentPlayer === "white" ? "white" : "black");
                    setSelectedPiece(null);
                    return true;
                }
            }
        }
        return false;
    };
    const isMoveValid = (startH, startV, endH, endV) => {
        const selectedPiece = pieces.find(p => p.horizontalAxis === startH && p.verticalAxis === startV);
        const pieceType = selectedPiece.image;

        if (pieceType.includes("pawn")) {
            return isPawnMoveValid(startH, startV, endH, endV);
        } else if (pieceType.includes("rook")) {
            return isRookMoveValid(startH, startV, endH, endV);
        } else if (pieceType.includes("knight")) {
            return isKnightMoveValid(startH, startV, endH, endV);
        } else if (pieceType.includes("bishop")) {
            return isBishopMoveValid(startH, startV, endH, endV);
        } else if (pieceType.includes("queen")) {
            return isQueenMoveValid(startH, startV, endH, endV);
        } else if (pieceType.includes("king")) {
            return isKingMoveValid(startH, startV, endH, endV);
        }
    };

    const canBlockThreat = (selectedH, selectedV, targetH, targetV) => {
        const dx = Math.sign(targetH - selectedH);
        const dy = Math.sign(targetV - selectedV);
        const pathLength = Math.max(Math.abs(targetH - selectedH), Math.abs(targetV - selectedV));

        for (let i = 1; i < pathLength; i++) {
            const checkH = selectedH + i * dx;
            const checkV = selectedV + i * dy;

            if (pieces.some(p => p.horizontalAxis === checkH && p.verticalAxis === checkV)) {
                console.log('Function canBlockThreat ');
                return false; // There's a piece blocking the path
            }
        }
        return isMoveValid(selectedH, selectedV, targetH, targetV);
    };
    const canCaptureThreat = (selectedH, selectedV, targetH, targetV) => {
        const threateningPiece = pieces.find(p => p.horizontalAxis === targetH && p.verticalAxis === targetV);

        if (!threateningPiece) {
            console.log('Function canCaptureThreat: Threatening piece not found');
            return false;
        }

        const selectedPiece = pieces.find(p => p.horizontalAxis === selectedH && p.verticalAxis === selectedV);

        // Check if the selected piece is a king and the move captures the threatening piece
        if (selectedPiece && selectedPiece.image.includes("king") && threateningPiece.image.includes(currentPlayer === "white" ? "black" : "white")) {
            // Temporarily move the pieces to check if the king is still in check after capture
            const originalSelectedH = selectedPiece.horizontalAxis;
            const originalSelectedV = selectedPiece.verticalAxis;
            const originalThreateningH = threateningPiece.horizontalAxis;
            const originalThreateningV = threateningPiece.verticalAxis;

            selectedPiece.horizontalAxis = targetH;
            selectedPiece.verticalAxis = targetV;
            threateningPiece.horizontalAxis = null;
            threateningPiece.verticalAxis = null;

            const isCurrentKingInCheckAfterCapture = isKingInCheck(currentPlayer);
            const isOpponentKingInCheckAfterCapture = isKingInCheck(currentPlayer === "white" ? "black" : "white");

            // Restore the original positions
            selectedPiece.horizontalAxis = originalSelectedH;
            selectedPiece.verticalAxis = originalSelectedV;
            threateningPiece.horizontalAxis = originalThreateningH;
            threateningPiece.verticalAxis = originalThreateningV;

            if (!isCurrentKingInCheckAfterCapture && !isOpponentKingInCheckAfterCapture) {
                movePiece(selectedH, selectedV, targetH, targetV);
                return true;
            }
        }

        // Check if the move captures the threatening piece
        if (isMoveValid(selectedH, selectedV, targetH, targetV) && threateningPiece.image.includes(currentPlayer === "white" ? "black" : "white")) {
            // Simulate the capture and check if the king is still in check after the capture
            const tempPieces = pieces.map(piece => ({ ...piece })); // Deep clone using spread syntax

            const kingIndex = tempPieces.findIndex(p => p && p.image === `king_${currentPlayer}`);
            if (kingIndex !== -1) {
                const king = tempPieces[kingIndex];
                king.horizontalAxis = targetH;
                king.verticalAxis = targetV;
                const isKingInCheckAfterCapture = isKingInCheck(currentPlayer, tempPieces);

                if (!isKingInCheckAfterCapture) {
                    movePiece(selectedH, selectedV, targetH, targetV);
                    return true;
                }
            }
        }
        return false;
    };

    const isSquareOccupied = (targetH, targetV) => {
        return pieces.some(piece => piece.horizontalAxis === targetH && piece.verticalAxis === targetV);
    };

    const canBlockCheckmate = (kingH, kingV) => {
        for (let v = -1; v <= 1; v++) {
            for (let h = -1; h <= 1; h++) {
                if (v === 0 && h === 0) {
                    continue;
                }

                for (let i = 1; i < 8; i++) {
                    const targetH = kingH + h * i;
                    const targetV = kingV + v * i;

                    if (targetH >= 0 && targetH < 8 && targetV >= 0 && targetV < 8) {
                        if (!isSquareOccupied(targetH, targetV)) {
                            for (const piece of pieces) {
                                if (piece.image.includes(currentPlayer)) {
                                    const pieceH = piece.horizontalAxis;
                                    const pieceV = piece.verticalAxis;

                                    if (isMoveValid(pieceH, pieceV, targetH, targetV)) {
                                        const originalPieceH = piece.horizontalAxis;
                                        const originalPieceV = piece.verticalAxis;
                                        piece.horizontalAxis = targetH;
                                        piece.verticalAxis = targetV;

                                        const isInCheck = isKingInCheck();

                                        piece.horizontalAxis = originalPieceH;
                                        piece.verticalAxis = originalPieceV;

                                        if (!isInCheck) {
                                            return true;
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        break; // Stop searching in this direction if out of bounds
                    }
                }
            }
        }

        return false;
    };

    const canCaptureCheckmate = (threateningH, threateningV) => {
        for (const piece of pieces) {
            if (piece.image.includes(currentPlayer)) {
                continue; // Skip friendly pieces
            }
            // Simulate the capturing move
            const capturedPieceIndex = pieces.findIndex(
                p => p.horizontalAxis === threateningH && p.verticalAxis === threateningV
            );

            // Continue if no piece is at the threatening position
            if (capturedPieceIndex === -1) {
                continue;
            }

            const originalPieceH = piece.horizontalAxis;
            const originalPieceV = piece.verticalAxis;

            // Temporarily move the capturing piece to test capturing
            piece.horizontalAxis = threateningH;
            piece.verticalAxis = threateningV;

            const capturedPiece = pieces[capturedPieceIndex];
            pieces.splice(capturedPieceIndex, 1); // Temporarily remove the captured piece

            const isInCheck = isKingInCheck();

            // Revert the capturing move and restore the captured piece
            pieces.splice(capturedPieceIndex, 0, capturedPiece);
            piece.horizontalAxis = originalPieceH;
            piece.verticalAxis = originalPieceV;

            if (!isInCheck) {
                return true;
            }
        }
        return false;
    };

    const isCheckmate = () => {
        const playerKing = pieces.find(p => p.image.includes(currentPlayer) && p.image.includes("king"));

        if (!playerKing) {
            return false;
        }

        const kingH = playerKing.horizontalAxis;
        const kingV = playerKing.verticalAxis;

        for (let v = -1; v <= 1; v++) {
            for (let h = -1; h <= 1; h++) {
                if (v === 0 && h === 0) {
                    continue;
                }

                const targetH = kingH + h;
                const targetV = kingV + v;

                if (targetH >= 0 && targetH < 8 && targetV >= 0 && targetV < 8) {
                    if (isMoveValid(kingH, kingV, targetH, targetV) || canBlockCheckmate(kingH, kingV, targetH, targetV) || canCaptureCheckmate(targetH, targetV)) {
                        const originalKingH = playerKing.horizontalAxis;
                        const originalKingV = playerKing.verticalAxis;
                        playerKing.horizontalAxis = targetH;
                        playerKing.verticalAxis = targetV;

                        const isInCheck = isKingInCheck();

                        playerKing.horizontalAxis = originalKingH;
                        playerKing.verticalAxis = originalKingV;

                        if (!isInCheck) {
                            return false;
                        }
                    }
                }
            }
        }
        console.log('checkmate');
        // If no legal moves were found, it's checkmate
        return true;
    };

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };
// Function to generate valid moves for a given piece
    const generateValidMoves = (piece) => {
        const validMoves = [];

        // Define the piece's current position
        const startX = piece.horizontalAxis;
        const startY = piece.verticalAxis;
        const isKing = piece.image.includes("king");

        // Loop through all possible target positions on the board
        for (let targetY = 0; targetY < 8; targetY++) {
            for (let targetX = 0; targetX < 8; targetX++) {
                // Skip the current position
                if (startX === targetX && startY === targetY) {
                    continue;
                }
                // Check if the move is valid
                if (isMoveValid(startX, startY, targetX, targetY)) {
                    // Check if the path is clear for non-knight pieces
                    if (!piece.image.includes("knight") && !isPathClear(piece, targetX, targetY)) {
                        continue; // Skip invalid moves
                    }

                    // Prevent all pieces (except kings) from capturing the king
                    if (!isKing && isKingMoveValid(startX, startY, targetX, targetY)) {
                        continue; // Skip moves that capture the king
                    }
                    validMoves.push({ targetH: targetX, targetV: targetY });
                }
            }
        }
        return validMoves;
    };

    const isPathClear = (piece, targetH, targetV) => {
        // Check if the path is clear for rooks, queens, and bishops
        const dx = Math.sign(targetH - piece.horizontalAxis);
        const dy = Math.sign(targetV - piece.verticalAxis);

        let x = piece.horizontalAxis + dx;
        let y = piece.verticalAxis + dy;

        while (x !== targetH || y !== targetV) {
            if (isSquareOccupied(x, y)) {
                return false; // Path is blocked
            }

            x += dx;
            y += dy;
        }

        return true; // Path is clear
    };

    const computerMove = () => {
        // Check if it's the computer's turn
        if (currentPlayer === computerColor) {
            // Get all computer-controlled pieces
            const computerPieces = pieces.filter((piece) => piece.image.includes(computerColor));

            // Shuffle the computer's pieces randomly to add variety to its moves
            shuffleArray(computerPieces);

            let computerCanMove = false; // Flag to check if the computer can make a valid move

            for (const piece of computerPieces) {
                console.log(`Checking moves for ${piece.image} at (${piece.horizontalAxis}, ${piece.verticalAxis})`);

                // Generate valid moves for the selected piece
                const validMoves = generateValidMoves(piece);

                for (const selectedMove of validMoves) {
                    console.log(`Selected move for ${piece.image}:`, selectedMove);

                    // Check if there is a capturing piece at the target position
                    const capturedPieceIndex = pieces.findIndex(
                        (p) => p.horizontalAxis === selectedMove.targetH && p.verticalAxis === selectedMove.targetV
                    );

                    // Check if a piece is captured
                    let capturedPiece;

                    if (capturedPieceIndex !== -1) {
                        capturedPiece = pieces[capturedPieceIndex];

                        // Prevent kings from capturing each other
                        if (piece.image.includes("king") && capturedPiece.image.includes("king")) {
                            continue; // Skip this move
                        }

                        // Update the captured piece's position to indicate it has been captured
                        capturedPiece.horizontalAxis = -1; // Move it to an invalid position (off the board)
                        capturedPiece.verticalAxis = -1;
                    }
                    // Make the selected move temporarily
                    const originalHorizontal = piece.horizontalAxis;
                    const originalVertical = piece.verticalAxis;
                    piece.horizontalAxis = selectedMove.targetH;
                    piece.verticalAxis = selectedMove.targetV;

                    // Check if the move resolved the check
                    if (!isKingInCheck(computerColor, pieces)) {
                        console.log('Computer made a valid move');
                        computerCanMove = true; // Set the flag to true as the computer made a valid move
                        break; // Exit the loop after making a valid move
                    }
                    // Restore the piece's original position
                    piece.horizontalAxis = originalHorizontal;
                    piece.verticalAxis = originalVertical;

                    // Restore the captured piece's position
                    if (capturedPieceIndex !== -1) {
                        capturedPiece.horizontalAxis = selectedMove.targetH;
                        capturedPiece.verticalAxis = selectedMove.targetV;
                    }
                }

                if (computerCanMove) {
                    break; // Exit the loop if the computer made a valid move
                }
            }
            // If the computer couldn't find a valid move, handle it here
            if (!computerCanMove) {
                console.log("Computer couldn't find a valid move. Custom logic can be added here.");
                console.log('Move not allowed');
                setCurrentPlayer(computerColor === 'white' ? 'white' : 'black');
                if(isCheckmate()){
                    setCheckmate(true);
                    return checkmate;
                }
            }

        }
    };

    const replacementPieces = ["queen", "rook", "bishop", "knight"];
    const [currentReplacementIndex, setCurrentReplacementIndex] = useState(0);

    const movePiece = (startH, startV, endH, endV) => {
        const movedPieceIndex = pieces.findIndex(p => p.horizontalAxis === startH && p.verticalAxis === startV);
        if (movedPieceIndex === -1) {
            return;
        }

        const movedPiece = pieces[movedPieceIndex];
        // Check for pawn promotion
        const isPawnPromotion = movedPiece.image.includes("pawn") && (endV === 0 || endV === 7);
        if (isPawnPromotion) {
            // Replace the pawn with the next available replacement piece.
            movedPiece.image = `pieces/${replacementPieces[currentReplacementIndex]}_${currentPlayer}.png`;
            setCurrentReplacementIndex(currentReplacementIndex+1);
            if(currentReplacementIndex === 3){
                setCurrentReplacementIndex(0);
            }
        }

        const capturingPieceAtTarget = pieces.find(p => p.horizontalAxis === endH && p.verticalAxis === endV && p.image.includes(currentPlayer));
        if (capturingPieceAtTarget) {
            console.log('Move not allowed - Cannot capture own piece.');
            setCurrentPlayer(currentPlayer === "white" ? "white" : "black");
            return false;
        }

        const capturedPieceIndex = pieces.findIndex(p => p.horizontalAxis === endH && p.verticalAxis === endV);

        if (capturedPieceIndex !== -1) {
            const capturedPiece = pieces[capturedPieceIndex];
            const isCapturingKing = capturedPiece.image.includes("king");

            if (isCapturingKing) {
                console.log('Move not allowed - Capturing the king');
                setCurrentPlayer(currentPlayer === "white" ? "white" : "black");
                return false;
            }
            // Remove the captured piece from the array
            if (isMoveValid(startH, startV, endH, endV)) {
                console.log('capturing');

                // Remove the captured piece from the array temporarily
                pieces.splice(capturedPieceIndex, 1);

                if (isKingInCheck()) {
                    // Handle the case where the king is still in check after the capture
                    console.log("Move not allowed - King would be in checkasa");
                    if(selectedPiece){
                        const {image: selectedImage } = selectedPiece;
                        if(selectedImage.includes("king") && isKingMoveValid(startH,startV,endH,endV)){
                            movedPiece.horizontalAxis = endH;
                            movedPiece.verticalAxis = endV;
                            return;
                        }
                    }
                    // Restore the captured piece to its original position
                    pieces.push(capturedPiece);
                    setCurrentPlayer(currentPlayer === "white" ? "white" : "black");

                    return false;
                } else {
                    // If the king is not in check after the capture, it's a valid move
                    movedPiece.horizontalAxis = endH;
                    movedPiece.verticalAxis = endV;
                }
            }
        } else {
            // Temporarily move the piece to test for check
            const originalHorizontal = movedPiece.horizontalAxis;
            const originalVertical = movedPiece.verticalAxis;

            movedPiece.horizontalAxis = endH;
            movedPiece.verticalAxis = endV;

            const isCurrentKingInCheck = isKingInCheck(currentPlayer);
            const isOpponentKingInCheck = isKingInCheck(currentPlayer === "white" ? "black" : "white");

            if (isCurrentKingInCheck || isOpponentKingInCheck) {
                movedPiece.horizontalAxis = originalHorizontal;
                movedPiece.verticalAxis = originalVertical;
                setCurrentPlayer(currentPlayer === "white" ? "white" : "black");
                console.log("Move not allowed - King would be in check");
                return false;
            }
            // No capture, simply update the piece's position
            movedPiece.horizontalAxis = endH;
            movedPiece.verticalAxis = endV;
        }
        setSelectedPiece(null);
        setCurrentPlayer(currentPlayer === "white" ? "black" : "white");
    };

    const handleTileClick = (horizontalAxis, verticalAxis, image) => {
        if(gameMode === 'PvP'){
            if (selectedPiece) {
                const { horizontalAxis: selectedH, verticalAxis: selectedV, image: selectedImage } = selectedPiece;

                let isValidMove = false;

                if (selectedImage.includes("pawn")) {
                    isValidMove = isPawnMoveValid(selectedH, selectedV, horizontalAxis, verticalAxis);
                } else if (selectedImage.includes("rook")) {
                    isValidMove = isRookMoveValid(selectedH, selectedV, horizontalAxis, verticalAxis);
                } else if (selectedImage.includes("knight")) {
                    isValidMove = isKnightMoveValid(selectedH, selectedV, horizontalAxis, verticalAxis);
                } else if (selectedImage.includes("bishop")) {
                    isValidMove = isBishopMoveValid(selectedH, selectedV, horizontalAxis, verticalAxis);
                } else if (selectedImage.includes("queen")) {
                    isValidMove = isQueenMoveValid(selectedH, selectedV, horizontalAxis, verticalAxis);
                } else if (selectedImage.includes("king")) {
                    isValidMove = isKingMoveValid(selectedH, selectedV, horizontalAxis, verticalAxis);
                }

                const isInCheck = isKingInCheck();
                if (isInCheck) {

                    let canKingMoveOutOfCheck = false;

                    // Check if the king's move can capture the threatening piece and get out of check
                    if (isValidMove || (canBlockThreat(selectedH, selectedV, horizontalAxis, verticalAxis) || canCaptureThreat(selectedH, selectedV, horizontalAxis, verticalAxis))) {
                        // Set checkmate to false only if it's not the king making the move
                        console.log(isValidMove);

                        if (!selectedImage.includes("king")) {
                            setCheckmate(false);
                        }
                        movePiece(selectedH, selectedV, horizontalAxis, verticalAxis);
                        canKingMoveOutOfCheck = true;
                    }

                    if (!canKingMoveOutOfCheck) {
                        if (selectedImage.includes("king")) {
                            // Check if the king can capture the threatening piece
                            if (canCaptureThreat(selectedH, selectedV, horizontalAxis, verticalAxis)) {
                                movePiece(selectedH, selectedV, horizontalAxis, verticalAxis);
                                // Set checkmate to false after the move
                                // setCheckmate(false);
                            } else {
                                console.log("You cannot move the king into check.");
                                setSelectedPiece(null);
                                return;
                            }
                        } else {
                            // Check if any piece can capture the threatening piece
                            const capturingPiece = pieces.find(piece =>
                                piece.horizontalAxis === horizontalAxis &&
                                piece.verticalAxis === verticalAxis &&
                                piece.image.includes(currentPlayer === "white" ? "black" : "white") // Ensure it's an opponent's piece
                            );

                            if (capturingPiece) {
                                // Capture the threatening piece
                                const updatedPieces = pieces.filter(piece => piece !== capturingPiece);
                                movePiece(selectedH, selectedV, horizontalAxis, verticalAxis, updatedPieces);
                                // Set checkmate to false after the move
                                // setCheckmate(false);
                            } else {
                                setCurrentPlayer(currentPlayer === "white" ? "white" : "black");
                                console.log("Opponent's king is in check!");
                                setSelectedPiece(null);
                                return;
                            }
                        }
                    }

                    setSelectedPiece(null);
                    setCurrentPlayer(currentPlayer === "white" ? "black" : "white");

                    // Check for checkmate again after making the move
                    if (isCheckmate()) {
                        setCheckmate(true);
                    }
                    document.getElementById('check-message').textContent = `${currentPlayer === 'white' ? 'White' : 'Black'} is in check`;
                } else {
                    document.getElementById('check-message').textContent = ' ';
                }

                if (isValidMove) {
                    if (movePiece(selectedH, selectedV, horizontalAxis, verticalAxis) === false) {
                        setCurrentPlayer(currentPlayer === "white" ? "white" : "black");
                        setSelectedPiece(null);
                    } else {
                        movePiece(selectedH, selectedV, horizontalAxis, verticalAxis);
                        setSelectedPiece(null);
                        setCurrentPlayer(currentPlayer === "white" ? "black" : "white"); // Toggle player's turn
                    }

                } else if (image && image.includes(currentPlayer)) {
                    setSelectedPiece({ horizontalAxis, verticalAxis, image });
                } else {
                    setSelectedPiece(null);
                }
            } else if (image && image.includes(currentPlayer)) {
                setSelectedPiece({ horizontalAxis, verticalAxis, image });
            }
        }
        else if(gameMode === 'PvC'){
            if(currentPlayer === computerColor){
               computerMove();
                setCurrentPlayer(currentPlayer === "white" ? "black" : "white");
                if(checkmate){
                    setCheckmate(true);
                }

            }
            else{
                if (selectedPiece) {
                    const { horizontalAxis: selectedH, verticalAxis: selectedV, image: selectedImage } = selectedPiece;

                    let isValidMove = false;

                    if (selectedImage.includes("pawn")) {
                        isValidMove = isPawnMoveValid(selectedH, selectedV, horizontalAxis, verticalAxis);
                    } else if (selectedImage.includes("rook")) {
                        isValidMove = isRookMoveValid(selectedH, selectedV, horizontalAxis, verticalAxis);
                    } else if (selectedImage.includes("knight")) {
                        isValidMove = isKnightMoveValid(selectedH, selectedV, horizontalAxis, verticalAxis);
                    } else if (selectedImage.includes("bishop")) {
                        isValidMove = isBishopMoveValid(selectedH, selectedV, horizontalAxis, verticalAxis);
                    } else if (selectedImage.includes("queen")) {
                        isValidMove = isQueenMoveValid(selectedH, selectedV, horizontalAxis, verticalAxis);
                    } else if (selectedImage.includes("king")) {
                        isValidMove = isKingMoveValid(selectedH, selectedV, horizontalAxis, verticalAxis);
                    }

                    const isInCheck = isKingInCheck();
                    if (isInCheck) {
                        document.getElementById('check-message').textContent = `${currentPlayer === 'white' ? 'White' : 'Black'} is in check`;

                        let canKingMoveOutOfCheck = false;

                        // Check if the king's move can capture the threatening piece and get out of check
                        if (isValidMove || (canBlockThreat(selectedH, selectedV, horizontalAxis, verticalAxis) || canCaptureThreat(selectedH, selectedV, horizontalAxis, verticalAxis))) {
                            // Set checkmate to false only if it's not the king making the move
                            console.log(isValidMove);

                            if (!selectedImage.includes("king")) {
                                setCheckmate(false);
                            }
                            movePiece(selectedH, selectedV, horizontalAxis, verticalAxis);
                            canKingMoveOutOfCheck = true;
                        }

                        if (!canKingMoveOutOfCheck) {
                            if (selectedImage.includes("king")) {
                                // Check if the king can capture the threatening piece
                                if (canCaptureThreat(selectedH, selectedV, horizontalAxis, verticalAxis)) {
                                    movePiece(selectedH, selectedV, horizontalAxis, verticalAxis);
                                    // Set checkmate to false after the move
                                    // setCheckmate(false);
                                } else {
                                    console.log("You cannot move the king into check.");
                                    setSelectedPiece(null);
                                    return;
                                }
                            } else {
                                // Check if any piece can capture the threatening piece
                                const capturingPiece = pieces.find(piece =>
                                    piece.horizontalAxis === horizontalAxis &&
                                    piece.verticalAxis === verticalAxis &&
                                    piece.image.includes(currentPlayer === "white" ? "black" : "white") // Ensure it's an opponent's piece
                                );

                                if (capturingPiece) {
                                    // Capture the threatening piece
                                    const updatedPieces = pieces.filter(piece => piece !== capturingPiece);
                                    movePiece(selectedH, selectedV, horizontalAxis, verticalAxis, updatedPieces);
                                    // Set checkmate to false after the move
                                    // setCheckmate(false);
                                } else {
                                    setCurrentPlayer(currentPlayer === "white" ? "white" : "black");
                                    console.log("Opponent's king is in check!");
                                    setSelectedPiece(null);
                                    return;
                                }
                            }
                        }

                        setSelectedPiece(null);
                        setCurrentPlayer(currentPlayer === "white" ? "black" : "white");

                        // Check for checkmate again after making the move
                        if (isCheckmate()) {
                            setCheckmate(true);
                        }
                    } else {
                        document.getElementById('check-message').textContent = ' ';
                    }

                    if (isValidMove) {
                        if (movePiece(selectedH, selectedV, horizontalAxis, verticalAxis) === false) {
                            setCurrentPlayer(currentPlayer === "white" ? "white" : "black");
                            setSelectedPiece(null);
                        } else {
                            movePiece(selectedH, selectedV, horizontalAxis, verticalAxis);
                            setSelectedPiece(null);
                            setCurrentPlayer(currentPlayer === "white" ? "black" : "white"); // Toggle player's turn
                        }
                    } else if (image && image.includes(currentPlayer)) {
                        setSelectedPiece({ horizontalAxis, verticalAxis, image });
                    } else {
                        setSelectedPiece(null);
                    }
                } else if (image && image.includes(currentPlayer)) {
                    setSelectedPiece({ horizontalAxis, verticalAxis, image });
                }
            }
        }
    };

    let board = [];
    for (let j = verticalAxis.length - 1; j >= 0; j--) {
        for (let i = 0; i < horizontalAxis.length; i++) {
            const number = j + i + 2;
            let image = undefined;

            pieces.forEach((p) => {
                if (p.horizontalAxis === i && p.verticalAxis === j) {
                    image = p.image;
                }
            });

            board.push(
                <Tile
                    key={`${j},${i}`}
                    image={image}
                    number={number}
                    isSelected={
                        selectedPiece &&
                        selectedPiece.horizontalAxis === i &&
                        selectedPiece.verticalAxis === j
                    }
                    onClick={() => handleTileClick(i, j, image)}
                />
            );
        }
    }

    const onStartGame = (mode,color) => {
        setPlayerColor(color);
        setCurrentPlayer('white');
        setSelectedPiece(null);
        setCheckmate(false);
        setResetGame(false);
        pieces.splice(0,pieces.length);
        for(let p=0 ; p<2; p++){
            const type = (p === 0 ? "black" : "white");
            const y = (p === 0 ? 7 : 0);

            pieces.push({image:`pieces/rook_${type}.png`,horizontalAxis:0,verticalAxis:y});
            pieces.push({image: `pieces/knight_${type}.png`,horizontalAxis:1,verticalAxis:y});
            pieces.push({image:`pieces/bishop_${type}.png`,horizontalAxis:2,verticalAxis:y});
            pieces.push({image:`pieces/queen_${type}.png`,horizontalAxis:3,verticalAxis:y});
            pieces.push({image:`pieces/king_${type}.png`,horizontalAxis:4,verticalAxis:y});
            pieces.push({image:`pieces/bishop_${type}.png`,horizontalAxis:5,verticalAxis:y});
            pieces.push({image:`pieces/knight_${type}.png`,horizontalAxis:6,verticalAxis:y});
            pieces.push({image:`pieces/rook_${type}.png`,horizontalAxis:7,verticalAxis:y});
        }

        for(let i=0;i<8;i++){
            pieces.push({image:'pieces/pawn_black.png',horizontalAxis:i,verticalAxis:6})
        }
        for(let i=0;i<8;i++){
            pieces.push({image:'pieces/pawn_white.png',horizontalAxis:i,verticalAxis:1})
        }

    };
    if (resetGame) {
        return <StartingPage onStartGame={onStartGame} />;
    }

    return (
        <div id="chessboard">
            {!resetGame ? (
                <>
                    {board}
                    <p id="check-message"></p>
                </>
            ) : (
                <div id="startingPage">
                    <StartingPage onStartGame={onStartGame} />
                </div>
            )}
            <div id="endingPage" className={checkmate ? "visible" : "hidden"}>
                <p><b>Checkmate!</b></p>
                {currentPlayer === 'white' ?(
                    <p><b> Black wins</b></p>
                ) : (
                    <p> <b>White wins</b></p>
                )

                }
                <button id="resetButton" onClick={() => setResetGame(true)}>Reset Game</button>
            </div>
        </div>
    );
};

export default Chessgame;