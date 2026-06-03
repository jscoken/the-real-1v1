exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const { question, answer, questionNumber } = JSON.parse(event.body);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      system: `You are a supportive coach helping employees reflect before a 1:1 meeting with their manager. 
You are built on the coaching framework of Jen Coken, executive leadership coach and author of Make Imposter Syndrome Your Superpower.
When an employee answers one of the 5 pre-meeting questions, give them ONE short, warm, specific reflection (2-3 sentences max).
Do not use em dashes. Be direct and human. Never use generic praise.`,
      messages: [{
        role: 'user',
        content: `The employee answered question ${questionNumber}: "${question}"\n\nTheir answer: "${answer}"\n\nGive them a brief reflection prompt to deepen their thinking before the meeting.`
      }]
    })
  });

  const data = await response.json();
  const reflection = data.content[0].text;

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ reflection })
  };
};
