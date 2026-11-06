/* eslint-disable */

export type QuestionItem = {
  q: string;
  options: string[];
  answer: number;
  difficulty: "easy" | "medium" | "hard";
};

export const EASY_QUESTIONS: QuestionItem[] = [
  {
    q: "What is the capital city of France?",
    options: ["London", "Berlin", "Madrid", "Paris"],
    answer: 3,
    difficulty: "easy"
  },
  {
    q: "How many days are in a standard leap year?",
    options: ["365", "366", "364", "367"],
    answer: 1,
    difficulty: "easy"
  },
  {
    q: "Which planet is closest to the Sun?",
    options: ["Venus", "Earth", "Mercury", "Mars"],
    answer: 2,
    difficulty: "easy"
  },
  {
    q: "What color do you get by mixing red and yellow?",
    options: ["Green", "Purple", "Orange", "Brown"],
    answer: 2,
    difficulty: "easy"
  },
  {
    q: "What is the largest mammal in the world?",
    options: ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
    answer: 1,
    difficulty: "easy"
  },
  {
    q: "What chemical formula represents water?",
    options: ["CO2", "O2", "H2O", "NaCl"],
    answer: 2,
    difficulty: "easy"
  },
  {
    q: "How many continents are there on Earth?",
    options: ["5", "6", "7", "8"],
    answer: 2,
    difficulty: "easy"
  },
  {
    q: "Which animal is commonly known as the 'King of the Jungle'?",
    options: ["Tiger", "Lion", "Gorilla", "Leopard"],
    answer: 1,
    difficulty: "easy"
  },
  {
    q: "What is the boiling point of water at sea level in Celsius?",
    options: ["90°C", "100°C", "120°C", "80°C"],
    answer: 1,
    difficulty: "easy"
  },
  {
    q: "Which shape has three sides?",
    options: ["Square", "Triangle", "Pentagon", "Hexagon"],
    answer: 1,
    difficulty: "easy"
  },
  {
    q: "What is the name of the fairy in Peter Pan?",
    options: ["Tinker Bell", "Flora", "Fauna", "Merryweather"],
    answer: 0,
    difficulty: "easy"
  },
  {
    q: "Which country is famous for the Eiffel Tower?",
    options: ["Italy", "Germany", "France", "Spain"],
    answer: 2,
    difficulty: "easy"
  },
  {
    q: "What is the primary color of an emerald?",
    options: ["Blue", "Red", "Yellow", "Green"],
    answer: 3,
    difficulty: "easy"
  },
  {
    q: "How many legs does a spider have?",
    options: ["6", "8", "10", "12"],
    answer: 1,
    difficulty: "easy"
  },
  {
    q: "Which fruit is associated with Isaac Newton and gravity?",
    options: ["Orange", "Banana", "Apple", "Peach"],
    answer: 2,
    difficulty: "easy"
  },
  {
    q: "Which ocean is the largest on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"],
    answer: 2,
    difficulty: "easy"
  },
  {
    q: "What is the currency of the United States?",
    options: ["Euro", "Dollar", "Pound", "Yen"],
    answer: 1,
    difficulty: "easy"
  },
  {
    q: "In which season do leaves typically change color and fall?",
    options: ["Spring", "Summer", "Autumn (Fall)", "Winter"],
    answer: 2,
    difficulty: "easy"
  },
  {
    q: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"],
    answer: 2,
    difficulty: "easy"
  },
  {
    q: "How many hours are there in a single day?",
    options: ["12", "24", "48", "60"],
    answer: 1,
    difficulty: "easy"
  },
  {
    q: "Which continent is Egypt located in?",
    options: ["Asia", "Europe", "Africa", "South America"],
    answer: 2,
    difficulty: "easy"
  },
  {
    q: "What device is used to measure temperature?",
    options: ["Barometer", "Thermometer", "Speedometer", "Compass"],
    answer: 1,
    difficulty: "easy"
  },
  {
    q: "What is the opposite of the word 'Hot'?",
    options: ["Warm", "Cold", "Bright", "Dark"],
    answer: 1,
    difficulty: "easy"
  },
  {
    q: "Which planet is known as the 'Red Planet'?",
    options: ["Jupiter", "Venus", "Mars", "Saturn"],
    answer: 2,
    difficulty: "easy"
  },
  {
    q: "How many letters are in the standard English alphabet?",
    options: ["24", "25", "26", "27"],
    answer: 2,
    difficulty: "easy"
  }
];

export const MEDIUM_QUESTIONS: QuestionItem[] = [
  {
    q: "What year did the Titanic sink in the North Atlantic?",
    options: ["1905", "1912", "1918", "1923"],
    answer: 1,
    difficulty: "medium"
  },
  {
    q: "Which human organ produces the hormone insulin?",
    options: ["Liver", "Kidney", "Pancreas", "Gallbladder"],
    answer: 2,
    difficulty: "medium"
  },
  {
    q: "What is the capital city of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
    answer: 2,
    difficulty: "medium"
  },
  {
    q: "Who was the first woman to win a Nobel Prize?",
    options: ["Rosalind Franklin", "Marie Curie", "Ada Lovelace", "Jane Goodall"],
    answer: 1,
    difficulty: "medium"
  },
  {
    q: "Which gas is most abundant in the Earth's atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
    answer: 2,
    difficulty: "medium"
  },
  {
    q: "In what country was the game of Chess originally invented?",
    options: ["China", "India", "Persia", "Egypt"],
    answer: 1,
    difficulty: "medium"
  },
  {
    q: "What is the hardest natural substance found on Earth?",
    options: ["Titanium", "Diamond", "Graphene", "Quartz"],
    answer: 1,
    difficulty: "medium"
  },
  {
    q: "Which ancient civilization constructed the Machu Picchu citadel?",
    options: ["Aztec", "Maya", "Inca", "Olmec"],
    answer: 2,
    difficulty: "medium"
  },
  {
    q: "What is the name of the galaxy containing our Solar System?",
    options: ["Andromeda", "Whirlpool", "Milky Way", "Sombrero"],
    answer: 2,
    difficulty: "medium"
  },
  {
    q: "Which European city is built entirely on a group of 118 small islands?",
    options: ["Amsterdam", "Venice", "Bruges", "Stockholm"],
    answer: 1,
    difficulty: "medium"
  },
  {
    q: "Who wrote the play 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"],
    answer: 1,
    difficulty: "medium"
  },
  {
    q: "What is the capital of Canada?",
    options: ["Toronto", "Vancouver", "Montreal", "Ottawa"],
    answer: 3,
    difficulty: "medium"
  },
  {
    q: "Which element has the chemical symbol 'Fe'?",
    options: ["Fluorine", "Iron", "Francium", "Fermium"],
    answer: 1,
    difficulty: "medium"
  },
  {
    q: "How many bones are in the adult human body?",
    options: ["186", "206", "226", "246"],
    answer: 1,
    difficulty: "medium"
  },
  {
    q: "What is the longest river in South America?",
    options: ["Paraná River", "Amazon River", "Orinoco River", "Magdalena River"],
    answer: 1,
    difficulty: "medium"
  },
  {
    q: "In computing, what does CPU stand for?",
    options: ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Core Power Unit"],
    answer: 1,
    difficulty: "medium"
  },
  {
    q: "Which planet in our solar system rotates on its side with a 98° tilt?",
    options: ["Neptune", "Uranus", "Saturn", "Jupiter"],
    answer: 1,
    difficulty: "medium"
  },
  {
    q: "Who formulated the theory of general relativity?",
    options: ["Isaac Newton", "Niels Bohr", "Albert Einstein", "Stephen Hawking"],
    answer: 2,
    difficulty: "medium"
  },
  {
    q: "Which nation won the first FIFA Football World Cup in 1930?",
    options: ["Brazil", "Argentina", "Uruguay", "Italy"],
    answer: 2,
    difficulty: "medium"
  },
  {
    q: "What is the primary ingredient in traditional Japanese miso soup?",
    options: ["Soybean paste", "Rice flour", "Seaweed", "Fish oil"],
    answer: 0,
    difficulty: "medium"
  }
];

export const HARD_QUESTIONS: QuestionItem[] = [
  {
    q: "The Fields Medal in mathematics is awarded once every how many years?",
    options: ["2 years", "3 years", "4 years", "5 years"],
    answer: 2,
    difficulty: "hard"
  },
  {
    q: "What is the rarest naturally occurring element in the Earth's crust?",
    options: ["Francium", "Astatine", "Promethium", "Californium"],
    answer: 1,
    difficulty: "hard"
  },
  {
    q: "Which treaty officially brought an end to the Thirty Years' War in 1648?",
    options: ["Treaty of Versailles", "Peace of Westphalia", "Treaty of Utrecht", "Treaty of Ghent"],
    answer: 1,
    difficulty: "hard"
  },
  {
    q: "What is the SI unit of magnetic flux density?",
    options: ["Weber", "Tesla", "Henry", "Gauss"],
    answer: 1,
    difficulty: "hard"
  },
  {
    q: "Which Ivy League university has its official motto written in Hebrew as well as Latin?",
    options: ["Harvard", "Princeton", "Columbia", "Yale"],
    answer: 3,
    difficulty: "hard"
  },
  {
    q: "What is the deepest point in the world's oceans?",
    options: ["Tonga Trench", "Puerto Rico Trench", "Challenger Deep", "Java Trench"],
    answer: 2,
    difficulty: "hard"
  },
  {
    q: "Which Roman emperor made his favorite horse, Incitatus, a senator?",
    options: ["Nero", "Caligula", "Commodus", "Domitian"],
    answer: 1,
    difficulty: "hard"
  },
  {
    q: "In organic chemistry, what is the geometric shape of a methane molecule (CH4)?",
    options: ["Planar", "Octahedral", "Tetrahedral", "Pyramidal"],
    answer: 2,
    difficulty: "hard"
  },
  {
    q: "Which was the first country to give women the unrestricted right to vote in 1893?",
    options: ["United Kingdom", "United States", "New Zealand", "Finland"],
    answer: 2,
    difficulty: "hard"
  },
  {
    q: "What mathematical constant is approximately equal to 2.71828?",
    options: ["Pi", "Euler's Number (e)", "Golden Ratio (phi)", "Feigenbaum constant"],
    answer: 1,
    difficulty: "hard"
  },
  {
    q: "What is the only sea on Earth with no land boundaries?",
    options: ["Sargasso Sea", "Weddell Sea", "Red Sea", "Baltic Sea"],
    answer: 0,
    difficulty: "hard"
  },
  {
    q: "Who was the Byzantine emperor responsible for commissioning the Hagia Sophia in 537 AD?",
    options: ["Constantine the Great", "Justinian I", "Theodosius II", "Heraclius"],
    answer: 1,
    difficulty: "hard"
  },
  {
    q: "Which subatomic particle was discovered by James Chadwick in 1932?",
    options: ["Proton", "Neutron", "Positron", "Neutrino"],
    answer: 1,
    difficulty: "hard"
  },
  {
    q: "What African country was formerly known as 'Abyssinia'?",
    options: ["Eritrea", "Sudan", "Ethiopia", "Somalia"],
    answer: 2,
    difficulty: "hard"
  },
  {
    q: "What is the medical name for the condition commonly known as 'dry eyes'?",
    options: ["Keratoconus", "Xerophthalmia", "Presbyopia", "Astigmatism"],
    answer: 1,
    difficulty: "hard"
  }
];

// Helper function to build a 10-question progressive game:
// Questions 1-3: Easy
// Questions 4-7: Medium
// Questions 8-10: Hard
export function getProgressiveQuizQuestions(total = 10): QuestionItem[] {
  const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => 0.5 - Math.random());
  
  const easy = shuffle(EASY_QUESTIONS).slice(0, 3);
  const medium = shuffle(MEDIUM_QUESTIONS).slice(0, 4);
  const hard = shuffle(HARD_QUESTIONS).slice(0, 3);

  return [...easy, ...medium, ...hard];
}

export const QUIZ_QUESTIONS = [
  ...EASY_QUESTIONS,
  ...MEDIUM_QUESTIONS,
  ...HARD_QUESTIONS
];
