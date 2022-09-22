const fastify = require('fastify').default();
const ffStatic = require('@fastify/static');
const ffCookie = require('@fastify/cookie');
const ffFormbody = require('@fastify/formbody');

require('dotenv/config');
const path = require('path');
const Vote = require('./db.js');
const Webhook = require('./webhook.js');

const rickroll = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';


function arrayCount(array) {
  const res = {};
  for (const item of array) {
    res[item] ??= 0;
    res[item]++;
  }
  return res;
}

async function updateVotes() {
  const votes = (await Vote.find()).filter(vote => vote.amount !== null);
  const DME = await import('discord-markdown-embeds');
  await Webhook.edit(process.env.WEBHOOK_URL, process.env.MESSAGE_ID, {
    embeds: DME.render(`
---
color: 0x2d3136
---

# TCN vote
How many should the recommended minimum member count to join the TCN be?

${Object.entries(arrayCount(votes.map(vote => vote.amount))).map(([k, v]) => `**${k}**: ${v}`).join('\\\n')}

**Average:** ${Math.round(votes.map(vote => vote.amount).reduce((a, v) => a + v, 0) / votes.length || 0)}
    `),
  });
}


fastify.register(ffStatic, {
  root: path.resolve(__dirname, 'public'),
});
fastify.register(ffCookie);
fastify.register(ffFormbody);

fastify.addHook('onRequest', async (request, reply) => {
  request.user = request.cookies.token && await fetch(`${process.env.API_URL}/auth/user`, { headers: { 'Authorization': request.cookies.token } }).then(res => res.ok && res.json());
  if (!request.user) await reply.redirect(`${process.env.AUTH_URL}?redirect=${encodeURIComponent(process.env.OWN_URL)}`);
});


fastify.get('/', async (request, reply) => {
  return reply.sendFile('index.html');
});


fastify.post('/submit', async (request, reply) => {
  const amount = +request.body.members;
  if (!request.user?.roles.includes('voter') || amount < 0 || amount > 500 || amount % 1) return reply.redirect(rickroll);

  await Vote.updateOne({ user: request.user.id }, { amount }, { upsert: true });
  //await updateVotes();

  return reply.sendFile('submitted.html');
});

fastify.get('/abstain', async (request, reply) => {
  if (!request.user?.roles.includes('voter')) return reply.redirect(rickroll);
  
  await Vote.updateOne({ user: request.user.id }, { amount: null }, { upsert: true });
  //await updateVotes();

  return reply.sendFile('submitted.html');
});


fastify.listen({ port: process.env.PORT }).then(() => {
  console.log('ready!');
});
