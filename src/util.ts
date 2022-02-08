import dictionary from "./dictionaryCombined.json";

export const dictionarySet: Set<string> = new Set(dictionary);

let used = "usedNumbers";
let usedRandomNumbers:Array<number> = [];

function mulberry32(a: number) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function urlParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

export const seed = Number(
  new URLSearchParams(window.location.search).get("seed")
);
const makeRandom = () => (seed ? mulberry32(seed) : () => Math.random());

let numbersFromStorage = window.localStorage.getItem(used);



if (numbersFromStorage === "null" || numbersFromStorage === null) {
	usedRandomNumbers = [];
}
else if (numbersFromStorage !== "null" || numbersFromStorage !== null) {
	let numbersFromStorageUnique = numbersFromStorage.replaceAll("null,","");
	usedRandomNumbers = numbersFromStorageUnique.split(',').map(Number);
	
}

const newArray = usedRandomNumbers.filter(function (value) {
	return !Number.isNaN(value);
});

usedRandomNumbers = newArray;

let random = makeRandom();

export function resetRng(): void {
  random = makeRandom();
}

let randomNumber = 0;


export function pick<T>(array: Array<T>): T {
  
  if (array.length === usedRandomNumbers.length) {
	  usedRandomNumbers = [];
  }
  
  randomNumber = Math.floor(array.length * random());
  while (usedRandomNumbers.indexOf(randomNumber) > -1) {
	randomNumber = Math.floor(array.length * random());
  }
  usedRandomNumbers.push(randomNumber);
  window.localStorage.setItem(used, JSON.stringify(usedRandomNumbers));
  return array[randomNumber];
}

// https://a11y-guidelines.orange.com/en/web/components-examples/make-a-screen-reader-talk/
export function speak(
  text: string,
  priority: "polite" | "assertive" = "assertive"
) {
  var el = document.createElement("div");
  var id = "speak-" + Date.now();
  el.setAttribute("id", id);
  el.setAttribute("aria-live", priority || "polite");
  el.classList.add("sr-only");
  document.body.appendChild(el);

  window.setTimeout(function () {
    document.getElementById(id)!.innerHTML = text;
  }, 100);

  window.setTimeout(function () {
    document.body.removeChild(document.getElementById(id)!);
  }, 1000);
}
