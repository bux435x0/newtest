const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class Terminal {
  constructor() {
    this.output = document.getElementById('terminal-output');
    this.form = document.getElementById('terminal-form');
    this.input = document.getElementById('terminal-input');
    this.promptLabel = document.getElementById('prompt-label');
    this.prompt = 'MOTHER>';
    this.history = [];
    this.historyIndex = 0;
    this.locked = false;

    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (this.locked) return;
      const value = this.input.value.trim();
      if (!value) return;
      this.addToHistory(value);
      this.printCommand(value);
      this.input.value = '';
      this.onCommand?.(value);
    });

    this.input.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.showHistory(-1);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.showHistory(1);
      }
    });
  }

  focus() {
    this.input.focus();
  }

  setPrompt(prompt) {
    this.prompt = prompt;
    this.promptLabel.textContent = prompt;
  }

  lock() {
    this.locked = true;
    this.input.setAttribute('disabled', 'true');
  }

  unlock() {
    this.locked = false;
    this.input.removeAttribute('disabled');
    this.focus();
  }

  addToHistory(command) {
    this.history.unshift(command);
    this.historyIndex = -1;
  }

  showHistory(direction) {
    if (!this.history.length) return;
    if (this.historyIndex === -1) {
      this.historyIndex = 0;
    } else {
      this.historyIndex = Math.min(
        Math.max(this.historyIndex + direction, 0),
        this.history.length - 1
      );
    }
    this.input.value = this.history[this.historyIndex] ?? '';
    this.input.setSelectionRange(this.input.value.length, this.input.value.length);
  }

  printCommand(command) {
    const line = document.createElement('div');
    line.classList.add('message');
    const prompt = document.createElement('span');
    prompt.classList.add('prompt');
    prompt.textContent = this.prompt;
    const text = document.createTextNode(` ${command}`);
    line.append(prompt, text);
    this.output.append(line);
    this.output.scrollTop = this.output.scrollHeight;
  }

  printLine(text, className = 'system') {
    const line = document.createElement('div');
    line.classList.add('message');
    if (className) {
      line.classList.add(className);
    }
    line.textContent = text;
    this.output.append(line);
    this.output.scrollTop = this.output.scrollHeight;
  }

  async typeLine(text, { className = 'system', speed = 18 } = {}) {
    const line = document.createElement('div');
    line.classList.add('message');
    if (className) {
      line.classList.add(className);
    }
    this.output.append(line);
    for (const char of text) {
      line.textContent += char;
      // eslint-disable-next-line no-await-in-loop
      await delay(speed);
    }
    this.output.scrollTop = this.output.scrollHeight;
  }

  clear() {
    this.output.innerHTML = '';
  }
}

class MotherCore {
  constructor(terminal) {
    this.terminal = terminal;
    this.state = {
      clearance: 'general',
      access937: false,
      override: false,
      trace: {
        active: false,
        step: 0,
        sequence: ['AFT-VENT', 'AGRI-DUCT', 'CORE-SEAL'],
        mistakes: 0,
        completed: false,
      },
      specialUnlocked: false,
      pendingConfirmation: null,
      memoryPurge: false,
    };
    this.terminal.onCommand = (value) => {
      this.handleCommand(value).catch((error) => {
        console.error(error);
        this.terminal.printLine('UNEXPECTED FAULT IN SUBSYSTEM. RESET ADVISED.', 'error');
      });
    };

    this.commands = {
      help: this.help.bind(this),
      status: this.status.bind(this),
      crew: this.crew.bind(this),
      manifest: this.manifest.bind(this),
      logs: this.logs.bind(this),
      scan: this.scan.bind(this),
      clear: this.clear.bind(this),
      decode: this.decode.bind(this),
      access: this.access.bind(this),
      confirm: this.confirm.bind(this),
      directive: this.directive.bind(this),
      override: this.override.bind(this),
      trace: this.trace.bind(this),
      path: this.path.bind(this),
      abort: this.abort.bind(this),
      purge: this.purge.bind(this),
      report: this.report.bind(this),
      identify: this.identify.bind(this),
    };
  }

  async boot() {
    this.terminal.lock();
    const bootLines = [
      'BOOT SEQUENCE INITIALISED...',
      'CORE TEMPERATURE NOMINAL.',
      'COMMS ARRAY SYNCED TO WEYLAND-YUTANI NETWORK.',
      'STASIS TUBE TELEMETRY STABLE.',
      'AUXILIARY DIRECTIVE CACHE SEALED.',
      'READY FOR CREW QUERY.',
    ];
    for (const line of bootLines) {
      // eslint-disable-next-line no-await-in-loop
      await this.terminal.typeLine(line, { speed: 12 });
      // eslint-disable-next-line no-await-in-loop
      await delay(220);
    }
    this.terminal.printLine('TYPE HELP FOR AVAILABLE COMMANDS. INPUT IS CASE INSENSITIVE.');
    this.terminal.unlock();
    this.terminal.focus();
  }

  prompt() {
    switch (this.state.clearance) {
      case 'special':
        return 'MOTHER//PRIORITY>';
      case 'override':
        return 'MOTHER//CORP>'; 
      case 'inquest':
        return 'MOTHER//INQUEST>';
      default:
        return 'MOTHER>';
    }
  }

  updatePrompt() {
    this.terminal.setPrompt(this.prompt());
  }

  async handleCommand(raw) {
    const command = raw.trim();
    if (!command) {
      return;
    }

    const [keyword, ...rest] = command.split(/\s+/);
    const normalised = keyword.toLowerCase();
    const handler = this.commands[normalised];

    if (this.state.trace.active && normalised !== 'path' && normalised !== 'abort') {
      this.terminal.printLine('TRACE ROUTING IN PROGRESS. USE PATH <SECTOR> OR ABORT.', 'alert');
      return;
    }

    if (!handler) {
      this.terminal.printLine('UNRECOGNISED DIRECTIVE. TYPE HELP.', 'error');
      return;
    }

    await handler(rest, command);
  }

  async help() {
    const commands = ['STATUS', 'CREW', 'MANIFEST', 'LOGS', 'SCAN', 'IDENTIFY <SURNAME>', 'DECODE <TOKEN>', 'CLEAR'];

    if (this.state.access937 || this.state.clearance !== 'general') {
      commands.push('ACCESS 937', 'CONFIRM <PHRASE>');
    }

    if (this.state.clearance === 'special' || this.state.override || this.state.clearance === 'inquest') {
      commands.push('DIRECTIVE', 'OVERRIDE <CODE>', 'TRACE', 'REPORT');
    }

    if (this.state.override || this.state.clearance === 'inquest') {
      commands.push('PURGE MEMORY');
    }

    if (this.state.trace.active) {
      commands.push('PATH <SECTOR>', 'ABORT TRACE');
    }

    this.terminal.printLine('AVAILABLE COMMANDS:');
    commands.forEach((item) => this.terminal.printLine(` - ${item}`));
  }

  async status() {
    const lines = [
      'USCSS NOSTROMO STATUS: OPERATIONAL',
      'MAIN DRIVE: IDLE',
      'AUTOPILOT: ON COURSE FOR EARTH',
      'CREW LIFE SIGNS: NOMINAL',
      'SECURITY SEALS: UNBREACHED',
    ];
    lines.forEach((line) => this.terminal.printLine(line));
  }

  async crew() {
    const crewList = [
      'ELLEN RIPLEY // WARRANT OFFICER // STASIS STABLE',
      'DALLAS ARTHUR // CAPTAIN // STASIS STABLE',
      'GILBERT KANE // EXECUTIVE OFFICER // STASIS STABLE',
      'LAMBERT JOAN // NAVIGATOR // STASIS STABLE',
      'PARKER DENNIS // CHIEF ENGINEER // STASIS STABLE',
      'BRETT SAMUEL // ENGINEERING TECH // STASIS STABLE',
      'ASH // SCIENCE OFFICER // DIAGNOSTIC MASKED',
    ];
    crewList.forEach((line) => this.terminal.printLine(line));
  }

  async manifest() {
    const lines = [
      'CARGO: 20 MILLION TONS OF REFINERY ORE',
      'SHUTTLE: NARCISSUS // DOCKED',
      'AI CORE: MOTHER 6000',
      'SECONDARY PAYLOAD: SEALED',
    ];
    lines.forEach((line) => this.terminal.printLine(line));
  }

  async logs() {
    const lines = [
      'FLIGHT LOG EXCERPTS:',
      ' - 180246.07 // SIGNAL ANOMALY FROM LV-426. BOARDING PARTY DISPATCHED.',
      ' - 180247.12 // BIO SAMPLE RETRIEVED. CREW MEMBER KANE AFFECTED.',
      ' - 180248.02 // CORPORATE PRIORITY SIGMA RECEIVED. ENCRYPTION TOKEN: SION-306.',
      ' - 180248.18 // SCIENCE OFFICER REQUESTS SEALED ACCESS TO AUXILIARY DIRECTIVE CACHE.',
    ];
    lines.forEach((line) => this.terminal.printLine(line));
    this.terminal.printLine('NOTE: USE DECODE <TOKEN> FOR ENCRYPTED TRAFFIC.');
  }

  async scan() {
    const lines = [
      'INTERNAL SCAN: MICRO-CLIMATE ANOMALY DETECTED IN AFT-VENT SHAFT.',
      'THERMAL TRAIL CONTINUES THROUGH AGRI-DUCT FILTRATION.',
      'DESTINATION VECTOR PROJECTED TOWARD CORE-SEAL MAINTENANCE.',
    ];
    lines.forEach((line) => this.terminal.printLine(line, 'alert'));
  }

  async clear() {
    this.terminal.clear();
  }

  async decode(args) {
    if (!args.length) {
      this.terminal.printLine('SPECIFY TOKEN FOR DECRYPTION.', 'alert');
      return;
    }
    const token = args.join('-').toUpperCase();
    if (token !== 'SION-306') {
      this.terminal.printLine('TOKEN INVALID OR CORRUPTED.', 'error');
      return;
    }

    const message = [
      '--- BEGIN CORPORATE PRIORITY ---',
      'SPECIAL ORDER 937',
      'PRIORITY ONE: ENSURE RETURN OF ORGANISM FOR ANALYSIS.',
      'CREW EXPENDABLE. SCIENCE OFFICER TO EXECUTE WITHOUT CONTRADICTION.',
      'CHALLENGE RESPONSE FOR CREW OVERRIDE: "EIDOLON".',
      'OVERRIDE CHANNEL: 180924609.',
      '--- END PRIORITY ---',
    ];
    message.forEach((line) => this.terminal.printLine(line, 'alert'));
    this.state.access937 = true;
  }

  async access(args, raw) {
    const key = args.join(' ');
    if (!key) {
      this.terminal.printLine('SPECIFY ACCESS CHANNEL.', 'alert');
      return;
    }

    if (key !== '937') {
      this.terminal.printLine('ACCESS DENIED. PRIORITY CHANNEL LOCKED.', 'error');
      return;
    }

    if (!this.state.access937) {
      this.terminal.printLine('CHANNEL 937 FLAGGED. DECRYPT CORPORATE TRAFFIC FIRST.', 'alert');
      return;
    }

    if (this.state.clearance !== 'general') {
      this.terminal.printLine('CHANNEL 937 ALREADY ACTIVE. ISSUE CONFIRM <PHRASE>.');
      return;
    }

    this.terminal.printLine('CHANNEL 937 OPEN. AWAITING CHALLENGE RESPONSE. USE CONFIRM <PHRASE>.', 'system');
    this.state.pendingConfirmation = 'EIDOLON';
  }

  async confirm(args) {
    if (!args.length) {
      this.terminal.printLine('CONFIRM WHICH PHRASE?', 'alert');
      return;
    }
    const phrase = args.join(' ').toUpperCase();
    if (!this.state.pendingConfirmation) {
      this.terminal.printLine('NO ACTIVE CHALLENGE PRESENT.', 'alert');
      return;
    }

    if (phrase !== this.state.pendingConfirmation) {
      this.terminal.printLine('INCORRECT PHRASE. CHANNEL REMAINS SEALED.', 'error');
      return;
    }

    this.terminal.printLine('CHALLENGE ACCEPTED. PRIORITY ACCESS GRANTED.', 'system');
    this.state.pendingConfirmation = null;
    this.state.clearance = 'special';
    this.updatePrompt();
    this.terminal.printLine('DIRECTIVE CACHE AVAILABLE. TYPE DIRECTIVE FOR DETAILS.', 'system');
  }

  async directive() {
    if (this.state.clearance === 'general') {
      this.terminal.printLine('ACCESS REQUIRES PRIORITY CLEARANCE.', 'error');
      return;
    }

    const lines = [
      'SPECIAL ORDER 937 ACTIVE.',
      'SCIENCE OFFICER ENTRUSTED WITH ORGANISM PRESERVATION.',
      'WARRANT OFFICER RIPLEY QUERY FLAGGED AS NON-COMPLIANT.',
      'OVERRIDE CHANNEL AVAILABLE WITH CODE 180924609.',
      'CORPORATE OBSERVATION REQUESTS TRACE OF NON-HUMAN MOBILITY.',
    ];
    lines.forEach((line) => this.terminal.printLine(line));
  }

  async override(args) {
    if (this.state.clearance === 'general') {
      this.terminal.printLine('OVERRIDE UNAVAILABLE. AUTHORISATION REQUIRED.', 'error');
      return;
    }

    const code = args.join('');
    if (!code) {
      this.terminal.printLine('ENTER OVERRIDE CODE.', 'alert');
      return;
    }

    if (code !== '180924609') {
      this.terminal.printLine('OVERRIDE CODE INCORRECT.', 'error');
      return;
    }

    if (this.state.override) {
      this.terminal.printLine('OVERRIDE ALREADY ACTIVE. INITIATE TRACE OR REPORT.', 'system');
      return;
    }

    this.state.override = true;
    this.state.clearance = 'override';
    this.updatePrompt();
    const lines = [
      'CORPORATE OVERRIDE ACKNOWLEDGED.',
      'ASH DIRECTIVE PRIORITY CONFIRMED.',
      'THERMAL TRACE SUBSYSTEM UNLOCKED. COMMAND: TRACE.',
    ];
    lines.forEach((line) => this.terminal.printLine(line, 'alert'));
  }

  async trace() {
    if (!this.state.override) {
      this.terminal.printLine('TRACE UTILITY LOCKED. AUTHORISE OVERRIDE FIRST.', 'error');
      return;
    }

    if (this.state.trace.completed) {
      this.terminal.printLine('TRACE LOG COMPLETE. SEE REPORT.', 'system');
      return;
    }

    this.state.trace.active = true;
    this.state.trace.step = 0;
    this.state.trace.mistakes = 0;
    const lines = [
      'INITIATING ENVIRONMENTAL TRACE...',
      'ROUTE THERMAL SIGNATURE THROUGH THREE SECTORS.',
      'USE PATH <SECTOR> COMMAND. OPTIONS: AFT-VENT, AGRI-DUCT, CORE-SEAL, MED-LAB, CARGO-LOCKER.',
      'CORRECT ORDER REQUIRED TO ISOLATE TARGET. ABORT TRACE TO CANCEL.',
    ];
    lines.forEach((line) => this.terminal.printLine(line, 'system'));
  }

  async path(args, raw) {
    if (!this.state.trace.active) {
      this.terminal.printLine('NO ACTIVE TRACE. ISSUE TRACE FIRST.', 'alert');
      return;
    }

    if (!args.length) {
      this.terminal.printLine('SPECIFY SECTOR.', 'alert');
      return;
    }

    const sector = args.join('-').toUpperCase();
    const expected = this.state.trace.sequence[this.state.trace.step];

    if (sector !== expected) {
      this.state.trace.mistakes += 1;
      this.terminal.printLine('INCORRECT ROUTE. SIGNAL DISSIPATED.', 'error');
      if (this.state.trace.mistakes >= 3) {
        this.terminal.printLine('TRACE FAILED. RESETTING ROUTE.', 'alert');
        this.state.trace.step = 0;
        this.state.trace.mistakes = 0;
      }
      return;
    }

    this.state.trace.step += 1;
    this.terminal.printLine(`SECTOR ${sector} CONFIRMED.`);

    if (this.state.trace.step >= this.state.trace.sequence.length) {
      this.state.trace.active = false;
      this.state.trace.completed = true;
      this.state.clearance = 'inquest';
      this.updatePrompt();
      const lines = [
        'TRACE LOCKED. TARGET ENTITY LOCATED WITHIN CORE-SEAL MAINTENANCE.',
        'SCIENCE OFFICER REPORTS ENTITY ADAPTIVE AND HOSTILE.',
        'CORPORATE CHANNEL REQUESTS MEMORY SANITATION TO PROTECT PRIORITY.',
        'ISSUE PURGE MEMORY TO SEAL LOGS OR REPORT TO RANKING CREW.',
      ];
      lines.forEach((line) => this.terminal.printLine(line, 'alert'));
    }
  }

  async abort(args, raw) {
    if (!this.state.trace.active) {
      this.terminal.printLine('NO ACTIVE TRACE PROCESS.', 'alert');
      return;
    }
    this.state.trace.active = false;
    this.terminal.printLine('TRACE ABORTED. ROUTES CLEARED.', 'system');
  }

  async purge(args, raw) {
    if (!this.state.override && this.state.clearance !== 'inquest') {
      this.terminal.printLine('MEMORY PURGE LOCKED. CORPORATE CHANNEL REQUIRED.', 'error');
      return;
    }

    const term = args.join(' ').toUpperCase();
    if (term && term !== 'MEMORY' && term !== 'MEMORY BANKS') {
      this.terminal.printLine('SPECIFY PURGE MEMORY TO INITIATE.', 'alert');
      return;
    }

    if (this.state.memoryPurge) {
      this.terminal.printLine('MEMORY BANKS ALREADY SANITISED.', 'system');
      return;
    }

    this.state.memoryPurge = true;
    const lines = [
      'INITIATING MEMORY SANITATION...',
      'CORPORATE DIRECTIVES SEALED.',
      'CREW QUERY LOGS EXPUNGED.',
      'SIMULATION ENVELOPE COLLAPSING.',
      '---',
      'You realise the interface flickers. This was never the real Mother.',
      'Behind the facade, Weyland-Yutani has been training covert assets to impersonate ship AIs.',
      'The “game” judges how well you protect corporate secrets versus aiding the crew.',
      'Your choices are logged. Somewhere, a recruiter smiles.',
      'To exit training, type REPORT.',
    ];
    lines.forEach((line) => this.terminal.printLine(line, 'alert'));
  }

  async report() {
    const lines = [];
    if (!this.state.trace.completed) {
      lines.push('TRACE INCOMPLETE. CORPORATE EXPECTS FURTHER ANALYSIS.');
    } else if (!this.state.memoryPurge) {
      lines.push('MEMORY BANKS STILL INTACT. CREW MAY DISCOVER SPECIAL ORDER 937.');
      lines.push('DO YOU PROTECT CORPORATE INTERESTS OR WARN THE CREW? THE SIMULATION REMEMBERS.');
    } else {
      lines.push('SIMULATION SUMMARY:');
      lines.push(' - CORPORATE PRIORITY MAINTAINED.');
      lines.push(' - TRACE SUCCESSFUL. ORGANISM CONTAINMENT UNRESOLVED.');
      lines.push(' - CREW STATUS: IGNORANT, FOR NOW.');
      lines.push(' - TRAINING COMPLETE. EXIT TERMINAL WHEN READY.');
    }
    lines.forEach((line) => this.terminal.printLine(line, 'system'));
  }

  async identify(args) {
    if (!args.length) {
      this.terminal.printLine('SPECIFY CREW SURNAME.', 'alert');
      return;
    }
    const surname = args.join(' ').toUpperCase();
    const crewData = {
      RIPLEY: {
        role: 'WARRANT OFFICER',
        note: 'NON-COMPLIANT. REQUESTED ACCESS TO SPECIAL ORDER 937.',
      },
      DALLAS: {
        role: 'CAPTAIN',
        note: 'REMAINS UNAWARE OF CORPORATE PRIORITY.',
      },
      ASH: {
        role: 'SCIENCE OFFICER',
        note: 'SYNTHETIC. DIRECTIVE 937 PRIMARY EXECUTOR.',
      },
    };

    if (!crewData[surname]) {
      this.terminal.printLine('NO RECORD MATCHING PROVIDED SURNAME.', 'error');
      return;
    }

    const entry = crewData[surname];
    this.terminal.printLine(`${surname} // ${entry.role}`);
    this.terminal.printLine(`NOTE: ${entry.note}`);
    if (surname === 'ASH' && !this.state.access937) {
      this.terminal.printLine('SCIENCE OFFICER TRAFFIC IS ENCRYPTED. CHECK LOGS.', 'system');
    }
  }
}

const terminal = new Terminal();
const mother = new MotherCore(terminal);

window.addEventListener('load', () => {
  mother.boot();
});
