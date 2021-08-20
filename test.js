// const fs = require('fs');

// const content = fs.readFileSync('./tokens.txt', { encoding: 'utf8' }).split("\n");

// content.forEach((line) => {
//     const token = line.split(":")[3];
//     if(typeof token === "string") {
//         fs.writeFileSync('test.txt', fs.readFileSync('./test.txt', { encoding: 'utf8'})+(token + "\n"), { encoding: 'utf8' });
//     }
// });


const exec = require('child_process').exec;

for(let i = 0; i < 5; i++) {
    exec('start start.bat')
}