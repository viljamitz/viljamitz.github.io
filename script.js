let currentExercise = 0;
const totalExercises = 10; // Total number of exercises in the lesson

// Function to parse the CSV data
function parseCSV(data) {
  const lines = data.trim().split('\n');
  lines.shift(); // Remove the header row
  return lines.map(line => {
    const [hebrew, finnish] = line.split(',');
    return { hebrew: hebrew.trim(), finnish: finnish.trim() };
  });
}

// Function to shuffle the words array
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

// Function to fetch words from the server
async function fetchWords() {
  const response = await fetch('words.csv');
  const data = await response.text();
  return parseCSV(data);
}

function chooseExercise() {
  const exerciseTypes = ['multipleChoice', 'translation'];
  return exerciseTypes[Math.floor(Math.random() * exerciseTypes.length)];
}

async function populateQuiz() {
  try {
    const wordsDatabase = await fetchWords();
    const shuffledWords = shuffle(wordsDatabase);
    const exerciseType = chooseExercise();

    if (exerciseType === 'multipleChoice') {
      document.getElementById('quiz').style.display = 'block';
      document.getElementById('translation').style.display = 'none';
      populateMultipleChoiceQuiz(shuffledWords);
    } else {
      document.getElementById('quiz').style.display = 'none';
      document.getElementById('translation').style.display = 'block';
      populateTranslationExercise(shuffledWords);
    }
  } catch (error) {
    console.error("Error fetching or parsing data:", error);
  }
}

function populateMultipleChoiceQuiz(words) {
  const optionsContainer = document.getElementById("options-container");
  optionsContainer.innerHTML = "";
  
  const currentWord = words[0];
  document.getElementById("question").textContent = `Mikä on "${currentWord.hebrew}" sanan suomenkielinen käännös?`;
  
  const options = [currentWord];
  while (options.length < 4) {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    if (!options.find(option => option.hebrew === randomWord.hebrew)) {
      options.push(randomWord);
    }
  }
  
  shuffle(options);
  
  options.forEach(option => {
    const button = document.createElement("button");
    button.textContent = option.finnish;
    button.classList.add("option");
    button.addEventListener("click", () => checkAnswer(option, words));
    optionsContainer.appendChild(button);
  });
}

function checkAnswer(selectedOption, words) {
  const isCorrect = selectedOption.hebrew === words[0].hebrew;
  playSound(isCorrect);
  updateFeedback(isCorrect);
  flashBackground(isCorrect);
  if (isCorrect) {
    words.shift();
    if (words.length > 0) {
      setTimeout(populateQuiz, 1000);
    } else {
      const feedback = document.getElementById("feedback");
      feedback.textContent += " Kysely suoritettu!";
      currentExercise = 0; // Reset exercise counter
      document.getElementById('lesson-window').style.display = 'none'; // Hide lesson window
      document.getElementById('welcome-window').style.display = 'flex'; // Show welcome window
    }
    nextExercise(); // Call nextExercise() here
  }
}

function updateFeedback(isCorrect) {
  const feedback = document.getElementById("feedback");
  feedback.textContent = isCorrect ? "Oikein!" : "Väärin. Yritäpä uudelleen!";
  feedback.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
}

function flashBackground(isCorrect) {
  const className = isCorrect ? 'correct-flash' : 'incorrect-flash';
  document.body.classList.add(className);
  setTimeout(() => {
    document.body.classList.remove(className);
  }, 1000); // Remove the class after the animation completes
}

function populateTranslationExercise(words) {
  const word = words[0];
  document.getElementById('translation-question').textContent = word.hebrew;
  const inputField = document.getElementById('translation-input');
  const submitBtn = document.getElementById('submit-answer');

  submitBtn.onclick = function() {
    const isCorrect = inputField.value.trim().toLowerCase() === word.finnish.toLowerCase();
    playSound(isCorrect);
    updateFeedback(isCorrect);
    flashBackground(isCorrect);
    if (isCorrect) {
      words.shift();
      if (words.length > 0) {
        setTimeout(populateQuiz, 1000);
      } else {
        const feedback = document.getElementById("feedback");
        feedback.textContent += " Kysely suoritettu!";
        currentExercise = 0; // Reset exercise counter
        document.getElementById('lesson-window').style.display = 'none'; // Hide lesson window
        document.getElementById('welcome-window').style.display = 'flex'; // Show welcome window
      }
      nextExercise(); // Call nextExercise() here
    }
    inputField.value = ""; // Clear the input field after submission
  };
}

function playSound(isCorrect) {
  const sound = document.getElementById(isCorrect ? 'correct-sound' : 'incorrect-sound');
  sound.play();
}

function nextExercise() {
  currentExercise++;
  updateProgress();
}

function updateProgress() {
  const progress = (currentExercise / totalExercises) * 100;
  document.getElementById("progress").style.width = `${progress}%`;

  if (progress >= 100) {
    const feedback = document.getElementById("feedback");
    feedback.textContent = "Lesson completed!";
  }
}

// Event listener for starting the lesson
document.getElementById('start-lesson-btn').addEventListener('click', function() {
  document.getElementById('welcome-window').style.display = 'none'; // Hide welcome window
  document.getElementById('lesson-window').style.display = 'block'; // Show lesson window
  populateQuiz(); // Start the lesson
});

// Event listener for reloading the lesson after completion
document.getElementById('restart-lesson-btn').addEventListener('click', function() {
  document.getElementById('welcome-window').style.display = 'none'; // Hide welcome window
  document.getElementById('lesson-window').style.display = 'block'; // Show lesson window
  populateQuiz(); // Start the lesson
});
