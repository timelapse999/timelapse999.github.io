import "./App.css";
import { seed } from "./util";
import Game from "./Game";
import { useEffect, useState } from "react";
import { Row, RowState } from "./Row";
import { Clue } from "./clue";
// @ts-ignore
import { ReactComponent as Info } from './icons/question-circle.svg';
// @ts-ignore
import { ReactComponent as Close } from './icons/times.svg';
// @ts-ignore
import { ReactComponent as Settings } from './icons/cog.svg';

const maxGuesses = 6;

function useSetting<T>(
  key: string,
  initial: T
): [T, (value: T | ((t: T) => T)) => void] {
  const [current, setCurrent] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initial;
    } catch (e) {
      return initial;
    }
  });
  const setSetting = (value: T | ((t: T) => T)) => {
    try {
      const v = value instanceof Function ? value(current) : value;
      setCurrent(v);
      window.localStorage.setItem(key, JSON.stringify(v));
    } catch (e) {}
  };
  return [current, setSetting];
}

function About() {
  return (
    <div className="App-about">
      <p>
        <i>Kieluri</i> pohjautuu <a href="https://www.powerlanguage.co.uk/wordle/" target="_blank"><i>Wordle</i></a>{" "} -peliin, jonka on tehnyt
        
          &nbsp;<a href="https://twitter.com/powerlanguish" target="_blank">Josh Wardle</a>.<br />Wordle puolestaan muistuttaa brittil&auml;isen ITV:n <a href="http://www.ukgameshows.com/ukgs/Lingo" target="_blank"><i>Lingo</i></a> -pelishowta.
      </p>
	  <p>
	  Sinulla on kolme vaihtoehtoa pelata. Sana tulee joukosta, jossa ovat:
	  </p>

	  <ol className="leftAlign">
	  <li>Kaikki kolmen kirjaimen perus- ja taivutusmuodot, esim. puu, i&auml;n, kun, lue (190 sanaa).</li>

      <li>Kaikki nelj&auml;n kirjaimen perus- ja taivutusmuodot, esim. talo, suun, siis, uida, nyki, olin, n&auml;&ouml;n, meni (1700 sanaa).</li>

      <li>Kaikki viiden kirjaimen perusmuodot, esim. torvi, kaksi, ilke&auml;, tulla, hakea, saada, miten (2800 sanaa).</li>
	  </ol>
 
      <p>
        Sinulla on {maxGuesses} yrityst&auml; arvata sana.
        <br />
        Jokaisen arvauksen j&auml;lkeen saat palautteen:
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
        <b>V</b> ja <b>Y</b> eiv&auml;t ole kohdesanassa lainkaan.
        <br />
        <b>E</b> on oikein! Toinen kirjain on <b>E</b>
        .<br />
        <b>L</b> esiintyy <em>muualla</em> kohdesanassa.
      </p>
      <p>
        Siirret&auml;&auml;n <b>L</b> seuraavassa arvauksessamme:
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
      <p>Niin l&auml;hell&auml;!</p>
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
      <p>Siin&auml;h&auml;n se!</p>
      
	  <p>
		<strong>Kielurin ovat tehneet:</strong><br />
		Juho Jouhtim&auml;ki, Fred Karlsson ja Linn Karlsson
	  </p>
	  <p>Kielurissa k&auml;ytetty koodi on muokattu avoimen l&auml;hdekoodin pohjalta.<br />Alkuper&auml;inen koodi l&ouml;ytyy t&auml;&auml;lt&auml;:<br />
	  <a href="https://github.com/lynn/hello-wordl" target="_blank">https://github.com/lynn/hello-wordl</a></p>
	  <p><strong>K&auml;ytetyt aineistot:</strong><br />
	  <a href="https://kaino.kotus.fi/sanat/nykysuomi/" target="_blank">Kielitoimiston sanakirja</a>, omat generointiohjelmat</p>
	  <p>
        Ilmoita ongelmista{" "}
        <a href="https://github.com/timelapse999/hello-wordl" target="_blank">t&auml;&auml;ll&auml;</a>.
      </p>
	  
	  
    </div>
  );
}

function App() {
  type Page = "game" | "about" | "settings";
  const [page, setPage] = useState<Page>("game");
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [dark, setDark] = useSetting<boolean>("dark", prefersDark);
  const [colorBlind, setColorBlind] = useSetting<boolean>("colorblind", false);
  const [keyboard, setKeyboard] = useSetting<string>(
    "keyboard",
    "qwertyuiop-asdfghjkl-BzxcvbnmE"
  );
  const [enterLeft, setEnterLeft] = useSetting<boolean>("enter-left", false);
  
  
  const element_info: Info = <Info style={{width: 25, height: 25, marginRight: 5}} />
  const element_close: Close = <Close style={{width: 25, height: 25}} />
  const element_settings: Settings = <Settings style={{width: 25, height: 25}} />
 
  
  useEffect(() => {
    document.body.className = dark ? "dark" : "";
    setTimeout(() => {
      // Avoid transition on page load
      document.body.style.transition = "0.3s background-color ease-out";
    }, 1);
  }, [dark]);

  const link = (icon: Info, label: string, page: Page) => (
    <a
      className="icon-link"
      href="#"
      onClick={() => setPage(page)}
      title={label}
      aria-label={label}
    >
      {icon}
    </a>
  );

  return (
    <div className={"App-container" + (colorBlind ? " color-blind" : "")}>
      <h1>Kieluri</h1>
      <div style={{ position: "absolute", right: 5, top: 5 }}>
        {page !== "game" ? (
          link(element_close, "Sulje", "game")
        ) : (
          <>
            {link(element_info, "Tietoja", "about")}
            {link(element_settings, "Asetukset", "settings")}
          </>
        )}
      </div>
      <div style={{ position: "absolute", left: 5, top: 5, visibility: page === "game" ? "visible" : "hidden" }}>
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
      {page === "about" && <About />}
	        {page === "settings" && (
        <div className="Settings">
          <div className="Settings-setting">
            <input
              id="dark-setting"
              type="checkbox"
              checked={dark}
              onChange={() => setDark((x: boolean) => !x)}
            />
            <label htmlFor="dark-setting">Tumma ulkoasu</label>
          </div>
          <div className="Settings-setting">
            <input
              id="colorblind-setting"
              type="checkbox"
              checked={colorBlind}
              onChange={() => setColorBlind((x: boolean) => !x)}
            />
            <label htmlFor="colorblind-setting">Vaihtoehtoinen v&auml;riteema</label>
          </div>

        </div>
      )}
      <Game 
		maxGuesses={maxGuesses} 
		hidden={page !== "game"}
        colorBlind={colorBlind} 
	   />
    </div>
  );
}

export default App;