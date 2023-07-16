import template from './template.html';

async function openAI(model, messages, apiKey) {
  const apiURL = 'https://api.openai.com/v1/chat/completions';
  //const model = content.length > 3000 ? 'gpt-3.5-turbo-16k-0613' : 'gpt-3.5-turbo-0613';
  const response = await fetch(apiURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      messages: messages,
      model: model,
      max_tokens: 2048,
      temperature: 0.5
    })
  });

  if (!response.ok) {
    return new Response(await response.text(), { status: 400});
  }
  const resp = await response.json();
  //return new Response(resp);
  return new Response(resp['choices'][0]['message']['content'].toString());
}

export default {
  async fetch(request, env) {

    // 安全检查
    const auth = request.headers.get('Authorization');
    if (!auth || auth !== `Basic ${env.TOKEN}`) {
      return new Response(
        `Login Required`,
        { headers: { 'Content-Type': 'text/html','WWW-Authenticate': 'Basic realm="Login Required"' }, status: 401 }
      );
    }

    if(request.method == "GET"){
      const body = template.toString();
      return new Response(body, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    if (request.method === "OPTIONS") {
      return new Response("");
    }

    const body = await request.text();
    const reqJson = JSON.parse(body)

    return openAI(reqJson.model,reqJson.messages,`${env.OPENAI_KEY}`);
  }
};