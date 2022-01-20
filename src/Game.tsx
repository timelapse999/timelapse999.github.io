import { useEffect, useState } from "react";
import { Row, RowState } from "./Row";
import dictionary from "./dictionary.json";
import { Clue, clue, describeClue } from "./clue";
import { Keyboard } from "./Keyboard";
import targetList from "./targets.json";
import { dictionarySet, pick, resetRng, seed, speak } from "./util";

enum GameState {
  Playing,
  Won,
  Lost,
}

interface GameProps {
  maxGuesses: number;
  hidden: boolean;
}

const targets = targetList.slice(0, targetList.indexOf("jaahas") + 1); // Words no rarer than this one

function randomTarget(wordLength: number) {
  const eligible = targets.filter((word) => word.length === wordLength);
  return pick(eligible);
}

function calculateDuration(wordLength: number): number {
  const computedStyle = getComputedStyle(document.documentElement)
  const flipDuration = computedStyle.getPropertyValue('--letter-flip-duration');
  const rowOffset = computedStyle.getPropertyValue('--animation-row-offset');

  return (wordLength - 1) * parseInt(rowOffset) + parseInt(flipDuration);
}

function Game(props: GameProps) {
  const [gameState, setGameState] = useState(GameState.Playing);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [wordLength, setWordLength] = useState(3);
  const [hint, setHint] = useState<string>(`Anna ensimmäinen arvauksesi!`);
  const [srStatus, setSrStatus] = useState<string>(``);
  const [target, setTarget] = useState(() => {
    resetRng();
    return randomTarget(wordLength);
  });
  const [timeBetweenGuesses, setTimeBetweenGuesses] = useState(() => {
    return calculateDuration(wordLength);
  });
  const [gameNumber, setGameNumber] = useState(1);
  const [keyboardDisabled, setKeyboardDisabled] = useState(false);

  const startNextGame = () => {
    setTarget(randomTarget(wordLength));
	setTimeBetweenGuesses(calculateDuration(wordLength));
    setGuesses([]);
    setCurrentGuess("");
    setHint("");
    setGameState(GameState.Playing);
    setGameNumber((x) => x + 1);
  };

  const onKey = (key: string) => {
    if (gameState !== GameState.Playing) {
      if (key === "Enter") {
        startNextGame();
      }
      return;
    }
    if (guesses.length === props.maxGuesses) return;
    if (/^[a-zäö]$/i.test(key)) {
      setCurrentGuess((guess) =>
        (guess + key.toLowerCase()).slice(0, wordLength)
      );
      setHint("");
      setSrStatus("");
    } else if (key === "Backspace") {
      setCurrentGuess((guess) => guess.slice(0, -1));
      setHint("");
    } else if (key === "Enter") {
      if (currentGuess.length !== wordLength) {
        setHint("Sana on liian lyhyt");
        return;
      }
      if (!dictionary.includes(currentGuess)) {
        setHint("En tunne sanaa");
        return;
      }
	  setKeyboardDisabled(true);
      setTimeout(() => setKeyboardDisabled(false), timeBetweenGuesses);
      setGuesses((guesses) => guesses.concat([currentGuess]));
      setCurrentGuess((guess) => "");
      if (currentGuess === target) {
        setHint(
          `Voitit! Sana oli ${target.toUpperCase()}. (Paina ENTER pelataksesi uudestaan)`
        );
        setGameState(GameState.Won);
      } else if (guesses.length + 1 === props.maxGuesses) {
        setHint(
          `Ei voittoa! Oikea vastaus oli ${target.toUpperCase()}. (Paina ENTER pelataksesi uudestaan)`
        );
        setGameState(GameState.Lost);
      } else {
        setHint("");
        speak(describeClue(clue(currentGuess, target)));
      }
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        onKey(e.key);
      }
      if (e.key === "Backspace") {
        e.preventDefault();
      }
    };
    if (!keyboardDisabled) {
      document.addEventListener("keydown", onKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [currentGuess, gameState, keyboardDisabled]);

  useEffect(() => {
    document.documentElement.style.setProperty('--keyboard-transition-delay', timeBetweenGuesses + "ms");
  }, [timeBetweenGuesses])

  let letterInfo = new Map<string, Clue>();
  const tableRows = Array(props.maxGuesses)
    .fill(undefined)
    .map((_, i) => {
      const guess = [...guesses, currentGuess][i] ?? "";
      const cluedLetters = clue(guess, target);
      const lockedIn = i < guesses.length;
      if (lockedIn) {
        for (const { clue, letter } of cluedLetters) {
          if (clue === undefined) break;
          const old = letterInfo.get(letter);
          if (old === undefined || clue > old) {
            letterInfo.set(letter, clue);
          }
        }
      }
      return (
        <Row
          key={i}
          wordLength={wordLength}
          rowState={
            lockedIn
              ? RowState.LockedIn
              : i === guesses.length
              ? RowState.Editing
              : RowState.Pending
          }
          cluedLetters={cluedLetters}
        />
      );
    });

  return (
    <div className="Game" style={{ display: props.hidden ? "none" : "block" }}>
      <div className="Game-options">
        <label htmlFor="wordLength">Kirjaimia:</label>
        <input
          type="range"
          min="3"
          max="4"
          id="wordLength"
          disabled={
            gameState === GameState.Playing &&
            (guesses.length > 0 || currentGuess !== "")
          }
          value={wordLength}
          onChange={(e) => {
            const length = Number(e.target.value);
            resetRng();
            setGameNumber(1);
            setGameState(GameState.Playing);
            setGuesses([]);
            setCurrentGuess("");
            setTarget(randomTarget(length));
            setWordLength(length);
            setHint(`${length} letters`);
          }}
        ></input>
        <button
          style={{ flex: "0 0 auto" }}
          disabled={gameState !== GameState.Playing || guesses.length === 0}
          onClick={() => {
            setHint(
              `The answer was ${target.toUpperCase()}. (Enter to play again)`
            );
            setGameState(GameState.Lost);
            (document.activeElement as HTMLElement)?.blur();
          }}
        >
          Luovuta
        </button>
      </div>
      <table className="Game-rows" tabIndex={0} aria-label="Table of guesses">
        <tbody>{tableRows}</tbody>
      </table>
      <p role="alert">{hint || `\u00a0`}</p>
      {/* <p role="alert" className="Game-sr-feedback">
        {srStatus}
      </p> */}
      <Keyboard letterInfo={letterInfo} onKey={onKey} disabled={keyboardDisabled} />
      {seed ? (
        <div className="Game-seed-info">
          seed {seed}, length {wordLength}, game {gameNumber}
        </div>
      ) : undefined}
    </div>
  );
}

export default Game;
