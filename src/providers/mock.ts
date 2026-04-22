import { LLMProvider, StreamHandler, ProviderResponse } from './index.js';

export class MockProvider implements LLMProvider {
  name = 'Simulation (Offline)';

  private responses = [
    "I am currently operating in Simulation Mode because your real API keys are either reaching their quota or returning a Forbidden error. This allows you to verify that the dashboard's live feed and socket connections are working perfectly!",
    "This is a simulated response. In a production environment, this would be replaced by real-time output from Gemini, Claude, or OpenAI. The fact that you are seeing these words streaming proves that your backend and frontend are correctly synchronized on the current port.",
    "Beep boop. I am the Mock Provider. I consume no credits but I provide high-velocity testing data. The dashboard metrics you see are derived from this simulated stream."
  ];

  async generate(prompt: string, options: any = {}): Promise<ProviderResponse> {
    const text = this.responses[Math.floor(Math.random() * this.responses.length)];
    return {
      content: text,
      usage: {
        promptTokens: prompt.length / 4,
        completionTokens: text.length / 4,
      },
    };
  }

  async stream(prompt: string, handler: StreamHandler, options: any = {}): Promise<void> {
    const text = this.responses[Math.floor(Math.random() * this.responses.length)];
    const tokens = text.split(' ');

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i] + (i === tokens.length - 1 ? '' : ' ');
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 80));
        
        handler({ text: token, isFinished: false });
    }

    handler({
        text: '',
        isFinished: false,
        usage: {
            promptTokens: Math.floor(prompt.length / 4),
            completionTokens: tokens.length,
        }
    });

    handler({ text: '', isFinished: true });
  }
}
