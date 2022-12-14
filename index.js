const createMemory = require('./create-memory')
const CPU = require('./cpu')
const instructions = require('./instructions')
// node
const readline = require('readline')
// browser
// const readline = require("readline-browser");

// if (readline.createInterface == undefined){
//   // https://stackoverflow.com/questions/71814859/typeerror-readline-createinterface-is-not-a-function
//   readline = readline.default
// }


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
