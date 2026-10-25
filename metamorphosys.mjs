import { EpineActor }     from "./module/actor/actor.mjs";
import { EpineActorData } from "./module/actor/actor-data.mjs";
import { EpineActorSheet } from "./module/actor/actor-sheet.mjs";

Hooks.once("init", function () {
  console.log("Metamorphosys | Initialisation — Monde d'Eniel");

  /* ── Enregistrement du DataModel natif v13 ── */
  CONFIG.Actor.dataModels.epine = EpineActorData;

  CONFIG.Actor.documentClass = EpineActor;

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("metamorphosys", EpineActorSheet, {
    types: ["epine"],
    makeDefault: true,
    label: "Feuille d'Épine Pourpre"
  });

  /* ── Handlebars helpers ── */
  Handlebars.registerHelper("metaSelected", (current, option) =>
    current === option ? "selected" : "");

  Handlebars.registerHelper("concat", (...args) => args.slice(0, -1).join(""));

  return loadTemplates([
    "systems/metamorphosys/templates/actor/epine-sheet.hbs"
  ]);
});
