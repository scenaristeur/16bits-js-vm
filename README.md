# 16-Bit Virtual Machine in Javascript 001



- based on https://www.youtube.com/watch?v=fTBwD3sb5mw&list=PLP29wDx6QmW5DdwpdwHCRJsEubS5NrQ9b
- code episodes : https://github.com/lowbyteproductions/16-Bit-Virtual-Machine
- assembler https://github.com/francisrstokes/16bitjs


# browserified
- ```
npm install -g browserify

browserify index.js > vm-16bits.js
```

then store vm-16bits.js on ipfs
and load it with scenaristeur/browser-vue


issue :
readline.createinterface is not a function
