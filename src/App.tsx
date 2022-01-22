import "./App.css";
import { seed } from "./util";
import Game from "./Game";
import { useState } from "react";
import { Row, RowState } from "./Row";
import { Clue } from "./clue";

const maxGuesses = 6;

function About() {
  return (
    <div className="App-about">
      <p>
        <i>Kieluri</i> pohjautuu <a href="https://www.powerlanguage.co.uk/wordle/"><i>Wordle</i></a>{" "} -peliin, jonka on tehnyt
        
         <a href="https://twitter.com/powerlanguish"> powerlanguage</a>. Wordle puolestaan muistuttaa brittiläisen ITV:n <i>Lingo</i> -pelishowta.
      </p>
      <p>
        Sinulla on {maxGuesses} yritystä arvata sana.
        <br />
        Jokaisen arvauksen jälkeen saat Mastermind-tyylisen palautteen:
      </p>
      <Row
        rowState={RowState.LockedIn}
        wordLength={4}
        cluedLetters={[
          { clue: Clue.Elsewhere, letter: "l" },
          { clue: Clue.Correct, letter: "e" },
          { clue: Clue.Absent, letter: "v" },
          { clue: Clue.Absent, letter: "y" },
        ]}
      />
      <p>
        <b>V</b> ja <b>Y</b> eivät ole kohdesanassa lainkaan.
        <br />
        <b>E</b> on oikein! Toinen kirjain on <b>E</b>
        .<br />
        <b>L</b> esiintyy <em>muualla</em> kohdesanassa.
      </p>
      <p>
        Siirretään <b>L</b> seuraavassa arvauksessamme:
      </p>
      <Row
        rowState={RowState.LockedIn}
        wordLength={4}
        cluedLetters={[
          { clue: Clue.Correct, letter: "k" },
          { clue: Clue.Correct, letter: "e" },
          { clue: Clue.Correct, letter: "l" },
          { clue: Clue.Absent, letter: "i" },
        ]}
      />
      <p>Niin lähellä!</p>
      <Row
        rowState={RowState.LockedIn}
        wordLength={4}
        cluedLetters={[
          { clue: Clue.Correct, letter: "k" },
          { clue: Clue.Correct, letter: "e" },
          { clue: Clue.Correct, letter: "l" },
          { clue: Clue.Correct, letter: "a" },
        ]}
      />
      <p>Siinähän se!</p>
      <p>
        Ilmoita ongelmista{" "}
        <a href="https://github.com/timelapse999/hello-wordl">täällä</a>.
      </p>
    </div>
  );
}

function App() {
  const [about, setAbout] = useState(false);
  return (
    <div className="App-container">
      <h1>Kieluri</h1>
      <div style={{ position: "absolute", right: 5, top: 5 }}>
        <a href="#" onClick={() => setAbout((a) => !a)}>
          {about ? "Sulje" : "Tietoja"}
        </a>
      </div>
      <div style={{ position: "absolute", left: 5, top: 5 }}>
        <a
          href="#"
          onClick={() =>
            (document.location = seed
              ? "?"
              : "?seed=" +
                new Date().toISOString().replace(/-/g, "").slice(0, 8))
          }
        >
          {seed ? "Arvo sana" : "Päivän sana"}
        </a>
      </div>
      {about && <About />}
      <Game maxGuesses={maxGuesses} hidden={about} />
    </div>
  );
}

export default App;
