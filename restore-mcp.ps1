$config = "{""mcpServers"":{""llm-gateway"":{""command"":""node"",""args"":[""C:/Users/indla/OneDrive/Desktop/MCP/dist/server.js""],""env"":{""GEMINI_API_KEY"":""AIzaSyDRRMfIdYe18FYWDoAetz6W0a99Knj2RIQ"",""CLAUDE_API_KEY"":"""",""OPENAI_API_KEY"":"""",""PORT"":""3000"",""DATABASE_URL"":""file:./prisma/dev.db""}}}}"
$config | Set-Content -Path "C:\Users\indla\.gemini\antigravity\mcp_config.json" -Encoding UTF8
Write-Host "MCP config restored successfully"
AIzaSyDRRMfIdYe18FYWDoAetz6W0a99Knj2RIQ