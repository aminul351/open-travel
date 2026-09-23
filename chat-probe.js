const chat = require("C:/projects/open travel/server/chat.js");
const out = {
  keys: Object.keys(chat),
  sigs: {},
};
for (const k of Object.keys(chat)) {
  out.sigs[k] = typeof chat[k];
}
console.log(JSON.stringify(out, null, 2));
