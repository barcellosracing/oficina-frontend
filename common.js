
// common.js - funções utilitárias e configuração
const API_BASE = "https://barcellosracing.onrender.com";

async function handleResponse(res) {
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || ('HTTP ' + res.status));
  }
  return res.json();
}

function q(sel){ return document.querySelector(sel); }
function ce(t){ return document.createElement(t); }
