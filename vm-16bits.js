(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
const createMemory = require('./create-memory');
const instructions = require('./instructions');

class CPU {
  constructor(memory) {
    this.memory = memory;

    this.registerNames = [
      'ip', 'acc',
      'r1', 'r2', 'r3', 'r4',
      'r5', 'r6', 'r7', 'r8'
    ];

    this.registers = createMemory(this.registerNames.length * 2);

    this.registerMap = this.registerNames.reduce((map, name, i) => {
      map[name] = i * 2;
      return map;
    }, {});
  }

  debug() {
    this.registerNames.forEach(name => {
      console.log(`${name}: 0x${this.getRegister(name).toString(16).padStart(4, '0')}`);
    });
    console.log();
  }

  viewMemoryAt(address) {
    // 0x0f01: 0x04 0x05 0xA3 0xFE 0x13 0x0D 0x44 0x0F
    const nextEightBytes = Array.from({length: 8}, (_, i) =>
      this.memory.getUint8(address + i)
    ).map(v => `0x${v.toString(16).padStart(2, '0')}`);

    console.log(`0x${address.toString(16).padStart(4, '0')}: ${nextEightBytes.join(' ')}`);
  }

  getRegister(name) {
    if (!(name in this.registerMap)) {
      throw new Error(`getRegister: No such register '${name}'`);
    }
    return this.registers.getUint16(this.registerMap[name]);
  }

  setRegister(name, value) {
    if (!(name in this.registerMap)) {
      throw new Error(`setRegister: No such register '${name}'`);
    }
    return this.registers.setUint16(this.registerMap[name], value);
  }

  fetch() {
    const nextInstructionAddress = this.getRegister('ip');
    const instruction = this.memory.getUint8(nextInstructionAddress);
    this.setRegister('ip', nextInstructionAddress + 1);
    return instruction;
  }

  fetch16() {
    const nextInstructionAddress = this.getRegister('ip');
    const instruction = this.memory.getUint16(nextInstructionAddress);
    this.setRegister('ip', nextInstructionAddress + 2);
    return instruction;
  }

  execute(instruction) {
    switch (instruction) {
      // Move literal into register
      case instructions.MOV_LIT_REG: {
        const literal = this.fetch16();
        const register = (this.fetch() % this.registerNames.length) * 2;
        this.registers.setUint16(register, literal);
        return;
      }

      // Move register to register
      case instructions.MOV_REG_REG: {
        const registerFrom = (this.fetch() % this.registerNames.length) * 2;
        const registerTo = (this.fetch() % this.registerNames.length) * 2;
        const value = this.registers.getUint16(registerFrom);
        this.registers.setUint16(registerTo, value);
        return;
      }

      // Move register to memory
      case instructions.MOV_REG_MEM: {
        const registerFrom = (this.fetch() % this.registerNames.length) * 2;
        const address = this.fetch16();
        const value = this.registers.getUint16(registerFrom);
        this.memory.setUint16(address, value);
        return;
      }

      // Move memory to register
      case instructions.MOV_MEM_REG: {
        const address = this.fetch16();
        const registerTo = (this.fetch() % this.registerNames.length) * 2;
        const value = this.memory.getUint16(address);
        this.registers.setUint16(registerTo, value);
        return;
      }

      // Add register to register
      case instructions.ADD_REG_REG: {
        const r1 = this.fetch();
        const r2 = this.fetch();
        const registerValue1 = this.registers.getUint16(r1 * 2);
        const registerValue2 = this.registers.getUint16(r2 * 2);
        this.setRegister('acc', registerValue1 + registerValue2);
        return;
      }

      // Jump if not equal
      case instructions.JMP_NOT_EQ: {
        const value = this.fetch16();
        const address = this.fetch16();

        if (value !== this.getRegister('acc')) {
          this.setRegister('ip', address);
        }

        return;
      }
    }
  }

  step() {
    const instruction = this.fetch();
    return this.execute(instruction);
  }
}

module.exports = CPU;

},{"./create-memory":4,"./instructions":6}],4:[function(require,module,exports){
const createMemory = sizeInBytes => {
  const ab = new ArrayBuffer(sizeInBytes);
  const dv = new DataView(ab);
  return dv;
};

module.exports = createMemory;

},{}],5:[function(require,module,exports){
(function (process){(function (){
const createMemory = require('./create-memory')
const CPU = require('./cpu')
const instructions = require('./instructions')
let readline = require('readline')

if (readline.createInterface == undefined){
  // https://stackoverflow.com/questions/71814859/typeerror-readline-createinterface-is-not-a-function
  readline = readline.default
}


const IP = 0, ACC = 1, R1 = 2, R2 = 3

const memory = createMemory(256*256)
const writableBytes = new Uint8Array(memory.buffer)


const cpu = new CPU(memory)

let i = 0

writableBytes[i++] = instructions.MOV_MEM_REG
writableBytes[i++] = 0x01;
writableBytes[i++] = 0x00;
writableBytes[i++] = R1;

writableBytes[i++] = instructions.MOV_LIT_REG
writableBytes[i++] = 0x00;
writableBytes[i++] = 0x01;
writableBytes[i++] = R2;

writableBytes[i++] = instructions.ADD_REG_REG
writableBytes[i++] = R1;
writableBytes[i++] = R2;

writableBytes[i++] = instructions.MOV_REG_MEM
writableBytes[i++] = ACC
writableBytes[i++] = 0x01
writableBytes[i++] = 0x00

writableBytes[i++] = instructions.JMP_NOT_EQ
writableBytes[i++] = 0x00
writableBytes[i++] = 0x03
writableBytes[i++] = 0x00
writableBytes[i++] = 0x00


cpu.debug()
cpu.viewMemoryAt(cpu.getRegister('ip'))
cpu.viewMemoryAt(0x0100)


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.on('line', () => {
  cpu.step()
  cpu.debug()
  cpu.viewMemoryAt(cpu.getRegister('ip'))
  cpu.viewMemoryAt(0x0100)
})

}).call(this)}).call(this,require('_process'))
},{"./cpu":3,"./create-memory":4,"./instructions":6,"_process":2,"readline":1}],6:[function(require,module,exports){
const MOV_LIT_REG  = 0x10;
const MOV_REG_REG  = 0x11;
const MOV_REG_MEM  = 0x12;
const MOV_MEM_REG  = 0x13;
const ADD_REG_REG  = 0x14;
const JMP_NOT_EQ   = 0x15;

module.exports = {
  MOV_LIT_REG,
  MOV_REG_REG,
  MOV_REG_MEM,
  MOV_MEM_REG,
  ADD_REG_REG,
  JMP_NOT_EQ,
};

},{}]},{},[5]);
