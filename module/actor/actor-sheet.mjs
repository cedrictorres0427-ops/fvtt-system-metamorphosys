const STAGE_CONFIG = [
  { key: 'humain',        label: 'Stade Humain',          num: 'I',    oeil: "Pupilles d'origine",                  seuil: null, maxCarac: 20, hasCapacites: false },
  { key: 'latent',        label: 'Monstre Latent',        num: 'II',   oeil: 'Yeux injectés de sang',               seuil: 3,    maxCarac: 4,  hasCapacites: false },
  { key: 'intermediaire', label: 'Monstre Intermédiaire', num: 'III',  oeil: 'Yeux de cuivre',                      seuil: 7,    maxCarac: 4,  hasCapacites: false },
  { key: 'eveille',       label: 'Monstre Éveillé',       num: 'IV',   oeil: 'Yeux de bronze',                      seuil: 12,   maxCarac: 4,  hasCapacites: false },
  { key: 'devoreur',      label: 'Dévoreur',              num: 'V',    oeil: 'Yeux argent — visage défiguré',        seuil: 18,   maxCarac: 6,  hasCapacites: true  },
  { key: 'ogre',          label: 'Ogre Glouton',          num: 'VI',   oeil: 'Yeux argent — corps tordu',            seuil: 25,   maxCarac: 6,  hasCapacites: true  },
  { key: 'strige',        label: 'Strige',                num: 'VII',  oeil: 'Yeux or — excroissances',              seuil: 33,   maxCarac: 8,  hasCapacites: true  },
  { key: 'goule',         label: 'Goule Vorace',          num: 'VIII', oeil: 'Yeux or — corps de Morphosys',         seuil: 42,   maxCarac: 8,  hasCapacites: true  },
  { key: 'exalte',        label: 'Exalté',                num: 'IX',   oeil: 'Yeux azur / violet / noir',            seuil: 52,   maxCarac: 10, hasCapacites: true  },
  { key: 'abyssal',       label: 'Abyssal',               num: 'X',    oeil: 'Yeux azur / violet / noir — colossal', seuil: 63,   maxCarac: 12, hasCapacites: true  },
];

export class EpineActorSheet extends ActorSheet {

  constructor(...args) {
    super(...args);
    this._openStades = new Set(['humain']);
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['metamorphosys', 'sheet', 'actor', 'epine'],
      template: 'systems/metamorphosys/templates/actor/epine-sheet.hbs',
      width: 800,
      height: 940,
      scrollY: ['.sheet-body'],
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'stades' }],
      submitOnChange: true,   // Let Foundry handle named-field persistence normally
      closeOnSubmit: false
    });
  }

  getData() {
    const ctx = super.getData();
    const sys = this.actor.system;

    ctx.stagesData = STAGE_CONFIG.map(cfg => {
      const d = sys[cfg.key] ?? {};
      return {
        ...cfg,
        physique:    d.physique    ?? { value: 0, max: cfg.maxCarac },
        esprit:      d.esprit      ?? { value: 0, max: cfg.maxCarac },
        mental:      d.mental      ?? { value: 0, max: cfg.maxCarac },
        competences: d.competences ?? [],
        techniques:  d.techniques  ?? [],
        capacites:   d.capacites   ?? [],
        debloque:    d.debloque    ?? false,
        open:        this._openStades.has(cfg.key)
      };
    });

    ctx.stadesDebloques = STAGE_CONFIG
      .filter(cfg => sys[cfg.key]?.debloque)
      .map(cfg => ({ key: cfg.key, label: cfg.label }));

    ctx.stadeVue      = sys.stadeVue      ?? '';
    ctx.inventaire    = sys.inventaire    ?? [];
    ctx.totalPhysique = sys.totalPhysique ?? 0;
    ctx.totalEsprit   = sys.totalEsprit   ?? 0;
    ctx.totalMental   = sys.totalMental   ?? 0;

    /* ── Identity fields stored as flags (100% fiable) ── */
    ctx.surnom  = this.actor.getFlag('metamorphosys', 'surnom')  ?? '';
    ctx.numero  = this.actor.getFlag('metamorphosys', 'numero')  ?? '';
    ctx.insigne = this.actor.getFlag('metamorphosys', 'insigne') ?? '';
    ctx.pts     = this.actor.getFlag('metamorphosys', 'pts')     ?? 0;

    return ctx;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;

    /* ── Accordion toggle ── */
    html.find('.stade-header').on('click', ev => {
      if (ev.target.classList.contains('stade-debloque-cb')) return;
      const block = ev.currentTarget.closest('.stade-block');
      const key   = block.dataset.stadeKey;
      block.classList.toggle('open');
      if (block.classList.contains('open')) this._openStades.add(key);
      else                                  this._openStades.delete(key);
    });

    /* ── 4 identity fields — setFlag (bulletproof) ── */
    html.find('#inp-surnom').on('change',  ev => this.actor.setFlag('metamorphosys', 'surnom',  ev.currentTarget.value));
    html.find('#inp-numero').on('change',  ev => this.actor.setFlag('metamorphosys', 'numero',  ev.currentTarget.value));
    html.find('#inp-insigne').on('change', ev => this.actor.setFlag('metamorphosys', 'insigne', ev.currentTarget.value));
    html.find('#inp-pts').on('change',     ev => this.actor.setFlag('metamorphosys', 'pts',     parseInt(ev.currentTarget.value) || 0));

    /* ── Débloqué checkbox — explicit update (boolean needs special handling) ── */
    html.find('.stade-debloque-cb').on('change', async ev => {
      const stade   = ev.currentTarget.dataset.stade;
      const checked = ev.currentTarget.checked;
      await this.actor.update({ [`system.${stade}.debloque`]: checked });
    });

    /* ── Add array item ── */
    html.find('.btn-add-array').on('click', async ev => {
      const el  = ev.currentTarget;
      const arr = foundry.utils.deepClone(this.actor.system[el.dataset.stade]?.[el.dataset.type] ?? []);
      arr.push({ nom: '', duree: 'permanent', intensite: 'faible' });
      await this.actor.update({ [`system.${el.dataset.stade}.${el.dataset.type}`]: arr });
    });

    /* ── Remove array item ── */
    html.find('.btn-remove-array').on('click', async ev => {
      const row = ev.currentTarget.closest('.array-row');
      const arr = foundry.utils.deepClone(this.actor.system[row.dataset.stade]?.[row.dataset.type] ?? []);
      arr.splice(parseInt(row.dataset.index), 1);
      await this.actor.update({ [`system.${row.dataset.stade}.${row.dataset.type}`]: arr });
    });

    /* ── Array item field changes ── */
    html.find('.array-nom').on('change',       ev => this._patchArrayItem(ev.currentTarget, { nom:       ev.currentTarget.value }));
    html.find('.array-duree').on('change',     ev => this._patchArrayItem(ev.currentTarget, { duree:     ev.currentTarget.value }));
    html.find('.array-intensite').on('change', ev => this._patchArrayItem(ev.currentTarget, { intensite: ev.currentTarget.value }));

    /* ── Inventaire: add ── */
    html.find('.btn-add-inv').on('click', async () => {
      const inv = foundry.utils.deepClone(this.actor.system.inventaire ?? []);
      inv.push({ nom: '' });
      await this.actor.update({ 'system.inventaire': inv });
    });

    /* ── Inventaire: remove ── */
    html.find('.btn-remove-inv').on('click', async ev => {
      const row = ev.currentTarget.closest('.inv-row');
      const inv = foundry.utils.deepClone(this.actor.system.inventaire ?? []);
      inv.splice(parseInt(row.dataset.index), 1);
      await this.actor.update({ 'system.inventaire': inv });
    });

    /* ── Inventaire: nom ── */
    html.find('.inv-nom').on('change', async ev => {
      const row = ev.currentTarget.closest('.inv-row');
      const inv = foundry.utils.deepClone(this.actor.system.inventaire ?? []);
      const idx = parseInt(row.dataset.index);
      if (inv[idx] !== undefined) {
        inv[idx].nom = ev.currentTarget.value;
        await this.actor.update({ 'system.inventaire': inv });
      }
    });
  }

  async _patchArrayItem(el, patch) {
    const row = el.closest('.array-row');
    const arr = foundry.utils.deepClone(this.actor.system[row.dataset.stade]?.[row.dataset.type] ?? []);
    const idx = parseInt(row.dataset.index);
    if (arr[idx] === undefined) return;
    Object.assign(arr[idx], patch);
    await this.actor.update({ [`system.${row.dataset.stade}.${row.dataset.type}`]: arr });
  }
}
