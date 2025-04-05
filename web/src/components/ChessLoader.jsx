import React from 'react';
import '../styles/chessLoader.css';

const ChessLoader = ({ size = 'medium', text = 'Loading...' }) => {
  // Determine size classes
  const sizeClass = size === 'small' ? 'chess-loader-small' : 
                    size === 'large' ? 'chess-loader-large' : 
                    'chess-loader-medium';
  
  return (
    <div className="chess-loader-container">
      <div className={`chess-loader ${sizeClass}`}>
        {/* Chessboard with animated pieces */}
        <div className="chessboard">
          {/* Row 1 */}
          <div className="square light"></div>
          <div className="square dark"><div className="piece knight white"></div></div>
          <div className="square light"></div>
          <div className="square dark"></div>
          <div className="square light"></div>
          <div className="square dark"></div>
          <div className="square light"></div>
          <div className="square dark"></div>
          
          {/* Row 2 */}
          <div className="square dark"></div>
          <div className="square light"></div>
          <div className="square dark"></div>
          <div className="square light"><div className="piece pawn white"></div></div>
          <div className="square dark"></div>
          <div className="square light"></div>
          <div className="square dark"></div>
          <div className="square light"></div>
          
          {/* Row 3 */}
          <div className="square light"></div>
          <div className="square dark"></div>
          <div className="square light"></div>
          <div className="square dark"></div>
          <div className="square light"><div className="piece bishop white"></div></div>
          <div className="square dark"></div>
          <div className="square light"></div>
          <div className="square dark"></div>
          
          {/* Row 4 */}
          <div className="square dark"></div>
          <div className="square light"></div>
          <div className="square dark"></div>
          <div className="square light"></div>
          <div className="square dark"></div>
          <div className="square light"></div>
          <div className="square dark"><div className="piece queen white"></div></div>
          <div className="square light"></div>
          
          {/* Row 5 */}
          <div className="square light"></div>
          <div className="square dark"></div>
          <div className="square light"></div>
          <div className="square dark"></div>
          <div className="square light"></div>
          <div className="square dark"><div className="piece rook black"></div></div>
          <div className="square light"></div>
          <div className="square dark"></div>
          
          {/* Row 6 */}
          <div className="square dark"></div>
          <div className="square light"><div className="piece pawn black"></div></div>
          <div className="square dark"></div>
          <div className="square light"></div>
          <div className="square dark"></div>
          <div className="square light"></div>
          <div className="square dark"></div>
          <div className="square light"></div>
          
          {/* Row 7 */}
          <div className="square light"></div>
          <div className="square dark"></div>
          <div className="square light"><div className="piece bishop black"></div></div>
          <div className="square dark"></div>
          <div className="square light"></div>
          <div className="square dark"></div>
          <div className="square light"></div>
          <div className="square dark"></div>
          
          {/* Row 8 */}
          <div className="square dark"></div>
          <div className="square light"></div>
          <div className="square dark"></div>
          <div className="square light"></div>
          <div className="square dark"><div className="piece king black"></div></div>
          <div className="square light"></div>
          <div className="square dark"></div>
          <div className="square light"></div>
        </div>
      </div>
      {text && <div className="chess-loader-text">{text}</div>}
    </div>
  );
};

// Alternative simple loader with just moving pieces
export const ChessSimpleLoader = ({ size = 'medium', text = 'Loading...' }) => {
  // Determine size classes
  const sizeClass = size === 'small' ? 'chess-simple-loader-small' : 
                    size === 'large' ? 'chess-simple-loader-large' : 
                    'chess-simple-loader-medium';
  
  return (
    <div className="chess-simple-loader-container">
      <div className={`chess-simple-loader ${sizeClass}`}>
        <div className="piece-container">
          <div className="piece pawn"></div>
          <div className="piece knight"></div>
          <div className="piece bishop"></div>
          <div className="piece rook"></div>
          <div className="piece queen"></div>
          <div className="piece king"></div>
        </div>
      </div>
      {text && <div className="chess-loader-text">{text}</div>}
    </div>
  );
};

// Knight-only loader that moves in L-shape patterns
export const KnightMoveLoader = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClass = size === 'small' ? 'knight-loader-small' : 
                    size === 'large' ? 'knight-loader-large' : 
                    'knight-loader-medium';
  
  return (
    <div className="knight-loader-container">
      <div className={`knight-loader ${sizeClass}`}>
        <div className="knight-piece"></div>
      </div>
      {text && <div className="chess-loader-text">{text}</div>}
    </div>
  );
};

export default ChessLoader;
