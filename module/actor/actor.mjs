const STAGE_KEYS = [
  'humain','latent','intermediaire','eveille',
  'devoreur','ogre','strige','goule','exalte','abyssal'
];

export class EpineActor extends Actor {

  /** @override */
  prepareDerivedData() {
    const sys = this.system;

    /* Cumulative totals per stage (running sum in stage order) */
    let runPhy = 0, runEsp = 0, runMen = 0;
    const cumulatifs = {};

    for (const key of STAGE_KEYS) {
      runPhy += sys[key]?.physique?.value ?? 0;
      runEsp += sys[key]?.esprit?.value   ?? 0;
      runMen += sys[key]?.mental?.value   ?? 0;
      cumulatifs[key] = { phy: runPhy, esp: runEsp, men: runMen };
    }

    /* Apply stadeVue filter if valid */
    const vue = sys.stadeVue;
    if (vue && sys[vue]?.debloque && cumulatifs[vue]) {
      sys.totalPhysique = cumulatifs[vue].phy;
      sys.totalEsprit   = cumulatifs[vue].esp;
      sys.totalMental   = cumulatifs[vue].men;
    } else {
      sys.totalPhysique = runPhy;
      sys.totalEsprit   = runEsp;
      sys.totalMental   = runMen;
    }
  }
}
