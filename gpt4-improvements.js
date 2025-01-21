const axios = require('axios');
const fs = require('fs');
const path = require('path');

const openaiApiKey = process.env.OPENAI_API_KEY;

const generateImprovement = async (code) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that suggests improvements to code."
        },
        {
          role: "user",
          content: `Here is a code snippet. Suggest improvements and randomly modify the code:\n\n${code}`
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error communicating with OpenAI API:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
};

const getFiles = (dir) => {
  const files = fs.readdirSync(dir);
  return files.filter(file => file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.py')); // Add file types you care about
};

const applyImprovements = async () => {
  const files = getFiles('.');
  for (let file of files) {
    const code = fs.readFileSync(file, 'utf8');
    console.log(`Improving code in file: ${file}`);
    const improvedCode = await generateImprovement(code);
    fs.writeFileSync(file, improvedCode, 'utf8');
  }
};

applyImprovements().then(() => {
  console.log('Improvements applied to codebase');
}).catch(err => {
  console.error('Error applying improvements:', err);
  process.exit(1);
});
