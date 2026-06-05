import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const winax = require("winax");
const app = new winax.Object("Photoshop.Application");
const doc = app.activeDocument;

console.log(doc.Name);

const new_layer = doc.ArtLayers.Add();
new_layer.Name = "fuckyou";
