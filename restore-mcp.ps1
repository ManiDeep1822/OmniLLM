$config = "{""mcpServers"":{""llm-gateway"":{""command"":""node"",""args"":[""C:/Users/indla/OneDrive/Desktop/MCP/dist/server.js""],""env"":{""GEMINI_API_KEY"":""AIzaSyA_q5Ms5HdsG8B_4JyfPa2x_esKqH9DthI"",""CLAUDE_API_KEY"":"""",""OPENAI_API_KEY"":"""",""PORT"":""3000"",""DATABASE_URL"":""file:./prisma/dev.db""}}}}"
$config | Set-Content -Path "C:\Users\indla\.gemini\antigravity\mcp_config.json" -Encoding UTF8
Write-Host "MCP config restored successfully"
