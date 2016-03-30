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
const fs = require('fs');


const SYNTAX_PATTERN = /<!--#([^\r\n]+?)-->/mg;

const SYNTAX_TYPES = {
    STRING: 'STRING',
    COMMAND: 'COMMAND'
};

const TYPES = {
    /** Whitespace */
    WHITESPACE: 0,
    /** Plain string */
    STRING: 1,
    /** Variable */
    VAR: 9,
    /** Number */
    NUMBER: 10,
    /** SSI-valid comparator */
    COMPARATOR: 20,
    /** Variable assignment */
    ASSIGNMENT: 24,
    /** Unknown type */
    UNKNOWN: 100
};

const RULES = [{
    type: TYPES.WHITESPACE,
    regex: [
        /^\s+/
    ]
}, {
    type: TYPES.STRING,
    regex: [
        /^""/,
        /^".*?[^\\]"/,
        /^''/,
        /^'.*?[^\\]'/
    ]
}, {
    type: TYPES.VAR,
    regex: [
        /^[a-zA-Z_$]\w*((\.\$?\w*)+)?/,
        /^[a-zA-Z_$]\w*/
    ]
}, {
    type: TYPES.ASSIGNMENT,
    regex: [
        /^(=)/
    ]
}, {
    type: TYPES.NUMBER,
    regex: [
        /^[+\-]?\d+(\.\d+)?/
    ]
}];

function reader(str) {
    var matched;

    RULES.some(rule => {
        return rule.regex.some(regex => {
            var match = str.match(regex),
                normalized;

            if (!match) {
                return;
            }

            normalized = match[rule.idx || 0].replace(/\s*$/, '');
            normalized = (rule.hasOwnProperty('replace') && rule.replace.hasOwnProperty(normalized)) ?
                rule.replace[normalized] : normalized;

            matched = {
                match: normalized,
                type: rule.type,
                length: match[0].length
            };
            return true;
        });
    });

    if (!matched) {
        matched = {
            match: str,
            type: TYPES.UNKNOWN,
            length: str.length
        };
    }

    return matched;
}

/**
 * Read a string and break it into separate token types.
 * 
 * @param  {string} str
 * @return {Array}     Array of defined types, potentially stripped or replaced with more suitable content.
 * @private
 */
const parseLine = str => {
    var offset = 0,
        tokens = [],
        substr,
        match;
    while (offset < str.length) {
        substr = str.substring(offset);
        match = reader(substr);
        offset += match.length;
        tokens.push(match);
    }
    return tokens;
};


/**
 * Parse a string content.
 * 
 * @param  {string} content
 * @return {Promise}
 */
const parseContent = content => {
    return new Promise(resolve => {
        let matches;
        let startOffset = 0;
        const syntaxQ = [];
        // const ifStack = [];

        while (!!(matches = SYNTAX_PATTERN.exec(content))) {
            syntaxQ.push({
                type: SYNTAX_TYPES.STRING,
                payload: content.slice(startOffset, matches.index)
            });

            const cmd = {
                parameters: {},
                command: null
            };

            const lineTokens = parseLine(matches[1].trim()).filter(token => (token.type !== TYPES.WHITESPACE));

            let tmpKey;
            let prevToken;
            let prevTokenType;

            for (let i = 0; i < lineTokens.length; ++i) {
                let type = lineTokens[i].type;

                switch (type) {
                case TYPES.VAR:
                    if (!prevToken) {
                        cmd.command = lineTokens[i].match;
                    } else {
                        tmpKey = lineTokens[i].match;
                    }
                    break;
                case TYPES.STRING:
                    if (!prevToken && (prevTokenType !== TYPES.ASSIGNMENT)) {
                        throw new Error('Wrong string');
                    }
                    cmd.parameters[tmpKey] = lineTokens[i].match;
                    tmpKey = null;
                    break;
                case TYPES.ASSIGNMENT:
                    if (!prevToken && (prevTokenType !== TYPES.VAR)) {
                        throw new Error('Wrong =');
                    }

                    break
                case TYPES.WHITESPACE:
                    break;
                default:
                    throw new Error('Illegal token:' + type);
                }
                prevToken = lineTokens[i];
                prevTokenType = prevToken.type;
            }
            if (prevToken) {

                if (TYPES.STRING !== prevTokenType && !!tmpKey) {
                    throw new Error('Uncomplete:' + prevToken.match + ':' + prevTokenType);
                }

                syntaxQ.push({
                    type: SYNTAX_TYPES.COMMAND,
                    payload: cmd
                });
            }

            startOffset = matches[0].length + matches.index;
        }
        resolve(syntaxQ);
    });
};
/**
 * Parse a file on disk.
 * 
 * @param  {string} filePath
 * @param  {Object} options
 * @return {Promise}
 */
const parseFile = (filePath, options = {
    encoding: 'utf-8'
}) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, Object.assign({}, options), (err, content) => {
            err ? reject(err) : resolve(content);
        });
    }).then(parseContent);
};


export class SSI {
    constructor(options) {
        Object.assign({
            baseDir: '.',
            encoding: 'utf-8',
            payload: {}
        }, options);
    }
    compileFile(...args) {
        return parseFile(...args);
    }
}

const ssi = new SSI();
const filepath = require('path').join(__dirname, '..', 'test/mock/index.html');
ssi.compileFile(filepath).then(stack => {
    console.log(JSON.stringify(stack, null, 2));
}).catch(e => {
    console.error(e);
});