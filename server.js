const express = require('express');
const cors = require('cors');
const { create } = require('venom-bot');

const app = express();
app.use(cors());

let clients = {};

app.get('/connect/:sessionId', async (req, res) => {
  const sessionId = req.params.sessionId;

  if (clients[sessionId]) {
    return res.json({ status: 'already_connected' });
  }

  create({
    session: sessionId,
    multidevice: true
  })
    .then((client) => {
      clients[sessionId] = client;

      client.onMessage((message) => {
        console.log(`[${sessionId}] Mensagem recebida:`, message.body);
      });

      client.onStateChange((state) => {
        console.log(`[${sessionId}] Estado da sessão:`, state);
      });

      client.onStreamChange((state) => {
        if (state === 'DISCONNECTED') {
          delete clients[sessionId];
        }
      });

      client.on('qr', (qrCode) => {
        console.log(`[${sessionId}] QR gerado`);
      });

      res.json({ status: 'connecting', info: 'Sessão iniciada com sucesso' });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Erro ao iniciar sessão' });
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor Venom rodando na porta ${PORT}`);
});
