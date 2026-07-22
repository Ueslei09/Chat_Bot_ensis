module.exports = {
  apps: [
    {
      name: "MEUBANCO_CHAT",
      script: "serve.js",
      cwd: "C:\\Users\\costa\\Documents\\MEUBANCO_CHAT"
    },
    {
      name: "ChatBOT_Moove",
      script: "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js",
      args: "run dev",
      cwd: "C:\\Users\\costa\\Documents\\ChatBOT_ensis\\Chat_Bot_ensis",
      interpreter: "node",
      windowsHide: true 
    }
  ]
};