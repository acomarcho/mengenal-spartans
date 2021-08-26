import React, { useEffect, useReducer, useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { data } from "./data";
import useSound from "use-sound";
import correctSfx from "./correct.wav";
import wrongSfx from "./wrong.mp3";
import Image from "react-image-enlarger";

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

const generateButtons = (correctNim, correctName) => {
  let arr = [{ nim: correctNim, namaLengkap: correctName }];
  for (let i = 0; i < 3; i++) {
    while (true) {
      let randomIndex = Math.floor(Math.random() * data.length);
      const { nim, namaLengkap } = data[randomIndex];
      if (arr.filter((e) => e.nim === nim).length === 0) {
        arr.push({ nim, namaLengkap });
        break;
      }
    }
  }
  shuffleArray(arr);
  return arr;
};

const reducer = (state, action) => {
  if (action.type === "INITIAL_RUN") {
    const randomIndex = Math.floor(Math.random() * state.gameData.length);
    const { nim, picture, namaLengkap } = state.gameData[randomIndex];
    const btns = generateButtons(nim, namaLengkap);
    return {
      ...state,
      correctKey: nim,
      image: picture,
      buttons: btns,
      correctName: namaLengkap,
    };
  }
  if (action.type === "ANSWER") {
    if (action.payload === state.correctKey) {
      let newGameData = state.gameData.filter(
        (item) => item.nim !== action.payload
      );
      if (newGameData.length > 0) {
        const randomIndex = Math.floor(Math.random() * newGameData.length);
        const { nim, picture, namaLengkap } = newGameData[randomIndex];
        const btns = generateButtons(nim, namaLengkap);
        return {
          ...state,
          correctAnswers: state.correctAnswers + 1,
          gameData: newGameData,
          modalContent: state.correctName,
          modalStatus: "correct",
          correctKey: nim,
          correctName: namaLengkap,
          image: picture,
          buttons: btns,
        };
      } else {
        return { ...state, gameData: [] };
      }
    } else {
      const randomIndex = Math.floor(Math.random() * state.gameData.length);
      const { nim, picture, namaLengkap } = state.gameData[randomIndex];
      const btns = generateButtons(nim, namaLengkap);
      return {
        ...state,
        modalContent: state.correctName,
        modalStatus: "wrong",
        correctKey: nim,
        image: picture,
        buttons: btns,
        correctName: namaLengkap,
      };
    }
  }
  return state;
};

const initialState = {
  correctAnswers: 0,
  gameData: [...data],
  modalContent: "",
  modalStatus: "",
  correctKey: "",
  correctName: "",
  image: "",
  buttons: [],
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const [correct] = useSound(correctSfx);
  const [wrong] = useSound(wrongSfx);

  const [zoomed, setZoomed] = React.useState(false);

  useEffect(() => {
    if (state.modalStatus === "correct") {
      correct();
    }
    if (state.modalStatus === "wrong") {
      wrong();
    }
  }, [state.buttons]);

  // Initial render, generate a question
  useEffect(() => {
    dispatch({ type: "INITIAL_RUN" });
  }, []);

  if (state.gameData.length > 0) {
    return (
      <main>
        <div className="container">
          <p>
            Correct {state.correctAnswers}/{data.length}
          </p>
          <Image
            style={{ width: "280px", height: "189px", objectFit: "contain" }}
            zoomed={zoomed}
            src={state.image}
            alt="Loading Foto SPARTAN..."
            onClick={() => setZoomed(true)}
            onRequestClose={() => setZoomed(false)}
          />
          {state.buttons.map((item) => {
            const { nim, namaLengkap } = item;
            return (
              <button
                key={nim}
                onClick={() => dispatch({ type: "ANSWER", payload: nim })}
              >
                {toTitleCase(namaLengkap)}
              </button>
            );
          })}
          {state.modalStatus === "wrong" && (
            <span>
              <FaTimes /> {toTitleCase(state.modalContent)}
            </span>
          )}
          {state.modalStatus === "correct" && (
            <span className="correct">
              <FaCheck /> {toTitleCase(state.modalContent)}
            </span>
          )}
        </div>
      </main>
    );
  } else {
    return (
      <main>
        <div className="container">
          <p>Selesai!</p>
        </div>
      </main>
    );
  }
}

export default App;
