window.function = async function(api_key, system_prompt, message, model, temperature, max_tokens, frequency_penalty) {
  // GET VALUES FROM INPUTS, WITH DEFAULT VALUES WHERE APPLICABLE
  const apiKey = api_key.value ?? "";
  const systemPromptValue = system_prompt.value ?? "You are a helpful assistant.";
  const messageValue = message.value ?? "";
  const modelValue = model.value ?? "gpt-3.5-turbo";
  const temperatureValue = temperature.value ?? 1.0;
  const maxTokensValue = max_tokens.value ?? 1000;
  const frequencyPenaltyValue = frequency_penalty.value ?? 0.0;

  // INPUT VALIDATION
  if (!apiKey) {
    return "API Key is required.";
  }
  if (!messageValue) {
    return "Please enter a message.";
  }

  // VALIDATE NUMERICAL INPUTS
  const temp = parseFloat(temperatureValue);
  const maxTokens = parseInt(maxTokensValue);
  const freqPenalty = parseFloat(frequencyPenaltyValue);

  // DETERMINE IF THE MODEL IS A REASONING MODEL
  const reasoningModels = ['o1-mini', 'o1-preview'];
  const isReasoningModel = reasoningModels.includes(modelValue.toLowerCase());

  // BUILD THE REQUEST PAYLOAD
  let payload = {
    model: modelValue,
    messages: []
  };

  if (isReasoningModel) {
    // REASONING MODELS (NO SYSTEM PROMPT OR PARAMETERS)
    const combinedMessage = `${systemPromptValue}\n\n${messageValue}`;
    payload.messages = [
      { role: 'user', content: combinedMessage }
    ];
  } else {
    // STANDARD MODELS
    payload.messages = [
      { role: 'system', content: systemPromptValue },
      { role: 'user', content: messageValue }
    ];
    payload.temperature = temp;
    payload.max_completion_tokens = maxTokens;
    payload.frequency_penalty = freqPenalty;
  }

  // PERFORM POST REQUEST TO OPEN AI
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    // IF THERE'S AN ERROR, RETURN THE ERROR MESSAGE
    if (!response.ok) {
      const errorData = await response.json();
      return `Error ${response.status}: ${errorData.error.message}`;
    }

    // ELSE, PARSE THE RESPONSE
    const data = await response.json();
    const assistantMessage = data.choices[0].message.content.trim();

    // RETURN THE ASSISTANT MESSAGE
    return assistantMessage;

    // CATCH ANY ERRORS THAT OCCUR WHILE FETCHING THE RESPONSE
  } catch (error) {
    return `Request failed: ${error.message}`;
  }
};
