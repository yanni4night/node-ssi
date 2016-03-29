/**
  * Copyright (C) 2016 yanni4night.com
  * ssi.js
  *
  * changelog
  * 2016-03-29[23:49:20]:revised
  *
  * @author yanni4night@gmail.com
  * @version 0.1.0
  * @since 0.1.0
  */

export class SSI {
    static pattern = /<!--#([^\r\n]+?)-->/mg
    static syntaxTypes = {
        STRING: 'STRING',
        COMMAND: 'COMMAND'
    }
    options = {
        baseDir: '.',
        encoding: 'utf-8',
        payload: {}
    }
    constructor(options) {
        Object.assign(this.options, options);
    }
    resolveIncludes(content, options, callback) {
        let matches;
        let startOffset = 0;
        const syntaxStack = [];

        while(!!(matches = SSI.pattern.exec(content))) {
            syntaxStack.push({
                type: SSI.syntaxTypes.STRING,
                payload: content.slice(startOffset, matches.index)
            }, {
                type: SSI.syntaxTypes.COMMAND,
                payload: matches[1].trim()
            });
            startOffset = matches[0].length + matches.index;
        }
        console.log(syntaxStack);
    }
    compile() {}
    compileFile() {}
}

const ssi = new SSI();
const filepath = require('path').join(__dirname, '..', 'test/mock/index.html');
ssi.resolveIncludes(require('fs').readFileSync(filepath,'utf8'));