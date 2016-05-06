/**
 * Copyright (C) 2016 tieba.baidu.com
 * parser.js
 *
 * changelog
 * 2016-04-17[11:36:17]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
import * as lexer from './lexer';
import * as utils from './utils';

const _t = lexer.TYPES;
// const _reserved = 'include,block,endblock,echo,if,endif,set,file,virtual'.split(',');

/*!
 * Makes a string safe for a regular expression.
 * @param  {string} str
 * @return {string}
 * @private
 */
function escapeRegExp(str) {
    return str.replace(/[\-\/\\\^$*+?.()|\[\]{}]/g, '\\$&');
}

class TokenParser {

    constructor(tokens, line, filename) {
        this.out = [];
        this.state = [];
        this._parsers = {};
        this.line = line;
        this.filename = filename;
        this.tokens = tokens;
        this.paramMap = {};
        this.lastVar = null;
    }

    parse() {
        if (this._parsers.start) {
            this._parsers.start.call(this);
        }
        utils.each(this.tokens, (token, i) => {
            var prevToken = this.tokens[i - 1];
            this.isLast = (i === this.tokens.length - 1);
            if (prevToken) {
                while (prevToken.type === _t.WHITESPACE) {
                    i -= 1;
                    prevToken = this.tokens[i - 1];
                }
            }
            this.prevToken = prevToken;
            this.parseToken(token);
        });
        if (this._parsers.end) {
            this._parsers.end.call(this);
        }

        return this.out;
    }

    on(type, fn) {
        this._parsers[type] = fn;
    }

    parseToken(token) {
        var match = token.match,
            prevToken = this.prevToken,
            prevTokenType = prevToken ? prevToken.type : null;

        /*if (fn && typeof fn === 'function') {
            if (!fn.call(this, token)) {
                return;
            }
        }*/
        //console.log(token, match);
        switch (token.type) {
        case _t.WHITESPACE:
            break;
        case _t.STRING:
            if (prevTokenType !== _t.ASSIGNMENT) {
                utils.throwError('Invalid string "' + match + '"', this.line, this.filename);
            }
            this.paramMap[this.lastVar] = match.match(/^(['"])(.*)\1$/)[2];
            this.lastVar = null;
            //this.out.push(match.replace(/\\/g, '\\\\'));
            break;

        case _t.ASSIGNMENT:
            if (prevTokenType !== _t.VAR) {
                utils.throwError('Invalid assignment "' + match + '"', this.line, this.filename);
            }
            break;
        case _t.VAR:
            if (prevTokenType !== _t.WHITESPACE && prevTokenType !== _t.STRING && prevTokenType !== null) {
                utils.throwError('Invalid var "' + match + '"', this.line, this.filename);
            }
            this.lastVar = match;
            break;
        }
        return this.paramMap;
    }
};


export const parse = (ssi, source, opts, tags) => {
    source = source.replace(/\r\n/g, '\n');
    var tagOpen = opts.tagControls[0],
        tagClose = opts.tagControls[1],
        escapedTagOpen = escapeRegExp(tagOpen),
        escapedTagClose = escapeRegExp(tagClose),
        anyChar = '[\\s\\S]*?',
        tagStrip = new RegExp('^' + escapedTagOpen + '-?\\s*-?|-?\\s*-?' + escapedTagClose + '$', 'g'), // todo -
        // Split the template source based on variable, tag, and comment blocks
        // /(\{%[\s\S]*?%\}|\{\{[\s\S]*?\}\}|\{#[\s\S]*?#\})/
        splitter = new RegExp('(' + escapedTagOpen + anyChar + escapedTagClose + ')'),
        line = 1,
        stack = [],
        tokens = [],
        blocks = {};

    const parseTag = (str, line) => {
        var tokens, parser, chunks, tagName, tag, args, last;

        if (utils.startsWith(str, 'end')) {
            last = stack[stack.length - 1];
            if (last && last.name === str.split(/\s+/)[0].replace(/^end/, '') && last.ends) {
                stack.pop();
                return;
            }
        }

        chunks = str.split(/\s+(.+)?/);
        tagName = chunks.shift();

        if (!tags.hasOwnProperty(tagName)) {
            utils.throwError('Unexpected tag "' + str + '"', line, opts.filePath);
        }

        tokens = lexer.read(utils.strip(chunks.join(' ')));

        parser = new TokenParser(tokens, line, opts.filePath);
        tag = tags[tagName];

        // Register token parsers
        /*if (!tag.parse(chunks[1], line, parser, _t, stack, opts, ssi)) {
            utils.throwError('Unexpected tag "' + tagName + '"', line, opts.filePath);
        }*/

        parser.parse();
        args = parser.out;

        return {
            compile: tag.compile,
            params: parser.paramMap,
            args: args,
            content: [],
            ends: tag.ends,
            name: tagName
        };
    };

    utils.each(source.split(splitter), function (chunk) {
        var token, lines;

        if (!chunk) {
            return;
        }

        if (utils.startsWith(chunk, tagOpen) && utils.endsWith(chunk, tagClose)) {
            token = parseTag(chunk.replace(tagStrip, ''), line);
            if (token) {
                if (token.block && !stack.length) {
                    blocks[token.params.name] = token;
                }
            }
            // Is a content string?
        } else {
            token = chunk;
        }

        // This was a comment, so let's just keep going.
        if (!token) {
            return;
        }

        // If there's an open item in the stack, add this to its content.
        if (stack.length) {
            stack[stack.length - 1].content.push(token);
        } else {
            tokens.push(token);
        }

        // If the token is a tag that requires an end tag, open it on the stack.
        if (token.name && token.ends) {
            stack.push(token);
        }

        lines = chunk.match(/\n/g);
        line += (lines) ? lines.length : 0;
    });

    return {
        name: opts.filePath,
        tokens: tokens,
        blocks: blocks
    };
};


export const compile = function (template) {
    var out = '',
        tokens = utils.isArray(template) ? template : template.tokens;

    utils.each(tokens, function (token) {
        var o;
        if (typeof token === 'string') {
            out += '_output += "' + token.replace(/\\/g, '\\\\').replace(/\n|\r/g, '\\n').replace(/"/g,
                '\\"') + '";\n';
            return;
        }

        o = token.compile(token.params, token.content);
        out += o || '';
    });

    return out;
};