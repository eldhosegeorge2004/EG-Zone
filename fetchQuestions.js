const fs = require('fs');

async function fetchQuestions() {
  console.log('Starting to fetch questions...');
  const allQuestions = [];
  
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('https://opentdb.com/api.php?amount=50&type=multiple');
      const data = await res.json();
      
      if (data.results) {
        for (const item of data.results) {
          const decode = (str) => {
            return str
              .replace(/&quot;/g, '"')
              .replace(/&#039;/g, "'")
              .replace(/&amp;/g, "&")
              .replace(/&rsquo;/g, "'")
              .replace(/&lsquo;/g, "'")
              .replace(/&ldquo;/g, '"')
              .replace(/&rdquo;/g, '"')
              .replace(/&eacute;/g, "é")
              .replace(/&oacute;/g, "ó")
              .replace(/&ntilde;/g, "ñ");
          };
          
          let options = [item.correct_answer, ...item.incorrect_answers].map(decode);
          // Shuffle options
          options = options.sort(() => Math.random() - 0.5);
          const answerIdx = options.indexOf(decode(item.correct_answer));
          
          allQuestions.push({
            q: decode(item.question),
            options,
            answer: answerIdx
          });
        }
      }
      console.log('Fetched page ' + (i+1));
      // wait 3 seconds to avoid rate limiting
      await new Promise(r => setTimeout(r, 3000));
    } catch (e) {
      console.error('Error fetching', e);
    }
  }
  
  const fileContent = '/* eslint-disable */\nexport const QUIZ_QUESTIONS = ' + JSON.stringify(allQuestions, null, 2) + ';';
  fs.writeFileSync('./src/games/quiz/questions.ts', fileContent);
  console.log('Saved ' + allQuestions.length + ' questions to src/games/quiz/questions.ts');
}

fetchQuestions();
