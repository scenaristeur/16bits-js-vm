const createMemory = require('./create-memory')
const CPU = require('./cpu')
const instructions = require('./instructions')


const IP = 0, ACC = 1, R1 = 2, R2 = 3

const memory = createMemory(256*256)
const writableBytes = new Uint8Array(memory.buffer)


const cpu = new CPU(memory)

let i = 0

writableBytes[i++] = instructions.MOV_LIT_REG
writableBytes[i++] = 0x12; // 0x1234
writableBytes[i++] = 0x34;
writableBytes[i++] = R1;

writableBytes[i++] = instructions.MOV_LIT_REG
writableBytes[i++] = 0xAB; // 0xABCD
writableBytes[i++] = 0xCD;
writableBytes[i++] = R2;

writableBytes[i++] = instructions.ADD_REG_REG
writableBytes[i++] = R1;
writableBytes[i++] = R2;

writableBytes[i++] = instructions.MOV_REG_MEM
writableBytes[i++] = ACC
writableBytes[i++] = 0x01
writableBytes[i++] = 0x00 // 0x0100


cpu.debug()
cpu.viewMemoryAt(cpu.getRegister('ip'))
cpu.viewMemoryAt(0x0100)

cpu.step()
cpu.debug()
cpu.viewMemoryAt(cpu.getRegister('ip'))
cpu.viewMemoryAt(0x0100)

cpu.step()
cpu.debug()
cpu.viewMemoryAt(cpu.getRegister('ip'))
cpu.viewMemoryAt(0x0100)

cpu.step()
cpu.debug()
cpu.viewMemoryAt(cpu.getRegister('ip'))
cpu.viewMemoryAt(0x0100)

cpu.step()
cpu.debug()
cpu.viewMemoryAt(cpu.getRegister('ip'))
cpu.viewMemoryAt(0x0100)
