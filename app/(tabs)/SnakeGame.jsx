import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Animated, 
  PanResponder 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const GRID_SIZE = 20;
const CELL_SIZE = width / GRID_SIZE;

const COLORS = {
  background: ['#1C1C2E', '#2C2C4E'],
  snake: ['#00FF00', '#00CC00'], // Bright green colors
  food: ['yellow', 'yellow'],  // Bright red colors
  board: ['#2C2C4E', '#1C1C2E']
};

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

const SnakeGame = () => {
  const [snake, setSnake] = useState([
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 }
  ]);
  const [food, setFood] = useState(generateFood());
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const gameLoopRef = useRef(null);

  // Generate food at random location
  function generateFood() {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  }

  // Move snake logic
  const moveSnake = () => {
    if (gameOver) return;

    const newSnake = [...snake];
    const head = { 
      x: newSnake[0].x + direction.x, 
      y: newSnake[0].y + direction.y 
    };

    // Wall collision
    if (
      head.x < 0 || 
      head.x >= GRID_SIZE || 
      head.y < 0 || 
      head.y >= GRID_SIZE
    ) {
      setGameOver(true);
      return;
    }

    // Self collision
    const selfCollision = newSnake.some(
      segment => segment.x === head.x && segment.y === head.y
    );
    if (selfCollision) {
      setGameOver(true);
      return;
    }

    // Food eat logic
    const ateFood = head.x === food.x && head.y === food.y;
    if (ateFood) {
      setScore(prevScore => prevScore + 1);
      setFood(generateFood());
      newSnake.push({ ...newSnake[newSnake.length - 1] });
    }

    newSnake.unshift(head);
    newSnake.pop();
    setSnake(newSnake);
  };

  // Start game loop
  useEffect(() => {
    gameLoopRef.current = setInterval(moveSnake, 200);
    return () => clearInterval(gameLoopRef.current);
  }, [direction, snake]);

  // Gesture handling
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        const { dx, dy } = gestureState;
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal movement
          setDirection(dx > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT);
        } else {
          // Vertical movement
          setDirection(dy > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP);
        }
      }
    })
  ).current;

  // Reset game
  const resetGame = () => {
    setSnake([
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 }
    ]);
    setFood(generateFood());
    setDirection(DIRECTIONS.RIGHT);
    setGameOver(false);
    setScore(0);
  };

  return (
    <LinearGradient colors={COLORS.background} style={styles.container}>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>
      
      {/* Game Board */}
      <LinearGradient 
        colors={COLORS.board} 
        style={styles.gameBoard}
        {...panResponder.panHandlers}
      >
        {/* Snake Segments */}
        {snake.map((segment, index) => (
          <View
            key={index}
            style={[
              styles.snakeSegment,
              {
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2
              }
            ]}
          />
        ))}

        {/* Food */}
        <View
          style={[
            styles.food,
            {
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2
            }
          ]}
        />
      </LinearGradient>

      {/* Game Over Overlay */}
      {gameOver && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverText}>Game Over!</Text>
          <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
            <Text style={styles.resetButtonText}>Reset Game</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scoreContainer: {
    marginBottom: 20
  },
  scoreText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold'
  },
  gameBoard: {
    width: width,
    height: width,
    position: 'relative'
  },
  snakeSegment: {
    position: 'absolute',
    backgroundColor: COLORS.snake[0]
  },
  food: {
    position: 'absolute',
    backgroundColor: COLORS.food[0]
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)'
  },
  gameOverText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20
  },
  resetButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5
  },
  resetButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default SnakeGame;
