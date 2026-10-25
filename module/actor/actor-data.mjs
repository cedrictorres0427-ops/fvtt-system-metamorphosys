const { SchemaField, StringField, NumberField, ArrayField, BooleanField } =
  foundry.data.fields;

/* ── Helpers ── */
const caracField = (max) => new SchemaField({
  value: new NumberField({ initial: 0, integer: true, min: 0 }),
  max:   new NumberField({ initial: max, integer: true, min: 1 })
});

const skillsArray = () => new ArrayField(new SchemaField({
  nom:       new StringField({ initial: "" }),
  duree:     new StringField({ initial: "permanent" }),
  intensite: new StringField({ initial: "faible" })
}), { initial: [] });

const baseStage = (maxCarac) => ({
  debloque:    new BooleanField({ initial: false }),
  physique:    caracField(maxCarac),
  esprit:      caracField(maxCarac),
  mental:      caracField(maxCarac),
  competences: skillsArray(),
  techniques:  skillsArray()
});

const highStage = (maxCarac) => ({
  ...baseStage(maxCarac),
  capacites: skillsArray()
});

/* ══════════════════════════════════════════════════════════
   EpineActorData — TypeDataModel natif Foundry v13
   ══════════════════════════════════════════════════════════ */
export class EpineActorData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {
      identite: new SchemaField({
        surnom:  new StringField({ initial: "" }),
        numero:  new NumberField({ initial: 0, integer: true, min: 0 }),
        insigne: new StringField({ initial: "" })
      }),
      pointsARepartir: new NumberField({ initial: 0, integer: true, min: 0 }),
      stadeVue:        new StringField({ initial: "" }),

      /* ── Stades de base (création) ── */
      humain:        new SchemaField(baseStage(20)),
      latent:        new SchemaField(baseStage(4)),
      intermediaire: new SchemaField(baseStage(4)),
      eveille:       new SchemaField(baseStage(4)),

      /* ── Stades supérieurs (expérience) ── */
      devoreur: new SchemaField(highStage(6)),
      ogre:     new SchemaField(highStage(6)),
      strige:   new SchemaField(highStage(8)),
      goule:    new SchemaField(highStage(8)),
      exalte:   new SchemaField(highStage(10)),
      abyssal:  new SchemaField(highStage(12)),

      inventaire: new ArrayField(new SchemaField({
        nom: new StringField({ initial: "" })
      }), { initial: [] })
    };
  }
}
