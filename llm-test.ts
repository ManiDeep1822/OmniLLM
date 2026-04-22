import { registry } from './src/providers/index.js';
import { handleStreamingRequest } from './src/utils/streaming-helper.js';
import dotenv from 'dotenv';

dotenv.config();

const test = async () => {
    console.log("Testing LLMGateway Providers...");
    const prompt = "Briefly explain what an MCP server is.";
    
    try {
        const available = registry.getAvailableProviders();
        if (available.length === 0) {
            console.error("No API keys found in .env file.");
            return;
        }
        
        const providerName = available[0];
        console.log(`\n--- Testing Single Prompt (${providerName}) ---`);
        const response = await handleStreamingRequest(prompt, providerName);
        console.log("Success! Response received.");
    } catch (error: any) {
        console.error("Test failed. Check your API keys and provider availability.");
        console.error("Error:", error.message);
    }
};

test();
